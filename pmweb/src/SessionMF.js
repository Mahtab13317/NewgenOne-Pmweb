import React, { useEffect, useState, useRef } from "react";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import { makeStyles } from "@material-ui/core/styles";
import { Button, CircularProgress } from "@material-ui/core";
import sessionExpired from "./assets/session/session_expired.svg";
import axios from "axios";
import { dispatch, useSelector } from "react-redux";
import secureLocalStorage from "react-secure-storage";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles({
  popupContainer: {
    background: "#00000066",
    position: "absolute",
    zIndex: "10000000",
    top: "0px",
    left: "0px",
    right: "0px",
    bottom: "0px",
  },
  innerContainer: {
    background: "white",
    margin: "15% auto",
    width: "350px",
  },
  grid: {
    width: "100%",
    height: "100%",
    display: "grid",
    minWidth: "290px",
    gridTemplateRows: "50px auto 50px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    padding: "1rem 1vw",
    alignItems: "center",
    borderBottom: "1px solid #c4c4c4",
    direction: (props) => props.direction,
  },
  headerTitle: {
    fontSize: "var(--title_text_font_size)",
    fontWeight: "600",
  },
  spinnerDiv: { height: "120px", alignItems: "center" },
  body: {
    padding: "1rem 1vw",
    display: "flex",
    flexDirection: "column",
    textAlign: "center",
  },
  bodyTitle: {
    fontWeight: "600",
    fontSize: "var(--subtitle_text_font_size)",
    marginTop: "8px",
    textAlign: "center",
    direction: (props) => props.direction,
  },
  bodyText: {
    fontSize: "var(--base_text_font_size)",
    opacity: "0.8",
    marginTop: "8px",
    textAlign: "center",
    direction: (props) => props.direction,
  },
  bodyTime: { color: "var(--brand_color2)" },
  actionContainer: {
    display: "flex",
    justifyContent: "end",
    paddingTop: "4px",
    background: "#f8f8f8",
    direction: (props) => props.direction,
    paddingInlineEnd: "1rem",
  },
  // code added on 10 April 2023 for BugId 126553 - Button Color change
  button: {
    backgroundColor: "var(--button_color) !important",
    border: "0",
    borderRadius: "2px",
    fontFamily: "var(--font_family)",
    fontSize: "var(--base_text_font_size)",
    textTransform: "none",
    whiteSpace: "nowrap",
    color: "white",
  },
});

const Post = (url, data, header) => {
  if (
    localStorage.getItem("lpwebintegrated") &&
    localStorage.getItem("lpwebintegrated") == "N"
  ) {
    axios.defaults.headers.common["Authorization"] =
      secureLocalStorage.getItem("Authorization");
  } else if (secureLocalStorage.getItem("launchpadKey")) {
    const obj = JSON.parse(secureLocalStorage.getItem("launchpadKey"));
    axios.defaults.headers.common["Authorization"] = obj.token;
  } else {
    axios.defaults.headers.common["Authorization"] =
      secureLocalStorage.getItem("Authorization");
  }
  return axios
    .post(url, data, header)
    .then((res) => res)
    .catch((err) => err);
};

const SessionMF = (props) => {
  const {
    called_from = "",
    sessionLogoutHandler,
    loginHandler,
    tokenKeyName = "Authorization",
    urlContext = "/oap-rest",
    extendSessionHandler,
  } = props;
  const subscription = useRef(null);
  const intervalId = useRef(null);
  const [timeRemaining, setTimeRemaining] = useState(-1000);
  const [showPopup, setShowPopup] = useState(false);
  const [error, setError] = useState({});
  const reconnect = useRef(false);

  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const classes = useStyles({ direction });

  const sessionStatus = useSelector(
    (state) => state.triggerReducer.sessionStatus
  );
  const SUBSCRIBE_URL = "/user/push/message";
  const OAP_URL = `${urlContext}/wscon`;
  const TIME_SHOW_POPUP = 60000;
  const popupDisabledURLS = ["/bam", "/reports", "/dashboard"];
  const IBPS5_BAM_ENABLED = useRef(
    localStorage &&
      localStorage.getItem("lpwebintegrated") &&
      localStorage.getItem("lpwebintegrated") == "N" &&
      popupDisabledURLS.includes(called_from)
  );
  const isInitialised = useRef(false);
  const logoutDoneByUserFromPMWEB = sessionStorage.getItem(
    "logoutDoneByUserFromPMWEB"
  );
  const initWebSocket = () => {
    isInitialised.current = true;
    try {
      var socket = new SockJS(OAP_URL);
    } catch (e) {
      console.log("OAP Rest URL Not Found", e);
      return;
    }
    window.stompClient = Stomp.over(socket);
    window.stompClient.debug = () => {};
    const reqHeader = {
      Authorization:
        tokenKeyName === "launchpadKey"
          ? JSON.parse(secureLocalStorage.getItem("launchpadKey"))?.token
          : secureLocalStorage && secureLocalStorage.getItem(tokenKeyName),
    };
    window.stompClient.connect(reqHeader, onConnectWebSocket, onErrorWebSocket);
  };

  const reconnectWindows = () => {
    reconnect.current = false;

    // all workitems
    const windowRef = window?.parentWindow ?? window;
    if (windowRef.workitemWindData && windowRef.workitemWindData.length > 0) {
      windowRef.workitemWindData.forEach((el) => {
        if (window?.WDeskData?.PId != el.data?.pid) {
          el.windRef.stompClient = window.stompClient;
          el.windRef.externalConnect();
        }
      });
    }

    // parentWindow
    if (window?.parentWindow) {
      window.parentWindow.stompClient = window.stompClient;
      window.parentWindow.externalConnect();
    }
  };

  const ExtendSession = async (data) => {
    try {
      const res = await Post(`${urlContext}/app/extendsession`, data, {
        headers: {
          "Content-Type": "application/json",
          withCredentials: true,
        },
      });
      return res && res.data ? res.data : null;
    } catch (err) {
      console.log(err);
      return null;
    }
  };

  const extendSession = async () => {
    try {
      const res = await ExtendSession();
      if (res != null && res.status.maincode == 0) {
        if (extendSessionHandler)
          extendSessionHandler(res?.data?.Authorization);
        else {
          if (tokenKeyName !== "launchpadKey")
            secureLocalStorage.setItem(tokenKeyName, res?.data?.Authorization);
          if (
            res?.data?.Authorization &&
            res?.data?.Authorization !==
              JSON.parse(secureLocalStorage.getItem("launchpadKey"))?.token
          ) {
            if (secureLocalStorage.getItem("launchpadKey")) {
              const lpWebToken = {
                token: res?.data?.Authorization,
              };
              secureLocalStorage.setItem(
                "launchpadKey",
                JSON.stringify(lpWebToken)
              );

              props.updateToken(res?.data?.Authorization);
            }
          }
        }
        setShowPopup(false);
        if (intervalId.current) clearInterval(intervalId.current);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const onConnectWebSocket = () => {
    if (reconnect.current) setShowPopup(false);

    try {
      subscription.current = window.stompClient.subscribe(
        SUBSCRIBE_URL,
        function (pushResponse) {
          setError({});
          if (reconnect.current) reconnectWindows();

          if (intervalId.current) clearInterval(intervalId.current);

          const response = JSON.parse(pushResponse.body);
          const latestTime = response.RemainingSessionTime;

          if (response?.maincode && response.maincode == 11) {
            setTimeRemaining(0);
            setShowPopup(true);
            logoutSession();
            return;
          }

          // console.log("token1", response.Authorization);
          if (
            response?.Authorization &&
            response?.Authorization !==
              JSON.parse(secureLocalStorage.getItem("launchpadKey"))?.token
          ) {
            /* console.log("token1", response.Authorization);
            console.log(
              "token0",
              JSON.parse(secureLocalStorage.getItem("launchpadKey"))?.token
            );*/
            // update token in case
            secureLocalStorage.setItem(tokenKeyName, response.Authorization);
            if (secureLocalStorage.getItem("launchpadKey")) {
              const lpWebToken = {
                token: response.Authorization,
              };
              secureLocalStorage.setItem(
                "launchpadKey",
                JSON.stringify(lpWebToken)
              );

              props.updateToken(response.Authorization);
            }
          }
          if (latestTime <= 0) logoutSession();
          else if (latestTime < TIME_SHOW_POPUP) {
            if (IBPS5_BAM_ENABLED.current) {
              // check the tab focus and call the extendsession
              // don't show popup in case of IBPS5 /bam called.
              if (document.visibilityState === "visible") {
                extendSession();
              }
            } else if (!IBPS5_BAM_ENABLED.current) {
              setShowPopup(true);
              setTimeRemaining(latestTime);
              intervalId.current = setInterval(() => {
                setTimeRemaining((prev) => prev - 1000);
              }, 1000);
            }
          } else setShowPopup(false);
        }
      );
    } catch (e) {
      console.log("check_info_socket ", e);
    }
  };

  const externalConnect = () => {
    isInitialised.current = false;
    onConnectWebSocket();
  };

  window.externalConnect = externalConnect;

  useEffect(() => {
    if (sessionStatus) logoutSession();
  }, [sessionStatus]);
  useEffect(() => {
    if (timeRemaining <= 0 && timeRemaining > -1000) logoutSession();
  }, [timeRemaining]);

  const logoutSession = () => {
    //   code added for bug id 138336 and 136674 on 27-09-23

    if (!logoutDoneByUserFromPMWEB) {
      setTimeRemaining(0);
      setShowPopup(true);

      if (isInitialised.current) sessionLogoutHandler(called_from);
    }
    closeWebSocket();
  };

  const onErrorWebSocket = (res) => {
    setTimeRemaining(0);
    setShowPopup(true);
    setError({ code: 1, label: "retry", msg: "" });
  };

  const closeWebSocket = () => {
    if (intervalId.current) clearInterval(intervalId.current);
    try {
      subscription.current.unsubscribe(SUBSCRIBE_URL);
    } catch (e) {
      console.log(e);
    }
    if (isInitialised.current) {
      try {
        window.stompClient.disconnect();
        window.stompClient = undefined;
      } catch (e) {}
    } else {
      window.removeEventListener("unload", closeWebSocket);
    }
  };

  window.closeWebSocket = closeWebSocket;

  const calcSecondsRemaining = (time) => {
    let temp = Math.round(Math.round(time / 1000) % 60);
    return temp < 0 ? "00" : temp < 10 ? "0" + temp : temp;
  };

  const reconnectConnection = () => {
    reconnect.current = true;
    initWebSocket();
    setError({ type: 2, label: "reconnect_loader", msg: "Reconnecting.." });
  };

  useEffect(() => {
    if (window.stompClient) {
      window.addEventListener("unload", closeWebSocket);
      onConnectWebSocket();
    } else initWebSocket();

    return closeWebSocket;
  }, []);

  useEffect(() => {
    if (!logoutDoneByUserFromPMWEB) {
      setShowPopup(false);
    }
  }, [logoutDoneByUserFromPMWEB]);
  const labelsMap = {
    0: {
      head: t("sessionExpiredWarning"),
      body_title: t("sessionWillBeExpired"),
      body: "",
      button: t("stayLoggedIn"),
      action: extendSession,
    },
    1: {
      head: t("sessionExpired"),
      body_title: t("loggedOutOfNewgenONE"),
      body: "",
      button: t("loginAgain"),
      action: loginHandler.bind(this, called_from, IBPS5_BAM_ENABLED.current),
    },
    2: {
      head: t("networkError"),
      body_title: t("networkConnectionProblem"),
      body: "",
      button: t("reconnect"),
      action: reconnectConnection,
    },
  };

  const labelIndex =
    timeRemaining == 0 ? (!!Object.keys(error).length ? 2 : 1) : 0;

  return (
    <>
      {showPopup && !logoutDoneByUserFromPMWEB && (
        <div className={classes.popupContainer}>
          <div className={classes.innerContainer}>
            <div className={classes.grid}>
              <div className={classes.header}>
                <div className={classes.headerTitle}>
                  {labelsMap[labelIndex].head}
                </div>
              </div>

              {error?.type == 2 ? (
                <div className={classes.CircularProgressDiv}>
                  <CircularProgress msg={error.msg} />
                </div>
              ) : (
                <div className={classes.body}>
                  <img
                    src={sessionExpired}
                    width="110px"
                    height="110px"
                    alt="expired"
                    style={{ margin: "0px auto" }}
                  />
                  <div onClick={onErrorWebSocket} className={classes.bodyTitle}>
                    {labelsMap[labelIndex].body_title}
                  </div>
                  {timeRemaining != 0 && (
                    <div className={classes.bodyText}>
                      {t("YouWillBeLoggedOutIn")} :{" "}
                      <span className={classes.bodyTime}>
                        00:{calcSecondsRemaining(timeRemaining)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className={classes.actionContainer}>
                <Button
                  // code added on 10 April 2023 for BugId 126553 - Button Color change
                  className={classes.button}
                  style={{
                    color: "white",
                    background: "var(--button_color)",
                  }}
                  variant="contained"
                  disabled={+error?.type === 2}
                  onClick={labelsMap[labelIndex].action}
                >
                  {labelsMap[labelIndex].button}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default React.memo(SessionMF);
