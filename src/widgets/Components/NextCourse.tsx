import { WidgetProps } from "@/components/Home/Widget";
import WidgetHeader from "@/components/Home/WidgetHeader";
import ColorIndicator from "@/components/Lessons/ColorIndicator";
import { getSubjectData } from "@/services/shared/Subject";
import { TimetableClass, TimetableClassStatus } from "@/services/shared/Timetable";
import { useCurrentAccount } from "@/stores/account";
import { useTimetableStore } from "@/stores/timetable";
import { useTheme } from "@react-navigation/native";
import { Calendar, Clock } from "lucide-react-native";
import React, { forwardRef, useEffect, useImperativeHandle, useState, useCallback } from "react";
import { ActivityIndicator, Text, View } from "react-native";

const lz = (num: number) => (num < 10 ? `0${num}` : num);

const NextCourseWidget = forwardRef(({ hidden, setHidden, loading, setLoading }: WidgetProps, ref) => {
  const account = useCurrentAccount(store => store.account!);
  const timetables = useTimetableStore(store => store.timetables);

  const [nextCourse, setNextCourse] = useState<TimetableClass | null>(null);
  const [widgetTitle, setWidgetTitle] = useState("Prochain cours");

  useImperativeHandle(ref, () => ({
    handlePress: () => "Lessons"
  }));

  const updateNextCourse = useCallback(() => {
    const todayDate = new Date();
    const today = todayDate.getTime();

    if (!account.instance || !timetables) {
      setNextCourse(null);
      setHidden(true);
      return;
    }

    const allCourses = Object.values(timetables).flat();

    let updatedNextCourse = allCourses
      .filter(c => c.endTimestamp > today && c.status !== TimetableClassStatus.CANCELED)
      .sort((a, b) => a.startTimestamp - b.startTimestamp)[0];

    setNextCourse(updatedNextCourse);
    setHidden(!updatedNextCourse);
    setLoading(false);
  }, [account.instance, timetables, setHidden, setLoading]);

  useEffect(() => {
    setLoading(true);
    updateNextCourse();
    const intervalId = setInterval(updateNextCourse, 60000); // Update every minute
    return () => clearInterval(intervalId);
  }, [updateNextCourse, setLoading]);

  return !hidden && (
    <View style={{ width: "100%", height: "100%" }}>
      <WidgetHeader icon={<Calendar />} title={widgetTitle} />
      {nextCourse ? (
        <NextCourseLesson nextCourse={nextCourse} setWidgetTitle={setWidgetTitle} />
      ) : (
        <View style={{ width: "100%", height: "88%", justifyContent: "center", alignItems: "center", gap: 8 }}>
          {loading && <ActivityIndicator />}
          <Text style={{ color: "gray", fontSize: 15, fontFamily: "medium" }}>
            {loading ? "Chargement..." : "Aucun cours"}
          </Text>
        </View>
      )}
    </View>
  );
});

const NextCourseLesson: React.FC<{
  nextCourse: TimetableClass,
  setWidgetTitle: (title: string) => unknown
}> = ({ nextCourse, setWidgetTitle }) => {
  const [subjectData, setSubjectData] = useState({ color: "#888888", pretty: "Matière inconnue" });
  const colors = useTheme().colors;
  const [prettyTime, setPrettyTime] = useState("");

  useEffect(() => {
    const fetchSubjectData = async () => {
      const data = await getSubjectData(nextCourse.title);
      setSubjectData(data);
    };
    fetchSubjectData();
  }, [nextCourse.title]);

  useEffect(() => {
    const updateRemainingTime = () => {
      const now = new Date().getTime();
      const distance = nextCourse.startTimestamp - now;
      const end = nextCourse.endTimestamp - now;

      if (distance > 0) {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) {
          setPrettyTime(`dans ${days} jour(s)`);
        } else if (hours > 0) {
          setPrettyTime(`dans ${hours}h ${lz(minutes)}min`);
        } else {
          setPrettyTime(`dans ${minutes}min`);
        }
        setWidgetTitle("Prochain cours");
      } else if (end > 0) {
        const hours = Math.floor((end % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((end % (1000 * 60 * 60)) / (1000 * 60));
        setPrettyTime(`reste ${hours}h ${lz(minutes)}min`);
        setWidgetTitle("En classe");
      } else {
        setPrettyTime("Terminé");
        setWidgetTitle("Cours terminé");
      }

      // Calculer le temps restant jusqu'à la prochaine minute
      const nowDate = new Date();
      const secondsUntilNextMinute = 60 - nowDate.getSeconds();
      setTimeout(updateRemainingTime, secondsUntilNextMinute * 1000); // Planifier l'update au début de la prochaine minute
    };

    updateRemainingTime();

    return () => clearTimeout(updateRemainingTime); // Nettoyer le timeout
  }, [nextCourse, setWidgetTitle]);

  return (
    <View style={{ width: "100%", marginTop: 10, flex: 1, flexDirection: "row", gap: 10 }}>
      <ColorIndicator color={subjectData.color} style={{ flex: 0 }} />
      <View style={{ flex: 1, width: "100%", justifyContent: "space-between" }}>
        <Text numberOfLines={1} style={{ color: colors.text, fontSize: 17, fontFamily: "semibold" }}>
          {subjectData.pretty}
        </Text>
        <View style={{
          paddingHorizontal: 7,
          paddingVertical: 3,
          backgroundColor: subjectData.color + "33",
          borderRadius: 8,
          borderCurve: "continuous",
          alignSelf: "flex-start",
        }}>
          <Text numberOfLines={1} style={{ color: subjectData.color, fontSize: 15, fontFamily: "semibold" }}>
            {nextCourse.room}
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, opacity: 0.5 }}>
          <Clock size={20} color={colors.text} />
          <Text numberOfLines={1} style={{ color: colors.text, fontSize: 15, fontFamily: "medium" }}>
            {prettyTime}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default NextCourseWidget;