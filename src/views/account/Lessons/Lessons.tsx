import React, { useRef } from "react";
import { Button, View } from "react-native";

import { Screen } from "@/router/helpers/types";
import { NativeText } from "@/components/Global/NativeComponents";
import InfiniteDatePager from "@/components/Global/InfiniteDatePager";
import HorizontalDatePicker from "./Atoms/LessonsDatePicker";
import { useCurrentAccount } from "@/stores/account";
import { useTimetableStore } from "@/stores/timetable";

const Lessons: Screen<"Lessons"> = () => {
  const account = useCurrentAccount(store => store.account!);
  const timetables = useTimetableStore(store => store.timetables);

  let loadedWeeks = useRef<Set<number>>(new Set());
  let currentlyLoadingWeeks = useRef<Set<number>>(new Set());
  let lastAccountID = useRef<string | null>(null);

  const [pickerDate, setPickerDate] = React.useState(new Date());
  const [selectedDate, setSelectedDate] = React.useState(new Date());

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
        onCurrentDatePress={() => {}}
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
          <View>
            <NativeText>{date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</NativeText>
          </View>
        )}
      />
    </View>
  );
};

export default Lessons;