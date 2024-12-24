"use client";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Redirect({ to }: { to: string }) {
  const router = useRouter();

  useEffect(() => {
    router.push(`/login?next=${encodeURIComponent(to)}`);
  }, [to]);

  return null;
}
