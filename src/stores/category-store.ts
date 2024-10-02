import { type Category } from '@/server/db/schema'
import { createStore } from 'zustand/vanilla'

export type CategoryState = {
    categories: Category[]
}

export type CategoryActions = {
    setCategories: (data: Category[]) => void
}

export type CategoryStore = CategoryState & CategoryActions

export const initCategoryStore = (): CategoryState => {
    return { categories: [] as Category[] }
}

export const defaultInitState: CategoryState = {
    categories: [] as Category[],
}

export const createCategoryStore = (
    initState: CategoryState = defaultInitState,
) => {
    return createStore<CategoryStore>()((set) => ({
        ...initState,
        setCategories: (data: Category[]) => set(() => ({ categories: data })),
    }))
}
