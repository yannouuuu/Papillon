import AsyncStorage from "@react-native-async-storage/async-storage";
import { createJSONStorage, persist } from "zustand/middleware";
import { create } from "zustand";

import type { NewsStore } from "@/stores/news/types";

export const useNewsStore = create<NewsStore>()(
  persist(
    (set) => ({
      informations: [],
      updateInformations: (informations) => {
        console.log("[news:updateInformations]: updating store...");
        set(() => ({ informations }));
        console.log("[news:updateInformations]: updated store.");
      }
    }),
    {
      name: "<default>-news-storage", // <default> will be replace to user id when using "switchTo"
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);
