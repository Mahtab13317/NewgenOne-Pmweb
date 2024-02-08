// To solve bug - Making comments mandatory while deploying process- 110015
// #BugID - 119046
// #BugDescription - Validated the displayname,prefix and suffix onpaste event.
// #BugID - 113513
// #BugDescription - Validated the sequnce number and threshold.
// #BugID - 110257
// #BugDescription -  Background color and separation line have been added.
// #BugID - 113259
// #BugDescription -  Removed comments from settings option.

import React, { useState, useEffect, useRef } from "react";
import classes from "./DeployProcess.module.css";
import { useTranslation } from "react-i18next";
import MenuItem from "@material-ui/core/MenuItem";
import Checkbox from "@material-ui/core/Checkbox";
import { store, useGlobalState } from "state-pool";
import InfoOutlinedIcon from "@material-ui/icons/InfoOutlined";
import CircularProgress from "@material-ui/core/CircularProgress";
import CloseIcon from "@material-ui/icons/Close";
import { connect, useDispatch, useSelector } from "react-redux";
import {
  SERVER_URL,
  REGISTRATION_NO,
  SEQUENCE_NO,
  ENDPOINT_GETREGISTRATIONPROPERTY,
  ENDPOINT_REGISTERPROCESS,
  ERROR_MANDATORY,
  ERROR_INCORRECT_FORMAT,
  SPACE,
  ENDPOINT_OPENPROCESS,
  APP_HEADER_HEIGHT,
} from "../../Constants/appConstants";
import axios from "axios";
import { FieldValidations } from "../../utility/FieldValidations/fieldValidations";
import { setToastDataFunc } from "../../redux-store/slices/ToastDataHandlerSlice";
import {
  PMWEB_ARB_REGEX,
  PMWEB_REGEX,
  REGEX,
  validateRegex,
} from "../../validators/validator";
import TextInput from "../../UI/Components_With_ErrrorHandling/InputField";
import SelectField from "../../UI/Components_With_ErrrorHandling/SelectField";
// import { encode_utf8 } from "../../utility/UTF8EncodeDecoder";
import { LightTooltip } from "../../UI/StyledTooltip";
import { handleKeyHelp, openWebHelpInPmWeb } from "../AppHeader/AppHeader";
import QuestionMarkIcon from "../../assets/HomePage/HS_Question Mark.svg";
import * as actionCreators from "../../redux-store/actions/processView/actions.js";
import {
  checkRegex,
  getIncorrectLenErrMsg,
  getIncorrectRegexErrMsg,
  isProcessDeployedFunc,
} from "../../utility/CommonFunctionCall/CommonFunctionCall";
import { Tooltip, useMediaQuery } from "@material-ui/core";

function DeployProcess(props) {
  let { t } = useTranslation();
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData, setlocalLoadedProcessData] =
    useGlobalState(loadedProcessData);
  const dispatch = useDispatch();
  const direction = `${t("HTML_DIR")}`;
  const [processName, setprocessName] = useState(
    localLoadedProcessData.ProcessName
  );
  const [displayName, setdisplayName] = useState(
    localLoadedProcessData.ProcessName
  );
  const [prefix, setprefix] = useState(t("prefix"));
  const [suffix, setsuffix] = useState(t("suffix"));
  const [regLength, setregLength] = useState(REGISTRATION_NO);
  const [startSeqNo, setstartSeqNo] = useState(SEQUENCE_NO);
  const [displayNameSuffix, setdisplayNameSuffix] = useState("001");
  const [type1PreviewValue, settype1PreviewValue] = React.useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [siteValues, setSiteValues] = useState(null);
  const [volumeValues, setVolumeValues] = useState(null);
  const [selectedSite, setSelectedSite] = useState(null);
  const [selectedVolume, setSelectedVolume] = useState(null);
  const [thresholdCount, setThresholdCount] = useState(null);
  const [secureFolderFlag, setSecureFolderFlag] = useState(null);
  const [createWSFlag, setCreateWSFlag] = useState(null);
  const [comment, setComment] = useState(null);
  const [error, setError] = useState({});
  const [commonError, setCommonError] = useState({});
  const [displayNameErr, setDisplayNameErr] = useState(null);
  const [thresholdErr, setThresholdErr] = useState(null);
  const [spinner, setSpinner] = useState(false);
  const arrProcessesData = store.getState("arrProcessesData");
  const [localArrProcessesData, setLocalArrProcessesData] =
    useGlobalState(arrProcessesData);
  const openProcessesArr = store.getState("openProcessesArr"); //array of keys of processdata stored
  const [localOpenProcessesArr, setLocalOpenProcessesArr] =
    useGlobalState(openProcessesArr);
  const displayNameRef = useRef();
  const prefixRef = useRef();
  const suffixRef = useRef();
  const thresholdRef = useRef();
  let { isReadOnly } = props;
  isReadOnly = isReadOnly || isProcessDeployedFunc(localLoadedProcessData);
  const matchesTab = useMediaQuery("(max-width:1140px)");
  const [clickSave, setClickSave] = useState(false);
  // changes added for bug_id: 134226
  const windowInnerHeight = useSelector(
    (state) => state.setWindowInnerHeight.windowInnerHeight
  );
  useEffect(() => {
    // code edited on 7 Nov 2022 for BugId 116221
    if (localLoadedProcessData.ProcessDefId) {
      axios
        .get(
          SERVER_URL +
            ENDPOINT_GETREGISTRATIONPROPERTY +
            `/${localLoadedProcessData.ProcessName}/${localLoadedProcessData.ProcessDefId}/${localLoadedProcessData.ProcessType}`
        )
        .then((res) => {
          setprefix(res?.data?.Registration?.RegPrefix);
          setsuffix(res?.data?.Registration?.RegSuffix);
          setregLength(res?.data?.Registration?.RegSeqLength);
          setdisplayName(res?.data?.Registration?.DisplayName);
          setSelectedSite(res?.data?.Registration?.SelectedSite);
          setstartSeqNo(res?.data?.Registration?.RegStartingNo);
          setSelectedVolume(res?.data?.Registration?.SelectedVolume);
          setThresholdCount(res?.data?.Registration?.ThreshHoldCount);
          setSiteValues(res?.data?.Site);
          setVolumeValues(res?.data?.Volume);
          setSecureFolderFlag(
            res?.data?.Registration?.ISSecureFolder == "N" ? false : true
          );
          setCreateWSFlag(
            res?.data?.Registration?.CreateWS == "N" ? false : true
          );
          setIsLoading(false);
        });
    }
  }, [localLoadedProcessData?.ProcessDefId]);

  useEffect(() => {
    setIsLoading(true);
  }, [localLoadedProcessData?.ProcessDefId]);

  useEffect(() => {
    let zeroes = "";
    let temp =
      regLength - prefix.length - suffix.length - 2 < 10
        ? 10
        : regLength - prefix.length - suffix.length - 2;
    // code commented on 26-05-2023 due to checkmarx issues
    /* for (let i = 0; i < temp; i++) {
      zeroes = zeroes + "0";
    }*/
    // code added for above functionality on 26-05-2023 due to checkmarx issues

    Array(temp)
      .fill(0)
      .forEach((zero) => {
        zeroes = zeroes + `${zero}`;
      });

    let startSeqNoLen = startSeqNo?.toString().length;
    settype1PreviewValue(
      startSeqNoLen !== 0
        ? prefix +
            "-" +
            zeroes.slice(0, -startSeqNoLen) +
            startSeqNo +
            "-" +
            suffix
        : prefix + "-" + zeroes.slice(0, -1) + startSeqNo + "-" + suffix
    );
  }, [prefix, suffix, regLength, startSeqNo]);

  useEffect(() => {
    let displayZeroes = "000";
    let startSeqNoLen = startSeqNo ? startSeqNo.toString().length : 0;
    let num =
      startSeqNoLen !== 0
        ? displayZeroes.slice(0, -startSeqNoLen) + startSeqNo
        : displayZeroes;
    setdisplayNameSuffix(num);
  }, [startSeqNo]);

  useEffect(() => {
    let num = prefix.length + suffix.length + 12;
    setregLength(num);
  }, [prefix, suffix]);

  const handleOnLoseFocus = (e) => {
    if (
      e.target.name === "regLengthInput" &&
      regLength < prefix.length + suffix.length + 12
    ) {
      setregLength(prefix.length + suffix.length + 12);
    }
  };

  // Function to scroll to bottom of the div.
  const scrollToBottom = (id) => {
    const element = document.getElementById(id);
    element.scrollTop = element.scrollHeight;
  };

  // added on 08/09/2023 for BugId 136621
  useEffect(() => {
    if (
      Object.keys(error).length > 0 ||
      Object.keys(commonError).length > 0 ||
      displayNameErr ||
      thresholdErr //added on 25/09/2023 for BugId 135228
    ) {
      let errorObj = validateDeployDetails();
      setError(errorObj);
    }
  }, [processName, startSeqNo, comment, selectedSite, selectedVolume]);

  // added on 08/09/2023 for BugId 136621
  const validateDeployDetails = (ignoreComment = false) => {
    let errorObj = {};
    if (!processName || processName?.trim() === "" || processName === null) {
      errorObj = {
        ...errorObj,
        processName: {
          statement: t("pleaseEnterAProcessName"),
          severity: "error",
          errorType: ERROR_MANDATORY,
        },
      };
    } else if (!validateRegex(processName, REGEX.AlphaNumUsSpace)) {
      errorObj = {
        ...errorObj,
        processName: {
          statement:
            t("onlyAlphanumericWithSpaceAndUnderscoreAllowed") +
            SPACE +
            t("in") +
            SPACE +
            t("ProcessName"),
          severity: "error",
          errorType: ERROR_INCORRECT_FORMAT,
        },
      };
    }

    if (startSeqNo?.toString()?.trim() === "") {
      errorObj = {
        ...errorObj,
        seqNo: {
          statement: t("defineSeq"),
          severity: "error",
          errorType: ERROR_MANDATORY,
        },
      };
    }

    if ((comment?.trim() === "" || comment === null) && !ignoreComment) {
      errorObj = {
        ...errorObj,
        comment: {
          statement: t("enterComment"),
          severity: "error",
          errorType: ERROR_MANDATORY,
        },
      };
    }
    if (!selectedSite || selectedSite === null || +selectedSite === -1) {
      errorObj = {
        ...errorObj,
        selectedSite: {
          statement: t("pleaseSelectSiteDetails"),
          severity: "error",
          errorType: ERROR_MANDATORY,
        },
      };
    }
    if (!selectedVolume || selectedVolume === null || +selectedVolume === -1) {
      errorObj = {
        ...errorObj,
        selectedVolume: {
          statement: t("pleaseSelectVolumeDetails"),
          severity: "error",
          errorType: ERROR_MANDATORY,
        },
      };
    }

    return errorObj;
  };

  // code edited on 30 Nov 2022 for BugId 119556,110819,119555
  const deployProcessHandler = () => {
    scrollToBottom("contentDiv");
    let errorObj = {},
      prefixSuffixError = {},
      displayNameError = null;

    // modified on 08/09/2023 for BugId 136621
    errorObj = validateDeployDetails();
    // modified on 31/08/2023 for BugId 134813
    if (suffix?.trim() === "" && prefix?.trim() === "") {
      prefixSuffixError = {
        ...prefixSuffixError,
        prefixSuffix: t("BothPrefixSuffixEmptyError"),
      };
    }
    // modified on 31/08/2023 for BugId 134813
    if (displayName?.trim() === "") {
      displayNameError = t("defineDisplayName");
    } else if (
      displayName?.trim() !== "" &&
      !checkRegex(
        displayName,
        PMWEB_REGEX.Prefix_Suffix_Display_Name,
        PMWEB_ARB_REGEX.Prefix_Suffix_Display_Name
      )
    ) {
      displayNameError = getIncorrectRegexErrMsg(
        "displayName",
        t,
        t("SPACE") + SPACE + `# & * + \\ | : ' " < > ? , .` // modified on 12/09/2023 for BugId 136797
      );
    } else if (displayName?.trim() !== "" && displayName?.length > 20) {
      displayNameError = getIncorrectLenErrMsg("displayName", 20, t);
    }

    // modified on 31/08/2023 for BugId 134813
    if (
      Object.keys(errorObj).length > 0 ||
      Object.keys(prefixSuffixError).length > 0 ||
      displayNameError !== null
    ) {
      if (Object.keys(errorObj).length > 0) setError(errorObj);
      if (Object.keys(prefixSuffixError).length)
        setCommonError(prefixSuffixError);
      if (displayNameError !== null) setDisplayNameErr(displayNameError);
    } else {
      setSpinner(true);
      const obj = {
        processDefId: props.openProcessID,
        processState: props.openProcessType,
        regPrefix: prefix,
        regSuffix: suffix,
        regStarNo: startSeqNo,
        regSeqLength: regLength,
        regThreshHold: thresholdCount,
        m_bCreateWS: createWSFlag,
        strDisplayName: displayName,
        m_bSecureFolder: secureFolderFlag,
        m_sSeletedSite: selectedSite ? selectedSite : "",
        m_sSelectedVolume: selectedVolume ? selectedVolume : "",
        strDefaultStartID: "1",
        deploy: true,
        pMProcessOperationInfo: {
          processDefId: props.openProcessID,
          action: "RE",
          processName: props.openProcessName,
          displayName: displayName,
          newProcessName: processName,
          // comment: encode_utf8(comment), // Commented until further discussion
          comment: comment,
          processVariantType: props.openProcessType,
          bNewVersion: false,
        },
      };

      axios
        .post(SERVER_URL + ENDPOINT_REGISTERPROCESS, obj)
        .then(async (res) => {
          setError({});
          // code added on 30 September 2022 for BugId 116474
          const temp = res?.data?.Error?.filter((el) => {
            return el.ErrorLevel == "E";
          });

          if (res?.data?.Status === 0 && (!temp || temp?.length === 0)) {
            props.setErrorVariables([]);
            if (props.setShowDeployModal) {
              props.toggleDrawer();
              await axios
                .get(
                  SERVER_URL +
                    ENDPOINT_OPENPROCESS +
                    res.data.ProcessDefId +
                    "/" +
                    props.openProcessName +
                    "/" +
                    "R"
                )
                .then((res) => {
                  if (res.data.Status === 0) {
                    let newProcessData = { ...res.data.OpenProcess };
                    let localArrIdx;
                    localArrProcessesData.forEach((d, idx) => {
                      if (+d.ProcessDefId === +props.openProcessID) {
                        localArrIdx = idx;
                      }
                    });
                    const updatedArr = localArrProcessesData.filter(
                      (d) => +d.ProcessDefId !== +props.openProcessID
                    );
                    updatedArr.splice(localArrIdx, 0, {
                      ProcessDefId: newProcessData.ProcessDefId,
                      ProcessType: newProcessData.ProcessType,
                      ProcessName: newProcessData.ProcessName,
                      ProjectName: newProcessData.ProjectName,
                      VersionNo: newProcessData.VersionNo,
                      ProcessVariantType: newProcessData.ProcessVariantType,
                      isProcessActive: true,
                    });
                    let temp = [...localOpenProcessesArr];
                    let idx = localOpenProcessesArr.indexOf(
                      `${props.openProcessID}#${props.openProcessType}`
                    );
                    temp.splice(idx, 1);
                    temp.splice(idx, 0, `${newProcessData.ProcessDefId}#R`);
                    setLocalOpenProcessesArr(temp);
                    setLocalArrProcessesData(updatedArr);
                    setlocalLoadedProcessData(newProcessData);
                    // added on 27/09/2023 for BugId 138518
                    dispatch(
                      actionCreators.openProcessClick(
                        newProcessData?.ProcessDefId,
                        newProcessData.ProjectName,
                        newProcessData.ProcessType,
                        newProcessData.VersionNo,
                        newProcessData?.ProcessName
                      )
                    );
                    //till here BugId 138518
                    props.setModalClosed();
                    props.setShowDeployModal(true);
                  }
                })
                .catch((err) => {
                  console.log(err);
                });
            }
          } else if (res.data.Status === 0 && temp?.length > 0) {
            props.setErrorVariables(temp);
            props.toggleDrawer();
            if (props.setShowDeployFailModal) {
              props.setShowDeployFailModal(true);
            }
            props.setModalClosed();
          }
          setSpinner(false);
        });
    }
  };

  // code edited on 1 Dec 2022 for BugId 119556,110819,119555
  const saveProcessHandler = () => {
    setClickSave(true);
    let errorObj = {},
      prefixSuffixError = {},
      displayNameError = null;

    // modified on 08/09/2023 for BugId 136621
    errorObj = validateDeployDetails(true);
    // modified on 31/08/2023 for BugId 134813
    if (suffix?.trim() === "" && prefix?.trim() === "") {
      prefixSuffixError = {
        ...prefixSuffixError,
        prefixSuffix: t("BothPrefixSuffixEmptyError"),
      };
    }
    // modified on 31/08/2023 for BugId 134813
    if (displayName?.trim() === "") {
      displayNameError = t("defineDisplayName");
    } else if (
      displayName?.trim() !== "" &&
      !checkRegex(
        displayName,
        PMWEB_REGEX.Prefix_Suffix_Display_Name,
        PMWEB_ARB_REGEX.Prefix_Suffix_Display_Name
      )
    ) {
      displayNameError = getIncorrectRegexErrMsg(
        "displayName",
        t,
        t("SPACE") + SPACE + `# & * + \\ | : ' " < > ? , .` // modified on 12/09/2023 for BugId 136797
      );
    } else if (displayName?.trim() !== "" && displayName?.length > 20) {
      displayNameError = getIncorrectLenErrMsg("displayName", 20, t);
    }

    // modified on 31/08/2023 for BugId 134813
    if (
      Object.keys(errorObj).length > 0 ||
      Object.keys(prefixSuffixError).length > 0 ||
      displayNameError !== null
    ) {
      if (Object.keys(errorObj).length > 0) setError(errorObj);
      if (Object.keys(prefixSuffixError).length)
        setCommonError(prefixSuffixError);
      if (displayNameError !== null) setDisplayNameErr(displayNameError);
    } else {
      const obj = {
        processDefId: props.openProcessID,
        processState: props.openProcessType,
        regPrefix: prefix,
        regSuffix: suffix,
        regStarNo: startSeqNo,
        regSeqLength: regLength,
        regThreshHold: thresholdCount,
        m_bCreateWS: createWSFlag,
        strDisplayName: displayName,
        m_bSecureFolder: secureFolderFlag,
        m_sSeletedSite: selectedSite,
        m_sSelectedVolume: selectedVolume,
        strDefaultStartID: "1",
        deploy: false,
      };

      axios.post(SERVER_URL + ENDPOINT_REGISTERPROCESS, obj).then((res) => {
        if (res.status === 200) {
          setError({});
          if (props.setShowDeployModal) {
            props.setShowDeployModal(true);
          } else {
            dispatch(
              setToastDataFunc({
                message: t("processSavedSuccessfully"),
                severity: "success",
                open: true,
              })
            );
          }
        }
      });
    }
  };

  function isNegative(num) {
    if (Math.sign(num) === -1) {
      return true;
    }

    return false;
  }

  const startSeqHandler = (e) => {
    if (isNegative(e.target.value)) {
      dispatch(
        setToastDataFunc({
          message: t("posNum"),
          severity: "error",
          open: true,
        })
      );
      setstartSeqNo("");
      return false;
    }

    if (e.target.value.toString().length <= 10) {
      setstartSeqNo(e.target.value);
    }
  };

  const handleThresholdCount = (e) => {
    // modified on 25/09/2023 for BugId 135228
    // if (isNegative(e.target.value)) {
    //   dispatch(
    //     setToastDataFunc({
    //       message: t("posNum"),
    //       severity: "error",
    //       open: true,
    //     })
    //   );
    //   setThresholdCount("");
    //   return false;
    // }

    // if (e.target.value > 100) {
    //   setThresholdCount(100);
    // } else {
    //   setThresholdCount(e.target.value);
    // }
    let inputVal = e.target.value;
    if (inputVal === "") {
      setThresholdCount("");
      return;
    }
    //Bug138976 :- Provided the condition to paste only 4 characters.
    if (inputVal.length > 4) {
      inputVal = inputVal.slice(0, 4);
    }

    let error = null;
    if (isNegative(inputVal)) {
      error = t("posNum");
    } else if (!validateRegex(inputVal, REGEX.IntegerPositive)) {
      error = t("pleaseEnterTCInNumeric");
    }

    setThresholdErr(error);
    setThresholdCount(inputVal);
  };
  // modified on 31/08/2023 for BugId 134813
  const validateData = (e, val) => {
    let prefixSuffixError = {};
    let newVal = val.toLowerCase();
    let tempPrefix = prefix,
      tempSuffix = suffix;

    if (newVal === "prefix") {
      tempPrefix = e.target.value;
    } else if (newVal === "suffix") {
      tempSuffix = e.target.value;
    }

    if (tempPrefix?.trim() === "" && tempSuffix?.trim() === "") {
      prefixSuffixError = {
        ...prefixSuffixError,
        prefixSuffix: t("BothPrefixSuffixEmptyError"),
      };
    } else {
      let checkPrefixRegex = checkRegex(
        tempPrefix,
        PMWEB_REGEX.Prefix_Suffix_Display_Name,
        PMWEB_ARB_REGEX.Prefix_Suffix_Display_Name
      );
      let checkSuffixRegex = checkRegex(
        tempSuffix,
        PMWEB_REGEX.Prefix_Suffix_Display_Name,
        PMWEB_ARB_REGEX.Prefix_Suffix_Display_Name
      );
      if (
        (tempPrefix?.trim() !== "" && !checkPrefixRegex) ||
        (tempSuffix?.trim() !== "" && !checkSuffixRegex)
      ) {
        //Added on: 30-05-2023 for BUGID: 126813
        if (
          tempPrefix?.trim() !== "" &&
          !checkPrefixRegex &&
          tempSuffix?.trim() !== "" &&
          !checkSuffixRegex
        ) {
          prefixSuffixError = {
            ...prefixSuffixError,
            //added % in regex for bug_id:139714
            prefixSuffix: getIncorrectRegexErrMsg(
              "bothPrefixAndSuffix",
              t,
              t("SPACE") + SPACE + `# % & * + \\ | : ' " < > ? , .` // modified on 12/09/2023 for BugId 136797
            ),
          };
        } else if (tempPrefix?.trim() !== "" && !checkPrefixRegex) {
          prefixSuffixError = {
            ...prefixSuffixError,
            //added % in regex for bug_id:139714
            prefix: getIncorrectRegexErrMsg(
              "prefix",
              t,
              t("SPACE") + SPACE + `# % & * + \\ | : ' " < > ? , .` // modified on 12/09/2023 for BugId 136797
            ),
          };
        } else if (tempSuffix?.trim() !== "" && !checkSuffixRegex) {
          prefixSuffixError = {
            ...prefixSuffixError,
            //added % in regex for bug_id:139714
            suffix: getIncorrectRegexErrMsg(
              "suffix",
              t,
              t("SPACE") + SPACE + `# % & * + \\ | : ' " < > ? , .` // modified on 12/09/2023 for BugId 136797
            ),
          };
        }
      } else if (
        (tempPrefix?.trim() !== "" && tempPrefix?.length > 20) ||
        (tempSuffix?.trim() !== "" && tempSuffix?.length > 20)
      ) {
        //Added on: 30-05-2023 for BUGID: 126813
        if (
          tempPrefix?.trim() !== "" &&
          tempPrefix?.length > 20 &&
          tempSuffix?.trim() !== "" &&
          tempSuffix?.length > 20
        ) {
          prefixSuffixError = {
            ...prefixSuffixError,
            prefixSuffix: getIncorrectLenErrMsg("bothPrefixAndSuffix", 20, t),
          };
        } else if (tempPrefix?.trim() !== "" && tempPrefix?.length > 20) {
          prefixSuffixError = {
            ...prefixSuffixError,
            prefix: getIncorrectLenErrMsg("prefix", 20, t),
          };
        } else if (tempSuffix?.trim() !== "" && tempSuffix?.length > 20) {
          prefixSuffixError = {
            ...prefixSuffixError,
            suffix: getIncorrectLenErrMsg("suffix", 20, t),
          };
        }
      }
    }
    setCommonError(prefixSuffixError);
  };

  // added on 31/08/2023 for BugId 134813
  const validateDisplayName = (e) => {
    let dNErr = null;
    let tempDN = e.target.value;

    if (tempDN?.trim() === "") {
      dNErr = t("defineDisplayName");
    } else if (
      tempDN?.trim() !== "" &&
      !checkRegex(
        tempDN,
        PMWEB_REGEX.Prefix_Suffix_Display_Name,
        PMWEB_ARB_REGEX.Prefix_Suffix_Display_Name
      )
    ) {
      //added % in regex for bug_id:139714
      dNErr = getIncorrectRegexErrMsg(
        "displayName",
        t,
        t("SPACE") + SPACE + `# % & * + \\ | : ' " < > ? , .` // modified on 12/09/2023 for BugId 136797
      );
    } else if (tempDN?.trim() !== "" && tempDN?.length > 20) {
      dNErr = getIncorrectLenErrMsg("displayName", 20, t);
    }
    setDisplayNameErr(dNErr);
  };

  return isLoading ? (
    <CircularProgress className="circular-progress" />
  ) : (
    <div
      className={classes.mainDiv}
      style={{
        height:
          props.deployFrom == "Settings"
          // changes added for bug_id: 134226
            ? `calc(${windowInnerHeight}px - ${APP_HEADER_HEIGHT} - 11.125rem)`
            : matchesTab
            ? "60vh"
            : "68vh",
      }} //code updated on 15 Dec 2022 for BugId 120135
    >
      {props.deployFrom == "Settings" ? null : (
        <div className={classes.header}>
          <p className={classes.deployProcessHeading}>{t("deployProcess")}</p>
          <div style={{ display: "flex", gap: "0.25vw", alignItems: "center" }}>
            {/*Code added on 06-09-23 for Bug 135403 */}
            <Tooltip title={t("help")}>
              <img
                src={QuestionMarkIcon}
                style={{
                  width: "1.25rem",
                  height: "1.25rem",
                  cursor: "pointer",
                }}
                alt="Help"
                onClick={() => openWebHelpInPmWeb("?rhmapno=1410")}
                tabIndex={0}
                onKeyDown={(e) => handleKeyHelp(e, "?rhmapno=1410")}
                id="pmweb_DeployProcess_helpIcon"
              />
            </Tooltip>
            {/* Till here */}
            <CloseIcon
              id="pmweb_DeployProcess_CloseModalIcon"
              onClick={props.setModalClosed}
              style={{
                height: "1.25rem",
                width: "1.25rem",
                cursor: "pointer",
              }}
            />
          </div>
        </div>
      )}
      {props.deployFrom == "Settings" ? null : <hr className={classes.hrTag} />}

      <div
        id="contentDiv"
        className={classes.contentDiv}
        style={{
          paddingTop: props.deployFrom == "Settings" ? "0px" : "0.5rem",
          backgroundColor: "white",
        }}
      >
        <div
          className={
            props.deployFrom == "Settings"
              ? classes.fieldsDivSettings
              : classes.fieldsDiv
          }
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              whiteSpace: "nowrap",
            }}
          >
            <p className={classes.fieldsName}>
              {t("processC")}
              {SPACE}
              {t("name")}
            </p>
            <span className={classes.starIcon}>*</span>
          </div>
          <TextInput
            inputValue={processName}
            ariaLabel={"Process Name"}
            classTag={classes.processNameInput}
            onChangeEvent={(e) => setprocessName(e.target.value)}
            name="processName"
            idTag="pmweb_DeployProcess_ProcessName"
            regexStr={REGEX.AlphaNumUsSpace}
            readOnlyCondition={isReadOnly || props.deployFrom ? true : false}
            errorStatement={error?.processName?.statement}
            errorSeverity={error?.processName?.severity}
            errorType={error?.processName?.errorType}
            inlineError={true}
            disabled={isReadOnly}
            inlineErrorStyles={classes.inlineErrorStyle}
          />
        </div>
        {/*  <p
          className={classes.fieldsName}
          style={{
            opacity: "0.7",
            marginTop: "1rem",
          }}
        >
          {t("workItemIdDetails")}
        </p> */}
        <div
          className={
            props.deployFrom === "Settings"
              ? classes.fieldsDivSettings
              : classes.fieldsDiv
          }
        >
          <div style={{ display: "flex", flexDirection: "row" }}>
            <p
              className={classes.fieldsName}
              style={{
                opacity: "0.7",
                marginTop: "1rem",
              }}
            >
              {t("workItemIdDetails")}
            </p>
          </div>
          <div style={{ width: "70%", marginTop: "20px" }}>
            <hr
              className={classes.hrTag}
              style={{ outline: "#0000000D solid 0.0313rem" }}
            />
          </div>
        </div>
        <div
          className={
            props.deployFrom == "Settings"
              ? classes.fieldsDivSettings
              : classes.fieldsDiv
          }
        >
          <div style={{ display: "flex", flexDirection: "row" }}>
            <p className={classes.fieldsName}>
              {t("startSeqNo")}
              <span className={classes.starIcon}>*</span>
            </p>
            {/* <span className={classes.starIcon}>*</span> */}
          </div>
          {/* <input
            value={startSeqNo}
            type="number"
            onChange={(e) => startSeqHandler(e)}
            className={classes.processNameInput}
            name="seqNo"
            id="seqNo"
          /> */}
          <TextInput
            inputValue={startSeqNo}
            ariaLabel={"Starting Sequence Number"}
            classTag={classes.processNameInput}
            onChangeEvent={(e) => startSeqHandler(e)}
            onBlurEvent={(e) => {
              handleOnLoseFocus(e);
            }}
            name="Starting Sequence Number"
            idTag="pmweb_DeployProcess_SequenceNumber"
            style={{
              // width: "7vw",
              fontSize: "var(--base_text_font_size)",
              color: "#606060",
            }}
            errorStatement={error?.seqNo?.statement}
            errorSeverity={error?.seqNo?.severity}
            errorType={error?.seqNo?.errorType}
            inlineError={true}
            type="number"
            readOnlyCondition={isReadOnly}
            inlineErrorStyles={classes.inlineErrorStyle}
          />
        </div>

        <div
          className={
            props.deployFrom == "Settings"
              ? classes.fieldsDivSettings
              : classes.fieldsDiv
          }
          style={{
            background: "#0072C621",
            padding: "0.625rem 0.5vw",
            alignItems: props.deployFrom == "Settings" ? "start" : "center",
          }}
        >
          <p
            style={{
              fontSize: "var(--sub_text_font_size)",
              textAlign: "left",
              color: "#606060",
            }}
          >
            {t("deployProcessDesc")}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: props.deployFrom == "Settings" ? "row" : "column",
            alignItems: props.deployFrom == "Settings" ? "start" : "",
          }}
        >
          <div
            className={
              props.deployFrom == "Settings"
                ? classes.fieldsDivSettings
                : classes.fieldsDiv
            }
            style={{
              width: props.deployFrom == "Settings" ? "80%" : "100%",
              flexDirection: "column",
              background: "#0000000D",
              marginRight: direction === "rtl" ? "0px" : "15px",
            }}
          >
            <div className={{ display: "flex", flexDirection: "column" }}>
              <p className={classes.type1text}>{t("type1Preview")}</p>
              <p className={classes.helperText}>{t("type1TextDeploy")}</p>
            </div>
            <div
              style={{
                color: "#606060",
                padding: "5px",
                fontSize: "12px",
                fontWeight: "600px",
              }}
            >
              {type1PreviewValue}
            </div>
            <hr
              className={classes.hrTag}
              style={{
                outline: "#0000000D solid 0.0313rem",
                width: "93%",
                margin: "5px 0.5vw",
              }}
            />
            {/*   <input
              
              className={`${classes.processNameInput} ${classes.preview}`}
              value={type1PreviewValue}
              style={{
                width: "100%",
                fontSize: "0.85rem",
                fontWeight: "bolder",
                color: "#606060",
                border: "none",
                borderBottom: "1px solid rgba(86, 71, 71, 0.33)",
              }}
              disabled={true}
            /> */}

            <div
              style={{
                display: "flex",
                width: "100%",
                margin: "0",
                justifyContent: "space-between",
                padding: "0.5rem 0.5vw",
              }}
            >
              <div style={{ display: "flex", flexDirection: "row" }}>
                <p className={classes.fieldsName}>
                  {t("prefix")} / {t("suffix")}
                </p>
                {/* commented on 31/08/2023 for BugId 134813 */}
                {/* <span className={classes.starIcon}>*</span> */}
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "0.5vw",
                }}
              >
                {/* Added on: 30-05-2023 for BUGID: 126813 */}
                {/* <TextInput
                  inputValue={prefix}
                  classTag={classes.processNameInput}
                  onChangeEvent={(e) => setprefix(e.target.value)}
                  onBlurEvent={(e) => {
                    handleOnLoseFocus(e);
                  }}
                  name="prefix"
                  idTag="deploy_prefix"
                  style={{
                    width: "7vw",
                    fontSize: "var(--base_text_font_size)",
                    color: "#606060",
                  }}
                  inputRef={prefixRef}
                  onKeyPress={(e) =>
                    FieldValidations(e, 160, prefixRef.current, 20)
                  }
                  onPaste={(e) => {
                    setTimeout(() => validateData(e, "prefix"), 200);
                  }}
                  errorStatement={error?.prefix?.statement}
                  errorSeverity={error?.prefix?.severity}
                  errorType={error?.prefix?.errorType}
                  inlineError={true}
                  readOnlyCondition={isReadOnly}
                /> */}
                <input
                  value={prefix}
                  aria-label="Prefix"
                  className={classes.processNameInput}
                  onChange={(e) => {
                    // modified on 31/08/2023 for BugId 134813
                    validateData(e, "Prefix");
                    setprefix(e.target.value);
                  }}
                  onBlur={(e) => {
                    handleOnLoseFocus(e);
                  }}
                  name="prefix"
                  id="pmweb_DeployProcess_Prefix"
                  style={{
                    width: "7vw",
                    fontSize: "var(--base_text_font_size)",
                    color: "#606060",
                    // added on 31/08/2023 for BugId 134813
                    border:
                      commonError?.prefixSuffix || commonError?.prefix
                        ? "1px solid #b52a2a"
                        : "1px solid #d3caca",
                  }}
                  ref={prefixRef}
                  onKeyPress={(e) =>
                    FieldValidations(e, 181, prefixRef.current, 20)
                  }
                  // modified on 31/08/2023 for BugId 134813
                  disabled={isReadOnly}
                />
                <p
                  style={{
                    fontSize: "var(--title_text_font_size)",
                    marginTop: "3px",
                  }}
                >
                  /
                </p>
                {/* Added on: 30-05-2023 for BUGID: 126813 */}
                {/* <TextInput
                  inputValue={suffix}
                  classTag={classes.processNameInput}
                  onChangeEvent={(e) => setsuffix(e.target.value)}
                  onBlurEvent={(e) => {
                    handleOnLoseFocus(e);
                  }}
                  name="suffix"
                  idTag="deploy_suffix"
                  style={{
                    width: "7vw",
                    fontSize: "var(--base_text_font_size)",
                    color: "#606060",
                  }}
                  inputRef={suffixRef}
                  onKeyPress={(e) =>
                    FieldValidations(e, 160, suffixRef.current, 20)
                  }
                  onPaste={(e) => {
                    setTimeout(() => validateData(e, "suffix"), 200);
                  }}
                  errorStatement={error?.suffix?.statement}
                  errorSeverity={error?.suffix?.severity}
                  errorType={error?.suffix?.errorType}
                  inlineError={true}
                  readOnlyCondition={isReadOnly}
                /> */}
                <input
                  value={suffix}
                  aria-label="Suffix"
                  className={classes.processNameInput}
                  onChange={(e) => {
                    // modified on 31/08/2023 for BugId 134813
                    validateData(e, "Suffix");
                    setsuffix(e.target.value);
                  }}
                  onBlur={(e) => {
                    handleOnLoseFocus(e);
                  }}
                  name="suffix"
                  id="pmweb_DeployProcess_Suffix"
                  style={{
                    width: "7vw",
                    fontSize: "var(--base_text_font_size)",
                    color: "#606060",
                    // added on 31/08/2023 for BugId 134813
                    border:
                      commonError?.prefixSuffix || commonError?.suffix
                        ? "1px solid #b52a2a"
                        : "1px solid #d3caca",
                  }}
                  ref={suffixRef}
                  onKeyPress={(e) =>
                    FieldValidations(e, 181, suffixRef.current, 20)
                  }
                  // modified on 31/08/2023 for BugId 134813
                  disabled={isReadOnly}
                />
              </div>
            </div>
            {/* added on 31/08/2023 for BugId 134813 */}
            <div
              style={{
                display: "flex",
                justifyContent: "end",
                width: "100%",
                marginTop: "-0.25rem",
                marginBottom: "0.25rem",
              }}
            >
              <p
                style={{
                  color: "#b52a2a",
                  font: "normal normal 600 11px/16px Open Sans",
                  padding: "0 0.5vw",
                  width: "44%",
                }}
              >
                {commonError?.prefixSuffix ||
                  commonError?.prefix ||
                  commonError?.suffix}
              </p>
            </div>
            <div
              style={{
                display: "flex",
                width: "100%",
                margin: "0",
                justifyContent: "space-between",
                padding: "0.5rem 0.5vw",
              }}
            >
              <div style={{ display: "flex", flexDirection: "row" }}>
                <p className={classes.fieldsName}>{t("regLength")}</p>
                <span className={classes.starIcon}>*</span>
              </div>
              <input
                id="pmweb_DeployProcess_RegLength"
                aria-label="Registration Length"
                name="regLengthInput"
                value={regLength}
                onBlur={handleOnLoseFocus}
                onChange={(e) => setregLength(e.target.value)}
                className={classes.processNameInput}
                style={{
                  fontSize: "0.85rem",
                  color: "#606060",
                  marginLeft: "0.625rem",
                }}
                disabled={true} //code edited on 05 Dec 2022 for BugId 113020
              />
            </div>
          </div>

          <div
            className={
              props.deployFrom == "Settings"
                ? classes.fieldsDivSettings
                : classes.fieldsDiv
            }
            style={{
              width: props.deployFrom == "Settings" ? "80%" : "100%",
              flexDirection: "column",
              background: "#0000000D",
            }}
          >
            <p className={classes.type1text}>{t("type2Preview")}</p>
            <p className={classes.helperText}>{t("type2TextDeploy")}</p>
            {/* <input
              readOnly
              value={displayName + "-" + displayNameSuffix}
              className={classes.processNameInput}
              style={{
                width: "100%",
                border: "none",
                borderBottom: "1px solid rgba(86, 71, 71, 0.33)",
              }}
            /> */}
            <div
              style={{
                color: "#606060",
                padding: "5px",
                fontSize: "12px",
                fontWeight: "600px",
              }}
            >
              {displayName + "-" + displayNameSuffix}
            </div>
            <hr
              className={classes.hrTag}
              style={{
                outline: "#0000000D solid 0.0313rem",
                width: "93%",
                margin: "5px 0.5vw",
              }}
            />
            <div
              style={{
                display: "flex",
                width: "100%",
                margin: "0",
                justifyContent: "space-between",
                padding: "0.5rem 0.5vw",
              }}
            >
              <div style={{ display: "flex", flexDirection: "row" }}>
                <p className={classes.fieldsName}>{t("displayName")}</p>
                <span className={classes.starIcon}>*</span>
              </div>
              {/* Added on: 30-05-2023 for BUGID: 126813 */}
              {/* <TextInput
                inputValue={displayName}
                classTag={classes.processNameInput}
                onChangeEvent={(e) => setdisplayName(e.target.value)}
                onBlurEvent={(e) => {
                  handleOnLoseFocus(e);
                }}
                name="displayName"
                idTag="deploy_displayName"
                style={{
                  fontSize: "var(--base_text_font_size)",
                  color: "#606060",
                }}
                inputRef={displayNameRef}
                onKeyPress={(e) =>
                  FieldValidations(e, 160, displayNameRef.current, 20)
                }
                onPaste={(e) => {
                  setTimeout(() => validateData(e, "displayName"), 200);
                }}
                errorStatement={error?.displayName?.statement}
                errorSeverity={error?.displayName?.severity}
                errorType={error?.displayName?.errorType}
                inlineError={true}
                readOnlyCondition={isReadOnly}
              /> */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <input
                  value={displayName}
                  aria-label="Display Name"
                  className={classes.processNameInput}
                  onChange={(e) => {
                    // modified on 31/08/2023 for BugId 134813
                    validateDisplayName(e);
                    setdisplayName(e.target.value);
                  }}
                  onBlur={(e) => {
                    handleOnLoseFocus(e);
                  }}
                  name="displayName"
                  id="pmweb_DeployProcess_DisplayName"
                  style={{
                    fontSize: "var(--base_text_font_size)",
                    color: "#606060",
                    // added on 31/08/2023 for BugId 134813
                    border: displayNameErr
                      ? "1px solid #b52a2a"
                      : "1px solid #d3caca",
                  }}
                  ref={displayNameRef}
                  onKeyPress={(e) =>
                    FieldValidations(e, 181, displayNameRef.current, 20)
                  }
                  // modified on 31/08/2023 for BugId 134813
                  disabled={isReadOnly}
                />
              </div>
            </div>
            {/* added on 31/08/2023 for BugId 134813 */}
            {/*  <div
              style={{
                display: "flex",
                justifyContent: "end",
                width: "100%",
                marginTop: "-0.25rem",
                marginBottom: "0.25rem",
              }}
            >
              <p
                style={{
                  color: "#b52a2a",
                  font: "normal normal 600 11px/16px Open Sans",
                  padding: "0 0.5vw",
                  width: "44%",
                }}
              >
                {displayNameErr}
              </p>
            </div> */}
            {/*Modified on 14/10/2023, bug_id:139402  */}
            <div
              style={{
                width: "100%",
                display: "flex",
                marginTop: "-0.25rem",
                marginBottom: "0.25rem",
                justifyContent: "space-evenly",
              }}
            >
              <div style={{ width: "50%" }}></div>
              <div style={{ width: "50%" }}>
                <p
                  style={{
                    color: "#b52a2a",
                    font: "normal normal 600 11px/16px Open Sans",
                    padding: props?.deploy ? "0 2.75vw" : "0 4vw",
                  }}
                >
                  {displayNameErr}
                </p>
              </div>
            </div>
            {/*Modified on 14/10/2023, bug_id:139402  */}
          </div>
        </div>
        <div
          className={
            props.deployFrom == "Settings"
              ? classes.fieldsDivSettings
              : classes.fieldsDiv
          }
          style={{ flexDirection: "column" }}
        >
          {/*  <p
            className={classes.fieldsName}
            style={{ opacity: "0.8", marginBottom: "0.25rem" }}
          >
            {t("processDocStorageDetails")}
          </p> */}
          <div style={{ display: "flex", flexDirection: "row" }}>
            <div
              className={classes.fieldsName}
              style={{ opacity: "0.8", marginBottom: "0.25rem", width: "60%" }}
            >
              {" "}
              {t("processDocStorageDetails")}
            </div>
            <div style={{ width: "60%", marginTop: "10px" }}>
              {" "}
              <hr
                className={classes.hrTag}
                style={{ outline: "#0000000D solid 0.0313rem" }}
              />
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: props.deployFrom == "Settings" ? "row" : "column",
              marginBottom: props.deployFrom == "Settings" ? "15px" : "0px",
              alignItems: props.deployFrom == "Settings" ? "center" : "none",
            }}
          >
            <div
              style={{
                display: "flex",
                width: "100%",
                flexDirection:
                  props.deployFrom == "Settings" ? "column" : "row",
                margin: "0",
                padding: "0.5rem 0",
                justifyContent: "space-between",
                backgroundColor: "rgba(181,42,42,0)",
              }}
            >
              {/* code edited on 30 Nov 2022 for BugId 119556 */}
              <p className={classes.fieldsName}>
                {t("site")}
                <span className={classes.starIcon}>*</span>
              </p>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <SelectField
                  id="pmweb_DeployProcess_Site"
                  className={classes.dropDown}
                  defaultValue={1}
                  MenuProps={{
                    anchorOrigin: {
                      vertical: "bottom",
                      horizontal: "left",
                    },
                    transformOrigin: {
                      vertical: "top",
                      horizontal: "left",
                    },
                    getContentAnchorEl: null,
                  }}
                  value={selectedSite}
                  onChange={(e) => setSelectedSite(e.target.value)}
                  includesEmptyStatement={true}
                  validateError={error?.selectedSite ? true : false}
                  disabled={isReadOnly}
                >
                  {siteValues?.map((site) => {
                    return (
                      <MenuItem
                        style={{ width: "100%", padding: "0.5rem" }} //code edited on 13 Dec 2022 for BugId 110951
                        value={site.Id}
                      >
                        <p
                          style={{
                            fontSize: "var(--base_text_font_size",
                            fontFamily: "var(--font_family)",
                          }}
                        >
                          {site.SiteName}
                        </p>
                      </MenuItem>
                    );
                  })}
                </SelectField>
                {(!selectedSite ||
                  selectedSite === null ||
                  +selectedSite === -1) && (
                  <p
                    style={{
                      color: "#b52a2a",
                      font: "normal normal 600 11px/16px Open Sans",
                    }}
                  >
                    {error?.selectedSite?.statement}
                  </p>
                )}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                width: "100%",
                flexDirection:
                  props.deployFrom == "Settings" ? "column" : "row",
                margin: "0",
                padding: "0.5rem 0",
                justifyContent: "space-between",
              }}
            >
              {/* code edited on 30 Nov 2022 for BugId 119556 */}
              <p className={classes.fieldsName}>
                {t("volume")}
                <span className={classes.starIcon}>*</span>
              </p>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <SelectField
                  id="pmweb_DeployProcess_Volume"
                  className={classes.dropDown}
                  defaultValue={1}
                  MenuProps={{
                    anchorOrigin: {
                      vertical: "bottom",
                      horizontal: "left",
                    },
                    transformOrigin: {
                      vertical: "top",
                      horizontal: "left",
                    },
                    getContentAnchorEl: null,
                  }}
                  value={selectedVolume}
                  onChange={(e) => setSelectedVolume(e.target.value)}
                  includesEmptyStatement={true}
                  validateError={error.selectedVolume ? true : false}
                  disabled={isReadOnly}
                >
                  {volumeValues?.map((volume) => {
                    if (volume.HomeSite == selectedSite) {
                      return (
                        <MenuItem
                          style={{ width: "100%", padding: "0.5rem" }} //code edited on 13 Dec 2022 for BugId 110951
                          value={volume.VolumeIndex}
                        >
                          <p
                            style={{
                              fontSize: "var(--base_text_font_size",
                              fontFamily: "var(--font_family)",
                            }}
                          >
                            {volume.VolumeName}
                          </p>
                        </MenuItem>
                      );
                    }
                  })}
                </SelectField>
                {(!selectedVolume ||
                  selectedVolume === null ||
                  +selectedVolume === -1) && (
                  <p
                    style={{
                      color: "#b52a2a",
                      font: "normal normal 600 11px/16px Open Sans",
                    }}
                  >
                    {error?.selectedVolume?.statement}
                  </p>
                )}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                width: "62%",
                margin: "0",
                gap: props.deployFrom == "Settings" ? "1vw" : "0",
                justifyContent:
                  props.deployFrom == "Settings" ? "none" : "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", flexDirection: "row" }}>
                <p className={classes.fieldsName}>{t("secureFolder")}</p>
                <LightTooltip
                  id="pmweb_DeployProcess_SecureFolderTooltip"
                  arrow={true}
                  placement="bottom-start"
                  title={t("secureFolderTooltipMessage")}
                >
                  <InfoOutlinedIcon className={classes.infoIcon} />
                </LightTooltip>
              </div>
              <Checkbox
                id="pmweb_DeployProcess_SecureFolderFlag"
                inputProps={{ "aria-label": "Secure folder" }}
                checked={secureFolderFlag ? true : false}
                onChange={(e) => setSecureFolderFlag(!secureFolderFlag)}
                disabled={isReadOnly}
              />
            </div>
          </div>
          <div
            className={
              props.deployFrom == "Settings"
                ? classes.fieldsSettingsDiv
                : classes.fieldsDiv
            }
            style={{ flexDirection: "column" }}
          >
            <p className={classes.fieldsName} style={{ opacity: "0.8" }}>
              {t("otherDetails")}
            </p>
            <div
              style={{
                display: "flex",
                flexDirection:
                  props.deployFrom == "Settings" ? "row" : "column",
                alignItems: props.deployFrom == "Settings" ? "center" : "none",
              }}
            >
              <div
                className={
                  props.deployFrom == "Settings"
                    ? classes.fieldsSettingsDiv
                    : classes.fieldsDiv
                }
                style={{
                  width: "62%",
                  marginTop: props.deployFrom == "Settings" ? "0" : "0.75rem",
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", flexDirection: "row" }}>
                  <p className={classes.fieldsName}>{t("createWebservice")}</p>
                  {/* Bug 124548 background of the tool tip message should be same
                  throughout the module : [03-03-2023] Added the LightTooltip & Removed ToolTip */}
                  <LightTooltip
                    id="pmweb_DeployProcess_WebServiceTooltip"
                    arrow={true}
                    placement="bottom-start"
                    title={t("createWebserviceDesc")}
                  >
                    <InfoOutlinedIcon className={classes.infoIcon} />
                  </LightTooltip>
                  {/* <Tooltip
                    disableFocusListener
                    title={t("createWebserviceDesc")}
                    placement="right"
                  >
                    <InfoOutlinedIcon className={classes.infoIcon} />
                  </Tooltip> */}
                </div>
                <Checkbox
                  id="pmweb_DeployProcess_CreateWebServiceFlag"
                  inputProps={{
                    "aria-label": "Create Webservice",
                  }}
                  checked={createWSFlag ? true : false}
                  onChange={() => setCreateWSFlag(!createWSFlag)}
                  disabled={isReadOnly}
                />
              </div>
              <div
                className={
                  props.deployFrom == "Settings"
                    ? classes.fieldsSettingsDiv
                    : classes.fieldsDiv
                }
                style={{
                  marginTop: props.deployFrom == "Settings" ? "0" : "0.5rem",
                  alignItems:
                    props.deployFrom == "Settings" ? "center" : "none",
                  gap: props.deployFrom == "Settings" ? "2vw" : "0",
                }}
              >
                <div style={{ display: "flex", flexDirection: "row" }}>
                  <p
                    className={classes.fieldsName}
                    style={{
                      marginTop: "0.1rem",
                    }}
                  >
                    {t("thresholdCount")}
                  </p>
                  {/* Bug 124548 background of the tool tip message should be same
                  throughout the module : [03-03-2023] Added the LightTooltip & Removed ToolTip */}
                  <LightTooltip
                    id="pmweb_DeployProcess_ThresholdCountDesc"
                    arrow={true}
                    placement="bottom-start"
                    title={t("thresholdCountDesc")}
                  >
                    <InfoOutlinedIcon className={classes.infoIcon} />
                  </LightTooltip>
                  {/* <Tooltip
                    disableFocusListener
                    title={t("thresholdCountDesc")}
                    placement="right"
                  >
                    <InfoOutlinedIcon
                      className={classes.infoIcon}
                      style={{ marginTop: "0.1rem" }}
                    />
                  </Tooltip> */}
                </div>
                <div
                  style={{
                    display: "flex",
                    width: "15.5vw",
                    flexDirection: "column",
                  }}
                >
                  <input
                    aria-label="Threshold Count"
                    id="pmweb_DeployProcess_ThresholdCount"
                    className={classes.processNameInput}
                    style={{
                      border: thresholdErr
                        ? "1px solid #b52a2a"
                        : "1px solid #d3caca",
                    }}
                    value={thresholdCount}
                    onChange={(e) => handleThresholdCount(e)}
                    disabled={isReadOnly}
                    ref={thresholdRef}
                    //Bug138976 : commented the type="number"- There was an issue with e8 etc. while pasting
                    //type="number" // modified on 31/08/2023 for BugId 135228
                    onKeyPress={(e) =>
                      FieldValidations(e, 131, thresholdRef.current, 4)
                    }
                  />
                  {thresholdErr !== null && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "start",
                        width: "100%",
                      }}
                    >
                      <p
                        style={{
                          color: "#b52a2a",
                          font: "normal normal 600 11px/16px Open Sans",
                        }}
                      >
                        {thresholdErr}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              {props.deployFrom !== "Settings" && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "row" }}>
                    <p className={classes.fieldsName}>{t("comment")}</p>
                    <span className={classes.starIcon}>*</span>
                  </div>
                  <TextInput
                    inputValue={comment}
                    ariaLabel={"Comment"}
                    classTag={classes.processNameInput}
                    onChangeEvent={(e) => {
                      setComment(e.target.value);
                    }}
                    name="comment"
                    idTag="pmweb_DeployProcess_Comment"
                    style={{
                      width: "100%",
                      height: "56px",
                    }}
                    errorStatement={error?.comment?.statement}
                    errorSeverity={error?.comment?.severity}
                    errorType={error?.comment?.errorType}
                    inlineError={true}
                    inlineErrorStyles={classes.inlineErrorStyle}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {!isReadOnly && (
        <div
          className={
            props.deployFrom == "Settings"
              ? classes.footerDivSettings
              : classes.footerDiv
          }
          style={{
            padding: direction === "rtl" ? "0.25rem 10px" : "0.25rem 0",
          }}
        >
          {props.deployFrom === "Settings" ? (
            <button
              id="pmweb_DeployProcess_SaveBtn"
              className={classes.buttons}
              style={{
                backgroundColor: "var(--button_color)",
                cursor: "pointer",
              }}
              onClick={() => saveProcessHandler()}
            >
              {t("save")}
            </button>
          ) : (
            <button
              id="pmweb_DeployProcess_Save&DeployBtn"
              className={
                props.buttonFrom === "DeployHeader"
                  ? classes.DeploynSaveButton
                  : classes.buttons
              }
              style={{
                backgroundColor: "var(--button_color)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
              // modified on 31/08/2023 for BugId 134813
              disabled={
                spinner ||
                Object.keys(error).length > 0 ||
                Object.keys(commonError).length > 0 ||
                displayNameErr ||
                thresholdErr // added on 25/09/2023 for BugId 135228
              }
              onClick={() => deployProcessHandler()}
            >
              {spinner ? (
                <>
                  <CircularProgress
                    style={{
                      width: "1rem",
                      height: "1rem",
                      color: "white",
                      marginInline: "5px",
                    }}
                  />
                  {props.buttonFrom === "DeployHeader"
                    ? t("saveAndDeploy")
                    : t("Deploy")}
                </>
              ) : props.buttonFrom === "DeployHeader" ? (
                t("saveAndDeploy")
              ) : (
                t("Deploy")
              )}
            </button>
          )}
          <button
            id="pmweb_DeployProcess_CancelBtn"
            onClick={props.setModalClosed}
            className={classes.buttons}
            style={{
              color: "#606060",
              border: "1px solid #C4C4C4",
              cursor: "pointer",
            }}
          >
            {t("cancel")}
          </button>
        </div>
      )}
    </div>
  );
}

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
    templateId: state.openTemplateReducer.templateId,
    templateName: state.openTemplateReducer.templateName,
    openTemplateFlag: state.openTemplateReducer.openFlag,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DeployProcess);
