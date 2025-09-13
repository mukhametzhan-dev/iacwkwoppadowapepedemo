import { create } from 'zustand';
import { MemecoinConcept } from '@/types/memecoin';

interface LaunchModalStore {
  isOpen: boolean;
  selectedConcept: MemecoinConcept | null;
  openModal: (concept?: MemecoinConcept) => void;
  closeModal: () => void;
}

export const useLaunchModalStore = create<LaunchModalStore>((set) => ({
  isOpen: false,
  selectedConcept: null,
  openModal: (concept) => set({ isOpen: true, selectedConcept: concept || null }),
  closeModal: () => set({ isOpen: false, selectedConcept: null }),
}));