import { useEffect, useState } from "react";
import { useWebSocket } from "../../context/WebSocketContext";

export default function OrderBook({ symbol }) {
  const { subscribeToTopic, connected } = useWebSocket();

  const [bids, setBids] = useState([]);
  const [asks, setAsks] = useState([]);

  useEffect(() => {
    if (!symbol || !connected) return;

    const subscription = subscribeToTopic(
      `/topic/orderbook/${symbol}`,
      (message) => {
        const data = JSON.parse(message.body);

        setBids(data.bids || []);
        setAsks(data.asks || []);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, [symbol, connected]);

  return (
    <div style={{ display: "flex", gap: "20px" }}>
      {/* BIDS */}
      <div style={{ flex: 1 }}>
        <h3 style={{ color: "limegreen" }}>Bids</h3>
        {bids.map((bid, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "4px 0",
            }}
          >
            <span>{bid.price}</span>
            <span>{bid.quantity}</span>
          </div>
        ))}
      </div>

      {/* ASKS */}
      <div style={{ flex: 1 }}>
        <h3 style={{ color: "red" }}>Asks</h3>
        {asks.map((ask, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "4px 0",
            }}
          >
            <span>{ask.price}</span>
            <span>{ask.quantity}</span>
          </div>
        ))}
      </div>
    </div>
  );
}