import { revalidatePath, revalidateTag } from "next/cache";

declare function updateTag(tag: string): void;

export async function POST(): Promise<Response> {
  revalidateTag("posts");
  revalidateTag("orphan");
  updateTag("home");
  revalidatePath("/blog");

  return new Response("ok");
}
