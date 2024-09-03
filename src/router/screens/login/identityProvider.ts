import createScreen from "@/router/helpers/create-screen";

import IdentityProviderSelector from "@/views/login/IdentityProvider/IdentityProviderSelector";
import UnivRennes1_Login from "@/views/login/IdentityProvider/providers/UnivRennes1";
import UnivLimoges_Login from "@/views/login/IdentityProvider/providers/UnivLimoges";

export default [
  createScreen("IdentityProviderSelector", IdentityProviderSelector, {
    headerTitle: "Fournisseur d'identité",
    headerBackVisible: true
  }),

  createScreen("UnivRennes1_Login", UnivRennes1_Login, {
    headerBackVisible: true,
    headerTitle: "Université de Rennes",
  }),

  createScreen("UnivLimoges_Login", UnivLimoges_Login, {
    headerBackVisible: true,
    headerTitle: "Université de Limoges",
  }),
] as const;