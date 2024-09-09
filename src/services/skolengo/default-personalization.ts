import type { Personalization, SkolengoAccount } from "@/stores/account/types";
import { defaultTabs } from "@/views/settings/SettingsTabs";

import colors from "@/utils/data/colors.json";
import { toSkolengoDate } from "./skolengo-types";

type Tab = typeof defaultTabs[number]["tab"];

const defaultSkolengoPersonalization = async (instance: SkolengoAccount["instance"]): Promise<Partial<Personalization>> => {
  const skoTabs = await getServiceConfig(instance);
  return {
    color: colors[0],
    magicEnabled: true,
    profilePictureB64: void 0,

    tabs: defaultTabs.filter(current => skoTabs.includes(current.tab)).map((tab, index) => ({
      name: tab.tab,
      enabled: index <= 4
    }))
  };
};

const getServiceConfig =(instance: SkolengoAccount["instance"])=> Promise.all([
  instance?.getUsersMailSettings().then(()=> "Messages").catch(()=> null),
  instance?.getAbsenceFiles().then(()=> "Attendance").catch(()=> null),
  instance?.getAgenda(void 0, toSkolengoDate(new Date()), toSkolengoDate(new Date(Date.now()+604800000))).then(()=> "Lessons").catch(()=> null),
  instance?.getHomeworkAssignments(void 0, toSkolengoDate(new Date()), toSkolengoDate(new Date(Date.now()+604800000))).then(()=> "Homeworks").catch(()=> null),
  instance?.getEvaluationSettings().then(()=> "Grades").catch(()=> null),
  instance?.getSchoolInfos().then(()=> "News").catch(()=> null)
]);

export default defaultSkolengoPersonalization;

export const checkIfSkoSupported = (account: SkolengoAccount, service: Tab): boolean =>
  account.personalization.tabs?.some(tab => tab.name === service && tab.enabled) || false;