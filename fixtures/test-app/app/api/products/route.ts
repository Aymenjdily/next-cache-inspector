import { revalidateTag } from "next/cache";

export async function GET(): Promise<Response> {
  const data = await fetch("https://example.com/api/products", {
    cache: "force-cache",
    next: { tags: ["products"], revalidate: 60 },
  });

  return new Response(JSON.stringify(await data.json()));
}

export async function POST(): Promise<Response> {
  revalidateTag("products");
  return new Response("ok");
}
