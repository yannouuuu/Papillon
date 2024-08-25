import React, { useState, useEffect } from "react";
import type { Screen } from "@/router/helpers/types";

import { ScrollView, Image, Text, View } from "react-native";
import LottieView from "lottie-react-native";
import { NativeItem, NativeList, NativeText } from "../Global/NativeComponents";
import { PressableScale } from "react-native-pressable-scale";

const RestaurantCard = ({ theme, solde, repas }: { theme: any, solde: number, repas: number }) => {
  const { colors } = theme;

  return (
    <View style={{
      height: 80,
      justifyContent: "space-between",
      alignItems: "center",
      overflow: "hidden",
      flexDirection: "row",
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    }}>
      <View
        style={{
          flex: 1,
          padding: 15,
        }}
      >
        <NativeText
          style={{
            textAlign: "left",
          }}
        >Solde actuel</NativeText>
        <Text
          style={{
            textAlign: "left",
            fontFamily: "semibold",
            color: solde < 0 ? "D10000" : "#5CB21F",
            fontSize: 30,
          }}
        >{solde} €</Text>
      </View>
      <View
        style={{
          flex: 1,
          padding: 15,
        }}
      >
        <NativeText
          style={{
            textAlign: "right",
            color: colors.text + "50",
          }}
        >Repas restants</NativeText>
        <Text
          style={{
            textAlign: "right",
            fontFamily: "semibold",
            color: colors.text + "50",
            fontSize: 30,
          }}
        >{repas} €</Text>

      </View>

    </View>
  );
};

export default RestaurantCard;