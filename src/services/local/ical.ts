import { Account } from "@/stores/account/types";
import { Timetable } from "../shared/Timetable";
import { useTimetableStore } from "@/stores/timetable";
import { dateToEpochWeekNumber } from "@/utils/epochWeekNumber";
import { reduceIcalToCourse } from "./utils/reduceIcalToCourse";
const icalParser = require("cal-parser");

const MERGE_THRESHOLD = 20 * 60 * 1000; // 20 minutes in milliseconds

export const fetchIcalData = async (account: Account, force = false): Promise<Timetable> => {
  const identityProvider = account.identityProvider || "";
  const courses: Timetable[] = [];

  const icalURLs = account.personalization.icalURLs || [];

  for (const ical of icalURLs) {
    await fetch(ical.url).then(res => res.text()).then(text => {
      const parsed = icalParser.parseString(text).events;
      for (const event of parsed) {
        courses.push(reduceIcalToCourse(event, identityProvider, ical.url));
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

  // merge courses with same subject, room, title and itemType, and less than 20 minutes between them
  for (const { courses } of coursesByEpochWeekNumber) {
    courses.sort((a, b) => a.startTimestamp - b.startTimestamp);

    const mergedCourses = courses.reduce((acc, course) => {
      const lastCourse = acc[acc.length - 1];
      if (lastCourse &&
          lastCourse.subject === course.subject &&
          lastCourse.room === course.room &&
          lastCourse.title === course.title &&
          lastCourse.itemType === course.itemType &&
          course.startTimestamp - lastCourse.endTimestamp <= MERGE_THRESHOLD) {
        lastCourse.endTimestamp = Math.max(lastCourse.endTimestamp, course.endTimestamp);
      } else {
        acc.push(course);
      }
      return acc;
    }, []);

    courses.splice(0, courses.length, ...mergedCourses);
  }

  // for each week, sort by startTimestamp
  for (const { courses } of coursesByEpochWeekNumber) {
    courses.sort((a, b) => a.startTimestamp - b.startTimestamp);
  }

  for (const { epochWeekNumber, courses } of coursesByEpochWeekNumber) {
    useTimetableStore.getState().updateClasses(epochWeekNumber, courses);
  }

  return coursesByEpochWeekNumber;
};