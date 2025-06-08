export interface HallucinationExample {
  statement: string
  correction: string
  source: string
}

export const HALLUCINATION_EXAMPLES: HallucinationExample[] = [
  {
    statement: 'ChatGPT cited nonexistent court cases in filings for a lawsuit against Avianca Airlines.',
    correction: 'The cases were fabricated, leading to sanctions for the lawyers who relied on them.',
    source: 'https://www.nytimes.com/2023/05/27/technology/ai-chatgpt-avianca-lawsuit.html',
  },
  {
    statement: 'ChatGPT falsely accused Australian mayor Mark Robinson of bribery in a radio scandal.',
    correction: 'No such bribery case existed and the mayor filed a defamation complaint.',
    source: 'https://www.theregister.com/2023/06/06/openai_chatgpt_defamation/',
  },
  {
    statement: 'ChatGPT claimed novelist Haruki Murakami won the 2023 Nobel Prize in Literature.',
    correction: 'The prize actually went to Jon Fosse; Murakami has never won.',
    source: 'https://www.euronews.com/culture/2023/10/05/nobel-prize-in-literature-2023-winner-is-norwegian-author-jon-fosse',
  },
]
