import { io, Socket } from 'socket.io-client'
import type { ChatMessage } from './llm'

// ─── Socket Configuration ─────────────────────────────────────────────────

const DEFAULT_SOCKET_URL = 'http://localhost:3001'

export function getSocketURL(): string {
  return localStorage.getItem('socket-url') ?? DEFAULT_SOCKET_URL
}

export function setSocketURL(url: string) {
  localStorage.setItem('socket-url', url)
}

// ─── Socket Manager ───────────────────────────────────────────────────────

class SocketManager {
  private socket: Socket | null = null
  private isConnecting = false

  async connect(): Promise<boolean> {
    if (this.socket?.connected) return true
    if (this.isConnecting) return false

    this.isConnecting = true
    try {
      const url = getSocketURL()
      this.socket = io(url, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        transports: ['websocket', 'polling'],
      })

      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          this.isConnecting = false
          resolve(false)
        }, 3000)

        this.socket!.on('connect', () => {
          clearTimeout(timeout)
          this.isConnecting = false
          resolve(true)
        })

        this.socket!.on('connect_error', () => {
          clearTimeout(timeout)
          this.isConnecting = false
          resolve(false)
        })
      })
    } catch {
      this.isConnecting = false
      return false
    }
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false
  }

  disconnect() {
    this.socket?.disconnect()
    this.socket = null
  }

  getSocket(): Socket | null {
    return this.socket
  }
}

export const socketManager = new SocketManager()

// ─── Stream Chat via Socket ───────────────────────────────────────────────

export interface StreamChatOptions {
  messages: ChatMessage[]
  onToken?: (token: string) => void
  onComplete?: (fullText: string) => void
  onError?: (error: string) => void
}

export async function* streamChatSocket(options: StreamChatOptions): AsyncGenerator<string> {
  const { messages, onToken, onComplete, onError } = options

  const connected = await socketManager.connect()
  if (!connected) {
    const error = 'Socket connection failed'
    onError?.(error)
    throw new Error(error)
  }

  const socket = socketManager.getSocket()
  if (!socket) {
    const error = 'Socket not initialized'
    onError?.(error)
    throw new Error(error)
  }

  const tokens: string[] = []
  let hasError: string | null = null

  await new Promise<void>((resolve, reject) => {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    let resolved = false

    // Listen for token stream
    socket.on(`chat_token_${requestId}`, (data: { token: string }) => {
      tokens.push(data.token)
      onToken?.(data.token)
    })

    // Listen for completion
    socket.on(`chat_complete_${requestId}`, (data: { text: string }) => {
      if (!resolved) {
        resolved = true
        onComplete?.(data.text)
        socket.off(`chat_token_${requestId}`)
        socket.off(`chat_complete_${requestId}`)
        socket.off(`chat_error_${requestId}`)
        resolve()
      }
    })

    // Listen for errors
    socket.on(`chat_error_${requestId}`, (data: { error: string }) => {
      if (!resolved) {
        resolved = true
        hasError = data.error
        onError?.(data.error)
        socket.off(`chat_token_${requestId}`)
        socket.off(`chat_complete_${requestId}`)
        socket.off(`chat_error_${requestId}`)
        reject(new Error(data.error))
      }
    })

    // Send chat request
    socket.emit('chat', { requestId, messages })
  })

  // Yield all collected tokens
  for (const t of tokens) {
    yield t
  }

  if (hasError) {
    throw new Error(hasError)
  }
}

export async function chatSocket(messages: ChatMessage[]): Promise<string> {
  let result = ''
  try {
    for await (const _ of streamChatSocket({
      messages,
      onToken: (token) => {
        result += token
      },
    })) {
      // consume the generator
    }
  } catch (error) {
    throw error
  }
  return result
}

// ─── Health Check ─────────────────────────────────────────────────────────

export async function checkSocketConnection(): Promise<boolean> {
  return socketManager.connect()
}

export function isSocketConnected(): boolean {
  return socketManager.isConnected()
}

export function disconnectSocket() {
  socketManager.disconnect()
}
