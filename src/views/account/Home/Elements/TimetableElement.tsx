import { NativeListHeader } from "@/components/Global/NativeComponents";
import { updateTimetableForWeekInCache } from "@/services/timetable";
import { useCurrentAccount } from "@/stores/account";
import { useTimetableStore } from "@/stores/timetable";
import { animPapillon } from "@/utils/ui/animations";
import React, { useEffect, useMemo, useState } from "react";
import Reanimated, {
  LinearTransition
} from "react-native-reanimated";
import { TimetableItem } from "../../Lessons/Atoms/Item";
import { PapillonNavigation } from "@/router/refs";
import RedirectButton from "@/components/Home/RedirectButton";
import { TimetableClass } from "@/services/shared/Timetable";
import { dateToEpochWeekNumber } from "@/utils/epochWeekNumber";

const TimetableElement = () => {
  const account = useCurrentAccount(store => store.account!);
  const timetables = useTimetableStore(store => store.timetables);

  const [courses, setCourses] = useState<TimetableClass[]>([]);

  const epochWeekNumber = useMemo(()=>dateToEpochWeekNumber(new Date()),[]);

  const [currentlyUpdating, setCurrentlyUpdating] = useState(false);

  useEffect(() => {
    if (!timetables[epochWeekNumber] && !currentlyUpdating && account.instance) {
      setCurrentlyUpdating(true);
      updateTimetableForWeekInCache(account, epochWeekNumber);
    }
  }, [epochWeekNumber, currentlyUpdating, timetables, account?.instance]);

  const nextCourseIndex = useMemo(() => {
    if (timetables[epochWeekNumber]) {
      const currentDay = new Date();

      const courses = timetables[epochWeekNumber].filter(c => new Date(c.startTimestamp).getDay() === currentDay.getDay());
      setCourses(courses);

      const nextCourse = courses.find(c => new Date(c.startTimestamp) > currentDay);

      if (nextCourse) {
        return courses.indexOf(nextCourse);
      }
    }

    return null;
  }, [timetables, epochWeekNumber]);

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