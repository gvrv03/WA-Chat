"use client";
import { useEffect, useRef, useState } from "react";
import { FetchDataToCollection } from "@/actions/CRUDAction";
import { useStore } from "@/context/StoreContext";
import DOMPurify from "dompurify";
import {
  User,
  Bot,
} from "lucide-react";
import ChatMenu from "@/components/WhatsApp/ChatMenu";
import ChatList from "@/components/WhatsApp/ChatList";

export default function Home() {
  const [chats, setChats] = useState([]);
  const [displayedChats, setDisplayedChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showChat, setShowChat] = useState(false);
  const messagesEndRef = useRef(null);
  const { selectedAppDetails } = useStore();
  const BATCH_SIZE = 10;

  /** ✅ Auto Scroll to Latest Message */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedChat?.Messages]);

  /** ✅ Fetch Chats from DB */
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

  /** ✅ Date Formatter (Today, Yesterday, etc.) */
  const formatDateLabel = (dateString) => {
    if (!dateString) return "";
    const mDate = new Date(dateString).setHours(0, 0, 0, 0);
    const tDate = new Date().setHours(0, 0, 0, 0);
    const yDate = new Date(Date.now() - 86400000).setHours(0, 0, 0, 0);
    const tmDate = new Date(Date.now() + 86400000).setHours(0, 0, 0, 0);

    if (mDate === tDate) return "Today";
    if (mDate === yDate) return "Yesterday";
    if (mDate === tmDate) return "Tomorrow";

    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  /** ✅ Format Text (Bold, Code, Linebreaks, etc.) */
  const formatMessage = (text = "") => {
    return DOMPurify.sanitize(
      text
        .replace(/\*(.*?)\*/g, "<strong>$1</strong>")
        .replace(/_(.*?)_/g, "<em>$1</em>")
        .replace(/~(.*?)~/g, "<s>$1</s>")
        .replace(/`(.*?)`/g, "<code>$1</code>")
        .replace(/\n/g, "<br/>")
    );
  };

  /** ✅ Render Messages with Date Separators */
  const renderMessages = (messages = []) => (
    <div className="flex flex-col gap-4">
      {messages.map((msg, i) => {
        const isHuman = msg.isUser;
        const currentDate = formatDateLabel(msg.date);
        const previousDate =
          i > 0 ? formatDateLabel(messages[i - 1].date) : null;

        return (
          <div key={i}>
            {currentDate !== previousDate && (
              <div className="text-center mb-2 w-full grid place-items-center my-2 font-semibold text-xs">
                <p className=" text-primary w-fit p-1 bg-primary/10 px-5  border rounded-full ">
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
                  className={`px-3 py-2 rounded-lg text-sm leading-relaxed break-words ${
                    isHuman
                      ? "bg-muted text-foreground rounded-bl-none"
                      : "bg-primary/20 text-white rounded-br-none"
                  }`}
                  dangerouslySetInnerHTML={{
                    __html: formatMessage(msg?.textBody),
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
  );

  const filteredChats = displayedChats.filter((chat) =>
    (chat?.userName || chat?.sessionId || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <section className="flex h-screen flex-col md:flex-row bg-background text-foreground ">
      <ChatList
        showChat={showChat}
        getChats={getChats}
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
        setShowChat={setShowChat}
        setSelectedChat={setSelectedChat}
        renderMessages={renderMessages}
      />
    </section>
  );
}
