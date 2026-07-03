export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

export interface QuestionAnswer {
  /** Explanation. `\n\n` splits paragraphs, `**x**` renders bold. */
  text: string;
  /** Optional solution / demo code block. */
  code?: string;
  /** Optional expected output block. */
  output?: string;
}

export interface PracticeQuestion {
  id: number;
  question: string;
  /** Optional prompt snippet shown before the answer is revealed. */
  code?: string;
  difficulty?: QuestionDifficulty;
  answer: QuestionAnswer;
}

export interface QuestionSet {
  /** Lookup key used by <QuestionList quiz="..." />, e.g. "python-fundamentals/python-variables-types". */
  slug: string;
  title: string;
  questions: PracticeQuestion[];
}
