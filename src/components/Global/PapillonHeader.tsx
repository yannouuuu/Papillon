import React from "react";
import { Platform, Touchable, View } from "react-native";
import { NativeText } from "./NativeComponents";
import TabAnimatedTitle, { TabAnimatedTitleLeft, TabAnimatedTitleRight } from "./TabAnimatedTitle";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TouchableOpacity } from "react-native-gesture-handler";
import { ArrowLeft } from "lucide-react-native";

const PapillonHeader = ({ children, theme, route, navigation }) => {
  const insets = useSafeAreaInsets();
  const topPadding = (Platform.OS === "ios" && route.params?.outsideNav) ? 0 : insets.top;

  const largeHeader = route.params?.outsideNav || Platform.OS !== "ios";

  return (
    <View
      style={{
        height: (largeHeader ? 56 : 44) + (topPadding ? topPadding : 0),
        backgroundColor: theme.colors.card,
        borderColor: theme.colors.border,
        borderBottomWidth: 0.5,
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        zIndex: 10000,
        paddingTop: topPadding ?( topPadding ) : 0,
      }}
    >
      {route.params?.outsideNav && Platform.OS !== "ios" && (
        <TouchableOpacity
          style={{
            paddingRight: 16,
          }}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft color={theme.colors.text} size={24} />
        </TouchableOpacity>
      )}

      <TabAnimatedTitleLeft
        theme={theme}
        route={route}
        navigation={navigation}
        style={{ paddingHorizontal: 0 }}
      />

      <View
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "row",
          justifyContent: "flex-end",
          alignItems: "center",
          marginRight: Platform.OS !== "ios" ? -16 : 0,
        }}
      >
        {children && children}

        {Platform.OS === "ios" && (
          <TabAnimatedTitleRight theme={theme} route={route} navigation={navigation} />
        )}
      </View>
    </View>
  );
};

export default PapillonHeader;