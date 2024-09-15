import { EcoleDirecteAccount } from "@/stores/account/types";
import { Information } from "../shared/Information";
import { ErrorServiceUnauthenticated } from "../shared/errors";
import ecoledirecte from "pawdirecte";

// WAITING FOR PAWDIRECTE UPDATE. THIS WOULD BE UNCOMMENTED AFTER THE LATEST PAWDIRECTE RELEASE

// const parseInformation = (i: ecoledirecte.HomepageTimelineItem): Information => ({
//   id: i.id,
//   title: i.title,
//   date: i.startDate,
//   acknowledged: i.acknowledged,
//   attachments: [],
//   content: i.content,
//   author: i.author,
//   category: i.category.name,
//   read: i.read,
// });

export const getNews = async (account: EcoleDirecteAccount): Promise<Information[]> => {
  if (!account.instance)
    throw new ErrorServiceUnauthenticated("ecoledirecte");

  // const news = await ecoledirecte.studentHomepageTimeline(account.instance);
  // return news.map(parseInformation);
  return [];
};
