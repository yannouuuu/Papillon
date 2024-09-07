import { useTheme } from "@react-navigation/native";
import { Book } from "lucide-react-native"; // Utilisation de Book comme icône de matière
import React, { forwardRef, useEffect, useImperativeHandle, useMemo } from "react";
import { Text, View } from "react-native";
import Reanimated, { LinearTransition } from "react-native-reanimated";

import AnimatedNumber from "@/components/Global/AnimatedNumber";
import { WidgetProps } from "@/components/Home/Widget";
import { updateGradesAndAveragesInCache } from "@/services/grades";
import { useCurrentAccount } from "@/stores/account";
import { useGradesStore } from "@/stores/grades";
import { getSubjectData } from "@/services/shared/Subject"; // Importation pour l'obtention des données sur la matière

const LastGradeWidget = forwardRef(({
  setLoading,
  setHidden,
  loading,
}: WidgetProps, ref) => {
  const theme = useTheme();
  const { colors } = theme;

  const account = useCurrentAccount((store) => store.account);

  const grades = useGradesStore((store) => store.grades);
  const defaultPeriod = useGradesStore((store) => store.defaultPeriod);

  useImperativeHandle(ref, () => ({
    handlePress: () => "Grades"
  }));

  const lastGrade = useMemo(() => {
    const periodGrades = grades[defaultPeriod] || [];
    return periodGrades[periodGrades.length - 1]; // Récupérer la dernière note
  }, [grades, defaultPeriod]);

  const gradeValue = lastGrade?.student.value ?? 0;
  const maxGradeValue = lastGrade?.scale ?? 20; // Utiliser l'échelle définie par le professeur

  const gradeColor = useMemo(() => {
    if (gradeValue < 10) return "red"; // Rouge si la note est inférieure à 10
    if (gradeValue < 12) return "orange"; // Orange si inférieur à la moyenne générale
    return "blue"; // Bleu sinon
  }, [gradeValue]);

  const subjectData = getSubjectData(lastGrade?.subjectName || ""); // Récupération des données de la matière
  const subjectEmoji = subjectData.emoji;

  useEffect(() => {
    void async function () {
      if (!account?.instance || !defaultPeriod) return;
      setLoading(true);

      await updateGradesAndAveragesInCache(account, defaultPeriod);
      setLoading(false);
    }();
  }, [defaultPeriod]);

  useEffect(() => {
    setHidden(typeof gradeValue !== "number" || gradeValue < 0);
  }, [gradeValue]);

  if (!lastGrade) {
    setHidden(true);
  }

  return (
    <>
      <View
        style={{
          justifyContent: "flex-start",
          alignItems: "center",
          flexDirection: "row",
          width: "100%",
          gap: 7,
          opacity: 0.5,
        }}
      >
        <Book size={20} color={colors.text} />
        <Text
          style={{
            color: colors.text,
            fontFamily: "semibold",
            fontSize: 16,
          }}
        >
          Dernière Note
        </Text>
      </View>

      <Reanimated.View
        style={{
          alignItems: "flex-start",
          flexDirection: "column",
          width: "100%",
          marginTop: "auto",
          gap: 4,
        }}
        layout={LinearTransition}
      >
        {/* Affichage de l'émoji dans un cadre rond */}
        <View
          style={{
            backgroundColor: "#FFF1F3", // Couleur de fond très claire
            borderRadius: 50, // Pour faire un cadre rond
            padding: 6,
          }}
        >
          <Text style={{ fontSize: 20 }}>{subjectEmoji}</Text>
        </View>

        {/* Affichage du commentaire de l'évaluation en gras */}
        <Text
          style={{
            color: colors.text,
            fontFamily: "semibold",
            fontSize: 16,
            marginLeft: 8, // Pour laisser un espace entre l'emoji et le texte
          }}
        >
          {lastGrade?.description || "Nouvelle Note"}
        </Text>

        <Reanimated.View
          style={{
            flexDirection: "row",
            alignItems: "flex-end",
            gap: 4,
          }}
        >
          {/* Affichage de la valeur de la note */}
          <AnimatedNumber
            value={gradeValue?.toFixed(2) ?? ""}
            style={{
              fontSize: 24,
              lineHeight: 24,
              fontFamily: "semibold",
              color: gradeColor
            }}
            contentContainerStyle={{
              paddingLeft: 6,
            }}
          />
          {/* Affichage de l'unité de notation */}
          <Text
            style={{
              color: colors.text + "80", // Un peu plus transparent
              fontFamily: "medium",
              fontSize: 16,
            }}
          >
            /{maxGradeValue}
          </Text>
        </Reanimated.View>
      </Reanimated.View>
    </>
  );
});

export default LastGradeWidget;
