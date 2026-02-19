import dynamic from 'next/dynamic';
import { GuideLoader } from './GuideLoader';

// Map of guide IDs to their components with dynamic loading
// This is a plain object used by Server Components to identify the correct component.
// Automatically load all components ending with "Guide.tsx" from subdirectories
const context = (require as any).context('./', true, /Guide\.tsx$/);

export const guideComponents: Record<string, any> = {};

context.keys().forEach((path: string) => {
    // Extract filename without extension (e.g., "JwtGuide")
    const fileName = path.split('/').pop()?.replace('.tsx', '') || '';

    // Skip internal files
    if (!fileName || fileName === 'GuideLoader' || fileName === 'index') return;

    // Generate slug from filename: "LoadBalancingGuide" -> "load-balancing"
    const slug = fileName
        .replace(/Guide$/, '') // Remove "Guide" suffix
        .replaceAll(/([a-z])([A-Z])/g, '$1-$2') // kebab-case
        .toLowerCase();

    // Register the component with dynamic loading
    // We use a static './' prefix to help Webpack's static analysis
    guideComponents[slug] = dynamic(() =>
        import(`./${path.replace('./', '')}`).then(mod => {
            // Find the export that ends with "Guide" or fallback to fileName or default
            const exportName = Object.keys(mod).find(k => k.endsWith('Guide')) || fileName;
            return mod[exportName] || mod.default;
        }),
        { loading: () => <GuideLoader /> }
    );
});
