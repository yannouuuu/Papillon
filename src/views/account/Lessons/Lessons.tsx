import { useTheme } from "@react-navigation/native";
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useReducer, useRef, useState } from "react";
import { Modal, Platform, RefreshControl as RNRefreshControl, Text, View } from "react-native";
import { createNativeWrapper } from "react-native-gesture-handler";

import { Screen } from "@/router/helpers/types";
import { updateTimetableForWeekInCache } from "@/services/timetable";
import { useCurrentAccount } from "@/stores/account";
import { useTimetableStore } from "@/stores/timetable";

import { Page } from "./Atoms/Page";

import InfinitePager from "react-native-infinite-pager";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HeaderCalendar, LessonsDateModal } from "./LessonsHeader";
import { AccountService } from "@/stores/account/types";
import PapillonCheckbox from "@/components/Global/PapillonCheckbox";

const RefreshControl = createNativeWrapper(RNRefreshControl, {
  disallowInterruption: true,
  shouldCancelWhenOutside: false,
});

const RenderPage = React.memo(({ index, isActive, timetables, getWeekFromIndex, loadTimetableWeek, currentPageIndex }) => (
  <View>
    <Page
      index={index}
      timetables={timetables}
      getWeekFromIndex={getWeekFromIndex}
      loadTimetableWeek={loadTimetableWeek}
      current={Platform.OS === "ios" ? currentPageIndex === index : true}
    />
  </View>
));

const Timetable: Screen<"Lessons"> = ({ navigation }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const account = useCurrentAccount(store => store.account!);
  const timetables = useTimetableStore(store => store.timetables);

  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loadedWeeks, setLoadedWeeks] = useState<Set<number>>(new Set());
  const [currentlyLoadingWeeks, setCurrentlyLoadingWeeks] = useState<Set<number>>(new Set());

  const PagerRef = useRef<typeof InfinitePager | null>(null);

  const today = useMemo(() => new Date(), []);
  const defaultDate = useMemo(() => new Date(today), [today]);

  const [firstDate, setFirstDate] = useState(new Date("2023-09-01"));

  useEffect(() => {
    if (account.instance) {
      if (account.service === AccountService.Pronote) {
        setFirstDate(new Date(account.instance.instance.firstDate));
      }
    }
  }, [account]);

  const getDateFromIndex = useCallback((index: number) => {
    const date = new Date(defaultDate);
    date.setDate(date.getDate() + index);
    return date;
  }, [defaultDate]);

  const getWeekFromIndex = (index: number) => {
    const date = getDateFromIndex(index);
    const firstDayOfYear = new Date(firstDate);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    const dayNumber = date.getDay();
    return { weekNumber, dayNumber };
  };

  const getWeekLoadStatus = useCallback((weekNumber: number) => ({
    loaded: loadedWeeks.has(weekNumber),
    loading: currentlyLoadingWeeks.has(weekNumber),
  }), [loadedWeeks, currentlyLoadingWeeks]);

  const loadTimetableWeek = useCallback(async (weekNumber: number) => {
    const { loaded, loading } = getWeekLoadStatus(weekNumber);
    if (loaded || loading) return;

    setCurrentlyLoadingWeeks(prev => new Set([...prev, weekNumber]));
    try {
      await updateTimetableForWeekInCache(account, weekNumber);
      setLoadedWeeks(prev => new Set([...prev, weekNumber]));
    } catch (error) {
      console.error(error);
    } finally {
      setCurrentlyLoadingWeeks(prev => {
        const newSet = new Set(prev);
        newSet.delete(weekNumber);
        return newSet;
      });
    }
  }, [account, getWeekLoadStatus]);

  useEffect(() => {
    const newLoadedWeeks = new Set(Object.keys(timetables).map(Number));
    if (!loadedWeeks.size || newLoadedWeeks.size !== loadedWeeks.size) {
      setLoadedWeeks(newLoadedWeeks);
    }
  }, [timetables]);

  const handleShowDatePicker = useCallback(() => {
    setShowDatePicker(true);
  }, []);

  useEffect(() => {
    const { weekNumber } = getWeekFromIndex(currentPageIndex);
    const weekLoadStatus = getWeekLoadStatus(weekNumber);
    if (!weekLoadStatus.loaded && !weekLoadStatus.loading) {
      loadTimetableWeek(weekNumber);
    }
  }, [currentPageIndex, getWeekFromIndex, getWeekLoadStatus, loadTimetableWeek]);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <HeaderCalendar
          index={currentPageIndex}
          oldPageIndex={currentPageIndex}
          showPicker={() => handleShowDatePicker()}
          changeIndex={(index) => PagerRef.current?.setPage(index)}
          getDateFromIndex={getDateFromIndex}
        />
      ),
    });
  }, [navigation, currentPageIndex, getDateFromIndex]);

  return (
    <View style={{ backgroundColor: colors.background }}>
      {showDatePicker && (
        <LessonsDateModal
          showDatePicker={showDatePicker}
          setShowDatePicker={setShowDatePicker}
          currentPageIndex={currentPageIndex}
          defaultDate={defaultDate}
          PagerRef={PagerRef}
          getDateFromIndex={getDateFromIndex}
        />
      )}

      <InfinitePager
        onPageChange={setCurrentPageIndex}
        ref={PagerRef}
        renderPage={({ index, isActive }) => <RenderPage
          index={index}
          isActive={isActive}
          timetables={timetables}
          getWeekFromIndex={getWeekFromIndex}
          loadTimetableWeek={loadTimetableWeek}
          currentPageIndex={currentPageIndex}
        />}
        style={{ height: "100%" }}
      />
    </View>
  );
};

export default Timetable;
