import { create } from "zustand";
import { persist } from "zustand/middleware";


interface AuthState {
  token:       string | null;
  role:        string | null;
  address:     string | null;
  participantId: string | null;
  login:  (token: string, role: string, address: string, id: string) => void;
  logout: () => void;
}


export const useAuthStore = create<AuthState>()(persist(
  set => ({
    token:         null,
    role:          null,
    address:       null,
    participantId: null,
    login:  (token, role, address, participantId) =>
              set({ token, role, address, participantId }),
    logout: () => set({ token:null, role:null, address:null, participantId:null }),
  }),
  { name: "pharmachain-auth" }
));

