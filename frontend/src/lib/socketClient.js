// src/lib/socketClient.js
import { io } from "socket.io-client";

const createSocket = ({ url, token, userId, opts = {} }) => {
  // If you use cookie-based auth, don't need token; otherwise pass token in auth
  const connectOptions = {
    autoConnect: false,
    ...opts,
    // Example auth option: will send as "auth" in socket.io handshake
    auth: token ? { token } : undefined,
    query: userId ? { userId } : undefined, // less preferred; use auth instead
  };

  const socket = io(url, connectOptions);

  return socket;
};

export default createSocket;
