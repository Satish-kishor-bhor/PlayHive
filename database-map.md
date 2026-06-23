# 🗄️ PlayHive — Database Schema Map

This file details the database structure configured via Prisma and mapped to the PostgreSQL database.

---

## 🗃️ Database Table Definitions

### 1. `User`
Primary record for players, organizers, and admins.
- **Fields**:
  - `id` (String, UUID, Primary Key)
  - `email` (String, Unique)
  - `phone` (String, Optional, Unique)
  - `username` (String, Unique)
  - `passwordHash` (String, Optional)
  - `displayName` (String)
  - `avatarUrl` (String, Optional)
  - `role` (UserRole enum: `PLAYER`, `ORGANIZER`, `ADMIN`)
  - `isEmailVerified` (Boolean, default: `false`)
  - `isPhoneVerified` (Boolean, default: `false`)
  - `walletBalance` (Float, default: `0`)
  - `bgmiUid` (String, Optional, Unique)
  - `bgmiUsername` (String, Optional)
  - `bgmiTier` (String, Optional)
  - `bgmiVerified` (Boolean, default: `false`)
  - `kycStatus` (KYCStatus enum: `PENDING`, `SUBMITTED`, `APPROVED`, `REJECTED`)
  - `aadhaarNumber` / `panNumber` (String, Optional)
- **Relations**:
  - Owners many `Team` models.
  - Subscribes to many `TeamMember` roles.
  - Purchases many `Payment` orders.
  - Receives many `Payout` transfers.

### 2. `Tournament`
Esports matches metadata.
- **Fields**:
  - `id` (String, UUID, Primary Key)
  - `slug` (String, Unique)
  - `name` (String)
  - `description` (String, Optional)
  - `format` (TournamentFormat: `SOLO`, `DUO`, `SQUAD`)
  - `matchMode` (MatchMode: `CLASSIC`, `TDM`, `ARCADE`)
  - `map` (MapName: `ERANGEL`, `MIRAMAR`, `SANHOK`, `VIKENDI`, `NUSA`, `RONDO`, `LIVIK`)
  - `maxTeams` (Int, default: `24`)
  - `entryFee` / `prizePool` (Float)
  - `lobbyId` / `lobbyPassword` (String, Optional)
  - `status` (TournamentStatus: `DRAFT`, `REGISTRATION_OPEN`, `REGISTRATION_CLOSED`, `ONGOING`, `COMPLETED`, `CANCELLED`)
- **Relations**:
  - Linked to one `User` as the organizer.
  - Has many `TournamentRegistration` rows.
  - Contains many `Match` rounds.

### 3. `TournamentRegistration`
Junction linking `Team` and `Tournament` tables.
- **Fields**:
  - `id` (String, UUID, Primary Key)
  - `tournamentId` (String, Foreign Key)
  - `teamId` (String, Foreign Key)
  - `status` (TeamRegistrationStatus: `REGISTERED`, `CHECKED_IN`, `DISQUALIFIED`, `WITHDRAWN`)
  - `paymentId` (String, Optional, Foreign Key)
- **Constraints**:
  - Unique composite index: `@@unique([tournamentId, teamId])`

### 4. `Payment`
Ledger mapping entries for registration entry fees.
- **Fields**:
  - `id` (String, UUID, Primary Key)
  - `userId` (String, Foreign Key)
  - `tournamentId` (String, Optional, Foreign Key)
  - `amount` / `platformFee` / `gstAmount` / `totalAmount` (Float)
  - `status` (PaymentStatus: `PENDING`, `COMPLETED`, `FAILED`, `REFUNDED`)
  - `razorpayOrderId` (String, Unique)
  - `razorpayPaymentId` (String, Unique)
  - `invoiceNumber` (String, Unique)
  - `invoiceUrl` (String, Optional)

### 5. `MatchResult`
Participant score mappings per round.
- **Fields**:
  - `id` (String, UUID, Primary Key)
  - `matchId` (String, Foreign Key)
  - `teamId` (String, Foreign Key)
  - `rank` (Int)
  - `kills` (Int)
  - `points` / `killPoints` / `totalPoints` (Float)
- **Constraints**:
  - Unique composite index: `@@unique([matchId, teamId])`
