import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function capitalizeInputText(value: string) {
  if (typeof value !== "string") return "";

  return value
    .replace(/\s+/g, " ")
    .trimStart()
    .toLowerCase()
    .replace(/\b([a-z0-9])/g, (char) => char.toUpperCase());
}

export function uppercaseDbText(value: string) {
  if (typeof value !== "string") return "";

  return value.replace(/\s+/g, " ").trim().toUpperCase();
}
