# backend-user-auth

A small Express + MongoDB backend demonstrating cookie-based JWT authentication with refresh tokens and Google sign-in.

## What this project is

This repository implements a minimal user authentication backend using:
- Node.js + Express
- MongoDB (via Mongoose)
- JWT access & refresh tokens (stored in cookies)
- Google Sign-In (OIDC) support

It provides user registration, login, logout, token refresh, Google login, and simple profile endpoints.

## Prerequisites

- Node.js (16+ recommended)
- npm (or yarn)
- A running MongoDB instance (local or cloud)

## Usage

1. Clone the repo and change into the project directory.
2. Install dependencies:

```powershell
npm install
```
3. Create a `.env` file in the project root by copying `.env.example` and filling in the required values 

4. Start the app (development):

```powershell
npm run dev
```

The server listens on `PORT` (default 5000).

## API Endpoints

Base path: the app mounts user routes at `/api/users` (confirm in `index.js` / `app.js`).

Endpoints:

- POST /api/users/register
  - Body: { "username": "name", "email": "email@example.com", "password": "pass" }
  - Response: sets `accessToken` and `refreshToken` cookies, returns user data.

- POST /api/users/login
  - Body: { "email": "email@example.com", "password": "pass" }
  - Response: sets cookies, returns user data.

- POST /api/users/google-login
  - Body: { "token": "<google-id-token>" }
  - Response: sets cookies, returns user data (creates user if not exists).

- POST /api/users/refresh-token
  - Body (optional): { "refreshToken": "<token>" }
  - Or send refresh token cookie; returns new access token and sets new cookies.

- POST /api/users/logout
  - Requires access token (cookie or Authorization header). Clears cookies and removes stored refresh token.

- GET /api/users/get-profile
  - Protected. Requires access token (cookie or Authorization: Bearer <token>). Returns current user.

- POST /api/users/changePassword
  - Protected. Body: { "oldPassword": "old", "newPassowrd": "new" }

Notes:
- The server stores tokens in httpOnly cookies named `accessToken` and `refreshToken`. Protected routes are validated either via the cookie or an `Authorization: Bearer <token>` header.

