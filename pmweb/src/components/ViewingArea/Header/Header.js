// #BugID - 113913
// #BugDescription - handled the checks for redirecting to blank page on click version
// Bug 116266 - Checkin: Checkin and other options are not available when draft checked out process opened from Recent Listing
// Bug 117358 - 07 November 2022, Made the complete journey from template listing to Use this template to create the process.
// #BugID - 119893
// #BugDescription - Added functionality to show version list after importing new version process.

// #BugID - 111869
// #BugDescription - Checkout/UndoCheckout issue fixed in more option

//Changes made to solve Bug 121464 -Object rights>> Local process mangement and PMweb menu mangement rights are not working correctly

// #BugID - 125171
// #BugDescription -  Fixed the issue Without for assignment of pmweb menu rights the user is getting all the access for the same and able to peroform operation

// #BugID - 125335
// #BugDescription - Handled the issue for enable/disable: process state is not changed to enabled/deployed after performing the actions like enable and disable just after check in the process

// #BugID - 125330
// #BugDescription - Handled the issue for docker>>enabled process is displayed in deployed state after check in(both enabled and draft checked out process are opened).
// #BugID - 125844
// #BugDescription - Handled the projectname issue.

// Changes made to solve Bug 123515 - Process Designer-icons related- UX and UI bugs

/*changes made to solve bugs
137988,
138011,
138018,
138020,
138021,
138022,
138024,
138025,
138044,
138045,
138048,
138049
*/
import React, { useState, useEffect } from "react";
import styles from "./index.module.css";
import MenuIcon from "@material-ui/icons/Menu";
import CloseIcon from "@material-ui/icons/Close";
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";
import deploy from "../../../assets/Header/DM_Deploy_Task_white.svg";
import { connect, useSelector } from "react-redux";
import "./Header.css";
import ProcessDeployment from "./ProcessValidation/ProcessDeployment/DeploySucessModal.js";
import ProcessDeploymentFailed from "./ProcessValidation/ProcessDeployment/DeployFailedModal.js";
import { tileProcess } from "../../../utility/HomeProcessView/tileProcess";
import { useTranslation } from "react-i18next";
import {
  APP_HEADER_HEIGHT,
  ARABIC_LOCALE,
  ARABIC_SA_LOCALE,
  DISABLED_STATE,
  ENABLED_STATE,
  MENUOPTION_CHECKIN,
  MENUOPTION_CHECKOUT,
  MENUOPTION_DELETE,
  MENUOPTION_DEPLOY,
  MENUOPTION_DISABLE,
  MENUOPTION_ENABLE,
  MENUOPTION_EXPORT,
  MENUOPTION_IMPORT,
  MENUOPTION_PIN,
  MENUOPTION_SAVE_LOCAL,
  MENUOPTION_SAVE_NEW_V,
  MENUOPTION_SAVE_TEMPLATE,
  MENUOPTION_UNDOCHECKOUT,
  MENUOPTION_UNPIN,
  PMWEB,
  PREVIOUS_PAGE_CREATE_FROM_TEMPLATE,
  PROCESSTYPE_DEPLOYED,
  PROCESSTYPE_LOCAL,
  PROCESSTYPE_LOCAL_CHECKED,
  PROCESSTYPE_REGISTERED,
  PROCESS_CHECKOUT,
  RTL_DIRECTION,
  SERVER_URL_LAUNCHPAD,
  userRightsMenuNames,
} from "../../../Constants/appConstants";
import { ClickAwayListener, IconButton } from "@material-ui/core";
import Modal from "../../../UI/Modal/Modal.js";
import SaveTemplate from "./Modals/SaveTemplate";
import { store, useGlobalState } from "state-pool";
import DeployProcess from "../../DeployProcess/DeployProcess";
import UndoCheckOutModal from "./Modals/UndoCheckoutProcess";
import CheckInModal from "./Modals/CheckInProcess";
import CheckOutModal from "./Modals/CheckOutProcess";
import DeleteDraftModal from "./Modals/DeleteDraftProcess";
import DeleteDeployedModal from "./Modals/DeleteDeployedProcess";
import DisableProcess from "./Modals/DisableProcess";
import EnableProcess from "./Modals/EnableProcess";
import SaveAsNewVersion from "./Modals/SaveAsNewVersion";
import SaveAsNewDraft from "./Modals/SaveAsNewDraft";
import ProjectReport from "./Modals/ProjectReport";
import { Card, CardContent } from "@material-ui/core";
import VersionHistory from "./Modals/VersionHistory";
import axios from "axios";
import ImportExportProcess from "../../MainView/ImportExportProcess/ImportExportProcess";
import { setImportExportVal } from "../../../redux-store/slices/ImportExportSlice";
import { useDispatch } from "react-redux";
import Box from "@material-ui/core/Box";
import Drawer from "@material-ui/core/Drawer";
import ProcessValidation from "./ProcessValidation/ProcessProgress/index";
import { UserRightsValue } from "../../../redux-store/slices/UserRightsSlice";
import {
  getLocalProjectRights,
  getMenuNameFlag,
} from "../../../utility/UserRightsFunctions";
import ProcessCreation from "../../../UI/ProcessCreation";
import { setToastDataFunc } from "../../../redux-store/slices/ToastDataHandlerSlice";
import {
  isArabicLocaleSelected,
  isProcessDeployedFunc,
} from "../../../utility/CommonFunctionCall/CommonFunctionCall";
import { OpenProcessLoaderSliceValue } from "../../../redux-store/slices/OpenProcessLoaderSlice";
import secureLocalStorage from "react-secure-storage";
import arabicStyles from "./ArabicModal.module.css";
import { useTheme, useMediaQuery } from "@material-ui/core";

function Header(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const theme = useTheme();
  const matchesTab = useMediaQuery("(max-width:1140px)");
  const matchesMobile = useMediaQuery("(max-width:750px)");
  const matchesLaptop = useMediaQuery("(max-width:1370px)");

  const userRightsValue = useSelector(UserRightsValue);
  let enabledProcessRightsFlag = true;
  let checkedOutProcessRightsFlag = true;

  // Boolean that decides whether create process button will be visible or not.
  const createProcessRightsFlag = getMenuNameFlag(
    userRightsValue?.menuRightsList,
    userRightsMenuNames.createProcess
  );

  let saveProcessRightsFlag = getMenuNameFlag(
    userRightsValue?.menuRightsList,
    userRightsMenuNames.saveProcess
  );
  let makerCheckerRightsFlag = getMenuNameFlag(
    userRightsValue?.menuRightsList,
    userRightsMenuNames.makerChecker
  );

  let importProcessRightsFlag = getMenuNameFlag(
    userRightsValue?.menuRightsList,
    userRightsMenuNames.importProcess
  );

  let exportProcessRightsFlag = getMenuNameFlag(
    userRightsValue?.menuRightsList,
    userRightsMenuNames.exportProcess
  );

  let reportGenerationRightsFlag = getMenuNameFlag(
    userRightsValue?.menuRightsList,
    userRightsMenuNames.reportGeneration
  );

  let deleteProcessRightsFlag = getMenuNameFlag(
    userRightsValue?.menuRightsList,
    userRightsMenuNames.deleteProcess
  );

  let registerProcessRightsFlag = getMenuNameFlag(
    userRightsValue?.menuRightsList,
    userRightsMenuNames.registerProcess
  );
  const [showMore, setShowMore] = useState(false);
  const loadedProcessData = store.getState("loadedProcessData"); //current processdata clicked
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const [action, setAction] = useState(null);
  const [showVersionCard, setshowVersionCard] = useState(false);
  //code edited on 26 July 2022 for BugId 110024
  const { processData, setProcessData } = props;
  const buttonFrom = "DeployHeader";
  const [showProcessReport, setshowProcessReport] = useState(false);
  const dispatch = useDispatch();
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [showDeployFailModal, setShowDeployFailModal] = useState(false);
  const [errorVariables, setErrorVariables] = useState([]);
  const [warningVariables, setWarningVariables] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pinnedProcessDefIdArr, setpinnedProcessDefIdArr] = useState([]);
  const [showPinBoolean, setshowPinBoolean] = useState(true);
  const [versionListSelected, setversionListSelected] = useState([]);
  const [showVersionHistory, setshowVersionHistory] = useState(false);
  const [version, setVersion] = useState(null);
  const [processType, setProcessType] = useState(null);
  const [state, setState] = useState({
    top: false,
    left: false,
    bottom: false,
    right: false,
  });
  const smallScreen = useMediaQuery("(max-width:699px)");
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [category, setCategory] = useState(null);
  const [checkOutStatus, setCheckOutStatus] = useState(
    props?.processData?.CheckedOut
  );
  const openProcessLoader = useSelector(OpenProcessLoaderSliceValue);

  if (localLoadedProcessData?.RIGHTS) {
    deleteProcessRightsFlag = getMenuNameFlag(
      userRightsValue?.menuRightsList,
      userRightsMenuNames.deleteProcess
    )
      ? getLocalProjectRights(localLoadedProcessData?.RIGHTS?.U)
      : getLocalProjectRights(localLoadedProcessData?.RIGHTS?.U);
    reportGenerationRightsFlag = getMenuNameFlag(
      userRightsValue?.menuRightsList,
      userRightsMenuNames.reportGeneration
    )
      ? getLocalProjectRights(localLoadedProcessData?.RIGHTS?.PRPT)
      : getLocalProjectRights(localLoadedProcessData?.RIGHTS?.PRPT);
    enabledProcessRightsFlag = getLocalProjectRights(
      localLoadedProcessData?.RIGHTS?.CS
    );
    checkedOutProcessRightsFlag = getLocalProjectRights(
      localLoadedProcessData?.RIGHTS?.C
    );
    // Boolean that decides whether import process button will be visible or not.
    importProcessRightsFlag = getMenuNameFlag(
      userRightsValue?.menuRightsList,
      userRightsMenuNames.importProcess
    )
      ? getLocalProjectRights(localLoadedProcessData?.RIGHTS?.IMPBO)
      : getLocalProjectRights(localLoadedProcessData?.RIGHTS?.IMPBO);
  }

  useEffect(() => {
    async function getPinned() {
      const res = await axios.get(SERVER_URL_LAUNCHPAD + "/pinnedList/1");
      try {
        if (res.status === 200) {
          res.data.forEach((data) => {
            setpinnedProcessDefIdArr((prev) => {
              let temp = [...prev];
              temp.push(data.Id + "");
              return temp;
            });
          });
        }
      } catch (err) {
        console.log(err);
      }
    }
    getPinned();
    setCheckOutStatus(props?.processData?.CheckedOut);
  }, [processData.ProcessDefId]);

  useEffect(() => {
    if (pinnedProcessDefIdArr.includes(processData.ProcessDefId))
      setshowPinBoolean(false);
    else setshowPinBoolean(true);
  }, [pinnedProcessDefIdArr]);

  /*code added on 17 Nov 2022 for BugId 117668*/
  const handleProcessAction = async (actionType) => {
    setAction(actionType);
    if (actionType === MENUOPTION_PIN) {
      const res = await axios.post(SERVER_URL_LAUNCHPAD + "/pin", {
        name: processData.ProcessName,
        type: "P",
        parent: processData.ProjectName,
        editor: processData.CreatedBy,
        status:
          processData.ProcessState === "Enabled"
            ? "E"
            : processData.ProcessType, //same for temp
        creationDate: processData.CreatedOn,
        modificationDate: processData.LastModifiedOn,
        accessedDate: processData.CreatedOn, //same as it is temp.
        applicationName: PMWEB, //hardcoded (const file)
        id: processData.ProcessDefId,
        version: processData.VersionNo,
        statusMessage: "Created",
        applicationId: "1",
        parentId: processData.ProjectId,
        parentStatus: processData.ProcessType,
        parentType: "PR",
        userId: +secureLocalStorage.getItem("user_id"),
      });
      if (res.data) {
        setshowPinBoolean(false);

        if (res.status === 200) {
          dispatch(
            setToastDataFunc({
              //modified on 20-9-2023 for bug_id: 136766
              // message: "Process successfully pinned",
              message: t("processSuccessfullyPinned"),
              //till here for bug_id: 136766
              severity: "success",
              open: true,
            })
          );
        }
      }
    } else if (actionType === MENUOPTION_UNPIN) {
      axios
        .post(SERVER_URL_LAUNCHPAD + "/unpin", {
          status: processData.ProcessType,
          id: processData.ProcessDefId,
          applicationName: PMWEB,
          type: "P",
          applicationId: "1",
          userId: +secureLocalStorage.getItem("user_id"),
        })

        .then((response) => {
          setshowPinBoolean(true);
          if (response?.status === 200) {
            dispatch(
              setToastDataFunc({
                // message: "Process successfully unpinned",
                message: t("processSuccessfullyUnpinned"),
                severity: "success",
                open: true,
              })
            );
          }
        });
    } else if (
      actionType === MENUOPTION_IMPORT ||
      actionType === MENUOPTION_EXPORT
    ) {
      dispatch(
        setImportExportVal({
          ProjectName: {
            ProjectName: localLoadedProcessData.ProjectName,
            ProjectId: localLoadedProcessData.ProjectId,
          },
        })
      );
    }
  };

  const handleProcessReport = (e) => {
    e.stopPropagation();
    setshowProcessReport(true);
  };

  const versionHandler = () => {
    setshowVersionCard(true);
  };

  const toggleDrawer = (anchor, open) => {
    // Bug fixed for Bug Id  - 111391 (When Deployment fails the pop up shows "View Details" but nothing happens after clicking on it)
    setState({ ...state, [anchor]: open });
  };

  const createProcess = (pid, tempName) => {
    const template = JSON.parse(localStorage.getItem("useThisTemplate"));
    const category = JSON.parse(localStorage.getItem("categoryDetail"));
    setSelectedTemplate(template);
    setCategory(category);
    setShowTemplateModal(true);
    localStorage.removeItem("useThisTemplate");
    localStorage.removeItem("categoryDetail");
  };

  const checkOutFunc = (val) => {
    setCheckOutStatus(val);
  };

  //code edited on 13 Dec 2022 for BugId 118764
  const list = (anchor) => (
    <Box
      sx={{ width: anchor === "top" || anchor === "bottom" ? "auto" : 250 }}
      role="presentation"
    >
      <ProcessValidation
        errorVariables={errorVariables}
        setErrorVariables={setErrorVariables}
        showDeployModal={showDeployModal}
        setShowDeployModal={setShowDeployModal}
        setShowDeployFailModal={setShowDeployFailModal}
        showDeployFailModal={showDeployFailModal}
        warningVariables={warningVariables}
        setWarningVariables={setWarningVariables}
        toggleDrawer={() => toggleDrawer(anchor, false)}
        checkOutData={processData?.CheckedOut}
        processDefId={localLoadedProcessData?.ProcessDefId} //Added on 22/01/2024 for bug_id:142453
      />
    </Box>
  );

  useEffect(() => {
    /*code edited on 29 August 2022 for BugId 114894 */
    if (localLoadedProcessData) {
      setVersion(localLoadedProcessData.VersionNo);
      setProcessType(localLoadedProcessData.ProcessType);
      localLoadedProcessData?.Versions?.forEach((element) => {
        if (+element.VersionNo === +props.openProcessVersion) {
          let temp = [...versionListSelected];
          temp.push(element);
          setversionListSelected(temp);
        }
      });
    }
  }, [localLoadedProcessData, processData?.ProcessState]);

  const getProcessType = (processType) => {
    if (processType === PROCESSTYPE_LOCAL) return tileProcess(processType);
    else if (processType === PROCESSTYPE_REGISTERED) {
      if (processData?.ProcessState.trim() === "Enabled") {
        return tileProcess("E");
      } else {
        return tileProcess(processType);
      }
    }
  };

  //Modified on 26/05/2023, bug_id:127570

  /*  useEffect(() => {
    window.history.forward();
    //window.history.back()
   }, []); */

  window.history.pushState(null, null, window.location.href);
  window.onpopstate = function () {
    window.history.go(1);
  };

  const clickAwayParent = () => {
    setShowMore(false);
  };

  return (
    <div className="header_processes" style={{ direction: direction }}>
      <div className="leftHeader">
        <MenuIcon
          style={{ color: "#606060", width: "1.5rem", height: "1.5rem" }}
        />
        <p class="processName">
          {props.openTemplateFlag ? props.templateName : props.openProcessName}
        </p>
        {/*code edited on 29 August 2022 for BugId 114894 and added on 22 Dec 2022 for BugId 120859*/}
        {props.openTemplateFlag || openProcessLoader.loader ? null : (
          <span class="versionName" onClick={versionHandler}>
            {version !== null ? t("v") + version : ""}
          </span>
        )}
        <span
          class={
            direction === RTL_DIRECTION ? "processTypeArabic" : "processType"
          }
        >
          {/*code edited on 29 August 2022 for BugId 114894 and added on 22 Dec 2022 for BugId 120859 */}
          {props.openTemplateFlag || openProcessLoader.loader
            ? null
            : processType &&
              processType !== null && (
                <img
                  src={getProcessType(processType)[0]}
                  style={{ height: "1rem", width: "1rem", marginTop: "1px" }}
                  alt="Process Type"
                />
              )}
          <span
            class={
              direction === RTL_DIRECTION || isArabicLocaleSelected()
                ? "processTypeNameArabic"
                : "processTypeName"
            }
          >
            {/*code added on 22 Dec 2022 for BugId 120859 */}
            {props.openTemplateFlag
              ? t("Template")
              : openProcessLoader.loader
              ? null
              : processType &&
                processType !== null &&
                `${t(getProcessType(processType)[1])} ${
                  localLoadedProcessData?.CheckedOut === "Y"
                    ? t("CheckedOut") //added on 19/09/23 for BugId 136854
                    : ""
                }`}
          </span>
        </span>
      </div>

      {showVersionCard ? (
        <ClickAwayListener onClickAway={() => setshowVersionCard(false)}>
          <Card
            variant="outlined"
            className={
              direction === RTL_DIRECTION ? "versionCardArabic" : "versionCard"
            }
          >
            <CardContent>
              <div className="row">
                <div className="versionCss">
                  <div>
                    <p className="versionCardLabel">{t("Version")}</p>
                    <p className="versionCardVal">
                      {localLoadedProcessData?.VersionNo}
                    </p>
                  </div>
                  <div>
                    {localLoadedProcessData?.Versions?.length > 1 ? (
                      <p
                        className="versionHistory"
                        onClick={() => setshowVersionHistory(true)}
                      >
                        {t("viewVersionHistory")}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
              {/*code updated on 12 August 2022 for BugId 115525  */}
              <p className="versionCardLabel">{t("createdBy")}</p>
              <p className="versionCardVal">
                {localLoadedProcessData?.Versions[0]?.CreatedBy} {t("on")}{" "}
                {localLoadedProcessData?.Versions[0]?.CreatedOn}
              </p>
              <p className="versionCardLabel">{t("lastModifiedBy")}</p>
              <p className="versionCardVal">
                {localLoadedProcessData?.Versions[0]?.LastModifiedBy} {t("on")}{" "}
                {localLoadedProcessData?.Versions[0]?.LastModifiedOn}
              </p>
              <p className="versionCardLabel">{t("project")}</p>
              <p className="versionCardVal">
                {localLoadedProcessData?.ProjectName}
              </p>
            </CardContent>
          </Card>
        </ClickAwayListener>
      ) : null}
      <div className="rightHeader">
        <div className="relative">
          <ClickAwayListener onClickAway={() => clickAwayParent()}>
            <button
              class="moreButton"
              onClick={() => setShowMore(true)}
              id="header_more_btn"
            >
              <MoreHorizIcon
                style={{
                  color: "#727272",
                  width: "1.5rem",
                  height: "1.5rem",
                }}
              />
              <span
                className={
                  direction === RTL_DIRECTION ? "moreTextArabic" : "moreText"
                }
              >
                {t("More")}
              </span>
            </button>
          </ClickAwayListener>
          {showMore ? (
            props.openTemplateFlag ? null : (
              <div
                className={
                  direction === RTL_DIRECTION
                    ? "moreBtnDropdownArabic"
                    : "moreBtnDropdown"
                }
                onTouchStart={(e) => {
                  e.stopPropagation();
                }}
              >
                <ul style={{ zIndex: 9999999 }}>
                  {saveProcessRightsFlag && (
                    <li
                      className="moreOptions"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProcessAction(MENUOPTION_SAVE_NEW_V);
                      }}
                      onTouchStart={(e) => {
                        e.stopPropagation();

                        handleProcessAction(MENUOPTION_SAVE_NEW_V);
                      }}
                      style={{
                        display:
                          processData?.ProcessType !== PROCESSTYPE_LOCAL
                            ? "none"
                            : processData.CheckedOut === PROCESS_CHECKOUT
                            ? "none"
                            : "",
                      }}
                      id="saveAsNewVersion_btn"
                    >
                      {t("saveAsNewVersion")}
                    </li>
                  )}
                  <li
                    className="moreOptions"
                    onClick={(e) => {
                      //e.stopPropagation();
                      handleProcessAction(MENUOPTION_SAVE_TEMPLATE);
                    }}
                    onTouchStart={(e) => {
                      e.stopPropagation();

                      handleProcessAction(MENUOPTION_SAVE_TEMPLATE);
                    }}
                    style={{
                      display:
                        processData?.ProcessType !== PROCESSTYPE_DEPLOYED &&
                        processData?.ProcessType !== PROCESSTYPE_LOCAL
                          ? "none"
                          : processData.CheckedOut === PROCESS_CHECKOUT
                          ? "none"
                          : "",
                    }}
                    id="saveAsTemplate_btn"
                  >
                    {t("saveAsTemplate")}
                  </li>
                  <li
                    className="moreOptions"
                    onClick={(e) => {
                      //e.stopPropagation();
                      handleProcessAction(MENUOPTION_SAVE_LOCAL);
                    }}
                    onTouchStart={(e) => {
                      e.stopPropagation();

                      handleProcessAction(MENUOPTION_SAVE_LOCAL);
                    }}
                    style={{
                      display:
                        processData?.ProcessType !== PROCESSTYPE_DEPLOYED &&
                        processData?.ProcessType !== PROCESSTYPE_REGISTERED
                          ? "none"
                          : "",
                    }}
                    id="saveAsLocal_btn"
                  >
                    {t("saveAsLocal")}
                  </li>
                  <li
                    className="moreOptions"
                    onClick={(e) => {
                      //e.stopPropagation();
                      handleProcessAction(MENUOPTION_CHECKIN);
                    }}
                    onTouchStart={(e) => {
                      e.stopPropagation();

                      handleProcessAction(MENUOPTION_CHECKIN);
                    }}
                    style={{
                      display:
                        (processData?.ProcessType === PROCESSTYPE_LOCAL ||
                          processData?.ProcessType ===
                            PROCESSTYPE_LOCAL_CHECKED) &&
                        processData.CheckedOut === PROCESS_CHECKOUT
                          ? ""
                          : "none",
                    }}
                    id="checkin_btn"
                  >
                    {t("checkInProcess")}
                  </li>

                  <li
                    className="moreOptions"
                    onClick={(e) => {
                      //e.stopPropagation();
                      handleProcessAction(MENUOPTION_UNDOCHECKOUT);
                    }}
                    onTouchStart={(e) => {
                      e.stopPropagation();
                      handleProcessAction(MENUOPTION_UNDOCHECKOUT);
                    }}
                    style={{
                      display:
                        (processData?.ProcessType === PROCESSTYPE_DEPLOYED ||
                          processData?.ProcessType ===
                            PROCESSTYPE_REGISTERED) &&
                        checkOutStatus === PROCESS_CHECKOUT
                          ? ""
                          : "none",
                    }}
                    id="undo_checkout_btn"
                  >
                    {t("undoCheckoutProcess")}
                  </li>
                  {checkedOutProcessRightsFlag ? (
                    <li
                      className="moreOptions"
                      onClick={(e) => {
                        //e.stopPropagation();
                        handleProcessAction(MENUOPTION_CHECKOUT);
                      }}
                      onTouchStart={(e) => {
                        e.stopPropagation();

                        handleProcessAction(MENUOPTION_CHECKOUT);
                      }}
                      style={{
                        display:
                          (processData?.ProcessType === PROCESSTYPE_DEPLOYED ||
                            processData?.ProcessType ===
                              PROCESSTYPE_REGISTERED) &&
                          checkOutStatus !== PROCESS_CHECKOUT
                            ? ""
                            : "none",
                      }}
                      id="checkout_btn"
                    >
                      {t("checkoutProcess")}
                    </li>
                  ) : null}

                  <li
                    onClick={(e) => {
                      //e.stopPropagation();
                      toggleDrawer("bottom", true);
                    }}
                    onTouchStart={(e) => {
                      e.stopPropagation();

                      toggleDrawer("bottom", true);
                    }}
                    className="moreOptions"
                    style={{
                      display:
                        processData?.ProcessType === PROCESSTYPE_LOCAL ||
                        processData?.ProcessType === PROCESSTYPE_LOCAL_CHECKED
                          ? ""
                          : "none",
                    }}
                  >
                    {t("validateProcess")}
                  </li>
                  {showPinBoolean ? (
                    <li
                      className="moreOptions"
                      onClick={(e) => {
                        //e.stopPropagation();
                        handleProcessAction(MENUOPTION_PIN);
                      }}
                      onTouchStart={(e) => {
                        e.stopPropagation();

                        handleProcessAction(MENUOPTION_PIN);
                      }}
                      style={{
                        display:
                          processData.CheckedOut === PROCESS_CHECKOUT
                            ? "none"
                            : "",
                      }}
                      id="header_delete_btn"
                    >
                      {t("pin")} {t("process")}
                    </li>
                  ) : (
                    <li
                      className="moreOptions"
                      onClick={(e) => {
                        //e.stopPropagation();
                        handleProcessAction(MENUOPTION_UNPIN);
                      }}
                      onTouchStart={(e) => {
                        e.stopPropagation();

                        handleProcessAction(MENUOPTION_UNPIN);
                      }}
                      style={{
                        display:
                          processData.CheckedOut === PROCESS_CHECKOUT
                            ? "none"
                            : "",
                      }}
                      id="header_delete_btn"
                    >
                      {t("unpin")} {t("process")}
                    </li>
                  )}
                  {importProcessRightsFlag && (
                    <li
                      className="moreOptions"
                      onClick={(e) => {
                        //e.stopPropagation();
                        handleProcessAction(MENUOPTION_IMPORT);
                      }}
                      onTouchStart={(e) => {
                        e.stopPropagation();

                        handleProcessAction(MENUOPTION_IMPORT);
                      }}
                      style={{
                        display:
                          processData?.ProcessType === PROCESSTYPE_LOCAL ||
                          processData?.ProcessType === PROCESSTYPE_LOCAL_CHECKED
                            ? ""
                            : "none",
                      }}
                      id="header_delete_btn"
                    >
                      {t("import")} {t("process")}
                    </li>
                  )}
                  {exportProcessRightsFlag && (
                    <li
                      className="moreOptions"
                      onClick={(e) => {
                        //e.stopPropagation();
                        handleProcessAction(MENUOPTION_EXPORT);
                      }}
                      onTouchStart={(e) => {
                        e.stopPropagation();

                        handleProcessAction(MENUOPTION_EXPORT);
                      }}
                      style={{
                        display:
                          processData.CheckedOut === PROCESS_CHECKOUT
                            ? "none"
                            : "",
                      }}
                      id="header_delete_btn"
                    >
                      {t("export")} {t("processC")}
                    </li>
                  )}
                  {deleteProcessRightsFlag && (
                    <li
                      className="moreOptions"
                      onClick={(e) => {
                        //e.stopPropagation();
                        handleProcessAction(MENUOPTION_DELETE);
                      }}
                      onTouchStart={(e) => {
                        e.stopPropagation();

                        handleProcessAction(MENUOPTION_DELETE);
                      }}
                      style={{
                        display:
                          processData.CheckedOut === PROCESS_CHECKOUT
                            ? "none"
                            : "",
                      }}
                      id="header_delete_btn"
                    >
                      {t("delete")} {t("processC")}
                    </li>
                  )}
                  {enabledProcessRightsFlag ? (
                    <li
                      className="moreOptions"
                      onClick={(e) => {
                        //e.stopPropagation();
                        handleProcessAction(MENUOPTION_DISABLE);
                      }}
                      onTouchStart={(e) => {
                        e.stopPropagation();

                        handleProcessAction(MENUOPTION_DISABLE);
                      }}
                      id="disable_process_btn"
                      style={{
                        display:
                          (processData?.ProcessType === PROCESSTYPE_DEPLOYED ||
                            processData?.ProcessType ===
                              PROCESSTYPE_REGISTERED) &&
                          processData.ProcessState === ENABLED_STATE
                            ? ""
                            : "none",
                      }}
                    >
                      {t("disable")} {t("processC")}
                    </li>
                  ) : null}
                  {enabledProcessRightsFlag ? (
                    <li
                      className="moreOptions"
                      onClick={(e) => {
                        //e.stopPropagation();
                        handleProcessAction(MENUOPTION_ENABLE);
                      }}
                      onTouchStart={(e) => {
                        e.stopPropagation();

                        handleProcessAction(MENUOPTION_ENABLE);
                      }}
                      id="enable_process_btn"
                      style={{
                        display:
                          (processData?.ProcessType === PROCESSTYPE_DEPLOYED ||
                            processData?.ProcessType ===
                              PROCESSTYPE_REGISTERED) &&
                          processData.ProcessState === DISABLED_STATE
                            ? ""
                            : "none",
                      }}
                    >
                      {t("enable")} {t("processC")}
                    </li>
                  ) : null}

                  {reportGenerationRightsFlag && (
                    <li
                      className="moreOptions"
                      onClick={handleProcessReport}
                      onTouchStart={handleProcessReport}
                      id="process_report_btn"
                    >
                      {t("processReport")}
                    </li>
                  )}
                  {makerCheckerRightsFlag && (
                    <li
                      className="moreOptions"
                      onClick={(e) => {
                        //e.stopPropagation();
                        window.loadInboxMC();
                        setIsModalOpen(true);
                      }}
                      onTouchStart={(e) => {
                        e.stopPropagation();

                        window.loadInboxMC();
                        setIsModalOpen(true);
                      }}
                      id="maker_checker_btn"
                    >
                      {t("makerChecker")}
                    </li>
                  )}
                </ul>
              </div>
            )
          ) : null}
        </div>
        {props.openTemplateFlag && createProcessRightsFlag ? (
          <button
            className="deployButton"
            id="useTemplate_btn"
            onClick={() => {
              createProcess(props.processData.ProcessDefId, props.templateName);
            }}
          >
            <span
              className={
                direction === RTL_DIRECTION ? "deployTextArabic" : "deployText"
              }
            >
              {t("UseThisTemplate")}
            </span>
          </button>
        ) : registerProcessRightsFlag &&
          props.openProcessType !== PROCESSTYPE_REGISTERED &&
          /* code edited on 3 July 2023 for issue - remove deploy button in case of 
          registered and checked-in processses.*/
          processData?.CheckedOut !== "Y" &&
          !openProcessLoader.loader ? (
          <button
            className="deployButton"
            onClick={() => setAction(MENUOPTION_DEPLOY)}
            id="header_deploy_btn"
          >
            <img
              src={deploy}
              style={{ width: "1.5rem", height: "1.5rem" }}
              alt={t("Deploy")}
            />
            <span
              className={
                direction === RTL_DIRECTION ? "deployTextArabic" : "deployText"
              }
            >
              {t("Deploy")}
            </span>
          </button>
        ) : null}
      </div>
      {showProcessReport ? (
        <Modal
          show={showProcessReport}
          // Changes made to solve Bug 135309
          style={{
            padding: 0,
            height: "425px",
            position: "absolute",
            top: "10%",
          }}
          hideBackdrop={true}
          // Changes made to make Process Report Screen Responsive
          className="processHeaderReport"
          children={
            <ProjectReport
              setshowProcessReport={setshowProcessReport}
              openProcessType={processData?.ProcessType}
            />
          }
        />
      ) : null}

      {isModalOpen ? (
        <Modal
          show={isModalOpen}
          hideBackdrop={true}
          modalClosed={() => {
            setIsModalOpen(false);
            var elem = document.getElementById("workspacestudio_assetManifest");
            elem?.parentNode?.removeChild(elem);
          }}
          style={{
            width: "73%",
            height: "91%",
            left: "14%",
            top: "6%",
            padding: "0",
          }}
          // added on 02/01/24 for BugId 142043
          NoFocusTrap={true}
          // till here BugId 142043
        >
          <IconButton
            onClick={() => {
              setIsModalOpen(false);
              var elem = document.getElementById(
                "workspacestudio_assetManifest"
              );
              elem?.parentNode?.removeChild(elem);
            }}
            id="pmweb_Header_ModalCloseIcon"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setIsModalOpen(false);
                var elem = document.getElementById(
                  "workspacestudio_assetManifest"
                );
                elem?.parentNode?.removeChild(elem);
                e.stopPropagation();
              }
            }}
            style={{
              position: "absolute",
              right: direction === RTL_DIRECTION ? "unset" : "0",
              left: direction === RTL_DIRECTION ? "var(--spacing_h)" : "unset",
            }}
            aria-label="closeIcon"
            disableTouchRipple
            disableFocusRipple
          >
            <CloseIcon
              fontSize="medium"
              style={{
                cursor: "pointer",
                width: "1.25rem",
                height: "1.25rem",
              }}
            />
          </IconButton>
          <div
            style={{
              height: "99%",
              overflow: "hidden",
              marginTop: "6px",
            }}
          >
            <div id="mf_inbox_oapweb"></div>
          </div>
        </Modal>
      ) : null}

      {action === MENUOPTION_SAVE_TEMPLATE ? (
        <Modal
          show={action === MENUOPTION_SAVE_TEMPLATE}
          hideBackdrop={true}
          style={{
            padding: "0",
            width: "28vw",
            left: "35%",
            top: "25%",
          }}
          children={<SaveTemplate 
          setModalClosed={() => setAction(null)} 
          processDefId={localLoadedProcessData?.ProcessDefId} //Added on 22/01/2024 for bug_id:142453  
          />}
        />
      ) : null}
      {action === MENUOPTION_IMPORT || action === MENUOPTION_EXPORT ? (
        // Changes on 27-09-2023to resove the bug Id 138482
        <Modal
          show={action === MENUOPTION_IMPORT || action === MENUOPTION_EXPORT}
          style={{
            width: "450px",
            height: action === MENUOPTION_EXPORT ? "201px" : "380px", //Changes made to solve Bug 137332
            left: "50%",
            top: smallScreen ? "0%" : "44%",
            padding: "0",
            position: "absolute",
            transform: "translate(-50%, -50%)",
            boxShadow: "none",
          }}
          hideBackdrop={true}
          children={
            <ImportExportProcess
              setAction={() => setAction(null)}
              showOverwrite={true}
              processName={localLoadedProcessData?.ProcessName}
              selectedProjectId={localLoadedProcessData?.ProjectId}
              selectedProjectName={localLoadedProcessData?.ProjectName}
              changeProjectBool={false}
              typeImportorExport={
                action === MENUOPTION_IMPORT ? "import" : "export"
              }
            />
          }
        />
      ) : null}
      {
        //code updated on 18 October 2022 for BugId 116265
      }
      {action === MENUOPTION_UNDOCHECKOUT ? (
        <Modal
          show={action === MENUOPTION_UNDOCHECKOUT}
          style={{
            padding: "0",
            width: "33vw",
            left: "33%",
            top: "25%",
          }}
          modalClosed={() => setAction(null)}
          hideBackdrop={true}
          children={
            <UndoCheckOutModal
              modalType={MENUOPTION_UNDOCHECKOUT}
              openProcessName={props.openProcessName}
              setModalClosed={() => setAction(null)}
              processDefId={props.openProcessID}
              projectName={processData.ProjectName}
              checkOutFunc={checkOutFunc}
              localLoadedProcessData={localLoadedProcessData}
            />
          }
        />
      ) : null}
      {
        //code updated on 18 October 2022 for BugId 116265
      }
      {action === MENUOPTION_CHECKIN ? (
        <Modal
          show={action === MENUOPTION_CHECKIN}
          /* style={{
            padding: "0",
            //code added for bug 131310
            //Modified on 10/08/2023, bug_id:131315
            width: matchesMobile
              ? "90vw"
              : matchesTab
              ? "80vw"
              : matchesLaptop
              ? "60vw"
              : "50vw",
            left: matchesMobile ? "6%" : matchesTab ? "12%" : "25%",
            top: matchesTab ? "30%" : "25%",
          }}*/
          style={{
            padding: "0",
            //code added for bug 131310
            //Modified on 10/08/2023, bug_id:131315
            width: matchesMobile
              ? "90vw"
              : matchesTab
              ? "80vw"
              : matchesLaptop
              ? "40%"
              : "40%",
            left: matchesMobile ? "6%" : matchesTab ? "12%" : "30%",
            top: matchesTab ? "30%" : "25%",
          }}
          modalClosed={() => setAction(null)}
          hideBackdrop={true}
          children={
            <CheckInModal
              modalType={MENUOPTION_CHECKIN}
              openProcessName={props.openProcessName}
              setModalClosed={() => setAction(null)}
              existingVersion={localLoadedProcessData?.RegisteredProcessVersion}
              processDefId={props.openProcessID}
              toggleDrawer={() => toggleDrawer("bottom", true)}
              openProcessID={props.openProcessID}
            />
          }
        />
      ) : null}
      {
        //code updated on 18 October 2022 for BugId 116265
        //code updated on 10 November 2022 for BugId 116264
      }
      {action === MENUOPTION_CHECKOUT ? (
        <Modal
          show={action === MENUOPTION_CHECKOUT}
          style={{
            padding: "0",
            //code added for bug 131310
            width: matchesTab || matchesMobile ? "50vw" : "33vw",
            left: "33%",
            top: "25%",
          }}
          modalClosed={() => setAction(null)}
          hideBackdrop={true}
          children={
            <CheckOutModal
              openProcessName={localLoadedProcessData?.ProcessName}
              setModalClosed={() => setAction(null)}
              modalType={MENUOPTION_CHECKOUT}
              projectName={processData.ProjectName}
              processDefId={localLoadedProcessData?.ProcessDefId}
              checkOutFunc={checkOutFunc}
            />
          }
        />
      ) : null}

      {action === MENUOPTION_DELETE &&
      processData?.ProcessType === PROCESSTYPE_LOCAL ? (
        <Modal
          show={
            action === MENUOPTION_DELETE &&
            processData?.ProcessType === PROCESSTYPE_LOCAL
          }
          style={{
            padding: "0",
            width: "33vw",
            left: "33%",
            top: "25%",
          }}
          hideBackdrop={true}
          modalClosed={() => setAction(null)}
          children={
            <DeleteDraftModal
              openProcessName={props.openProcessName}
              setModalClosed={() => setAction(null)}
              existingVersion={props.openProcessVersion}
              versionList={processData.Versions}
              projectId={props.processData.ProjectId}
              processDefId={props.processData.ProcessDefId}
            />
          }
        />
      ) : null}
      {action === MENUOPTION_DELETE &&
      (processData?.ProcessType === PROCESSTYPE_DEPLOYED ||
        processData?.ProcessType === PROCESSTYPE_REGISTERED) ? (
        <Modal
          show={
            action === MENUOPTION_DELETE &&
            (processData?.ProcessType === PROCESSTYPE_DEPLOYED ||
              processData?.ProcessType === PROCESSTYPE_REGISTERED)
          }
          style={{
            padding: "0",
            width: "33vw",
            left: "33%",
            top: "25%",
          }}
          hideBackdrop={true}
          modalClosed={() => setAction(null)}
          children={
            <DeleteDeployedModal
              openProcessName={props.openProcessName}
              setModalClosed={() => setAction(null)}
              existingVersion={props.openProcessVersion}
              versionList={processData.Versions}
              processDefId={props.processData.ProcessDefId}
            />
          }
        />
      ) : null}
      {action === MENUOPTION_DISABLE ? (
        <Modal
          show={action === MENUOPTION_DISABLE}
          style={{
            padding: "0",
            width: "33vw",
            left: "33%",
            top: "25%",
          }}
          hideBackdrop={true}
          modalClosed={() => setAction(null)}
          children={
            //code edited on 26 July 2022 for BugId 110024
            <DisableProcess
              setModalClosed={() => setAction(null)}
              modalType={MENUOPTION_DISABLE}
              processDefId={processData.ProcessDefId}
              setProcessData={setProcessData}
            />
          }
        />
      ) : null}
      {action === MENUOPTION_ENABLE ? (
        <Modal
          show={action === MENUOPTION_ENABLE}
          style={{
            padding: "0",
            width: "33vw",
            left: "33%",
            top: "25%",
          }}
          hideBackdrop={true}
          modalClosed={() => setAction(null)}
          children={
            //code edited on 26 July 2022 for BugId 110024
            <EnableProcess
              setModalClosed={() => setAction(null)}
              modalType={MENUOPTION_ENABLE}
              processDefId={processData.ProcessDefId}
              setProcessData={setProcessData}
            />
          }
        />
      ) : null}
      {action === MENUOPTION_SAVE_NEW_V ? (
        <Modal
          show={action === MENUOPTION_SAVE_NEW_V}
          style={{
            padding: "0",
            width: "33vw",
            left: "33%",
            top: "25%",
          }}
          hideBackdrop={true}
          modalClosed={() => setAction(null)}
          children={
            <SaveAsNewVersion
              setModalClosed={() => setAction(null)}
              modalType={MENUOPTION_SAVE_NEW_V}
              existingVersion={props.openProcessVersion}
              //processDefId={props.openProcessID}
              processDefId={localLoadedProcessData?.ProcessDefId} //Modified on 22/01/2024 for bug_id:142453
            />
          }
        />
      ) : null}
      {action === MENUOPTION_SAVE_LOCAL ? (
        <Modal
          show={action === MENUOPTION_SAVE_LOCAL}
          style={{
            padding: "0",
            width: "33vw",
            left: "33%",
            top: "25%",
          }}
          hideBackdrop={true}
          modalClosed={() => setAction(null)}
          children={
            <SaveAsNewDraft
              setModalClosed={() => setAction(null)}
              modalType={MENUOPTION_SAVE_LOCAL}
              existingVersion={props.openProcessVersion}
              openProcessName={props.openProcessName}
              commentMandatory={true}
            />
          }
        />
      ) : null}
      {action === MENUOPTION_DEPLOY ? (
        <Modal
          show={action === MENUOPTION_DEPLOY}
          style={{
            padding: "0",
            // width: "40vw",
            width: "40%",
            left: "30%",
            height: matchesTab ? "70vh" : "76vh",
            top: "5%",
          }}
          children={
            <DeployProcess
              setModalClosed={() => setAction(null)}
              buttonFrom={buttonFrom}
              showDeployModal={showDeployModal}
              setShowDeployModal={setShowDeployModal}
              setShowDeployFailModal={setShowDeployFailModal}
              errorVariables={errorVariables}
              setErrorVariables={setErrorVariables}
              warningVariables={warningVariables}
              setWarningVariables={setWarningVariables}
              toggleDrawer={() => toggleDrawer("top", false)}
              deploy="deploy" //Modified on 14/10/2023, bug_id:139402
            />
          }
        />
      ) : null}

      {/* ----------------------------- */}
      {showDeployModal ? (
        <Modal
          show={showDeployModal}
          style={{
            width: "395px",
            height: "235px",
            left: "40%",
            top: "25%",
            padding: "0",
          }}
          hideBackdrop={true}
          modalClosed={() => setShowDeployModal(false)}
          children={
            <ProcessDeployment
              toggleDrawer={() => toggleDrawer("bottom", false)}
              setShowDeployModal={setShowDeployModal}
              showDeployModal={showDeployModal}
            />
          }
        ></Modal>
      ) : null}
      {/* ---------------- */}
      {/* ----------------------------- */}
      {showDeployFailModal ? (
        <Modal
          show={showDeployFailModal}
          style={{
            width: "395px",
            height: "235px",
            left: "40%",
            top: "25%",
            padding: "0",
          }}
          hideBackdrop={true}
          modalClosed={() => setShowDeployFailModal(false)}
          children={
            <ProcessDeploymentFailed
              showDeployFailModal={showDeployFailModal}
              setShowDeployFailModal={() => {
                setShowDeployFailModal(false);
                toggleDrawer("bottom", true);
              }}
            />
          }
        ></Modal>
      ) : null}
      {/* ---------------- */}

      {showVersionHistory ? (
        <Modal
          show={showVersionHistory}
          style={{
            padding: "0",
            width: "60vw",
            height: "80vh",
            top: "10%",
            left: "20%",
          }}
          hideBackdrop={true}
          modalClosed={() => setshowVersionHistory(false)}
          children={
            <VersionHistory
              setModalClosed={() => setshowVersionHistory(false)}
              versionList={processData.Versions}
              projectName={processData.ProjectName}
              ProcessName={props.openProcessName}
              processType={processData?.ProcessType}
            />
          }
        />
      ) : null}

      {showTemplateModal ? (
        <Modal
          show={showTemplateModal}
          style={{
            width: "100vw",
            height: `calc(100% - ${APP_HEADER_HEIGHT})`,
            left: "0",
            top: `${APP_HEADER_HEIGHT}`,
            padding: "0",
          }}
          hideBackdrop={true}
          modalClosed={() => setShowTemplateModal(false)}
          children={
            <ProcessCreation
              moveBackFunction={() => setShowTemplateModal(false)}
              selectedTemplate={selectedTemplate}
              backBtnLabel="processCreationTemplate"
              noBackBtn={true}
              templatePage={PREVIOUS_PAGE_CREATE_FROM_TEMPLATE}
              category={category}
              view="list"
              setShowTemplateModal={setShowTemplateModal}
            />
          }
        />
      ) : null}

      {state["bottom"] ? (
        <Drawer
          anchor={"bottom"}
          open={state["bottom"]}
          onClose={() => toggleDrawer("bottom", false)}
          // hideBackdrop={true}
          BackdropProps={{ invisible: true }}
          ModalProps={{ hideBackdrop: true }}
        >
          {list("bottom")}
        </Drawer>
      ) : null}
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    openProcessID: state.openProcessClick.selectedId,
    openProcessName: state.openProcessClick.selectedProcessName,
    openProcessType: state.openProcessClick.selectedType,
    openProcessVersion: state.openProcessClick.selectedVersion,
    templateName: state.openTemplateReducer.templateName,
    openTemplateFlag: state.openTemplateReducer.openFlag,
  };
};

export default connect(mapStateToProps, null)(Header);
