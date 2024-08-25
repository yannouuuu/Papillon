import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Image, StyleSheet, FlatList } from "react-native";
import { Screen } from "@/router/helpers/types";
import { updateNewsInCache } from "@/services/news";
import { useNewsStore } from "@/stores/news";
import { useCurrentAccount } from "@/stores/account";
import { NativeList, NativeListHeader } from "@/components/Global/NativeComponents";
import { RefreshControl } from "react-native-gesture-handler";
import { LinearGradient } from "expo-linear-gradient";
import BetaIndicator from "@/components/News/Beta";
import NewsListItem from "./Atoms/Item";
import Reanimated, { FadeInUp, FadeOut, LinearTransition } from "react-native-reanimated";
import { useTheme } from "@react-navigation/native";
import { animPapillon } from "@/utils/ui/animations";
import { categorizeMessages } from "@/utils/magic/categorizeMessages";
import TabAnimatedTitle from "@/components/Global/TabAnimatedTitle";
import { protectScreenComponent } from "@/router/helpers/protected-screen";

const NewsScreen: Screen<"News"> = ({ route, navigation }) => {
  const theme = useTheme();
  const account = useCurrentAccount((store) => store.account!);
  const informations = useNewsStore((store) => store.informations);

  const [isLoading, setIsLoading] = useState(false);
  const [importantMessages, setImportantMessages] = useState<any[]>([]);
  const [sortedMessages, setSortedMessages] = useState<any[]>([]);

  useLayoutEffect(() => {
    navigation.setOptions({
      ...TabAnimatedTitle({ theme, route, navigation }),
    });
  }, [navigation, route.params, theme.colors.text]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    await updateNewsInCache(account);
  }, [account.instance]);

  useEffect(() => {
    fetchData();
  }, [account.instance]);


  useEffect(() => {
    setTimeout(() => {
      if (informations) {
        if (account.personalization?.magicEnabled === true) {
          const { importantMessages, normalMessages } = categorizeMessages(informations);
          const nsmsg = [...normalMessages].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );

          setImportantMessages(importantMessages);
          setSortedMessages(nsmsg);
          setIsLoading(false);
        } else {
          const nsmsg = [...informations].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );

          setImportantMessages([]);
          setSortedMessages(nsmsg);
          setIsLoading(false);
        }
      }
    }, 1);
  }, [informations]);

  const renderItem = useCallback(({ item, index }) => (
    <NewsListItem
      key={index}
      index={index}
      message={item}
      navigation={navigation}
      parentMessages={sortedMessages}
    />
  ), [navigation, sortedMessages]);

  return (
    <Reanimated.ScrollView
      contentContainerStyle={styles.scrollViewContent}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={fetchData} />
      }
    >
      {importantMessages.length > 0 && (
        <Reanimated.View
          entering={animPapillon(FadeInUp)}
          exiting={animPapillon(FadeOut)}
          layout={animPapillon(LinearTransition)}
        >
          <NativeListHeader
            label="Peut-être Important"
            animated
            leading={
              <Image
                source={require("@/../assets/images/magic/icon_magic.png")}
                style={styles.magicIcon}
                resizeMode="contain"
              />
            }
            trailing={<BetaIndicator />}
          />

          <NativeList animated>
            <LinearGradient
              colors={!theme.dark ? [theme.colors.card, "#BFF6EF"] : [theme.colors.card, "#2C2C2C"]}
              start={[0, 0]}
              end={[2, 0]}
            >
              <FlatList
                data={importantMessages}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
              />
            </LinearGradient>
          </NativeList>
        </Reanimated.View>
      )}

      {sortedMessages.length > 0 && (
        <Reanimated.View
          entering={animPapillon(FadeInUp)}
          exiting={animPapillon(FadeOut)}
          layout={animPapillon(LinearTransition)}
        >
          <NativeList animated inline>
            <FlatList
              data={sortedMessages}
              renderItem={renderItem}
              keyExtractor={(item, index) => index.toString()}
            />
          </NativeList>
        </Reanimated.View>
      )}
    </Reanimated.ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    padding: 16,
    paddingTop: 0,
  },
  magicIcon: {
    width: 26,
    height: 26,
    marginRight: 4
  },
});

export default protectScreenComponent(NewsScreen);