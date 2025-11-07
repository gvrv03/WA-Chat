import { Plus, RefreshCw, Search, User } from "lucide-react";
import React from "react";
import { Input } from "../ui/input";

const ChatList = ({showChat,getChats,searchTerm,setSearchTerm,loading,filteredChats,setShowChat,selectedChat,setSelectedChat,formatMessage}) => {
  return (
    <div
      className={`flex flex-col w-full md:w-[30%] border-r border-border transition-all duration-300 
      ${showChat ? "hidden md:flex" : "flex"} 
    `}
    >
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b bg-secondary">
        <p className="text-lg font-medium text-primary">WA Chats</p>
        <div className="flex gap-2">
          <RefreshCw size={18} className="cursor-pointer" onClick={getChats} />
          <Plus size={18} className="cursor-pointer" />
        </div>
      </div>

      {/* Search Box */}
      <div className="p-3">
        <div className="flex items-center gap-2 bg-muted px-3 py-2 rounded-full">
          <Search size={16} />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none text-sm focus-visible:ring-0 outline-none"
            placeholder="Search chats..."
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto px-2 pb-4 flex flex-col gap-2 scrollbar-thin scrollbar-thumb-muted/40">
        {loading ? (
          <p className="text-center text-sm text-muted-foreground py-4">
            Loading...
          </p>
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
              <div className="bg-primary/10 w-12 h-12 flex items-center justify-center rounded-full">
                <User />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {chat?.userName || "+" + chat?.sessionId}
                </p>
                <p
                  className="text-xs text-muted-foreground truncate"
                  dangerouslySetInnerHTML={{
                    __html: formatMessage(
                      chat?.Messages?.at(-1)?.textBody?.slice(0, 50) || ""
                    ),
                  }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatList;
