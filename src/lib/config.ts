export const config = {
  app: {
    name: "Vizly",
    fullName: "Vizly — Learn Through Visuals",
    description: "Animated guides to system design, security, and complex engineering concepts.",
    gtmId: process.env.NEXT_PUBLIC_GTM_ID,
    defaultTheme: (process.env.NEXT_PUBLIC_DEFAULT_THEME || "white") as "dark" | "light" | "white",
  },
  urls: {
    domain: "vizly.dev",
    githubRepo: "https://github.com/mdobydullah/vizly",
    youtube: "https://www.youtube.com/@vizlydev",
    instagram: "https://www.instagram.com/vizlydev",
    tiktok: "https://www.tiktok.com/@vizlydev",
    facebook: "https://www.facebook.com/vizlydev",
  },
} as const;
