import { useTheme } from "@react-navigation/native";
import React from "react";
import { Dimensions, Modal, Platform, Pressable, Text, TouchableOpacity, View } from "react-native";

import { Calendar, X } from "lucide-react-native";

import Reanimated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeOut,
  FadeOutDown,
  LinearTransition,
  ZoomIn,
  ZoomOut
} from "react-native-reanimated";

import RNDateTimePicker from "@react-native-community/datetimepicker";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const HeaderCalendar: React.FC<{ index: Number, oldPageIndex: Number, showPicker: () => void, changeIndex: (index: number) => void, getDateFromIndex: (index: number) => Date }> = ({ index, oldPageIndex, showPicker, changeIndex, getDateFromIndex }) => {
  const { colors } = useTheme();

  const dims = Dimensions.get("window");
  const tablet = dims.width > 600;

  return (
    <Reanimated.View
      style={{
        width: Dimensions.get("window").width - 50 - (tablet ? 400 : 0),
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Reanimated.View
        style={{
          width: 1000,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 0,
        }}
      >
        <HeaderDateComponent
          date={getDateFromIndex(index - 2)}
          active={false}
          key={index - 2}
          location="left"
          onPress={() => changeIndex(index - 2)}
        />
        <HeaderDateComponent
          date={getDateFromIndex(index - 1)}
          active={false}
          key={index - 1}
          location="left"
          onPress={() => changeIndex(index - 1)}
        />
        <HeaderDateComponent
          date={getDateFromIndex(index)}
          active={true}
          key={index}
          onPress={showPicker}
        />
        <HeaderDateComponent
          date={getDateFromIndex(index + 1)}
          active={false}
          key={index + 1}
          location="right"
          onPress={() => changeIndex(index + 1)}
        />
        <HeaderDateComponent
          date={getDateFromIndex(index + 2)}
          active={false}
          key={index + 2}
          location="right"
          onPress={() => changeIndex(index + 2)}
        />
      </Reanimated.View>
    </Reanimated.View>
  );
};

const HeaderDateComponent: React.FC<{ date: Date, active: Boolean, location: String, onPress?: () => void }> = ({ date, active, location, onPress }) => {
  const { colors } = useTheme();

  return (
    <Reanimated.View
      layout={LinearTransition.duration(300).easing(Easing.bezier(0.5, 0, 0, 1))}
    >
      <TouchableOpacity
        onPress={onPress}
      >
        <Reanimated.View
          style={[
            {
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              paddingVertical: 6,
              borderRadius: 10,
              borderCurve: "continuous",
              flexDirection: "row",
              paddingHorizontal: 10,
              overflow: "hidden",
            },
            active ? {
            } : {
              width: 120,
              opacity: 0.4,
            },
            location === "left" ? {
            } : location === "right" ? {
            } : {},
          ]}
        >
          {active &&
            <Reanimated.View
              layout={LinearTransition.springify().mass(1).damping(20).stiffness(300)}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: colors.primary + "21",
              }}
              entering={ZoomIn.springify().mass(1).damping(20).stiffness(300)}
              exiting={ZoomOut.springify().mass(1).damping(20).stiffness(300)}
            />
          }

          {active &&
            <Reanimated.View
              layout={LinearTransition.springify().mass(1).damping(20).stiffness(300)}
              entering={ZoomIn.duration(200)}
              exiting={ZoomOut.duration(200)}
            >
              <Calendar
                size={20}
                color={colors.primary}
              />
            </Reanimated.View>
          }

          <Reanimated.Text
            numberOfLines={1}
            style={{
              fontSize: 16,
              fontFamily: "medium",
              color: !active ? colors.text : colors.primary,
            }}
            layout={LinearTransition.duration(200)}
          >
            {date.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })}
          </Reanimated.Text>
        </Reanimated.View>
      </TouchableOpacity>
    </Reanimated.View>
  );
};

const LessonsDateModal = ({ showDatePicker, setShowDatePicker, currentPageIndex, defaultDate, PagerRef, getDateFromIndex }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  if (Platform.OS === "android") {
    return (showDatePicker &&
      <RNDateTimePicker
        style={{
          marginHorizontal: 8,
          marginTop: -5,
          marginBottom: 10,
        }}
        value={getDateFromIndex(currentPageIndex)}
        display={"calendar"}
        mode="date"
        onChange={(event, selectedDate) => {
          if (selectedDate) {
            const newDate = new Date(selectedDate);
            const newPageIndex = Math.round((newDate - defaultDate) / 86400000);
            PagerRef.current?.setPage(newPageIndex);
          }
          setShowDatePicker(false);
        }}
        onError={() => {
          setShowDatePicker(false);
        }}
      />
    );
  }

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={showDatePicker}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "flex-end",
          alignItems: "center",
          backgroundColor: "#00000099",
          paddingBottom: insets.bottom + 10,
        }}
      >
        <Pressable
          style={{
            width: "100%",
            flex: 1,
          }}
          onPress={() => setShowDatePicker(false)}
        />

        {showDatePicker &&
          <Reanimated.View
            style={{
              width: Dimensions.get("window").width - 20,
              backgroundColor: colors.card,
              overflow: "hidden",
              borderRadius: 16,
              borderCurve: "continuous",
            }}
            entering={FadeInDown.mass(1).damping(20).stiffness(300)}
            exiting={FadeOutDown.mass(1).damping(20).stiffness(300)}
          >
            <View
              style={{
                flexDirection: "column",
                alignItems: "flex-start",
                paddingHorizontal: 18,
                paddingVertical: 14,
                backgroundColor: colors.primary,
                gap: 2,
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontFamily: "medium",
                  color: "#ffffff99",
                }}
              >
                Sélection de la date
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: "semibold",
                  color: "#fff",
                }}
              >
                {getDateFromIndex(currentPageIndex).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
              </Text>

              <TouchableOpacity
                style={{
                  position: "absolute",
                  right: 12,
                  top: 12,
                  backgroundColor: "#ffffff39",
                  opacity: 0.7,
                  padding: 6,
                  borderRadius: 50,
                }}
                onPress={() => setShowDatePicker(false)}
              >
                <X
                  size={20}
                  strokeWidth={3}
                  color="#fff"
                />
              </TouchableOpacity>
            </View>
            <RNDateTimePicker
              style={{
                marginHorizontal: 8,
                marginTop: -5,
                marginBottom: 10,
              }}
              value={getDateFromIndex(currentPageIndex)}
              display={"inline"}
              mode="date"
              locale="fr-FR"
              accentColor={colors.primary}
              onChange={(event, selectedDate) => {
                if (selectedDate) {
                  const newDate = new Date(selectedDate);
                  const newPageIndex = Math.round((newDate - defaultDate) / 86400000);
                  PagerRef.current?.setPage(newPageIndex);
                }
              }}
            />
          </Reanimated.View>
        }
      </View>
    </Modal>
  );
};

export { HeaderCalendar, LessonsDateModal };