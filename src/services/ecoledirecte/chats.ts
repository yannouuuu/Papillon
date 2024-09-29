import ecoledirecte from "pawdirecte";
import { type Homework } from "@/services/shared/Homework";
import { EcoleDirecteAccount } from "@/stores/account/types";
import { ErrorServiceUnauthenticated } from "../shared/errors";
import { weekNumberToDaysList } from "@/utils/epochWeekNumber";
import { log } from "@/utils/logger/logger";
import { Chat, ChatMessage } from "../shared/Chat";

export const getChats = async (account: EcoleDirecteAccount): Promise<Chat[]> => {
  if (!account.authentication.session)
    throw new ErrorServiceUnauthenticated("ecoledirecte");

  const chats = await ecoledirecte.studentReceivedMessages(account.authentication.session, account.authentication.account);

  return chats.map((chat) => ({
    id: chat.id.toString(),
    subject: chat.subject,
    recipient: chat.sender,
    creator: chat.sender,
  }));
};

export const getChatMessages = async (account: EcoleDirecteAccount, chat: Chat): Promise<ChatMessage> => {
  if (!account.instance)
    throw new ErrorServiceUnauthenticated("pronote");

  const message = await ecoledirecte.readMessage(account.authentication.session, account.authentication.account, Number(chat.id));

  return {
    id: message.id.toString(),
    content: message.content,
    author: message.sender,
    date: message.date,
    subject: chat.subject,
    //@ts-ignore
    attachments: message.files.map((a) => ({
      type: a.type,
      name: a.name,
      url: ""
    }))
  };
};

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // months are 0-indexed, so +1
  const day = date.getDate().toString().padStart(2, "0");

  return `${year}-${month}-${day}`;
};
