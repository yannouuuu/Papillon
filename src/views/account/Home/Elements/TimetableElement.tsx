import { NativeListHeader } from "@/components/Global/NativeComponents";
import { updateTimetableForWeekInCache } from "@/services/timetable";
import { useCurrentAccount } from "@/stores/account";
import { AccountService } from "@/stores/account/types";
import { useTimetableStore } from "@/stores/timetable";
import { animPapillon } from "@/utils/ui/animations";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Reanimated, {
  LinearTransition
} from "react-native-reanimated";
import { TimetableItem } from "../../Lessons/Atoms/Item";
import { PapillonNavigation } from "@/router/refs";
import RedirectButton from "@/components/Home/RedirectButton";
import { TimetableClass } from "@/services/shared/Timetable";
import { translateToWeekNumber } from "pawnote"; // actually a reusable function !

const TimetableElement = () => {
  const account = useCurrentAccount(store => store.account!);
  const timetables = useTimetableStore(store => store.timetables);

  const [firstDate, setFirstDate] = useState(new Date("2024-09-01"));
  const [courses, setCourses] = useState<TimetableClass[]>([]);

  useEffect(() => {
    if (account.instance && account.service === AccountService.Pronote) {
      setFirstDate(account.instance.instance.firstDate);
    }
  }, [account?.instance]);

  const weekNumber = useMemo(() => {
    return translateToWeekNumber(new Date(), firstDate) || 1;
  }, [firstDate]);

  const [currentlyUpdating, setCurrentlyUpdating] = useState(false);

  useEffect(() => {
    if (!timetables[weekNumber] && !currentlyUpdating && account.instance) {
      setCurrentlyUpdating(true);
      updateTimetableForWeekInCache(account, weekNumber);
    }
  }, [weekNumber, currentlyUpdating, timetables, account?.instance]);

  const nextCourseIndex = useMemo(() => {
    if (timetables[weekNumber]) {
      const currentDay = new Date();

      const courses = timetables[weekNumber].filter(c => new Date(c.startTimestamp).getDay() === currentDay.getDay());
      setCourses(courses);

      const nextCourse = courses.find(c => new Date(c.startTimestamp) > currentDay);

      if (nextCourse) {
        return courses.indexOf(nextCourse);
      }
    }

    return null;
  }, [timetables, weekNumber]);

  if (courses.length === 0) {
    return null;
  }

  return (
    <>
      <NativeListHeader animated label="Emploi du temps"
        trailing={(
          <RedirectButton navigation={PapillonNavigation.current} redirect="Lessons" />
        )}
      />
      <Reanimated.View
        layout={animPapillon(LinearTransition)}
        style={{
          marginTop: 24,
          gap: 10,
        }}
      >
        {nextCourseIndex !== null && courses.splice(nextCourseIndex, nextCourseIndex + 3).map((course, index) => (
          <TimetableItem key={index} item={course} index={index} small />
        ))}
      </Reanimated.View>
    </>
  );
};

export default TimetableElement;