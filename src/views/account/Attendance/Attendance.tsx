import { useTheme } from "@react-navigation/native";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { View, Text, Button, ActivityIndicator, Platform } from "react-native";

import { Screen } from "@/router/helpers/types";
import { useCurrentAccount } from "@/stores/account";
import { useAttendanceStore } from "@/stores/attendance";
import { updateAttendanceInCache, updateAttendancePeriodsInCache } from "@/services/attendance";
import { NativeItem, NativeList, NativeText } from "@/components/Global/NativeComponents";
import TabAnimatedTitle from "@/components/Global/TabAnimatedTitle";
import Reanimated, { FadeIn, FadeInUp, FadeOut, FadeOutDown, FadeOutUp, LinearTransition } from "react-native-reanimated";
import PapillonPicker from "@/components/Global/PapillonPicker";
import { ChevronDown, ChevronUp, Eye, Scale, Timer, UserX } from "lucide-react-native";
import PapillonHeader from "@/components/Global/PapillonHeader";
import { ScrollView } from "react-native-gesture-handler";
import { animPapillon } from "@/utils/ui/animations";
import AttendanceItem from "./Atoms/AttendanceItem";
import { getAbsenceTime, leadingZero } from "@/utils/format/attendance_time";
import TotalMissed from "./Atoms/TotalMissed";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import InsetsBottomView from "@/components/Global/InsetsBottomView";

const Attendance: Screen<"Attendance"> = ({ route, navigation }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const account = useCurrentAccount(store => store.account!);

  const defaultPeriod = useAttendanceStore(store => store.defaultPeriod);
  const periods = useAttendanceStore(store => store.periods);
  const attendances = useAttendanceStore(store => store.attendances);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [userSelectedPeriod, setUserSelectedPeriod] = useState<string | null>(null);
  const selectedPeriod = useMemo(() => userSelectedPeriod ?? defaultPeriod, [userSelectedPeriod, defaultPeriod]);

  useEffect(() => {
    void async function () {
      console.log("update grades periods in cache");
      await updateAttendancePeriodsInCache(account);
    }();
  }, [navigation, account.instance]);

  useEffect(() => {
    void async function () {
      if (selectedPeriod === "") return;

      console.log("update attendance in cache");
      await updateAttendanceInCache(account, selectedPeriod);
      await setIsLoading(false);
    }();
  }, [selectedPeriod, account.instance]);

  const [showMoreAbsences, setShowMoreAbsences] = useState(false);
  const [showMoreDelays, setShowMoreDelays] = useState(false);
  const [showMoreObservations, setShowMoreObservations] = useState(false);
  const [showMorePunishments, setShowMorePunishments] = useState(false);

  const [totalMissed, setTotalMissed] = useState({
    total: {
      hours: 0,
      minutes: 0
    },
    unJustified: {
      hours: 0,
      minutes: 0
    },
    absence: {
      hours: 0,
      minutes: 0
    },
    delay: {
      hours: 0,
      minutes: 0
    }
  });

  useEffect(() => {
    let totalHours = 0;
    let totalMinutes = 0;
    let totalUnJustifiedHours = 0;
    let totalUnJustifiedMinutes = 0;
    let totalAbsenceHours = 0;
    let totalAbsenceMinutes = 0;
    let totalDelayHours = 0;
    let totalDelayMinutes = 0;

    attendances[selectedPeriod]?.absences.forEach(absence => {
      const missed = getAbsenceTime(absence.fromTimestamp, absence.toTimestamp);

      if (!absence.justified)  {
        totalUnJustifiedHours += parseInt(absence.hours.split("h")[0]);
        totalUnJustifiedMinutes += parseInt(absence.hours.split("h")[1]);
      }

      totalHours += parseInt(absence.hours.split("h")[0]);
      totalMinutes += parseInt(absence.hours.split("h")[1]);

      totalAbsenceHours += parseInt(absence.hours.split("h")[0]);
      totalAbsenceMinutes += parseInt(absence.hours.split("h")[1]);
    });

    attendances[selectedPeriod]?.delays.forEach(delay => {
      const origMins = delay.duration;
      const missed = {
        hours: Math.floor(origMins / 60),
        minutes: origMins % 60
      };

      if (!delay.justified) {
        totalUnJustifiedHours += missed.hours;
        totalUnJustifiedMinutes += missed.minutes;
      }

      totalHours += missed.hours;
      totalMinutes += missed.minutes;

      totalDelayHours += missed.hours;
      totalDelayMinutes += missed.minutes;
    });

    if (totalMinutes >= 60) {
      totalHours += Math.floor(totalMinutes / 60);
      totalMinutes = totalMinutes % 60;
    }

    if(totalUnJustifiedMinutes >= 60) {
      totalUnJustifiedHours += Math.floor(totalUnJustifiedMinutes / 60);
      totalUnJustifiedMinutes = totalUnJustifiedMinutes % 60;
    }

    if(totalAbsenceMinutes >= 60) {
      totalAbsenceHours += Math.floor(totalAbsenceMinutes / 60);
      totalAbsenceMinutes = totalAbsenceMinutes % 60;
    }

    if(totalDelayMinutes >= 60) {
      totalDelayHours += Math.floor(totalDelayMinutes / 60);
      totalDelayMinutes = totalDelayMinutes % 60;
    }

    setTotalMissed({
      total: {
        hours: totalHours,
        minutes: totalMinutes
      },
      unJustified: {
        hours: totalUnJustifiedHours,
        minutes: totalUnJustifiedMinutes
      },
      absence: {
        hours: totalAbsenceHours,
        minutes: totalAbsenceMinutes
      },
      delay: {
        hours: totalDelayHours,
        minutes: totalDelayMinutes
      }
    });
  }, [attendances, selectedPeriod]);

  return (
    <>
      <PapillonHeader theme={theme} route={route} navigation={navigation}>
        <Reanimated.View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
          }}
          layout={LinearTransition}
        >
          <Reanimated.View
            layout={LinearTransition}
          >
            <PapillonPicker
              delay={0}
              data={periods.map(period => period.name)}
              selected={userSelectedPeriod ?? selectedPeriod}
              onSelectionChange={setUserSelectedPeriod}
            >
              <View style={{ flexDirection: "row", gap: 4, alignItems: "center" }}>
                <NativeText style={{ color: theme.colors.primary, maxWidth: 100 }} numberOfLines={1}>
                  {userSelectedPeriod ?? selectedPeriod}
                </NativeText>
                <ChevronDown color={theme.colors.primary} size={24} />
              </View>
            </PapillonPicker>
          </Reanimated.View>

          {isLoading && !isRefreshing &&
            <Reanimated.View
              entering={FadeIn}
              exiting={FadeOut.duration(1000)}
              layout={LinearTransition}
              style={{ marginRight: 6 }}
            >
              <ActivityIndicator color={Platform.OS === "android" && theme.colors.primary} />
            </Reanimated.View>
          }
        </Reanimated.View>
      </PapillonHeader>

      <Reanimated.ScrollView
        style={{
          flex: 1,
          backgroundColor: theme.colors.background,
          padding: 16,
          paddingTop: 0,
        }}
        layout={animPapillon(LinearTransition)}
      >
        {(totalMissed.total.hours > 0 || totalMissed.total.minutes > 0) && (
          <TotalMissed totalMissed={totalMissed} />
        )}

        {attendances[selectedPeriod] && attendances[selectedPeriod].absences.length > 0 && (
          <AttendanceItem
            title="Absences"
            icon={<UserX />}
            attendances={attendances[selectedPeriod].absences}
            showMore={showMoreAbsences} setShowMore={setShowMoreAbsences}
            missed={totalMissed.absence}
          />
        )}

        {attendances[selectedPeriod] && attendances[selectedPeriod].delays.length > 0 && (
          <AttendanceItem
            title="Retards"
            icon={<Timer />}
            attendances={attendances[selectedPeriod].delays}
            showMore={showMoreDelays}
            setShowMore={setShowMoreDelays}
            missed={totalMissed.delay}
          />
        )}

        {attendances[selectedPeriod] && attendances[selectedPeriod].observations.length > 0 && (
          <AttendanceItem
            title="Observations"
            icon={<Eye />}
            attendances={attendances[selectedPeriod].observations}
            showMore={showMoreObservations}
            setShowMore={setShowMoreObservations}
          />
        )}

        {attendances[selectedPeriod] && attendances[selectedPeriod].punishments.length > 0 && (
          <AttendanceItem
            title="Punitions"
            icon={<Scale />}
            attendances={attendances[selectedPeriod].punishments}
            showMore={showMorePunishments}
            setShowMore={setShowMorePunishments}
          />
        )}

        <InsetsBottomView />

      </Reanimated.ScrollView>
    </>
  );
};

export default Attendance;