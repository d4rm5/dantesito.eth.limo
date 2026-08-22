import type { APIRoute } from "astro";
import { renderAboutMarkdown } from "../data/pages";

export const GET: APIRoute = async (context) => {
	const siteUrl = context.site?.toString() ?? "";

	return new Response(renderAboutMarkdown(siteUrl), {
		status: 200,
		headers: {
			"Content-Type": "text/markdown; charset=utf-8",
			"Cache-Control": "public, max-age=3600",
		},
	});
};
