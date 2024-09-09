export interface TimetableClass {
  subject: string
  id: number|string
  type: "lesson" | "activity" | "detention"
  title: string
  startTimestamp: number
  endTimestamp: number
  additionalNotes?: string
  room?: string
  teacher?: string
  backgroundColor?: string,
  status?: TimetableClassStatus,
}

export type Timetable = Array<TimetableClass>;

export enum TimetableClassStatus {
  NORMAL = "normal",
  CANCELED = "canceled",
}