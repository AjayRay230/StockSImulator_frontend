import { createContext, useEffect, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

export const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {

  const [latestUpdate, setLatestUpdate] = useState(null);

  useEffect(() => {

    const socket = new SockJS(
      "https://stocksimulator-backend.onrender.com/ws"
    );

    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,

      onConnect: () => {
        console.log("✅ Connected to WebSocket");

        client.subscribe("/topic/prices", (message) => {
          const data = JSON.parse(message.body);
          console.log("📈 Real-time update:", data);
          setLatestUpdate(data);
        });
      },

      onStompError: (frame) => {
        console.error("STOMP Error:", frame);
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