import createScreen from "@/router/helpers/create-screen";

import IdentityProviderSelector from "@/views/login/IdentityProvider/IdentityProviderSelector";
import UnivRennes1_Login from "@/views/login/IdentityProvider/providers/UnivRennes1";

export default [
  createScreen("IdentityProviderSelector", IdentityProviderSelector, {
    headerTitle: "Fournisseur d'identité",
    headerBackVisible: true
  }),

  createScreen("UnivRennes1_Login", UnivRennes1_Login, {
    headerBackVisible: true,
    headerTitle: "Université de Rennes",
  }),
] as const;