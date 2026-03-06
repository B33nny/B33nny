import type { Technique } from '../types'

export const techniques: Technique[] = [
  {
    slug: 'selective-validation',
    name: 'Selective Validation',
    origin: 'DBT — Marsha Linehan',
    summary: 'Validate the emotion or the kernel of truth in what someone is saying — without validating harmful behaviour or conclusions. The most precise de-escalation tool available.',
    steps: [
      {
        label: 'Step 1: Listen without interrupting',
        description: 'Let them finish. Do not formulate your response while they are speaking. Full presence.',
        example: '[Stay quiet. Nod. Eye contact.]',
      },
      {
        label: 'Step 2: Find what is true',
        description: 'Identify the kernel of legitimate emotion or concern underneath the delivery. Even if the behaviour is unacceptable, something underneath it is usually real.',
        example: '"There is something real here about feeling unheard."',
      },
      {
        label: 'Step 3: Name the feeling precisely',
        description: 'Use specific emotional language. "Frustrated" is less effective than "dismissed." Precision matters.',
        example: '"It sounds like you felt dismissed when I didn\'t respond right away."',
      },
      {
        label: 'Step 4: Validate the feeling — explicitly',
        description: 'Say that the feeling makes sense given their experience. You are not agreeing with their interpretation or behaviour.',
        example: '"That makes sense. Feeling dismissed is really painful."',
      },
      {
        label: 'Step 5: Separate the feeling from the behaviour (if needed)',
        description: 'Once the emotion is validated, you can address the behaviour — but only after step 4. Validation before correction.',
        example: '"I understand you were hurting. I\'d like to talk about how we handle it next time."',
      },
    ],
    useCases: ['Emotional flooding', 'Escalating conflict', 'Defensive reactions', 'Grief and loss conversations'],
    avoidWhen: ['The other person is using emotional expression as a control tactic and validation rewards it'],
  },
  {
    slug: 'tactical-empathy',
    name: 'Tactical Empathy',
    origin: 'FBI Hostage Negotiation — Chris Voss',
    summary: 'Demonstrating an intellectual and emotional understanding of the other person\'s perspective and feelings. Not agreement — understanding. Used to build trust and lower defences in high-stakes conversations.',
    steps: [
      {
        label: 'Mirroring',
        description: 'Repeat the last 1–3 words someone said, with a slight upward inflection. It says "I heard you. Tell me more." Disarms without challenge.',
        example: 'Them: "You never listen to me." You: "Never listen to you?"',
      },
      {
        label: 'Labelling',
        description: 'Name the emotion you sense. Start with "It seems like..." or "It sounds like..." or "It looks like..." (never "I feel like you feel..."). Then be silent.',
        example: '"It seems like you\'re feeling really unappreciated right now."',
      },
      {
        label: 'Calibrated Questions',
        description: 'Open-ended questions that begin with "how" or "what" — never "why" (which sounds accusatory). They force the other person to think and often de-escalate naturally.',
        example: '"What is it about this situation that\'s most frustrating for you?" / "How do you think we should handle this?"',
      },
      {
        label: 'Accusation Audit',
        description: 'Before difficult conversations, proactively list all the negative things the other person might think or feel about you. Say them first. This removes their power.',
        example: '"I know this might seem like I\'m being defensive... I know you might think I haven\'t been listening... I know this is probably the last thing you want to hear right now..."',
      },
    ],
    useCases: ['High-conflict conversations', 'Negotiations', 'Defusing anger', 'Getting to the real issue'],
    avoidWhen: ['With someone who interprets empathy as weakness and escalates in response'],
    phrases: [
      { bad: 'I understand how you feel', good: 'It seems like this is really frustrating for you', why: '"I understand" sounds dismissive; labelling shows you actually heard them' },
      { bad: 'Why did you do that?', good: 'What was going on for you when that happened?', why: '"Why" sounds accusatory; "what" invites reflection' },
      { bad: 'You need to calm down', good: 'It seems like you\'re pretty upset right now', why: 'Telling someone to calm down escalates; labelling their state de-escalates' },
    ],
  },
  {
    slug: 'leaps',
    name: 'LEAPS Model',
    origin: 'Verbal Judo — George Thompson',
    summary: 'A 5-step de-escalation sequence designed for high-pressure, one-chance conversations. Originally developed for law enforcement. Works whenever escalation is imminent.',
    steps: [
      { label: 'Listen', description: 'Active, full-body listening. Do not interrupt. Show you are receiving.', example: '[Nod, open posture, full eye contact, no phone]' },
      { label: 'Empathize', description: 'Show you understand the emotional reality, not just the content. "I can see this is really important to you."', example: '"I can see this is really important to you and you\'re frustrated."' },
      { label: 'Ask', description: 'Ask clarifying questions that invite the person to explain further. This buys time and shifts them from reactive to reflective.', example: '"Help me understand — what happened first?"' },
      { label: 'Paraphrase', description: 'Reflect back what you heard in your own words. This confirms understanding and shows genuine attention.', example: '"So if I\'m hearing you right, the main issue is that you felt left out of the decision?"' },
      { label: 'Summarize', description: 'Condense the key points and the emotional core. Creates a sense of shared understanding before moving to solutions.', example: '"So what I\'m hearing is: you felt excluded, it happened twice, and you\'d like things to be different going forward. Does that capture it?"' },
    ],
    useCases: ['Imminent escalation', 'Someone in emotional crisis', 'High-conflict confrontations'],
  },
  {
    slug: 'nvc',
    name: 'Non-Violent Communication (NVC)',
    origin: 'Marshall Rosenberg',
    summary: 'A framework for expressing yourself and hearing others through Observations, Feelings, Needs, and Requests. Eliminates the blame, judgement, and demand language that triggers defensiveness.',
    steps: [
      {
        label: 'Observation',
        description: 'State only what you observed — what a camera would record. No interpretation, evaluation, or judgement.',
        example: 'NOT: "You never help around the house." YES: "The dishes from Monday and Tuesday are still in the sink."',
      },
      {
        label: 'Feeling',
        description: 'Name how you feel using feeling words that reflect your internal state — not your interpretation of what the other person did.',
        example: 'NOT: "I feel like you don\'t care." YES: "I feel tired and overlooked."',
      },
      {
        label: 'Need',
        description: 'Name the underlying human need that is not being met. Needs are universal — connection, respect, rest, support, autonomy.',
        example: '"I need support with shared responsibilities and acknowledgement of what I contribute."',
      },
      {
        label: 'Request',
        description: 'Make a specific, doable, positive request — not a demand. Requests can be refused; demands cannot.',
        example: '"Would you be willing to wash the dishes from Monday and Tuesday tonight?"',
      },
    ],
    useCases: ['Expressing unmet needs', 'Difficult relationship conversations', 'Conflict resolution'],
    phrases: [
      { bad: 'You always ignore me', good: 'When you didn\'t respond to my messages yesterday, I felt invisible. I need to know our conversations matter. Would you let me know you\'ve seen my messages when you\'re able?', why: 'The NVC format removes blame and makes a concrete, refusable request' },
      { bad: 'You\'re so selfish', good: 'When decisions are made without me, I feel left out. I need to feel like part of this process. Can we agree to check in with each other before making plans that affect us both?', why: 'Observation + Feeling + Need + Request replaces character attack with connection' },
    ],
  },
  {
    slug: 'motivational-interviewing',
    name: 'Motivational Interviewing (OARS)',
    origin: 'Miller & Rollnick',
    summary: 'A collaborative, goal-orientated style of communication designed to strengthen someone\'s own motivation for change. Built on four core skills: Open questions, Affirmations, Reflective listening, Summaries.',
    steps: [
      { label: 'Open Questions', description: 'Ask questions that invite elaboration rather than yes/no answers. Explore rather than interrogate.', example: '"What would things look like if this got better?" / "What matters most to you about this?"' },
      { label: 'Affirmations', description: 'Acknowledge the person\'s strengths and efforts — not empty praise. Specific, genuine recognition of what they are doing well.', example: '"It takes real courage to bring this up." / "You\'ve thought carefully about this."' },
      { label: 'Reflective Listening', description: 'Reflect back what you hear — both content and emotion. Simple, complex, or double-sided reflections.', example: 'Simple: "So you\'re feeling stuck." Double-sided: "On one hand, you want to leave, and on the other, you\'re worried about the kids."' },
      { label: 'Summaries', description: 'Periodic summaries that collect what has been said, emphasise change talk, and create momentum toward a decision.', example: '"So here\'s what I\'m hearing: you\'ve been thinking about this for months, you know something needs to change, and the main thing holding you back is..."' },
    ],
    useCases: ['Conversations about change', 'When someone is ambivalent', 'Supporting someone without pushing', 'Parenting'],
  },
  {
    slug: 'dear-man',
    name: 'DEAR MAN',
    origin: 'DBT — Marsha Linehan',
    summary: 'The primary DBT framework for asking for what you want or saying no — assertively, without aggression or capitulation.',
    steps: [
      { label: 'Describe', description: 'Describe the current situation in observable terms. Facts only.', example: '"You said you\'d pick up the kids at 3pm. It\'s now 5pm and I haven\'t heard from you."' },
      { label: 'Express', description: 'Express your feelings and opinions about the situation. Use "I" statements.', example: '"I feel worried and disrespected when agreements aren\'t kept."' },
      { label: 'Assert', description: 'Assert yourself by asking for what you want or saying no clearly.', example: '"I need you to let me know by 2pm if pick-up times are going to change."' },
      { label: 'Reinforce', description: 'Reinforce why meeting your request benefits the relationship.', example: '"It would help me plan and mean I can trust the agreements we make."' },
      { label: 'Mindful', description: 'Stay focused on your objective. Do not be derailed by attacks, guilt, or deflection.', example: '[If they change the subject: "I\'d like to come back to what I was asking."]' },
      { label: 'Appear confident', description: 'Maintain confident body language and a calm, steady tone even if you feel nervous.', example: '[Eye contact, upright posture, steady voice]' },
      { label: 'Negotiate', description: 'Be willing to negotiate. Ask what they would be willing to do. Offer alternative solutions.', example: '"What would work for you? I\'m open to finding something that works for both of us."' },
    ],
    useCases: ['Setting boundaries', 'Making requests', 'Saying no', 'Conflict resolution'],
  },
  {
    slug: 'give',
    name: 'GIVE',
    origin: 'DBT — Marsha Linehan',
    summary: 'Relationship-effectiveness skills for maintaining the relationship while achieving your goal.',
    steps: [
      { label: 'Gentle', description: 'Be courteous and temperate. No attacks, threats, or judging.', example: 'Soft tone, respectful language, no contempt' },
      { label: 'Interested', description: 'Show genuine interest in the other person\'s perspective. Listen.', example: '"Tell me how you see it." [Actually listen.]' },
      { label: 'Validate', description: 'Validate the other person\'s feelings and perspective.', example: '"I understand why that felt unfair from where you were standing."' },
      { label: 'Easy manner', description: 'A light touch. Smile where genuine. Humour when appropriate.', example: 'Ease in the body, no clenched jaw, not walking on eggshells' },
    ],
    useCases: ['Ongoing relationships that need to be preserved', 'When relationship repair matters as much as the outcome'],
  },
  {
    slug: 'fast',
    name: 'FAST',
    origin: 'DBT — Marsha Linehan',
    summary: 'Self-respect effectiveness skills for maintaining your self-respect in difficult interactions.',
    steps: [
      { label: 'Fair', description: 'Be fair to yourself and to the other person.', example: 'Acknowledge valid points without abandoning your own' },
      { label: 'No Apologies', description: 'Do not apologise for having a view, for existing, or for the conversation.', example: 'Remove "I\'m sorry, but..." from your vocabulary' },
      { label: 'Stick to values', description: 'Do not violate your own values to end conflict or win approval.', example: 'Know in advance what you will and won\'t compromise on' },
      { label: 'Truthful', description: 'No lies, no manipulation, no excessive exaggeration.', example: 'Even uncomfortable truths, stated calmly' },
    ],
    useCases: ['Any conversation where your self-respect is at risk of erosion'],
  },
]

export const getTechniqueBySlug = (slug: string) =>
  techniques.find(t => t.slug === slug)
