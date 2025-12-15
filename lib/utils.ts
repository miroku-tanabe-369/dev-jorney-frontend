import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * クラス名をマージするユーティリティ関数
 * 
 * clsxとtailwind-mergeを使用して、クラス名を安全にマージします
 * Tailwind CSSのクラス名の競合を解決します
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

