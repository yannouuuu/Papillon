import AsyncStorage from "@react-native-async-storage/async-storage";
import { createJSONStorage, persist } from "zustand/middleware";
import { create } from "zustand";

import type { HomeworkStore } from "@/stores/homework/types";

export const useHomeworkStore = create<HomeworkStore>()(
  persist(
    (set) => ({
      homeworks: {},
      updateHomeworks: (weekNumber, homeworks) => {
        console.log(`[homework:updateHomeworks]: updating classes for week ${weekNumber}`);

        set((state) => {
          return {
            homeworks: {
              ...state.homeworks,
              [weekNumber]: homeworks
            }
          };
        });

        console.log(`[homework:updateHomeworks]: updated classes for week ${weekNumber}`);
      }
    }),
    {
      name: "<default>-homework-storage", // <default> will be replace to user id when using "switchTo"
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);
