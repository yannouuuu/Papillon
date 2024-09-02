import React, { memo, useEffect, useState } from "react";
import { Image, View, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Reanimated, { LinearTransition, FlipInXDown } from "react-native-reanimated";

import type { Screen } from "@/router/helpers/types";

import PapillonShineBubble from "@/components/FirstInstallation/PapillonShineBubble";
import DuoListPressable from "@/components/FirstInstallation/DuoListPressable";
import ButtonCta from "@/components/FirstInstallation/ButtonCta";
import MaskStars from "@/components/FirstInstallation/MaskStars";
import { useAlert } from "@/providers/AlertProvider";
import { Audio } from "expo-av";
import { useTheme } from "@react-navigation/native";
import GetV6Data from "@/utils/login/GetV6Data";
import { Check, Undo2 } from "lucide-react-native";
import Constants from "expo-constants";

const ServiceSelector: Screen<"ServiceSelector"> = ({ navigation }) => {
  const theme = useTheme();
  const { colors } = theme;
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const { showAlert } = useAlert();

  type Services = "pronote" | "ed" | "skolengo";
  const [service, setService] = useState<Services | null>(null);

  const [v6Data, setV6Data] = useState<any | null>(null);

  useEffect(() => {
    setTimeout(async () => {
      const v6Data = await GetV6Data();
      setV6Data(v6Data);
      if (v6Data.restore && !v6Data.imported) {
        navigation.navigate("PronoteV6Import", { data: v6Data.data });
      }
    }, 1);
  }, []);

  const services = [
    {
      name: "pronote",
      title: "PRONOTE",
      image: require("../../../assets/images/service_pronote.png"),
      login: () => {
        navigation.navigate("PronoteAuthenticationSelector");
        playSound();
      },
    },
    {
      name: "ed",
      title: "ÉcoleDirecte",
      image: require("../../../assets/images/service_ed.png"),
      login: () => {
        if (__DEV__) {
          showAlert({
            title: "[DEBUG] Service en développement",
            message: "Ce service est actuellement en développement. Certaines fonctionnalités peuvent ne pas fonctionner correctement ou ne pas être disponibles.",
            actions: [
              {
                title: "Annuler",
                onPress: () => { },
                icon: <Undo2 />,
                primary: false,
              },
              {
                title: "Continuer",
                onPress: () => {
                  navigation.navigate("SkolengoAuthenticationSelector");
                  playSound();
                },
                icon: <Check />,
                primary: true,
              }
            ]
          });
        } else UnsupportedAlert();
      }
    },
    {
      name: "skolengo",
      title: "Skolengo",
      image: require("../../../assets/images/service_skolengo.png"),
      login: () => {
        if (__DEV__) {
          showAlert({
            title: "[DEBUG] Service en développement",
            message: "Ce service est actuellement en développement. Certaines fonctionnalités peuvent ne pas fonctionner correctement ou ne pas être disponibles.",
            actions: [
              {
                title: "Annuler",
                onPress: () => { },
                icon: <Undo2 />,
                primary: false,
              },
              {
                title: "Continuer",
                onPress: () => {
                  navigation.navigate("SkolengoAuthenticationSelector");
                  playSound();
                },
                icon: <Check />,
                primary: true,
              }
            ]
          });
        } else UnsupportedAlert();
      }
    },
  ];

  const UnsupportedAlert = () => {
    showAlert({
      title: "Service non supporté",
      message: "Désolé, ce service n'est pas encore supporté. Veuillez réessayer dans une prochaine version."
    });
  };

  useEffect(() => {
    const loadSound = async () => {
      const { sound } = await Audio.Sound.createAsync(
        require("@/../assets/sound/1.wav")
      );

      setSound(sound);
    };

    loadSound();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const playSound = () => sound?.replayAsync();

  return (
    <SafeAreaView style={styles.container}>
      <MaskStars />

      <PapillonShineBubble
        message="Pour commencer, quel est ton service scolaire ?"
        numberOfLines={2}
        width={260}
        offsetTop={"20%"}
      />

      <Reanimated.View
        style={styles.list}
        layout={LinearTransition}
      >
        {services.map((srv) => (
          <Reanimated.View
            style={{ width: "100%" }}
            layout={LinearTransition}
            entering={FlipInXDown.springify().delay(100)}
          >
            <DuoListPressable
              key={srv.name}
              leading={
                <Image
                  source={srv.image}
                  style={styles.image}
                  resizeMode="contain"
                />
              }
              text={srv.title}
              enabled={srv.name === service}
              onPress={() => setService(srv.name as Services)}
            />
          </Reanimated.View>
        ))}
      </Reanimated.View>

      <View style={styles.buttons}>
        <ButtonCta
          primary
          value="Confirmer"
          disabled={service === null}
          onPress={services.find((srv) => srv.name === service)?.login}
        />

        {v6Data && v6Data.restore && (
          <ButtonCta
            value="Importer mon compte"
            onPress={() => navigation.navigate("PronoteV6Import", { data: v6Data.data })}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    gap: 20,
  },

  list: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    gap: 9,
    paddingHorizontal: 20,
  },

  buttons: {
    width: "100%",
    paddingHorizontal: 16,
    gap: 9,
    marginBottom: 16,
  },

  image: {
    width: 32,
    height: 32,
    borderRadius: 80,
  },
});

export default memo(ServiceSelector);
