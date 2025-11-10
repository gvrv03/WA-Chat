"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import DOMPurify from "dompurify";
import { User, Bot } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import ChatMenu from "@/components/WhatsApp/ChatMenu";
import ChatList from "@/components/WhatsApp/ChatList";

export default function Home() {
  const [displayedChats, setDisplayedChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showChat, setShowChat] = useState(false);
  const messagesEndRef = useRef(null);
  const { selectedAppDetails } = useStore();
  const BATCH_SIZE = 10;

  /** ✅ Auto Scroll to Latest Message */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedChat?.Messages]);

  /** ✅ Fetch Messages */
  const fetchMessages = useCallback(
    async (initial = false) => {
      if (!selectedAppDetails?.MPhoneNoId) return;

      if (initial) setLoading(true);

      try {
        const res = await fetch(
          `/api/getMessages?collection=CPID${selectedAppDetails.MPhoneNoId}`
        );

        if (!res.ok) throw new Error("Failed to fetch messages");

        const data = await res.json();
        console.log("Fetched Messages:", data);

        setDisplayedChats((data || []).slice(0, BATCH_SIZE));
        setTimeout(scrollToBottom, 100);
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        if (initial) setLoading(false);
      }
    },
    [selectedAppDetails?.MPhoneNoId]
  );

  /** ✅ Realtime Updates with EventSource */
  useEffect(() => {
    if (!selectedAppDetails?.MPhoneNoId) return;
    fetchMessages(true);
    const eventSource = new EventSource(
      `/api/realtime?collection=CPID${selectedAppDetails.MPhoneNoId}`
    );

    eventSource.onmessage = () => fetchMessages(false);
    eventSource.onerror = (err) => console.error("SSE Error:", err);

    return () => {
      eventSource.close();
    };
  }, [fetchMessages]);

  useEffect(() => {
    if (!selectedChat) return;
    const updated = displayedChats.find(
      (c) => c.sessionId === selectedChat.sessionId
    );
    if (
      updated &&
      JSON.stringify(updated.Messages) !== JSON.stringify(selectedChat.Messages)
    ) {
      setSelectedChat(updated);
    }
  }, [displayedChats]);

  /** ✅ Sanitize and Format Message Text */
  const formatMessage = (text = "") =>
    DOMPurify.sanitize(
      text
        .replace(/\*(.*?)\*/g, "<strong>$1</strong>")
        .replace(/_(.*?)_/g, "<em>$1</em>")
        .replace(/~(.*?)~/g, "<s>$1</s>")
        .replace(/`(.*?)`/g, "<code>$1</code>")
        .replace(/\n/g, "<br/>")
    );

  /** ✅ Filter Chats by Search Term */
  const filteredChats = displayedChats.filter((chat) =>
    (chat?.userName || chat?.sessionId || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <section className="flex h-screen flex-col md:flex-row bg-background text-foreground">
      <ChatList
        showChat={showChat}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        loading={loading}
        filteredChats={filteredChats}
        setShowChat={setShowChat}
        selectedChat={selectedChat}
        setSelectedChat={setSelectedChat}
        formatMessage={formatMessage}
      />

      {/* ✅ Chat Window (Right Section) */}
      <ChatMenu
        selectedChat={selectedChat}
        setSelectedChat={setSelectedChat}
        setShowChat={setShowChat}
        formatMessage={formatMessage}
      />
    </section>
  );
}
