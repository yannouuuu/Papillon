import type { Screen } from "@/router/helpers/types";
import { Image, ScrollView, Share, ShareContent } from "react-native";
import {
  NativeIcon,
  NativeItem,
  NativeList,
  NativeListHeader,
  NativeText,
} from "@/components/Global/NativeComponents";
import React, { useEffect, useState } from "react";
import { get_brute_logs, get_logs } from "@/utils/logger/logger";
import {
  CircleAlert,
  CircleX,
  Code,
  Paperclip,
  Save,
  ShareIcon,
  TriangleAlert,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PressableScale } from "react-native-pressable-scale";

// Define the type for the log items
interface LogItem {
  type: "ERROR" | "WARN" | "INFO" | "DEBUG" | string;
  message: string;
  date: string;
  from: string;
}

const SettingsDevLogs: Screen<"SettingsDevLogs"> = ({ navigation }) => {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    get_logs().then((res) => {
      setLogs(res);
    });

    navigation.setOptions({
      headerRight: (props) => (
        <PressableScale
          onPress={() => {
            get_brute_logs().then((logs) => {
              const shareContent: ShareContent = {
                message: "Hello",
                title: "Partager vos logs",
              };
              Share.share(shareContent);
            });
          }}
        >
          <ShareIcon />
        </PressableScale>
      ),
    });
  }, [navigation]);

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 16,
        paddingBottom: 16 + insets.bottom,
      }}
    >
      <NativeListHeader label={"Logs"} />
      <NativeList>
        {logs.map((log, index) => (
          <NativeItem
            key={index}
            leading={
              <NativeIcon
                icon={
                  log.type === "ERROR" ? (
                    <CircleX />
                  ) : log.type === "WARN" ? (
                    <TriangleAlert />
                  ) : log.type === "INFO" ? (
                    <CircleAlert />
                  ) : (
                    <Code />
                  )
                }
                color={
                  log.type === "ERROR"
                    ? "#BE0B00"
                    : log.type === "WARN"
                      ? "#CF6B0F"
                      : log.type === "INFO"
                        ? "#0E7CCB"
                        : "#AAA"
                }
                style={{
                  marginLeft: -6,
                }}
              />
            }
          >
            <NativeText variant="title">{log.message}</NativeText>
            <NativeText variant="subtitle">{log.date}</NativeText>
            <NativeText variant="subtitle">{log.from}</NativeText>
          </NativeItem>
        ))}
      </NativeList>
    </ScrollView>
  );
};

export default SettingsDevLogs;
