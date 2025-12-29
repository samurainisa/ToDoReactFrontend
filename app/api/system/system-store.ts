import { create } from "zustand";

type SystemStore = {
  loading: boolean;
  incrementLoadingCounter: () => void;
  decrementLoadingCounter: () => void;
  resetLoading: () => void;
};

let loadingCounter = 0;

export const useSystemStore = create<SystemStore>((set) => ({
  loading: false,

  incrementLoadingCounter: () => {
    loadingCounter += 1;
    set({ loading: true });
  },

  decrementLoadingCounter: () => {
    if (loadingCounter > 0) loadingCounter -= 1;
    if (loadingCounter <= 0) set({ loading: false });
  },

  resetLoading: () => {
    loadingCounter = 0;
    set({ loading: false });
  },
}));

