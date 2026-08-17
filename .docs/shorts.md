# Shorts Feed

`/shorts` is a TikTok-style vertical feed of bite-size theory videos. Videos are hosted on Cloudflare R2 behind `cdn.vizly.dev` (rendered and uploaded by the codereel project, see its `.docs/05-upload-r2.md`). The feed shuffles on every visit, so it works as passive spaced repetition.

## Where videos come from

The feed merges two sources and shuffles them together:

1. **Theory topics** — any topic in `src/data/theory/<track>.json` with a `videoSrc` field:

   ```json
   {
     "q": "Process vs Thread",
     "level": "junior",
     "videoSrc": "https://cdn.vizly.dev/shorts/backend-engineer/process-vs-thread.mp4"
   }
   ```

   `videoSrc` powers both the feed and the modal player on the theory page. The overlay shows the section title and topic name, plus a deep link (`#<topic-slug>`) to the topic on the track's theory page.

2. **Standalone shorts** — `src/data/shorts.json`, for videos that don't belong to a theory topic (visual guides, one-off explainers, anything from another R2 folder):

   ```json
   [
     {
       "videoSrc": "https://cdn.vizly.dev/shorts/visuals/how-dns-works.mp4",
       "title": "How DNS works",
       "tag": "Visual",
       "href": "/guides/dns"
     }
   ]
   ```

   `href` is optional; without it the overlay shows no "Read full theory" link. `tag` is the small uppercase label above the title (section name, "Visual", whatever fits).

## Adding a new track

Theory tracks are registered in `TRACKS` inside `src/app/shorts/page.tsx`:

```ts
const TRACKS = [
    { id: "backend-engineer", label: "Backend Engineer", href: "/theory/backend-engineer", sections: backendTheory },
];
```

New track = import its JSON and add one entry. Every topic in it with `videoSrc` joins the feed automatically.

## Player behavior

- Scroll-snap, one video per screen, shuffled per visit (shuffle runs after mount to avoid hydration mismatch).
- IntersectionObserver (60% threshold) autoplays the in-view video and pauses the rest. Videos loop.
- Starts muted because browsers block unmuted autoplay. One tap on the speaker unmutes for the whole session.
- Keyboard: `↑`/`↓` or `j`/`k` navigate, `space` pause, `m` mute. Click on the video toggles pause.
- Only the active video ±1 preloads (`preload="auto"`), the rest are `preload="none"` to keep bandwidth flat as the library grows.
- Mobile (≤640px): full-bleed player, side rail hidden, swipe to navigate.

## Workflow for a new short

1. Render in codereel, upload with its `/upload` command (pushes to R2 and sets `videoSrc` on the matching theory topic).
2. For a non-theory video: upload to a sensible R2 folder (`shorts/visuals/...`) and add an entry to `src/data/shorts.json` by hand.
3. Deploy. The feed picks it up, no other changes.
