"use server";

import { revalidateTag } from "next/cache";

export async function refreshShop() {
  revalidateTag("shop");
}
