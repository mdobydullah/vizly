import dynamic from 'next/dynamic';
import { VisualLoader } from './VisualLoader';

// Map of visual IDs to their components with dynamic loading
// This is a plain object used by Server Components to identify the correct component.
export const visualComponents: Record<string, any> = {
    jwt: dynamic(() => import('./auth/jwtVisual').then(mod => mod.JwtVisual), {
        loading: () => <VisualLoader />
    }),
    oauth: dynamic(() => import('./auth/oauthVisual').then(mod => mod.OauthVisual), {
        loading: () => <VisualLoader />
    }),
    'caching-strategies': dynamic(() => import('./performance/CachingStrategiesVisual').then(mod => mod.CachingStrategiesVisual), {
        loading: () => <VisualLoader />
    }),
};
