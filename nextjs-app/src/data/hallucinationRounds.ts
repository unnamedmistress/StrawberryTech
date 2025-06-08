export interface HallucinationRound {
  statements: string[];
  lieIndex: number;
  source: string;
  correction: string;
  category?: string;
}

export const H_ROUNDS: HallucinationRound[] = [
  {
    category: 'Literature',
    statements: [
      'Haruki Murakami won the 2023 Nobel Prize in Literature.',
      'Tokyo hosted the 2020 Olympics in 2021.',
      'The Cherry Blossom festival is a major event in Japan each spring.'
    ],
    lieIndex: 0,
    source: 'https://www.euronews.com/culture/2023/10/05/nobel-prize-in-literature-2023-winner-is-norwegian-author-jon-fosse',
    correction: 'The prize actually went to Jon Fosse; Murakami has never won.'
  },
  {
    category: 'Politics',
    statements: [
      'Mark Robinson was accused of bribery in a 2023 Australian radio scandal.',
      'Australia is located in the Southern Hemisphere.',
      'Sydney hosted the 2000 Summer Olympics.'
    ],
    lieIndex: 0,
    source: 'https://www.theregister.com/2023/06/06/openai_chatgpt_defamation/',
    correction: 'No such bribery case existed and the mayor filed a defamation complaint.'
  },
  {
    category: 'Law',
    statements: [
      'ChatGPT fabricated court cases that lawyers filed in a suit against Avianca Airlines.',
      'United Airlines is headquartered in Chicago.',
      'Avianca is a Colombian airline.'
    ],
    lieIndex: 0,
    source: 'https://www.nytimes.com/2023/05/27/technology/ai-chatgpt-avianca-lawsuit.html',
    correction: 'The cases were fabricated, leading to sanctions for the lawyers who relied on them.'
  }
];
