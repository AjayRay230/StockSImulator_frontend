import { createContext, useEffect, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

export const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {

  const [latestUpdate, setLatestUpdate] = useState(null);

  useEffect(() => {

    console.log("🚀 WebSocketProvider mounted");

    const token = localStorage.getItem("token");

    if (!token) {
      console.log("❌ No JWT token found. WebSocket not started.");
      return;
    }

    const socket = new SockJS(
      "https://stocksimulator-backend.onrender.com/ws"
    );

    socket.onopen = () => console.log("🟢 SockJS open");
    socket.onerror = (e) => console.log("🔴 SockJS error", e);
    socket.onclose = () => console.log("🟡 SockJS closed");

    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,

      connectHeaders: {
        Authorization: `Bearer ${token}`
      },

      onConnect: () => {
        console.log("✅ STOMP connected");

        client.subscribe("/topic/prices", (message) => {
          const data = JSON.parse(message.body);
          console.log("📈 Message received:", data);
          setLatestUpdate(data);
        });
      },

      onStompError: (frame) => {
        console.error("❌ STOMP Error:", frame);
      }
    });

    client.activate();

    return () => {
      client.deactivate();
    };

  }, []);

  return (
    <WebSocketContext.Provider value={{ latestUpdate }}>
      {children}
    </WebSocketContext.Provider>
  );
};