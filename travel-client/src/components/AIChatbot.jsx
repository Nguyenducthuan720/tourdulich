import React, { useState, useEffect, useRef } from 'react';
// Import AuthContext hiện tại của bạn để đồng bộ hóa thông tin người dùng đã đăng nhập
// Điều này giúp Backend tự động map UserID và cá nhân hóa lời chào của AI
import { useAuth } from '../context/AuthContext'; 

export default function AIChatbot() {
    const { user } = useAuth(); // Lấy thông tin user đăng nhập từ Context (nếu có)
    const [isOpen, setIsOpen] = useState(false); // Trạng thái đóng/mở khung chat
    const [messages, setMessages] = useState([
        { sender: 'assistant', message: 'Xin chào! Tôi là TravelAI. Bạn cần tôi gợi ý lịch trình hay tư vấn thông tin tour nào hôm nay?', timestamp: new Date() }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [sessionId, setSessionId] = useState('');
    const messagesEndRef = useRef(null);

    // Tự động sinh ra hoặc lấy lại Session ID duy nhất cho phiên truy cập này
    useEffect(() => {
        let storedSessionId = sessionStorage.getItem('ai_session_id');
        if (!storedSessionId) {
            storedSessionId = 'SESS-' + Math.random().toString(36).substr(2, 9).toUpperCase();
            sessionStorage.setItem('ai_session_id', storedSessionId);
        }
        setSessionId(storedSessionId);
    }, []);

    // Tự động cuộn xuống dưới cùng khi có tin nhắn mới
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputValue.trim() || isTyping) return;

        const userMessage = inputValue;
        setInputValue('');
        
        // Thêm tin nhắn của User vào danh sách hiển thị
        setMessages(prev => [...prev, { sender: 'user', message: userMessage, timestamp: new Date() }]);
        setIsTyping(true);

        try {
            const response = await fetch('http://localhost:5000/api/ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    session_id: sessionId,
                    user_id: user ? user.UserID : null, // Truyền UserID từ SQL Server sang nếu đã đăng nhập
                    message: userMessage
                })
            });

            const data = await response.json();
            
            if (response.ok) {
                setMessages(prev => [...prev, { sender: 'assistant', message: data.reply, timestamp: new Date() }]);
            } else {
                setMessages(prev => [...prev, { sender: 'assistant', message: 'Hệ thống đang bận cập nhật dữ liệu tour. Bạn vui lòng thử lại sau nhé!', timestamp: new Date() }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, { sender: 'assistant', message: 'Không thể kết nối tới máy chủ AI. Vui lòng kiểm tra lại kết nối mạng!', timestamp: new Date() }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 font-sans">
            {/* Nút Bong Bóng Chat hình tròn (Khi đang đóng) */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg transition-all duration-300 hover:scale-110 hover:bg-brand-700 focus:outline-none"
                    title="Trò chuyện với AI tư vấn"
                >
                    {/* Icon Robot SVG */}
                    <svg className="h-7 w-7 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                </button>
            )}

            {/* Khung Chat AI (Khi nhấn mở) */}
            {isOpen && (
                <div className="flex h-[550px] w-[380px] flex-col rounded-2xl bg-white shadow-2xl transition-all duration-300 border border-ink-100 sm:w-[400px]">
                    {/* Header Khung Chat */}
                    <div className="flex items-center justify-between rounded-t-2xl bg-gradient-to-r from-brand-600 to-brand-700 p-4 text-white shadow-md">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white bg-opacity-20 font-bold">
                                AI
                            </div>
                            <div>
                                <h4 className="text-sm font-bold">Trợ lý Lữ hành thông minh</h4>
                                <div className="flex items-center gap-1.5 text-[11px] text-brand-100">
                                    <span className="h-2 w-2 rounded-full bg-green-400 animate-ping"></span>
                                    <span>Hỗ trợ trực tuyến 24/7</span>
                                </div>
                            </div>
                        </div>
                        {/* Nút Đóng Khung Chat */}
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="text-white opacity-80 hover:opacity-100 focus:outline-none"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Vùng hiển thị nội dung tin nhắn */}
                    <div className="flex-1 overflow-y-auto bg-cream p-4 space-y-4">
                        {messages.map((msg, idx) => (
                            <div 
                                key={idx} 
                                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div 
                                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                                        msg.sender === 'user' 
                                            ? 'bg-brand-600 text-white rounded-tr-none' 
                                            : 'bg-white text-ink-800 border border-ink-100 rounded-tl-none'
                                    }`}
                                    style={{ whiteSpace: 'pre-line' }} // Bảo lưu định dạng xuống dòng lịch trình của AI
                                >
                                    {msg.message}
                                </div>
                            </div>
                        ))}
                        
                        {/* Hiệu ứng đang gõ chữ của AI */}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="flex items-center gap-1 bg-white border border-ink-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm text-xs text-cream0 font-medium">
                                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-500" style={{ animationDelay: '0ms' }}></span>
                                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-500" style={{ animationDelay: '150ms' }}></span>
                                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-500" style={{ animationDelay: '300ms' }}></span>
                                    <span className="ml-1">TravelAI đang lên lịch trình...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Form gửi tin nhắn phía dưới */}
                    <form onSubmit={handleSend} className="border-t border-ink-100 p-3 bg-white flex gap-2 items-center">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Hỏi về địa điểm, giá vé hoặc lịch trình..."
                            disabled={isTyping}
                            className="flex-1 rounded-xl border border-ink-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-brand-500 disabled:bg-cream"
                        />
                        <button
                            type="submit"
                            disabled={isTyping}
                            className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-brand-700 disabled:bg-ink-300"
                        >
                            Gửi
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}