import React, { useEffect, useRef, useState } from "react";
import { Button, View } from "react-native";

import { Screen } from "@/router/helpers/types";
import { NativeText } from "@/components/Global/NativeComponents";
import InfiniteDatePager from "@/components/Global/InfiniteDatePager";
import HorizontalDatePicker from "./Atoms/LessonsDatePicker";
import { useCurrentAccount } from "@/stores/account";
import { useTimetableStore } from "@/stores/timetable";
import { AccountService } from "@/stores/account/types";
import { updateTimetableForWeekInCache } from "@/services/timetable";
import { Page } from "./Atoms/Page";
import { LessonsDateModal } from "./LessonsHeader";
import { set } from "lodash";

const Lessons: Screen<"Lessons"> = () => {
  const account = useCurrentAccount(store => store.account!);
  const timetables = useTimetableStore(store => store.timetables);

  let loadedWeeks = useRef<Set<number>>(new Set());
  let currentlyLoadingWeeks = useRef<Set<number>>(new Set());
  let lastAccountID = useRef<string | null>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [pickerDate, setPickerDate] = React.useState(new Date(today));
  const [selectedDate, setSelectedDate] = React.useState(new Date(today));

  const getWeekFromDate = (date: Date) => {
    let firstDate = new Date(account?.instance?.instance?.firstDate || "2024-09-01");

    const diff = date.getTime() - firstDate.getTime();
    const diffDays = diff / (1000 * 3600 * 24);

    return Math.floor(diffDays / 7) + 1;
  };

  const [updatedWeeks, setUpdatedWeeks] = React.useState(new Set<number>());

  useEffect(() => {
    void (async () => {
      const weekNumber = getWeekFromDate(pickerDate);
      await loadTimetableWeek(weekNumber, false);
    })();
  }, [pickerDate, account.instance]);

  const [loadingWeeks, setLoadingWeeks] = useState([]);

  const [showDatePicker, setShowDatePicker] = useState(false);

  const loadTimetableWeek = async (weekNumber: number, force = false) => {
    if (currentlyLoadingWeeks.current.has(weekNumber)) {
      return;
    }

    if(timetables[weekNumber] && !force) {
      return;
    }

    currentlyLoadingWeeks.current.add(weekNumber);
    if(force) {
      setLoadingWeeks([...loadingWeeks, weekNumber]);
    }

    try {
      await updateTimetableForWeekInCache(account, weekNumber, force);
      setUpdatedWeeks(new Set(updatedWeeks.add(weekNumber)));
    } finally {
      currentlyLoadingWeeks.current.delete(weekNumber);
      setLoadingWeeks(loadingWeeks.filter((week) => week !== weekNumber));
    }
  };

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <HorizontalDatePicker
        onDateSelect={(date) => {
          const newDate = new Date(date);
          newDate.setHours(0, 0, 0, 0);

          if (pickerDate.getTime() !== date.getTime()) {
            setSelectedDate(newDate);
          }
        }}
        onCurrentDatePress={() => {
          setShowDatePicker(true);
        }}
        initialDate={pickerDate}
      />

      <InfiniteDatePager
        initialDate={selectedDate}
        onDateChange={(date) => {
          const newDate = new Date(date);
          newDate.setHours(0, 0, 0, 0);

          if (pickerDate.getTime() !== date.getTime()) {
            setPickerDate(newDate);
          }
        }}
        renderDate={(date) => (
          <Page
            current={date.getDay() == pickerDate.getDay()}
            date={date}
            day={timetables[getWeekFromDate(date)]?.filter((lesson) => new Date(lesson.startTimestamp).getDate() === date.getDate())}
            refreshAction={() => {
              loadTimetableWeek(getWeekFromDate(date), true);
            }}
            loading={loadingWeeks.includes(getWeekFromDate(date))}
          />
        )}
      />

      <LessonsDateModal
        showDatePicker={showDatePicker}
        setShowDatePicker={setShowDatePicker}
        currentDate={pickerDate}
        onDateSelect={(date) => {
          const newDate = new Date(date);
          newDate.setHours(0, 0, 0, 0);
          // setPickerDate(newDate);
          setSelectedDate(newDate);
        }}
      />
    </View>
  );
};

export default Lessons;