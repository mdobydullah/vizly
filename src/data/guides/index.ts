import { Guide, GuidesData } from '@/types/guides';
import contributorsMap from '../contributors';

// Dynamically load all .json files in this folder and subfolders
const context = (require as any).context('./', true, /\.json$/);

const allGuides: Guide[] = context.keys()
    .filter((key: string) => !key.includes('guide-colors.json'))
    .flatMap((key: string) => {
        const guides = context(key);

        // Transform contributors from string to objects if necessary
        return guides.map((v: any) => {
            if (typeof v.contributors === 'string') {
                const usernames = v.contributors.split(',').map((u: string) => u.trim());
                v.contributors = usernames
                    .map((username: string) => contributorsMap[username])
                    .filter(Boolean);
            }
            return v as Guide;
        });
    });

export const guidesData: GuidesData = {
    guides: allGuides
};

export default guidesData;
