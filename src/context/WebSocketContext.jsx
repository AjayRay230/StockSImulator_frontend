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
  const [latestBatch, setLatestBatch] = useState([]);
useEffect(() => {
  if (!isLoggedIn || !user?.username) return;

  const token = localStorage.getItem("token");
  if (!token) return;

  const client = new Client({
    webSocketFactory: () =>
      new SockJS(`${import.meta.env.VITE_WS_BASE_URL}/ws`),

    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },

    debug: () => {},

    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,

    onConnect: () => {
      console.log("STOMP connected");
      setConnected(true);

      setLatestUpdate(null);

      // MARKET PRICES
      client.subscribe("/topic/prices", (message) => {
        const prices = JSON.parse(message.body);

        if (Array.isArray(prices)) {
          const priceMap = {};

          prices.forEach((p) => {
            priceMap[p.symbol] = p.price;
          });

          setLatestUpdate(priceMap);
        } else {
          setLatestUpdate((prev) => ({
            ...prev,
            [prices.symbol]: prices.price,
          }));
        }
      });

      // USER PORTFOLIO
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

    onDisconnect: () => {
      console.log("STOMP disconnected");
      setConnected(false);
    },

    onStompError: (frame) => {
      console.error("STOMP error:", frame.headers["message"]);
    },
  });

  client.activate();
  clientRef.current = client;

  return () => {
    if (clientRef.current) {
      clientRef.current.deactivate();
      clientRef.current = null;
    }
  };
}, [isLoggedIn, user?.username]);
//   useEffect(() => {
//   console.log("Latest Update:", latestUpdate);
// }, [latestUpdate]);

  // Proper Token Expiry Handling
  useEffect(() => {
    if (!isLoggedIn) return;

    const expiry = localStorage.getItem("tokenExpiry");
    if (!expiry) return;

    const timeLeft = expiry - Date.now();

    if (timeLeft <= 0) {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
      return;
    }

    const timer = setTimeout(() => {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    }, timeLeft);

    return () => clearTimeout(timer);
  }, [isLoggedIn]);


  const subscribeToTopic = (destination, callback) => {
  if (!clientRef.current || !connected) return null;

  return clientRef.current.subscribe(destination, (message) => {
    try {
      callback(message);
    } catch (e) {
      console.error("Subscription parse error:", e);
    }
  });
};
  return (
    <WebSocketContext.Provider
      value={{
        latestUpdate,
        portfolioValue,
        connected,
        subscribeToTopic,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);