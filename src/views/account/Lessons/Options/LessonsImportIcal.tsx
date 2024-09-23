import ButtonCta from "@/components/FirstInstallation/ButtonCta";
import { NativeItem, NativeList, NativeListHeader, NativeText } from "@/components/Global/NativeComponents";
import { useCurrentAccount } from "@/stores/account";
import { useTimetableStore } from "@/stores/timetable";
import { useTheme } from "@react-navigation/native";
import { Calendar } from "lucide-react-native";
import React from "react";
import { Alert, TextInput, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

import * as Clipboard from "expo-clipboard";

const ical = require("cal-parser");

const LessonsImportIcal = () => {
  const theme = useTheme();

  const account = useCurrentAccount(store => store.account!);
  const mutateProperty = useCurrentAccount(store => store.mutateProperty);

  const [url, setUrl] = React.useState("");

  const saveIcal = async () => {
    const oldUrls = account.personalization.icalURLs || [];

    fetch(url)
      .then(response => response.text())
      .then(text => {
        const parsed = ical.parseString(text);
        let newParsed = parsed;
        newParsed.events = [];
        console.log(newParsed);

        const title = "Mon calendrier" + (oldUrls.length > 0 ? ` ${oldUrls.length + 1}` : "");

        mutateProperty("personalization", {
          ...account.personalization,
          icalURLs: [...oldUrls, {
            name: title,
            url,
          }]
        });
      });
  };

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 16,
        paddingTop: 0,
      }}
    >
      <NativeListHeader label="Utiliser un lien iCal" />

      <NativeList>
        <NativeItem>
          <TextInput
            value={url}
            onChangeText={setUrl}
            placeholder="Adresse URL du calendrier"
            placeholderTextColor={theme.colors.text + 88}
            style={{
              flex: 1,
              paddingHorizontal: 6,
              paddingVertical: 0,
              fontFamily: "medium",
              fontSize: 16,
              color: theme.colors.text,
            }}
          />
        </NativeItem>
      </NativeList>

      <ButtonCta
        value="Importer"
        primary
        style={{
          marginTop: 16,
        }}
        onPress={() => {saveIcal();}}
      />

      {account.personalization.icalURLs && account.personalization.icalURLs.length > 0 &&(<>
        <NativeListHeader label="URLs ajoutées" />

        <NativeList>
          {account.personalization.icalURLs.map((url, index) => (
            <NativeItem
              key={index}
              icon={<Calendar />}
              onPress={() => {
                Alert.alert(url.name, url.url, [
                  {
                    text: "Annuler",
                    style: "cancel",
                  },
                  {
                    text: "Copier l'URL",
                    onPress: () => {
                      Clipboard.setString(url.url);
                      Alert.alert("Copié", "L'URL a été copiée dans le presse-papiers.");
                    },
                  },
                  {
                    text: "Supprimer le calendrier",
                    style: "destructive",
                    onPress: () => {
                      useTimetableStore.getState().removeClassesFromSource("ical://"+url.url);
                      const urls = account.personalization.icalURLs || [];
                      urls.splice(index, 1);
                      mutateProperty("personalization", {
                        ...account.personalization,
                        icalURLs: urls,
                      });
                    },
                  },
                ]);
              }}
            >
              <NativeText variant="title">{url.name}</NativeText>
              <NativeText variant="subtitle">{url.url}</NativeText>
            </NativeItem>
          ))}
        </NativeList>
      </>)}

    </ScrollView>
  );
};

export default LessonsImportIcal;