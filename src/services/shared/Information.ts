import type { Attachment } from "./Attachment";

export interface Information {
  id: string
  title: string | undefined
  date: Date
  acknowledged: boolean
  attachments: Attachment[]
  content: string
  author: string
  category: string
  read: boolean
  ref: any
}
