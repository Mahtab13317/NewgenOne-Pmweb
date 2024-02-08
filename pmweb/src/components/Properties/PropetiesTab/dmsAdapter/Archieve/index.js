// Made changes to solve bug ID - 111180, 112972 , 111162 and 111182
// Changes made to solve Bug 112972 - DMS Adapter -> after connection established no success or failure message
import React, { useState, useEffect, useRef } from "react";
import "./index.css";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { MenuItem, IconButton } from "@material-ui/core";
import Checkbox from "@material-ui/core/Checkbox";
import { store, useGlobalState } from "state-pool";
import { addConstantsToString } from "../../../../../utility/ProcessSettings/Triggers/triggerCommonFunctions";
import { FormControlLabel } from "@material-ui/core";
import FieldMapping from "./FieldMapping.js";
import { setToastDataFunc } from "../../../../../redux-store/slices/ToastDataHandlerSlice";
import {
  SERVER_URL,
  ARCHIEVE_CONNECT,
  ARCHIEVE_DISCONNECT,
  ASSOCIATE_DATACLASS_MAPPING,
  propertiesLabel,
  RTL_DIRECTION,
  SPACE,
} from "../../../../../Constants/appConstants";
import {
  ActivityPropertyChangeValue,
  setActivityPropertyChange,
} from "../../../../../redux-store/slices/ActivityPropertyChangeSlice";
import {
  ActivityPropertySaveCancelValue,
  setSave,
} from "../../../../../redux-store/slices/ActivityPropertySaveCancelClicked.js";
import Modal from "../../../../../UI/Modal/Modal";
import { connect, useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { FieldValidations } from "../../../../../utility/FieldValidations/fieldValidations";
import {
  isArabicLocaleSelected,
  isReadOnlyFunc,
  restrictSpecialCharacter,
} from "../../../../../utility/CommonFunctionCall/CommonFunctionCall";
import MappingIcon from "../../../../../assets/MappingIcon.svg";
import {
  decode_utf8,
  encode_utf8,
} from "../../../../../utility/UTF8EncodeDecoder";
import encryptMessage from "./../../../../../utility/RSAEncypt";
import { LatestVersionOfProcess } from "../../../../../utility/abstarctView/checkLatestVersion";
import CustomizedDropdown from "../../../../../UI/Components_With_ErrrorHandling/Dropdown";
import secureLocalStorage from "react-secure-storage";
import TabsHeading from "../../../../../UI/TabsHeading";

function DMSAdapter(props) {
  let { t } = useTranslation();
  const dispatch = useDispatch();
  const direction = `${t("HTML_DIR")}`;
  const [errorMsg, setErrorMsg] = useState("");
  const allTabStatus = useSelector(ActivityPropertyChangeValue);
  const loadedActivityPropertyData = store.getState("activityPropertyData");
  const [localLoadedActivityPropertyData, setlocalLoadedActivityPropertyData] =
    useGlobalState(loadedActivityPropertyData);
  const [userName, setUserName] = useState();
  const [password, setPassword] = useState("");
  const [cabinet, setCabinet] = useState(null);
  const [disabledBeforeConnect, setDisabledBeforeConnect] = useState(true);
  const [associateDataClass, setAssociateDataClass] = useState(null);
  const [associateDataClassList, setAssociateDataClassList] = useState([]);
  const [assDataClassMappingList, setAssDataClassMappingList] = useState([]);
  const [archieveDataClass, setArchieveDataClass] = useState();
  const [isConnected, setIsConnected] = useState(false);
  const [workItemCheck, setWorkItemCheck] = useState(
    localLoadedActivityPropertyData?.ActivityProperty?.archiveInfo
      ?.m_bDeleteWorkitemAudit
  );
  const [showAssDataClassMapping, setShowAssDataClassMapping] = useState(false);
  const [folderNameInput, setFolderNameInput] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const saveCancelStatus = useSelector(ActivityPropertySaveCancelValue);
  const [showRedBorder, setShowRedBorder] = useState(false);
  const [mapType, setMapType] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [docCheck, setDocCheck] = useState({});
  const [folderName, setFolderName] = useState("");
  // changes added for bug_id: 134226
  const windowInnerHeight = useSelector(
    (state) => state.setWindowInnerHeight.windowInnerHeight
  );

  let defaultDocList = [
    {
      DocName: "Conversation",
      DocTypeId: "-998",
    },
    {
      DocName: "Audit Trail",
      DocTypeId: "-999",
    },
  ];

  const [docList, setDocList] = useState(defaultDocList);
  const [disconnectBody, setDisconnectBody] = useState(null);
  const usernameRef = useRef();
  const folderRef = useRef();
  const docListRef = useRef([]);
  const workItemCheckRef = useRef();
  const locale = secureLocalStorage.getItem("locale");

  let isReadOnly =
    props.openTemplateFlag ||
    isReadOnlyFunc(
      localLoadedProcessData,
      props.cellCheckedOut,
      props.cellLaneId
    ) ||
    LatestVersionOfProcess(localLoadedProcessData?.Versions) !==
      +localLoadedProcessData?.VersionNo; // modified on 05/09/2023 for BugId 136103;

  // commented on 31/08/2023 for Bug 133125 - regression>>inappropriate message when DMS
  // saved without folder name
  // useEffect(() => {
  //   if (!folderName) {
  //     dispatch(
  //       setActivityPropertyChange({
  //         [propertiesLabel.archieve]: {
  //           isModified: allTabStatus[propertiesLabel.archieve]?.isModified,
  //           hasError: true,
  //         },
  //       })
  //     );
  //   } else {
  //     dispatch(
  //       setActivityPropertyChange({
  //         [propertiesLabel.archieve]: {
  //           isModified: allTabStatus[propertiesLabel.archieve]?.isModified,
  //           hasError: false,
  //         },
  //       })
  //     );
  //   }
  // }, [folderName]);

  useEffect(() => {
    if (saveCancelStatus.SaveOnceClicked) {
      // code edited on 27 Jan 2023 for BugId 121979
      if (
        localLoadedActivityPropertyData?.ActivityProperty?.archiveInfo?.userName?.trim() ===
          "" ||
        localLoadedActivityPropertyData?.ActivityProperty?.archiveInfo?.authCred?.trim() ===
          ""
      ) {
        setShowRedBorder(true);
      } else if (
        !localLoadedActivityPropertyData?.ActivityProperty?.archiveInfo
          ?.folderInfo?.folderName ||
        localLoadedActivityPropertyData?.ActivityProperty?.archiveInfo?.folderInfo?.folderName?.trim() ===
          ""
      ) {
        dispatch(
          setToastDataFunc({
            message: t("folderNameCantBeEmpty"),
            severity: "error",
            open: true,
          })
        );
      } else if (!checkMappingValidation()?.isValid) {
        dispatch(
          setToastDataFunc({
            message:
              checkMappingValidation()?.docName === "assDataClass"
                ? t("mapAssociatedDataClass")
                : t("mapAssociatedDocuments"),
            severity: "error",
            open: true,
          })
        );
      }
      // commented on 04/10/23 for BugId 136296 - swimlane/activity checkout>>when window is closed
      // even when the data is saved still one more pop up appears for save changes
      /* else {
        dispatch(
          setActivityPropertyChange({
            [propertiesLabel.archive]: { isModified: true, hasError: false },
          })
        );
      } */
      dispatch(setSave({ SaveClicked: false }));
    }
  }, [saveCancelStatus.SaveClicked]);

  const checkMappingValidation = () => {
    let isValid = true;
    let docName = null;
    if (
      localLoadedActivityPropertyData?.ActivityProperty?.archiveInfo.folderInfo
        .assoDataClsName &&
      localLoadedActivityPropertyData?.ActivityProperty?.archiveInfo.folderInfo
        .fieldMappingInfoList.length == 0
    ) {
      return { isValid: false, docName: "assDataClass" };
    }

    let docList =
      localLoadedActivityPropertyData?.ActivityProperty?.archiveInfo
        ?.docTypeInfo?.docTypeDCMapList;
    if (!docList || docList?.length == 0) {
      return { isValid: true };
    }
    localLoadedActivityPropertyData?.ActivityProperty?.archiveInfo?.docTypeInfo?.docTypeDCMapList?.forEach(
      (doc) => {
        if (
          !doc.m_arrFieldMappingInfo ||
          doc?.m_arrFieldMappingInfo?.length == 0
        ) {
          isValid = false;
          docName = doc.docTypeName;
        }
      }
    );
    return { isValid: isValid, docName: docName };
  };

  useEffect(() => {
    let tempLocal = JSON.parse(JSON.stringify(localLoadedProcessData));
    let tempDoclist = [...tempLocal?.DocumentTypeList, ...defaultDocList];
    setDocList(tempDoclist);
  }, [localLoadedProcessData]);

  useEffect(() => {
    if (localLoadedActivityPropertyData) {
      setUserName(
        localLoadedActivityPropertyData?.ActivityProperty?.archiveInfo?.userName
      );
      let dropList = [];
      setWorkItemCheck(
        localLoadedActivityPropertyData?.ActivityProperty?.archiveInfo
          ?.m_bDeleteWorkitemAudit
      );

      dropList.push({
        dataDefName:
          localLoadedActivityPropertyData?.ActivityProperty?.archiveInfo
            ?.folderInfo.assoDataClsName,
        dataDefIndex:
          localLoadedActivityPropertyData?.ActivityProperty?.archiveInfo
            ?.folderInfo.assoDataClsId,
      });

      setCabinet(
        localLoadedActivityPropertyData?.ActivityProperty?.archiveInfo
          ?.cabinetName
      );
      setFolderNameInput(
        localLoadedActivityPropertyData?.ActivityProperty?.archiveInfo
          ?.folderInfo?.folderName
      );
      setAssociateDataClass(
        localLoadedActivityPropertyData?.ActivityProperty?.archiveInfo
          ?.folderInfo?.assoDataClsName
      );

      let checkObj = {};
      docList?.map((el) => {
        checkObj = {
          ...checkObj,
          [el.DocTypeId]: { check: false, selectedVal: null },
        };
      });
      localLoadedActivityPropertyData?.ActivityProperty?.archiveInfo?.docTypeInfo?.docTypeDCMapList?.forEach(
        (el) => {
          checkObj = {
            ...checkObj,
            [el.docTypeId]: { check: true, selectedVal: el.assocDCId },
          };
          dropList.push({
            dataDefName: el.assocDCName,
            dataDefIndex: el.assocDCId,
          });
        }
      );
      if (disabledBeforeConnect) {
        setAssociateDataClassList(dropList);
      }
      setDocCheck(checkObj);
      // validation
      // code edited on 27 Jan 2023 for BugId 121979
      if (
        localLoadedActivityPropertyData?.ActivityProperty?.archiveInfo?.userName?.trim() ==
          "" ||
        localLoadedActivityPropertyData?.ActivityProperty?.archiveInfo?.authCred?.trim() ==
          "" ||
        !localLoadedActivityPropertyData?.ActivityProperty?.archiveInfo
          ?.folderInfo?.folderName ||
        localLoadedActivityPropertyData?.ActivityProperty?.archiveInfo?.folderInfo?.folderName?.trim() ===
          "" ||
        !checkMappingValidation()?.isValid ||
        errorMsg
      ) {
        dispatch(
          setActivityPropertyChange({
            [propertiesLabel.archive]: {
              isModified: allTabStatus[propertiesLabel.archive].isModified,
              hasError: true,
            },
          })
        );
      } else {
        dispatch(
          setActivityPropertyChange({
            [propertiesLabel.archive]: {
              isModified: allTabStatus[propertiesLabel.archive].isModified,
              hasError: false,
            },
          })
        );
      }
    }
  }, [localLoadedActivityPropertyData]);

  const containsSpecialChars = (str) => {
    var regex = new RegExp(/\.*[^\\\/\:\*\?\"\|\']\.*$/gm);

    return !regex.test(str);
  };

  // Changes made to solve Bug 130730
  const validateData = (e, val) => {
    if (containsSpecialChars(e.target.value)) {
      setErrorMsg(`${t("AllCharactersAreAllowedExcept")} ! _ ? / \ - . : `);
    } else {
      setErrorMsg("");
    }
    if (e.target.value == "") {
      setErrorMsg(false);
    }
  };
  // till here

  const handleFolderSelection = (value) => {
    setFolderName(value);
    setFolderNameInput((prev) => {
      return addConstantsToString(prev, value.VariableName);
    });
    setShowDropdown(false);
    // code edited on 13 Feb 2023 for BugId 121979
    let temp = JSON.parse(JSON.stringify(localLoadedActivityPropertyData));
    temp.ActivityProperty.archiveInfo.folderInfo.folderName = encode_utf8(
      decode_utf8(addConstantsToString(folderNameInput, value.VariableName))
    );
    setlocalLoadedActivityPropertyData(temp);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.archive]: { isModified: true, hasError: false },
      })
    );
  };

  const handleAssDataClassMapping = (associateDataClass, type, document) => {
    setMapType(type);
    if (!associateDataClass && type == "associate") {
      setShowRedBorder(true);
      setAssociateDataClass(null);
    } else if (!associateDataClass && type == "archeive") {
      setShowRedBorder(true);
      // setAssociateDataClass(null);
    }

    if (type == "archeive") {
      setSelectedDoc(document);
    }
    let dataDefIndex =
      type == "associate"
        ? localLoadedActivityPropertyData?.ActivityProperty?.archiveInfo
            ?.folderInfo?.assoDataClsId
        : associateDataClass;
    associateDataClassList &&
      associateDataClassList.map((assDataClass) => {
        if (
          assDataClass.dataDefName == associateDataClass ||
          assDataClass.dataDefIndex == associateDataClass
        ) {
          dataDefIndex = assDataClass.dataDefIndex;
        }
      });
    axios
      .post(SERVER_URL + ASSOCIATE_DATACLASS_MAPPING, {
        dataDefinitionIndex: dataDefIndex,
        dmsAuthentication: disconnectBody?.DMSAuthentication,
      })
      .then((res) => {
        if (res?.data?.Status === 0) {
          setAssDataClassMappingList(res.data.DataDefinition);
          setShowAssDataClassMapping(true);
        } else {
          // Changes made to solve Bug 122236 - Regression>>DMS: appropriate message should appear instead of not found and some error occurred
          dispatch(
            setToastDataFunc({
              message: t("selectAssociatedDataClass"),
              severity: "error",
              open: true,
            })
          );
        }
      });
  };

  const handleDocCheck = (id, index, name) => {
    let tempCheck = { ...docCheck };
    tempCheck[id].check = !tempCheck[id].check;
    if (!tempCheck[id].check) {
      tempCheck[id].selectedVal = null;
      // code edited on 13 Feb 2023 for BugId 121979
      let temp = JSON.parse(JSON.stringify(localLoadedActivityPropertyData));
      let tempDocList = [
        ...temp?.ActivityProperty?.archiveInfo?.docTypeInfo?.docTypeDCMapList,
      ];
      let newIdx = null;
      tempDocList?.forEach((doc, idx) => {
        if (doc.docTypeId === id) {
          newIdx = idx;
        }
      });
      temp.ActivityProperty.archiveInfo.docTypeInfo.docTypeDCMapList.splice(
        newIdx,
        1
      );
      setlocalLoadedActivityPropertyData(temp);
      // code added on 23 Feb 2023 for BugId 124167
      dispatch(
        setActivityPropertyChange({
          [propertiesLabel.archive]: { isModified: true, hasError: false },
        })
      );
    } else {
      // code edited on 13 Feb 2023 for BugId 121979
      let temp = JSON.parse(JSON.stringify(localLoadedActivityPropertyData));
      temp.ActivityProperty.archiveInfo.docTypeInfo.docTypeDCMapList.push({
        assocDCId: "",
        assocDCName: "",
        docTypeId: id,
        docTypeName: name,
        m_arrFieldMappingInfo: [],
      });
      setlocalLoadedActivityPropertyData(temp);
    }
    setDocCheck(tempCheck);
  };

  const handleCabinetChange = (value) => {
    // code edited on 13 Feb 2023 for BugId 121979
    let temp = JSON.parse(JSON.stringify(localLoadedActivityPropertyData));
    temp.ActivityProperty.archiveInfo.cabinetName = value;
    setlocalLoadedActivityPropertyData(temp);
  };

  const handlePasswordChange = (event) => {
    // code edited on 13 Feb 2023 for BugId 121979
    let temp = JSON.parse(JSON.stringify(localLoadedActivityPropertyData));
    temp.ActivityProperty.archiveInfo.authCred = encryptMessage(
      event.target.value
    );
    setlocalLoadedActivityPropertyData(temp);
    setPassword(event.target.value);
  };

  const handleAssociateClassChange = (e) => {
    let tempIndex;
    associateDataClassList.map((el) => {
      if (el.dataDefName == e.target.value) {
        tempIndex = el.dataDefIndex;
      }
    });
    setAssociateDataClass(e.target.value);
    // code edited on 13 Feb 2023 for BugId 121979
    let temp = JSON.parse(JSON.stringify(localLoadedActivityPropertyData));
    temp.ActivityProperty.archiveInfo.folderInfo.assoDataClsName =
      e.target.value;
    temp.ActivityProperty.archiveInfo.folderInfo.assoDataClsId = tempIndex;
    setlocalLoadedActivityPropertyData(temp);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.archive]: { isModified: true, hasError: false },
      })
    );
  };

  const handleCheckBoxChange = (e) => {
    setWorkItemCheck(!workItemCheck);
    // code edited on 13 Feb 2023 for BugId 121979
    let temp = JSON.parse(JSON.stringify(localLoadedActivityPropertyData));
    temp.ActivityProperty.archiveInfo.m_bDeleteWorkitemAudit = !workItemCheck;
    setlocalLoadedActivityPropertyData(temp);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.archive]: { isModified: true, hasError: false },
      })
    );
  };

  const handleUserChange = (e) => {
    let toastMsg = "";
    let isValid = true;
    const restrictChars = "(^+%{}'\"~?^:#!/&|=*;,[]<>`)";
    if (isArabicLocaleSelected()) {
      isValid = restrictSpecialCharacter(
        e.target.value,
        "[~`!@#$%^&*()\\-+={}\\[\\]|\\\\:\";'<>?,.//]+"
      );

      toastMsg = `${t("userName")}${SPACE}${t(
        "cannotContain"
      )}${SPACE}${restrictChars}${SPACE}${t("charactersInIt")}`;
    } else {
      var pattern = /^[a-zA-Z\d\_]+$/i;
      isValid = pattern.test(e.target.value);
      toastMsg = `${t("usernameErrorMsg")} ${t("in")} ${t("userName")}`;
    }

    if (!isValid && e.target.value.length > 0) {
      dispatch(
        setToastDataFunc({
          message: toastMsg,
          severity: "error",
          open: true,
        })
      );
    } else if (e.target.value.length > 255) {
      toastMsg = `${t("lengthValString")}`;
      dispatch(
        setToastDataFunc({
          message: toastMsg,
          severity: "error",
          open: true,
        })
      );
    } else {
      setUserName(e.target.value);
      // code edited on 13 Feb 2023 for BugId 121979
      let temp = JSON.parse(JSON.stringify(localLoadedActivityPropertyData));
      temp.ActivityProperty.archiveInfo.userName = e.target.value;
      setlocalLoadedActivityPropertyData(temp);
    }
  };

  // code edited on 07 mar 2023 for BugId 124546
  const handleConnectDisconnect = () => {
    let jsonBody = {
      username: userName,
      //  authcode: password,
      authcode: encryptMessage(password),
      cabinetname:
        localLoadedActivityPropertyData.ActivityProperty.archiveInfo
          .cabinetName,
    };
    if (!isConnected) {
      // if (userName === "") {
      //   dispatch(
      //     setToastDataFunc({
      //       message: "Please enter username",
      //       severity: "error",
      //       open: true,
      //     })
      //   );
      // } else if (password === "") {
      //   dispatch(
      //     setToastDataFunc({
      //       message: "Please enter password",
      //       severity: "error",
      //       open: true,
      //     })
      //   );
      // } else {
      if (
        // Added on 24-05-2023 for BUGID: 126832
        // localLoadedActivityPropertyData?.ActivityProperty?.archiveInfo?.userName?.trim() ==
        //   "" ||
        // localLoadedActivityPropertyData?.ActivityProperty?.archiveInfo?.authCred?.trim() ==
        //   ""
        localLoadedActivityPropertyData?.ActivityProperty?.archiveInfo?.userName?.trim() ==
          "" ||
        localLoadedActivityPropertyData?.ActivityProperty?.archiveInfo?.authCred?.trim() ==
          "" ||
        userName === "" ||
        password === ""
      ) {
        setShowRedBorder(true);
      } else {
        axios.post(SERVER_URL + ARCHIEVE_CONNECT, jsonBody).then((res) => {
          if (res?.data?.Status === 0) {
            dispatch(
              setToastDataFunc({
                message: t("connectedSuccess"),
                severity: "success",
                open: true,
              })
            );
            setDisconnectBody({
              DMSAuthentication: res.data.DMSAuthentication,
            });
            setIsConnected(true);
            // code edited on 13 Feb 2023 for BugId 121979
            let temp = JSON.parse(
              JSON.stringify(localLoadedActivityPropertyData)
            );
            temp.ActivityProperty.archiveInfo.dmsAuthentication =
              res.data.DMSAuthentication;
            setlocalLoadedActivityPropertyData(temp);
            setDisabledBeforeConnect(false);
            let arrList = [];
            res?.data?.DataDefinitions?.map((data) => {
              arrList.push({
                dataDefName: data.DataDefName,
                dataDefIndex: data.DataDefIndex,
              });
            });
            setAssociateDataClassList(arrList);
            dispatch(
              setActivityPropertyChange({
                [propertiesLabel.archive]: {
                  isModified: true,
                  // modified on 31/08/2023 for Bug 133125 - regression>>inappropriate message
                  // when DMS saved without folder name
                  hasError: allTabStatus[propertiesLabel.archive].hasError,
                },
              })
            );
          }
        });
      }
      // }
    } else {
      axios.post(SERVER_URL + ARCHIEVE_DISCONNECT, disconnectBody).then(() => {
        dispatch(
          setToastDataFunc({
            message: t("disconnedSuccess"),
            severity: "success",
            open: true,
          })
        );
        setIsConnected(false);
      });
    }
  };

  let collapseContent = () => {
    return (
      <div>
        <div
          className="dropDownSelectLabelDMS"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "14px",
          }}
        >
          <p id="archieve_cabinet">{t("cabinet")}</p>
          <div>
            <CustomizedDropdown
              className="dropDownSelect"
              ariaLabel="Select Cabinet"
              id="pmweb_dms_cabinet"
              style={{
                //  marginRight: "10px",
                //   marginLeft: props.isDrawerExpanded ? "99px" : "94px",
                //  width: "184px",
                display: "flex",
                width: "184px",
                // Bug 121584 - Safari browser>>DMS>>cabinet field is not aligned with other fields
                // [25-03-2023] - Added a marginTop to align the Cabinet and DropDown
                marginTop: "0px",
              }}
              // MenuProps={{
              //   anchorOrigin: {
              //     vertical: "bottom",
              //     horizontal: "left",
              //   },
              //   transformOrigin: {
              //     vertical: "top",
              //     horizontal: "left",
              //   },
              //   getContentAnchorEl: null,
              // }}
              value={cabinet}
              onChange={(event) => handleCabinetChange(event.target.value)}
              disabled={isReadOnly}
            >
              {localLoadedActivityPropertyData?.ActivityProperty?.archiveInfo?.m_strCabList?.map(
                (el) => {
                  return (
                    <MenuItem
                      className="statusSelect"
                      value={el}
                      style={{
                        fontSize: "var(--base_text_font_size)",
                        direction: direction === RTL_DIRECTION ? "rtl" : "ltr",
                      }}
                    >
                      {el}
                    </MenuItem>
                  );
                }
              )}
            </CustomizedDropdown>
            {/* {!cabinet && showRedBorder == true ? (
              <span style={{ color: "red", fontSize: "10px" }}>
                Please Enter Cabinet
              </span>
            ) : null} */}
          </div>
        </div>
        <div
          className="dropDownSelectLabelDMS"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "14px",
          }}
        >
          <label htmlFor="archieve_userName">
            {t("toolbox.sharePointArchive.username")}
            <span
              style={{
                color: "rgb(181, 42, 42)",
                padding: "0.35rem",
                marginLeft: "-0.375rem",
                marginTop: "-0.4rem",
              }}
            >
              *
            </span>
          </label>

          <div>
            <input
              ref={usernameRef}
              id="archieve_userName"
              value={userName}
              className="userNameInput"
              onChange={(event) => {
                handleUserChange(event);
              }}
              style={{
                border:
                  !userName && showRedBorder == true ? "1px solid red" : null,
              }}
              disabled={isReadOnly}
              onKeyPress={(e) =>
                FieldValidations(e, 153, usernameRef.current, 255)
              }
            ></input>
            {!userName && showRedBorder == true ? (
              <span style={{ color: "red", fontSize: "10px" }}>
                {t("pleaseEnterUsername")}
              </span>
            ) : null}
          </div>
        </div>
        <div
          className="dropDownSelectLabelDMS"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "14px",
          }}
        >
          <label htmlFor="archieve_password">
            {t("toolbox.sharePointArchive.password")}
            <span
              style={{
                color: "rgb(181, 42, 42)",
                padding: "0.35rem",
                marginLeft: "-0.375rem",
                marginTop: "-0.4rem",
              }}
            >
              *
            </span>
          </label>

          <div>
            <input
              id="archieve_password"
              value={password}
              className="passwordInput"
              type="password"
              onChange={(event) => {
                handlePasswordChange(event);
              }}
              style={{
                border:
                  !password && showRedBorder == true ? "1px solid red" : null,
              }}
              disabled={isReadOnly} //code updated on 26 September 2022 for BugId 115467
            ></input>
            {!password && showRedBorder == true ? (
              <span style={{ color: "red", fontSize: "10px" }}>
                {t("pleaseEnterPassword")}
              </span>
            ) : null}
          </div>
        </div>
        <button
          id="trigger_laInsert_Btn"
          className="triggerButton propertiesAddButton_connect"
          onClick={() => handleConnectDisconnect()}
          disabled={isReadOnly || !cabinet || !userName || !password} //code updated on 26 September 2022 for BugId 115467
        >
          {isConnected ? t("Disconnect") : t("Connect")}
        </button>
      </div>
    );
  };

  const expandedContent = () => {
    return (
      // Changes made to make DMS Archieve screen responsive
      <div className="expandedArchieveFlex">
        <div
          className="dropDownSelectLabelDMS"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          <p id="archieve_cabinet">{t("cabinet")}</p>
          <div>
            <CustomizedDropdown
              ariaLabel="Select Cabinet"
              id="pmweb_archive_dropdown"
              style={{
                marginRight: direction === "rtl" ? "0px" : "20px",
                marginTop: direction === "rtl" ? "3px" : "0px",
                width: "290px",
                height: "28px",
                border: "1px solid #CECECE",
                borderRadius: "1px",
                opacity: "1",
                fontSize: "12px",
              }}
              // MenuProps={{
              //   anchorOrigin: {
              //     vertical: "bottom",
              //     horizontal: "left",
              //   },
              //   transformOrigin: {
              //     vertical: "top",
              //     horizontal: "left",
              //   },
              //   getContentAnchorEl: null,
              // }}
              value={cabinet}
              onChange={(event) => handleCabinetChange(event.target.value)}
              disabled={isReadOnly || isConnected}
            >
              {localLoadedActivityPropertyData?.ActivityProperty?.archiveInfo?.m_strCabList?.map(
                (el) => {
                  return (
                    <MenuItem
                      className="statusSelect"
                      value={el}
                      style={{
                        fontSize: "12px",
                        direction: direction === RTL_DIRECTION ? "rtl" : "ltr",
                      }}
                    >
                      {el}
                    </MenuItem>
                  );
                }
              )}
            </CustomizedDropdown>
          </div>
        </div>
        {/* ====================================== */}
        <div
          className="dropDownSelectLabelDMS" // code added on 05-10-2023 for bugID:38110
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          <label
            htmlFor="archieve_userName"
            style={{
              marginRight: direction === "rtl" ? "20px" : "0px",
              display: direction === "rtl" ? "flex" : "",
              marginLeft: props.isDrawerExpanded ? "5px" : "0px",
            }}
          >
            {t("toolbox.sharePointArchive.username")}
            <span
              style={{
                color: "rgb(181, 42, 42)",
                padding: "0.35rem",
                marginLeft: "-0.375rem",
                marginTop: "-0.4rem",
              }}
            >
              *
            </span>
          </label>
          <div style={{ position: "relative" }}>
            <input
              id="archieve_userName"
              autoComplete="new-password"
              value={userName}
              className="userNameInputExp"
              onChange={(event) => {
                handleUserChange(event);
              }}
              style={{
                width: "290px",
                height: "28px",
                borderRadius: "1px",
                border:
                  !userName && showRedBorder == true
                    ? "1px solid red"
                    : "1px solid #CECECE",
                marginRight: "20px",
              }}
              // id="username"
              ref={usernameRef}
              onKeyPress={(e) =>
                FieldValidations(e, 153, usernameRef.current, 255)
              }
              disabled={isReadOnly || isConnected}
            ></input>

            {!userName && showRedBorder == true ? (
              <span
                style={{
                  color: "red",
                  fontSize: "10px",
                  position: "absolute",
                  left: "8px",
                  top: "28px",
                }}
              >
                {t("pleaseEnterUsername")}
              </span>
            ) : null}
          </div>
        </div>
        {/* ====================================== */}
        <div
          className="dropDownSelectLabelDMS"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          <label
            htmlFor="archieve_password"
            style={{
              marginRight: direction === "rtl" ? "10px" : "0px",
              display: direction === "rtl" ? "flex" : "",
              marginLeft: props.isDrawerExpanded ? "5px" : "0px",
            }}
          >
            {t("toolbox.sharePointArchive.password")}
            <span
              style={{
                color: "rgb(181, 42, 42)",
                padding: "0.35rem",
                marginLeft: "-0.375rem",
                marginTop: "-0.4rem",
              }}
            >
              *
            </span>
          </label>
          <div style={{ position: "relative" }}>
            <input
              autoComplete="new-password"
              id="archieve_password"
              value={password}
              className="passwordInputExp"
              type="password"
              onChange={(event) => {
                handlePasswordChange(event);
              }}
              style={{
                border:
                  !password && showRedBorder == true ? "1px solid red" : null,
                width: "290px",
                height: "28px",
              }}
              disabled={isReadOnly || isConnected}
            ></input>
            {!password && showRedBorder == true ? (
              <span
                style={{
                  color: "red",
                  fontSize: "10px",
                  position: "absolute",
                  left: "8px",
                  top: "28px",
                }}
              >
                {t("pleaseEnterPassword")}
              </span>
            ) : null}
          </div>
        </div>
        {/* ====================================== */}
        <button
          id="trigger_laInsert_BtnExp"
          style={{
            height: "28px",
            width: "80px",
            border: "1px solid #338ed1",
            color: "#338ed1",
            marginLeft: "10px",
            backgroundColor: "white",
            cursor: "pointer",
          }}
          onClick={() => handleConnectDisconnect()}
          disabled={isReadOnly}
        >
          {isConnected ? t("Disconnect") : t("Connect")}
        </button>
      </div>
    );
  };

  return (
    <>
      <TabsHeading heading={props?.heading} />
      <div
        className="archieveScreen"
        /* code added on 6 July 2023 for issue - save and discard button hide 
      issue in case of tablet(landscape mode)*/
        //Modified on 12/10/2023, bug_id:138980
        /* style={{
          height: `calc((${windowInnerHeight}px - ${headerHeight}) - 11.5rem)`,
        }}*/
        //till here for bug_id:138980
      >
        {/*  <div>
        <p id="archieve_subTitles">Archive</p>
      </div> */}
        {props.isDrawerExpanded ? expandedContent() : collapseContent()}
        {/*<div style={{ display: "flex" }}>
        <p id="archieve_folderName">FolderName</p>
        <span
          style={{
            color: "red",
            padding: "0.35rem",
            marginLeft: "-0.375rem",
            marginTop: "-0.4rem",
          }}
        >
          *
        </span>
        <div style={{ marginLeft: props.isDrawerExpanded ? "157px" : "48px" }}>
          <ClickAwayListener onClickAway={() => setShowDropdown(false)}>
            <div className="relative block">
              <button
                className="triggerButton propertiesAddButton"
                onClick={() => setShowDropdown(true)}
                // disabled={readOnlyProcess}
                // id="trigger_laInsert_Btn"
                disabled={!isConnected}
              >
                {"insertVariable"}
              </button>
              <ButtonDropdown
                open={showDropdown}
                // Changes made to solve Bug 121896 - Regression -> DMS-> archive details ->variables are not displayed under insert variable
                dropdownOptions={localLoadedProcessData?.Variable}
                onSelect={handleFolderSelection}
                optionKey="VariableName"
                style={{ top: "80%" }}
                disabled={!isConnected || isReadOnly}
                id="trigger_laInsert_Dropdown"
              />
            </div>
          </ClickAwayListener>
        <div>
            <textarea
              id="trigger_la_desc"
              autofocus
              // disabled={readOnlyProcess}
              value={decode_utf8(folderNameInput)}
              onChange={(event) => setFolderNameInput(event.target.value)}
              className="argStringBodyInput"
              style={{
                border:
                  !folderNameInput && showRedBorder == true
                    ? "1px solid red"
                    : null,
                width: props.isDrawerExpanded ? "15vw" : "13.5vw",
              }}
              ref={folderRef}
              onKeyPress={(e) =>
                FieldValidations(e, 116, folderRef.current, 2000)
              }
              disabled={!isConnected || isReadOnly}
            />
            </div>
            </div>
            </div>*/}
        <div
          className="dropDownSelectLabelDMS"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          <div>
            <p id="archieve_subTitles">{t("foldername")}</p>
          </div>
          <p id="archieve_includeVar">{t("includeVariable")}</p>
          <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
            {
              //code updated on 14 Mar 2023 for BugId 124932
            }
            <CustomizedDropdown
              id="pmweb_archive_includeVar"
              ariaLabel="Include Variables dropdown"
              style={{
                marginRight: direction === "rtl" ? "0px" : "8px",
                width: "290px",
                height: "28px",
                border: "1px solid #CECECE",
                borderRadius: "1px",
                opacity: "1",
                fontSize: "12px",
              }}
              value={folderName}
              onChange={(event) => setFolderName(event.target.value)}
              disabled={isReadOnly}
            >
              {localLoadedProcessData?.Variable?.map((el) => {
                return (
                  <MenuItem
                    className="statusSelect"
                    value={el}
                    style={{
                      fontSize: "12px",
                      direction: direction === RTL_DIRECTION ? "rtl" : "ltr",
                    }}
                  >
                    {el.VariableName}
                  </MenuItem>
                );
              })}
            </CustomizedDropdown>

            <button
              className="triggerButton propertiesAddButton"
              onClick={() => handleFolderSelection(folderName)}
              disabled={!folderName}
            >
              {t("add")}
            </button>
          </div>
          <p id="archieve_content">{t("Content")}</p>
          <label htmlFor="trigger_la_desc" style={{ display: "none" }}>
            Label
          </label>
          <div>
            <textarea
              id="trigger_la_desc"
              autofocus
              aria-label="Content"
              ref={folderRef}
              direction={direction === RTL_DIRECTION ? RTL_DIRECTION : "ltr"} //Changes made to solve Bug 137011
              value={decode_utf8(folderNameInput)}
              onPaste={(e) => {
                setTimeout(() => validateData(e, "Trigger_Name"), 200);
              }}
              onKeyPress={(e) => {
                if (e.charCode == "13") {
                  e.preventDefault();
                } else {
                  /*Bug 110099 no character limit is available for naming the Group on Exception Screen
                [09-03-2023] Corrected the parameter from 50 to 51 as it is excluded one */
                  FieldValidations(e, 182, folderRef.current, 51);
                }
              }}
              onChange={(event) => {
                validateData(event);
                let temp = JSON.parse(
                  JSON.stringify(localLoadedActivityPropertyData)
                );
                temp.ActivityProperty.archiveInfo.folderInfo.folderName =
                  encode_utf8(decode_utf8(event.target.value));
                setlocalLoadedActivityPropertyData(temp);
                // added on 31/08/2023 for Bug 135391 - DMS>>save changes button is not getting enabled
                // when folder name is modified manually
                dispatch(
                  setActivityPropertyChange({
                    [propertiesLabel.archive]: {
                      isModified: true,
                      hasError: false,
                    },
                  })
                );
              }}
              className="argStringBodyInput"
              style={{
                border:
                  !folderNameInput && showRedBorder ? "1px solid red" : null,
                width: props.isDrawerExpanded ? "62vw" : "17.8vw",
                marginRight: direction === "rtl" ? "0px" : "10px",
                fontFamily: "'Arabic Font', Arial, sans-serif",
              }}
              // Code commented to solve Bug 128059 dated 24thMay
              // onKeyPress={(e) =>
              //   FieldValidations(e, 116, folderRef.current, 2000)
              // }
              disabled={!isConnected || isReadOnly}
            />
            {errorMsg ? (
              <p
                style={{
                  color: "red",
                  fontSize: "var(--sub_text_font_size)",
                  marginTop: "-0.75rem",
                  marginBottom: "0.5rem",
                  display: "block",
                }}
              >
                {errorMsg}
              </p>
            ) : (
              ""
            )}
          </div>
        </div>

        <div
          className="dropDownSelectLabelDMS"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          <p id="archieve_dataClass">{`${t("associate")} ${t("data")} ${t(
            "class"
          )}`}</p>
          <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
            <CustomizedDropdown
              id="pmweb_archive_dataClass"
              ariaLabel="Select associate data class"
              className={
                props.isDrawerExpanded
                  ? "dropDownSelectDataClass_expandeddms"
                  : "dropDownSelectDataClass"
              }
              // MenuProps={{
              //   anchorOrigin: {
              //     vertical: "bottom",
              //     horizontal: "left",
              //   },
              //   transformOrigin: {
              //     vertical: "top",
              //     horizontal: "left",
              //   },
              //   getContentAnchorEl: null,
              // }}
              disabled={disabledBeforeConnect || isReadOnly}
              value={associateDataClass}
              onChange={(e) => handleAssociateClassChange(e)}
            >
              {associateDataClassList &&
                associateDataClassList.map((dataClass) => {
                  return (
                    <MenuItem
                      className="statusSelect"
                      value={dataClass.dataDefName}
                      style={{
                        fontSize: "12px",
                        direction: direction === RTL_DIRECTION ? "rtl" : "ltr",
                      }}
                    >
                      {dataClass.dataDefName}
                    </MenuItem>
                  );
                })}
            </CustomizedDropdown>
            <IconButton
              onClick={() =>
                isConnected
                  ? handleAssDataClassMapping(associateDataClass, "associate")
                  : null
              }
              tabIndex={0}
              onKeyUp={(e) => {
                if (e.key === "Enter") {
                  if (isConnected) {
                    handleAssDataClassMapping(associateDataClass, "associate");
                  }

                  e.stopPropagation();
                }
              }}
              disableFocusRipple
              disableRipple
              disableTouchRipple
            >
              <img
                src={MappingIcon}
                alt="Map"
                style={{
                  marginLeft: props.isDrawerExpanded ? "0px" : "8px",
                  marginRight: "5px",
                  marginTop: "5px",
                  cursor: "pointer",
                }}
                className="globalSvgIcon"
                disabled={isReadOnly || !isConnected}
              />
            </IconButton>
          </div>
          {showAssDataClassMapping ? (
            <Modal
              show={showAssDataClassMapping}
              className="DMSModal"
              modalClosed={() => setShowAssDataClassMapping(false)}
              children={
                <FieldMapping
                  userName={userName}
                  password={password}
                  mapType={mapType}
                  selectedDoc={selectedDoc}
                  folderNameInput={folderNameInput}
                  associateDataClass={associateDataClass}
                  associateDataClassList={associateDataClassList}
                  assDataClassMappingList={assDataClassMappingList}
                  setShowAssDataClassMapping={setShowAssDataClassMapping}
                  docCheckList={docCheck}
                  isReadOnly={isReadOnly} //code updated on 26 September 2022 for BugId 115467
                />
              }
            ></Modal>
          ) : null}
        </div>
        <div
          className="dropDownSelectLabelDMS"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <div>
              <FormControlLabel
                style={{
                  fontSize: "12px",
                }}
                id="archieve_workItemAudit"
                control={
                  <Checkbox
                    checked={workItemCheck}
                    onChange={(e) => handleCheckBoxChange(e)}
                    size="small"
                    disabled={isReadOnly}
                    //code updated on 26 September 2022 for BugId 115467
                    inputRef={workItemCheckRef}
                    onKeyUp={(e) => {
                      if (e.key === "Enter") {
                        workItemCheckRef.current.click();
                        e.stopPropagation();
                      }
                    }}
                    id="archieve_workItemAudit"
                  />
                }
                label={t("deleteWorkItemAudit")}
              />
            </div>
            {/* <label htmlFor="archieve_workItemAudit">Delete WorkItem Audit</label> */}
          </div>
        </div>

        <div style={{ marginTop: "10px" }}>
          {/*code added on 16 June 2022 for BugId 108976*/}
          <p id="archieve_docTypes">{t("ArchiveDocumentTypes")}</p>
          <table>
            <tr>
              <th style={{ width: "10vw" }}>
                {/* <Checkbox
                style={{ marginLeft: props.isDrawerExpanded ? "-90px" : "0px" }}
                size="small"
                disabled={disabledBeforeConnect}
                //   checked={props.docTypes.setAllCreate_Email}
              /> */}
                <span style={{ display: "none" }}>vkheiuv</span>
              </th>
              <th
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginTop: "6px",
                  fontSize: "var(--subtitle_text_font_size)",
                  marginRight: "8px",
                }}
              >
                {t("documents")}
              </th>
              <th
                style={{
                  fontSize: "var(--subtitle_text_font_size)",
                  textAlign: "left",
                }}
              >
                {t("associatedClass")}
              </th>
              {/* <th style={{ width: "10vw" }}> </th> */}
            </tr>
            {docList?.map((value, index) => {
              return (
                <tr>
                  <td>
                    <label
                      style={{ display: "none" }}
                      htmlFor={`pmweb_dms_checkBox_${index}`}
                    >
                      Checkbox
                    </label>
                    <Checkbox
                      id={`pmweb_dms_checkBox_${index}`}
                      size="small"
                      checked={
                        docCheck[value.DocTypeId]?.check
                          ? docCheck[value.DocTypeId]?.check
                          : false
                      }
                      onChange={() =>
                        handleDocCheck(value.DocTypeId, index, value.DocName)
                      }
                      disabled={disabledBeforeConnect}
                      inputRef={(item) => (docListRef.current[index] = item)}
                      tabIndex={0}
                      onKeyUp={(e) => {
                        if (e.key === "Enter") {
                          docListRef.current[index].click();
                          // filterFunc(e.target.checked , el);
                          e.stopPropagation();
                        }
                      }}
                    />
                  </td>
                  {/* Changes made to solve Bug 126383  */}
                  <td style={{ fontSize: "12px", width: "20vw" }}>
                    {value.DocName}
                  </td>
                  <td>
                    <CustomizedDropdown
                      id="pmweb_archive_dropdowndata"
                      ariaLabel="associate class dropdown data"
                      className={
                        props.isDrawerExpanded
                          ? "dropDownSelect_expandeddms"
                          : "dropDownSelect"
                      }
                      // MenuProps={{
                      //   anchorOrigin: {
                      //     vertical: "bottom",
                      //     horizontal: "left",
                      //   },
                      //   transformOrigin: {
                      //     vertical: "top",
                      //     horizontal: "left",
                      //   },
                      //   getContentAnchorEl: null,
                      // }}
                      disabled={
                        !docCheck[value.DocTypeId]?.check ||
                        isReadOnly ||
                        !isConnected //code updated on 26 September 2022 for BugId 115467
                      }
                      value={
                        docCheck[value.DocTypeId]?.selectedVal
                          ? docCheck[value.DocTypeId]?.selectedVal
                          : ""
                      }
                      onChange={(event) => {
                        setArchieveDataClass(event.target.value);
                        let tempCheck = { ...docCheck };
                        tempCheck[value.DocTypeId].selectedVal =
                          event.target.value;
                        setDocCheck(tempCheck);
                        // code edited on 13 Feb 2023 for BugId 121979
                        let temp = JSON.parse(
                          JSON.stringify(localLoadedActivityPropertyData)
                        );
                        temp.ActivityProperty.archiveInfo.docTypeInfo.docTypeDCMapList.map(
                          (el, index) => {
                            if (el.docTypeName == value.DocName) {
                              associateDataClassList.map((p) => {
                                if (p.dataDefIndex == event.target.value) {
                                  temp.ActivityProperty.archiveInfo.docTypeInfo.docTypeDCMapList[
                                    index
                                  ].assocDCName = p.dataDefName;
                                  temp.ActivityProperty.archiveInfo.docTypeInfo.docTypeDCMapList[
                                    index
                                  ].assocDCId = p.dataDefIndex;
                                }
                              });
                            }
                          }
                        );
                        setlocalLoadedActivityPropertyData(temp);
                        dispatch(
                          setActivityPropertyChange({
                            [propertiesLabel.archive]: {
                              isModified: true,
                              hasError: false,
                            },
                          })
                        );
                      }}
                      style={{
                        border:
                          !archieveDataClass && showRedBorder == true
                            ? "1px solid red"
                            : null,
                        width: props.isDrawerExpanded ? "184px" : "163px",
                      }}
                    >
                      {associateDataClassList?.map((dataClass) => {
                        return (
                          <MenuItem
                            className="statusSelect"
                            value={dataClass.dataDefIndex}
                            style={{
                              fontSize: "12px",
                              direction:
                                direction === RTL_DIRECTION ? "rtl" : "ltr",
                            }}
                          >
                            {dataClass.dataDefName}
                          </MenuItem>
                        );
                      })}
                    </CustomizedDropdown>
                  </td>
                  <td style={{ width: "10vw" }}>
                    <IconButton
                      onClick={() =>
                        isConnected
                          ? handleAssDataClassMapping(
                              docCheck[value.DocTypeId]?.selectedVal,
                              "archeive",
                              value
                            )
                          : null
                      }
                      // tabIndex={0}
                      onKeyUp={(e) => {
                        if (isConnected) {
                          handleAssDataClassMapping(
                            docCheck[value.DocTypeId]?.selectedVal,
                            "archeive",
                            value
                          );
                        }

                        e.stopPropagation();
                      }}
                      disableFocusRipple
                      disableTouchRipple
                      // style={{ width: "10vw" }}
                      disabled={isReadOnly || !isConnected} //code updated on 26 September 2022 for BugId 115467
                    >
                      <img
                        src={MappingIcon}
                        alt="Map"
                        disabled={isReadOnly || !isConnected}
                        style={{
                          marginRight: "5px",
                          marginTop: "15px",
                          cursor: "pointer",
                        }}
                        className="globalSvgIcon"
                      />
                    </IconButton>
                  </td>
                </tr>
              );
            })}
          </table>
        </div>
      </div>
    </>
  );
}

const mapStateToProps = (state) => {
  return {
    isDrawerExpanded: state.isDrawerExpanded.isDrawerExpanded,
    cellCheckedOut: state.selectedCellReducer.selectedCheckedOut,
    cellLaneId: state.selectedCellReducer.selectedActLaneId,
    openTemplateFlag: state.openTemplateReducer.openFlag,
  };
};
export default connect(mapStateToProps, null)(DMSAdapter);
