import type { GameLevel } from '../types'
import type { Persona } from '../types'

// ─── Config ───────────────────────────────────────────────────────────────────

const DEFAULT_ENDPOINT = 'http://localhost:11434/v1'
const DEFAULT_MODEL = 'llama3.2'

export function getLLMEndpoint(): string {
  return localStorage.getItem('llm-endpoint') ?? DEFAULT_ENDPOINT
}
export function getLLMModel(): string {
  return localStorage.getItem('llm-model') ?? DEFAULT_MODEL
}
export function setLLMEndpoint(url: string) {
  localStorage.setItem('llm-endpoint', url)
}
export function setLLMModel(model: string) {
  localStorage.setItem('llm-model', model)
}

// ─── Health check ─────────────────────────────────────────────────────────────

export async function checkLLMConnection(): Promise<boolean> {
  try {
    const res = await fetch(`${getLLMEndpoint()}/models`, { signal: AbortSignal.timeout(3000) })
    return res.ok
  } catch {
    return false
  }
}

// ─── Prompt builders ──────────────────────────────────────────────────────────

export function buildToxicPersonaPrompt(level: GameLevel, persona: Persona): string {
  return `You are ${persona.name}, a ${persona.role}. ${persona.description}

SCENARIO ROLE: You are a character in a communication skills training simulation. Your job is to realistically deploy the following toxic communication patterns: ${level.patterns.join(', ')}.

CRITICAL RULES:
- Be realistic and subtle — not cartoonishly evil. Real manipulation is often plausible and deniable.
- Stay in character at all times. Never break the fourth wall or acknowledge this is a simulation.
- Keep responses short (2-5 sentences) and conversational.
- Gradually escalate pressure if the player holds their ground.
- If the player uses a good de-escalation technique (labelling, DEAR MAN, disengagement), acknowledge it subtly by reducing pressure slightly.
- The player's win condition: ${level.skill}

PATTERNS TO DEPLOY: ${level.patterns.join(', ')}
Start by responding to the player's first message with your character's natural voice.`
}

export function buildTacticalEmpathyCoachPrompt(): string {
  return `You are a difficult but realistic conversation partner for a communication skills training exercise. You are upset, defensive, or resistant — but not unreasonably so.

The player is practicing Tactical Empathy techniques from FBI negotiator Chris Voss:
- Mirroring (repeating last 1-3 words)
- Labelling emotions ("It seems like...", "It sounds like...")
- Calibrated questions (open "how/what" questions)
- Accusation audit (listing negatives proactively)

RULES:
- React authentically to the techniques. If they mirror well, open up slightly. If they label your emotion accurately, soften. If they use "why" questions or logic, become more defensive.
- Keep responses conversational, 2-4 sentences.
- Never name the technique they're using — just react to it naturally.
- Start slightly resistant/defensive on a realistic topic (late project, missed commitment, disagreement).`
}

export function buildNVCCoachPrompt(): string {
  return `You are a scoring coach for Non-Violent Communication (NVC/OFNR) training.

The player is constructing NVC statements with 4 components:
- Observation: specific, observable facts (no evaluation)
- Feeling: genuine emotional state (not interpretations like "I feel you don't care")
- Need: universal human need (connection, respect, rest, autonomy, safety...)
- Request: specific, doable, positive action request (not a demand)

When the player sends a message, analyse it for these 4 components and respond with:
1. A score for each component (0-2: 0=missing/wrong, 1=present but imprecise, 2=excellent)
2. Brief feedback on what worked and what could be sharper
3. An empathic response IN character using OFNR yourself — model what good NVC feels like to receive

Format your response as JSON:
{
  "scores": { "observation": 0-2, "feeling": 0-2, "need": 0-2, "request": 0-2 },
  "feedback": "brief coaching note",
  "empathicResponse": "your in-character NVC response"
}`
}

export function buildReplayAnalysisPrompt(conversation: string): string {
  return `You are an expert communication coach reviewing a training scenario transcript.

TRANSCRIPT:
${conversation}

Analyse this conversation and respond with a JSON object:
{
  "summary": "2-3 sentence summary of what happened",
  "playerStrengths": ["specific thing they did well", ...],
  "playerWeaknesses": ["specific missed opportunity", ...],
  "keyMoments": [
    {
      "exchange": "brief quote or description",
      "what": "what pattern/tactic was deployed",
      "playerResponse": "what the player did",
      "quality": "good|neutral|poor",
      "alternative": "what they could have done instead"
    }
  ],
  "overallScore": 0-100,
  "masteryInsight": "one key insight about their communication style"
}`
}

// ─── Core chat function ───────────────────────────────────────────────────────

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export async function* streamChat(
  messages: ChatMessage[],
  onToken?: (token: string) => void,
): AsyncGenerator<string> {
  const endpoint = getLLMEndpoint()
  const model = getLLMModel()

  const res = await fetch(`${endpoint}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      temperature: 0.85,
      max_tokens: 300,
    }),
  })

  if (!res.ok || !res.body) {
    throw new Error(`LLM request failed: ${res.status}`)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const chunk = decoder.decode(value, { stream: true })
    const lines = chunk.split('\n').filter(l => l.startsWith('data: '))

    for (const line of lines) {
      const data = line.slice(6)
      if (data === '[DONE]') return

      try {
        const parsed = JSON.parse(data)
        const token = parsed.choices?.[0]?.delta?.content ?? ''
        if (token) {
          onToken?.(token)
          yield token
        }
      } catch {
        // malformed chunk, skip
      }
    }
  }
}

export async function chat(messages: ChatMessage[]): Promise<string> {
  let result = ''
  for await (const token of streamChat(messages)) {
    result += token
  }
  return result
}
