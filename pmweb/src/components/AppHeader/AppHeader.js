// #BugID - 122061
// #BugDescription - User profile detail changed.
// #BugID - 120859
// #BugDescription - draft and enable tab switching isssue has been fixed.
// #BugID - 120987
// #BugDescription - Handled the functionality when more than 3 process will open after 3rd process rest tab will be shown in a dropdown.

import React, { useEffect, useState } from "react";
import "./AppHeader.css";
//import newgenLogo from "../../assets/Header/NewgenONE_Logo.svg";
//import marvinLogo from "../../assets/genAI_Icons/NewgenONEMarvin_MainLogo.svg";
import { useTranslation } from "react-i18next";
import { store, useGlobalState } from "state-pool";
import { useHistory, useLocation } from "react-router-dom";
import CloseIcon from "@material-ui/icons/Close";
import { connect, useDispatch, useSelector } from "react-redux";
import * as actionCreators from "../../redux-store/actions/processView/actions.js";
import processIcon from "../../../src/assets/HomePage/HS_Process.svg";
import QuestionMarkIcon from "../../../src/assets/HomePage/HS_Question Mark.svg";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";
import {
  APP_HEADER_HEIGHT,
  CREATE_PROCESS_FLAG_FROM_PROCESS,
  CREATE_PROCESS_FLAG_FROM_PROCESSES,
  CREATE_PROCESS_FLAG_FROM_TEMPLATES,
  ENDPOINT_OPENTEMPLATE,
  MAX_TABS_IN_HEADER,
  PROCESSTYPE_ENABLED,
  PROCESSTYPE_ENABLED_CHECKED,
  PROCESSTYPE_LOCAL,
  PROCESSTYPE_LOCAL_CHECKED,
  PROCESSTYPE_REGISTERED,
  PROCESSTYPE_REGISTERED_CHECKED,
  RTL_DIRECTION,
  SERVER_URL,
  SPACE,
  TEMPLATE_VARIANT_TYPE,
  ENDPOINT_USER_DATA,
} from "../../Constants/appConstants";
import axios from "axios";
import { LogoutIcon } from "../../utility/AllImages/AllImages";
import moment from "moment";
import { userLogout } from "../../redux-store/reducers/userDetail/actions";
import {
  CircularProgress,
  ClickAwayListener,
  Tooltip,
} from "@material-ui/core";
import DialogBox from "./DialogBox";
import Modal from "../../UI/Modal/Modal";
import {
  ActivityCheckoutValue,
  setCheckoutActEdited,
} from "../../redux-store/slices/ActivityCheckoutSlice";
import CheckInActivityValidation from "../Properties/CheckInActivityValidation";
import { OpenProcessLoaderSliceValue } from "../../redux-store/slices/OpenProcessLoaderSlice";
import { checkIfSwimlaneCheckedOut } from "../../utility/SwimlaneCheckedStatus/SwimlaneCheckedStatus";
import CheckinSwimlaneValidation from "../Properties/CheckinSwimlaneValidation";
import { setValueInitialRender } from "../../redux-store/slices/InitialRenderSlice";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import secureLocalStorage from "react-secure-storage";
import { convertToArabicDateTime } from "../../UI/DatePicker/DateInternalization";
//import { getAIRights } from "../../utility/UserRightsFunctions/index.js";
import CommonLogoHeader from "./CommonLogoHeader.js";
// Function to open the web help for process designer in a new tab when user clicks on the help icon.
export const openWebHelpInPmWeb = (urlHelp) => {
  window.open(`${window.ConfigsLocal.help_URL}${urlHelp}`, "_blank");
};

export const handleKeyHelp = (e, urlHelp) => {
  if (e.keyCode === 13) {
    openWebHelpInPmWeb(urlHelp);
    e.stopPropagation();
  }
};

const AppHeader = (props) => {
  let { t } = useTranslation();
  const history = useHistory();
  const location = useLocation();
  moment.locale("en");
  const dispatch = useDispatch();
  const direction = `${t("HTML_DIR")}`;
  const arrProcessesData = store.getState("arrProcessesData"); //array of processdata stored
  const loadedProcessData = store.getState("loadedProcessData"); //current processdata clicked
  const openProcessesArr = store.getState("openProcessesArr"); //array of keys of processdata stored
  const [localArrProcessesData, setLocalArrProcessesData] =
    useGlobalState(arrProcessesData);
  const [localLoadedProcessData, setlocalLoadedProcessData] =
    useGlobalState(loadedProcessData);
  const [localOpenProcessesArr, setLocalOpenProcessesArr] =
    useGlobalState(openProcessesArr);
  const [isProcessDesignerTabActive, setisProcessDesignerTabActive] =
    useState(true);
  const [showSwimlaneAlert, setshowSwimlaneAlert] = useState(false);
  const [tabInfoAtTop, settabInfoAtTop] = useState([]);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [isLogout, setIsLogout] = useState(false);

  const cabinet = secureLocalStorage.getItem("cabinet");
  const isLogoutLoading = useSelector(
    (state) => state.userDetails.isLogoutLoading
  );
  const lastLoginTime = sessionStorage.getItem("lastLoginTime");
  const logoutHandler = () => {
    setIsLogout(false);
    dispatch(userLogout({ history }));
  };
  const CheckedAct = useSelector(ActivityCheckoutValue);
  const openProcessLoader = useSelector(OpenProcessLoaderSliceValue);
  const [showCheckedInAlert, setShowCheckedInAlert] = useState(false);
  const [actionFlag, setactionFlag] = useState("0"); //0 pmweb home, 1 close process, 2 switch tabs
  const [processSelected, setprocessSelected] = useState({});
  const [showMore, setShowMore] = useState(false);
  const [topTab, setTopTab] = useState([]);
  const [verticalTab, setVerticalTab] = useState([]);
  const [urlHelp, setUrlHelp] = useState("");
  const [userData, setUserData] = useState({});

  useEffect(() => {
    getUserProfile();
  }, []);

  useEffect(() => {
    if (location.pathname === "/process") {
      setUrlHelp("?rhmapno=1407");
    } else if (
      props.CreateProcessFlag === CREATE_PROCESS_FLAG_FROM_PROCESS ||
      props.CreateProcessFlag === CREATE_PROCESS_FLAG_FROM_PROCESSES ||
      props.CreateProcessFlag === CREATE_PROCESS_FLAG_FROM_TEMPLATES
    ) {
      setUrlHelp("?rhmapno=1406");
    } else if (props.selectedTabAtNavPanel === "navigationPanel.home") {
      setUrlHelp("?rhmapno=1401");
    } else if (props.selectedTabAtNavPanel === "navigationPanel.processes") {
      setUrlHelp("?rhmapno=1402");
    } else if (props.selectedTabAtNavPanel === "navigationPanel.templates") {
      setUrlHelp("?rhmapno=1403");
    } else if (props.selectedTabAtNavPanel === "navigationPanel.settings") {
      setUrlHelp("?rhmapno=1404");
    } else if (props.selectedTabAtNavPanel === "navigationPanel.auditLog") {
      setUrlHelp("?rhmapno=1405");
    }
  }, [props.selectedTabAtNavPanel, props.CreateProcessFlag, location.pathname]);

  /*code updated on 08 October 2022 for BugId 116325*/
  const logoutAlert = () => {
    setIsLogout(true);
  };

  const closeAlert = () => {
    setIsLogout(false);
  };

  const userDisplay = (val) => {
    let name = val?.split(" ") || "";
    let initials;

    if (name.length === 1) {
      initials = name[0]?.charAt(0);
    } else {
      initials = name[0]?.charAt(0) + "" + name[name.length - 1]?.charAt(0);
    }

    return initials;
  };
  // code edited on 10 Oct 2022 for BugId 112343 and BugId 112684
  useEffect(() => {
    const setTabInfoFunc = (temp) => {
      if (tabInfoAtTop.length > 0 && temp.ProcessDefId !== "") {
        let temp2 = JSON.parse(JSON.stringify(tabInfoAtTop));
        if (!temp2.some((el) => el.ProcessDefId === temp.ProcessDefId)) {
          temp2.map((item) => (item.isActive = false));
          temp2.splice(0, 0, temp);
          settabInfoAtTop(temp2);
        } else {
          temp2.map(
            (item) =>
              (item.isActive = +item.ProcessDefId === +temp.ProcessDefId)
          );
          let indexOfActiveTab = temp2.map((el) => el.isActive).indexOf(true);
          if (indexOfActiveTab > MAX_TABS_IN_HEADER - 1) {
            let data = temp2[indexOfActiveTab];
            temp2.splice(indexOfActiveTab, 1);
            temp2.splice(0, 0, data);
            settabInfoAtTop(temp2);
            let tempArr = JSON.parse(JSON.stringify(localArrProcessesData));
            const activeIdx = tempArr
              ?.map((e) => e.ProcessDefId)
              .indexOf(data.ProcessDefId);
            let activeElem = tempArr.slice(activeIdx, activeIdx + 1);
            tempArr.splice(activeIdx, 1);
            tempArr.splice(0, 0, activeElem[0]);
            setLocalArrProcessesData(tempArr);
          } else {
            settabInfoAtTop(temp2);
          }
        }
      } else settabInfoAtTop((prev) => [...prev, temp]);
    };

    if (props.openTemplateFlag) {
      if (props.templateId !== "") {
        let temp = {
          ProcessDefId: props.templateId.toString(),
          ProcessName: props.templateName,
          ProcessType: "",
          ProcessVariantType: "", //data will be filled after setOtherData method is called
          ProjectName: "",
          VersionNo: "",
          isActive: true,
        };
        setTabInfoFunc(temp);
      }
    } else {
      if (props.openProcessID !== "") {
        let temp = {
          ProcessDefId: props.openProcessID.toString(),
          ProcessName: props.openProcessName,
          ProcessType: props.openProcessType,
          ProcessVariantType: "", //data will be filled after setOtherData method is called
          ProjectName: "",
          VersionNo: props?.openProcessVersion?.toString(),
          isActive: true,
        };
        setTabInfoFunc(temp);
      }
    }
  }, [
    props.openProcessID,
    props.openProcessName,
    props.openProcessType,
    props.openProcessVersion,
    props.templateId,
    props.templateName,
  ]);

  useEffect(() => {
    if (tabInfoAtTop.length > 0) {
      setisProcessDesignerTabActive(false);
    }
    if (tabInfoAtTop.length === 0) {
      redirectToHome();
    }
  }, [tabInfoAtTop?.length]);

  useEffect(() => {
    let tabInfo = [...tabInfoAtTop];
    /*   tabInfo = tabInfo.filter(
      (tag, index, array) =>
        array.findIndex(
          (t) =>
            t.ProcessDefId == tag.ProcessDefId && t.VersionNo == tag.VersionNo
        ) == index
    ); */
    let tempTab = [];
    let verTab = [];
    if (tabInfoAtTop.length > MAX_TABS_IN_HEADER) {
      tempTab = tabInfo.slice(0, MAX_TABS_IN_HEADER);
      verTab = tabInfo.slice(MAX_TABS_IN_HEADER, tabInfo.length);
    } else {
      tempTab = [...tabInfo];
    }

    //code for restricting duplicate tab in array
    const uniqueTab = tempTab.filter((obj, index) => {
      return (
        index === tempTab.findIndex((o) => obj.ProcessDefId === o.ProcessDefId)
      );
    });
    //till here
    setTopTab(uniqueTab);
    //setTopTab(tempTab);
    setVerticalTab(verTab);

    let activeTabIndex = tabInfo.map((el) => el.isActive).indexOf(true);
    if (activeTabIndex > -1 && isProcessDesignerTabActive) {
      setisProcessDesignerTabActive(false);
    }
  }, [tabInfoAtTop]);

  // code update on 26 Dec 2022 for  BugId 112955
  useEffect(() => {
    if (tabInfoAtTop?.length > 0 || localArrProcessesData?.length > 0) {
      let tempTabList = [...localArrProcessesData];
      let activeTab = tabInfoAtTop?.filter((el) => el.isActive);
      if (activeTab[0]) {
        localArrProcessesData?.forEach((el, idx) => {
          if (el.isProcessActive !== undefined) {
            tempTabList[idx].isActive = el.isProcessActive;
            delete tempTabList[idx].isProcessActive;
          } else if (
            `${el.ProcessDefId}#${el.ProcessType}` ===
            `${activeTab[0].ProcessDefId}#${activeTab[0].ProcessType}`
          ) {
            tempTabList[idx].isActive = true;
          } else {
            tempTabList[idx].isActive = false;
          }
        });
      }
      settabInfoAtTop(tempTabList);
    }
  }, [localArrProcessesData]);

  const openProcessHandler = (data) => {
    ActiveClickedTab(data);
    setisProcessDesignerTabActive(false);
    setlocalLoadedProcessData(null);
    // code edited on 10 Oct 2022 for BugId 112343 and BugId 112684
    if (data.ProcessVariantType === TEMPLATE_VARIANT_TYPE) {
      props.openProcessClick("", "", "", "", "");
      props.openTemplate(data.ProcessDefId, data.ProcessName, true);
      history.push("/process");
      axios
        .get(
          SERVER_URL +
            ENDPOINT_OPENTEMPLATE +
            "/" +
            data.ProcessDefId +
            "/" +
            data.ProcessName
        )
        .then((res) => {
          if (res.data.Status === 0) {
            setlocalLoadedProcessData(res.data.OpenProcess);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      let processType =
        data.ProcessType === PROCESSTYPE_LOCAL ||
        data.ProcessType === PROCESSTYPE_LOCAL_CHECKED
          ? "L"
          : data.ProcessType === PROCESSTYPE_REGISTERED ||
            data.ProcessType === PROCESSTYPE_ENABLED ||
            data.ProcessType === PROCESSTYPE_REGISTERED_CHECKED ||
            data.ProcessType === PROCESSTYPE_ENABLED_CHECKED
          ? "R"
          : data.ProcessType;
      props.openProcessClick(
        data.ProcessDefId,
        data.ProjectName,
        processType,
        data.VersionNo,
        data.ProcessName
      );
      props.openTemplate("", "", false);
      history.push("/process");
    }
  };

  // Function that runs when the localLoadedProcessData value changes.
  useEffect(() => {
    const setOtherDataToTab = (processData) => {
      if (localLoadedProcessData !== null) {
        let temp = JSON.parse(JSON.stringify(tabInfoAtTop));
        temp.forEach((item) => {
          if (item.ProcessDefId == processData.ProcessDefId) {
            item.ProcessVariantType = processData.ProcessVariantType;
            item.ProjectName = processData.ProjectName;
            item.ProcessType = processData.ProcessType;
            item.VersionNo = processData.VersionNo;
          }
        });
        settabInfoAtTop(temp);
      } else return;
    };
    if (localLoadedProcessData) {
      tabInfoAtTop?.forEach((element) => {
        if (
          element?.ProjectName === localLoadedProcessData?.ProjectName &&
          element?.isActive
        ) {
          element.ProcessDefId = localLoadedProcessData?.ProcessDefId;
          element.ProcessType = localLoadedProcessData?.ProcessType;
          element.VersionNo = localLoadedProcessData?.VersionNo;
        }
      });
      setOtherDataToTab(localLoadedProcessData);
    }
  }, [localLoadedProcessData]);

  //click handler for process data tabs
  const clickHandler = (data) => {
    dispatch(setValueInitialRender(true));
    if (
      !!checkIfSwimlaneCheckedOut(localLoadedProcessData)?.length &&
      localLoadedProcessData.SwimlaneCheckinChanges
    ) {
      setactionFlag("2");
      setprocessSelected(data);
      setshowSwimlaneAlert(true);
    } else if (!!CheckedAct.actCheckedId) {
      setactionFlag("2");
      setprocessSelected(data);
      setShowCheckedInAlert(true);
    } else openProcessHandler(data);
  };

  //goes back to process designer homepage
  const backToProcessDesignerHome = () => {
    if (
      !!checkIfSwimlaneCheckedOut(localLoadedProcessData)?.length &&
      localLoadedProcessData.SwimlaneCheckinChanges
    ) {
      setactionFlag("0");
      setshowSwimlaneAlert(true);
    } else if (!!CheckedAct.actCheckedId) {
      setactionFlag("0");
      setShowCheckedInAlert(true);
    } else redirectToHome();
  };

  const redirectToHome = () => {
    let temp = JSON.parse(JSON.stringify(topTab));
    temp.forEach((item) => {
      item.isActive = false;
    });
    setTopTab(temp);
    dispatch(setValueInitialRender(true));
    /* code added on 3 July 2023 for issue - open a process, close the process and again open 
    the same process, process is not highlighted as active. */
    props.openProcessClick("", "", "", "", "");
    props.openTemplate("", "", false);
    setlocalLoadedProcessData(null);
    setisProcessDesignerTabActive(true);
    history.push("/");
  };

  const closeProcessHandler = (pData) => {
    /* code edited on 3 July 2023 for BugId 130701 - Oracle|| activity toolbar is getting 
    removed after closing one of the process */
    let tempArr = JSON.parse(JSON.stringify(localArrProcessesData));
    let lengthOfArray = localArrProcessesData?.length;
    let isLastElement = false;
    let currentInd,
      processToBeOpened = null,
      isActiveElemIndex;

    tempArr?.forEach((element, ind) => {
      if (element?.isActive) {
        isActiveElemIndex = ind;
      }
    });

    tempArr?.forEach((element, idx) => {
      if (element.ProcessDefId === pData.ProcessDefId) {
        currentInd = idx;
        if (idx === lengthOfArray - 1) {
          isLastElement = true;
        }
        tempArr.splice(idx, 1);
      }
      if (element.isProcessActive !== undefined) {
        delete tempArr[idx].isProcessActive;
      }
    });

    let temp = JSON.parse(JSON.stringify(localOpenProcessesArr));
    temp.splice(
      localOpenProcessesArr.indexOf(
        `${pData.ProcessDefId}#${pData.ProcessType}`
      ),
      1
    );

    let indexNo;
    let temp2 = JSON.parse(JSON.stringify(tabInfoAtTop));

    temp2.forEach((item, index) => {
      if (item.ProcessDefId === pData.ProcessDefId) {
        indexNo = index;
      }
    });
    temp2.splice(indexNo, 1);

    /* code edited on 3 July 2023 for BugId 130701 - Oracle|| activity toolbar is getting 
    removed after closing one of the process */
    if (lengthOfArray === 1 && isLastElement) {
      redirectToHome();
    } else if (lengthOfArray > 1) {
      if (currentInd === isActiveElemIndex) {
        if (currentInd > 0) {
          currentInd = currentInd - 1;
        }
        tempArr?.forEach((element, index) => {
          if (index === currentInd) {
            element.isActive = true;
            processToBeOpened = element;
          } else {
            element.isActive = false;
          }
        });
        temp2?.forEach((element, index) => {
          if (index === currentInd) {
            element.isActive = true;
          } else {
            element.isActive = false;
          }
        });
      }
    }

    setLocalOpenProcessesArr(temp);
    setLocalArrProcessesData(tempArr);
    settabInfoAtTop(temp2);
    /* code edited on 3 July 2023 for BugId 130701 - Oracle|| activity toolbar is getting 
    removed after closing one of the process */
    if (processToBeOpened !== null) {
      props.openProcessClick("", "", "", "", "");
      // code added on 3 Nov 2022 for BugId 117379
      props.openTemplate("", "", false);
      openProcessHandler(processToBeOpened);
    }
  };

  //delete processdata tab, called when process has to be closed
  const deleteProcessData = (pData) => {
    dispatch(setValueInitialRender(true));
    if (
      !!checkIfSwimlaneCheckedOut(localLoadedProcessData)?.length &&
      localLoadedProcessData.SwimlaneCheckinChanges
    ) {
      setactionFlag("1");
      setprocessSelected(pData);
      setshowSwimlaneAlert(true);
    } else if (!!CheckedAct.actCheckedId) {
      setactionFlag("1");
      setprocessSelected(pData);
      setShowCheckedInAlert(true);
    } else {
      closeProcessHandler(pData);
    }
    setShowMore(false);
  };

  const handleCheckInActPropRevert = (pData) => {
    dispatch(
      setCheckoutActEdited({
        isCheckoutActEdited: false,
        checkedActProp: {},
        actCheckedId: null,
        actCheckedName: null,
      })
    );

    setShowCheckedInAlert(false);
    if (actionFlag === "1") closeProcessHandler(pData);
    else if (actionFlag === "2") openProcessHandler(pData);
    else redirectToHome();
  };
  const handleCheckInSwimlaneRevert = (pData) => {
    setshowSwimlaneAlert(false);
    if (actionFlag === "1") closeProcessHandler(pData);
    else if (actionFlag === "2") openProcessHandler(pData);
    else redirectToHome();
  };

  const ActiveClickedTab = (data) => {
    let temp = JSON.parse(JSON.stringify(tabInfoAtTop));
    temp.forEach((item) => {
      if (item.ProcessDefId === data.ProcessDefId) {
        item.isActive = true;
      } else item.isActive = false;
    });

    settabInfoAtTop(temp);
  };

  const ActiveClickedTabMultiple = (data) => {
    let temp = JSON.parse(JSON.stringify(topTab));
    temp.forEach((item) => {
      if (item.ProcessDefId === data.ProcessDefId) {
        item.isActive = true;
      } else item.isActive = false;
    });
    setTopTab(temp);
  };

  const openNewTab = () => {
    window.open(`${window.location.origin}/automationstudio/home`, "_blank");
  };

  const makeActive = (data) => {
    let tempArr = JSON.parse(JSON.stringify(localArrProcessesData));
    const indexOfActiveTab = tempArr
      ?.map((e) => e.ProcessDefId)
      .indexOf(data.ProcessDefId);
    let activeElem = tempArr.slice(indexOfActiveTab, indexOfActiveTab + 1);
    tempArr.splice(indexOfActiveTab, 1);
    tempArr.splice(0, 0, activeElem[0]);

    let tempList = [...tabInfoAtTop];
    tempList = tempList?.map((el) => {
      el = { ...el, isActive: +el.ProcessDefId === +data.ProcessDefId };
      return el;
    });
    settabInfoAtTop(tempList);

    setLocalArrProcessesData(tempArr);
    clickHandler(data);
  };

  const handleKeyHome = (e) => {
    if (e.keyCode === 13) {
      backToProcessDesignerHome();
      e.stopPropagation();
    }
  };

  const handleKeyNewTab = (e) => {
    if (e.keyCode === 13) {
      openNewTab();
      e.stopPropagation();
    }
  };

  const handleKeyLogoutAlert = (e) => {
    if (e.keyCode === 13) {
      logoutAlert();
      e.stopPropagation();
    }
  };

  const handleKeyClose = (e) => {
    if (e.keyCode === 13) {
      closeAlert();
      e.stopPropagation();
    }
  };

  const handleKeyLogout = (e) => {
    if (e.keyCode === 13) {
      logoutHandler();
      e.stopPropagation();
    }
  };
  const getUserProfile = async () => {
    const userIndex = secureLocalStorage.getItem("user_id");
    try {
      const res = await axios.get(
        `${ENDPOINT_USER_DATA}/${userIndex}?requiredProfileImage=true`
      );
      if (res.status === 200) {
        setUserData(res?.data);
      }
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <div
      className="AppHeader"
      style={{
        direction: `${t("HTML_DIR")}`,
        height: APP_HEADER_HEIGHT,
        pointerEvents:
          openProcessLoader.loader || props.showDrawer ? "none" : "auto",
        // code added on 22 Dec 2022 for BugId 120859 and edited on 5 April 2023 for BugId 112610
      }}
    >
      <div className="headerLogoName relative">
        {/*<img
          src={getAIRights() ? marvinLogo : newgenLogo}
          alt={t("img")}
          className="newgenLogo"
          id="pmweb_newgenOneLogo"
    />*/}
        <div style={{ marginLeft: "10px" }}>
          <CommonLogoHeader />
        </div>
        <div className={direction === RTL_DIRECTION ? "vr_rtl" : "vr"}></div>
        <div
          onClick={backToProcessDesignerHome}
          id="pmweb_home_icon"
          className={
            isProcessDesignerTabActive && localArrProcessesData.length > 0
              ? "title activeTab"
              : "title"
          }
          tabIndex={0}
          onKeyDown={(e) => handleKeyHome(e)}
        >
          <p
            className={direction === RTL_DIRECTION ? "heading_rtl" : "heading"}
          >
            Process Designer
          </p>
        </div>

        {topTab?.length > 0 &&
          topTab?.map((data) => {
            return (
              <>
                <div
                  className={
                    data.isActive && !isProcessDesignerTabActive
                      ? "titleTabs activeTab"
                      : "titleTabs"
                  }
                >
                  <span style={{ marginTop: "0.8rem" }}>
                    <img
                      src={processIcon}
                      style={{
                        height: "1.5rem",
                        width: "1.5rem",
                      }}
                      alt="Process Icon"
                    />
                  </span>
                  <span
                    onClick={() => {
                      if (!data.isActive) {
                        clickHandler(data);
                        ActiveClickedTabMultiple(data);
                      }
                    }}
                    id="pmweb_AppHeader_titleTabs"
                    className="titleTextTabs"
                    title={`${data.ProcessName} (v${data.VersionNo})`} //Modified on 27/10/2023, bug_id:139434
                    //title={data.ProcessName}
                  >
                    {data.ProcessName}
                    {SPACE}
                    {
                      //code updated on 30 September 2022 for BugId 116201
                    }
                    {/* {localArrProcessesData?.length > 0 &&
                    localArrProcessesData[0]?.ProcessDefId !== data.ProcessDefId
                      ? `(v${data.VersionNo})`
                      : null} */}
                    {`(v${data.VersionNo})`}{" "}
                    {
                      //Modified on 27/10/2023, bug_id:139434
                    }
                  </span>
                  <span style={{ marginTop: "0.75rem" }}>
                    <CloseIcon
                      onClick={() => deleteProcessData(data)}
                      id="pmweb_AppHeader_titleTabs_closeIcon"
                      style={{
                        opacity: "0.2",
                        width: "1.5rem",
                        height: "1.5rem",
                      }}
                    />
                  </span>
                </div>
              </>
            );
          })}
        {tabInfoAtTop?.length > MAX_TABS_IN_HEADER ? (
          <ClickAwayListener onClickAway={() => setShowMore(false)}>
            <div className="titleTabs" style={{ background: "#efefef" }}>
              <button
                className="threeDotsButtonHeader"
                type="button"
                onClick={() => {
                  setShowMore(true);
                }}
                id="pmweb_AppHeader_showMore"
              >
                <MoreVertIcon
                  style={{
                    color: "#606060",
                    height: "16px",
                    width: "16px",
                  }}
                />
              </button>
            </div>
          </ClickAwayListener>
        ) : null}

        {showMore ? (
          <div className="moreBtnDropdownHeader">
            <ul>
              {verticalTab?.map((data, i) => {
                return (
                  <li
                    className="moreOptions"
                    onClick={() => {
                      makeActive(data, "");
                    }}
                    id="pmweb_AppHeader_ActiveTabs"
                  >
                    {data.ProcessName}
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </div>
      <div className="flex alignCenter" style={{ marginInlineStart: "auto" }}>
        {/* <SearchBox
        searchIconAlign="right"
        placeholder={t("search")}
        style={{
          background: "#FFF 0% 0% no-repeat padding-box",
          border: "1px solid #E6E6E6",
          borderRadius: "2px",
          opacity: "1",
          width: "209px",
          height: "24px",
          top: "12px",
          display:"none",
          marginLeft: direction == "rtl" ? "" : "auto",
          marginRight: direction == "rtl" ? "auto" : "",
        }}
      /> */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            cursor: "pointer",
          }}
          className="openNew"
          onClick={openNewTab}
          id="pmweb_AppHeader_AutomationStudio"
          tabIndex={0}
          onKeyDown={(e) => handleKeyNewTab(e)}
        >
          <span style={{ color: "var(--link_color)" }}>Automation Studio</span>
          <OpenInNewIcon
            className="AppHeaderIcon"
            titleAccess="Open Automation Studio"
            style={{
              opacity: "0.2",
              width: "1.5rem",
              height: "1.5rem",
              color: "var(--link_color)",
            }}
          />
        </div>
        {/* changes on 05-09-2023 to resolve the bug id 134610 */}
        {/* changes on 06-09-2023 to resolve the bug id 134916 */}
        <Tooltip title={t("help")} placement="bottom-start">
          <img
            src={QuestionMarkIcon}
            className="AppHeaderIcon"
            alt="Help"
            style={{
              cursor: "pointer",
              // Changes made to solve Bug 138982
              // transform: direction === RTL_DIRECTION ? "scaleX(-1)" : null,
            }}
            onClick={() => openWebHelpInPmWeb(urlHelp)}
            tabIndex={0}
            onKeyDown={(e) => handleKeyHelp(e, urlHelp)}
            id="pmweb_AppHeader_helpIcon"
          />
        </Tooltip>
        {/*Till here*/}
        {/*<div className="collabTypeLogo_Home" style={{ background: "#F4A43C" }}>
          <span className="collabName_Home">SD</span>
    </div>*/}
        <div style={{ marginLeft: "auto", display: "flex" }}>
          {/* <img src={ActivityStream} alt="" className="headerIcons" />
        <img src={Chat} alt="" className="headerIcons1" />
        <img src={Notifications} alt="" className="headerIcons1" /> */}

          <div className="relative">
            {/* <img
              src={UserProfileImage}
              alt=""
              onClick={() => {
                setShowUserProfile(true);
              }}
              className="userIcons"
            /> */}
            {userData?.profileImage ? (
              <img
                src={
                  userData.profileImage.indexOf("data:image/") === -1
                    ? `data:image/${userData?.profileImageExtension};base64,${userData?.profileImage}`
                    : userData.profileImage
                }
                alt={"User Settings"}
                role="button"
                aria-label="User Settings"
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  marginInlineEnd: "1rem",
                  marginBlockStart: "4px",
                  cursor: "pointer",
                }}
                onClick={() => {
                  setShowUserProfile(true);
                }}
                id="pmweb_AppHeader_userProfileName"
                tabIndex={0}
                onKeyUp={(e) => {
                  if (e.key === "Enter") {
                    setShowUserProfile(true);
                  }
                }}
              />
            ) : (
              <div
                onClick={() => {
                  setShowUserProfile(true);
                }}
                className="userProfile"
                tabIndex={0}
                onKeyUp={(e) => {
                  if (e.key === "Enter") {
                    setShowUserProfile(true);
                  }
                }}
                id="pmweb_AppHeader_userProfileName"
              >
                {userDisplay(userData?.name?.toUpperCase())}
              </div>
            )}
            {showUserProfile && (
              <ClickAwayListener onClickAway={() => setShowUserProfile(false)}>
                <div
                  className="userProfileDiv"
                  id="pmweb_AppHeader_userProfileTab"
                  style={{
                    right: direction === RTL_DIRECTION ? "unset" : "0vw",
                    left: direction === RTL_DIRECTION ? "0.5vw" : "unset",
                    // minWidth: direction === RTL_DIRECTION ? "18.5rem" : "16rem",
                    minWidth: "22rem",
                  }}
                >
                  {/* <div className="userProfileDetailsMainDiv">
                    <p className="userProfileContainer">
                      <span>
                        <img
                          src={UserProfileImage}
                          alt=""
                          className="userProfileImage"
                        />
                      </span>
                      <span className="userName">{username}</span>
                    </p>
                  </div> */}
                  <div className="userProfileDetailsMainDiv">
                    {userData?.profileImage ? (
                      <img
                        src={
                          userData.profileImage.indexOf("data:image/") === -1
                            ? `data:image/${userData?.profileImageExtension};base64,${userData?.profileImage}`
                            : userData.profileImage
                        }
                        alt={"User Settings"}
                        style={{
                          width: "30px",
                          height: "30px",
                          borderRadius: "50%",
                          marginInlineEnd: "1rem",
                          marginBlockStart: "4px",
                        }}
                      />
                    ) : (
                      <div
                        className="userProfile"
                        style={{
                          width: "35px",
                          height: "35px",
                          marginInlineEnd: "1rem",
                        }}
                      >
                        {userDisplay(userData?.name?.toUpperCase())}
                      </div>
                    )}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "2px",
                      }}
                    >
                      <span className="FullName">
                        {userData?.name?.length > 17
                          ? userData?.name?.slice(0, 17) + "..."
                          : userData?.name}
                      </span>

                      <span className="userName">
                        {userData?.username?.length > 17
                          ? userData?.username?.slice(0, 17) + "..."
                          : userData?.username}
                      </span>
                    </div>
                  </div>
                  <div className="userProfileSubDiv1">
                    <p style={{ display: "flex", gap: ".25rem" }}>
                      <span
                        style={{
                          /* transform:
                            direction === RTL_DIRECTION ? "scaleX(-1)" : null,*/
                          marginLeft:
                            direction === RTL_DIRECTION ? "0.5rem" : null,
                          fontSize: "var(--base_text_font_size)",
                          color: "#606060",
                        }}
                      >
                        {t("Cabinet")} :
                      </span>
                      <span
                        style={{
                          fontSize: "var(--base_text_font_size)",
                          //color: "#606060",
                          fontWeight: 600,
                        }}
                      >
                        {cabinet}
                      </span>
                    </p>
                  </div>
                  <div className="userProfileOptDiv1">
                    <p className="timeInfo">
                      {t("lastLoginTime")}{" "}
                      {/*modified on 27/09/2023 for BugId 136677 */}
                      {/* {lastLoginTime !== "null"
                        ? moment(lastLoginTime, "yyyy-MM-DD HH:mm:ss").format(
                            "DD MMM YYYY, hh:mm A"
                          )
                        : t("notApplicableAbbvr")} */}
                      <span
                        style={{
                          fontSize: "var(--base_text_font_size)",
                          color: "#000000",
                          fontWeight: 600,
                        }}
                      >
                        {lastLoginTime !== "null"
                          ? convertToArabicDateTime(lastLoginTime)
                          : t("notApplicableAbbvr")}
                      </span>
                      {/*till here BugId 136677 */}
                    </p>
                  </div>
                  <div className="userProfileOptDiv">
                    <p
                      className="iconContainer"
                      // onClick={() => logoutHandler()}
                      id="pmweb_logoutAlert"
                      onClick={logoutAlert}
                      tabIndex={0}
                      onKeyDown={(e) => handleKeyLogoutAlert(e)}
                    >
                      <span
                        style={{
                          transform:
                            direction === RTL_DIRECTION ? "scaleX(-1)" : null,
                          marginLeft:
                            direction === RTL_DIRECTION ? "0.5rem" : null,
                        }}
                      >
                        <LogoutIcon className="profileIcons" />
                      </span>
                      {isLogoutLoading && (
                        <span>
                          <CircularProgress
                            color="#606060"
                            style={{
                              height: "1.5rem",
                              width: "1.5rem",
                              marginRight: ".5rem",
                            }}
                          ></CircularProgress>
                        </span>
                      )}
                      <span>{t("logout")}</span>
                    </p>
                  </div>
                </div>
              </ClickAwayListener>
            )}
          </div>
        </div>
      </div>

      {isLogout ? (
        <Modal
          show={isLogout}
          style={{
            top: "30%",
            // left: "32.5%",
            // width: "35%",
            boxShadow: "0px 3px 6px #00000029",
            padding: "0",
            zIndex: "9999",
          }}
          modalClosed={() => setIsLogout(false)}
          children={
            <DialogBox
              closeAlert={closeAlert}
              logoutHandler={logoutHandler}
              handleKeyClose={handleKeyClose}
              handleKeyLogout={handleKeyLogout}
              isLogout={isLogout}
              setIsLogout={setIsLogout}
            />
          }
        />
      ) : null}
      {showCheckedInAlert ? (
        <Modal
          show={showCheckedInAlert}
          style={{
            top: "40%",
            left: "35%",
            width: "30%",
            padding: "0",
            zIndex: "1500",
            boxShadow: "0px 3px 6px #00000029",
            border: "1px solid #D6D6D6",
            borderRadius: "3px",
          }}
          children={
            <CheckInActivityValidation
              discardChangesFunc={() => {
                setShowCheckedInAlert(false);
              }}
              processData={processSelected}
              saveChangesFunc={(processData) =>
                handleCheckInActPropRevert(processData)
              }
              actName={CheckedAct.actCheckedName}
            />
          }
        />
      ) : null}
      {showSwimlaneAlert ? (
        <Modal
          show={showSwimlaneAlert}
          style={{
            top: "40%",
            left: "35%",
            width: "30%",
            padding: "0",
            zIndex: "1500",
            boxShadow: "0px 3px 6px #00000029",
            border: "1px solid #D6D6D6",
            borderRadius: "3px",
          }}
          children={
            <CheckinSwimlaneValidation
              discardChangesFunc={() => {
                setshowSwimlaneAlert(false);
              }}
              processData={processSelected}
              saveChangesFunc={(processData) =>
                handleCheckInSwimlaneRevert(processData)
              }
              swimlaneName={
                checkIfSwimlaneCheckedOut(localLoadedProcessData)[0]?.laneName
              }
            />
          }
        />
      ) : null}
    </div>
  );
};

const mapDispatchToProps = (dispatch) => {
  return {
    openProcessClick: (id, name, type, version, processName) =>
      dispatch(
        actionCreators.openProcessClick(id, name, type, version, processName)
      ),
    openTemplate: (id, name, flag) =>
      dispatch(actionCreators.openTemplate(id, name, flag)),
  };
};

const mapStateToProps = (state) => {
  return {
    openProcessID: state.openProcessClick.selectedId,
    openProcessName: state.openProcessClick.selectedProcessName,
    openProcessType: state.openProcessClick.selectedType,
    openProcessVersion: state.openProcessClick.selectedVersion,
    templateId: state.openTemplateReducer.templateId,
    templateName: state.openTemplateReducer.templateName,
    openTemplateFlag: state.openTemplateReducer.openFlag,
    showDrawer: state.showDrawerReducer.showDrawer,
    selectedTabAtNavPanel: state.selectedTabAtNavReducer.selectedTab,
    CreateProcessFlag: state.createProcessFlag.clickedCreateProcess,
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(AppHeader);
