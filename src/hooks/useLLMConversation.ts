import { useState, useCallback, useRef } from 'react'
import { streamChat } from '../services/llm'
import type { ChatMessage } from '../services/llm'
import { useSessionStore } from '../store/sessionStore'

export interface ConversationMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  patternTag?: string
  timestamp: string
}

interface UseLLMConversationOptions {
  systemPrompt: string
  regulationDeltaOnBait?: number    // how much meter rises when player takes bait
  regulationDeltaOnGood?: number    // how much meter drops on good response
  onMessage?: (msg: ConversationMessage) => void
}

export function useLLMConversation(options: UseLLMConversationOptions) {
  const { systemPrompt, regulationDeltaOnBait = 12, regulationDeltaOnGood = -5 } = options
  const [messages, setMessages] = useState<ConversationMessage[]>([])
  const [streaming, setStreaming] = useState(false)
  const [connected, setConnected] = useState<boolean | null>(null)   // null = unknown
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<boolean>(false)
  const { adjustRegulation, isFlooded } = useSessionStore()

  // Build messages array for API
  const buildAPIMessages = useCallback((
    history: ConversationMessage[],
    userMessage: string,
  ): ChatMessage[] => {
    return [
      { role: 'system', content: systemPrompt },
      ...history.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      { role: 'user', content: userMessage },
    ]
  }, [systemPrompt])

  const send = useCallback(async (userText: string) => {
    if (streaming || isFlooded) return

    const userMsg: ConversationMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: userText,
      timestamp: new Date().toISOString(),
    }

    const updatedHistory = [...messages, userMsg]
    setMessages(updatedHistory)
    setStreaming(true)
    setError(null)
    abortRef.current = false

    const assistantId = crypto.randomUUID()
    let assistantContent = ''

    // Optimistically add empty assistant message for streaming
    setMessages(prev => [...prev, {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
    }])

    try {
      const apiMessages = buildAPIMessages(messages, userText)

      for await (const token of streamChat(apiMessages)) {
        if (abortRef.current) break
        assistantContent += token
        setMessages(prev => prev.map(m =>
          m.id === assistantId ? { ...m, content: assistantContent } : m
        ))
      }

      setConnected(true)

      // Nudge regulation meter based on response length (proxy for engagement)
      // In AI levels, the game logic provides explicit adjustments
      adjustRegulation(regulationDeltaOnGood)

      options.onMessage?.({
        id: assistantId,
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date().toISOString(),
      })
    } catch {
      setConnected(false)
      setError('Could not reach the LLM. Make sure Ollama is running at the configured endpoint.')
      // Remove the empty assistant message on error
      setMessages(prev => prev.filter(m => m.id !== assistantId))
    } finally {
      setStreaming(false)
    }
  }, [messages, streaming, isFlooded, buildAPIMessages, adjustRegulation])

  const reset = useCallback(() => {
    abortRef.current = true
    setMessages([])
    setStreaming(false)
    setError(null)
  }, [])

  const addRegulationPressure = useCallback((delta: number) => {
    adjustRegulation(delta)
  }, [adjustRegulation])

  return {
    messages,
    streaming,
    connected,
    error,
    send,
    reset,
    addRegulationPressure,
    regulationDeltaOnBait,
  }
}
