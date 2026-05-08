import { create } from "zustand";
import { Professional } from "../types/types";
type ProfessionalStore = {
  professional: Professional | null;
  setProfessional: (professional: Professional | null) => void;
};
export const useProfessionalStore = create<ProfessionalStore>((set) => ({
  professional: null,
  setProfessional: (professional) => set({ professional }),
}));
