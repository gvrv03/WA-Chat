"use client";
import { useEffect, useState } from "react";

export default function LiveChat({ sessionId }) {
  const [messages, setMessages] = useState([]);
  const fetchMessages = async () => {
    const res = await fetch(
      `/api/getMessages?sessionId=917796305801&collection=CPID874495365740081`
    );
    const data = await res.json();
    setMessages(data?.Messages || []);
  };
console.log(messages);

  useEffect(() => {
    fetchMessages(); // Initial fetch
    const eventSource = new EventSource(
      "/api/realtime?collection=CPID874495365740081"
    );
    eventSource.onmessage = () => {
      fetchMessages(); // Re-fetch messages when database changes
    };
    return () => eventSource.close();
  }, []);

  return (
    <div>
      {messages.map((m, i) => (
        <p key={i}>
          <b>{m.isUser ? "User" : "Bot"}:</b> {m.textBody}
        </p>
      ))}
    </div>
  );
}
