import { useRef, useEffect, useState } from 'react'
import { Send } from 'lucide-react'

export type ChatMessage = {
  id: string
  content: string
  senderId: string
  senderType?: string
  createdAt: string
}

type BookingChatProps = {
  messages: ChatMessage[]
  currentUserId: string
  otherPartyName: string
  onSend: (content: string) => void
  disabled?: boolean
  placeholder?: string
}

export function BookingChat({
  messages,
  currentUserId,
  otherPartyName,
  onSend,
  disabled = false,
  placeholder = 'Type a message...',
}: BookingChatProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const [draft, setDraft] = useState('')

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    const text = draft.trim()
    if (!text || disabled) return
    onSend(text)
    setDraft('')
  }

  return (
    <div className="flex flex-col h-full min-h-0 bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
      {/* Chat header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200 shrink-0">
        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold">
          {otherPartyName.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-slate-800">{otherPartyName}</p>
          <p className="text-xs text-slate-500">Chat about this booking</p>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[50vh] md:max-h-[400px]">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-slate-400 text-sm">
            <p>No messages yet.</p>
            <p className="mt-1">Send a message to start the conversation.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.senderId === currentUserId
            return (
              <div
                key={msg.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-2.5 ${
                    isOwn
                      ? 'bg-primary-600 text-white rounded-br-md'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-md shadow-card'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                  <p
                    className={`text-[10px] mt-1 ${
                      isOwn ? 'text-primary-200' : 'text-slate-400'
                    }`}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <form
        onSubmit={handleSubmit}
        className="flex gap-2 p-3 bg-white border-t border-slate-200 shrink-0"
      >
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSubmit()
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={disabled || !draft.trim()}
          className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
    </div>
  )
}
