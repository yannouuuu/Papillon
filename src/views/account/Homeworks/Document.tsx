import { NativeItem, NativeList, NativeText } from "@/components/Global/NativeComponents";
import React, { useEffect, useMemo, useState } from "react";
import { View, ScrollView, Text } from "react-native";
import { Homework } from "@/services/shared/Homework";
import { getSubjectData } from "@/services/shared/Subject";
import parse_homeworks from "@/utils/format/format_pronote_homeworks";

import { format, formatDistance, formatRelative, subDays } from "date-fns";
import { fr } from "date-fns/locale";

const HomeworksDocument = ({ route, navigation }) => {
  const homework: Homework = route.params.homework || {};
  console.log(homework);

  const [subjectData, setSubjectData] = useState({
    color: "#888888", pretty: "Matière inconnue", emoji: "❓",
  });

  const fetchSubjectData = () => {
    const data = getSubjectData(homework.subject);
    setSubjectData(data);
  };

  useEffect(() => {
    fetchSubjectData();
  }, [homework.subject]);

  const parsedContent = useMemo(() => parse_homeworks(homework.content), [homework.content]);

  return (
    <ScrollView
      style={{
        padding: 16,
        paddingTop: 0,
      }}
    >
      <NativeList inset>
        <NativeItem
          leading={
            <View
              style={{
                backgroundColor: subjectData.color + "23",
                borderRadius: 100,
                width: 42,
                height: 42,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 25,
                  lineHeight: 42,
                  textAlign: "center",
                  width: "100%",
                  marginLeft: 2
                }}
              >
                {subjectData.emoji}
              </Text>
            </View>
          }
        >
          <NativeText variant="title">
            {subjectData.pretty}
          </NativeText>
          <NativeText variant="subtitle">
            {formatDistance(
              new Date(homework.due),
              new Date(),
              {
                addSuffix: true,
                locale: fr,
              }
            )}
          </NativeText>
        </NativeItem>
        <NativeItem>
          <NativeText>
            {parsedContent}
          </NativeText>
        </NativeItem>
      </NativeList>

    </ScrollView>
  );
};

export default HomeworksDocument;