import type { Emotion } from '../types'

export const emotions: Emotion[] = [
  // Anger family
  { label: 'Annoyed', category: 'anger', intensity: 1, relatedEmotions: ['Irritated', 'Frustrated'], description: 'A mild irritation with a person or situation.' },
  { label: 'Frustrated', category: 'anger', intensity: 2, relatedEmotions: ['Annoyed', 'Exasperated'], description: 'Blocked from achieving something; feeling thwarted.' },
  { label: 'Exasperated', category: 'anger', intensity: 2, relatedEmotions: ['Frustrated', 'Irritated'], description: 'Frustrated to the point of losing patience.' },
  { label: 'Contemptuous', category: 'anger', intensity: 3, relatedEmotions: ['Disgusted', 'Disdainful'], description: 'Viewing someone as inferior or worthless.' },
  { label: 'Furious', category: 'anger', intensity: 3, relatedEmotions: ['Enraged', 'Livid'], description: 'Intense, consuming anger.' },
  { label: 'Enraged', category: 'anger', intensity: 3, relatedEmotions: ['Furious', 'Livid'], description: 'Anger so intense it impairs judgement.' },

  // Sadness family
  { label: 'Disappointed', category: 'sadness', intensity: 1, relatedEmotions: ['Let down', 'Disheartened'], description: 'Unmet expectations causing mild sadness.' },
  { label: 'Disheartened', category: 'sadness', intensity: 2, relatedEmotions: ['Disappointed', 'Discouraged'], description: 'Losing hope or confidence after a setback.' },
  { label: 'Grief-stricken', category: 'sadness', intensity: 3, relatedEmotions: ['Devastated', 'Bereft'], description: 'Intense sorrow following a significant loss.' },
  { label: 'Bereft', category: 'sadness', intensity: 3, relatedEmotions: ['Grief-stricken', 'Desolate'], description: 'Feeling robbed of something essential.' },
  { label: 'Despondent', category: 'sadness', intensity: 3, relatedEmotions: ['Hopeless', 'Defeated'], description: 'Hopelessness and loss of any positive expectation.' },

  // Fear family
  { label: 'Uneasy', category: 'fear', intensity: 1, relatedEmotions: ['Anxious', 'Apprehensive'], description: 'A vague sense that something is wrong.' },
  { label: 'Anxious', category: 'fear', intensity: 2, relatedEmotions: ['Worried', 'Apprehensive'], description: 'Fearful anticipation of something uncertain.' },
  { label: 'Terrified', category: 'fear', intensity: 3, relatedEmotions: ['Petrified', 'Horrified'], description: 'Extreme fear that overwhelms rational thought.' },
  { label: 'Hypervigilant', category: 'fear', intensity: 2, relatedEmotions: ['Anxious', 'Watchful'], description: 'An exhausting state of constant threat monitoring.' },
  { label: 'Dread', category: 'fear', intensity: 3, relatedEmotions: ['Terror', 'Apprehension'], description: 'Anticipatory fear about something you know is coming.' },

  // Shame family
  { label: 'Embarrassed', category: 'shame', intensity: 1, relatedEmotions: ['Self-conscious', 'Awkward'], description: 'Mild shame linked to social exposure.' },
  { label: 'Humiliated', category: 'shame', intensity: 3, relatedEmotions: ['Mortified', 'Degraded'], description: 'Shame with an audience; dignity stripped publicly.' },
  { label: 'Worthless', category: 'shame', intensity: 3, relatedEmotions: ['Defective', 'Inadequate'], description: 'Belief that you have no value as a person.' },
  { label: 'Defective', category: 'shame', intensity: 3, relatedEmotions: ['Worthless', 'Broken'], description: 'Feeling fundamentally flawed at the core.' },
  { label: 'Self-conscious', category: 'shame', intensity: 1, relatedEmotions: ['Embarrassed', 'Awkward'], description: 'Uncomfortable awareness of how others perceive you.' },

  // Disgust family
  { label: 'Disturbed', category: 'disgust', intensity: 2, relatedEmotions: ['Repulsed', 'Unsettled'], description: 'Distress in response to something morally or physically aversive.' },
  { label: 'Repulsed', category: 'disgust', intensity: 3, relatedEmotions: ['Revolted', 'Disturbed'], description: 'Extreme disgust with a strong avoidance drive.' },
  { label: 'Disdainful', category: 'disgust', intensity: 2, relatedEmotions: ['Contemptuous', 'Scornful'], description: 'Looking down on someone as unworthy of respect.' },

  // Compound/mixed (important for the game)
  { label: 'Gaslit', category: 'fear', intensity: 3, relatedEmotions: ['Confused', 'Disoriented'], description: 'Doubting your own perception and memory after being manipulated.' },
  { label: 'Trapped', category: 'fear', intensity: 3, relatedEmotions: ['Helpless', 'Controlled'], description: 'Unable to see a way out of a situation.' },
  { label: 'Dismissed', category: 'sadness', intensity: 2, relatedEmotions: ['Invalidated', 'Ignored'], description: 'Your experience or perspective treated as unimportant.' },
  { label: 'Manipulated', category: 'anger', intensity: 2, relatedEmotions: ['Used', 'Deceived'], description: 'Realising you were controlled or deceived.' },
  { label: 'Invalidated', category: 'sadness', intensity: 2, relatedEmotions: ['Dismissed', 'Unseen'], description: 'Your experience treated as wrong or overblown.' },
  { label: 'Betrayed', category: 'sadness', intensity: 3, relatedEmotions: ['Devastated', 'Deceived'], description: 'Trust broken by someone you depended on.' },
  { label: 'Powerless', category: 'fear', intensity: 3, relatedEmotions: ['Helpless', 'Trapped'], description: 'No sense of agency over your own situation.' },
  { label: 'Overwhelmed', category: 'fear', intensity: 2, relatedEmotions: ['Flooded', 'Overloaded'], description: 'More than you can process or cope with in the moment.' },
  { label: 'Flooded', category: 'fear', intensity: 3, relatedEmotions: ['Overwhelmed', 'Shut down'], description: 'Physiological overwhelm — the body is in alarm state.' },
]

export const emotionsByCategory = (category: string) =>
  emotions.filter(e => e.category === category)
