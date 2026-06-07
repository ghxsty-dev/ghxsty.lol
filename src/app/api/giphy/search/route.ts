import { NextResponse } from "next/server";

type GiphyImage = {
  url?: string;
  width?: string;
  height?: string;
};

type GiphyResult = {
  id: string;
  title?: string;
  images?: {
    fixed_height_small?: GiphyImage;
    downsized_medium?: GiphyImage;
    original?: GiphyImage;
  };
};

export async function GET(request: Request) {
  const apiKey = process.env.GIPHY_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GIPHY_API_KEY tanımlı değil." },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim().slice(0, 80) || "anime";
  const url = new URL("https://api.giphy.com/v1/gifs/search");
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("q", query);
  url.searchParams.set("limit", "16");
  url.searchParams.set("rating", "pg-13");
  url.searchParams.set("lang", "tr");

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: "GIPHY araması başarısız." },
      { status: response.status },
    );
  }

  const payload = (await response.json()) as { data?: GiphyResult[] };
  return NextResponse.json({
    results: (payload.data ?? [])
      .map((result) => {
        const image =
          result.images?.fixed_height_small ??
          result.images?.downsized_medium ??
          result.images?.original;

        return {
          id: result.id,
          title: result.title || "GIPHY GIF",
          url: image?.url,
          width: Number(image?.width ?? 220),
          height: Number(image?.height ?? 160),
        };
      })
      .filter((result) => Boolean(result.url)),
  });
}
