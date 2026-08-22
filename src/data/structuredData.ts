/**
 * JSON-LD (schema.org) for agent and search-engine entity resolution.
 *
 * The site is a personal site, so `Person` is the primary identity — that's the
 * type schema.org and the AI-readiness checks expect here. `Organization`
 * describes the publishing entity behind dantesito.com so contact details are
 * machine-readable; it deliberately carries no `address`, since there is no
 * business premises to publish.
 */
import {
	displayName,
	hacktandil,
	org,
	projects,
	siteDescription,
	siteTitle,
	socials,
	tagline,
} from "./profile";

type JsonLdNode = Record<string, unknown>;

function abs(path: string, site: string): string {
	return new URL(path, site).href;
}

function socialUrl(name: string): string | undefined {
	return socials.find((s) => s.name === name)?.url;
}

/** Public profile URLs, minus the mailto: entry. */
function sameAs(): string[] {
	return socials
		.map((s) => s.url)
		.filter((url) => url.startsWith("http"));
}

function email(): string {
	const mailto = socialUrl("Email") ?? "mailto:hello@dantesito.com";
	return mailto.replace(/^mailto:/, "");
}

function personNode(site: string): JsonLdNode {
	return {
		"@type": "Person",
		"@id": `${site}#person`,
		name: displayName,
		alternateName: "Dante",
		url: site,
		image: abs("/avatar.png", site),
		description: `${tagline}. Ethereum enthusiast, security researcher. ${siteDescription}`,
		jobTitle: "Security researcher",
		email: email(),
		knowsAbout: [
			"Web3 security",
			"Ethereum",
			"Phishing and social engineering",
			"Cryptocurrency scams",
			"Threat intelligence",
			"Application security",
		],
		knowsLanguage: ["es", "en"],
		worksFor: { "@id": `${site}#redguild` },
		memberOf: { "@id": `${site}#hacktandil` },
		sameAs: sameAs(),
		mainEntityOfPage: { "@id": `${site}#webpage` },
	};
}

/** Publishing entity behind the site. No `address` by design. */
function organizationNode(site: string): JsonLdNode {
	return {
		"@type": "Organization",
		"@id": `${site}#organization`,
		name: siteTitle,
		alternateName: displayName,
		url: site,
		logo: abs("/avatar.png", site),
		image: abs("/og.png", site),
		description: siteDescription,
		email: email(),
		founder: { "@id": `${site}#person` },
		sameAs: sameAs(),
		contactPoint: [
			{
				"@type": "ContactPoint",
				contactType: "general enquiries",
				email: email(),
				url: abs("/contact/", site),
				availableLanguage: ["English", "Spanish"],
			},
			{
				"@type": "ContactPoint",
				contactType: "security",
				email: email(),
				url: abs("/contact/", site),
				availableLanguage: ["English", "Spanish"],
			},
		],
	};
}

function websiteNode(site: string): JsonLdNode {
	return {
		"@type": "WebSite",
		"@id": `${site}#website`,
		name: siteTitle,
		url: site,
		description: siteDescription,
		inLanguage: "en",
		publisher: { "@id": `${site}#organization` },
		author: { "@id": `${site}#person` },
	};
}

function affiliationNodes(site: string): JsonLdNode[] {
	return [
		{
			"@type": "Organization",
			"@id": `${site}#redguild`,
			name: org.name,
			url: org.url,
		},
		{
			"@type": "Organization",
			"@id": `${site}#hacktandil`,
			name: hacktandil.name,
			url: hacktandil.url,
		},
	];
}

/** Homepage: ProfilePage whose main entity is the Person. */
export function homeJsonLd(site: string): JsonLdNode {
	const base = site.replace(/\/?$/, "/");

	return {
		"@context": "https://schema.org",
		"@graph": [
			personNode(base),
			organizationNode(base),
			websiteNode(base),
			...affiliationNodes(base),
			{
				"@type": "ProfilePage",
				"@id": `${base}#webpage`,
				url: base,
				name: siteTitle,
				description: siteDescription,
				inLanguage: "en",
				isPartOf: { "@id": `${base}#website` },
				about: { "@id": `${base}#person` },
				mainEntity: { "@id": `${base}#person` },
				primaryImageOfPage: abs("/og.png", base),
				hasPart: projects.map((p) => ({
					"@type": "CreativeWork",
					name: p.name,
					url: p.url,
					description: p.description,
					creator: { "@id": `${base}#person` },
				})),
			},
		],
	};
}

export function aboutJsonLd(site: string, description: string): JsonLdNode {
	const base = site.replace(/\/?$/, "/");

	return {
		"@context": "https://schema.org",
		"@graph": [
			personNode(base),
			organizationNode(base),
			...affiliationNodes(base),
			{
				"@type": "AboutPage",
				"@id": `${base}about/#webpage`,
				url: abs("/about/", base),
				name: `About ${displayName}`,
				description,
				inLanguage: "en",
				isPartOf: { "@id": `${base}#website` },
				mainEntity: { "@id": `${base}#person` },
			},
		],
	};
}

export function contactJsonLd(site: string, description: string): JsonLdNode {
	const base = site.replace(/\/?$/, "/");

	return {
		"@context": "https://schema.org",
		"@graph": [
			personNode(base),
			organizationNode(base),
			...affiliationNodes(base),
			{
				"@type": "ContactPage",
				"@id": `${base}contact/#webpage`,
				url: abs("/contact/", base),
				name: `Contact ${displayName}`,
				description,
				inLanguage: "en",
				isPartOf: { "@id": `${base}#website` },
				mainEntity: { "@id": `${base}#organization` },
			},
		],
	};
}
