// src/store/authFlow.store.ts
import { create } from "zustand";
import { Role, User } from "../types/types";
type AuthFlowState = {
  pendingRole: Role | null;
  setPendingRole: (role: Role | null) => void;
  clearPendingRole: () => void;
  user: User | null;
  setUser: (user: User | null) => void;
};
export const useAuthFlowStore = create<AuthFlowState>((set) => ({
  pendingRole: null,
  setPendingRole: (role) => set({ pendingRole: role }),
  clearPendingRole: () => set({ pendingRole: null }),
  user: null,
  setUser: (user) => set({ user }),
}));
