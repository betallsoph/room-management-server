"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Send } from "lucide-react"
import {
  getConversations,
  getConversationHistory,
  sendMessage,
  getTimeAgo,
  type Conversation,
  type Message,
} from "@/lib/tenant-portal-service"

export default function MessagesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageText, setMessageText] = useState("")
  const [sending, setSending] = useState(false)
  const [token, setToken] = useState<string>("")

  useEffect(() => {
    const authToken = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    const role = localStorage.getItem("userRole") || sessionStorage.getItem("userRole")

    if (!authToken || role !== "tenant") {
      router.push("/login")
      return
    }

    setToken(authToken)
    loadConversations(authToken)
  }, [router])

  useEffect(() => {
    if (selectedConversation && token) {
      loadMessages(token, selectedConversation)
    }
  }, [selectedConversation, token])

  async function loadConversations(authToken: string) {
    try {
      setLoading(true)
      setError(null)
      const data = await getConversations(authToken)
      setConversations(data)
      
      // Auto-select first conversation if available
      if (data.length > 0 && !selectedConversation) {
        setSelectedConversation(data[0].conversationId)
      }
    } catch (err: any) {
      console.error("Failed to load conversations:", err)
      setError(err.message || "Không thể tải danh sách cuộc trò chuyện")
      
      if (err.message?.includes("Unauthorized")) {
        router.push("/login")
      }
    } finally {
      setLoading(false)
    }
  }

  async function loadMessages(authToken: string, conversationId: string) {
    try {
      const data = await getConversationHistory(authToken, conversationId)
      setMessages(data.messages.reverse()) // Reverse to show oldest first
    } catch (err: any) {
      console.error("Failed to load messages:", err)
      setError(err.message || "Không thể tải tin nhắn")
    }
  }

  async function handleSendMessage() {
    if (!messageText.trim() || !selectedConversation || !token) return

    const currentConversation = conversations.find(c => c.conversationId === selectedConversation)
    if (!currentConversation) return

    try {
      setSending(true)
      await sendMessage(token, {
        recipient: currentConversation.partnerId,
        content: messageText,
        messageType: 'text',
      })

      setMessageText("")
      // Reload messages
      await loadMessages(token, selectedConversation)
    } catch (err: any) {
      console.error("Failed to send message:", err)
      alert(err.message || "Không thể gửi tin nhắn")
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg font-bold uppercase">Đang tải...</div>
      </div>
    )
  }

  if (error && conversations.length === 0) {
    return (
      <div className="bg-destructive/10 neo-card p-4">
        <div className="text-destructive text-sm font-bold uppercase mb-1">Lỗi</div>
        <div className="text-xs text-muted-foreground">{error}</div>
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="bg-muted neo-card p-4 text-center">
        <div className="text-base font-bold uppercase mb-1">Chưa có cuộc trò chuyện nào</div>
        <div className="text-sm text-muted-foreground">Bạn chưa có tin nhắn với ai.</div>
      </div>
    )
  }

  const selectedConv = conversations.find(c => c.conversationId === selectedConversation)

  return (
    <div className="h-[calc(100vh-180px)] flex gap-4">
      {/* Conversation List */}
      <div className="w-full md:w-72 bg-card neo-card overflow-hidden flex flex-col">
        <div className="p-3 border-b-4 border-black">
          <h2 className="text-base font-bold uppercase">Tin Nhắn</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <button
              key={conv.conversationId}
              onClick={() => setSelectedConversation(conv.conversationId)}
              className={`w-full p-3 border-b-2 border-black text-left transition-all ${
                selectedConversation === conv.conversationId ? "bg-primary/20" : "hover:bg-muted/50"
              }`}
            >
              <div className="flex items-start gap-2">
                <div className="w-10 h-10 bg-primary neo-border flex items-center justify-center text-lg shrink-0">
                  👤
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-bold text-xs">{conv.partnerName}</div>
                    {conv.unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 bg-destructive text-destructive-foreground text-xs font-bold neo-border">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">{conv.partnerEmail}</div>
                  <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{conv.lastMessage}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{getTimeAgo(conv.lastMessageTime)}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-card neo-card overflow-hidden md:flex flex-col hidden">
        {selectedConv ? (
          <>
            {/* Chat Header */}
            <div className="p-3 border-b-4 border-black flex items-center gap-2">
              <div className="w-10 h-10 bg-primary neo-border flex items-center justify-center text-lg">
                👤
              </div>
              <div>
                <div className="font-bold text-sm">{selectedConv.partnerName}</div>
                <div className="text-xs text-muted-foreground">{selectedConv.partnerEmail}</div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.map((msg) => {
                const isSentByMe = msg.sender._id === localStorage.getItem("userId") || msg.sender._id === sessionStorage.getItem("userId")
                return (
                  <div key={msg._id} className={`flex ${isSentByMe ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-xs px-3 py-2 neo-border ${
                        isSentByMe ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                      }`}
                    >
                      <div className="text-xs">{msg.content}</div>
                      <div className="text-xs opacity-70 mt-1">
                        {new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Message Input */}
            <div className="p-3 border-t-4 border-black flex gap-2">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập tin nhắn..."
                className="flex-1 px-3 py-2 text-sm neo-input bg-background text-foreground"
                disabled={sending}
              />
              <button 
                onClick={handleSendMessage}
                disabled={sending || !messageText.trim()}
                className="bg-primary text-primary-foreground neo-button px-3 py-2 font-bold disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            Chọn một cuộc trò chuyện để bắt đầu
          </div>
        )}
      </div>
    </div>
  )
}
