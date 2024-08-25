import { useTheme } from "@react-navigation/native";
import React, { useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";

const WidgetHeader: React.FC = ({ icon, title, loading }) => {
  const colors = useTheme().colors;

  const newIcon = icon && React.cloneElement(icon, {
    size: 20,
    strokeWidth: 2.3,
    color: colors.text,
  });

  return (
    <View
      style={{
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        opacity: 0.5,
      }}
    >
      {icon && newIcon}

      <Text
        style={{
          color: colors.text,
          fontFamily: "semibold",
          fontSize: 15,
          flex: 1,
        }}
      >
        {title}
      </Text>

      {loading && (
        <ActivityIndicator />
      )}
    </View>
  );
};

export default WidgetHeader;