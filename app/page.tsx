/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import ChatComponent from "@/components/chat-component";
import { ModeToggle } from "@/components/mode-toggle";

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <header className="sticky top-0 z-10 bg-background flex items-center justify-between border-b px-4 py-2 sm:py-3">
        <h1 className="text-lg sm:text-xl font-semibold">CampusAI</h1>
        <ModeToggle />
      </header>
      <main className="flex-1 overflow-auto p-2 sm:p-4">
        <div className="max-w-4xl mx-auto">
          <ChatComponent />
        </div>
      </main>
    </div>
  );
};

export default Home;
