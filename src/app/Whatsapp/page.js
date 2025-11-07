"use client";
import { FetchDataToCollection } from "@/actions/CRUDAction";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore } from "@/context/StoreContext";
import {
  Edit,
  Plus,
  Search,
  User,
  ArrowLeft,
  RefreshCw,
  Bot,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import DOMPurify from "dompurify";

export default function Home() {
  const [chats, setChats] = useState([]);
  const [displayedChats, setDisplayedChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [showEditContact, setShowEditContact] = useState(false);
  const { selectedAppDetails } = useStore();
  const chatListRef = useRef(null);
  const messagesEndRef = useRef(null);
  const BATCH_SIZE = 10;

  // ✅ Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedChat?.messages]);

  const getChats = async () => {
    try {
      setLoading(true);
      const res = await FetchDataToCollection(
        `CPID${selectedAppDetails?.MPhoneNoId}`,
        {}
      );
      setChats(res || []);
      setDisplayedChats((res || []).slice(0, BATCH_SIZE));
    } catch (error) {
      console.error("Error fetching chats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getChats();
  }, []);

  const formatMessage = (text = "") => {
    if (!text) return "";
    let formatted = text
      .replace(/\*(.*?)\*/g, "<strong>$1</strong>")
      .replace(/_(.*?)_/g, "<em>$1</em>")
      .replace(/~(.*?)~/g, "<s>$1</s>")
      .replace(/`(.*?)`/g, "<code>$1</code>")
      .replace(/\n/g, "<br/>");
    return DOMPurify.sanitize(formatted);
  };

  const renderMessages = (messages = []) => (
    <div className="flex flex-col gap-4">
      {messages.map((msg, i) => {
        const isHuman = msg.isUser;
        return (
          <div
            key={i}
            className={`flex items-end gap-2 ${
              isHuman ? "self-start" : "self-end flex-row-reverse"
            }`}
          >
            <div className="w-8 h-8 flex items-center justify-center bg-primary/10 rounded-full">
              {isHuman ? <User size={18} /> : <Bot size={18} />}
            </div>

            <div className="md:max-w-[60%] flex-col flex gap-2 max-w-[80%] " >
              <div
                className={` px-3 py-2 rounded-lg text-sm leading-relaxed break-words ${
                  isHuman
                    ? "bg-muted text-foreground rounded-bl-none"
                    : "bg-primary/20 text-white rounded-br-none"
                }`}
                dangerouslySetInnerHTML={{
                  __html: formatMessage(msg?.textBody),
                }}
              />

              <p className="text-[10px]" >{msg?.time}</p>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );

  const filteredChats = displayedChats.filter((chat) =>
    (chat?.name || chat?.sessionId)
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <section className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <div
        className={`flex flex-col w-full md:w-[30%] border-r border-border transition-all duration-300 ${
          showChat ? "hidden md:flex" : "flex"
        }`}
      >
        <div className="flex justify-between items-center p-5 border-b border-border bg-secondary">
          <p className="text-lg font-semibold text-primary">Chats</p>
          <div className="flex gap-2">
            <RefreshCw className="w-4 h-4 cursor-pointer" onClick={getChats} />
            <Plus
              className="w-4 h-4 cursor-pointer"
              onClick={() => setShowAddContact(true)}
            />
          </div>
        </div>

        <div className="p-3">
          <div className="flex items-center gap-2 bg-muted px-3 py-1 rounded-full">
            <Search size={16} />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none text-sm focus-visible:ring-0"
              placeholder="Search chats..."
            />
          </div>
        </div>
        <div
          ref={chatListRef}
          className="overflow-y-auto px-2 gap-2 flex flex-col scrollbar-thin scrollbar-thumb-muted/40"
        >
          {loading ? (
            <p className="text-center text-sm text-muted-foreground py-4">
              Loading...
            </p>
          ) : showContacts ? (
            // 👥 Dummy Contacts UI
            <>
              {[
                "Aarav Sharma",
                "Priya Patel",
                "Rohit Mehta",
                "Simran Kaur",
              ].map((name, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer"
                >
                  <div className="bg-primary/10 p-2 rounded-full w-12 h-12 grid place-items-center">
                    <User />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{name}</p>
                    <p className="text-xs text-muted-foreground">
                      Tap to start a chat
                    </p>
                  </div>
                  <Edit
                    className="w-4 h-4 text-muted-foreground hover:text-primary cursor-pointer"
                    onClick={() => setShowEditContact(true)}
                  />
                </div>
              ))}
            </>
          ) : filteredChats.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-4">
              No chats found
            </p>
          ) : (
            filteredChats.map((chat) => (
              <div
                key={chat?._id}
                onClick={() => {
                  setSelectedChat(chat);
                  setShowChat(true);
                }}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                  selectedChat?._id === chat?._id
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-muted"
                }`}
              >
                {chat?.avatar ? (
                  <img
                    src={chat.avatar}
                    alt={chat.name || chat.sessionId}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <div className="bg-primary/10 p-2 rounded-full w-12 h-12 grid place-items-center">
                    <User />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className="font-medium truncate">
                      {chat?.userName || "+" + chat?.sessionId}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {chat?.messages?.at(-1)?.data?.content?.length > 50
                      ? chat?.messages?.at(-1)?.data?.content.slice(0, 50) +
                        "..."
                      : chat?.messages?.at(-1)?.data?.content || ""}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Chat Section */}
      <div className="flex flex-col w-full md:w-[70%]">
        {!selectedChat ? (
          <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm">
            💬 <span className="ml-2">Select a chat to start messaging...</span>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 p-4 border-b bg-secondary">
              <button onClick={() => setShowChat(false)} className="md:hidden">
                <ArrowLeft size={18} />
              </button>
              <div className="bg-primary/10 w-10 h-10 grid place-items-center rounded-full">
                <User />
              </div>
              <p className="font-medium">
                {selectedChat?.userName || "+" + selectedChat?.sessionId}
              </p>
            </div>

            <div className="flex-1 p-5 overflow-y-auto">
              {renderMessages(selectedChat?.Messages)}
            </div>

            <div className="flex items-center gap-3 p-4 border-t">
              <Input placeholder="Type a message..." className="flex-1" />
              <Button>Send</Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
