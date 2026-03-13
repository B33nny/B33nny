import { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ConversationMessage } from '../../hooks/useLLMConversation'

interface ConversationUIProps {
  messages: ConversationMessage[]
  streaming: boolean
  error: string | null
  connected: boolean | null
  onSend: (text: string) => void
  inputValue: string
  onInputChange: (v: string) => void
  disabled?: boolean
  placeholder?: string
  personaName?: string
}

export function ConversationUI({
  messages,
  streaming,
  error,
  connected,
  onSend,
  inputValue,
  onInputChange,
  disabled = false,
  placeholder = 'Type your response…',
  personaName = 'They',
}: ConversationUIProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || streaming || disabled) return
    onSend(inputValue.trim())
    onInputChange('')
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Connection status */}
      {connected === false && (
        <div className="bg-[#ff3366]/10 border border-[#ff3366]/30 rounded-xl p-3 text-xs text-[#ff3366]">
          <p className="font-semibold mb-1">Ollama not connected</p>
          <p className="text-[#8892b0]">
            Start Ollama locally: <code className="bg-[#0f0f1a] px-1 py-0.5 rounded">ollama run llama3.2</code><br />
            Or switch to a fallback scenario below.
          </p>
        </div>
      )}

      {/* Message thread */}
      <div className="flex flex-col gap-3 max-h-[50vh] overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {messages.map(msg => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[#00d4ff]/15 border border-[#00d4ff]/20 text-white rounded-br-sm'
                  : 'bg-[#1e2a4a] border border-[#2a3a5e] text-[#b0b8cc] rounded-bl-sm'
              }`}>
                {msg.role === 'assistant' && (
                  <p className="text-[10px] font-mono text-[#8892b0] mb-1 uppercase tracking-wider">
                    {personaName}
                  </p>
                )}
                <p>{msg.content || (streaming ? '…' : '')}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-[#ff3366] px-1">{error}</p>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={e => onInputChange(e.target.value)}
          placeholder={placeholder}
          disabled={streaming || disabled}
          className="flex-1 bg-[#16213e] border border-[#1e2a4a] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#3a3a5e] focus:outline-none focus:border-[#00d4ff]/50 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || streaming || disabled}
          className="bg-[#00d4ff] text-[#0f0f1a] font-bold px-4 py-3 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed shrink-0 text-sm"
        >
          {streaming ? '…' : 'Send'}
        </button>
      </form>
    </div>
  )
}
