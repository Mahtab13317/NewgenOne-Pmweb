import React, { useState, useEffect } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import "./App.css";
import Radium from "radium";
import { useTranslation, withTranslation } from "react-i18next";
import DisplayMessage from "../components/DisplayMessage/DisplayMessage";
import ProcessView from "../components/ViewingArea/ProcessView";
import MainView from "../components/MainView/MainView";
import AppHeader from "../components/AppHeader/AppHeader";
import { store, useGlobalState } from "state-pool";
import axios from "axios";
import {
  APP_HEADER_HEIGHT,
  BASE_URL,
  ENDPOINT_CHECK_ARTIFACTS_RIGHTS,
  SERVER_URL,
} from "../Constants/appConstants";
import CircularProgress from "@material-ui/core/CircularProgress";
import {
  setToastDataFunc,
  ToastDataValue,
} from "../redux-store/slices/ToastDataHandlerSlice";
import { useDispatch, useSelector } from "react-redux";
import Toast from "../UI/ErrorToast";
import { removeUserSession } from "../utility/CommonFunctionCall/CommonFunctionCall";
import SessionMF from "../SessionMF";
import { sessionStatus } from "../redux-store/actions/Trigger";
import secureLocalStorage from "react-secure-storage";
import {
  setGlobalInis,
  setGlobalSettings,
} from "../redux-store/actions/GlobalSettings/globalsettingsactions";
import { useMediaQuery } from "@material-ui/core";
import i18n from "../i18n";
import { setWindowInnerHeight } from "../redux-store/actions/processView/actions";

function initializeStore() {
  store.setState("arrProcessesData", [], { persist: false });
  store.setState("loadedProcessData", null, { persist: false });
  store.setState("variableDefinition", []);
  store.setState("openProcessesArr", [], { persist: false });
  store.setState("activityPropertyData", null, { persist: false });
  store.setState("inMemoryDB", null, { persist: false });
  store.setState("originalProcessData", null, { persist: false });
  store.setState("allFormsList", [], { persist: false });
  store.setState("allFormAssociationData", []);
  store.setState("calendarList", []);
  store.setState("selectedTemplateData", {});
}

initializeStore();

const App = (props) => {
  let { t } = useTranslation();
  //code added for bug 136417 and 137437 on 10-10-23

  //code commented as asked by KD sir ,title bars will be in english only
  //document.title = t("ProcessDesigner");

  const inMemoryDB = store.getState("inMemoryDB");
  const [localinMemoryDB, setlocalinMemoryDB] = useGlobalState(inMemoryDB);
  const [isLoading, setisLoading] = useState(true);

  let mainContainer = React.createRef();

  const [state, setstate] = useState({
    //sets state
    displayMessage: {
      display: false,
      message: "",
    },
  });

  const launchpadKey = JSON.parse(secureLocalStorage.getItem("launchpadKey"));
  const token = launchpadKey?.token;
  const toastDataValue = useSelector(ToastDataValue);
  const dispatch = useDispatch();
  const smallScreen = useMediaQuery("(max-width: 699px)");
  const windowInnerHeight = useSelector(
    (state) => state.setWindowInnerHeight.windowInnerHeight
  );

  const includeTheme = (cabinet_name, resolution, locale, auth_token) => {
    var themeURL =
      "/oap-rest/app/theme/" + cabinet_name + `/${resolution}` + `/${locale}`;
    if (auth_token && auth_token.trim().length > 0) {
      themeURL += `/${auth_token}`;
    }
    // if(resolution){
    //   themeURL += `/${resolution}`
    // }
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = themeURL;
    document.head.appendChild(link);
    setisLoading(false);
  };
  useEffect(() => {
    const updateWindowDimensions = () => {
      dispatch(setWindowInnerHeight(window.innerHeight));
    };
    window.addEventListener("resize", updateWindowDimensions);
    return () => window.removeEventListener("resize", updateWindowDimensions);
  }, []);
  console.log("Kratika", windowInnerHeight);

  useEffect(() => {
    window.loadIntegrator();

    const ApiMethod = async () => {
      const res = await axios.get(SERVER_URL + "/fetchSavedData/PMWEB");
      try {
        if (res?.data && res.data !== "") {
          setlocalinMemoryDB(res.data);
          // code added for theme implementation
          includeTheme(
            secureLocalStorage.getItem("cabinet"),
            "1024_768",
            "en_US",
            token
          );
          const calenderType = localStorage.getItem("calenderType");
          dispatch(setGlobalInis({ locale_type: calenderType }));
          let dateTimeFormat = secureLocalStorage.getItem("dateFormat");
          dispatch(setGlobalSettings({ date_format: dateTimeFormat }));
        }
      } catch (error) {
        console.log(error);
      }
    };
    ApiMethod();
    /* if (secureLocalStorage.getItem("locale")) {
      i18n.changeLanguage(secureLocalStorage.getItem("locale"));
    }*/
  }, []);
  console.log("locale", secureLocalStorage.getItem("locale"));

  const loginHandler = () => {
    window.location.href = window.location.origin + `/automationstudio`;
    dispatch(sessionStatus(false));
  };
  const sessionlogoutHandler = () => {
    /* const authKey = JSON.parse(
      secureLocalStorage.getItem("launchpadKey")
    )?.token;

   if (authKey) {
      axios
        .get(`${window.location.origin}/launchpad/user/logout`, {
          headers: {
            token: authKey,
          },
        })

        .then((res) => {
          if (res?.data === "Success") {
            //window.location.href = window.location.origin + `/automationstudio`;

            // const timeout = setTimeout(() => {

            removeUserSession();

            // removeTheme();

            // }, 200);

            // clearTimeout(timeout);
          }
        })

        .catch((err) => {
          console.log("Session Logout Api Fail", err);
        });
    }*/

    if (secureLocalStorage.getItem("logoutUrl")) {
      const url = secureLocalStorage.getItem("logoutUrl");
      secureLocalStorage.removeItem("logoutUrl");
      window.location.href = `${url}`;
    }
    removeUserSession();
  };

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = token;
    }
  }, [token]);

  if (token) {
    axios.defaults.headers.common["Authorization"] = token;
  }

  axios.interceptors.response.use(
    function (response) {
      console.log("###", "Response", response);
      // dispatch(sessionStatus(false));
      // Do something with response data
      return response;
    },
    function (error) {
      console.log("###", "Interceptor", error);
      if (
        error.request.responseType === 'blob' &&
        error.response.data instanceof Blob &&
        error.response.data.type &&
        error.response.data.type.toLowerCase().indexOf('json') != -1
      )
      {
        
      }
      if (error?.response?.status === 404) {
        dispatch(
          setToastDataFunc({
            message: error?.response?.data?.error,
            severity: "error",
            open: true,
          })
        );
        //117449
      } else if (
        (+error?.response?.status === 400 ||
          +error?.response?.status === 403) &&
        error?.response?.config?.method === "post" &&
        (error?.response?.config?.url?.includes(
          ENDPOINT_CHECK_ARTIFACTS_RIGHTS
        ) ||
          error?.response?.config?.url?.includes(BASE_URL))
      ) {
        return error.response;
      } else if (+error?.response?.status === 500) {
        dispatch(
          setToastDataFunc({
            message: error?.response?.statusText,
            severity: "error",
            open: true,
          })
        );
      } else if (+error?.response?.status === 401) {
        dispatch(sessionStatus(true));
      } else if (+error?.response?.status === 400) {
        console.log(
          "###",
          "Interceptor11",
         error?.response?.data,
          error?.response?.data?.error?.message,
          error?.response?.data?.error
        );
        dispatch(
          //Modified  on 25/08/2023, bug_id:134364
          /*  setToastDataFunc({
            message:
              error?.response?.data?.errorMsg ||
              error?.response?.data?.error?.message ||
              error?.response?.data?.error,
            severity: "error",
            open: true,
          }) */
          setToastDataFunc({
            message:
              error?.response?.data?.errorMsg ||
              error?.response?.data?.error?.errors
                ? error?.response?.data?.error?.errors?.importFile
                : error?.response?.data?.error?.message ||
                  error?.response?.data?.error,
            severity: "error",
            open: true,
          })
        );
      } else {
        dispatch(
          setToastDataFunc({
            message:
              error?.response?.data?.error?.message ||
              error?.response?.data?.error,
            severity: "error",
            open: true,
          })
        );
      }
    }
  );

  const setDisplayMessage = (message, toShow) => {
    if (
      toShow === false ||
      message === null ||
      message === undefined ||
      message === ""
    ) {
      setstate((prev) => {
        return {
          ...prev,
          displayMessage: {
            display: false,
            message: "",
          },
        };
      });
    } else {
      setstate((prev) => {
        return {
          ...prev,
          displayMessage: {
            display: true,
            message: message,
          },
        };
      });
    }
  };

  const direction = `${t("HTML_DIR")}`;

  // changeLang = (event) => {
  //   this.props.i18n.changeLanguage(event.target.value);
  // }

  const translate = (langKey, defaultWord) => {
    return t(langKey, defaultWord);
  };

  const changeTokenInInterceptor = (token) => {
    axios.defaults.headers.common["Authorization"] = token;
  };

  //Modified on 26/05/2023, bug_id:127570

  window.history.pushState(null, null, window.location.href);
  window.onpushstate = function () {
    window.history.go(1);
  };
  return (
    <React.StrictMode>
      <SessionMF
        sessionLogoutHandler={() => sessionlogoutHandler()} //logout  no redirect
        loginHandler={() => loginHandler()} //redirect
        tokenKeyName="launchpadKey"
        updateToken={changeTokenInInterceptor}
      />
      <React.Fragment className="App">
        {isLoading ? (
          <div
            style={{
              // width: "100vw",
              // height: "100vh",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              overflow: "scroll",
            }}
          >
            <CircularProgress />
          </div>
        ) : (
          <BrowserRouter basename="/processDesigner">
            <div
              className="pmweb_main"
              style={{
                height: smallScreen ? `calc(${windowInnerHeight}px` : null,
                overflowY: smallScreen ? "scroll" : null,
              }}
            >
              <AppHeader />

              {toastDataValue?.open ? (
                <Toast
                  open={toastDataValue.open}
                  closeToast={() => dispatch(setToastDataFunc({ open: false }))}
                  message={toastDataValue.message}
                  severity={toastDataValue.severity}
                />
              ) : null}
              <DisplayMessage
                displayMessage={state.displayMessage}
                setDisplayMessage={(message, toShow) =>
                  setDisplayMessage(message, toShow)
                }
              />

              <div
                className="pmwidth100"
                style={{
                  direction: direction,
                  /* code edited on 6 July 2023 for issue - save and discard button hide 
                  issue in case of tablet(landscape mode)*/
                  height: `calc(${windowInnerHeight}px - ${APP_HEADER_HEIGHT})`,
                  // top: `calc(${APP_HEADER_HEIGHT})`
                }}
              >
                <Switch>
                  <Route
                    exact
                    path="/"
                    render={(props) => (
                      <MainView {...props} mainContainer={mainContainer} />
                    )}
                  />
                  <Route
                    path="/process"
                    render={(props) => (
                      <ProcessView
                        {...props}
                        mainContainer={mainContainer}
                        setDisplayMessage={setDisplayMessage}
                      />
                    )}
                  />
                </Switch>
              </div>
            </div>
          </BrowserRouter>
        )}
      </React.Fragment>
    </React.StrictMode>
  );
};

export default withTranslation()(Radium(App));
