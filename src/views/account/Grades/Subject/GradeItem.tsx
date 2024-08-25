import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { NativeItem, NativeText } from "@/components/Global/NativeComponents";
import { getSubjectData } from "@/services/shared/Subject";
import { Grade } from "@/services/shared/Grade";

interface GradeItemProps {
  subject: {
    average: {
      subjectName: string;
    };
    grades: any[];
  };
  grade: Grade;
  navigation: any;
  index: number;
  totalItems: number;
}

const GradeItem: React.FC<GradeItemProps> = ({ subject, grade, navigation, index, totalItems }) => {
  const [subjectData, setSubjectData] = useState({
    color: "#888888",
    pretty: "Matière inconnue",
    emoji: "❓",
  });

  useEffect(() => {
    const fetchSubjectData = async () => {
      const data = await getSubjectData(subject.average.subjectName);
      setSubjectData(data);
    };

    fetchSubjectData();
  }, [subject.average.subjectName]);

  const formattedDate = new Date(grade.timestamp).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const gradeValue = !grade.student.disabled
    ? parseFloat(grade.student.value).toFixed(2)
    : "N. not";

  return (
    <NativeItem
      separator={index < totalItems - 1}
      onPress={() => navigation.navigate("GradeDocument", { grade })}
      chevron={false}
      animated
      leading={
        <View style={{ backgroundColor: subjectData.color + "22", padding: 10, borderRadius: 100, height: 40, width: 40, justifyContent: "center", alignItems: "center" }}>
          <Text style={{textAlign: "center", fontSize: 18, lineHeight: 23, width: 40, fontFamily: "medium", textAlignVertical: "center"}}>
            {subjectData.emoji}
          </Text>
        </View>
      }
    >
      <View style={styles.container}>
        <View style={styles.leftContent}>
          <NativeText variant="default" numberOfLines={1}>
            {subjectData.pretty}
          </NativeText>
          <NativeText variant="subtitle" numberOfLines={1}>
            {formattedDate}
          </NativeText>
        </View>
        <View style={styles.rightContent}>
          <NativeText style={styles.gradeValue}>{gradeValue}</NativeText>
          <NativeText style={styles.maxGrade}>
            /{parseFloat(grade.outOf.value).toFixed(0)}
          </NativeText>
        </View>
      </View>
    </NativeItem>
  );
};

const styles = {
  container: {
    flexDirection: "row" as const,
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
  },
  leftContent: {
    flex: 1,
  },
  rightContent: {
    flexDirection: "row" as const,
    alignItems: "flex-end",
  },
  gradeValue: {
    fontSize: 19,
    lineHeight: 20,
    fontFamily: "medium",
  },
  maxGrade: {
    fontSize: 15,
    lineHeight: 15,
    opacity: 0.6,
  },
};

export default GradeItem;