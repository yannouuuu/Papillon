import createScreen from "@/router/helpers/create-screen";

import IdentityProviderSelector from "@/views/login/IdentityProvider/IdentityProviderSelector";
import UnivRennes1_Login from "@/views/login/IdentityProvider/providers/UnivRennes1";
import UnivLimoges_Login from "@/views/login/IdentityProvider/providers/UnivLimoges";
import UnivRennes2_Login from "@/views/login/IdentityProvider/providers/UnivRennes2";
import UnivSorbonneParisNord_login from "@/views/login/IdentityProvider/providers/UnivSorbonneParisNord";

export default [
  createScreen("IdentityProviderSelector", IdentityProviderSelector, {
    headerTitle: "Fournisseur d'identité",
    headerBackVisible: true
  }),

  createScreen("UnivRennes1_Login", UnivRennes1_Login, {
    headerBackVisible: true,
    headerTitle: "Université de Rennes",
  }),

  createScreen("UnivRennes2_Login", UnivRennes2_Login, {
    headerBackVisible: true,
    headerTitle: "Université de Rennes 2",
  }),

  createScreen("UnivLimoges_Login", UnivLimoges_Login, {
    headerBackVisible: true,
    headerTitle: "Université de Limoges",
  }),

  createScreen("UnivSorbonneParisNord_login", UnivSorbonneParisNord_login, {
    headerBackVisible: true,
    headerTitle: "Université Sorbonne Paris Nord",
  }),


] as const;