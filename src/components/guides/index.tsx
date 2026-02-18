import dynamic from 'next/dynamic';
import { GuideLoader } from './GuideLoader';

// Map of guide IDs to their components with dynamic loading
// This is a plain object used by Server Components to identify the correct component.
export const guideComponents: Record<string, any> = {
    jwt: dynamic(() => import('./auth/JwtGuide').then(mod => mod.JwtGuide), {
        loading: () => <GuideLoader />
    }),
    oauth: dynamic(() => import('./auth/OauthGuide').then(mod => mod.OauthGuide), {
        loading: () => <GuideLoader />
    }),
    'caching-strategies': dynamic(() => import('./performance/CachingStrategiesGuide').then(mod => mod.CachingStrategiesGuide), {
        loading: () => <GuideLoader />
    }),
    'message-queues': dynamic(() => import('./async/MessageQueuesGuide').then(mod => mod.MessageQueuesGuide), {
        loading: () => <GuideLoader />
    }),
    'load-balancing': dynamic(() => import('./infrastructure/LoadBalancingGuide').then(mod => mod.LoadBalancingGuide), {
        loading: () => <GuideLoader />
    }),
    'database-replication': dynamic(() => import('./database/DatabaseReplicationGuide').then(mod => mod.DatabaseReplicationGuide), {
        loading: () => <GuideLoader />
    }),
    cdn: dynamic(() => import('./infrastructure/CdnGuide').then(mod => mod.CdnGuide), {
        loading: () => <GuideLoader />
    }),
};
