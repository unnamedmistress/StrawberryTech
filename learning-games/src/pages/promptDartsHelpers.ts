export interface DartRound {
  /** List of prompt options */
  options: string[]
  /** Index of the clearest prompt in the options array */
  correct: number
  why: string
  /** Example model response for the clear prompt */
  response: string
}



export const FALLBACK_ROUNDS: DartRound[] = [
  {
    options: [
      'Tell me about AI.',
      'List 3 use cases of AI in customer service.',
      'Share some general info about artificial intelligence.'
    ],
    correct: 1,
    why: 'The good prompt is specific about the desired output.',
    response: '1. Answer common questions\n2. Route tickets\n3. Provide 24/7 help'
  },
  {
    options: [
      'Write an email.',
      'Draft a 3-sentence email to a hiring manager explaining your interest.',
      'Send an email for me.'
    ],
    correct: 1,
    why: 'It clearly states the format and audience.',
    response: 'Dear Hiring Manager, ... (three sentences)'
  },
  {
    options: [
      'Explain climate change.',
      'Summarize 2 key causes of climate change in one paragraph.',
      'Describe the climate.'
    ],
    correct: 1,
    why: 'A concise request focuses the response.',
    response: 'The main causes are greenhouse gases and deforestation.'
  },
  {
    options: [
      'Summarize this article.',
      'Provide a two-sentence summary highlighting the main argument.',
      'Give me the gist.'
    ],
    correct: 1,
    why: 'Defining length keeps the summary tight.',
    response: 'Sentence one. Sentence two.'
  },
  {
    options: [
      'Translate this text.',
      'Translate the following text from English to Spanish.',
      'Help me with a translation.'
    ],
    correct: 1,
    why: 'Specifying languages makes the task clear.',
    response: 'Texto traducido al español.'
  },
  {
    options: [
      'Analyze our sales.',
      "List 3 key insights from last quarter's sales data in bullet form.",
      'Review the sales numbers.'
    ],
    correct: 1,
    why: 'The format and focus are spelled out.',
    response: '- Insight one\n- Insight two\n- Insight three'
  },
  {
    options: [
      'Write marketing copy.',
      'Compose a short tweet promoting our new product and mention its top benefit.',
      'Tell people about our product.'
    ],
    correct: 1,
    why: 'Including format and detail improves clarity.',
    response: 'Check out our new product! It saves you time ⏱️ #NewRelease'
  },
  {
    options: [
      'Weather?',
      "Give today's weather forecast for Tokyo in Celsius.",
      'What is the weather like?'
    ],
    correct: 1,
    why: 'Location and units guide the response.',
    response: 'Today in Tokyo it will be 22°C with light rain.'
  },
  {
    options: [
      'Code a function.',
      'Write a Python function that reverses a string.',
      'Give me some code.'
    ],
    correct: 1,
    why: 'The good prompt specifies language and purpose.',
    response: 'def reverse_string(s):\n    return s[::-1]'
  },
  {
    options: [
      'Story please.',
      'Write a short bedtime story about a dragon who learns to code.',
      'Tell me something fun.'
    ],
    correct: 1,
    why: 'Topic and tone are defined.',
    response: 'Once upon a time, a curious dragon learned Python...'
  },
  {
    options: [
      'Advice on focus.',
      'Provide three tips for staying productive while working remotely.',
      'How do I stay focused?'
    ],
    correct: 1,
    why: 'Numbered tips make expectations clear.',
    response: '1. Keep a routine\n2. Set boundaries\n3. Take breaks'
  },
  {
    options: [
      'Help with calculus.',
      'Explain in two sentences how to find the derivative of x^2.',
      'Teach me calculus.'
    ],
    correct: 1,
    why: 'The good prompt constrains the explanation.',
    response: 'Use the power rule: bring down the exponent and subtract one.'
  },
  {
    options: [
      'Improve sentence.',
      'Rewrite the following sentence to sound more professional.',
      'Make this sound better.'
    ],
    correct: 1,
    why: 'The instruction is clearer about the goal.',
    response: 'Original: ... Revised: ...'
  },
  {
    options: [
      'List activities.',
      'Provide five kid-friendly indoor activities for a rainy day.',
      'Any fun ideas?'
    ],
    correct: 1,
    why: 'Quantity and audience are defined.',
    response: '1. Build a blanket fort...'
  },
  {
    options: [
      'History facts.',
      'Give a brief overview of the causes of the French Revolution.',
      'Share some history.'
    ],
    correct: 1,
    why: 'The good prompt specifies the scope.',
    response: 'High taxes and social inequality led to unrest...'
  },
  {
    options: [
      'Get user data.',
      'Create an SQL query to find the ten most recent orders.',
      'Find recent orders.'
    ],
    correct: 1,
    why: 'The request defines exactly what results are needed.',
    response: 'SELECT * FROM orders ORDER BY created_at DESC LIMIT 10;'
  },
  {
    options: [
      'Recipe ideas.',
      'Share a simple recipe for vegan chocolate chip cookies.',
      'What should I cook?'
    ],
    correct: 1,
    why: 'Specifying ingredients helps produce a useful recipe.',
    response: 'Mix flour, sugar, vegan butter and chocolate chips...'
  },
  {
    options: [
      'Explain quantum.',
      'Explain quantum entanglement in simple terms for beginners.',
      'Tell me about physics.'
    ],
    correct: 1,
    why: 'The audience is clearly defined.',
    response: 'Entanglement means two particles share a linked state even when far apart.'
  },
  {
    options: [
      'Fix my laptop.',
      "List three common solutions for a laptop that won't turn on.",
      'My laptop is broken.'
    ],
    correct: 1,
    why: 'Stating number and issue guides troubleshooting.',
    response: '1. Check the power cable\n2. Remove the battery\n3. Try a hard reset'
  },
  {
    options: [
      'Make an outline.',
      'Create a 5-point outline for a blog post about time management tips.',
      'Outline tips.'
    ],
    correct: 1,
    why: 'The structure and topic are spelled out.',
    response: 'I. Introduction ... V. Conclusion'
  }
]


export const ROUNDS: DartRound[] = FALLBACK_ROUNDS


export function checkChoice(round: DartRound, index: number) {
  return index === round.correct
}

export const STREAK_THRESHOLD = 3
export const STREAK_BONUS = 5

export function streakBonus(streak: number) {
  return streak > 0 && streak % STREAK_THRESHOLD === 0 ? STREAK_BONUS : 0
}

