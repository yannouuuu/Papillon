import { NativeList, NativeListHeader } from "@/components/Global/NativeComponents";
import { useCurrentAccount } from "@/stores/account";
import { useHomeworkStore } from "@/stores/homework";
import { useTheme } from "@react-navigation/native";
import React, { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { toggleHomeworkState, updateHomeworkForWeekInCache } from "@/services/homework";
import { View, Text, FlatList, Dimensions, Button, ScrollView, RefreshControl } from "react-native";
import { dateToEpochWeekNumber, epochWNToDate } from "@/utils/epochWeekNumber";

import HomeworksNoHomeworksItem from "./Atoms/NoHomeworks";
import HomeworkItem from "./Atoms/Item";


type HomeworksPageProps = {
  index: number;
  isActive: boolean;
  loaded: boolean;
  homeworks: Record<number, Homework[]>;
  account: Account;
  updateHomeworks: () => Promise<void>;
  loading: boolean;
  getDayName: (date: string | number | Date) => string;
};

const formatDate = (date: string | number | Date): string => {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long"
  });
};

const HomeworkList: React.FC<HomeworkListProps> = React.memo(({ groupedHomework, loading, onDonePressHandler }) => {
  if (!loading && Object.keys(groupedHomework).length === 0) {
    return <HomeworksNoHomeworksItem />;
  }

  return (
    <>
      {Object.keys(groupedHomework).map((day, index) => (
        <View key={index}>
          <NativeListHeader label={day} />
          <NativeList>
            {groupedHomework[day].map((homework, idx) => (
              <HomeworkItem
                key={homework.id}
                index={idx}
                total={groupedHomework[day].length}
                homework={homework}
                onDonePressHandler={async () => onDonePressHandler(homework)}
              />
            ))}
          </NativeList>
        </View>
      ))}
    </>
  );
}, (prevProps, nextProps) => prevProps.groupedHomework === nextProps.groupedHomework && prevProps.loading === nextProps.loading);

const WeekView = () => {
  const flatListRef = useRef(null);
  const { width } = Dimensions.get("window");

  const theme = useTheme();
  const account = useCurrentAccount(store => store.account!);
  const homeworks = useHomeworkStore(store => store.homeworks);

  // Function to get the current week number since epoch
  const getCurrentWeekNumber = () => {
    const now = new Date();
    const start = new Date(1970, 0, 0);
    const diff = now - start;
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    return Math.floor(diff / oneWeek);
  };

  const currentWeek = getCurrentWeekNumber();
  const [data, setData] = useState(Array.from({ length: 100 }, (_, i) => currentWeek - 50 + i));
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);

  const getItemLayout = useCallback((_, index) => ({
    length: width,
    offset: width * index,
    index,
  }), [width]);

  const keyExtractor = useCallback((item) => item.toString(), []);

  const getDayName = (date: string | number | Date): string => {
    const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
    return days[new Date(date).getDay()];
  };

  const [loading, setLoading] = useState(false);

  const updateHomeworks = useCallback(async (force = false, showLoading = true) => {
    if(!account) return;
    if(homeworks[selectedWeek] && !force) return;

    if (showLoading) {
      setLoading(true);
    }
    console.log("[Homeworks]: updating cache...", selectedWeek, epochWNToDate(selectedWeek));
    await updateHomeworkForWeekInCache(account, epochWNToDate(selectedWeek));
    console.log("[Homeworks]: updated cache !", epochWNToDate(selectedWeek));
    setLoading(false);
  }, [account, selectedWeek]);

  // on page change, load the homeworks
  useEffect(() => {
    updateHomeworks(true, false);
  }, [selectedWeek]);

  const renderWeek = ({ item }) => {
    const homeworksInWeek = homeworks[item] ?? [];

    const sortedHomework = homeworksInWeek.sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime());

    const groupedHomework = sortedHomework.reduce((acc, curr) => {
      const dayName = getDayName(curr.due);
      const formattedDate = formatDate(curr.due);
      const day = `${dayName} ${formattedDate}`;

      if (!acc[day]) {
        acc[day] = [curr];
      } else {
        acc[day].push(curr);
      }

      return acc;
    }, {} as Record<string, Homework[]>);

    return (
      <ScrollView
        style={{ width, height: "100%"}}
        contentContainerStyle={{
          padding: 16,
          paddingTop: 0,
        }}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => updateHomeworks(true)}
          />
        }
      >
        {groupedHomework && Object.keys(groupedHomework).map((day, index) => (
          <View>
            <NativeListHeader label={day} />

            <NativeList>
              {groupedHomework[day].map((homework, idx) => (
                <HomeworkItem
                  key={homework.id}
                  index={idx}
                  total={groupedHomework[day].length}
                  homework={homework}
                  onDonePressHandler={async () => {
                    await toggleHomeworkState(account, homework);
                    await updateHomeworks(true, false);
                  }}
                />
              ))}
            </NativeList>
          </View>
        ))}
      </ScrollView>
    );
  };

  const onEndReached = () => {
    const lastWeek = data[data.length - 1];
    const newWeeks = Array.from({ length: 50 }, (_, i) => lastWeek + i + 1);
    setData(prevData => [...prevData, ...newWeeks]);
  };

  const onStartReached = () => {
    const firstWeek = data[0];
    const newWeeks = Array.from({ length: 50 }, (_, i) => firstWeek - 50 + i);
    setData(prevData => [...newWeeks, ...prevData]);
    flatListRef.current?.scrollToIndex({ index: 50, animated: false });
  };

  const onScroll = useCallback(({ nativeEvent }) => {
    if (nativeEvent.contentOffset.x < width) {
      onStartReached();
    }

    // Update selected week based on scroll position
    const index = Math.round(nativeEvent.contentOffset.x / width);
    setSelectedWeek(data[index]);
  }, [width, data]);

  const onMomentumScrollEnd = useCallback(({ nativeEvent }) => {
    const index = Math.round(nativeEvent.contentOffset.x / width);
    setSelectedWeek(data[index]);
  }, [width, data]);

  const goToWeek = useCallback((weekNumber) => {
    const index = data.findIndex(week => week === weekNumber);
    if (index !== -1) {
      const currentIndex = Math.round(flatListRef.current?.contentOffset?.x / width) || 0;
      const distance = Math.abs(index - currentIndex);
      const animated = distance <= 10; // Animate if the distance is 10 weeks or less

      flatListRef.current?.scrollToIndex({ index, animated });
      setSelectedWeek(weekNumber);
    } else {
      // If the week is not in the current data, update the data and scroll
      const newData = Array.from({ length: 100 }, (_, i) => weekNumber - 50 + i);
      setData(newData);

      // Use a timeout to ensure the FlatList has updated before scrolling
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index: 50, animated: false });
        setSelectedWeek(weekNumber);
      }, 0);
    }
  }, [data, width]);

  return (
    <View>
      <FlatList
        ref={flatListRef}
        data={data}
        renderItem={renderWeek}
        keyExtractor={keyExtractor}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        initialNumToRender={3}
        maxToRenderPerBatch={5}
        windowSize={5}
        getItemLayout={getItemLayout}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.1}
        onScroll={onScroll}
        onMomentumScrollEnd={onMomentumScrollEnd}
        scrollEventThrottle={16}
        initialScrollIndex={50}
        style={{
          height: "100%",
        }}
      />
    </View>
  );
};

export default WeekView;