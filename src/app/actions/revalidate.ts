"use server";

import { revalidatePath } from "next/cache";

export async function forceRefresh() {
  revalidatePath("/");
  return { success: true };
}
