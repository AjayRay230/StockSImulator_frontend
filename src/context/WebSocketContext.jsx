import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useUser } from "./userContext";

export const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
  const { user, isLoggedIn } = useUser();

  const clientRef = useRef(null);

  const [latestUpdate, setLatestUpdate] = useState(null);
  const [portfolioValue, setPortfolioValue] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!isLoggedIn || !user?.username) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const client = new Client({
      webSocketFactory: () =>
        new SockJS("https://stocksimulator-backend.onrender.com/ws"),

      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },

      debug: () => {},

      reconnectDelay: 5000, // ✅ auto reconnect every 5 sec
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,

      onConnect: () => {
        console.log("✅ STOMP connected");
        setConnected(true);

        // 🔥 MARKET PRICE STREAM
        client.subscribe("/topic/prices", (message) => {
          try {
            const prices = JSON.parse(message.body);
            setLatestUpdate(prices);
          } catch (e) {
            console.error("Price parse error:", e);
          }
        });

        // 🔥 USER PORTFOLIO STREAM
        client.subscribe(
          `/topic/portfolio/${user.username}`,
          (message) => {
            try {
              const totalValue = JSON.parse(message.body);
              setPortfolioValue(totalValue);
            } catch (e) {
              console.error("Portfolio parse error:", e);
            }
          }
        );
      },

      onStompError: (frame) => {
        console.error("STOMP error:", frame.headers["message"]);
      },

      onDisconnect: () => {
        console.log("❌ STOMP disconnected");
        setConnected(false);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
  }, [isLoggedIn, user?.username]);

  return (
    <WebSocketContext.Provider
      value={{
        latestUpdate,
        portfolioValue,
        connected,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);