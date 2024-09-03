import { AccountService } from "@/stores/account/types";

export const defaultProfilePicture = (service: AccountService) => {
  switch (service) {
    case AccountService.Pronote:
      return require("../../../assets/images/service_pronote.png");
    case AccountService.EcoleDirecte:
      return require("../../../assets/images/service_ed.png");
    case AccountService.Skolengo:
      return require("../../../assets/images/service_skolengo.png");
    case AccountService.Local:
      return require("../../../assets/images/service_unknown.png");
    default:
      return require("../../../assets/images/service_unknown.png");
  }
};