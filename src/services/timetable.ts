import { type Account, AccountService } from "@/stores/account/types";
import { useTimetableStore } from "@/stores/timetable";
import { epochWNToPronoteWN } from "@/utils/epochWeekNumber";

/**
 * Updates the state and cache for the timetable of given week number.
 */
export async function updateTimetableForWeekInCache <T extends Account> (account: T, epochWeekNumber: number): Promise<void> {
  switch (account.service) {
    case AccountService.Pronote: {
      const { getTimetableForWeek } = await import("./pronote/timetable");
      const weekNumber = epochWNToPronoteWN(epochWeekNumber, account);
      const timetable = await getTimetableForWeek(account, weekNumber);
      useTimetableStore.getState().updateClasses(epochWeekNumber, timetable);
      break;
    }
    case AccountService.Local: {
      const timetable = [];
      useTimetableStore.getState().updateClasses(epochWeekNumber, []);
      break;
    }
    case AccountService.EcoleDirecte: {
      const { getTimetableForWeek } = await import("./ecoledirecte/timetable");
      const timetable = await getTimetableForWeek(account, weekNumber);
      useTimetableStore.getState().updateClasses(weekNumber, timetable);
      break;
    }
    default: {
      throw new Error("Service not implemented.");
    }
  }
}
