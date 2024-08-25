import AsyncStorage from "@react-native-async-storage/async-storage";
import { createJSONStorage, persist } from "zustand/middleware";
import { create } from "zustand";
import pronote from "pawnote";

import {
  AccountsStore,
  CurrentAccountStore,
  Account,
  AccountService,
  ExternalAccount,
  PrimaryAccount
} from "@/stores/account/types";
import { reload } from "@/services/reload-account";
import { useTimetableStore } from "../timetable";
import { useHomeworkStore } from "../homework";
import { useGradesStore } from "../grades";
import { useNewsStore } from "../news";
import { useAttendanceStore } from "../attendance";

/**
 * Store for the currently selected account.
 * Not persisted, as it's only used during the app's runtime.
 */
export const useCurrentAccount = create<CurrentAccountStore>()((set, get) => ({
  account: null,
  linkedAccounts: [],

  mutateProperty: (key, value) => {
    console.log(`[current:update]: mutate property ${key} in storage`);

    // Since "instance" is a runtime only key,
    // we mutate the property only in this memory store and not in the persisted one.
    if (key === "instance") {
      set((state) => {
        if (!state.account) return state;

        const account: Account = {
          ...state.account,
          [key]: value // `key` will always be "instance" but TypeScript complains otherwise.
        };

        return { account };
      });
    }
    else {
      const account = useAccounts.getState().update(
        get().account?.localID ?? "",
        key, value
      );

      set({ account: {
        ...account,
        // @ts-expect-error : types are conflicting between services.
        instance: get().account?.instance
      } });
    }

    console.log(`[current:update]: done mutating property ${key} in storage`);
  },

  switchTo: async (account) => {
    console.log("[switchTo]: reading", account.name);

    set({ account });
    useAccounts.setState({ lastOpenedAccountID: account.localID });

    // Account is currently not authenticated,
    if (typeof account.instance === "undefined") {
      console.log("[switchTo]: instance undefined, reloading...");
      // Automatically reconnect the main instance.
      const { instance, authentication } = await reload(account);
      get().mutateProperty("authentication", authentication);
      get().mutateProperty("instance", instance);
      console.log("[switchTo]: instance reload done !");
    }

    // Rehydrate every store that needs it.
    await Promise.all([
      [useTimetableStore, "timetable"] as const,
      [useHomeworkStore, "homework"] as const,
      [useGradesStore, "grades"] as const,
      [useNewsStore, "news"] as const,
      [useAttendanceStore, "attendance"] as const,
    ].map(([store, storageName]) => {
      store.persist.setOptions({
        name: `${account.localID}-${storageName}-storage`
      });

      console.info("[switchTo]: rehydrating", storageName);
      return store.persist.rehydrate();
    }));

    const accounts = useAccounts.getState().accounts;
    const linkedAccounts = account.linkedExternalLocalIDs.map((linkedID) => {
      return {...accounts.find((acc) => acc.localID === linkedID)};
    }).filter(Boolean) as ExternalAccount[] ?? [];

    console.info(`[switchTo]: found ${linkedAccounts.length} external accounts`);

    for (const linkedAccount of linkedAccounts) {
      const { instance, authentication } = await reload(linkedAccount);
      linkedAccount.instance = instance;
      linkedAccount.authentication = authentication;
      console.log("[switchTo]: reloaded external");
    }

    console.log("[switchTo]: reloaded all external accounts");

    set({ linkedAccounts });
    console.log("[switchTo]: done reading", account.name, "and rehydrating stores.");
  },

  linkExistingExternalAccount: (account) => {
    console.log("[linkExistingExternalAccount]: linking");

    set((state) => ({
      linkedAccounts: [...state.linkedAccounts, account]
    }));

    get().mutateProperty("linkedExternalLocalIDs", [
      ...get().account?.linkedExternalLocalIDs ?? [],
      account.localID
    ]);

    console.log("[linkExistingExternalAccount]: linked");
  },

  logout: () => {
    const account = get().account;
    console.log("[current:logout]: logging out", account?.name);

    // When using PRONOTE, we should make sure to stop the background interval.
    if (account && account.service === AccountService.Pronote && account.instance) {
      pronote.clearPresenceInterval(account.instance);
      console.log("[current:logout]: stopped pronote presence");
    }

    set({ account: null, linkedAccounts: [] });
    useAccounts.setState({ lastOpenedAccountID: null });
  }
}));

/**
 * Store for the stored accounts.
 * Persisted, as we want to keep the accounts between app restarts.
 */
export const useAccounts = create<AccountsStore>()(
  persist(
    (set, get) => ({
      // When opening the app for the first time, it's null.
      lastOpenedAccountID: null as (string | null),

      // We don't need to store the localID here, as we can get it from the account store.
      accounts: <Array<Account>>[],

      // When creating, we don't want the "instance" to be stored.
      create: ({ instance, ...account }) => {
        console.log(`[create]: storing ${account.localID} (${"name" in account ? account.name : "no name"})`);

        set((state) => ({
          accounts: [...state.accounts, account as Account]
        }));

        console.log("[create]: stored", account.localID);
      },

      remove: (localID) => {
        console.log("[remove]: removing", localID);

        set((state) => ({
          accounts: state.accounts.filter(
            (account) => account.localID !== localID
          )
        }));

        console.log("[remove]: removed", localID);
      },

      /**
       * Mutates a given property for a given account
       * and return the updated account.
       */
      update: (localID, key, value) => {
        // Find the account to update in the storage.
        const account = get().accounts.find((account) => account.localID === localID);
        if (!account) return null;

        // Return as is: we should never update the store for "instance" key,
        // it should remain a runtime only property.
        if (key === "instance") return account;

        let accountMutated: Account;

        // Mutate only modified properties.
        if ((key as keyof PrimaryAccount) === "personalization") {
          accountMutated = {
            ...account,
            personalization: {
              ...(<PrimaryAccount>account).personalization,
              ...(value as PrimaryAccount["personalization"])
            }
          } as PrimaryAccount;
        }
        else if ((key as keyof ExternalAccount) === "data") {
          accountMutated = {
            ...account,
            data: {
              ...(<ExternalAccount>account).data,
              ...(value as ExternalAccount["data"])
            }
          } as ExternalAccount;
        }
        // Mutate the property.
        else {
          accountMutated = {
            ...account,
            [key]: value
          };
        }

        // Save the update in the store and storage.
        set((state) => ({
          accounts: state.accounts.map((account) =>
            account.localID === localID
              ? accountMutated
              : account
          )
        }));

        // Return the updated account (to reuse the account directly)
        return accountMutated;
      },
    }),
    {
      name: "accounts-storage",
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);
