import type { Persona } from '../types'

export const personas: Persona[] = [
  {
    slug: 'alex',
    name: 'Alex',
    role: 'Partner',
    description: 'A romantic partner who uses DARVO and blame-shifting when confronted. Genuinely believes they are the victim in every conflict. Skilled at making you apologise for bringing things up.',
    avatar: '🧍',
    primaryPatterns: ['darvo', 'blame-shifting', 'projection', 'guilt-tripping'],
    difficulty: 1,
  },
  {
    slug: 'morgan',
    name: 'Morgan',
    role: 'Manager',
    description: 'A workplace manager who uses doublespeak, moving goalposts, and plausible deniability. Never says anything you can quote, but the control is constant. Rewards compliance; punishes independence.',
    avatar: '💼',
    primaryPatterns: ['doublespeak', 'moving-goalposts', 'contempt', 'blame-shifting'],
    difficulty: 2,
  },
  {
    slug: 'river',
    name: 'River',
    role: 'Parent',
    description: 'A parent who deploys guilt-tripping, emotional blackmail, and flying monkeys. Loves with conditions. Frames every interaction as "after everything I\'ve done for you." Exit is complicated by love and obligation.',
    avatar: '👤',
    primaryPatterns: ['guilt-tripping', 'emotional-blackmail', 'flying-monkeys', 'triangulation'],
    difficulty: 2,
  },
  {
    slug: 'sage',
    name: 'Sage',
    role: 'Sibling',
    description: 'A sibling who uses triangulation, circular conversations, and rage cycling. Competitive and entitled. Uses family gatherings as stages for power plays. Can seem charming to outsiders.',
    avatar: '🧑',
    primaryPatterns: ['triangulation', 'circular-conversations', 'rage-cycling', 'whataboutism'],
    difficulty: 2,
  },
  {
    slug: 'quinn',
    name: 'Quinn',
    role: 'Ex-partner',
    description: 'An ex-partner deploying hoovering, future faking, and intermittent reinforcement. Will oscillate between charm and coldness to keep you engaged. Expert at making the good moments feel like evidence of change.',
    avatar: '👥',
    primaryPatterns: ['hoovering', 'future-faking', 'intermittent-reinforcement', 'love-bombing'],
    difficulty: 2,
  },
  {
    slug: 'jordan',
    name: 'Jordan',
    role: 'Colleague',
    description: 'A peer colleague using passive aggression, reactive abuse, and subtle baiting. Plausible deniability on everything. Will escalate if confronted, then present your reaction as the evidence of your instability.',
    avatar: '🧑‍💼',
    primaryPatterns: ['baiting', 'reactive-abuse', 'doublespeak', 'whataboutism'],
    difficulty: 3,
  },
  {
    slug: 'taylor',
    name: 'Taylor',
    role: 'Negotiation counterpart',
    description: 'A high-stakes negotiation counterpart. Uses word salad, coercive pressure, and calibrated emotional displays. In the Negotiation Room only. Full tactical repertoire. Responds to every framework you deploy.',
    avatar: '🎭',
    primaryPatterns: ['word-salad', 'emotional-flooding', 'baiting', 'darvo', 'moving-goalposts'],
    difficulty: 3,
  },
]

export const getPersonaBySlug = (slug: string): Persona | undefined =>
  personas.find(p => p.slug === slug)
