'use client'

import {
    createCategoryStore,
    initCategoryStore,
    type CategoryStore,
} from '@/stores/category-store'
import { createContext, useContext, useRef, type ReactNode } from 'react'
import { useStore } from 'zustand'

export type CategoryStoreApi = ReturnType<typeof createCategoryStore>

export const CategoryStoreContext = createContext<CategoryStoreApi | undefined>(
    undefined,
)

export interface CategoryStoreProviderProps {
    children: ReactNode
}

export const CategoryStoreProvider = ({
    children,
}: CategoryStoreProviderProps) => {
    const storeRef = useRef<CategoryStoreApi>()
    if (!storeRef.current) {
        storeRef.current = createCategoryStore(initCategoryStore())
    }

    return (
        <CategoryStoreContext.Provider value={storeRef.current}>
            {children}
        </CategoryStoreContext.Provider>
    )
}

export const useCategoryStore = <T,>(
    selector: (store: CategoryStore) => T,
): T => {
    const categoryStoreContext = useContext(CategoryStoreContext)
    if (!categoryStoreContext) {
        throw new Error(
            `useCategoryStore must be used within CategoryStoreProvider`,
        )
    }
    return useStore(categoryStoreContext, selector)
}
