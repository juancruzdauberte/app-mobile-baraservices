// src/store/authFlow.store.ts
import { create } from "zustand";
export type Role = "CLIENTE" | "PROFESIONAL";
type AuthFlowState = {
  pendingRole: Role | null;
  setPendingRole: (role: Role | null) => void;
  clearPendingRole: () => void;
};
export const useAuthFlowStore = create<AuthFlowState>((set) => ({
  pendingRole: null,
  setPendingRole: (role) => set({ pendingRole: role }),
  clearPendingRole: () => set({ pendingRole: null }),
}));
