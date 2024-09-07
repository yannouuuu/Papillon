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
    return periodGrades[periodGrades.length - 1]; // Récupération de la dernière note.
  }, [grades, defaultPeriod]);

  const gradeValue = lastGrade?.student.value ?? 0;
  const maxGradeValue = lastGrade?.outOf?.value ?? 20; // Récupération de l'échelle de notation du professeur

  const gradeColor = useMemo(() => {
    if (gradeValue === null || maxGradeValue === null) return "grey"; // Cas de valeur absente

    const percentage = (gradeValue / maxGradeValue) * 100; // Calcul du pourcentage

    if (percentage < 50) return "red"; // Rouge si inférieur à 50%
    if (percentage < 60) return "orange"; // Orange entre 50% et 60%
    return "blue"; // Bleu pour tout ce qui est supérieur ou égal à 60%
  }, [gradeValue, maxGradeValue]);

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
      {/* Titre du widget */}
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

      {/* Contenu principal : Emoji + Description */}
      <Reanimated.View
        style={{
          alignItems: "center",
          flexDirection: "row", // Même ligne pour l'emoji et la description
          justifyContent: "space-between", // Espace entre l'emoji et la description
          width: "100%",
          marginTop: "auto",
          gap: 10,
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
          <Text style={{ fontSize: 29 }}>{subjectEmoji}</Text>
        </View>

        {/* Affichage du commentaire de l'évaluation en gras */}
        <Text
          style={{
            color: colors.text,
            fontFamily: "semibold",
            fontSize: 25,
            flex: 1, // Permet au texte de prendre l'espace restant
          }}
        >
          {lastGrade?.description || "Nouvelle Note"}
        </Text>
      </Reanimated.View>

      {/* Affichage de la note en bas */}
      <Reanimated.View
        style={{
          flexDirection: "row",
          alignItems: "flex-end",
          justifyContent: "flex-start", // Met la note à gauche
          marginTop: 10, // Espace avec le reste
          gap: 4,
        }}
      >
        {/* Affichage de la valeur de la note */}
        <AnimatedNumber
          value={gradeValue?.toFixed(2) ?? ""}
          style={{
            fontSize: 24.5,
            lineHeight: 24,
            fontFamily: "semibold",
            color: gradeColor,
          }}
          contentContainerStyle={{
            paddingLeft: 6,
          }}
        />
        {/* Affichage de l'unité de notation */}
        <Text
          style={{
            color: colors.text + "80", // Un peu plus transparent
            fontFamily: "semiBold",
            fontSize: 15,
          }}
        >
          /{maxGradeValue}
        </Text>
      </Reanimated.View>
    </>
  );
});

export default LastGradeWidget;
