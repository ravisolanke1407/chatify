import createSocket from "../../lib/socketClient";
import {
  SOCKET_CONNECTED,
  SOCKET_DISCONNECTED,
  SEND_SOCKET_EVENT,
  NEW_MESSAGE_RECEIVED,
  UPDATE_ONLINE_USERS,
} from "../socketActions";
import { checkAuth, logout } from "../action";

const SOCKET_URL =
  import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const createSocketMiddleware = () => {
  let socket = null;
  let unloadHandler = null;
  let boundHandlers = [];

  const cleanupSocket = (store) => {
    if (!socket) return;
    // remove handlers
    boundHandlers.forEach(({ event, handler }) => socket.off(event, handler));
    boundHandlers = [];
    try {
      socket.disconnect();
      socket.close && socket.close();
    } catch (e) {
      console.warn("Error disconnecting socket:", e);
    }
    socket = null;

    // remove unload handler
    if (unloadHandler && typeof window !== "undefined") {
      removeEventListener("beforeunload", unloadHandler);
      unloadHandler = null;
    }

    // notify store
    store.dispatch({ type: SOCKET_DISCONNECTED });
  };

  return (storeAPI) => (next) => (action) => {
    const { type, payload } = action;

    // 1) Intercept checkAuth/login/signup fulfilled actions and connect socket
    if (
      checkAuth.fulfilled.match(action) ||
      type === "auth/logIn/fulfilled" ||
      type === "auth/signUp/fulfilled"
    ) {
      // if already connected, skip
      if (socket) {
        return next(action);
      }

      const state = storeAPI.getState();
      // get token / user id from payload or state
      const token = payload?.token || state.auth?.authUser?.token;
      const userId = payload?._id || state.auth?.authUser?._id;

      // create socket instance
      socket = createSocket({ url: SOCKET_URL, token, userId });

      // add handlers
      const onConnect = () => {
        storeAPI.dispatch({ type: SOCKET_CONNECTED });
      };

      const onDisconnect = (reason) => {
        storeAPI.dispatch({ type: SOCKET_DISCONNECTED, payload: reason });
      };

      const onNewMessage = (newMessage) => {
        storeAPI.dispatch({ type: NEW_MESSAGE_RECEIVED, payload: newMessage });
      };

      const onUpdateOnlineUsers = (onlineUsers) => {
        storeAPI.dispatch({ type: UPDATE_ONLINE_USERS, payload: onlineUsers });
      };

      // bind and remember handlers for cleanup
      socket.on("connect", onConnect);
      boundHandlers.push({ event: "connect", handler: onConnect });

      socket.on("disconnect", onDisconnect);
      boundHandlers.push({ event: "disconnect", handler: onDisconnect });

      socket.on("newMessage", onNewMessage);
      boundHandlers.push({ event: "newMessage", handler: onNewMessage });

      socket.on("getOnlineUsers", onUpdateOnlineUsers);
      boundHandlers.push({
        event: "getOnlineUsers",
        handler: onUpdateOnlineUsers,
      });

      // connect
      socket.connect();

      // disconnect socket on page refresh/close so server clears subscription
      if (typeof window !== "undefined") {
        unloadHandler = () => {
          try {
            if (socket) {
              socket.disconnect();
            }
          } catch (e) {
            console.error(e);
            /* ignore */
          }
        };
        addEventListener("beforeunload", unloadHandler);
      }
    }

    // 2) Intercept logout action and cleanup
    if (type === "auth/logOut/fulfilled" || type === logout.type) {
      cleanupSocket(storeAPI);
      // continue to next (so logout reducer runs)
      return next(action);
    }

    // 3) Allow dispatching actions that send events over socket
    if (type === SEND_SOCKET_EVENT) {
      // payload shape: { event: 'sendMessage', data: {...}, ackActionType: '...' }
      if (!socket || !socket.connected) {
        console.warn(
          "Socket not connected, cannot send event:",
          payload?.event
        );
        return next(action);
      }
      const { event, data, ackActionType } = payload;

      socket.emit(event, data, (ack) => {
        if (ackActionType) {
          storeAPI.dispatch({ type: ackActionType, payload: ack });
        }
      });
      return next(action);
    }

    return next(action);
  };
};
