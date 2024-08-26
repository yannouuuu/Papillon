import type { Chat } from "@/services/shared/Chat";
import type { Grade } from "@/services/shared/Grade";
import type { AccountService } from "@/stores/account/types";
import type { CurrentPosition } from "@/utils/native/location";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type pronote from "pawnote";
import type React from "react";

export type RouteParameters = {
  // welcome.index
  AccountSelector?: { shouldCreateAccount: boolean };
  FirstInstallation: undefined;
  ColorSelector?: { settings: boolean };
  DevMenu: undefined;
  AccountCreated: undefined;

  // login.index
  ServiceSelector: undefined;

  // login.pronote
  PronoteAuthenticationSelector: undefined;
  PronoteGeolocation: undefined;
  PronoteManualLocation: undefined;
  PronoteInstanceSelector: CurrentPosition;
  PronoteCredentials: { instanceURL: string, information: pronote.Instance };
  PronoteManualURL?: { url?: string; method?: string };
  PronoteQRCode: undefined;
  PronoteWebview: { instanceURL: string };
  PronoteV6Import: {
    data: {
      username: string
      deviceUUID: string
      instanceUrl: string
      nextTimeToken: string
    }
  };

  // login.ecoledirecte
  EcoleDirecteCredentials: undefined;

  // account.index
  Home: undefined
  HomeScreen?: { onboard: boolean };
  NoteReaction: undefined;
  Lessons?: { outsideNav?: boolean };
  Homeworks?: { outsideNav?: boolean };

  News?: { outsideNav?: boolean };
  NewsItem: undefined;

  Grades?: { outsideNav?: boolean };
  GradeSubject: undefined;
  GradeDocument: {
    grade: Grade,
    allGrades?: Grade[]
  };

  Attendance: undefined;

  // settings.externalAccount
  SelectMethod: undefined;

  // settings.index
  SettingStack: any;
  Settings: undefined;
  SettingsNotifications: undefined;
  SettingsTrophies: undefined;
  SettingsProfile: undefined;
  SettingsTabs: undefined;
  SettingsAbout: undefined;
  SettingsIcons: undefined;
  SettingsSubjects: undefined;
  SettingsExternalServices: undefined;
  SettingsMagic: undefined;
  SettingsFlags: undefined;
  SettingsAddons: undefined;
  SettingsDevLogs: undefined;
  SettingsDonorsList: undefined;

  Menu?: undefined;
  RestaurantQrCode: undefined;
  RestaurantHistory: undefined;

  Messages: undefined;
  ChatCreate: undefined;
  Chat: { handle: Chat };

  AccountStack: { onboard: boolean };
  ExternalAccountSelectMethod: { service: AccountService | "Other" }
  ExternalAccountSelector: undefined;
  ExternalTurboselfLogin: undefined
  ExternalArdLogin: undefined
  QrcodeAnswer: undefined
  QrcodeScanner: undefined
  PriceDetectionOnboarding: undefined
  PriceBeforeScan: undefined

  AddonSettingsPage: undefined;
  AddonLogs: undefined;
  AddonPage: undefined;
};

export type RouterScreenProps<ScreenName extends keyof RouteParameters> =
  NativeStackScreenProps<RouteParameters, ScreenName>;
export type Screen<ScreenName extends keyof RouteParameters> = React.FC<
  RouterScreenProps<ScreenName>
>;
