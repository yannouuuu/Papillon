import { NativeItem, NativeList, NativeListHeader, NativeText } from "@/components/Global/NativeComponents";
import React, { useEffect, useState } from "react";
import { View, ScrollView, Text } from "react-native";
import { Homework } from "@/services/shared/Homework";
import { getSubjectData } from "@/services/shared/Subject";

import { formatDistance } from "date-fns";
import { fr } from "date-fns/locale";
import { FileText, Link, Paperclip } from "lucide-react-native";

import * as WebBrowser from "expo-web-browser";
import { useTheme } from "@react-navigation/native";
import RenderHTML from "react-native-render-html";
import {useSafeAreaInsets} from "react-native-safe-area-context";

const HomeworksDocument = ({ route }) => {
  const theme = useTheme();

  const homework: Homework = route.params.homework || {};

  const openUrl = (url) => {
    WebBrowser.openBrowserAsync(url, {
      presentationStyle: "formSheet",
      controlsColor: theme.colors.primary
    });
  };

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

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 16,
        paddingTop: 0,
        paddingBottom: useSafeAreaInsets().bottom + 16,
      }}
      style={{flex: 1}}
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
          <RenderHTML
            source={{ html: homework.content }}
            defaultTextProps={{
              style: {
                color: theme.colors.text,
                fontFamily: "medium",
                fontSize: 16,
                lineHeight: 22,
              },
            }}
            contentWidth={300}
          />
        </NativeItem>
      </NativeList>

      {homework.attachments.length > 0 && (
        <View>
          <NativeListHeader label="Pièces jointes" icon={<Paperclip />} />

          <NativeList>
            {homework.attachments.map((attachment, index) => (
              <NativeItem
                key={index}
                onPress={() => openUrl(attachment.url)}
                icon={
                  attachment.type === "file" ?
                    <FileText />
                    :
                    <Link />
                }
              >
                <NativeText variant="title"  numberOfLines={2}>
                  {attachment.name}
                </NativeText>
                <NativeText variant="subtitle" numberOfLines={1}>
                  {attachment.url}
                </NativeText>
              </NativeItem>
            ))}
          </NativeList>
        </View>
      )}
    </ScrollView>
  );
};

export default HomeworksDocument;