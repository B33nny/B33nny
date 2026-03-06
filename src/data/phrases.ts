import type { PhraseSubstitution } from '../types'

export const escalatingPhrases: PhraseSubstitution[] = [
  { bad: 'You always do this', good: 'This has happened a few times now and I\'d like to talk about it', why: '"Always" triggers defensiveness; specific pattern is actionable' },
  { bad: 'You never listen', good: 'I don\'t feel heard right now', why: 'Absolute statements ("never") produce counter-evidence, not engagement' },
  { bad: 'Calm down', good: 'It seems like you\'re really upset. Can we slow down for a moment?', why: 'Telling someone to calm down escalates; naming the state de-escalates' },
  { bad: 'You\'re being ridiculous', good: 'I\'m struggling to understand your point of view. Can you help me?', why: 'Contemptuous framing shuts down; curiosity opens up' },
  { bad: 'I don\'t care', good: 'I need a moment before I can engage with this properly', why: 'Dismissal invites escalation; honest withdrawal is respectful' },
  { bad: 'This is your fault', good: 'I think there are things we both contributed here', why: 'Blame invites defensiveness; shared responsibility invites collaboration' },
  { bad: 'Fine. Whatever.', good: 'I\'m not in a good place to continue this right now. Can we come back to it in [time]?', why: 'Passive shutdown creates uncertainty; naming the break creates safety' },
  { bad: 'You\'re so sensitive', good: 'It seems like this landed harder than I intended. I\'m sorry for that.', why: 'Invalidating responses amplify distress; acknowledging impact de-escalates' },
  { bad: 'I already told you', good: 'Let me explain that differently', why: 'Impatience signals contempt; patience keeps the door open' },
  { bad: 'Why can\'t you just...', good: 'What would it look like for you to...', why: 'Complaints ("why can\'t you") invite defensiveness; curiosity invites engagement' },
  { bad: 'You\'re wrong', good: 'I see it differently — here\'s what I\'m working from', why: 'Direct contradiction invites counter-attack; sharing your perspective invites discussion' },
  { bad: 'That\'s not what I said', good: 'I think there might be a misunderstanding — what I meant was...', why: 'Flat contradiction sounds dismissive; clarifying shows care for accuracy' },
  { bad: 'I can\'t deal with this right now', good: 'This is important and I want to give it proper attention. Can we revisit at [time]?', why: 'Vague avoidance creates anxiety; specific return time creates trust' },
  { bad: 'You\'re making me feel...', good: 'I feel [emotion] when [specific situation]', why: '"You make me feel" attributes your state to the other person; NVC format takes ownership' },
  { bad: 'Stop overreacting', good: 'Help me understand what\'s making this feel so significant to you', why: 'Minimising invalidates; curiosity validates' },
]

export const validationPhrases: string[] = [
  'That makes sense given what you\'ve been through.',
  'Of course you feel that way — anyone in your position would.',
  'I can see why that was really hard for you.',
  'It sounds like this is really important to you.',
  'I hear how much this has been affecting you.',
  'That sounds genuinely painful.',
  'Your reaction makes complete sense.',
  'I can understand why you\'re feeling that way.',
  'It seems like this has really taken a toll on you.',
  'That sounds exhausting.',
]

export const boundaryPhrases: string[] = [
  'I\'m not willing to continue this conversation if [behaviour] continues.',
  'I\'m not able to discuss this right now. I\'m available at [time].',
  'That doesn\'t work for me.',
  'I\'ve made my decision.',
  'No is my answer, and I don\'t need to justify it further.',
  'I understand you disagree, and my position hasn\'t changed.',
  'I\'m going to step away from this conversation now.',
  'I\'m not going to discuss [topic] any further.',
]

export const disengagementPhrases: string[] = [
  'I notice we keep covering the same ground. I\'m going to leave this here.',
  'We see this differently. I\'m not going to change my view through repetition.',
  'I\'ve heard your position. Mine hasn\'t changed.',
  'This conversation isn\'t moving anywhere productive. I\'m going to step away.',
  'Okay.',
  'Noted.',
  'I hear you.',
  'We\'ll have to disagree on this one.',
]
