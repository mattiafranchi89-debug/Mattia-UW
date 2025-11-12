
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { ExtractedData, ChatMessage } from '../types';

interface ChatbotProps {
  data: ExtractedData;
}

const getAiClient = (): GoogleGenAI | null => {
  const API_KEY = process.env.API_KEY;
  if (!API_KEY) {
    console.error("API_KEY is not configured.");
    return null;
  }
  return new GoogleGenAI({ apiKey: API_KEY });
};

export const Chatbot: React.FC<ChatbotProps> = ({ data }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
      { sender: 'model', text: 'Hello! I am RiskBot, your AI assistant. Ask me anything about the extracted data from the document.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize the chat session when data is available
    const ai = getAiClient();
    if (ai && data) {
        const systemInstruction = `You are a helpful AI assistant for an insurance underwriter. Your name is "RiskBot".
        Your purpose is to answer questions based *exclusively* on the following JSON data which represents extracted information from an insurance document.
        Do not use any external knowledge or make assumptions beyond what is provided in this data.
        If a question cannot be answered from the data, state that clearly. Keep your answers concise and professional.
        Format your answers for readability, using bullet points or bold text where helpful.

        Here is the risk data:
        ${JSON.stringify(data, null, 2)}
        `;
        
        chatRef.current = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.3
            }
        });
    }
  }, [data]);

  useEffect(() => {
    // Auto-scroll to the latest message
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !chatRef.current) return;

    const userMessage: ChatMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
        const response = await chatRef.current.sendMessage({ message: input });
        const modelMessage: ChatMessage = { sender: 'model', text: response.text };
        setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
        console.error("Chatbot error:", error);
        
        let errorMessageText = 'Sorry, I encountered an error. Please try again.';
        if (error instanceof Error) {
            const message = error.toString();
            if (message.includes('503') || message.includes('UNAVAILABLE') || message.includes('overloaded')) {
                errorMessageText = 'The AI assistant is currently overloaded. Please wait a moment before sending your message again.';
            }
        }
        
        const errorMessage: ChatMessage = { sender: 'model', text: errorMessageText };
        setMessages(prev => [...prev, errorMessage]);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-red-500 text-white rounded-full p-4 shadow-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-transform transform hover:scale-110 z-50"
        aria-label="Open chatbot"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>

      {/* Chat Window */}
      <div
        className={`fixed bottom-24 right-6 w-full max-w-md bg-white rounded-lg shadow-xl border border-gray-200 transition-all duration-300 ease-in-out z-50 ${
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        style={{ height: '70vh' }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <header className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200 rounded-t-lg">
            <h2 className="text-lg font-bold text-gray-800">Risk Q&amp;A</h2>
            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-800">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </header>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-xs md:max-w-sm lg:max-w-md px-4 py-2 rounded-2xl whitespace-pre-wrap ${
                      msg.sender === 'user' ? 'bg-red-500 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                 <div className="flex justify-start">
                    <div className="bg-gray-200 text-gray-800 rounded-2xl rounded-bl-none px-4 py-3">
                      <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                      </div>
                    </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question..."
                className="w-full pl-4 pr-12 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="absolute right-1 top-1/2 -translate-y-1/2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
