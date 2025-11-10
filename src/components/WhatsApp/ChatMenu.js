"use client";
import React, { useEffect, useState, useRef } from "react";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { ArrowLeft, Bot, User, User2 } from "lucide-react";

const ChatMenu = ({
  selectedChat,
  setSelectedChat,
  formatMessage,
  setShowChat,
}) => {
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  /** ✅ Scroll to bottom when messages update */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (selectedChat?.Messages?.length) {
      setTimeout(scrollToBottom, 150);
      setLoading(false);
    }
  }, [selectedChat?.Messages]);

  /** ✅ Detect mobile layout */
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  /** ✅ Handle back button on mobile */
  const handleBack = () => {
    setShowChat(false);
    setSelectedChat(null);
  };

  /** ✅ Format Date Labels (Today, Yesterday, etc.) */
  const formatDateLabel = (dateString) => {
    if (!dateString) return "";
    const messageDate = new Date(dateString).setHours(0, 0, 0, 0);
    const today = new Date().setHours(0, 0, 0, 0);
    const yesterday = new Date(Date.now() - 86400000).setHours(0, 0, 0, 0);
    const tomorrow = new Date(Date.now() + 86400000).setHours(0, 0, 0, 0);

    if (messageDate === today) return "Today";
    if (messageDate === yesterday) return "Yesterday";
    if (messageDate === tomorrow) return "Tomorrow";

    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  /** ✅ Skeleton Loader */
  const ChatSkeleton = () => (
    <div className="space-y-4 animate-pulse p-5">
      {[...Array(5)].map((_, idx) => (
        <div key={idx} className="flex items-start gap-3">
          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded-full" />
          <div className="flex flex-col space-y-2">
            <div className="w-40 h-4 bg-gray-300 dark:bg-gray-700 rounded" />
            <div className="w-64 h-4 bg-gray-300 dark:bg-gray-700 rounded" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div
      className={`flex flex-col w-full md:w-[70%] bg-background ${
        isMobile && selectedChat ? "fixed inset-0 z-50" : ""
      }`}
    >
      {/* ✅ No Chat Selected */}
      {!selectedChat ? (
        <div className="flex flex-1 justify-center items-center text-muted-foreground text-sm">
          💬 Select a chat to start messaging...
        </div>
      ) : (
        <>
          {/* ✅ Chat Header */}
          <div className="flex items-center gap-3 p-4 border-b bg-secondary sticky top-0 z-10">
            <button
              onClick={handleBack}
              className="md:hidden hover:opacity-80 transition"
            >
              <ArrowLeft size={22} />
            </button>

            <div className="w-10 h-10 bg-primary/10 rounded-full grid place-items-center">
              <User />
            </div>

            <div className="flex flex-col">
              <p className="font-medium truncate">
                {selectedChat.userName || `+${selectedChat.sessionId}`}
              </p>
              {selectedChat.isAIControl && (
                <span className="text-xs text-primary flex items-center gap-1">
                  <Bot size={14} /> Bot Active
                </span>
              )}
            </div>
          </div>

          {/* ✅ Messages Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-2">
            {loading ? (
              <ChatSkeleton />
            ) : selectedChat?.Messages?.length ? (
              <div className="flex flex-col gap-4">
                {selectedChat.Messages.map((msg, i) => {
                  const isHuman = msg.isUser;
                  const currentDate = formatDateLabel(msg.date);
                  const previousDate =
                    i > 0
                      ? formatDateLabel(selectedChat.Messages[i - 1].date)
                      : null;

                  return (
                    <div key={i}>
                      {/* ✅ Date Separator */}
                      {currentDate !== previousDate && (
                        <div className="text-center my-3">
                          <p className="inline-block px-4 py-1 text-xs font-semibold text-primary bg-primary/10 border rounded-full">
                            {currentDate}
                          </p>
                        </div>
                      )}

                      {/* ✅ Message Bubble */}
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
                            className={`px-3 py-2 rounded-lg text-sm leading-relaxed break-words ${
                              isHuman
                                ? "bg-muted text-foreground rounded-bl-none"
                                : "bg-primary/20 text-foreground rounded-br-none"
                            }`}
                            dangerouslySetInnerHTML={{
                              __html: formatMessage(msg?.textBody || ""),
                            }}
                          />
                          <span className="text-[10px] text-primary/60 font-semibold">
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

          {/* ✅ Chat Footer */}
          <div className="bottom-0" >
            {selectedChat.isAIControl ? (
              <div className="flex items-center justify-between p-4 border-t bg-background">
                <div>
                  <p className="font-semibold flex items-center gap-2 text-primary">
                    <Bot size={16} /> In Conversation with Bot
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Disengage chatbot to take control
                  </p>
                </div>
                <Button>
                  <User2 className="mr-2" size={16} /> Take Control
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 border-t bg-background">
                <Textarea
                  className="flex-1 min-h-[40px] resize-none text-sm"
                  placeholder="Type a message..."
                />
                <Button>Send</Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ChatMenu;
