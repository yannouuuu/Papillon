import type {EcoleDirecteAccount} from "@/stores/account/types";
import {Timetable, TimetableClass, TimetableClassStatus} from "../shared/Timetable";
import {ErrorServiceUnauthenticated} from "../shared/errors";
import ecoledirecte, {TimetableItemKind} from "pawdirecte";

const decodeTimetableClass = (c: ecoledirecte.TimetableItem): TimetableClass => {
  const base = {
    startTimestamp: c.startDate.getTime(),
    endTimestamp: c.startDate.getTime(),
    additionalNotes: c.notes,
    backgroundColor: c.color
  };

  switch (c.kind) {
    case TimetableItemKind.COURS:
      return {
        type: "lesson",
        id: c.id,
        subject: c.subjectShortName,
        title: c.subjectName,
        room: c.room || void 0,
        teacher: c.teacher ?? void 0,
        // TODO: add more states
        status: c.updated ? TimetableClassStatus.MODIFIED: void 0,
        ...base
      } satisfies TimetableClass;
    case TimetableItemKind.PERMANENCE:
      return {
        type: "detention",
        subject: c.subjectName,
        id: c.id,
        title: c.subjectName ?? "Sans titre",
        room: c.room || void 0,
        ...base
      };
    case TimetableItemKind.CONGE:
      return {
        type: "vacation",
        subject: c.subjectName,
        id: c.id,
        title: "Congés",
        room: void 0,
        ...base
      };
    default:
      break;
  }

  throw new Error("ecoledirecte: unknown class type");
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

  const timetable = await ecoledirecte.studentTimetable(account.authentication.session, account.authentication.account, startDate, endDate);
  // TODO: parse timetable

  return timetable.map(decodeTimetableClass);
};
