import { type Account, AccountService } from "@/stores/account/types";
import type { Period } from "./shared/Period";
import { useAttendanceStore } from "@/stores/attendance";
import { Attendance } from "./shared/Attendance";

export async function updateAttendancePeriodsInCache <T extends Account> (account: T): Promise<void> {
  let periods: Period[] = [];
  let defaultPeriod: string;

  switch (account.service) {
    case AccountService.Pronote: {
      const { getAttendancePeriods } = await import("./pronote/attendance");
      const output = getAttendancePeriods(account);

      periods = output.periods;
      defaultPeriod = output.default;

      break;
    }
    case AccountService.Local: {
      periods = [
        {
          name: "Toutes",
          startTimestamp: new Date("2021-09-01").getTime(),
          endTimestamp: new Date("2022-06-30").getTime(),
        },
      ];

      defaultPeriod = "Toutes";

      break;
    }
    default:
      throw new Error("Service not implemented");
  }

  useAttendanceStore.getState().updatePeriods(periods, defaultPeriod);
}

export async function updateAttendanceInCache <T extends Account> (account: T, periodName: string): Promise<void> {
  let attendance: Attendance;

  switch (account.service) {
    case AccountService.Pronote: {
      const { getAttendance } = await import("./pronote/attendance");
      attendance = await getAttendance(account, periodName);

      break;
    }
    case AccountService.Local: {
      attendance = {
        delays: [],
        absences: [],
        punishments: [],
        observations: []
      };

      break;
    }
    default:
      throw new Error("Service not implemented");
  }

  useAttendanceStore.getState().updateAttendance(periodName, attendance);
}
