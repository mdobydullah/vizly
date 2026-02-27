import { sendGTMEvent } from '@next/third-parties/google';

/**
 * Tracks a custom event in Google Tag Manager.
 * @param eventName The name of the event to track.
 * @param eventParams Additional data to send with the event.
 */
export const trackEvent = (eventName: string, eventParams?: Record<string, any>) => {
    sendGTMEvent({
        event: eventName,
        ...eventParams,
    });
};
