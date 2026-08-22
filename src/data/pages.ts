/**
 * Single source of truth for the standalone /about and /contact pages.
 *
 * Same trick as `profile.ts`: content lives here as Markdown, the `.astro` page
 * renders it to HTML with `marked`, and `/about.md` + `/contact.md` serve the
 * raw Markdown for agents. One edit updates both representations.
 */
import { displayName, hacktandil, org, projects, socials } from "./profile";

function withBase(url: string, base: string): string {
	return base && url.startsWith("/") ? `${base}${url}` : url;
}

function normalizeBase(siteUrl: string): string {
	return siteUrl.replace(/\/$/, "");
}

export const aboutTitle = `About · ${displayName}`;

export const aboutDescription =
	"Who dantesito is: security researcher at The Red Guild, co-founder of HackTandil, and what this site collects.";

export const contactTitle = `Contact · ${displayName}`;

export const contactDescription =
	"How to reach dantesito — email, X, Telegram, GitHub, LinkedIn — and what is worth reaching out about.";

/** Long-form bio. Kept factual: everything here is also visible in /agents.md. */
export function renderAboutMarkdown(siteUrl = ""): string {
	const base = normalizeBase(siteUrl);
	const home = base ? `${base}/` : "/";

	const lines = [
		`# About ${displayName}`,
		"",
		"I'm Dante — `dantesito` most places online. I'm a hacker and security",
		"researcher based in Argentina, and most of my work sits at the point where",
		"Ethereum meets the people actually using it: phishing, scams, wallet",
		"drainers, lookalike domains, and the everyday threats that hit users long",
		"before they hit smart contracts.",
		"",
		"## Where I work",
		"",
		`I'm a member of [${org.name}](${org.url}), a web3 security team focused on`,
		"protecting users rather than only auditing code. Alongside that I co-founded",
		`[${hacktandil.name}](${hacktandil.url}), a hacker community in Tandil,`,
		"Argentina, where we run meetups and get more people locally into security and",
		"Ethereum.",
		"",
		"## What I build",
		"",
		...projects.slice(0, 3).map((p) => `- [${p.name}](${p.url}) — ${p.description}`),
		"",
		`A fuller list — including shut-down and hackathon projects — lives in [/agents.md](${base}/agents.md).`,
		"",
		"## What I write",
		"",
		`I keep a [blog](${base}/blog/) for longer technical writing and research, and`,
		`[weeknotes](${base}/weeknotes/) as a running, lower-stakes log of what I'm`,
		"working on, reading, and thinking about. There's also a",
		`[shelf](${base}/shelf/) of books, movies, albums, podcasts and articles that`,
		"gave me something worth keeping.",
		"",
		"## Talks",
		"",
		"I've spoken at Ekoparty, at Devconnect and Devcon side events, at Ethereum",
		"Essentials in Tandil, and at local meetups — usually about web3 threats,",
		"security awareness, or whatever protocol has my attention that month. The",
		`dated list is in [/agents.md](${base}/agents.md).`,
		"",
		"## About this site",
		"",
		"This site is a static Astro build. There are no analytics, no tracking",
		"pixels, no ad networks, no accounts, and no forms — I don't collect anything",
		"about you, and the only browser storage is a `theme` key remembering whether",
		"you picked light or dark. Two third parties do get loaded: an icon stylesheet",
		"from cdnjs, and X's embed script on the handful of posts that quote a post.",
		"",
		"Every page has a Markdown twin for agents — append `.md` to a URL, or send",
		"`Accept: text/markdown` — and the full URL list is in",
		`[/sitemap.xml](${base}/sitemap.xml).`,
		"",
		"---",
		"",
		`[Home](${home}) · [Contact](${base}/contact/) · [Blog](${base}/blog/) · [Profile for agents](${base}/agents.md)`,
		"",
	];

	return lines.join("\n");
}

export function renderContactMarkdown(siteUrl = ""): string {
	const base = normalizeBase(siteUrl);
	const home = base ? `${base}/` : "/";

	const lines = [
		"# Contact",
		"",
		`The fastest way to reach me is email. Everything below is a real, monitored`,
		"channel — pick whichever fits how much of a conversation it is.",
		"",
		"## Channels",
		"",
		...socials.map((s) => {
			const href = withBase(s.url, base);
			const note = contactNote(s.name);
			return `- **${s.name}** — [${displayLabel(s.url)}](${href})${note ? ` — ${note}` : ""}`;
		}),
		"",
		"## What's worth reaching out about",
		"",
		"- **Web3 or Ethereum security questions** — phishing campaigns, wallet",
		"  drainers, lookalike domains, scam infrastructure, or a threat you've seen",
		"  in the wild and want a second opinion on.",
		`- **Work with [${org.name}](${org.url})** — security awareness campaigns,`,
		"  research collaborations, or anything about the tools we publish.",
		"- **Speaking and workshops** — conferences, meetups, and university sessions,",
		"  in English or Spanish.",
		`- **[${hacktandil.name}](${hacktandil.url})** — if you're in or near Tandil and`,
		"  want to show up, speak, or help run something.",
		"- **Corrections** — if something on this site is wrong, outdated, or unfair,",
		"  tell me and I'll fix it.",
		"",
		"## What I can't help with",
		"",
		"I can't recover stolen funds, reverse a transaction, or unlock a wallet. If",
		"you've just been drained, the useful next steps are revoking approvals and",
		"moving whatever is left to a fresh wallet — not messaging me first.",
		"",
		"I also don't do paid promotion, and I don't respond to unsolicited pitches",
		"for tokens, exchanges, or trading products.",
		"",
		"---",
		"",
		`[Home](${home}) · [About](${base}/about/) · [Blog](${base}/blog/) · [Profile for agents](${base}/agents.md)`,
		"",
	];

	return lines.join("\n");
}

function displayLabel(url: string): string {
	if (url.startsWith("mailto:")) return url.slice("mailto:".length);
	return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function contactNote(name: string): string {
	switch (name) {
		case "Email":
			return "best for anything that needs a real answer";
		case "X":
			return "public replies and DMs, fastest for short things";
		case "GitHub":
			return "issues and pull requests on my projects";
		case "Telegram":
			return "if we've already met or you're coming from a community I'm in";
		case "LinkedIn":
			return "professional and speaking enquiries";
		default:
			return "";
	}
}
