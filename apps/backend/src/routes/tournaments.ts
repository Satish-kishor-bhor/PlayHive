import { Router, Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import { prisma } from '../lib/prisma';
import { authenticate, requireRole } from '../middleware/auth';
import { generateSlug } from '../utils/helpers';
import { sendLobbyEmail, sendTournamentConfirmationEmail } from '../services/emailService';
import { io } from '../index';
import { logger } from '../utils/logger';

export const tournamentRouter = Router();

// ─── List Tournaments ─────────────────────────────────────────────────────────
tournamentRouter.get('/', async (req: Request, res: Response) => {
  const { status, format, search, page = '1', limit = '12' } = req.query;

  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

  const where: Record<string, unknown> = { isPublic: true };
  if (status) where.status = status;
  if (format) where.format = format;
  if (search) {
    where.name = { contains: search, mode: 'insensitive' };
  }

  try {
    const [tournaments, total] = await Promise.all([
      prisma.tournament.findMany({
        where,
        skip,
        take: parseInt(limit as string),
        orderBy: { createdAt: 'desc' },
        include: {
          organizer: { select: { username: true, displayName: true, avatarUrl: true } },
          _count: { select: { registrations: true } },
        },
      }),
      prisma.tournament.count({ where }),
    ]);

    return res.json({
      success: true,
      data: tournaments,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    logger.error('List tournaments error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ─── Get Single Tournament ────────────────────────────────────────────────────
tournamentRouter.get('/:slug', async (req: Request, res: Response) => {
  try {
    const tournament = await prisma.tournament.findUnique({
      where: { slug: req.params.slug },
      include: {
        organizer: { select: { username: true, displayName: true, avatarUrl: true } },
        registrations: {
          include: {
            team: {
              include: {
                members: {
                  include: { user: { select: { username: true, bgmiUsername: true, bgmiTier: true, avatarUrl: true } } }
                }
              }
            }
          }
        },
        matches: {
          include: { results: true },
          orderBy: { matchNumber: 'asc' },
        },
      },
    });

    if (!tournament) {
      return res.status(404).json({ success: false, message: 'Tournament not found' });
    }

    return res.json({ success: true, data: tournament });
  } catch (error) {
    logger.error('Get tournament error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ─── Create Tournament ────────────────────────────────────────────────────────
tournamentRouter.post(
  '/',
  authenticate,
  requireRole(['ORGANIZER', 'ADMIN']),
  [
    body('name').isLength({ min: 5, max: 100 }),
    body('format').isIn(['SOLO', 'DUO', 'SQUAD']),
    body('matchMode').isIn(['CLASSIC', 'TDM', 'ARCADE', 'WAR_MODE']),
    body('maxTeams').isInt({ min: 2, max: 100 }),
    body('entryFee').isFloat({ min: 0 }),
    body('prizePool').isFloat({ min: 0 }),
    body('registrationStart').isISO8601(),
    body('registrationEnd').isISO8601(),
    body('matchStartTime').isISO8601(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const slug = await generateSlug(req.body.name);
      const tournament = await prisma.tournament.create({
        data: {
          ...req.body,
          slug,
          organizerId: (req as Request & { user: { userId: string } }).user.userId,
          status: 'DRAFT',
        },
      });

      logger.info(`Tournament created: ${tournament.name} by ${(req as Request & { user: { userId: string } }).user.userId}`);
      return res.status(201).json({ success: true, data: tournament });
    } catch (error) {
      logger.error('Create tournament error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

// ─── Register for Tournament ──────────────────────────────────────────────────
tournamentRouter.post('/:id/register', authenticate, async (req: Request, res: Response) => {
  const { teamId } = req.body;
  const userId = (req as Request & { user: { userId: string } }).user.userId;

  try {
    const tournament = await prisma.tournament.findUnique({ where: { id: req.params.id } });
    if (!tournament) return res.status(404).json({ success: false, message: 'Tournament not found' });
    if (tournament.status !== 'REGISTRATION_OPEN') {
      return res.status(400).json({ success: false, message: 'Registration is not open' });
    }
    if (tournament.currentTeams >= tournament.maxTeams) {
      return res.status(400).json({ success: false, message: 'Tournament is full' });
    }

    // Check if already registered
    const existing = await prisma.tournamentRegistration.findFirst({
      where: { tournamentId: tournament.id, teamId },
    });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Team already registered' });
    }

    const registration = await prisma.tournamentRegistration.create({
      data: { tournamentId: tournament.id, teamId },
    });

    await prisma.tournament.update({
      where: { id: tournament.id },
      data: { currentTeams: { increment: 1 } },
    });

    // Send confirmation email
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      await sendTournamentConfirmationEmail(user.email, user.displayName, tournament.name, tournament.matchStartTime);
    }

    io.to(`tournament:${tournament.id}`).emit('registration:new', {
      teamId,
      currentTeams: tournament.currentTeams + 1,
    });

    return res.status(201).json({ success: true, data: registration });
  } catch (error) {
    logger.error('Tournament registration error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ─── Set Lobby ID (Organizer Only) ────────────────────────────────────────────
tournamentRouter.patch('/:id/lobby', authenticate, requireRole(['ORGANIZER', 'ADMIN']), async (req: Request, res: Response) => {
  const { lobbyId, lobbyPassword } = req.body;

  try {
    const tournament = await prisma.tournament.update({
      where: { id: req.params.id },
      data: { lobbyId, lobbyPassword, lobbySetAt: new Date() },
      include: {
        registrations: {
          include: { team: { include: { members: { include: { user: true } } } } }
        }
      }
    });

    // Send lobby email to all registered players
    const players: { email: string; displayName: string }[] = [];
    tournament.registrations.forEach(reg => {
      reg.team.members.forEach(member => {
        players.push({ email: member.user.email, displayName: member.user.displayName });
      });
    });

    // Queue emails (send to all players)
    for (const player of players) {
      await sendLobbyEmail(
        player.email,
        player.displayName,
        tournament.name,
        lobbyId,
        lobbyPassword,
        tournament.matchStartTime
      );
    }

    // Real-time notification
    io.to(`tournament:${tournament.id}`).emit('lobby:set', { lobbyId, lobbyPassword });

    logger.info(`Lobby set for tournament ${tournament.id}: Room ${lobbyId}`);
    return res.json({ success: true, message: `Lobby ID sent to ${players.length} players!`, data: tournament });
  } catch (error) {
    logger.error('Set lobby error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ─── Update Tournament Status ─────────────────────────────────────────────────
tournamentRouter.patch('/:id/status', authenticate, requireRole(['ORGANIZER', 'ADMIN']), async (req: Request, res: Response) => {
  const { status } = req.body;
  try {
    const tournament = await prisma.tournament.update({
      where: { id: req.params.id },
      data: { status },
    });
    io.to(`tournament:${tournament.id}`).emit('tournament:statusChange', { status });
    return res.json({ success: true, data: tournament });
  } catch (error) {
    logger.error('Update status error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});
