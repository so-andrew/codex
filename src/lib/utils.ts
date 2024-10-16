import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function dirtyValues(
    dirtyFields: object | boolean,
    allValues: object,
): object {
    //console.log(dirtyFields, allValues, typeof allValues)
    if (dirtyFields === true || Array.isArray(dirtyFields)) return allValues

    const obj = Object.fromEntries(
        Object.keys(dirtyFields).map((key) => [
            key,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            dirtyValues(dirtyFields[key], allValues[key]),
        ]),
    )
    return obj
}

export const moneyFormat = Intl.NumberFormat('en-US', {
    currency: 'USD',
    currencyDisplay: 'symbol',
    currencySign: 'standard',
    style: 'currency',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
})

export function formatAsCurrency(current: string) {
    return current.replace(/[^\d\.]/g, '')
}

export function currencyDisplayHandleChange(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    change: Function,
    formatted: string,
) {
    const digits = formatAsCurrency(formatted)
    const value = Number(parseFloat(digits).toFixed(2))
    change(value)
}
