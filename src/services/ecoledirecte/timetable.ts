import type { EcoleDirecteAccount } from "@/stores/account/types";
import type { Timetable, TimetableClass } from "../shared/Timetable";
import { ErrorServiceUnauthenticated } from "../shared/errors";
import { TimetableItemKind } from "pawdirecte";
import ecoledirecte from "pawdirecte";

const decodeTimetableClass = (c: ecoledirecte.TimetableItem): TimetableClass => {
  const base = {
    startTimestamp: c.start_date.getTime(),
    endTimestamp: c.end_date.getTime(),
    additionalNotes: c.notes,
    backgroundColor: c.color
  };

  if (c.kind === TimetableItemKind.COURS) {
    return {
      type: "lesson",
      id: c.id,
      subject: c.subject_short_name,
      title: c.subject_name,
      room: c.room || void 0,
      teacher: c.teacher ?? void 0,
      // TODO: add more states
      status: c.updated ? "Cours modifié": "",
      ...base
    } satisfies TimetableClass;
  }
  // else if (c.is === "activity") {
  //   return {
  //     type: "activity",
  //     title: c.title,
  //     ...base
  //   } satisfies TimetableClass;
  // }
  else if (c.kind === TimetableItemKind.PERMANENCE) {
    return {
      type: "detention",
      subject: c.subject_name,
      id: c.id,
      title: c.subject_name ?? "Sans titre",
      room: c.room || void 0,
      ...base
    } satisfies TimetableClass;
  }

  throw new Error("pronote: unknown class type");
};

export const getTimetableForWeek = async (account: EcoleDirecteAccount, weekNumber: number): Promise<Timetable> => {
  if (!account.instance)
    throw new ErrorServiceUnauthenticated("ecoledirecte");

  // TODO: test this method, not sure
  const date = (1 + (weekNumber - 1) * 7); // 1st of January + 7 days for each week
  const startDate = new Date();
  startDate.setDate(date);
  const endDate = new Date();
  endDate.setDate(date + 7);

  // TODO: put real values for arguments
  const timetable = await ecoledirecte.studentTimetable(account.instance, account.instance, startDate, endDate);
  // TODO: parse timetable

  return timetable.map(decodeTimetableClass);
};
