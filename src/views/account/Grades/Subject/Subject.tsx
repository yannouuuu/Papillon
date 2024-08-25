import { NativeListHeader } from "@/components/Global/NativeComponents";
import { animPapillon } from "@/utils/ui/animations";
import React from "react";
import Reanimated, { LinearTransition } from "react-native-reanimated";
import SubjectItem from "./SubjectList";

const GradesSubjectsList: React.FC<{ gradesPerSubject: any, navigation: any, allGrades:any }> = ({ gradesPerSubject, navigation, allGrades }) => {

  return (
    <Reanimated.View
      layout={animPapillon(LinearTransition)}
    >
      <NativeListHeader label="Mes notes" />

      {gradesPerSubject.map((subject, index) => (
        <SubjectItem key={subject.average.subjectName + index} subject={subject} navigation={navigation} allGrades={allGrades} />
      ))}
    </Reanimated.View>
  );
};

export default GradesSubjectsList;