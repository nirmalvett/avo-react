export interface LearnQuestionCardProps {
    prompt: string;
    prompts: string[];
    promptVariant: string;
    promptsVariant: string;
    color: "inherit" | "primary" | "secondary" | "default" | "textPrimary" | "textSecondary" | "error"
}
export interface LearnLessonCardProps {
    title: string;
    body: string;
    promptVariant: string;
    promptsVariant: string;
    color: "inherit" | "primary" | "secondary" | "default" | "textPrimary" | "textSecondary" | "error"
}