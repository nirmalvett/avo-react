import {ThemeStyle} from '@material-ui/core/styles/createTypography';

export interface LearnQuestionCardProps {
  prompt: string;
  prompts: string[];
  promptVariant?: ThemeStyle;
  promptsVariant?: ThemeStyle;
  types?: string[];
}

export interface LearnLessonCardProps {
  title: string;
  body: string;
  promptVariant?: ThemeStyle;
  promptsVariant?: ThemeStyle;
}

export interface LearnExplanationCardProps {
  explanation: string;
  promptVariant?: ThemeStyle;
}

export interface LearnExplanationContainerState {
  explanationIndex: number;
}

export interface Skill {
  name: string;
  rating: number;
}

export interface LearnExplanationContainerProps {
  explanations: string[];
  skills: Skill[];
}
