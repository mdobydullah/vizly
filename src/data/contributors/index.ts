import { Contributor } from '@/types/visuals';

// Dynamically load all .json files in this folder and subfolders
const context = (require as any).context('./', true, /\.json$/);

const contributorsMap: Record<string, Contributor> = {};

context.keys().forEach((key: string) => {
    const contributor = context(key);
    if (contributor.username) {
        contributorsMap[contributor.username] = contributor;
    }
});

export default contributorsMap;
