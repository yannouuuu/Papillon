import { NativeItem, NativeList, NativeListHeader, NativeText } from "@/components/Global/NativeComponents";
import { useCurrentAccount } from "@/stores/account";
import React, { useEffect, useState, useCallback, useMemo, useLayoutEffect } from "react";
import { Alert, FlatList, KeyboardAvoidingView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@react-navigation/native";
import Reanimated, { Easing, FadeInDown, FadeOutDown, LinearTransition, ZoomIn, ZoomOut } from "react-native-reanimated";
import MissingItem from "@/components/Global/MissingItem";
import BottomSheet from "@/components/Modals/PapillonBottomSheet";
import { Trash2 } from "lucide-react-native";
import ColorIndicator from "@/components/Lessons/ColorIndicator";
import { COLORS_LIST } from "@/services/shared/Subject";

const MemoizedNativeItem = React.memo(NativeItem);
const MemoizedNativeList = React.memo(NativeList);
const MemoizedNativeListHeader = React.memo(NativeListHeader);
const MemoizedNativeText = React.memo(NativeText);

const SettingsSubjects: Screen<"SettingsSubjects"> = ({ navigation }) => {
  const account = useCurrentAccount(store => store.account!);
  const mutateProperty = useCurrentAccount(store => store.mutateProperty);
  const insets = useSafeAreaInsets();
  const colors = useTheme().colors;

  const [subjects, setSubjects] = useState([]);
  const [currentCourseTitle, setCurrentCourseTitle] = useState("");

  const updateCourseTitle = useCallback((course, title) => {
    setCurrentCourseTitle(title);
  }, [subjects]);

  useEffect(() => {
    setTimeout(() => {
      if (subjects.length === 0 && account.personalization.subjects) {
        setSubjects(Object.entries(account.personalization.subjects));
      }
    }, 1);
  }, []);

  useEffect(() => {
    // Simulate an asynchronous operation using setTimeout
    setTimeout(() => {
      if (selectedSubject && currentCourseTitle !== selectedSubject[1].pretty && currentCourseTitle.trim() !== "") {
        setOnSubjects(
          subjects.map((subject) => {
            if (subject[0] === selectedSubject) {
              return [selectedSubject, {
                ...subject[1],
                pretty: currentCourseTitle,
              }];
            }
            return subject;
          })
        );
      }
    }, 0);
  }, [currentCourseTitle]);

  const setOnSubjects = useCallback((newSubjects) => {
    setSubjects(newSubjects);
    mutateProperty("personalization", {
      ...account.personalization,
      subjects: Object.fromEntries(newSubjects),
    });
  }, [subjects]);

  // add reset button in header
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => {
            Alert.alert(
              "Réinitialiser les matières",
              "Voulez-vous vraiment réinitialiser les matières ?",
              [
                {
                  text: "Annuler",
                  style: "cancel",
                },
                {
                  text: "Réinitialiser",
                  style: "destructive",
                  onPress: () => {
                    setSubjects([]);
                  },
                },
              ]
            );
          }}
          style={{
            marginRight: 2,
          }}
        >
          <Trash2
            size={22}
            color={colors.primary}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const [selectedSubject, setSelectedSubject] = useState(null);
  const [opened, setOpened] = useState("#000000");

  return (
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={insets.top + 44}
    >
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingTop: 0,
          paddingBottom: 16 + insets.bottom,
        }}
      >
        {subjects.length > 0 && selectedSubject && (
          <BottomSheet
            opened={opened}
            setOpened={setOpened}
            contentContainerStyle={{
              paddingHorizontal: 16,
            }}
          >
            {selectedSubject &&
              <MemoizedNativeList>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    justifyContent: "flex-start",
                    paddingVertical: 12,
                    paddingHorizontal: 12,
                    gap: 14,
                  }}
                >
                  <ColorIndicator
                    style={{
                      flex: undefined,
                    }}
                    color={subjects.find((subject) => subject[0] === selectedSubject)[1].color}
                  />
                  <View
                    style={{
                      flex: 1,
                      gap: 4,
                    }}
                  >
                    <MemoizedNativeText variant="title" numberOfLines={2}>
                      {currentCourseTitle}
                    </MemoizedNativeText>
                    <MemoizedNativeText
                      variant="subtitle"
                      style={{
                        backgroundColor: subjects.find((subject) => subject[0] === selectedSubject)[1].color + "22",
                        color: subjects.find((subject) => subject[0] === selectedSubject)[1].color,
                        alignSelf: "flex-start",
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        borderRadius: 8,
                        overflow: "hidden",
                        borderCurve: "continuous",
                        opacity: 1,
                      }}
                    >
                      Papillon Park
                    </MemoizedNativeText>
                    <MemoizedNativeText variant="subtitle">
                      HLR T.
                    </MemoizedNativeText>
                  </View>
                </View>
              </MemoizedNativeList>
            }

            <View
              style={{
                flexDirection: "row",
                gap: 16,
              }}
            >
              <MemoizedNativeList
                style={{ marginTop: 16, width: 72 }}
              >
                <MemoizedNativeItem
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    height: 64,
                  }}
                >
                  <TextInput
                    style={{
                      fontFamily: "medium",
                      fontSize: 26,
                      color: colors.text,
                      textAlign: "center",
                      textAlignVertical: "center",
                    }}
                    value={subjects.find((subject) => subject[0] === selectedSubject)[1].emoji}
                    onChangeText={(text) => {
                      var regexp = /((\ud83c[\udde6-\uddff]){2}|([\#\*0-9]\u20e3)|(\u00a9|\u00ae|[\u2000-\u3300]|[\ud83c-\ud83e][\ud000-\udfff])((\ud83c[\udffb-\udfff])?(\ud83e[\uddb0-\uddb3])?(\ufe0f?\u200d([\u2000-\u3300]|[\ud83c-\ud83e][\ud000-\udfff])\ufe0f?)?)*)/g;

                      const emojiMatch = text.match(regexp);

                      if (emojiMatch) {
                        const lastEmoji = emojiMatch[emojiMatch.length - 1];
                        setOnSubjects(
                          subjects.map((subject) => {
                            if (subject[0] === selectedSubject) {
                              return [selectedSubject, {
                                ...subject[1],
                                emoji: lastEmoji,
                              }];
                            }
                            return subject;
                          })
                        );
                      }
                    }}
                  />
                </MemoizedNativeItem>
              </MemoizedNativeList>

              <MemoizedNativeList
                style={{ marginTop: 16, flex: 1 }}
              >
                <MemoizedNativeItem>
                  <MemoizedNativeText variant="subtitle" numberOfLines={1}>
                    Nom de la matière
                  </MemoizedNativeText>
                  <TextInput
                    style={{
                      fontFamily: "medium",
                      fontSize: 16,
                      color: colors.text,
                    }}
                    value={currentCourseTitle}
                    onChangeText={(text) => {
                      updateCourseTitle(selectedSubject, text);
                    }}
                  />
                </MemoizedNativeItem>
              </MemoizedNativeList>
            </View>

            <MemoizedNativeList
              style={{ marginTop: 16 }}
            >
              <MemoizedNativeItem
              >
                <MemoizedNativeText variant="subtitle">
                  Couleur
                </MemoizedNativeText>

                <FlatList
                  style={{
                    marginHorizontal: -18,
                    paddingHorizontal: 12,
                    marginTop: 4,
                  }}
                  data={COLORS_LIST}
                  horizontal
                  keyExtractor={(item) => item}
                  ListFooterComponent={<View style={{ width: 16 }} />}
                  showsHorizontalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => {
                        setOnSubjects(
                          subjects.map((subject) => {
                            if (subject[0] === selectedSubject) {
                              return [selectedSubject, {
                                ...subject[1],
                                color: item,
                              }];
                            }
                            return subject;
                          })
                        );
                      }}
                    >
                      <View
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 80,
                          backgroundColor: item,
                          marginHorizontal: 5,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {subjects.find((subject) => subject[0] === selectedSubject)[1].color === item && (
                          <Reanimated.View
                            style={{
                              width: 26,
                              height: 26,
                              borderRadius: 80,
                              backgroundColor: item,
                              borderColor: colors.background,
                              borderWidth: 3,
                            }}
                            entering={ZoomIn.springify().mass(1).damping(20).stiffness(300)}
                            exiting={ZoomOut.springify().mass(1).damping(20).stiffness(300)}
                          />
                        )}
                      </View>
                    </TouchableOpacity>
                  )}
                />
              </MemoizedNativeItem>
            </MemoizedNativeList>
          </BottomSheet>
        )}

        <MemoizedNativeList>
          <View
            style={{
              height: 120,
              backgroundColor: colors.primary + "22",
            }}
          />
          <MemoizedNativeItem>
            <MemoizedNativeText variant="title">
              Personnalisez vos matières
            </MemoizedNativeText>
            <MemoizedNativeText variant="subtitle">
              Personnalisez le nom, l'émoji et la couleur des matières de votre emploi du temps
            </MemoizedNativeText>
          </MemoizedNativeItem>
        </MemoizedNativeList>

        {subjects.length > 0 && (
          <MemoizedNativeList
            style={{
              marginTop: 16,
            }}
          >
            {subjects.map((subject, index) => {
              if (!subject[0] || !subject[1] || !subject[1].emoji || !subject[1].pretty || !subject[1].color) return <View key={index} />;
              const emojiRef = React.createRef();
              return (
                <MemoizedNativeItem
                  key={index + subject[0] + subject[1].emoji + subject[1].pretty + subject[1].color}
                  onPress={() => {
                    setSelectedSubject(subject[0]);
                    setCurrentCourseTitle(subject[1].pretty);
                    setOpened(true);
                  }}
                  leading={
                    <View
                      style={{
                        flexDirection: "row",
                        gap: 14,
                        alignItems: "center",
                      }}
                    >
                      <View
                        style={{
                          width: 4,
                          height: 40,
                          borderRadius: 8,
                          backgroundColor: subject[1].color || "#000000",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      />

                      <Text
                        style={{
                          fontSize: 26,
                        }}
                      >
                        {subject[1].emoji || "🎨"}
                      </Text>
                    </View>
                  }
                >
                  <MemoizedNativeText variant="body" numberOfLines={2}>
                    {subject[1].pretty || "Matière"}
                  </MemoizedNativeText>
                </MemoizedNativeItem>
              );
            })}
          </MemoizedNativeList>
        )}

        {subjects.length === 0 && (
          <MissingItem
            style={{
              marginTop: 16,
            }}
            emoji={"🎨"}
            title={"Une matière manque ?"}
            description={"Essayez d'ouvrir quelques journées dans votre emploi du temps"}
          />
        )}

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SettingsSubjects;
