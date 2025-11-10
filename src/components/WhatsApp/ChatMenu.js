"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { ArrowLeft, Bot, User, User2, Loader2, Brain } from "lucide-react";
import { UpdateDocument } from "@/actions/CRUDAction";
import { useStore } from "@/context/StoreContext";

const ChatMenu = ({ selectedChat, setSelectedChat, formatMessage, setShowChat }) => {
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [assigningToAI, setAssigningToAI] = useState(false);
  const [takingControl, setTakingControl] = useState(false);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);
  const { selectedAppDetails } = useStore();

  /** ✅ Smooth Scroll to bottom */
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
  }, []);

  /** ✅ Auto-scroll when messages change */
  useEffect(() => {
    if (selectedChat?.Messages?.length) {
      setLoading(false);
      scrollToBottom();
    }
  }, [selectedChat?.Messages?.length, scrollToBottom]);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  /** ✅ Back button handler */
  const handleBack = useCallback(() => {
    setShowChat(false);
    setSelectedChat(null);
  }, [setShowChat, setSelectedChat]);

  /** ✅ Format date labels */
  const formatDateLabel = useCallback((dateString) => {
    if (!dateString) return "";
    const msgDate = new Date(dateString).setHours(0, 0, 0, 0);
    const today = new Date().setHours(0, 0, 0, 0);
    const yesterday = new Date(Date.now() - 86400000).setHours(0, 0, 0, 0);
    if (msgDate === today) return "Today";
    if (msgDate === yesterday) return "Yesterday";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }, []);

  /** ✅ Assign chat to AI */
  const handleAssignToAI = async () => {
    if (!selectedChat || !selectedAppDetails?.MPhoneNoId) return;
    setAssigningToAI(true);
    try {
      const updatedChat = { ...selectedChat, isAIControl: true };
      setSelectedChat(updatedChat);
      await UpdateDocument(
        `CPID${selectedAppDetails.MPhoneNoId}`,
        { sessionId: selectedChat.sessionId },
        { isAIControl: true }
      );
    } catch (err) {
      console.error("Error assigning to AI:", err);
    } finally {
      setAssigningToAI(false);
    }
  };

  /** ✅ Take manual control back */
  const handleTakeControl = async () => {
    if (!selectedChat || !selectedAppDetails?.MPhoneNoId) return;
    setTakingControl(true);
    try {
      const updatedChat = { ...selectedChat, isAIControl: false };
      setSelectedChat(updatedChat);
      await UpdateDocument(
        `CPID${selectedAppDetails.MPhoneNoId}`,
        { sessionId: selectedChat.sessionId },
        { isAIControl: false }
      );
    } catch (err) {
      console.error("Error taking control:", err);
    } finally {
      setTakingControl(false);
    }
  };

  /** ✅ Send Message */
  const handleSendMessage = async () => {
    const trimmed = message.trim();
    if (!trimmed || !selectedChat) return;
    setSending(true);

    const newMsg = {
      id: Date.now(),
      isUser: true,
      textBody: trimmed,
      type: "text",
      date: new Date().toISOString(),
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const updatedChat = {
      ...selectedChat,
      Messages: [...(selectedChat.Messages || []), newMsg],
    };
    setSelectedChat(updatedChat);
    setMessage("");
    scrollToBottom();

    try {
      await UpdateDocument(
        `CPID${selectedAppDetails?.MPhoneNoId || ""}`,
        { sessionId: selectedChat.sessionId },
        { $push: { Messages: newMsg } }
      );
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setSending(false);
    }
  };

  /** ✅ Skeleton while loading */
  const ChatSkeleton = () => (
    <div className="space-y-4 animate-pulse p-5">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-start gap-3">
          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded-full" />
          <div className="flex flex-col space-y-2">
            <div className="w-40 h-4 bg-gray-300 dark:bg-gray-700 rounded" />
            <div className="w-64 h-4 bg-gray-300 dark:bg-gray-700 rounded" />
          </div>
        </div>
      ))}
    </div>
  );

  /** ✅ No Chat Selected */
  if (!selectedChat)
    return (
      <div className="flex flex-1 justify-center items-center text-muted-foreground text-sm">
        💬 Select a chat to start messaging...
      </div>
    );

  return (
    <div
      className={`flex flex-col w-full md:w-[70%] bg-background ${
        isMobile ? "fixed inset-0 z-50" : ""
      } transition-all duration-300 ease-in-out`}
    >
      {/* ✅ Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-secondary sticky top-0 z-10">
        {isMobile && (
          <button onClick={handleBack} className="hover:opacity-80 transition">
            <ArrowLeft size={22} />
          </button>
        )}
        <div className="w-10 h-10 bg-primary/10 rounded-full grid place-items-center">
          <User />
        </div>
        <div className="flex flex-col overflow-hidden">
          <p className="font-medium truncate">
            {selectedChat.userName || `+${selectedChat.sessionId}`}
          </p>
          <span
            className={`text-xs flex items-center gap-1 transition-all ${
              selectedChat.isAIControl ? "text-primary" : "text-green-600"
            }`}
          >
            {selectedChat.isAIControl ? (
              <>
                <Bot size={14} /> Bot Active
              </>
            ) : (
              <>
                <User2 size={14} /> Human Active
              </>
            )}
          </span>
        </div>
      </div>

      {/* ✅ Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-2 scroll-smooth">
        {loading ? (
          <ChatSkeleton />
        ) : selectedChat?.Messages?.length ? (
          <div className="flex flex-col gap-4">
            {selectedChat.Messages.map((msg, i) => {
              const isHuman = msg.isUser;
              const currentDate = formatDateLabel(msg.date);
              const previousDate =
                i > 0 ? formatDateLabel(selectedChat.Messages[i - 1].date) : null;

              return (
                <div key={i} className="animate-fadeIn">
                  {currentDate !== previousDate && (
                    <div className="text-center my-3">
                      <p className="inline-block px-4 py-1 text-xs font-semibold text-primary bg-primary/10 border rounded-full">
                        {currentDate}
                      </p>
                    </div>
                  )}

                  <div
                    className={`flex items-end gap-2 ${
                      isHuman ? "self-start" : "self-end flex-row-reverse"
                    }`}
                  >
                    <div className="w-8 h-8 flex items-center justify-center bg-primary/10 rounded-full">
                      {isHuman ? <User size={18} /> : <Bot size={18} />}
                    </div>

                    <div className="md:max-w-[60%] max-w-[80%] flex flex-col gap-1">
                      <div
                        className={`px-3 py-2 rounded-2xl text-sm leading-relaxed shadow-sm transition-all ${
                          isHuman
                            ? "bg-muted text-foreground rounded-bl-none"
                            : "bg-primary/20 text-foreground rounded-br-none"
                        }`}
                        dangerouslySetInnerHTML={{
                          __html: formatMessage(msg?.textBody || ""),
                        }}
                      />
                      <span className="text-[10px] text-primary/60 font-semibold self-end">
                        {msg?.time}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground mt-10">
            No messages yet. Start the conversation!
          </p>
        )}
      </div>

      {/* ✅ Footer */}
      {!selectedChat.isAIControl && (
        <div className="p-3 border-b bg-primary/5 text-center space-y-2">
          <p className="text-xs text-muted-foreground">
            Allow the AI Agent to take over this chat and respond automatically.
          </p>
          <Button
            onClick={handleAssignToAI}
            disabled={assigningToAI}
            className="bg-primary hover:bg-primary/90 rounded-full text-white transition-all"
          >
            {assigningToAI ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Assigning to AI...
              </>
            ) : (
              <>
                <Brain className="mr-2 h-4 w-4" /> Assign to AI Agent
              </>
            )}
          </Button>
        </div>
      )}

      {/* Chat Controls */}
      <div className="flex items-center justify-between p-4">
        {selectedChat.isAIControl ? (
          <>
            <div className="flex flex-col text-left">
              <p className="font-semibold flex items-center gap-2 text-primary">
                <Bot size={16} /> AI is handling this conversation
              </p>
              <p className="text-xs text-muted-foreground">
                Click below to take manual control
              </p>
            </div>
            <Button
              onClick={handleTakeControl}
              disabled={takingControl}
              className="bg-green-600 hover:bg-green-700 text-white transition-all"
            >
              {takingControl ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Taking Over...
                </>
              ) : (
                <>
                  <User2 className="mr-2 h-4 w-4" /> Take Control
                </>
              )}
            </Button>
          </>
        ) : (
          <div className="flex items-center gap-3 flex-1 mr-3">
            <Textarea
              className="flex-1 min-h-[40px] resize-none text-sm focus-visible:ring-1 transition-all"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && !e.shiftKey && handleSendMessage()
              }
            />
            <Button
              onClick={handleSendMessage}
              disabled={sending}
              className="transition-all"
            >
              {sending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                </>
              ) : (
                "Send"
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMenu;
