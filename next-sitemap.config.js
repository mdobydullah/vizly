/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://vizly.dev',
  generateRobotsTxt: false, // we maintain our own robots.txt
  outDir: 'public',
  generateIndexSitemap: false,
  exclude: ['/api/*'],
  changefreq: 'weekly',
  priority: 0.7,
  transform: async (config, path) => {
    // Higher priority for main pages
    const highPriority = ['/', '/guides', '/articles', '/series', '/learning-paths'];
    const isHighPriority = highPriority.includes(path);

    return {
      loc: path,
      changefreq: isHighPriority ? 'daily' : config.changefreq,
      priority: isHighPriority ? 1.0 : path.startsWith('/learning-paths/') ? 0.9 : config.priority,
      lastmod: new Date().toISOString(),
    };
  },
};
