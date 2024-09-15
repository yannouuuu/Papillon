import type { EcoleDirecteAccount } from "@/stores/account/types";
import ecoledirecte from "pawdirecte";
import { Reconnected } from "../reload-account";

export const reload = async (account: EcoleDirecteAccount): Promise<Reconnected<EcoleDirecteAccount>> => {
  const authentication = account.authentication;

  // TODO: refresh returns a list of accounts. Support multiple ED accounts
  const refresh = await ecoledirecte.refresh(authentication.session, authentication.session.token as string, authentication.account.kind);
  const refreshedAccount = refresh[0];

  return {
    instance: undefined,
    authentication: {
      ...authentication,
      ...refreshedAccount
    }
  };
};
