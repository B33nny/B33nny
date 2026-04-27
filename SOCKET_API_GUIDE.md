# Socket API Integration Guide

## Overview

**Signal & Static** now supports real-time communication via **Socket.IO**, replacing the local Ollama LLM dependency. The app uses a three-tier fallback system:

1. **Socket API** (preferred) — Real-time, low-latency communication
2. **Local LLM** (fallback) — Ollama endpoint for offline mode
3. **Scripted Dialogue** (fallback) — Pre-written responses when both above fail

---

## Architecture

### Socket Service (`src/services/socketService.ts`)

The socket service manages all WebSocket connections and provides a clean API for streaming chat responses.

#### Key Functions

```typescript
// Connection management
async connect(): Promise<boolean>
isConnected(): boolean
disconnect(): void

// Chat streaming
async function* streamChatSocket(options: StreamChatOptions): AsyncGenerator<string>
async function chatSocket(messages: ChatMessage[]): Promise<string>

// Health checks
async function checkSocketConnection(): Promise<boolean>
```

#### Configuration

Socket URL is stored in `localStorage` and can be configured via the Settings page:

```typescript
getSocketURL(): string  // Default: http://localhost:3001
setSocketURL(url: string): void
```

---

## Socket Events

### Client → Server

#### `chat` Event
Initiates a chat request.

**Payload:**
```json
{
  "requestId": "req_1234567890_abc123",
  "messages": [
    { "role": "system", "content": "..." },
    { "role": "user", "content": "..." }
  ]
}
```

### Server → Client

#### `chat_token_{requestId}` Event
Emitted for each token in the response stream.

**Payload:**
```json
{
  "token": "string"
}
```

#### `chat_complete_{requestId}` Event
Emitted when the response is complete.

**Payload:**
```json
{
  "text": "full response text"
}
```

#### `chat_error_{requestId}` Event
Emitted if an error occurs.

**Payload:**
```json
{
  "error": "error message"
}
```

---

## Server Implementation Example

### Node.js + Express + Socket.IO

```javascript
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const OpenAI = require('openai');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: { origin: '*' }
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

io.on('connection', (socket) => {
  socket.on('chat', async (data) => {
    const { requestId, messages } = data;
    
    try {
      const stream = await openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages,
        stream: true,
      });

      for await (const chunk of stream) {
        const token = chunk.choices[0]?.delta?.content || '';
        if (token) {
          socket.emit(`chat_token_${requestId}`, { token });
        }
      }

      socket.emit(`chat_complete_${requestId}`, { text: 'completed' });
    } catch (error) {
      socket.emit(`chat_error_${requestId}`, { error: error.message });
    }
  });
});

server.listen(3001, () => {
  console.log('Socket server running on port 3001');
});
```

### Python + Flask + Flask-SocketIO

```python
from flask import Flask
from flask_socketio import SocketIO, emit
import openai

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins='*')

openai.api_key = os.environ.get('OPENAI_API_KEY')

@socketio.on('chat')
def handle_chat(data):
    request_id = data['request_id']
    messages = data['messages']
    
    try:
        response = openai.ChatCompletion.create(
            model='gpt-4-turbo',
            messages=messages,
            stream=True
        )
        
        for chunk in response:
            token = chunk['choices'][0]['delta'].get('content', '')
            if token:
                emit(f'chat_token_{request_id}', {'token': token})
        
        emit(f'chat_complete_{request_id}', {'text': 'completed'})
    except Exception as e:
        emit(f'chat_error_{request_id}', {'error': str(e)})

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=3001)
```

---

## Configuration

### Settings Page

Users can configure both Socket and LLM endpoints via `/settings`:

- **Socket URL**: WebSocket endpoint (default: `http://localhost:3001`)
- **LLM Endpoint**: Ollama endpoint (default: `http://localhost:11434/v1`)
- **LLM Model**: Model name (default: `llama3.2`)

Each endpoint has a "Test Connection" button to verify connectivity.

---

## Usage in Components

### Using the Socket Service Directly

```typescript
import { streamChatSocket, checkSocketConnection } from '../services/socketService'

// Check connection
const connected = await checkSocketConnection()

// Stream chat
for await (const token of streamChatSocket({
  messages: [
    { role: 'system', content: 'You are helpful.' },
    { role: 'user', content: 'Hello!' }
  ],
  onToken: (token) => console.log(token),
})) {
  // Process tokens
}
```

### Using the LLM Service (Recommended)

The LLM service automatically tries Socket first, then falls back to HTTP:

```typescript
import { streamChat } from '../services/llm'

for await (const token of streamChat(messages)) {
  // Works with both Socket and HTTP
}
```

### Using the useLLMConversation Hook

```typescript
import { useLLMConversation } from '../hooks/useLLMConversation'

const { messages, streaming, connected, send } = useLLMConversation({
  systemPrompt: 'You are a helpful assistant.',
  regulationDeltaOnBait: 12,
  regulationDeltaOnGood: -5,
})

// Send message
await send('Hello!')

// connected: true (Socket), false (offline), null (checking)
```

---

## Error Handling

### Connection Failures

If the Socket connection fails, the app automatically:

1. Logs the error
2. Falls back to the local LLM (Ollama)
3. Falls back to scripted dialogue if LLM is also unavailable

### Timeout Handling

- Socket connection timeout: 3 seconds
- Reconnection attempts: 5
- Reconnection delay: 1–5 seconds (exponential backoff)

---

## Performance Considerations

### Advantages of Socket API

- **Real-time streaming**: Tokens arrive as they're generated
- **Lower latency**: No HTTP overhead
- **Persistent connection**: Reused across multiple requests
- **Bi-directional**: Server can push updates to client

### Bandwidth

- Typical chat response: 200–500 tokens
- Average token size: 3–5 bytes
- Typical response size: 1–3 KB

---

## Deployment

### Production Checklist

- [ ] Socket server is running and accessible
- [ ] CORS is properly configured
- [ ] SSL/TLS is enabled (use `wss://` for secure connections)
- [ ] Fallback LLM (Ollama) is available for offline mode
- [ ] Settings page is accessible for configuration
- [ ] Connection status is visible in the UI

### Environment Variables

```bash
# Client (not needed, configured via Settings page)
VITE_SOCKET_URL=http://api.example.com:3001

# Server
OPENAI_API_KEY=sk-...
SOCKET_PORT=3001
```

---

## Troubleshooting

### Socket Connection Fails

1. Check if the server is running: `curl http://localhost:3001`
2. Verify CORS settings on the server
3. Check browser console for connection errors
4. Try the fallback LLM via Settings page

### Tokens Not Streaming

1. Verify the `requestId` is unique for each request
2. Check that the server is emitting events with the correct event name
3. Verify socket connection is active: `isSocketConnected()`

### High Latency

1. Check network latency: `ping server-address`
2. Verify the LLM/API is responsive
3. Consider using a CDN or edge server closer to users

---

## Future Enhancements

- [ ] Reconnection UI indicator
- [ ] Request queuing for offline mode
- [ ] Compression for large responses
- [ ] Request/response logging and analytics
- [ ] Rate limiting and quota management
- [ ] Multi-language support for error messages

---

## Support

For issues or questions about the Socket API integration, please refer to:

- [Socket.IO Documentation](https://socket.io/docs/)
- [OpenAI API Documentation](https://platform.openai.com/docs/)
- [Ollama Documentation](https://github.com/ollama/ollama)
