import { revalidatePath } from "next/cache";

export async function refreshBlog(): Promise<void> {
  "use server";
  revalidatePath("/blog");
}
