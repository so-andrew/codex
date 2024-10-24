'use client'

import {
    createFormStore,
    initFormStore,
    type FormStore,
} from '@/stores/form-store'
import { createContext, useContext, useRef, type ReactNode } from 'react'
import { useStore } from 'zustand'

export type FormStoreApi = ReturnType<typeof createFormStore>

export const FormStoreContext = createContext<FormStoreApi | undefined>(
    undefined,
)

export interface FormStoreProviderProps {
    children: ReactNode
}

export const FormStoreProvider = ({ children }: FormStoreProviderProps) => {
    const storeRef = useRef<FormStoreApi>(undefined)
    if (!storeRef.current) {
        storeRef.current = createFormStore(initFormStore())
    }

    return (
        <FormStoreContext.Provider value={storeRef.current}>
            {children}
        </FormStoreContext.Provider>
    )
}

export const useFormStore = <T,>(selector: (store: FormStore) => T): T => {
    const formStoreContext = useContext(FormStoreContext)

    if (!formStoreContext) {
        throw new Error(`useFormStore must be used within FormStoreProvider`)
    }

    return useStore(formStoreContext, selector)
}
