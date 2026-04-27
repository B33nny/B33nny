# Signal & Static — Deployment & Setup Guide

## Overview

**Signal & Static** is a fully functional gamified communication mastery app with 15 completed levels (Tiers 1-3) and socket-based API integration. This guide covers deployment, configuration, and operation.

---

## System Architecture

### Frontend
- **React 19** + TypeScript + Vite
- **Tailwind CSS v4** for styling
- **Zustand** for state management (localStorage persistence)
- **Socket.IO Client** for real-time communication
- **PWA-ready** with service worker and offline support

### Backend Integration
The app supports three communication modes:

1. **Socket API** (preferred) — Real-time WebSocket communication
2. **Local LLM** (fallback) — Ollama HTTP endpoint
3. **Scripted Dialogue** (fallback) — Pre-written responses

---

## Deployment Steps

### 1. Prerequisites

```bash
# Node.js 18+ and npm
node --version
npm --version

# Optional: Ollama for local LLM fallback
# Download from https://ollama.ai
```

### 2. Build the App

```bash
cd /path/to/b33nny
npm install
npm run build
```

Output: `dist/` directory with production-ready files

### 3. Deploy to Hosting

#### Option A: Vercel (Recommended)

```bash
npm install -g vercel
vercel deploy
```

#### Option B: Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

#### Option C: Self-Hosted (Node.js)

```bash
npm install -g serve
serve -s dist -l 3000
```

#### Option D: Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

```bash
docker build -t signal-static .
docker run -p 3000:3000 signal-static
```

---

## Configuration

### Socket API Server Setup

Users configure the Socket API endpoint via the Settings page (`/settings`).

**Default:** `http://localhost:3001`

#### Example Node.js + Express Server

```javascript
// server.js
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const { OpenAI } = require('openai');

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

```bash
# Run the server
OPENAI_API_KEY=sk-... node server.js
```

### Local LLM (Ollama) Setup

1. Download Ollama from https://ollama.ai
2. Run: `ollama pull llama3.2`
3. Start: `ollama serve`

Default endpoint: `http://localhost:11434/v1`

---

## Features

### Completed Levels (15/20)

#### Tier 1 — Foundation (5 levels)
1. **Emotion Decoder** — Emotional granularity training
2. **Red Flag Bingo** — Basic pattern recognition
3. **The Four Horsemen** — Toxic vs healthy comparison
4. **Validate This** — Validation without endorsing
5. **The Phrase Lab** — De-escalating language

#### Tier 2 — Recognition (5 levels)
6. **Gaslight Detective** — Evidence flagging
7. **DARVO Decoder** — AI conversation with fallback
8. **The Maze of Circles** — Circular conversation traps
9. **Tactical Empathy Training** — Chris Voss techniques
10. **Spot the Trap** — Impulse control training

#### Tier 3 — Response (5 levels)
11. **Boundary Bootcamp** — Boundary setting practice
12. **The Reinforcement Trap** — Intermittent reinforcement cycle
13. **NVC Workshop** — Nonviolent Communication framework
14. **Counter-Move Clinic** — Rapid-fire pattern matching
15. **Coercive Control Map** — System-level pattern recognition

### Core Features

- **Gamification**: XP rewards, streaks, tier progression
- **Pattern Codex**: Searchable encyclopedia of 30+ toxic patterns
- **Spaced Repetition**: SM-2 algorithm for long-term retention
- **Regulation Meter**: Stress tracking with breathing exercises
- **Daily Practice**: One scenario per day for consistency
- **Offline Support**: PWA with service worker
- **Socket API Integration**: Real-time streaming responses
- **Settings Page**: Configure endpoints and test connections

---

## User Guide

### Getting Started

1. **Onboarding** — 4-question intake survey
2. **Home Dashboard** — View XP, streak, and next level
3. **Level Map** — Browse and unlock levels
4. **Daily Practice** — One scenario per day
5. **Codex** — Review unlocked patterns
6. **Library** — Learn de-escalation techniques

### Progression

- **Unlock Logic**: Level N requires Level N-1 complete
- **Tier Unlocks**: 
  - Tier 2 after Level 5
  - Tier 3 after Level 10
  - Tier 4 after Level 15 (not yet implemented)

### Persistence

All progress is saved to `localStorage`:
- `signal-static-progress` — Completed levels, XP, weak patterns
- `signal-static-streak` — Daily streak and XP
- `signal-static-repetition` — Spaced repetition items
- `signal-static-codex` — Unlocked patterns

---

## Troubleshooting

### Socket Connection Fails

1. Verify server is running: `curl http://localhost:3001`
2. Check CORS settings on server
3. Try fallback LLM via Settings page
4. Check browser console for errors

### Levels Not Loading

1. Clear browser cache and localStorage
2. Verify TypeScript build: `npm run build`
3. Check console for errors
4. Reload page

### Performance Issues

1. Check network latency
2. Verify LLM/API response time
3. Consider using a CDN
4. Profile with browser DevTools

---

## Environment Variables

### Client (Optional)
```bash
VITE_SOCKET_URL=http://api.example.com:3001
```

### Server
```bash
OPENAI_API_KEY=sk-...
SOCKET_PORT=3001
NODE_ENV=production
```

---

## Monitoring & Analytics

### Recommended Tools

- **Sentry** — Error tracking
- **LogRocket** — Session replay
- **Mixpanel** — User analytics
- **Datadog** — Performance monitoring

### Key Metrics to Track

- Session duration
- Level completion rate
- Pattern unlock rate
- Daily active users
- Retention (day 1, 7, 30)
- API response time
- Socket connection success rate

---

## Security Considerations

- ✅ No sensitive data stored client-side
- ✅ All API keys stored server-side
- ✅ CORS properly configured
- ✅ HTTPS recommended for production
- ⚠️ Consider rate limiting on Socket API
- ⚠️ Implement authentication if needed
- ⚠️ Validate all user inputs server-side

---

## Future Enhancements

- [ ] Levels 16-20 (Tier 4 — Mastery)
- [ ] User authentication & profiles
- [ ] Leaderboards & achievements
- [ ] Social features (sharing, challenges)
- [ ] Mobile app (React Native)
- [ ] Multilingual support
- [ ] Advanced analytics dashboard
- [ ] AI-powered personalization

---

## Support & Feedback

For issues, feature requests, or contributions:

1. Check existing issues on GitHub
2. Create a new issue with detailed description
3. Include browser/OS version and steps to reproduce
4. Attach screenshots or console logs

---

## License

[Add your license here]

---

## Credits

Built with ❤️ for communication mastery and emotional intelligence.

**Key References:**
- Gottman Method (Four Horsemen)
- Nonviolent Communication (Marshall Rosenberg)
- Tactical Empathy (Chris Voss)
- Dialectical Behavior Therapy (Marsha Linehan)
- Spaced Repetition (Ebbinghaus)
