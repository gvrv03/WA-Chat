"use client";
import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import DOMPurify from "dompurify";
import { useStore } from "@/context/StoreContext";
import ChatMenu from "@/components/WhatsApp/ChatMenu";
import ChatList from "@/components/WhatsApp/ChatList";

export default function Home() {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showChat, setShowChat] = useState(false);
  const { selectedAppDetails } = useStore();
  const messagesEndRef = useRef(null);
  const BATCH_SIZE = 10;

  /** ✅ Scroll to Latest Message */
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  /** ✅ Fetch Messages */
  const fetchMessages = useCallback(
    async (initial = false) => {
      const phoneId = selectedAppDetails?.MPhoneNoId;
      if (!phoneId) return;

      if (initial) setLoading(true);
      try {
        const res = await fetch(`/api/getMessages?collection=CPID${phoneId}`);
        if (!res.ok) throw new Error("Failed to fetch messages");

        const data = await res.json();
        setChats(Array.isArray(data) ? data : []);
        if (initial) setTimeout(scrollToBottom, 100);
      } catch (err) {
        console.error("Error fetching messages:", err);
      } finally {
        if (initial) setLoading(false);
      }
    },
    [selectedAppDetails?.MPhoneNoId, scrollToBottom]
  );

  /** ✅ Real-time Updates via SSE */
  useEffect(() => {
    const phoneId = selectedAppDetails?.MPhoneNoId;
    if (!phoneId) return;

    fetchMessages(true);
    const eventSource = new EventSource(
      `/api/realtime?collection=CPID${phoneId}`
    );
    eventSource.onmessage = () => fetchMessages(false);
    eventSource.onerror = (err) => console.error("SSE Error:", err);

    return () => eventSource.close();
  }, [fetchMessages, selectedAppDetails?.MPhoneNoId]);

  /** ✅ Keep selectedChat synced safely */
  useEffect(() => {
    if (!selectedChat) return;

    const updated = chats.find((c) => c.sessionId === selectedChat.sessionId);
    if (!updated) return;

    setSelectedChat((prev) => {
      if (!prev) return updated;

      const messagesChanged =
        JSON.stringify(prev.Messages) !== JSON.stringify(updated.Messages);

      // ✅ Only update messages and new fields, not local control toggles
      return {
        ...prev,
        ...(messagesChanged ? { Messages: updated.Messages } : {}),
        // Keep local `isAIControl` if recently toggled (avoid overwrite)
        isAIControl:
          prev.isAIControl !== updated.isAIControl && !prev._justToggled
            ? updated.isAIControl
            : prev.isAIControl,
      };
    });
  }, [chats]);

  /** ✅ Sanitize & Format Message */
  const formatMessage = useCallback((text = "") => {
    return DOMPurify.sanitize(
      text
        .replace(/\*(.*?)\*/g, "<strong>$1</strong>")
        .replace(/_(.*?)_/g, "<em>$1</em>")
        .replace(/~(.*?)~/g, "<s>$1</s>")
        .replace(/`(.*?)`/g, "<code>$1</code>")
        .replace(/\n/g, "<br/>")
    );
  }, []);

  /** ✅ Filter Chats (Memoized) */
  const filteredChats = useMemo(() => {
    if (!searchTerm) return chats.slice(0, BATCH_SIZE);
    return chats.filter((chat) =>
      (chat?.userName || chat?.sessionId || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, chats]);

  /** ✅ Auto-scroll when messages update */
  useEffect(() => {
    if (selectedChat?.Messages?.length) scrollToBottom();
  }, [selectedChat?.Messages?.length, scrollToBottom]);

  return (
    <section className="flex h-screen flex-col md:flex-row bg-background text-foreground transition-all duration-300 ease-in-out">
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

      <ChatMenu
        selectedChat={selectedChat}
        setSelectedChat={setSelectedChat}
        setShowChat={setShowChat}
        formatMessage={formatMessage}
      />
    </section>
  );
}
