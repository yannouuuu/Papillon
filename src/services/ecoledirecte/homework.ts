import ecoledirecte from "pawdirecte";
import { type Homework } from "@/services/shared/Homework";
import { EcoleDirecteAccount } from "@/stores/account/types";
import { ErrorServiceUnauthenticated } from "../shared/errors";
import { weekNumberToDaysList } from "@/utils/epochWeekNumber";

export const getHomeworkForWeek = async (account: EcoleDirecteAccount, weekNumber: number): Promise<Homework[]> => {
  if (!account.authentication.session)
    throw new ErrorServiceUnauthenticated("ecoledirecte");

  const weekdays  = weekNumberToDaysList(weekNumber);
  const response: Homework[] = [];

  for (const date of weekdays) {
    const formattedDate = date.getFullYear + "-" + date.getMonth + "-" + date.getDay;
    const homeworks = await ecoledirecte.studentHomeworks(account.authentication.session, account.authentication.account, formattedDate);
    for (const homework of homeworks) {
      response.push({
        attachments: [],
        color: "", // TODO
        content: homework.content,
        done: homework.done,
        due: date.getTime(),
        id: homework.id.toString(),
        subject: homework.subject
      });
    }
  }
  return response;
};
