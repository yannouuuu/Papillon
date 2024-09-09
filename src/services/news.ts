import { type Account, AccountService } from "@/stores/account/types";
import { useNewsStore } from "@/stores/news";
import type { Information } from "./shared/Information";
import { checkIfSkoSupported } from "./skolengo/default-personalization";
import { error } from "@/utils/logger/logger";

/**
 * Updates the state and cache for the news.
 */
export async function updateNewsInCache <T extends Account> (account: T): Promise<void> {
  switch (account.service) {
    case AccountService.Pronote: {
      const { getNews } = await import("./pronote/news");
      const informations = await getNews(account);
      useNewsStore.getState().updateInformations(informations);
      break;
    }
    case AccountService.Local: {
      useNewsStore.getState().updateInformations([]);
      break;
    }
    case AccountService.Skolengo: {
      if(!checkIfSkoSupported(account, "News")) {
        error("[updateNewsInCache]: This Skolengo instance doesn't support News.", "skolengo");
        break;
      }
      const { getNews } = await import("./skolengo/data/news");
      const informations = await getNews(account);
      useNewsStore.getState().updateInformations(informations);
      break;
    }
    default: {
      throw new Error("Service not implemented.");
    }
  }
}
