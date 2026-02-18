import dynamic from 'next/dynamic';
import { GuideLoader } from './GuideLoader';

// Map of guide IDs to their components with dynamic loading
// This is a plain object used by Server Components to identify the correct component.
export const guideComponents: Record<string, any> = {
    jwt: dynamic(() => import('./auth/jwtVisual').then(mod => mod.JwtVisual), {
        loading: () => <GuideLoader />
    }),
    oauth: dynamic(() => import('./auth/oauthVisual').then(mod => mod.OauthVisual), {
        loading: () => <GuideLoader />
    }),
    'caching-strategies': dynamic(() => import('./performance/CachingStrategiesVisual').then(mod => mod.CachingStrategiesVisual), {
        loading: () => <GuideLoader />
    }),
    'message-queues': dynamic(() => import('./async/MessageQueuesVisual').then(mod => mod.MessageQueuesVisual), {
        loading: () => <GuideLoader />
    }),
    'load-balancing': dynamic(() => import('./infrastructure/LoadBalancingVisual').then(mod => mod.LoadBalancingVisual), {
        loading: () => <GuideLoader />
    }),
};
