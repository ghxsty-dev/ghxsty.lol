import { NextResponse } from "next/server";

type TenorResult = {
  id: string;
  content_description?: string;
  media_formats?: {
    gif?: { url?: string; dims?: number[] };
    tinygif?: { url?: string; dims?: number[] };
  };
};

export async function GET(request: Request) {
  const apiKey = process.env.TENOR_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "TENOR_API_KEY tanımlı değil." },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim().slice(0, 80) || "anime";
  const url = new URL("https://tenor.googleapis.com/v2/search");
  url.searchParams.set("key", apiKey);
  url.searchParams.set("q", query);
  url.searchParams.set("limit", "16");
  url.searchParams.set("media_filter", "gif,tinygif");
  url.searchParams.set("contentfilter", "medium");

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: "Tenor araması başarısız." },
      { status: response.status },
    );
  }

  const payload = (await response.json()) as { results?: TenorResult[] };
  return NextResponse.json({
    results: (payload.results ?? [])
      .map((result) => {
        const media = result.media_formats?.tinygif ?? result.media_formats?.gif;
        return {
          id: result.id,
          title: result.content_description ?? "GIF",
          url: media?.url,
          width: media?.dims?.[0] ?? 220,
          height: media?.dims?.[1] ?? 160,
        };
      })
      .filter((result) => Boolean(result.url)),
  });
}
