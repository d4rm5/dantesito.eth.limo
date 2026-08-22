/**
 * Vercel Edge Middleware — Markdown content negotiation (acceptmarkdown.com).
 *
 * The site is a static Astro build, so it cannot vary a response on a request
 * header by itself. This runs at the edge before the static file is served and:
 *
 *   1. Rewrites requests that ask for `Accept: text/markdown` to the Markdown
 *      twin that already exists for that page (`/` -> `/agents.md`,
 *      `/blog/foo/` -> `/blog/foo.md`, and so on). Vercel serves `.md` files as
 *      `text/markdown; charset=utf-8`.
 *   2. Adds `Vary: Accept, Accept-Encoding` to every negotiable response, so a
 *      CDN never hands the cached HTML variant to an agent asking for Markdown
 *      (or the reverse), whichever landed in the cache first.
 *
 * Deliberately dependency-free: this speaks Vercel's middleware response
 * protocol directly (`x-middleware-next` / `x-middleware-rewrite`) rather than
 * importing `@vercel/edge`, which is all that package's `next()` and `rewrite()`
 * helpers do. That keeps package.json and both lockfiles untouched. Anything
 * unexpected falls through to normal serving.
 */

const VARY = "Accept, Accept-Encoding";

export const config = {
  matcher: [
    "/",
    "/about",
    "/about/",
    "/contact",
    "/contact/",
    "/shelf",
    "/shelf/",
    "/blog/:path*",
    "/weeknotes/:path*",
  ],
};

export default function middleware(request: Request): Response {
  try {
    const url = new URL(request.url);

    if (!prefersMarkdown(request.headers.get("accept"))) {
      return passThrough();
    }

    const twin = markdownTwin(url.pathname);
    if (!twin) return passThrough();

    return rewriteTo(new URL(twin, url).toString());
  } catch {
    // Never let a negotiation bug take the site down.
    return passThrough();
  }
}

/** Continue to the origin, adding the Vary header to whatever it returns. */
function passThrough(): Response {
  return new Response(null, {
    headers: {
      "x-middleware-next": "1",
      Vary: VARY,
    },
  });
}

function rewriteTo(destination: string): Response {
  return new Response(null, {
    headers: {
      "x-middleware-rewrite": destination,
      Vary: VARY,
    },
  });
}

/**
 * True when the client explicitly asks for Markdown and does not prefer HTML
 * more strongly. Browsers never list `text/markdown`, so they always fall
 * through to HTML.
 */
function prefersMarkdown(accept: string | null): boolean {
  if (!accept) return false;

  const markdownQ = qualityFor(accept, "text/markdown");
  if (markdownQ <= 0) return false;

  const htmlQ = qualityFor(accept, "text/html");
  return markdownQ >= htmlQ;
}

/** Quality value for an exact media type in an Accept header; 0 if absent. */
function qualityFor(accept: string, mediaType: string): number {
  for (const part of accept.split(",")) {
    const [type, ...params] = part.trim().split(";");
    if (type.trim().toLowerCase() !== mediaType) continue;

    for (const param of params) {
      const [key, value] = param.split("=");
      if (key?.trim().toLowerCase() === "q") {
        const q = Number.parseFloat(value ?? "");
        return Number.isFinite(q) ? q : 1;
      }
    }
    return 1;
  }
  return 0;
}

/** Map an HTML route to the Markdown file that mirrors it, if one exists. */
function markdownTwin(pathname: string): string | null {
  const path = pathname.replace(/\/index\.html$/, "/");

  if (path === "/" || path === "") return "/agents.md";
  if (path === "/about" || path === "/about/") return "/about.md";
  if (path === "/contact" || path === "/contact/") return "/contact.md";
  if (path === "/shelf" || path === "/shelf/") return "/shelf.md";

  // /blog/<slug>/ -> /blog/<slug>.md ; the /blog/ index itself has no twin.
  const entry = /^\/(blog|weeknotes)\/([^/.]+)\/?$/.exec(path);
  if (entry) return `/${entry[1]}/${entry[2]}.md`;

  return null;
}
