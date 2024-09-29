import { EcoleDirecteAccount } from "@/stores/account/types";
import { ErrorServiceUnauthenticated } from "../shared/errors";
import type {Period} from "@/services/shared/Period";
import {type AverageOverview, type Grade, GradeInformation, GradeValue} from "@/services/shared/Grade";
import {decodeAttachment} from "@/services/pronote/attachment";
import ecoledirecte, {GradeKind, type Period as PawdirectePeriod} from "pawdirecte";
import { useGradesStore } from "@/stores/grades";

const decodePeriod = (p: PawdirectePeriod): Period => {
  return {
    name: p.name,
    id: p.id,
    startTimestamp: p.startDate.getTime(),
    endTimestamp: p.endDate.getTime()
  };
};

const decodeGradeKind = (kind: GradeKind): GradeInformation | undefined => {
  switch (kind) {
    case GradeKind.Error:
    case GradeKind.Grade:
      return undefined;
    case GradeKind.Absent:
      return GradeInformation.Absent;
    case GradeKind.Exempted:
      return GradeInformation.Exempted;
    case GradeKind.NotGraded:
      return GradeInformation.NotGraded;
    case GradeKind.Unfit:
      return GradeInformation.Unfit;
    case GradeKind.Unreturned:
    case GradeKind.UnreturnedZero:
      return GradeInformation.Unreturned;
    case GradeKind.Congratulations:
    default:
      return undefined;
  }
};

const decodeGradeValue = (value: ecoledirecte.GradeValue | undefined): GradeValue  => {
  if (!value)
    return {
      disabled: true,
      information: GradeInformation.NotGraded,
      value: 0
    };

  return {
    disabled: value.kind == GradeKind.Error,
    information: decodeGradeKind(value.kind),
    value: value?.points
  };
};

const getGradeValue = (value: number | string | undefined): GradeValue  => {
  return {
    disabled: false,
    value: value ? Number(value): 0,
    information: undefined
  };
};

export const getGradesPeriods = async (account: EcoleDirecteAccount): Promise<Period[]> => {
  const response = await ecoledirecte.studentGrades(account.authentication.session, account.authentication.account, "");
  return response.periods.map(decodePeriod);
};

export const getGradesAndAverages = async (account: EcoleDirecteAccount, periodName: string, ): Promise<{
  grades: Grade[],
  averages: AverageOverview,
}> => {
  let period: Period | undefined;
  period = (await getGradesPeriods(account)).find((p: Period) => p.name === periodName);


  if (!period)
    throw new Error("La période sélectionnée n'a pas été trouvée.");

  const response = await ecoledirecte.studentGrades(account.authentication.session, account.authentication.account, "");
  const overview = response.overview[period.id as string];

  console.log(JSON.stringify(overview));

  // TODO
  const averages: AverageOverview = {
    classOverall: decodeGradeValue(overview.classAverage),
    overall: decodeGradeValue(overview.overallAverage),
    subjects: overview.subjects.map((s) => ({
      classAverage: decodeGradeValue(s.classAverage),
      color: s.color,
      max: decodeGradeValue(s.maxAverage),
      subjectName: s.name,
      min: decodeGradeValue(s.minAverage),
      average: decodeGradeValue(s.studentAverage),
      outOf: decodeGradeValue(s.outOf)
    }))
  };

  const grades: Grade[] = response.grades.map((g: ecoledirecte.Grade) => ({
    id: buildLocalID(g),
    subjectName: g.subject.name,
    description: g.comment,
    timestamp: g.date.getTime(),

    // TODO
    subjectFile: undefined,
    correctionFile: undefined,

    isBonus: false,
    isOptional: g.isOptional,

    outOf: getGradeValue(g.outOf),
    coefficient: g.coefficient,

    student: decodeGradeValue(g.value),
    average: decodeGradeValue(g.average),
    max: decodeGradeValue(g.max),
    min: decodeGradeValue(g.min)
  }));

  return { averages, grades };
};

export const buildLocalID = (g: ecoledirecte.Grade): string => `${g.subject.name}:${g.date.getTime()}/${g.comment || "none"}`;
