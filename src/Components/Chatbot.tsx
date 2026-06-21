// 📥 1. IMPORT NECESSARY MODULES & TOOLS
import React, { useState, useEffect, useRef } from 'react';
// Lucide icons: MessageSquare = chat bubble, X = close, Send = send arrow, Bot = robot face
import { MessageSquare, X, Send, Bot } from 'lucide-react';
// CSS file keeps our styling separate from the TypeScript logic
import '../Styles/Chatbot.css';
// Config file holds the backend API address
import { API_BASE_URL } from '../config';

// 📐 2. TYPESCRIPT CONTRACTS (INTERFACES)
interface ChatbotProps {
    token: string | null; // JWT security token of the logged-in user
}

interface Message {
    id: string;             // Unique ID tag for each message
    sender: 'user' | 'bot'; // Determines who sent it (User or AI Assistant)
    text: string;           // The text contents of the message
    timestamp: Date;        // The time the message was sent
}

// 💡 Preset quick-questions shown as clickable chips in the chat
const QUICK_QUESTIONS = [
    '💰 What is my current balance?',
    '📊 Show me my spending by category',
    '💱 How does the FX Converter work?',
    '🔒 How secure is my account?',
    '💳 How do I freeze my card?',
    '📈 What is a budget limit?',
];

// 🏗️ 3. THE CHATBOT COMPONENT FUNCTION
const Chatbot: React.FC<ChatbotProps> = ({ token }) => {
    // 💾 Controls whether the chat popup window is open or closed
    const [isOpen, setIsOpen] = useState(false);

    // A. Stores the full chat message history. Initialized with a welcome greeting.
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'init-msg',
            sender: 'bot',
            text: 'Hi! I am Andy, your Vindobona Pro AI Assistant 🏦 Ask me anything about your account, or tap a quick question below!',
            timestamp: new Date()
        }
    ]);

    // B. The text currently typed in the input field
    const [input, setInput] = useState('');

    // C. Controls the three bouncing typing-dots animation
    const [isTyping, setIsTyping] = useState(false);

    // 🎯 Reference to auto-scroll the message box to the bottom
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to latest message whenever messages or typing state changes
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    // 🛫 Core send handler — works for both typed input AND quick-question chips
    const sendMessage = async (text: string) => {
        const trimmed = text.trim();
        if (!trimmed || !token) return;

        // Add the user's bubble immediately
        const userMessage: Message = {
            id: Date.now().toString(),
            sender: 'user',
            text: trimmed,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);
        setInput('');        // Clear input box
        setIsTyping(true);  // Show typing animation

        try {
            // Post the message to the backend AI endpoint
            const response = await fetch(`${API_BASE_URL}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ message: trimmed })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Server returned an error.');
            }

            // Add Andy's reply bubble
            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                sender: 'bot',
                text: data.reply || "I couldn't process your request at this moment.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, botMessage]);

        } catch (error: unknown) {
            console.error('Chat connection failure:', error);
            // Show a friendly error bubble if the server is unreachable
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                sender: 'bot',
                text: '⚠️ Sorry, I am having trouble connecting right now. Please try again in a moment.',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false); // Hide typing animation
        }
    };

    // Form submit handler (pressing Enter or clicking Send)
    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(input);
    };

    // Quick-question chip click handler
    const handleQuickQuestion = (question: string) => {
        sendMessage(question);
    };

    return (
        <>
            {/* 🤖 FLOATING ACTION BUTTON (FAB) — Fixed circle in the bottom-right corner */}
            <button
                className="chatbot-fab"
                onClick={() => setIsOpen(!isOpen)}
                title="Chat with Andy"
            >
                {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
            </button>

            {/* 💬 THE POPUP CHAT WINDOW — only rendered when isOpen === true */}
            {isOpen && (
                <div className="chatbot-window">

                    {/* ── HEADER BAR ── */}
                    <div className="chatbot-header">
                        <div className="chatbot-header-info">
                            <Bot size={20} color="#06b6d4" />
                            <div>
                                {/* 🏷️ Title changed to "Chat with Andy" */}
                                <h4>Chat with Andy</h4>
                                <span className="chatbot-status">Active</span>
                            </div>
                        </div>
                        <button className="chatbot-close-btn" onClick={() => setIsOpen(false)}>
                            <X size={16} />
                        </button>
                    </div>

                    {/* ── MESSAGES BOARD ── */}
                    <div className="chatbot-messages">
                        {/* Render each message bubble */}
                        {messages.map(msg => (
                            <div key={msg.id} className={`chat-bubble ${msg.sender}`}>
                                {msg.text}
                            </div>
                        ))}

                        {/* Bouncing typing-dots shown while waiting for Andy's reply */}
                        {isTyping && (
                            <div className="typing-indicator">
                                <span className="typing-dot"></span>
                                <span className="typing-dot"></span>
                                <span className="typing-dot"></span>
                            </div>
                        )}

                        {/* Invisible anchor div — scrolled into view automatically */}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* ── QUICK QUESTION CHIPS ── */}
                    {/* Only shown when no conversation has started (just the welcome message) */}
                    {messages.length <= 1 && (
                        <div className="chatbot-quick-questions">
                            {QUICK_QUESTIONS.map((q) => (
                                <button
                                    key={q}
                                    className="quick-chip"
                                    onClick={() => handleQuickQuestion(q)}
                                    disabled={isTyping}
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* ── INPUT BAR ── */}
                    {/* Wrapping in <form> allows pressing Enter to send */}
                    <form onSubmit={handleSend} className="chatbot-input-area">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask Andy anything..."
                            disabled={isTyping}
                        />
                        <button
                            type="submit"
                            className="chatbot-send-btn"
                            disabled={isTyping || !input.trim()}
                        >
                            <Send size={16} />
                        </button>
                    </form>

                </div>
            )}
        </>
    );
};

export default Chatbot;