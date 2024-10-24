'use client'

import {
    createDatePickerStore,
    initDatePickerStore,
    type DatePickerStore,
} from '@/stores/date-picker-store'
import { createContext, useContext, useRef, type ReactNode } from 'react'
import { useStore } from 'zustand'

export type DatePickerStoreApi = ReturnType<typeof createDatePickerStore>

export const DatePickerStoreContext = createContext<
    DatePickerStoreApi | undefined
>(undefined)

export interface DatePickerStoreProviderProps {
    children: ReactNode
}

export const DatePickerStoreProvider = ({
    children,
}: DatePickerStoreProviderProps) => {
    const storeRef = useRef<DatePickerStoreApi>(undefined)
    if (!storeRef.current) {
        storeRef.current = createDatePickerStore(initDatePickerStore())
    }

    return (
        <DatePickerStoreContext.Provider value={storeRef.current}>
            {children}
        </DatePickerStoreContext.Provider>
    )
}

export const useDatePickerStore = <T,>(
    selector: (store: DatePickerStore) => T,
): T => {
    const datePickerStoreContext = useContext(DatePickerStoreContext)

    if (!datePickerStoreContext) {
        throw new Error(
            `useDatePickerStore must be used within DatePickerStoreProvider`,
        )
    }

    return useStore(datePickerStoreContext, selector)
}
