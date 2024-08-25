import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import LottieView from "lottie-react-native";
import { X } from "lucide-react-native";
import { defaultTabs } from "@/views/settings/SettingsTabs";

interface TabAnimatedTitleProps {
  theme: any;
  route: any;
  navigation: any;
}

const TabAnimatedTitle = ({ theme, route, navigation }: TabAnimatedTitleProps) => {
  return {
    headerTitle: () => <View />,
    headerLeft: () => (
      <TabAnimatedTitleLeft theme={theme} route={route} navigation={navigation} />
    ),
    headerRight: () => (
      <TabAnimatedTitleRight theme={theme} route={route} navigation={navigation} />
    ),
  };
};

const TabAnimatedTitleLeft = ({ theme, route, navigation, style }: TabAnimatedTitleProps) => {
  return (
    <View style={[styles.headerLeft, !route.params?.outsideNav && { paddingHorizontal: 16 }, style]}>
      <LottieView
        source={defaultTabs.find((t) => t.tab === route.name)?.icon}
        autoPlay
        loop={false}
        style={styles.lottieView}
        colorFilters={[{ keypath: "*", color: theme.colors.text }]}
      />
      <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
        {defaultTabs.find((t) => t.tab === route.name)?.label}
      </Text>
    </View>
  );
};

const TabAnimatedTitleRight = ({ theme, route, navigation }: TabAnimatedTitleProps) => {
  return (
    route.params?.outsideNav && (
      <TouchableOpacity
        style={[styles.headerRightButton, { backgroundColor: theme.colors.text + "30" }]}
        onPress={() => navigation.goBack()}
      >
        <X size={20} strokeWidth={3} color={theme.colors.text} />
      </TouchableOpacity>
    )
  );
};

const styles = StyleSheet.create({
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  lottieView: {
    width: 26,
    height: 26,
  },
  headerTitle: {
    fontFamily: "semibold",
    fontSize: 17.5,
  },
  headerRightButton: {
    padding: 6,
    borderRadius: 18,
    opacity: 0.6,
    marginLeft: 16,
  },
});

export default TabAnimatedTitle;
export { TabAnimatedTitleLeft, TabAnimatedTitleRight };