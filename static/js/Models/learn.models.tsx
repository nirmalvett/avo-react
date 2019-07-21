export interface LearnQuestionCardProps {
    prompt: string;
    prompts: string[];
    promptVariant: string;
    promptsVariant: string;
    color: "inherit" | "primary" | "secondary" | "default" | "textPrimary" | "textSecondary" | "error"
}