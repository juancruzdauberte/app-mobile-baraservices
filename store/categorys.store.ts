import { create } from "zustand";
import { Categories } from "../types/types";
type CategoriesStore = {
  categories: Categories | null;
  setCategories: (categories: Categories | null) => void;
};
export const useCategoriesStore = create<CategoriesStore>((set) => ({
  categories: null,
  setCategories: (categories) => set({ categories }),
}));
