export interface LearnQuestionCardProps {
  prompt: string;
  prompts: string[];
  promptVariant?: string;
  promptsVariant?: string;
  types?: string[];
}
export interface LearnLessonCardProps {
  title: string;
  body: string;
  promptVariant?: string;
  promptsVariant?: string;
}
export interface LearnExplanationCardProps {
  explanation: string;
  promptVariant?: string;
}
export interface LearnExplanationContainerState {
  explanationIndex: number;
  skills: Skill[];
}
export interface Skill {
  name: string;
  rating: number;
}
export interface LearnExplanationContainerProps {
  explanations: string[];
}
