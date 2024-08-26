import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteParameters } from "@/router/helpers/types";
import { Check, KeyRound, LockKeyhole } from "lucide-react-native";
import pronote from "pawnote";
import {info} from "@/utils/logger/logger";

/**
 * Va exécuter une requête pour déterminer
 * la vue d'authentification à afficher.
 *
 * Permet de savoir si l'on a besoin d'une connexion
 * par ENT ou d'une connexion par identifiants simples.
 */
const determinateAuthenticationView = async <ScreenName extends keyof RouteParameters>(
  pronoteURL: string,
  navigation: NativeStackNavigationProp<RouteParameters, ScreenName>,
  showAlert: any // TODO: type
): Promise<void> => {
  let instance: pronote.Instance | undefined;
  pronoteURL = pronote.cleanURL(pronoteURL);

  try {
    instance = await pronote.instance(pronoteURL);
    console.info("PRONOTE->determinateAuthenticationView(): OK");
  }
  catch (error) {
    try {
      console.warn(`PRONOTE->determinateAuthenticationView(): Une erreur est survenue avec l'URL '${pronoteURL}' ! Tentative avec une URL alternative (TOUTATICE)...`);
      pronoteURL = pronoteURL.replace(".index-education.net", ".pronote.toutatice.fr");
      instance = await pronote.instance(pronoteURL);
      console.info("PRONOTE->determinateAuthenticationView(): OK");
    }
    catch {
      showAlert({
        title: "Erreur",
        message: "Impossible de récupérer les informations de l'instance PRONOTE.",
      });

      return;
    }
  }

  const goToLoginNoENT = () => navigation.navigate("PronoteCredentials", {
    instanceURL: pronoteURL,
    information: instance
  });

  const goToLoginENT = () => navigation.navigate("PronoteWebview", {
    instanceURL: pronoteURL
  });

  info(JSON.stringify(instance, null, 2), (new Error()).stack!);
  if(pronoteURL.includes("demo.index-education.net")) {
    showAlert({
      title: "Instance non supporté",
      message: "Désolé, les instances de démonstration ne sont pas supportées, elles peuvent être instables ou ne pas fonctionner correctement.",
      actions: [
        {
          title: "Continuer quand même",
          icon: <Check />,
          primary: true,
          backgroundColor: "#BE0B00",
        },
      ]
    });
  } 
  if (instance.casToken && instance.casURL) {
    showAlert({
      title: `L'instance ${instance.name} nécessite une connexion ENT.`,
      message: "Vous serez redirigé vers le portail de connexion de votre ENT.",
      actions: [
        {
          title: "Identifiants",
          onPress: () => goToLoginNoENT(),
          icon: <KeyRound />,
        },
        {
          title: "Utiliser l'ENT",
          onPress: () => goToLoginENT(),
          primary: true,
          icon: <LockKeyhole />,
        }
      ],
    });
  }
  else goToLoginNoENT();
};

export default determinateAuthenticationView;
