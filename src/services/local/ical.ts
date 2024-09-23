import { Account } from "@/stores/account/types";
import { Timetable } from "../shared/Timetable";
import { useTimetableStore } from "@/stores/timetable";
import { dateToEpochWeekNumber, epochWNToPronoteWN } from "@/utils/epochWeekNumber";
import { reduce } from "lodash";
import { reduceIcalToCourse } from "./utils/reduceIcalToCourse";
const icalParser = require("cal-parser");

export const fetchIcalData = async (account: Account, force = false): Promise<Timetable> => {
  const identityProvider = account.identityProvider || "";
  const courses: Timetable[] = [];

  const icalURLs = account.personalization.icalURLs || [];

  for (const ical of icalURLs) {
    await fetch(ical.url).then(res => res.text()).then(text => {
      const parsed = icalParser.parseString(text).events;
      for (const event of parsed) {
        courses.push(reduceIcalToCourse(event, identityProvider));
      }
    });
  }

  const coursesByEpochWeekNumber = courses.reduce((acc, course) => {
    const epochWeekNumber = dateToEpochWeekNumber(new Date(course.startTimestamp));
    if (acc.find((c) => c.epochWeekNumber === epochWeekNumber)) {
      acc.find((c) => c.epochWeekNumber === epochWeekNumber).courses.push(course);
    }
    else {
      acc.push({ epochWeekNumber, courses: [course] });
    }
    return acc;
  }, []);

  for (const { epochWeekNumber, courses } of coursesByEpochWeekNumber) {
    useTimetableStore.getState().updateClasses(epochWeekNumber, courses);
  }

  return coursesByEpochWeekNumber;
};