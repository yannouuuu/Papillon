import { AccountService } from "@/stores/account/types";

export const defaultProfilePicture = (service: AccountService) => {
  switch (service) {
    case AccountService.Pronote:
      return require("../../../assets/images/service_pronote.png");
    case AccountService.EcoleDirecte:
      return require("../../../assets/images/service_ed.png");
    default:
      console.warn("No default profile picture for service", service);
  }
};