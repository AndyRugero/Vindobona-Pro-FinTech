// 📥 1. IMPORT NECESSARY MODULES & TOOLS
import React, { useState, useEffect, useRef } from 'react';
// Lucide icons: MessageSquare = chat bubble icon, X = close icon, Send = send arrow icon, Bot = robot face icon
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
    timestamp: Date;        // The timestamp of the message
}

// 🏗️ 3. THE CHATBOT COMPONENT FUNCTION
const Chatbot: React.FC<ChatbotProps> = ({ token }) => {
    // 💾 React Memory State: Controls whether the chat popup window is visible (true) or hidden (false)
    const [isOpen, setIsOpen] = useState(false);

    // A. Stores the chat messages history. We initialize it with a bot welcome greeting.
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'init-msg',
            sender: 'bot',
            text: 'Hello! I am your Vindobona Pro AI Assistant. How can I help you with your finances today? 🏦',
            timestamp: new Date()
        }
    ]);
    // B. Stores the text currently being typed into the input field
    const [input, setInput] = useState('');
    // C. Controls whether the three typing dots loading animation is visible
    const [isTyping, setIsTyping] = useState(false);

    // 🎯 Reference to scroll the chatbot message box to the bottom automatically
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 🕵️‍♂️ Monitor message updates: Scrolls down smoothly whenever messages or typing state changes
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    // 🛫 HANDLER: Sends your typed question to the backend AI
    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault(); // Prevent the web page from reloading when the form is submitted
        if (!input.trim() || !token) return; // Stop if the input is empty or the user is not authenticated

        const userText = input.trim();
        setInput(''); // Instantly clear the input bar for the next question

        // 1. Add the User's message bubble to our state
        const userMessage: Message = {
            id: Date.now().toString(),
            sender: 'user',
            text: userText,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);

        // 2. Turn on the typing spinner dots
        setIsTyping(true);

        try {
            // 3. Post user query to backend API '/api/chat'
            const response = await fetch(`${API_BASE_URL}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Provide our secure JWT token
                },
                body: JSON.stringify({ message: userText })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Server returned an error.');
            }

            // 4. Add the AI's reply bubble to our state
            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                sender: 'bot',
                text: data.reply || "I couldn't process your request at this moment.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, botMessage]);

        } catch (error: any) {
            console.error('Chat connection failure:', error);
            // 5. If server is down, show a help error bubble
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                sender: 'bot',
                text: '⚠️ Sorry, I am having trouble connecting to the server. Please try again.',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            // 6. Turn off the typing spinner dots
            setIsTyping(false);
        }
    };

    return (
        <>
            {/* 🤖 FLOATING ACTION BUTTON (FAB) */}
            <button 
                className="chatbot-fab" 
                onClick={() => setIsOpen(!isOpen)} 
                title="Ask AI Assistant"
            >
                {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
            </button>

            {/* 💬 THE POPUP CHAT WINDOW CONTAINER */}
            {isOpen && (
                <div className="chatbot-window">
                    
                    {/* Header bar */}
                    <div className="chatbot-header">
                        <div className="chatbot-header-info">
                            <Bot size={22} color="#06b6d4" />
                            <div>
                                <h4>Chat Assistant</h4>
                                <span className="chatbot-status">Active</span>
                            </div>
                        </div>

                        <button className="chatbot-close-btn" onClick={() => setIsOpen(false)}>
                            <X size={18} />
                        </button>
                    </div>

                    {/* Messages Board */}
                    <div className="chatbot-messages">
                        {/* Loop through all message bubbles and display them */}
                        {messages.map(msg => (
                            <div key={msg.id} className={`chat-bubble ${msg.sender}`}>
                                {msg.text}
                            </div>
                        ))}

                        {/* Show typing loader dots */}
                        {isTyping && (
                            <div className="typing-indicator">
                                <span className="typing-dot"></span>
                                <span className="typing-dot"></span>
                                <span className="typing-dot"></span>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input form */}
                    {/* Wrapping the input and button inside a <form> lets you press Enter to send */}
                    <form onSubmit={handleSend} className="chatbot-input-area">
                        <input 
                            type="text" 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type a message..." 
                            disabled={isTyping} 
                        />
                        <button 
                            type="submit"
                            className="chatbot-send-btn"
                            disabled={isTyping || !input.trim()}
                        >
                            <Send size={18} />
                        </button>
                    </form>

                </div>
            )}
        </>
    );
};

export default Chatbot;