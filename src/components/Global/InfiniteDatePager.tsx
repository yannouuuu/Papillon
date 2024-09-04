import React, { useRef, useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import InfinitePager from "react-native-infinite-pager";

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

const InfiniteDatePager = ({ renderDate, initialDate = new Date(), onDateChange }) => {
  const pagerRef = useRef(null);
  const baseDate = useRef(new Date(1970, 0, 1)).current;
  const [isProgrammaticChange, setIsProgrammaticChange] = useState(false);

  const getDateFromIndex = useCallback((index) => {
    return new Date(baseDate.getTime() + index * MILLISECONDS_PER_DAY);
  }, []);

  const getIndexFromDate = useCallback((date) => {
    return Math.round((date.getTime() - baseDate.getTime()) / MILLISECONDS_PER_DAY);
  }, []);

  const renderPage = useCallback(({ index }) => {
    const date = getDateFromIndex(index);
    return (
      <View style={styles.pageContainer}>
        {renderDate ? renderDate(date) : (
          <Text style={styles.dateText}>
            {date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </Text>
        )}
      </View>
    );
  }, [getDateFromIndex, renderDate]);

  const handlePageChange = useCallback((index) => {
    const newDate = getDateFromIndex(index);
    if (!isProgrammaticChange) {
      onDateChange?.(newDate);
    }
    setIsProgrammaticChange(false);
  }, [getDateFromIndex, onDateChange, isProgrammaticChange]);

  useEffect(() => {
    const index = getIndexFromDate(initialDate);
    setIsProgrammaticChange(true);
    pagerRef.current?.setPage(index, false);
  }, [initialDate, getIndexFromDate]);

  return (
    <View style={styles.container}>
      <InfinitePager
        ref={pagerRef}
        renderPage={renderPage}
        onPageChange={handlePageChange}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pageContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  dateText: {
    fontSize: 20,
    fontWeight: "bold",
  },
});

export default InfiniteDatePager;