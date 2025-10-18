# Chatify

Chatify is a lightweight real-time chat application. It demonstrates a modern full‑stack setup using React on the frontend, an Express/Node backend, WebSocket-powered realtime messaging (socket.io), and JWT/cookie authentication. The repo includes separate frontend and backend apps under the `frontend/` and `backend/` folders.

## Author

- **Ravindra Solanke** ([GitHub](https://github.com/ravisolanke1407))

## Highlights

- Real-time chat using Socket.IO
- Authentication (signup/login/logout) with JWT and HttpOnly cookie
- Modular backend with routes, controllers, and middleware
- React frontend with routing and protected/public layouts
- Clear dev setup for running frontend and backend locally

## Tech stack

- Frontend: React (Vite), React Router, Redux Toolkit
- Backend: Node.js, Express, MongoDB (mongoose)
- Realtime: socket.io
- Build/Dev: Vite (frontend), webpack (for other demos in this mono-repo)

## Repo layout

```
Chatify/
  frontend/       # React app (Vite)
  backend/        # Express API and socket server
  README.md       # <-- this file
```

## Requirements

- Node.js 18+ (or compatible LTS)
- npm or yarn
- MongoDB URI (Atlas or local)

## Environment

Create `.env` files for each app (backend and frontend if needed). Example backend `.env` (in `backend/`):

```
PORT=5000
MONGO_URI=<your-mongodb-connection-string>
JWT_SECRET=<your-jwt-secret>
```

Frontend uses Vite and may read environment variables via `import.meta.env`. Example (optional):

```
VITE_API_BASE_URL=http://localhost:5000/api
```

> Do not commit secrets to version control. Use a secret manager or environment injection for production deployments.

## Local development — backend

1. Open a terminal and start the backend:

```powershell
cd backend
npm install
npm run start:dev   # or npm start depending on scripts
```

2. Backend defaults to `http://localhost:5000` (or the `PORT` value in `.env`). It exposes routes under `/api` (for auth, messages, etc.) and the socket server listens on the same port.

## Local development — frontend

1. Open another terminal and start the frontend:

```powershell
cd frontend
npm install
npm run dev
```

2. Frontend defaults to `http://localhost:5173`. It talks to the backend API (configured in the frontend `axios` instance).

## How the realtime flow works

- After login or checkAuth succeeds, the frontend creates a socket.io client connection to the server.
- The server keeps socket subscriptions per connected user and broadcasts/forwards messages.
- When a new message arrives for a recipient, server emits `newMessage` (or configured event) and the frontend updates Redux state.

For robust handling, the recommended approach is:

- Keep the single socket instance in a central place (Redux middleware or a singleton service).
- Middleware dispatches Redux actions when socket events arrive (no components should attach raw socket listeners directly).
- Components only read state and dispatch actions for sends / reads.

## Production build and simple deploy

To build the frontend and serve from the backend (simple single-deploy approach):

1. Build frontend:

```powershell
cd frontend
npm run build
```

2. Copy `frontend/dist` into the backend public folder or configure backend to serve the built files:

```js
// Example in backend main.js
app.use(express.static(path.join(__dirname, "../frontend/dist")));
app.get("*", (req, res) =>
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"))
);
```

3. Deploy the backend to your hosting provider (Render, Heroku, Railway, etc.). If using Vercel, prefer deploying frontend separately and backend as a serverless function or on a provider that supports long-running sockets (Vercel serverless functions are not ideal for persistent socket connections).

## Deployment tips

- Backend with WebSockets: choose a platform that supports long-running Node processes (Render, Railway, DigitalOcean App Platform, AWS EC2/ECS). Vercel is serverless and not ideal for socket servers.
- Frontend: Vercel, Netlify, or any static host works fine for the built React assets.
- Environment variables: configure secrets in the host/provider dashboard.

## Troubleshooting

- `process is not defined` in browser — avoid reading `process.env` at runtime; use build-time defines or `import.meta.env` for Vite. Backend may use `process.env` freely.
- 404 fetching manifests or static files — ensure your dev server `static` dirs include `public/` when using webpack dev server.
- Socket not connecting — check CORS and that frontend socket URL points to backend with correct port and protocol. For cookie-based auth ensure `withCredentials` and appropriate CORS settings (`credentials: true`, allowed origin).

## Tests (if any)

No automated tests included by default. Consider adding Jest/RTL for frontend and supertest/mocha for backend routes.

## Contributing

- Fork the repo and open a PR for feature additions or fixes.
- Keep commits focused and add a short description for each PR.

## License

MIT

---
