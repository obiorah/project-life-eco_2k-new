import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Function to merge Tailwind classes, handling conflicts
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Keep any other existing utility functions below...
