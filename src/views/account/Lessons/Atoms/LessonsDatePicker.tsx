import React, { useState, useRef, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions } from "react-native";
import { format, addDays, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";
import { useTheme } from "@react-navigation/native";

import Reanimated, { FadeIn, FadeInUp, FadeOut, LinearTransition } from "react-native-reanimated";
import { animPapillon } from "@/utils/ui/animations";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const ITEM_WIDTH = 80;
const ITEM_MARGIN = 8;
const ITEM_TOTAL_WIDTH = ITEM_WIDTH + ITEM_MARGIN * 2;
const DATE_RANGE = 30;
const SCROLL_THRESHOLD = 7;

const generateDateRange = (centerDate) => {
  return Array.from({ length: DATE_RANGE }, (_, i) => addDays(centerDate, i - Math.floor(DATE_RANGE / 2)));
};

const HorizontalDatePicker = ({ onDateSelect, onCurrentDatePress, initialDate = new Date() }) => {
  const [dates, setDates] = useState(() => generateDateRange(initialDate));
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [centerIndex, setCenterIndex] = useState(Math.floor(DATE_RANGE / 2));
  const [centeredDate, setCenteredDate] = useState(initialDate);
  const flatListRef = useRef(null);
  const scrollPositionRef = useRef(0);

  const { colors } = useTheme();

  useEffect(() => {
    const dateIndex = dates.findIndex(date => isSameDay(date, initialDate));
    if (dateIndex !== -1) {
      const diffFromCenter = dateIndex - centerIndex;
      if (Math.abs(diffFromCenter) <= SCROLL_THRESHOLD) {
        flatListRef.current?.scrollToIndex({ index: dateIndex, animated: true });
        setSelectedDate(initialDate);
        setCenteredDate(initialDate);
      } else {
        setDates(generateDateRange(initialDate));
        setSelectedDate(initialDate);
        setCenteredDate(initialDate);
        setCenterIndex(Math.floor(DATE_RANGE / 2));
      }
    } else {
      setDates(generateDateRange(initialDate));
      setSelectedDate(initialDate);
      setCenteredDate(initialDate);
      setCenterIndex(Math.floor(DATE_RANGE / 2));
    }
  }, [initialDate]);

  useEffect(() => {
    if (dates.length > 0) {
      flatListRef.current?.scrollToIndex({ index: centerIndex, animated: false });
    }
  }, [dates, centerIndex]);

  const handleDatePress = useCallback((date) => {
    if (isSameDay(date, new Date())) {
      onCurrentDatePress();
    }
  }, [onDateSelect, onCurrentDatePress]);

  const renderDateItem = useCallback(({ item, index }) => {
    const isSelected = isSameDay(item, selectedDate);
    const isToday = isSameDay(item, new Date());
    const isCentered = isSameDay(item, centeredDate);

    return (
      <Reanimated.View>
        <TouchableOpacity
          style={[
            styles.dateItem,
            {
              backgroundColor: colors.text + "10",
            },
            isCentered && {
              backgroundColor: colors.text + "20",
            },
            isToday && {
              backgroundColor: colors.primary + "20",
            },
            isSelected && {
              backgroundColor: colors.primary,
            },
          ]}
          onPress={() => handleDatePress(item)}
        >
          <Text style={[
            styles.dayText,
            {
              color: colors.text,
            },
            isToday && {
              color: colors.primary,
            },
            isSelected && styles.selectedDateText,
          ]}>
            {format(item, "EEE", { locale: fr })}
          </Text>
          <Text style={[
            styles.dateText,
            {
              color: colors.text,
            },
            isToday && {
              color: colors.primary,
            },
            isSelected && styles.selectedDateText,
          ]}>
            {format(item, "d")}
          </Text>
        </TouchableOpacity>
      </Reanimated.View>
    );
  }, [selectedDate, centeredDate, handleDatePress]);

  const getItemLayout = useCallback((_, index) => ({
    length: ITEM_TOTAL_WIDTH,
    offset: ITEM_TOTAL_WIDTH * index,
    index,
  }), []);

  const handleScroll = useCallback((event) => {
    scrollPositionRef.current = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPositionRef.current / ITEM_TOTAL_WIDTH);
    setCenteredDate(dates[index]);
  }, [dates]);

  const handleMomentumScrollEnd = useCallback(() => {
    const index = Math.round(scrollPositionRef.current / ITEM_TOTAL_WIDTH);
    const centerDate = dates[index];

    if (centerDate) {
      setSelectedDate(centerDate);
      onDateSelect(centerDate);

      if (isSameDay(centerDate, new Date())) {
        onCurrentDatePress();
      }
    }
  }, [dates, onDateSelect, onCurrentDatePress]);

  return (
    <View style={styles.container}>
      <Reanimated.FlatList
        ref={flatListRef}
        layout={LinearTransition}
        data={dates}
        renderItem={renderDateItem}
        keyExtractor={(item) => item.toISOString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM_TOTAL_WIDTH}
        decelerationRate="fast"
        getItemLayout={getItemLayout}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.listContent}
        initialScrollIndex={centerIndex}
        onMomentumScrollEnd={handleMomentumScrollEnd}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 100,
  },
  listContent: {
    paddingHorizontal: (SCREEN_WIDTH - ITEM_TOTAL_WIDTH) / 2,
    paddingVertical: 10,
  },
  dateItem: {
    width: ITEM_WIDTH,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: ITEM_MARGIN,
    borderRadius: 12,
    borderCurve: "continuous",
    backgroundColor: "#f0f0f0",
  },
  selectedDateItem: {
    backgroundColor: "#007AFF",
  },
  centeredDateItem: {
    backgroundColor: "#E0E0E0",
  },
  todayDateItem: {
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  dateText: {
    fontSize: 20,
    fontFamily: "bold",
  },
  dayText: {
    fontSize: 16,
    fontFamily: "medium",
  },
  selectedDateText: {
    color: "white",
  },
  centeredDateText: {
    color: "#333",
  },
});

export default HorizontalDatePicker;