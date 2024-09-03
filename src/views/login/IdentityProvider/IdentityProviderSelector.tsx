import React, { memo, useEffect, useState } from "react";
import { Image, View, StyleSheet, Text } from "react-native";

import type { Screen } from "@/router/helpers/types";
import { ScrollView } from "react-native-gesture-handler";
import { NativeItem, NativeList, NativeListHeader, NativeText } from "@/components/Global/NativeComponents";

const IdentityProviderSelector: Screen<"IdentityProviderSelector"> = ({ navigation }) => {
  const identityProviders = [
    {
      name: "univ_rennes1",
      title: "Université Rennes 1",
      description: "Utilisez votre compte Sésame pour vous connecter",
      image: require("@/../assets/images/service_rennes1.png"),
      navigate: () => navigation.navigate("UnivRennes1_Login"),
    },
    {
      name: "univ_limoges",
      title: "Université de Limoges",
      description: "Utilisez votre compte Biome pour vous connecter",
      image: require("@/../assets/images/service_unilim.png"),
      navigate: () => navigation.navigate("UnivLimoges_Login"),
    },
  ];

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 16, paddingTop: 0 }}
    >
      <NativeListHeader label="Fournisseurs disponibles" />

      <NativeList>
        {identityProviders.map((identityProvider) => (
          <NativeItem
            key={identityProvider.name}
            onPress={() => identityProvider.navigate()}
            leading={<Image source={identityProvider.image} style={{ width: 40, height: 40, borderRadius: 300 }} />}
          >
            <NativeText variant="title">{identityProvider.title}</NativeText>
            <NativeText variant="subtitle">
              {identityProvider.description}
            </NativeText>
          </NativeItem>
        ))}
      </NativeList>

    </ScrollView>
  );
};

export default IdentityProviderSelector;