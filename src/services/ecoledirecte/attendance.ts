import ecoledirecte from "pawdirecte";
import { type Homework } from "@/services/shared/Homework";
import { EcoleDirecteAccount } from "@/stores/account/types";
import { ErrorServiceUnauthenticated } from "../shared/errors";
import { weekNumberToDaysList } from "@/utils/epochWeekNumber";
import { log } from "@/utils/logger/logger";
import { Attendance } from "../shared/Attendance";

export const getAttendance = async (
  account: EcoleDirecteAccount,
): Promise<Attendance> => {
  if (!account.authentication.session)
    throw new ErrorServiceUnauthenticated("ecoledirecte");

  let att = await ecoledirecte.studentAttendance(
    account.authentication.session,
    account.authentication.account,
  );

  let punishments = att.punishments;
  let delays = att.absences
    .filter((a) => a.kind === "Retard")
    .map((delay) => {
      let range = dateStringAsTimeInterval(delay.displayDate);
      if (range?.end && range.start)
        return {
          id: delay.id,
          timestamp: new Date(range.start),
          duration:
            (new Date(range.end).getTime() - new Date(range.start).getTime()) /
            (60 * 1000),
          justified: delay.justified,
          justification: delay.comment,
          reasons: delay.reason ?? void 0,
        };
    });

  let absences = att.absences
    .filter((a) => a.kind === "Absence")
    .map((absence) => {
      let range = dateStringAsTimeInterval(absence.displayDate);
      if (range?.end && range.start) {
        let duration = new Date(
          new Date(range.end).getTime() - new Date(range.start).getTime(),
        );

        return {
          id: absence.id,
          fromTimestamp: new Date(range.start).getTime(),
          toTimestamp: new Date(range.end).getTime(),
          justified: absence.justified,
          hours: duration.getHours() + "h" + duration.getMinutes(),
          administrativelyFixed: absence.justified,
          reasons: absence.reason,
        };
      }
    });
  return {
    punishments: [],
    absences: absences,
    delays: delays,
    observations: [],
  };
};

export type Timeinterval = {
  start: string;
  end: string;
};

export function dateAsISO860 (str: string): string {
  const parts = str.split(" ");
  let month = "01";
  switch (parts[2]) {
    case "janvier":
      month = "01";
      break;
    case "février":
      month = "02";
      break;
    case "mars":
      month = "03";
      break;
    case "avril":
      month = "04";
      break;
    case "mai":
      month = "05";
      break;
    case "juin":
      month = "06";
      break;
    case "juillet":
      month = "07";
      break;
    case "août":
      month = "08";
      break;
    case "septembre":
      month = "09";
      break;
    case "octobre":
      month = "10";
      break;
    case "novembre":
      month = "11";
      break;
    case "décembre":
      month = "12";
      break;
  }
  return (
    parts[3] + "-" + month + "-" + parts[1] + "T" + parts[5] + ":00.000+02:00"
  );
}

export function dateStringAsTimeInterval (
  str: string,
): Timeinterval | undefined {
  if (str.includes("du")) {
    /**
     * @example
     * str is equal to "du mercredi 21 février 2024 au jeudi 22 février 2024"
     */
    const parts = str.split("au");
    const start = dateAsISO860(parts[0].replace("du", "").trim());
    const end = dateAsISO860(parts[1].trim());
    return { start: start, end: end } as Timeinterval;
  }
  if (str.includes("le")) {
    /**
     * @example
     * str is equal to "le mercredi 21 février 2024 de 08:55 à 09:45"
     * or "le mercredi 21 février 2024"
     */
    const parts = str.split("à");

    let startDate, endDate;

    // C'est une journée complète ("le mercredi 21 février 2024")
    if (!str.includes(":")) {
      startDate = parts[0].replace("le", "").trim() + " de 00:00";
      endDate = parts[0].split("de")[0].replace("le", "").trim() + " de 23:59";
    } else {
      startDate = parts[0].replace("le", "").trim();
      endDate =
        parts[0].split("de")[0].replace("le", "").trim() +
        " de " +
        parts[1].trim();
    }
    const start = dateAsISO860(startDate);
    const end = dateAsISO860(endDate);
    return { start: start, end: end } as Timeinterval;
  }
  return undefined;
}
