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
import { ChevronDown, ChevronUp, UserX } from "lucide-react-native";
import PapillonHeader from "@/components/Global/PapillonHeader";
import { ScrollView } from "react-native-gesture-handler";
import { animPapillon } from "@/utils/ui/animations";
import { getAbsenceTime, leadingZero } from "@/utils/format/attendance_time";

const AttendanceItem = ({
  title,
  icon,
  attendances,
  showMore,
  setShowMore,
  missed
}) => {
  const newAbsences = attendances.sort((a, b) => b.fromTimestamp - a.fromTimestamp);

  return (
    <NativeList
      animated
      entering={animPapillon(FadeIn)}
      exiting={animPapillon(FadeOut)}
    >
      <NativeItem
        animated
        endPadding={16}
        icon={icon}
        trailing={
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            {missed && (
              <NativeText
                variant="subtitle"
              >
                {missed.hours > 0 && missed.hours + " h"} {leadingZero(missed.minutes)} min
              </NativeText>
            )}
          </View>
        }
      >
        <NativeText variant="overtitle">
          {title} ({newAbsences.length})
        </NativeText>
      </NativeItem>

      {newAbsences.slice(0, showMore ? newAbsences.length : 3).map((absence, index) => {
        let totalTime = "";
        if (absence.hours) {
          totalTime = absence.hours.split("h")[0] + "h" + leadingZero(absence.hours.split("h")[1]) + " min";
        }
        else if(absence.duration) {
          totalTime = absence.duration + " min";
        }

        return (
          <NativeItem
            key={absence.fromTimestamp || absence.timestamp}
            identifier={absence.fromTimestamp || absence.timestamp}
            entering={animPapillon(FadeInUp).delay((showMore ? index - 3 : index) * 20 + 50)}
            exiting={animPapillon(FadeOutDown).delay(index * 20)}
            animated
            endPadding={16}
            trailing={
              <NativeText
                style={{
                  color: !absence.justified && "#D10000",
                  fontSize: 16,
                }}
              >
                {totalTime}
              </NativeText>
            }
            separator
          >
            <NativeText variant="title">
              {absence.reasons || absence.reason && absence.reason.text || "Sans justification"}
            </NativeText>
            {!absence.justified && (
              <NativeText variant="default" style={{
                color: "#D10000",
              }}>
                Non justifié
              </NativeText>
            )}
            <NativeText variant="subtitle">
              {new Date(absence.fromTimestamp || absence.timestamp).toLocaleDateString("fr-FR", {
                weekday: "long",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </NativeText>
          </NativeItem>
        );
      })}

      {attendances.length > 3 && (
        <NativeItem
          animated
          icon={showMore ? <ChevronUp /> : <ChevronDown />}
          onPress={() => setShowMore(!showMore)}
          chevron={false}
        >
          <NativeText variant="subtitle">
            Afficher {showMore ? "moins" : "plus"}
          </NativeText>
        </NativeItem>
      )}
    </NativeList>
  );
};

export default AttendanceItem;