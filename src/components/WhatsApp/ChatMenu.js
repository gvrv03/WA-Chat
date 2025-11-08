"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { ArrowLeft, Bot, User, User2 } from "lucide-react";

const ChatMenu = ({ selectedChat, setSelectedChat, setShowChat, renderMessages }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true); // ✅ Only for first load
  const messagesEndRef = useRef(null); // ✅ Ref for scrolling

  // ✅ Function to scroll to bottom
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // ✅ Fetch Messages (only first time shows loader)
  const fetchMessages = useCallback(async (initial = false) => {
    if (!selectedChat?.sessionId || !selectedChat?.waPhoneId) return;

    if (initial) setLoading(true);

    try {
      const res = await fetch(
        `/api/getMessages?sessionId=${selectedChat.sessionId}&collection=CPID${selectedChat.waPhoneId}`
      );
      const data = await res.json();
      setMessages(data?.Messages || []);

      // ✅ Auto scroll after messages load (delay ensures correct scroll)
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }

    if (initial) setLoading(false);
  }, [selectedChat]);

  // ✅ Initial load + setup realtime listener
  useEffect(() => {
    if (!selectedChat) return;

    fetchMessages(true); // ✅ Only first time triggers loading

    const eventSource = new EventSource(`/api/realtime?collection=CPID${selectedChat.waPhoneId}`);
    eventSource.onmessage = () => fetchMessages(false); // ✅ No loading on updates

    return () => {
      eventSource.close();
    };
  }, [selectedChat, fetchMessages]);

  // ✅ UI for loading skeleton (only shown once)
  const ChatSkeleton = () => (
    <div className="space-y-4 animate-pulse">
      {[...Array(5)].map((_, idx) => (
        <div key={idx} className="flex items-start gap-3">
          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
          <div className="flex flex-col space-y-2">
            <div className="w-40 h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="w-64 h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const handleBack = () => {
    setShowChat(false);
    setSelectedChat(null);
  };

  return (
    <div
      className={`flex flex-col w-full md:w-[70%] ${
        isMobile && selectedChat ? "fixed inset-0 bg-background z-50" : ""
      }`}
    >
      {!selectedChat ? (
        <div className="flex flex-1 justify-center items-center text-muted-foreground text-sm">
          💬 Select a chat to start messaging...
        </div>
      ) : (
        <>
          {/* ✅ Chat Header */}
          <div className="flex items-center gap-3 p-4 border-b bg-secondary sticky top-0 z-10">
            <button onClick={handleBack} className="md:hidden hover:opacity-80 transition">
              <ArrowLeft size={22} />
            </button>
            <div className="w-10 h-10 bg-primary/10 rounded-full grid place-items-center">
              <User />
            </div>
            <p className="font-medium truncate">
              {selectedChat.userName || "+" + selectedChat.sessionId}
            </p>
          </div>

          {/* ✅ Chat Message Area */}
          <div className="flex-1 p-5 overflow-y-auto">
            {loading ? <ChatSkeleton /> : renderMessages(messages)}
            <div ref={messagesEndRef} /> {/* ✅ Auto-scroll Marker */}
          </div>

          {/* ✅ Footer */}
          {selectedChat.isAIControl ? (
            <div className="flex items-center justify-between p-4 border-t bg-background">
              <div>
                <p className="font-semibold flex items-center gap-2 text-primary">
                  <Bot /> In Conversation with Bot
                </p>
                <p className="text-xs">Disengage chatbot to take control</p>
              </div>
              <Button>
                <User2 className="mr-2" /> Take Control
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 border-t bg-background">
              <Textarea className="flex-1 min-h-[40px] resize-none" placeholder="Type a message..." />
              <Button>Send</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ChatMenu;
