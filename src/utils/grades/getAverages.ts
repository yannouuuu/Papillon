import type { Grade } from "@/services/shared/Grade";

export interface GradeHistory {
  value: number;
  date: string;
};

type Target = "student" | "average" | "min" | "max";

export type AverageDiffGrade = {
  difference?: number;
  with: number;
  without: number;
};

const getPronoteAverage = (grades: Grade[], target: Target = "student"): number => {
  if (!grades || grades.length === 0) return -1;

  const groupedBySubject = grades.reduce((acc: Record<string, Grade[]>, grade) => {
    (acc[grade.subjectName] ||= []).push(grade);
    return acc;
  }, {});

  const totalAverage = Object.values(groupedBySubject).reduce((acc, subjectGrades) => {
    return acc + getSubjectAverage(subjectGrades, target);
  }, 0);

  return totalAverage / Object.keys(groupedBySubject).length;
};

export const getSubjectAverage = (subject: Grade[], target: Target = "student"): number => {
  let calcGradesSum = 0;
  let calcOutOfSum = 0;

  for (const grade of subject) {
    const targetGrade = grade[target];

    if (!targetGrade || targetGrade.disabled || targetGrade.value === null || targetGrade.value < 0 || grade.coefficient === 0) continue;

    const coefficient = grade.coefficient;
    const outOfValue = grade.outOf.value!;

    if (grade.isBonus) {
      const averageMoy = outOfValue / 2;
      const newGradeValue = targetGrade.value - averageMoy;

      if (newGradeValue < 0) continue;

      calcGradesSum += newGradeValue;
      calcOutOfSum += 1; 
    } else if (targetGrade.value > 20 || coefficient < 1) {
      const gradeOn20 = (targetGrade.value / outOfValue) * 20;
      calcGradesSum += gradeOn20 * coefficient;
      calcOutOfSum += 20 * coefficient;
    } else {
      calcGradesSum += targetGrade.value * coefficient;
      calcOutOfSum += outOfValue * coefficient;
    }
  }

  if (calcOutOfSum === 0) return 0;

  const subjectAverage = Math.min((calcGradesSum / calcOutOfSum) * 20, 20);
  return subjectAverage;
};

const getAverageDiffGrade = (grades: Grade[], list: Grade[], target: Target = "student"): AverageDiffGrade => {
  const baseAverage = getSubjectAverage(list, target);
  const baseWithoutGradeAverage = getSubjectAverage(list.filter(grade => !grades.includes(grade)), target);

  return {
    difference: baseWithoutGradeAverage - baseAverage,
    with: baseAverage,
    without: baseWithoutGradeAverage,
  };
};

const getAveragesHistory = (grades: Grade[], target: Target = "student", final?: number): GradeHistory[] => {
  const history = grades.map((grade, index) => ({
    value: getPronoteAverage(grades.slice(0, index + 1), target),
    date: new Date(grade.timestamp).toISOString(),
  }));

  history.sort((a, b) => a.date.localeCompare(b.date));

  history.push({
    value: final ?? getPronoteAverage(grades, target),
    date: new Date().toISOString(),
  });

  return history;
};

export {
  getPronoteAverage,
  getAverageDiffGrade,
  getAveragesHistory,
};
