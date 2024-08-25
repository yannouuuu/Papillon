import createScreen from "@/router/helpers/create-screen";

import pronote from "./pronote";
import ecoledirecte from "./ecoledirecte";
import ServiceSelector from "@/views/login/ServiceSelector";

export default [
  createScreen("ServiceSelector", ServiceSelector, {
    headerTitle: "",
    headerTransparent: true,
    headerBackVisible: true
  }),

  ...pronote,
  ...ecoledirecte,
] as const;
