import ecoledirecte from "pawdirecte";
import { type Homework, HomeworkReturnType } from "@/services/shared/Homework";
import { EcoleDirecteAccount } from "@/stores/account/types";
import { Timetable } from "pawnote";
import { ErrorServiceUnauthenticated } from "../shared/errors";
import { weekNumberToDateRange } from "@/utils/epochWeekNumber";
import { da } from "date-fns/locale";
const EPOCH_WN_CONFIG = {
  setHour: 6, // We are in Europe, so we set the hour to 6 UTC to avoid any problem with the timezone (= 2h in the morning in Summer Paris timezone)
  setStartDay: 1, // We set the first day of the week to Monday to ensure that the week number is the same for the whole world
  setMiddleDay: 3, // We set the middle day of the week to Wednesday to ensure <... same than above ...>
  setEndDay: 7, // We set the last day of the week to Sunday to ensure <...>
  numberOfMsInAWeek: 1000 /* ms */ * 60 /* s */ * 60 /* min */ * 24 /* h */ * 7, /* days */
  adjustEpochInitialDate: 259200000, // =(((new Date(0)).getDay()-1) * EPOCH_WN_CONFIG.numberOfMsInAWeek/7) // We need to substract this for having a good range cause 01/01/1970 was not a Monday and the "-1" is to have Monday as the first day of the week
};

export const getHomeworkForWeek = async (account: EcoleDirecteAccount, weekNumber: number): Promise<Homework[]> => {
  if (!account.authentication.session)
    throw new ErrorServiceUnauthenticated("ecoledirecte");
  let homework = [];
  for (let i = 0; i < 7; i++) {
    let date = new Date(
      weekNumber * EPOCH_WN_CONFIG.numberOfMsInAWeek + (i/7)
       * EPOCH_WN_CONFIG.numberOfMsInAWeek
      - EPOCH_WN_CONFIG.adjustEpochInitialDate
      + 0 * EPOCH_WN_CONFIG.numberOfMsInAWeek
    );
    let formattedDate = date.getFullYear + "-" + date.getMonth + "-" + date.getDay;

    let dailyHW = await ecoledirecte.studentHomeworks(account.authentication.session, account.authentication.account, formattedDate);

    homework.push(dailyHW.map((hw) => ({
      hw,
      due: formattedDate,
      color: "#91b2bc" //TODO: sync color with timetable
    })));
  }
  console.info(homework.flat());
  return homework.flat();

};
