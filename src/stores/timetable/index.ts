import AsyncStorage from "@react-native-async-storage/async-storage";
import { createJSONStorage, persist } from "zustand/middleware";
import { create } from "zustand";

import type { TimetableStore } from "@/stores/timetable/types";

export const useTimetableStore = create<TimetableStore>()(
  persist(
    (set) => ({
      timetables: {},
      updateClasses: (weekNumber, classes) => {
        console.log(`[timetable:updateClasses]: updating classes for week ${weekNumber}`);

        set((state) => {
          return {
            timetables: {
              ...state.timetables,
              [weekNumber]: classes
            }
          };
        });

        console.log(`[timetable:updateClasses]: updated classes for week ${weekNumber}`);
      }
    }),
    {
      name: "<default>-timetable-storage", // <default> will be replace to user id when using "switchTo"
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);
