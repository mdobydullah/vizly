import { Visual, VisualsData } from '@/types/visuals';
import contributorsMap from '../contributors';

// Dynamically load all .json files in this folder
// Note: This relies on Webpack's require.context, which is supported by Next.js
const context = (require as any).context('./', false, /\.json$/);

const allVisuals: Visual[] = context.keys().flatMap((key: string) => {
    const visuals = context(key);

    // Transform contributors from string to objects if necessary
    return visuals.map((v: any) => {
        if (typeof v.contributors === 'string') {
            const usernames = v.contributors.split(',').map((u: string) => u.trim());
            v.contributors = usernames
                .map((username: string) => contributorsMap[username])
                .filter(Boolean);
        }
        return v as Visual;
    });
});

export const visualsData: VisualsData = {
    visuals: allVisuals
};

export default visualsData;
