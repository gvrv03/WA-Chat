import React from "react";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { ArrowLeft, Bot, User, User2 } from "lucide-react";

const ChatMenu = ({ selectedChat, setSelectedChat, setShowChat, renderMessages }) => {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const handleBack = () => {
    setShowChat(false);        // Hide chat window on mobile
    setSelectedChat(null);  // ✅ Uncomment if you want to clear selected chat completely
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
            {/* ✅ Back button visible on Mobile only */}
            <button
              onClick={handleBack}
              className="md:hidden flex items-center hover:opacity-80 transition"
            >
              <ArrowLeft size={22} />
            </button>

            <div className="w-10 h-10 bg-primary/10 rounded-full grid place-items-center">
              <User />
            </div>

            <p className="font-medium truncate">
              {selectedChat?.userName || "+" + selectedChat?.sessionId}
            </p>
          </div>

          {/* ✅ Chat Messages */}
          <div className="flex-1 p-5 overflow-y-auto">
            {renderMessages(selectedChat?.Messages)}
          </div>

          {/* ✅ Footer with Input or Bot Notice */}
          {selectedChat?.isAIControl ? (
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
              <Textarea
                className="flex-1 min-h-[40px] resize-none"
                placeholder="Type a message..."
              />
              <Button>Send</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ChatMenu;
