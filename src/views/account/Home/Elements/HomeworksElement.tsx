import { NativeList, NativeListHeader } from "@/components/Global/NativeComponents";
import { useCurrentAccount } from "@/stores/account";
import { AccountService } from "@/stores/account/types";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useHomeworkStore } from "@/stores/homework";
import { toggleHomeworkState, updateHomeworkForWeekInCache } from "@/services/homework";
import HomeworkItem from "../../Homeworks/Atoms/Item";
import { Homework } from "@/services/shared/Homework";
import { debounce } from "lodash";
import { PapillonNavigation } from "@/router/refs";
import RedirectButton from "@/components/Home/RedirectButton";
import { dateToEpochWeekNumber } from "@/utils/epochWeekNumber";

const HomeworksElement = ({ navigation }) => {
  const account = useCurrentAccount(store => store.account!);
  const homeworks = useHomeworkStore(store => store.homeworks);

  const actualDay = useMemo(()=>new Date(), []);

  const updateHomeworks = useCallback(async () => {
    await updateHomeworkForWeekInCache(account, actualDay);
  }, [account, actualDay]);

  const debouncedUpdateHomeworks = useMemo(() => debounce(updateHomeworks, 500), [updateHomeworks]);

  useEffect(() => {
    debouncedUpdateHomeworks();
  }, [account.instance, actualDay]);

  const handleDonePress = useCallback(
    async (homework: Homework) => {
      await toggleHomeworkState(account, homework);
      await updateHomeworks();
    },
    [account, updateHomeworks]
  );

  if (!homeworks[dateToEpochWeekNumber(actualDay)] || homeworks[dateToEpochWeekNumber(actualDay)]?.filter(hw => new Date(hw.due).getDate() === actualDay.getDate()).length === 0) {
    return null;
  }

  return (
    <>
      <NativeListHeader animated label="Travail à faire"
        trailing={(
          <RedirectButton navigation={PapillonNavigation.current} redirect="Homeworks" />
        )}
      />
      <NativeList>
        {homeworks[dateToEpochWeekNumber(actualDay)]?.filter(hw => new Date(hw.due).getDate() === actualDay.getDate()).map((hw, index) => (
          <HomeworkItem
            navigation={navigation}
            homework={hw}
            key={index}
            index={index}
            total={homeworks[dateToEpochWeekNumber(actualDay)].length}
            onDonePressHandler={() => {
              handleDonePress(hw);
            }}
          />
        ))}
      </NativeList>
    </>
  );
};

export default HomeworksElement;
