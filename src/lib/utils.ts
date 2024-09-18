import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function dirtyValues(
    dirtyFields: object | boolean,
    allValues: object,
): object {
    if (dirtyFields === true || Array.isArray(dirtyFields)) return allValues
    return Object.fromEntries(
        Object.keys(dirtyFields).map((key) => [
            key,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            dirtyValues(dirtyFields[key], allValues[key]),
        ]),
    )
}
