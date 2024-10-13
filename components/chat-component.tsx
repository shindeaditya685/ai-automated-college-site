"use client";

import React from "react";
import { useChat } from "ai/react";
import MessageBox from "./message-box";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { CornerDownLeft, Loader2 } from "lucide-react";

const ChatComponent = () => {
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: "api/college-chat-gemini",
    });

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] sm:h-[calc(100vh-5rem)] bg-muted/50 rounded-xl p-2 sm:p-4 gap-4">
      <div className="flex-1 overflow-auto">
        <div className="flex flex-col gap-4">
          {messages.map((m, idx) => (
            <MessageBox key={idx} role={m.role} content={m.content} />
          ))}
        </div>
      </div>
      <form
        className="relative overflow-hidden rounded-lg border bg-background"
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmit();
        }}
      >
        <Textarea
          value={input}
          onChange={handleInputChange}
          placeholder="Type query here..."
          className="min-h-12 resize-none border-0 p-3 shadow-none focus-visible:ring-0"
        />
        <div className="flex items-center p-2 sm:p-3 pt-0">
          <Button
            disabled={isLoading}
            className="ml-auto"
            type="submit"
            size="sm"
          >
            {isLoading ? "Analyzing..." : "Ask"}
            {isLoading ? (
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            ) : (
              <CornerDownLeft className="ml-2 h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatComponent;
