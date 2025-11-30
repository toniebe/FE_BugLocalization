"use client";

import { useState, useRef, useEffect } from "react";

const API_BASE_URL = process.env.CHATBOT_API_BASE_URL || "http://localhost:8000";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi — Saya Asistan Virtual EasyFix. Tanyakan kepada saya apapun tentang EasyFix. \n\n Contoh : \n - Apa itu EasyFix? \n - Bagaimana cara Create Account? \n - Bagaimana cara mencari bug?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  function toggleOpen() {
    setIsOpen((prev) => !prev);
  }

  async function handleSend(e) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMsg = { role: "user", content: trimmed };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // If using Firebase auth, include header: Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          question: trimmed,
          history: newMsgs.map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      const data = await res.json();
      const assistantMsg = {
        role: "assistant",
        content: data.answer || "No answer from backend."
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error("Chatbot error:", err);
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "Oops, something went wrong. Please try again." }
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={toggleOpen}
        className="fixed bottom-6 right-6 z-50 rounded-full px-4 py-3 bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-colors"
      >
        {isOpen ? "Close Chat" : "ChatBot EasyFix"}
      </button>

      {isOpen && (
        <div className="fixed bottom-20 right-6 z-50 w-80 sm:w-96 h-96 bg-white border border-gray-200 rounded-xl shadow-xl flex flex-col overflow-hidden">
          <div className="px-4 py-2 bg-gray-100 border-b border-gray-200 flex justify-between items-center">
            <div className="font-semibold text-sm">EasyFix Chatbot</div>
            <button onClick={toggleOpen} className="text-xs text-gray-500 hover:text-gray-700">✕</button>
          </div>

          <div className="flex-1 px-3 py-2 overflow-y-auto bg-gray-50 space-y-2 text-sm">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`} style={{ whiteSpace: 'pre-line' }}>
                <div className={`max-w-[80%] rounded-lg px-3 py-2 ${
                  m.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-900 border border-gray-200"
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg px-3 py-2 bg-white text-gray-500 border border-gray-200 italic">
                  Thinking…
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form onSubmit={handleSend} className="border-t border-gray-200 p-2 flex gap-2">
            <input
              type="text"
              placeholder="Ask about bugs, commits, developers..."
              className="flex-1 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-3 py-1 rounded-md bg-blue-600 text-white disabled:opacity-60 disabled:cursor-not-allowed text-sm"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}
