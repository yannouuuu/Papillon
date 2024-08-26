import { Skolengo, OID_CLIENT_ID, OID_CLIENT_SECRET, BASE_URL } from "scolengo-api";
import { SkolengoTokenSet, authTokenToSkolengoTokenSet } from "./skolengo-types";
import { School } from "scolengo-api/types/models/School";
import { DiscoveryDocument } from "expo-auth-session";
import { SkolengoAccount, AccountService } from "@/stores/account/types";
import axios from "axios";
import b64 from "base-64";
import { Alert } from "react-native";
import { decode as htmlDecode } from "html-entities";

const getSkolengoAxiosInstance = ()=>{
  const axioss = axios.create({
    baseURL: BASE_URL
  });

  axioss.interceptors.response.use(r=>r, (error)=>{
    if(__DEV__) {
      console.warn(
        "[SKOLENGO] ERR - ",
        JSON.stringify(error, null, 2),
        JSON.stringify(error.response?.data, null, 2)
      );
    }
    error.response?.data?.errors?.forEach((e: any) => {
      Alert.alert(
        "Skolengo - " + (e["title"].toString() || "Erreur"),
        htmlDecode(e["detail"]?.toString().replace(/<(\/)?([a-z0-9]+)>/g, "") || "Erreur inconnue")+"\n\nSi cette erreur persiste, veuillez contacter les équipes de Papillon.",
      );
    });
    return Promise.reject(error);
  });
  return axioss;
};

export const refreshSkolengoToken = async (refreshToken: string, discovery: DiscoveryDocument): Promise<SkolengoTokenSet> => {
  const formData = new FormData();

  formData.append("grant_type", "refresh_token");
  formData.append("refresh_token", refreshToken);

  if(!discovery.tokenEndpoint) throw new Error("[SKOLENGO] ERR - No token endpoint in discovery document");

  return fetch(discovery.tokenEndpoint, {
    method: "POST",
    headers: {
      Authorization: "Basic "+b64.encode(OID_CLIENT_ID+":"+OID_CLIENT_SECRET),
    },
    body: formData
  }).then((response) => response.json()).then(d=>authTokenToSkolengoTokenSet(d));
};

export const getSkolengoAccount = (school: School, tokenSet: SkolengoTokenSet, discovery: DiscoveryDocument)=>{
  const skolengoAccount = new Skolengo(
    null,
    school,
    tokenSet,
    {
      refreshToken: async (tokenSet): Promise<SkolengoTokenSet> =>
      {
        if(!tokenSet.refresh_token) throw new Error("[SKOLENGO] ERR - No refresh token");
        return refreshSkolengoToken(tokenSet.refresh_token, discovery);
      },
      onTokenRefresh: async (tokenSet) => {
        // ! SAVE TO LOCAL STORAGE
        // TODO : save to local storage
      },
      httpClient: getSkolengoAxiosInstance()
    }
  );
  const jwtDecoded = skolengoAccount.getTokenClaims();
  const account: SkolengoAccount = {
    service: AccountService.Skolengo,
    localID: jwtDecoded.sub,
    isExternal: false,
    name: jwtDecoded.given_name + " " + jwtDecoded.family_name,
    instance: skolengoAccount,
    authentication: {
      school: school,
      tokenSet: skolengoAccount.tokenSet,
      discovery,
    },
    linkedExternalLocalIDs: [],
    studentName: {
      first: jwtDecoded.given_name || "Inconnu",
      last: jwtDecoded.family_name || "Inconnu",
    },
    personalization: {}
  };
  return account;
};