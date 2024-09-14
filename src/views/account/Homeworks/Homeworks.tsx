import { NativeList, NativeListHeader } from "@/components/Global/NativeComponents";
import { useCurrentAccount } from "@/stores/account";
import { useHomeworkStore } from "@/stores/homework";
import { useTheme } from "@react-navigation/native";
import React, { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { toggleHomeworkState, updateHomeworkForWeekInCache } from "@/services/homework";
import { View, Text, FlatList, Dimensions, Button, ScrollView, RefreshControl, StyleSheet, ActivityIndicator } from "react-native";
import { dateToEpochWeekNumber, epochWNToDate } from "@/utils/epochWeekNumber";

import HomeworksNoHomeworksItem from "./Atoms/NoHomeworks";
import HomeworkItem from "./Atoms/Item";
import { PressableScale } from "react-native-pressable-scale";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Book, ChevronLeft, ChevronRight } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";

import Reanimated, { FadeIn, FadeInLeft, FadeInRight, FadeOut, FadeOutLeft, FadeOutRight, LinearTransition, ZoomIn, ZoomOut } from "react-native-reanimated";
import { animPapillon } from "@/utils/ui/animations";
import PapillonSpinner from "@/components/Global/PapillonSpinner";
import AnimatedNumber from "@/components/Global/AnimatedNumber";

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

const WeekView = () => {
  const flatListRef = useRef(null);
  const { width } = Dimensions.get("window");
  const insets = useSafeAreaInsets();

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
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [oldSelectedWeek, setOldSelectedWeek] = useState(selectedWeek);

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
  const [refreshing, setRefreshing] = useState(false);

  const [loadedWeeks, setLoadedWeeks] = useState<number[]>([]);

  const updateHomeworks = useCallback(async (force = false, showLoading = true) => {
    if(!account) return;

    if (showLoading) {
      setRefreshing(true);
    }
    setLoading(true);
    console.log("[Homeworks]: updating cache...", selectedWeek, epochWNToDate(selectedWeek));
    updateHomeworkForWeekInCache(account, epochWNToDate(selectedWeek))
      .then(() => {
        console.log("[Homeworks]: updated cache !", epochWNToDate(selectedWeek));
        setLoading(false);
        setRefreshing(false);
      });
  }, [account, selectedWeek]);

  // on page change, load the homeworks
  useEffect(() => {
    if (selectedWeek > oldSelectedWeek) {
      setDirection("right");
    } else if (selectedWeek < oldSelectedWeek) {
      setDirection("left");
    }

    setTimeout(() => {
      setOldSelectedWeek(selectedWeek);
      updateHomeworks(true, false);
    }, 0);
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
          paddingTop: insets.top + 56,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => updateHomeworks(true)}
            progressViewOffset={insets.top + 56}
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

        {groupedHomework && Object.keys(groupedHomework).length === 0 &&
          <HomeworksNoHomeworksItem />
        }
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

  const [showPickerButtons, setShowPickerButtons] = useState(false);

  return (
    <View>
      <Reanimated.View
        style={[styles.header, {
          top: insets.top,
          zIndex: 100,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 10,
        }]}
        layout={animPapillon(LinearTransition)}
      >
        {showPickerButtons &&
          <Reanimated.View
            layout={animPapillon(LinearTransition)}
            entering={animPapillon(ZoomIn)}
            exiting={animPapillon(ZoomOut)}
          >
            <PressableScale
              onPress={() => goToWeek(selectedWeek - 1)}
              activeScale={0.8}
            >
              <BlurView
                style={[styles.weekButton, {
                  backgroundColor: theme.colors.primary + 16,
                }]}
                tint={theme.dark ? "dark" : "light"}
              >
                <ChevronLeft
                  size={24}
                  color={theme.colors.primary}
                  strokeWidth={2.5}
                />
              </BlurView>
            </PressableScale>
          </Reanimated.View>
        }

        <Reanimated.View
          layout={animPapillon(LinearTransition)}
        >
          <PressableScale
            style={[styles.weekPickerContainer]}
            onPress={() => setShowPickerButtons(!showPickerButtons)}
          >
            <Reanimated.View
              layout={animPapillon(LinearTransition)}
              style={[{
                backgroundColor:
                showPickerButtons ? theme.colors.primary + 16 :
                  theme.colors.text + 16,
                overflow: "hidden",
                borderRadius: 80,
              }]}
            >
              <BlurView
                style={[styles.weekPicker, {
                  backgroundColor: "transparent",
                }]}
                tint={theme.dark ? "dark" : "light"}
              >
                {showPickerButtons && !loading &&
                  <Reanimated.View
                    entering={animPapillon(FadeIn)}
                    exiting={animPapillon(FadeOut)}
                    style={{
                      marginRight: 5,
                    }}
                  >
                    <Book
                      color={showPickerButtons ? theme.colors.primary : theme.colors.text}
                      size={20}
                      strokeWidth={2.5}
                    />
                  </Reanimated.View>
                }

                <Reanimated.Text style={[styles.weekPickerText, styles.weekPickerTextIntl,
                  {
                    color: showPickerButtons ? theme.colors.primary : theme.colors.text,
                  }
                ]}
                layout={animPapillon(LinearTransition)}
                >
                  Semaine
                </Reanimated.Text>

                <Reanimated.View
                  layout={animPapillon(LinearTransition)}
                >
                  <AnimatedNumber
                    value={((selectedWeek % 52) + 1).toString()}
                    style={[styles.weekPickerText, styles.weekPickerTextNbr,
                      {
                        color: showPickerButtons ? theme.colors.primary : theme.colors.text,
                      }
                    ]}
                  />
                </Reanimated.View>

                {loading &&
                  <PapillonSpinner
                    size={18}
                    color={showPickerButtons ? theme.colors.primary : theme.colors.text}
                    strokeWidth={2.8}
                    entering={animPapillon(ZoomIn)}
                    exiting={animPapillon(ZoomOut)}
                    style={{
                      marginLeft: 5,
                    }}
                  />
                }
              </BlurView>
            </Reanimated.View>
          </PressableScale>
        </Reanimated.View>

        {showPickerButtons &&
          <Reanimated.View
            layout={animPapillon(LinearTransition)}
            entering={animPapillon(ZoomIn).delay(100)}
            exiting={animPapillon(FadeOutLeft)}
          >
            <PressableScale
              onPress={() => goToWeek(selectedWeek + 1)}
              activeScale={0.8}
            >
              <BlurView
                style={[styles.weekButton, {
                  backgroundColor: theme.colors.primary + 16,
                }]}
                tint={theme.dark ? "dark" : "light"}
              >
                <ChevronRight
                  size={24}
                  color={theme.colors.primary}
                  strokeWidth={2.5}
                />
              </BlurView>
            </PressableScale>
          </Reanimated.View>
        }
      </Reanimated.View>

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

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    position: "absolute",
    top: 0,
    left: 0,
  },

  weekPicker: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    height: 40,
    borderRadius: 80,
    gap: 6,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    alignSelf: "flex-start",
    overflow: "hidden",
  },

  weekPickerText: {
    zIndex: 10000,
  },

  weekPickerTextIntl: {
    fontSize: 15,
    fontFamily: "medium",
    opacity: 0.7,
  },

  weekPickerTextNbr: {
    fontSize: 16.5,
    fontFamily: "semibold",
    marginTop: -1.5,
  },

  weekButton: {
    overflow: "hidden",
    borderRadius: 80,
    height: 38,
    width: 38,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default WeekView;