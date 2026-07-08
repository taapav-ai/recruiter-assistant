export type Module = 'feedback' | 'assistant';

export type Stage = 'resume' | 'screening' | 'test' | 'interview' | 'final';
export type Tone = 'neutral' | 'warm' | 'brief';
export type Lang = 'ru' | 'en' | 'ua';

export interface Option<T extends string = string> {
  value: T;
  label: string;
}

export interface HistoryItem {
  id: string;
  name: string;
  position: string;
  stage: string;
  date: string;
}

export interface FeedbackResult {
  text: string;
  flaggedCount: number;
}

export interface Candidate {
  id: string;
  name: string;
  position: string;
  experience: number;
  skills: string[];
  summary: string;
  scores: Record<string, number>;
  pros: string[];
  risks: string[];
  interviewQuestions?: string[];
}

export interface Vacancy {
  id: string;
  label: string;
}
