import { LOGOUT_LOADING } from "./actionTypes";
import axios from "axios";
import {
  SERVER_URL_LAUNCHPAD,
  ENDPOINT_LOGOUT,
} from "./../../../Constants/appConstants";
import {
  removeUserSession,
  removeTheme,
} from "../../../utility/CommonFunctionCall/CommonFunctionCall";
import secureLocalStorage from "react-secure-storage";
import { sessionStatus } from "../../actions/Trigger";
import DOMPurify from "dompurify";

export const logoutIsLoading = (bool) => {
  return {
    type: LOGOUT_LOADING,
    payload: bool,
  };
};
export const userLogout = ({ history }) => {
  return (dispatch) => {
    const authKey = JSON.parse(
      secureLocalStorage.getItem("launchpadKey")
    )?.token;

    dispatch(logoutIsLoading(true));
    sessionStorage.setItem("logoutDoneByUserFromPMWEB", true);

    if (!!authKey) {
      axios
        .get(`${SERVER_URL_LAUNCHPAD}${ENDPOINT_LOGOUT}`, {
          headers: {
            token: authKey,
          },
        })
        .then((res) => {
          if (res?.data === "Success") {
            removeUserSession();
            const redirectTo = `${window.location.origin}/automationstudio`;
            window.location.href = DOMPurify.sanitize(redirectTo);
            const timeout = setTimeout(() => {
              removeTheme();
            }, 200);
            clearTimeout(timeout);

            dispatch(logoutIsLoading(false));
            dispatch(sessionStatus(false));
          }
        })
        .catch((err) => {
          console.log(err);
          removeUserSession();

          dispatch(logoutIsLoading(false));
          dispatch(sessionStatus(false));
        });
      if (secureLocalStorage.getItem("logoutUrl")) {
        const url = secureLocalStorage.getItem("logoutUrl");
        secureLocalStorage.removeItem("logoutUrl");
        window.location.href = `${url}`;
        // window.location.href = `${secureLocalStorage.getItem("logoutUrl")}`;
      }
    } else {
      if (secureLocalStorage.getItem("logoutUrl")) {
        const url = secureLocalStorage.getItem("logoutUrl");
        secureLocalStorage.removeItem("logoutUrl");
        window.location.href = `${url}`;
        // window.location.href = `${secureLocalStorage.getItem("logoutUrl")}`;
      } else {
        const redirectTo = `${window.location.origin}/automationstudio`;
        window.location.href = DOMPurify.sanitize(redirectTo);
        const timeout = setTimeout(() => {
          removeUserSession();
          removeTheme();
        }, 200);
        clearTimeout(timeout);

        dispatch(logoutIsLoading(false));
      }
    }
  };
};
