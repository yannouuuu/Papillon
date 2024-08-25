import React from "react";
import { Text, View } from "react-native";
import { NativeText } from "./NativeComponents";
import Reanimated, { FadeInUp, FadeOutDown, LinearTransition } from "react-native-reanimated";

interface MissingItemProps {
  style?: any;
  emoji: string;
  title: string;
  description: string;
}

const MissingItem: React.FC<MissingItemProps> = ({ style, emoji, title, description }) => {
  return (
    <Reanimated.View
      layout={LinearTransition.springify().mass(1).damping(20).stiffness(300)}
      style={[{
        justifyContent: "center",
        alignItems: "center",
        gap: 4,
      }, style]}
      entering={FadeInUp}
      exiting={FadeOutDown}
    >
      <Text style={{ fontSize: 32 }}>
        {emoji}
      </Text>

      <NativeText variant="title" style={{ textAlign: "center", marginTop: 3 }}>
        {title}
      </NativeText>

      <NativeText variant="subtitle" style={{textAlign: "center"}}>
        {description}
      </NativeText>
    </Reanimated.View>
  );
};

export default MissingItem;