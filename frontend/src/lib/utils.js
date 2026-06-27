import { clsx } from "clsx";
import { bgGradient } from "tailwind-merge"; // Just standard tailwind-merge
import { PureComponent } from "react";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
