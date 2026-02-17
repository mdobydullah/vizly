import { Visual, VisualsData } from '@/types/visuals';

// Dynamically load all .json files in this folder
// Note: This relies on Webpack's require.context, which is supported by Next.js
const context = (require as any).context('./', false, /\.json$/);

const allVisuals: Visual[] = context.keys().flatMap((key: string) => {
    return context(key);
}) as Visual[];

export const visualsData: VisualsData = {
    visuals: allVisuals
};

export default visualsData;
