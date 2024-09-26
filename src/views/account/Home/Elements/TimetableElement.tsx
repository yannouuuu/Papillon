import React, { useEffect, useMemo, useState } from "react";
import Reanimated, { FadeInDown, FadeOut, LinearTransition } from "react-native-reanimated";
import { NativeItem, NativeList, NativeListHeader } from "@/components/Global/NativeComponents";
import { useCurrentAccount } from "@/stores/account";
import { useTimetableStore } from "@/stores/timetable";
import { TimetableClass } from "@/services/shared/Timetable";
import { dateToEpochWeekNumber } from "@/utils/epochWeekNumber";
import { PapillonNavigation } from "@/router/refs";
import RedirectButton from "@/components/Home/RedirectButton";
import { updateTimetableForWeekInCache } from "@/services/timetable";
import MissingItem from "@/components/Global/MissingItem";
import { TimetableItem } from "../../Lessons/Atoms/Item";

const TimetableElement = () => {
  const account = useCurrentAccount((store) => store.account!);
  const timetables = useTimetableStore((store) => store.timetables);

  const [nextCourses, setNextCourses] = useState<TimetableClass[]>([]);
  const [hidden, setHidden] = useState(true);
  const epochWeekNumber = useMemo(() => dateToEpochWeekNumber(new Date()), []);

  const isToday = (timestamp: number) => {
    const today = new Date();
    const date = new Date(timestamp);
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Fetch timetable if not already fetched
  const fetchTimetable = () => {
    if (!timetables[epochWeekNumber] && account.instance) {
      console.log("Fetching timetable for epoch week:", epochWeekNumber);
      updateTimetableForWeekInCache(account, epochWeekNumber);
    }
  };

  // Filter and sort the courses to get today's or the next 3 courses
  const filterAndSortCourses = (allCourses: TimetableClass[]): TimetableClass[] => {
    const now = Date.now();

    // Log all courses available
    console.log("All courses:", allCourses);

    // Filter for today's remaining courses
    const todayCourses = allCourses
      .filter(c => isToday(c.startTimestamp) && c.endTimestamp > now)
      .sort((a, b) => a.startTimestamp - b.startTimestamp);

    console.log("Today's courses:", todayCourses);

    if (todayCourses.length > 0) {
      return todayCourses;
    }

    // If no more courses today, log and return the next 3 upcoming courses
    const upcomingCourses = allCourses
      .filter(c => c.startTimestamp > now)
      .sort((a, b) => a.startTimestamp - b.startTimestamp)
      .slice(0, 3);

    console.log("Upcoming courses:", upcomingCourses);
    return upcomingCourses;
  };

  // Update the next courses based on the current timetable
  const updateNextCourses = () => {
    if (!account.instance || !timetables) {
      return;
    }

    const allCourses = Object.values(timetables).flat();
    console.log("Flattened timetable data:", allCourses);

    const upcomingCourses = filterAndSortCourses(allCourses);

    if (upcomingCourses.length > 0) {
      setNextCourses(upcomingCourses);
      setHidden(false);
    } else {
      setHidden(true);
    }

    console.log("Next courses to display:", upcomingCourses);
  };

  // Fetch timetable on mount and when week changes
  useEffect(() => {
    fetchTimetable();
  }, [epochWeekNumber, timetables, account?.instance]);

  // Update courses every minute
  useEffect(() => {
    updateNextCourses();
    const intervalId = setInterval(updateNextCourses, 60000); // Update every minute
    return () => clearInterval(intervalId);
  }, [account.instance, timetables]);

  if (hidden || nextCourses.length === 0) {
    return (
      <NativeList
        animated
        key="emptyCourses"
        entering={FadeInDown.springify().mass(1).damping(20).stiffness(300)}
        exiting={FadeOut.duration(300)}
      >
        <NativeItem
          animated
          style={{ paddingVertical: 10 }}
        >
          <MissingItem
            emoji="📚"
            title="Aucun cours à venir"
            description="Il n'y a pas de cours à venir pour aujourd'hui."
          />
        </NativeItem>
      </NativeList>
    );
  }

  const label = isToday(nextCourses[0].startTimestamp) ? "Emploi du temps" : "Prochains cours";

  return (
    <>
      <NativeListHeader
        animated
        label={label}
        trailing={<RedirectButton navigation={PapillonNavigation.current} redirect="Lessons" />}
      />
      <Reanimated.View
        layout={LinearTransition}
        style={{ marginTop: 24, gap: 10 }}
      >
        {nextCourses.map((course, index) => (
          <React.Fragment key={course.id || index}>
            <TimetableItem item={course} index={index} small />
          </React.Fragment>
        ))}
      </Reanimated.View>
    </>
  );
};

export default TimetableElement;
