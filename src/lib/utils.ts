import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ZodSchema } from 'zod';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function zodParseJSON<T>(schema: ZodSchema<T>) {
  return (input: string): T => schema.parse(JSON.parse(input));
}
