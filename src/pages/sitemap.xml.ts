import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

export const GET: APIRoute = async (context) => {
  const siteBase = context.site?.toString() ?? "";
  
  if (!siteBase) {
    return new Response("Site URL not configured", { status: 500 });
  }

  const posts = (await getCollection("blog")).filter((post) => !post.data.draft);
  const weeknotes = (await getCollection("weeknotes")).filter((weeknote) => !weeknote.data.draft);
  
  const sortedPosts = posts.sort((a, b) => {
    const aDate = a.data.pubDate instanceof Date 
      ? a.data.pubDate 
      : new Date(a.data.pubDate as unknown as string);
    const bDate = b.data.pubDate instanceof Date 
      ? b.data.pubDate 
      : new Date(b.data.pubDate as unknown as string);
    return bDate.valueOf() - aDate.valueOf();
  });

  const urls: Array<{ loc: string; lastmod?: string; changefreq: string; priority: number }> = [
    { loc: siteBase, changefreq: "weekly", priority: 1.0 },
    { loc: new URL("/blog/", siteBase).toString(), changefreq: "weekly", priority: 0.8 },
    { loc: new URL("/weeknotes/", siteBase).toString(), changefreq: "weekly", priority: 0.7 },
    { loc: new URL("/shelf/", siteBase).toString(), changefreq: "monthly", priority: 0.6 },
    { loc: new URL("/about/", siteBase).toString(), changefreq: "yearly", priority: 0.7 },
    { loc: new URL("/contact/", siteBase).toString(), changefreq: "yearly", priority: 0.7 },
  ];

  for (const post of sortedPosts) {
    const pubDate = post.data.pubDate instanceof Date 
      ? post.data.pubDate 
      : new Date(post.data.pubDate as unknown as string);
    
    const rawSlug = slugFromEntry(post);
    const slug = rawSlug && rawSlug !== "undefined" ? rawSlug : slugFromTitle(post.data?.title);
    
    urls.push({
      loc: new URL(`/blog/${slug}/`, siteBase).toString(),
      lastmod: pubDate.toISOString().split("T")[0],
      changefreq: "monthly",
      priority: 0.6,
    });
  }

  const sortedWeeknotes = weeknotes.sort((a, b) => {
    const aDate = a.data.pubDate instanceof Date
      ? a.data.pubDate
      : new Date(a.data.pubDate as unknown as string);
    const bDate = b.data.pubDate instanceof Date
      ? b.data.pubDate
      : new Date(b.data.pubDate as unknown as string);
    return bDate.valueOf() - aDate.valueOf();
  });

  for (const weeknote of sortedWeeknotes) {
    const pubDate = weeknote.data.pubDate instanceof Date
      ? weeknote.data.pubDate
      : new Date(weeknote.data.pubDate as unknown as string);

    const rawSlug = slugFromEntry(weeknote);
    const slug = rawSlug && rawSlug !== "undefined" ? rawSlug : slugFromTitle(weeknote.data?.title);

    urls.push({
      loc: new URL(`/weeknotes/${slug}/`, siteBase).toString(),
      lastmod: pubDate.toISOString().split("T")[0],
      changefreq: "weekly",
      priority: 0.5,
    });
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url>
    <loc>${escapeXml(url.loc)}</loc>${url.lastmod ? `
    <lastmod>${url.lastmod}</lastmod>` : ""}
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join("\n")}
</urlset>`;

  return new Response(sitemap, {
    status: 200,
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
};

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function slugFromTitle(title?: string): string {
  if (!title) return "untitled";
  const t = title.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
  const s = t.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return s || "untitled";
}

function slugFromEntry(entry: any): string {
  const rawSlug = entry.slug ?? entry.id ?? "";
  const slug = rawSlug.toString().split("/").pop()?.replace(/\.[^/.]+$/, "");
  return slug || slugFromTitle(entry.data?.title);
}
