import { QuestionSet } from '@/types/questions';

// Dynamically load all .json question sets in this folder and subfolders
const context = (require as any).context('./', true, /\.json$/);

export const questionsData: Record<string, QuestionSet> = Object.fromEntries(
    context.keys().map((key: string) => {
        const set = context(key) as QuestionSet;
        return [set.slug, set];
    })
);

export default questionsData;
