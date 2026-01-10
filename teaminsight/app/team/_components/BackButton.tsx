"use client";

import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="rounded-xl border px-3 py-2 text-sm"
    >
      Back
    </button>
  );
}
