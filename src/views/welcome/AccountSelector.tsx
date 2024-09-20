import { NativeItem, NativeList, NativeListHeader, NativeText } from "@/components/Global/NativeComponents";
import { useAccounts, useCurrentAccount } from "@/stores/account";
import { defaultProfilePicture } from "@/utils/ui/default-profile-picture";
import { useIsFocused, useTheme } from "@react-navigation/native";
import { PlusIcon } from "lucide-react-native";
import { useEffect, useState } from "react";
import {ActivityIndicator, Image, StatusBar, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";

import PapillonAvatar from "@/components/Global/PapillonAvatar";

import Reanimated, {
  FadeInDown,
  FadeInUp,
  FadeOutUp,
  LinearTransition,
  ZoomIn,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { animPapillon } from "@/utils/ui/animations";
import { Screen } from "@/router/helpers/types";
import { AccountService } from "@/stores/account/types";
import PapillonSpinner from "@/components/Global/PapillonSpinner";

const AccountSelector: Screen<"AccountSelector"> = ({ navigation }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const isFocused = useIsFocused();

  const currentAccount = useCurrentAccount((store) => store.account);
  const switchTo = useCurrentAccount((store) => store.switchTo);

  const accounts = useAccounts((store) => store.accounts);

  const [loading, setLoading] = useState(null);

  useEffect(() => {
    void async function () {
      if (!useAccounts.persist.hasHydrated()) return;

      // If there are no accounts, redirect the user to the first installation page.
      if (accounts.filter((account) => !account.isExternal).length === 0) {
        // Use the `reset` method to clear the navigation stack.
        navigation.reset({
          index: 0,
          routes: [{ name: "FirstInstallation" }],
        });
      }

      if (accounts.filter((account) => !account.isExternal).length === 1) {
        const selectedAccount = accounts.find((account) => !account.isExternal);
        if (selectedAccount && currentAccount?.localID !== selectedAccount.localID) {
          switchTo(selectedAccount);

          navigation.reset({
            index: 0,
            routes: [{ name: "AccountStack" }],
          });
        }
      }

      SplashScreen.hideAsync();
    }();
  }, [accounts]);

  if (!accounts) return null;

  return (
    <View
      style={{
        flex: 1,
        padding: 16,
        paddingTop: insets.top + 16,
        paddingBottom: insets.bottom + 16,
      }}
    >
      {isFocused && (
        <StatusBar
          barStyle={theme.dark ? "light-content" : "dark-content"}
          backgroundColor={"transparent"}
          translucent
        />
      )}

      <LinearGradient
        colors={["#29947a", theme.colors.background]}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: "35%",
          opacity: 0.2,
          zIndex: -1,
        }}
        pointerEvents="none"
      />

      <Reanimated.View
        entering={animPapillon(FadeInUp)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 16,
          gap: 16,
        }}
      >
        <Image
          source={require("@/../assets/images/icon_papillon.png")}
          style={{
            width: 26,
            aspectRatio: 1,
          }}
          tintColor={theme.colors.text}
        />

        <View>
          <NativeText variant="titleLarge">
            Ravis de vous revoir !
          </NativeText>
          <NativeText variant="subtitle">
            Sélectionnez un compte pour commencer
          </NativeText>
        </View>
      </Reanimated.View>

      <Reanimated.ScrollView>
        {accounts.filter((account) => !account.isExternal).length > 0 && (
          <Reanimated.View
            entering={animPapillon(FadeInDown)}
            layout={animPapillon(LinearTransition)}
          >
            <NativeListHeader label="Comptes connectés" />
            <NativeList>
              {accounts.map((account, index) => {
                return !account.isExternal && (
                  <NativeItem
                    key={index}
                    leading={
                      <PapillonAvatar
                        source={account.personalization.profilePictureB64 ? { uri: account.personalization.profilePictureB64 } : defaultProfilePicture(account.service)}
                        badgeOffset={4}
                        badge={
                          <Image
                            source={defaultProfilePicture(account.service, account.identityProvider && account.identityProvider.name)}
                            style={{
                              width: 22,
                              height: 22,
                              borderRadius: 12,
                              borderColor: theme.colors.card,
                              borderWidth: 2,
                            }}
                          />
                        }
                      />
                    }
                    trailing={
                      loading === account.localID && (
                        <PapillonSpinner
                          size={24}
                          strokeWidth={3.5}
                          color={theme.colors.primary}
                          animated
                          entering={animPapillon(ZoomIn)}
                        />
                      )
                    }
                    onPress={async () => {
                      if (currentAccount?.localID !== account.localID) {
                        setLoading(account.localID);
                        await switchTo(account);
                        setLoading(null);
                      }

                      navigation.reset({
                        index: 0,
                        routes: [{ name: "AccountStack" }],
                      });
                    }}
                  >
                    <Reanimated.View
                      style={{
                        flex: 1,
                        flexDirection: "column",
                        justifyContent: "center",
                        gap: 3,
                      }}
                      layout={animPapillon(LinearTransition)}
                    >
                      <NativeText animated variant="title" numberOfLines={1}>
                        {account.studentName.first} {account.studentName.last}
                      </NativeText>
                      <NativeText animated variant="subtitle" numberOfLines={1}>
                        {account.schoolName ?
                          account.schoolName :
                          account.identityProvider ?
                            account.identityProvider.name :
                            "Compte local"
                        }
                      </NativeText>
                    </Reanimated.View>
                  </NativeItem>
                );
              })}
            </NativeList>
          </Reanimated.View>
        )}

        <Reanimated.View
          entering={animPapillon(FadeInDown).delay(100)}
          layout={animPapillon(LinearTransition)}
        >
          <NativeListHeader label="Gestion des comptes" />
          <NativeList>
            <NativeItem
              icon={<PlusIcon />}
              subtitle="Ajouter un compte"
              onPress={() => navigation.navigate("ServiceSelector")}
            />
          </NativeList>
        </Reanimated.View>
      </Reanimated.ScrollView>
    </View>
  );
};

export default AccountSelector;
