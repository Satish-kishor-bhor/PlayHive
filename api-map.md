# ⚙️ PlayHive — Backend API Endpoints Mapping

This file catalogs the available REST API endpoints exposed by the Express backend API.

---

## 🛠️ API Routing Table

The base URL for all endpoints is `<API_URL>/api/v1`.

### 1. Authentication Router (`/auth`)

| Method | Endpoint | Description | Payloads (Body / Query) | Response Codes |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/auth/register` | Register a new user profile | `{ email, username, password, displayName, phone? }` | `201 Created`, `400 Bad Request`, `409 Conflict` |
| **POST** | `/auth/login` | Log in and receive tokens | `{ email, password }` | `200 OK`, `401 Unauthorized`, `403 Banned` |
| **POST** | `/auth/verify-email` | Verify registration email with OTP | `{ email, otp }` | `200 OK`, `400 Bad Request` |
| **POST** | `/auth/refresh` | Exchange Refresh Token for new tokens | `{ refreshToken }` | `200 OK`, `401/403 Invalid Token` |
| **POST** | `/auth/logout` | Revoke/Delete active Refresh Token | `{ refreshToken }` | `200 OK` |

### 2. Tournaments Router (`/tournaments`)

| Method | Endpoint | Description | Payloads (Body / Query) | Response Codes |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/tournaments` | Query all active public tournaments | *Query*: `status?`, `format?`, `search?`, `page?`, `limit?` | `200 OK`, `500 Server Error` |
| **GET** | `/tournaments/:slug` | Query full tournament details | *Params*: `slug` | `200 OK`, `404 Not Found` |
| **POST** | `/tournaments` | Add a new tournament | `{ name, format, matchMode, maxTeams, entryFee, prizePool, registrationStart, registrationEnd, matchStartTime }` | `201 Created`, `400 Validation Error`, `401/403 Role Check Fail` |
| **POST** | `/tournaments/:id/register` | Register team slot for a tournament | *Params*: `id`, *Body*: `{ teamId }` | `210 Created` or `400 Not Open`, `409 Already Registered` |
| **PATCH** | `/tournaments/:id/lobby` | Set BGMI room credentials and notify players | *Params*: `id`, *Body*: `{ lobbyId, lobbyPassword }` | `200 OK`, `401/403 Role Check Fail` |
| **PATCH** | `/tournaments/:id/status` | Update tournament status | *Params*: `id`, *Body*: `{ status }` | `200 OK` |

### 3. Payments Router (`/payments`)

| Method | Endpoint | Description | Payloads (Body / Query) | Response Codes |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/payments/create-order` | Instantiate Razorpay Order ID | `{ tournamentId, teamId }` | `200 OK`, `404 Tournament Not Found`, `400 Free Tournament` |
| **POST** | `/payments/verify` | Verify Razorpay signatures, save payment ledger & generate invoice PDF | `{ razorpayOrderId, razorpayPaymentId, razorpaySignature, paymentId, teamId }` | `200 OK`, `400 Verification Failed` |
| **POST** | `/payments/webhook` | Handle async payment failures from Razorpay servers | `{ event, payload }` | `200 OK`, `400 Invalid Webhook Signature` |
| **GET** | `/payments/my` | Fetch invoice history of current user | None | `200 OK`, `401 Unauthorized` |
