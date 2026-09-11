import React, { useState, useRef, useEffect } from "react";

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Namaste! I am the Samvad-Setu Civic Assistant. How can I help you today?", isBot: true }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { text: userMessage, isBot: false }]);
    setInput("");
    setIsLoading(true);

    try {
      // Get the token from local storage if available
      const token = localStorage.getItem("token") || "";

      const res = await fetch("http://localhost:5001/api/chatbot/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await res.json();
      
      setMessages((prev) => [
        ...prev, 
        { 
          text: data.answer || data.response || "Sorry, I couldn't process your request.", 
          isBot: true 
        }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev, 
        { text: "Sorry, the AI service is currently unavailable.", isBot: true }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 p-4 rounded-full bg-[#E8A33D] hover:bg-[#d99532] text-[#0F1B1E] shadow-xl z-50 transition-all hover:scale-105 active:scale-95"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 sm:w-96 h-[32rem] bg-[#16262A] border border-[#1D3238] rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-200">
          {/* Header */}
          <div className="bg-[#0F1B1E] border-b border-[#1D3238] p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-[#E8A33D] flex items-center justify-center">
                <span className="text-[#0F1B1E] font-bold">AI</span>
              </div>
              <div>
                <h3 className="text-[#F2EFE9] font-semibold text-sm">Civic Assistant</h3>
                <p className="text-[#2F9E8F] text-xs flex items-center">
                  <span className="w-2 h-2 rounded-full bg-[#2F9E8F] mr-1 animate-pulse"></span>
                  Online
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-[#9BA8A6] hover:text-[#F2EFE9]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#16262A]/50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.isBot ? "justify-start" : "justify-end"}`}>
                <div 
                  className={`max-w-[80%] rounded-2xl p-3 text-sm ${
                    msg.isBot 
                      ? "bg-[#1D3238] text-[#F2EFE9] rounded-tl-none" 
                      : "bg-[#2F9E8F] text-white rounded-tr-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#1D3238] rounded-2xl rounded-tl-none p-3 max-w-[80%] flex space-x-2">
                  <div className="w-2 h-2 bg-[#9BA8A6] rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-[#9BA8A6] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-[#9BA8A6] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-[#0F1B1E] border-t border-[#1D3238]">
            <form onSubmit={handleSend} className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question..."
                className="flex-1 bg-[#16262A] border border-[#1D3238] text-[#F2EFE9] rounded-full px-4 py-2 focus:outline-none focus:border-[#E8A33D] text-sm"
              />
              <button 
                type="submit"
                disabled={isLoading || !input.trim()}
                className="w-10 h-10 rounded-full bg-[#E8A33D] text-[#0F1B1E] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#d99532] transition-colors"
              >
                <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
