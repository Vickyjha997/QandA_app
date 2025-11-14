// --- Context file ---

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error("useSocket must be used within SocketProvider");
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { isAuthenticated, user } = useAuth();

  // Store event listeners in a ref so they're not recreated on rerenders
  const listeners = useRef({});

  // Register a subscription callback from any component
  const onSocketEvent = (event, cb) => {
    if (!listeners.current[event]) listeners.current[event] = [];
    listeners.current[event].push(cb);
  };

  // Helper to notify all listeners on event
  const emitToListeners = (event, data) => {
    (listeners.current[event] || []).forEach((cb) => cb(data));
  };

  useEffect(() => {
    if (!isAuthenticated) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    const newSocket = io("http://localhost:5000", {
      withCredentials: true,
      transports: ["websocket", "polling"]
    });

    newSocket.on("connect", () => setConnected(true));
    newSocket.on("disconnect", () => setConnected(false));
    newSocket.on("new-question", (data) => {
      toast.success("🔔 New question posted!", { duration: 4000 });
      emitToListeners("new-question", data);
    });
    newSocket.on("question-claimed", (data) => {
      toast.success("🎓 Your question is being answered!", { duration: 4000 });
      emitToListeners("question-claimed", data);
    });
    newSocket.on("question-answered", (data) => {
      toast.success("✅ Your question has been answered!", { duration: 5000 });
      emitToListeners("question-answered", data);
    });
    newSocket.on("new-meeting", (data) => {
      toast.success("📅 New meeting booked!", { duration: 4000 });
      emitToListeners("new-meeting", data);
    });

    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, [isAuthenticated, user]);

  return (
    <SocketContext.Provider value={{ socket, connected, onSocketEvent }}>
      {children}
    </SocketContext.Provider>
  );
};
