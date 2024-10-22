import { type DateRange } from 'react-day-picker'
import { createStore } from 'zustand/vanilla'

export type DatePickerState = {
    dateRange: DateRange | undefined
}

export type DatePickerActions = {
    setDateRange: (value: DateRange) => void
    resetDateRange: () => void
}

export type DatePickerStore = DatePickerState & DatePickerActions

export const initDatePickerStore = (): DatePickerState => {
    return { dateRange: { from: new Date() } }
}

export const defaultInitState: DatePickerState = {
    dateRange: { from: new Date() },
}

export const createDatePickerStore = (
    initState: DatePickerState = defaultInitState,
) => {
    return createStore<DatePickerStore>()((set) => ({
        ...initState,
        setDateRange: (value?: DateRange) => set(() => ({ dateRange: value })),
        resetDateRange: () => set(() => ({ dateRange: undefined })),
    }))
}
