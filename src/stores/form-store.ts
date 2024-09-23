import { createStore } from 'zustand/vanilla'

export type FormState = {
    dirtyFormExists: boolean
}

export type FormActions = {
    setDirtyFormExists: (value: boolean) => void
}

export type FormStore = FormState & FormActions

export const initFormStore = (): FormState => {
    return { dirtyFormExists: false }
}

export const defaultInitState: FormState = {
    dirtyFormExists: false,
}

export const createFormStore = (initState: FormState = defaultInitState) => {
    return createStore<FormStore>()((set) => ({
        ...initState,
        setDirtyFormExists: (value: boolean) =>
            set(() => ({ dirtyFormExists: value })),
    }))
}
