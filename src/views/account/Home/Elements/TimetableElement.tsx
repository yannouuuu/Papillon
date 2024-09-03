import { NativeListHeader } from "@/components/Global/NativeComponents";
import { useCurrentAccount } from "@/stores/account";
import { useTimetableStore } from "@/stores/timetable";
import { animPapillon } from "@/utils/ui/animations";
import React, { useEffect, useMemo, useState } from "react";
import Reanimated, { FadeInDown, FadeOut, LinearTransition } from "react-native-reanimated";
import { TimetableItem } from "../../Lessons/Atoms/Item";
import { PapillonNavigation } from "@/router/refs";
import RedirectButton from "@/components/Home/RedirectButton";
import { TimetableClass } from "@/services/shared/Timetable";
import { useTheme } from "@react-navigation/native";
import { Image, Platform, Text, View } from "react-native";
import { Sofa, Utensils } from "lucide-react-native";

const TimetableElement = () => {
  const account = useCurrentAccount((store) => store.account!);
  const timetables = useTimetableStore((store) => store.timetables);

  const [nextCourses, setNextCourses] = useState<TimetableClass[]>([]);
  const [hidden, setHidden] = useState(true);

  const isToday = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSameDay = (timestamp1: number, timestamp2: number) => {
    const date1 = new Date(timestamp1);
    const date2 = new Date(timestamp2);
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  useEffect(() => {
    const updateNextCourses = () => {
      setHidden(true);
      setNextCourses([]);

      if (!account.instance || !timetables) {
        return;
      }

      const allCourses = Object.values(timetables).flat();
      const now = new Date();
      const today = now.getTime();

      const sortedCourses = allCourses
        .filter((c) => c.endTimestamp > today)
        .sort((a, b) => a.startTimestamp - b.startTimestamp);

      let nextThreeCourses: TimetableClass[] = [];
      let currentDay = now;

      for (const course of sortedCourses) {
        if (isSameDay(course.startTimestamp, currentDay.getTime())) {
          nextThreeCourses.push(course);
          if (nextThreeCourses.length === 3) break;
        } else if (nextThreeCourses.length > 0) {
          break;
        } else {
          currentDay = new Date(course.startTimestamp);
          nextThreeCourses.push(course);
        }
      }

      if (nextThreeCourses.length > 0) {
        setNextCourses(nextThreeCourses);
        setHidden(false);
      } else {
        setHidden(true);
      }
    };

    updateNextCourses();
    const intervalId = setInterval(updateNextCourses, 60000);

    return () => clearInterval(intervalId);
  }, [account.instance, timetables]);

  if (hidden || nextCourses.length === 0) {
    return null;
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
        layout={animPapillon(LinearTransition)}
        style={{
          marginTop: 24,
          gap: 10,
        }}
      >
        {nextCourses.map((course, index) => (
          <React.Fragment key={course.id || index}>
            <TimetableItem item={course} index={index} small />
            {nextCourses[index + 1] &&
              isSameDay(course.endTimestamp, nextCourses[index + 1].startTimestamp) &&
              nextCourses[index + 1].startTimestamp - course.endTimestamp > 1740000 && (
              <SeparatorCourse
                i={index}
                start={nextCourses[index + 1].startTimestamp}
                end={course.endTimestamp}
              />
            )}
          </React.Fragment>
        ))}
      </Reanimated.View>
    </>
  );
};

export default TimetableElement;

const SeparatorCourse: React.FC<{
  i: number;
  start: number;
  end: number;
}> = ({ i, start, end }) => {
  const { colors } = useTheme();
  const startHours = new Date(start).getHours();

  const getDuration = (minutes: number): string => {
    const durationHours = Math.floor(minutes / 60);
    const durationRemainingMinutes = minutes % 60;
    return `${durationHours} h ${lz(durationRemainingMinutes)} min`;
  };

  const lz = (num: number) => (num < 10 ? `0${num}` : num);

  return (
    <Reanimated.View
      style={{
        borderRadius: 10,
        backgroundColor: colors.card,
        borderColor: colors.text + "33",
        borderWidth: 0.5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 1,
        marginLeft: 70,
      }}
      entering={
        Platform.OS === "ios"
          ? FadeInDown.delay(50 * i).springify().mass(1).damping(20).stiffness(300)
          : void 0
      }
      exiting={Platform.OS === "ios" ? FadeOut.duration(300) : void 0}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 10,
          borderRadius: 10,
          gap: 10,
          overflow: "hidden",
          backgroundColor: colors.text + "11",
        }}
      >
        <Image
          source={require("../../../../../assets/images/mask_course.png")}
          resizeMode="cover"
          tintColor={colors.text}
          style={{
            position: "absolute",
            top: "-20%",
            left: "-20%",
            width: "200%",
            height: "200%",
            opacity: 0.05,
          }}
        />

        {startHours > 11 && startHours < 14 ? (
          <Utensils size={20} color={colors.text} />
        ) : (
          <Sofa size={20} color={colors.text} />
        )}
        <Text
          numberOfLines={1}
          style={{
            flex: 1,
            fontFamily: "semibold",
            fontSize: 16,
            color: colors.text,
          }}
        >
          {startHours > 11 && startHours < 14 ? "Pause méridienne" : "Pas de cours"}
        </Text>

        <Text
          numberOfLines={1}
          style={{
            fontFamily: "medium",
            fontSize: 15,
            opacity: 0.5,
            color: colors.text,
          }}
        >
          {getDuration(Math.round((start - end) / 60000))}
        </Text>
      </View>
    </Reanimated.View>
  );
};