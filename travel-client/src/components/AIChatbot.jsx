import { useEffect, useRef, useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import apiClient from '../api/client'

const WELCOME = {
  sender: 'assistant',
  message:
    'Xin chào! Tôi là TravelAI. Bạn cần tôi gợi ý lịch trình hay tư vấn thông tin tour nào hôm nay?',
  timestamp: new Date(),
}

const QUICK_PROMPTS = [
  'Tour Đà Nẵng có gì đặc biệt?',
  'Tour dưới 3 triệu cho gia đình',
  'Gợi ý tour nghỉ dưỡng biển',
]

const SESSION_KEY = 'ai_session_id'

export default function AIChatbot() {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([WELCOME])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [sessionId, setSessionId] = useState('')
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const messagesEndRef = useRef(null)

  const userId = user?.id ?? user?.UserID ?? null

  // Lấy/tạo session_id (localStorage để giữ qua nhiều lần truy cập)
  useEffect(() => {
    let stored = localStorage.getItem(SESSION_KEY)
    if (!stored) {
      stored = 'SESS-' + Math.random().toString(36).slice(2, 11).toUpperCase()
      localStorage.setItem(SESSION_KEY, stored)
    }
    setSessionId(stored)
  }, [])

  // Khôi phục lịch sử hội thoại khi mở khung chat lần đầu
  const loadHistory = useCallback(async () => {
    if (!sessionId || historyLoaded) return
    try {
      const res = await apiClient.get(`/ai/history/${sessionId}`)
      const data = res.data
      if (Array.isArray(data?.conversations) && data.conversations.length > 0) {
        setMessages([
          WELCOME,
          ...data.conversations.map((c) => ({
            sender: c.sender === 'user' ? 'user' : 'assistant',
            message: c.message,
            timestamp: c.timestamp ? new Date(c.timestamp) : new Date(),
          })),
        ])
      }
    } catch {
      // Không có lịch sử hoặc lỗi mạng -> giữ lời chào mặc định
    } finally {
      setHistoryLoaded(true)
    }
  }, [sessionId, historyLoaded])

  useEffect(() => {
    if (isOpen) loadHistory()
  }, [isOpen, loadHistory])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const sendMessage = async (text) => {
    const userMessage = String(text || '').trim()
    if (!userMessage || isTyping) return

    setInputValue('')
    setMessages((prev) => [...prev, { sender: 'user', message: userMessage, timestamp: new Date() }])
    setIsTyping(true)

    try {
      const res = await apiClient.post('/ai/chat', {
        session_id: sessionId,
        user_id: userId,
        message: userMessage,
      })
      setMessages((prev) => [
        ...prev,
        { sender: 'assistant', message: res.data?.reply || '(Không có phản hồi)', timestamp: new Date() },
      ])
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          message:
            error?.message?.includes('kết nối') || error?.message?.includes('Network')
              ? 'Không thể kết nối tới máy chủ AI. Vui lòng kiểm tra lại kết nối mạng!'
              : 'Hệ thống đang bận cập nhật dữ liệu tour. Bạn vui lòng thử lại sau nhé!',
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  const handleSend = (e) => {
    e.preventDefault()
    sendMessage(inputValue)
  }

  const handleNewSession = async () => {
    // Xoá phiên hiện tại và tạo phiên mới
    const old = sessionId
    const next = 'SESS-' + Math.random().toString(36).slice(2, 11).toUpperCase()
    localStorage.setItem(SESSION_KEY, next)
    setSessionId(next)
    setMessages([WELCOME])
    setHistoryLoaded(true)
    try {
      if (old) await apiClient.delete(`/ai/session/${old}`)
    } catch {
      /* bỏ qua nếu không xoá được */
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg transition-all duration-300 hover:scale-110 hover:bg-brand-700 focus:outline-none"
          title="Trò chuyện với AI tư vấn"
        >
          <svg className="h-7 w-7 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      )}

      {isOpen && (
        <div className="flex h-[550px] w-[380px] flex-col rounded-2xl bg-white shadow-2xl transition-all duration-300 border border-ink-100 sm:w-[400px]">
          <div className="flex items-center justify-between rounded-t-2xl bg-gradient-to-r from-brand-600 to-brand-700 p-4 text-white shadow-md">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 font-bold">
                AI
              </div>
              <div>
                <h4 className="text-sm font-bold">Trợ lý Lữ hành thông minh</h4>
                <div className="flex items-center gap-1.5 text-[11px] text-brand-100">
                  <span className="h-2 w-2 rounded-full bg-green-400 animate-ping" />
                  <span>{userId ? `Xin chào ${user?.name || ''}`.trim() : 'Hỗ trợ trực tuyến 24/7'}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleNewSession}
                title="Cuộc trò chuyện mới"
                className="rounded-lg p-1.5 text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-cream p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-brand-600 text-white rounded-tr-none'
                      : 'bg-white text-ink-800 border border-ink-100 rounded-tl-none'
                  }`}
                  style={{ whiteSpace: 'pre-line' }}
                >
                  {msg.message}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1 bg-white border border-ink-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm text-xs text-ink-500 font-medium">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-500" style={{ animationDelay: '0ms' }} />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-500" style={{ animationDelay: '150ms' }} />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-500" style={{ animationDelay: '300ms' }} />
                  <span className="ml-1">TravelAI đang lên lịch trình...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {messages.length <= 1 && !isTyping && (
            <div className="border-t border-ink-100 bg-white px-3 pt-3">
              <div className="flex flex-wrap gap-2">
                {QUICK_PROMPTS.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700 transition hover:bg-brand-100"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

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
              disabled={isTyping || !inputValue.trim()}
              className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-brand-700 disabled:bg-ink-300"
            >
              Gửi
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
