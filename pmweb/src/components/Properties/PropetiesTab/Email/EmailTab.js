// #BugID - 115485
// #BugDescription - save button enabled after adding variables.
// #BugID - 121070
// #BugDescription - Handled the issue for Low/Medium/High in priority list.
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./index.css";
import { Select, MenuItem, Checkbox } from "@material-ui/core";
import { connect, useDispatch, useSelector } from "react-redux";
import { store, useGlobalState } from "state-pool";
import {
  RTL_DIRECTION,
  headerHeight,
  propertiesLabel,
} from "../../../../Constants/appConstants";
import SelectWithInput from "../../../../UI/SelectWithInput";
import {
  addConstantsToString,
  getVariableByName,
} from "../../../../utility/ProcessSettings/Triggers/triggerCommonFunctions";
import { TRIGGER_CONSTANT } from "../../../../Constants/triggerConstants";
import { COMPLEX_VARTYPE } from "../../../../Constants/appConstants";
import {
  ActivityPropertyChangeValue,
  setActivityPropertyChange,
} from "../../../../redux-store/slices/ActivityPropertyChangeSlice";
import {
  ActivityPropertySaveCancelValue,
  setSave,
} from "../../../../redux-store/slices/ActivityPropertySaveCancelClicked";
import { setToastDataFunc } from "../../../../redux-store/slices/ToastDataHandlerSlice";
import { OpenProcessSliceValue } from "../../../../redux-store/slices/OpenProcessSlice";
import { withStyles, makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import { isReadOnlyFunc } from "../../../../utility/CommonFunctionCall/CommonFunctionCall";
import {
  encode_utf8,
  decode_utf8,
} from "../../../../utility/UTF8EncodeDecoder";
import { LatestVersionOfProcess } from "../../../../utility/abstarctView/checkLatestVersion";
import arabicStyles from "./ArabicStyles.module.css";
import clsx from "clsx";
import { PMWEB_REGEX, validateRegex } from "../../../../validators/validator";

const StyledTableCell = withStyles((theme) => ({
  head: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  body: {
    fontSize: 14,
  },
}))(TableCell);

const StyledTableRow = withStyles((theme) => ({
  root: {
    "&:nth-of-type(even)": {
      backgroundColor: "#fff",
    },
  },
}))(TableRow);

// code updated on 11 Nov 2022 for BugId 115585
const useStyles = makeStyles((theme) => ({
  table: {
    height: 40,
    borderSpacing: "0 0.125rem",
  },
  tableContainer: {
    // padding: "1.5rem 0 0",
    maxHeight: 270,
    paddingBottom: "1rem",
  },
  tableRow: {
    height: 40,
  },
  tableHeader: {
    fontWeight: 600,
    fontSize: 13,
    backgroundColor: "#f8f8f8",
    borderTop: "1px solid #f8f8f8",
    borderBottom: "1px solid #f8f8f8",
    borderRadius: "0.125rem",
    color: "black",
    // padding: "0 1vw",
    padding: "0 3px",
    textAlign: "start",
  },
  tableBodyCell: {
    fontSize: "var(--base_text_font_size) !important",
    fontWeight: "500 !important",
    // padding: "0 1vw",
    padding: "0 3px",
    textAlign: "start",
  },
  pcolor: {
    color: "#606060 !important",
  },
}));

function EmailTab(props) {
  let { t } = useTranslation();
  const classes = useStyles();
  const direction = `${t("HTML_DIR")}`;
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const loadedActivityPropertyData = store.getState("activityPropertyData");
  const [localLoadedActivityPropertyData, setlocalLoadedActivityPropertyData] =
    useGlobalState(loadedActivityPropertyData);
  const saveCancelStatus = useSelector(ActivityPropertySaveCancelValue);
  const [dropdown, setDropdown] = useState([]);
  const [allData, setAllData] = useState([]);
  const [fromConstant, setFromConstant] = useState(false);
  const [toConstant, settoConstant] = useState(false);
  const [ccConstant, setccConstant] = useState(false);
  const [bccConstant, setbccConstant] = useState(false);
  const [Subject, setSubject] = useState("");
  const [Message, setMessage] = useState("");
  const [priority, setPriority] = useState("");
  const [fromError, setFromError] = useState(false);
  const [toError, setToError] = useState(false);
  const [ccError, setCcError] = useState(false);
  const [bccError, setBccError] = useState(false);
  const [data, setData] = useState({
    from: "",
    to: "",
    bcc: "",
    cc: "",
  });
  let tempVarList = [];
  const [contentSubject, setcontentSubject] = useState("");
  const [contentMessage, setcontentMessage] = useState("");
  const [checked, setChecked] = useState({});
  const priorityDropdown = [t("low"), t("medium"), t("high")]; //Added translation in code on 19-09-2023 for bugId: 136717
  const openProcessData = useSelector(OpenProcessSliceValue);
  const DropdownOptions = [t("status")];
  const [varDocSelected, setVarDocSelected] = useState(DropdownOptions[0]);
  const [allChecked, setAllChecked] = useState(false);
  const [isDefaultVal, setIsDefaultVal] = useState(true);
  const [error, setError] = useState({
    fromMessage: "",
    fromError: false,
    toMessage: "",
    toError: false,
  });
  const allTabStatus = useSelector(ActivityPropertyChangeValue);
  // changes added for bug_id: 134226
  const windowInnerHeight = useSelector(
    (state) => state.setWindowInnerHeight.windowInnerHeight
  );
  const { templateDoc } = props;

  const menuProps = {
    anchorOrigin: {
      vertical: "bottom",
      horizontal: "left",
    },
    transformOrigin: {
      vertical: "top",
      horizontal: "left",
    },
    style: {
      maxHeight: 400,
    },
    getContentAnchorEl: null,
  };
  const dispatch = useDispatch();
  let isReadOnly =
    props.openTemplateFlag ||
    isReadOnlyFunc(
      localLoadedProcessData,
      props.cellCheckedOut,
      props.cellLaneId
    ) ||
    LatestVersionOfProcess(localLoadedProcessData?.Versions) !==
      +localLoadedProcessData?.VersionNo; // modified on 05/09/2023 for BugId 136103;

  const validateEmail = (name) => {
    if (!validateRegex(name, PMWEB_REGEX.EmailId)) {
      return false;
    } else {
      return true;
    }
  };

  //code modified for bug id 136723 on -07-10-23
  const validateEmailForValues = (showMessage) => {
    let mailInfo =
      localLoadedActivityPropertyData?.ActivityProperty?.sendInfo?.emailInfo
        ?.mailInfo;
    if (mailInfo?.m_bFromConst) {
      if (mailInfo?.fromConstant?.trim()?.length > 0) {
        if (!validateEmail(mailInfo?.fromConstant?.trim())) {
          if (showMessage) {
            dispatch(
              setToastDataFunc({
                message: t("pleaseEnterAValidEmail"),
                severity: "error",
                open: true,
              })
            );
          }
          return false;
        }
      }
    }
    // Added on 09-10-23 for Bug 139177
    else if (mailInfo?.fromUser === undefined) {
      return false;
    }
    // Till here for Bug 139177
    if (mailInfo?.m_bToConst) {
      if (mailInfo?.toConstant?.trim()?.length > 0) {
        if (!validateEmail(mailInfo?.toConstant?.trim())) {
          if (showMessage) {
            dispatch(
              setToastDataFunc({
                message: t("pleaseEnterAValidEmail"),
                severity: "error",
                open: true,
              })
            );
          }
          return false;
        }
      }
    }
    // Added on 09-10-23 for Bug 139177
    else if (mailInfo?.toUser === undefined) {
      return false;
    }
    if (mailInfo?.subject === "") {
      return false;
    }

    // Till here for Bug 139177
    return true;
  };

  //Function to make complex variables
  const getComplex = (variable) => {
    let varList = [];
    let varRelationMapArr = variable?.RelationAndMapping
      ? variable.RelationAndMapping
      : variable["Relation&Mapping"];
    varRelationMapArr?.Mappings?.Mapping?.forEach((el) => {
      if (el.VariableType === "11") {
        let tempList = getComplex(el);
        tempList.forEach((ell) => {
          varList.push({
            ...ell,
            SystemDefinedName: `${variable.VariableName}.${ell.VariableName}`,
            VariableName: `${variable.VariableName}.${ell.VariableName}`,
          });
        });
      } else {
        varList.push({
          DefaultValue: "",
          ExtObjectId: el.ExtObjectId ? el.ExtObjectId : variable.ExtObjectId,
          SystemDefinedName: `${variable.VariableName}.${el.VariableName}`,
          Unbounded: el.Unbounded,
          VarFieldId: el.VarFieldId,
          VarPrecision: el.VarPrecision,
          VariableId: el.VariableId,
          VariableLength: el.VariableLength,
          VariableName: `${variable.VariableName}.${el.VariableName}`,
          VariableScope: el.VariableScope
            ? el.VariableScope
            : variable.VariableScope,
          VariableType: el.VariableType,
        });
      }
    });
    return varList;
  };
  // Changes made to solve Bug 132215
  localLoadedProcessData?.Variable?.forEach((_var) => {
    if (_var.VariableType === COMPLEX_VARTYPE) {
      let tempList = getComplex(_var);
      tempList
        .filter((el) => el.VariableType == "3" || el.VariableType == "4")
        ?.forEach((el) => {
          tempVarList.push(el.VariableName);
        });
    }
  });

  /*Bug 123919 - safari>>email>>getting error in saving email property
  [27-03-2023] Commented the UseEffect which gets called on saveCancelStatus.SaveClicked change*/

  // useEffect(() => {
  //   if (saveCancelStatus.SaveOnceClicked) {
  //     let isValidObj, isValidEmail;
  //     isValidObj = validateFunc();
  //     //   if (!isValidObj) {
  //     //     dispatch(
  //     //       setToastDataFunc({
  //     //         message: "Please fill all the mandatory fields",
  //     //         severity: "error",
  //     //         open: true,
  //     //       })
  //     //     );
  //     //   } else {
  //     //     isValidEmail = validateEmailForValues(true);
  //     //     if (isValidEmail) {
  //     //       dispatch(
  //     //         setActivityPropertyChange({
  //     //           [propertiesLabel.send]: { isModified: true, hasError: false },
  //     //         })
  //     //       );
  //     //     } else {
  //     //       dispatch(
  //     //         setActivityPropertyChange({
  //     //           [propertiesLabel.send]: { isModified: true, hasError: true },
  //     //         })
  //     //       );
  //     //     }
  //     //   }
  //     // }

  //     // dispatch(setSave({ SaveClicked: false }));
  //   }
  // }, [saveCancelStatus.SaveClicked]);

  useEffect(() => {
    setDropdown(localLoadedProcessData?.Variable);
  }, [localLoadedProcessData?.Variable]);

  useEffect(() => {
    let tempList =
      localLoadedActivityPropertyData?.ActivityProperty?.sendInfo?.emailInfo
        ?.mapselectedprintDocList;
    let temp = {
      [`-998`]: {
        createDoc: "N",
        docTypeId: "-998",
        m_bCreateCheckbox: false,
        m_bPrint: false,
        varFieldId: "0",
        variableId: "0",
        DocName: "Conversation",
      },
    };

    let tempLocal = JSON.parse(JSON.stringify(openProcessData.loadedData));
    tempLocal?.DocumentTypeList.forEach((el) => {
      temp = {
        ...temp,
        [`d_${el.DocTypeId}`]: {
          createDoc: "N",
          docTypeId: el.DocTypeId,
          m_bCreateCheckbox: false,
          m_bPrint: true,
          varFieldId: "0",
          variableId: "0",
          DocName: el.DocName,
        },
      };
    });

    if (tempList && tempList["v_42_0"]) {
      temp = {
        ...temp,
        ["v_42_0"]: {
          docTypeId: "0",
          DocName: t("status"),
          createDoc: "N",
          m_bCreateCheckbox: false,
          m_bPrint: false,
          varFieldId: "0",
          variableId: "42",
        },
      };
    }
    setAllData(temp);
    let tempCheck = {};
    let isEmailAllChecked = true;
    Object.keys(temp)?.forEach((el) => {
      tempCheck = {
        ...tempCheck,
        [el]: {
          m_bCreateCheckbox:
            typeof tempList != "undefined" && tempList[el]?.m_bCreateCheckbox
              ? tempList[el].m_bCreateCheckbox
              : false,
          m_bPrint:
            typeof tempList != "undefined" && tempList[el]?.m_bPrint
              ? tempList[el].m_bPrint
              : false,
        },
      };
      if (typeof tempList != "undefined" && !tempList[el]?.m_bPrint) {
        isEmailAllChecked = false;
      }
    });
    setChecked(tempCheck);
    setAllChecked(isEmailAllChecked);

    let tempData = {};
    let mailInfo =
      localLoadedActivityPropertyData?.ActivityProperty?.sendInfo?.emailInfo
        ?.mailInfo;
    if (mailInfo?.m_bFromConst) {
      setFromConstant(true);
      tempData = { ...tempData, from: mailInfo?.fromConstant };
    } else {
      setFromConstant(false);
      tempData = {
        ...tempData,
        from: getVariableByName(
          mailInfo?.fromUser,
          localLoadedProcessData?.Variable
        ),
      };
    }
    if (mailInfo?.m_bToConst) {
      settoConstant(true);
      tempData = { ...tempData, to: mailInfo?.toConstant };
    } else {
      settoConstant(false);
      tempData = {
        ...tempData,
        to: getVariableByName(
          mailInfo?.toUser,
          localLoadedProcessData?.Variable
        ),
      };
    }
    if (mailInfo?.m_bCcConst) {
      setccConstant(true);
      tempData = { ...tempData, cc: mailInfo?.ccConstant };
    } else {
      setccConstant(false);
      tempData = {
        ...tempData,
        cc: getVariableByName(
          mailInfo?.ccUser,
          localLoadedProcessData?.Variable
        ),
      };
    }
    if (mailInfo?.m_bBCcConst) {
      setbccConstant(true);
      tempData = { ...tempData, bcc: mailInfo?.bccConstant };
    } else {
      setbccConstant(false);
      tempData = {
        ...tempData,
        bcc: getVariableByName(
          mailInfo?.bccUser,
          localLoadedProcessData?.Variable
        ),
      };
    }
    setIsDefaultVal(true);
    setData(tempData);
    let priorityVal = null;

    if (+mailInfo?.priority === 1) {
      priorityVal = t("low");
    } else if (+mailInfo?.priority === 2) {
      priorityVal = t("medium");
    } else if (+mailInfo?.priority === 3) {
      priorityVal = t("high");
    } else {
      priorityVal = mailInfo?.priority;
    }
    setPriority(priorityVal);
    setcontentSubject(decode_utf8(mailInfo?.subject));
    setcontentMessage(decode_utf8(mailInfo?.message));

    /*Bug 123919 - safari>>email>>getting error in saving email property
    [27-03-2023] Calling the props passed method*/
    props.UpdateActivityData(localLoadedActivityPropertyData);
  }, [openProcessData.loadedData, localLoadedActivityPropertyData]);

  useEffect(() => {
    let isValidObj = validateFunc() && validateEmailForValues();
    //Modified on 24/05/2023, bug_id:127611
    /*     if (!isValidObj) {
      dispatch(
        setActivityPropertyChange({
          [propertiesLabel.send]: { isModified: true, hasError: true },
        })
      );
    } */
    // if (saveCancelStatus.SaveClicked) {
    if (!isValidObj) {
      dispatch(
        setActivityPropertyChange({
          [propertiesLabel.send]: {
            isModified: allTabStatus[propertiesLabel.send]?.isModified,
            hasError: true,
          },
        })
      );
    }
    // Added on 09-10-23 for bugId: 139177
    else {
      dispatch(
        setActivityPropertyChange({
          [propertiesLabel.send]: {
            isModified: allTabStatus[propertiesLabel.send]?.isModified,
            hasError: false,
          },
        })
      );
    }
    // Till here for BugId: 139177
    // }
    dispatch(setSave({ SaveClicked: false }));

    /*Bug 123919 - safari>>email>>getting error in saving email property
    [27-03-2023] Calling the props passed method*/
    props.UpdateActivityData(localLoadedActivityPropertyData);
  }, [localLoadedActivityPropertyData, saveCancelStatus.SaveClicked]);

  useEffect(() => {
    if (!isDefaultVal) {
      setActivityData(data);
    }
  }, [data, priority, contentSubject, contentMessage]);

  const addHandler = () => {
    let temp1 = { ...allData };
    if (temp1["v_42_0"]) {
      dispatch(
        setToastDataFunc({
          message: t("docAlreadyAdded"),
          severity: "error",
          open: true,
        })
      );
    } else {
      let tempdata = {
        docTypeId: "0",
        DocName: t("status"),
        createDoc: "N",
        m_bCreateCheckbox: false,
        m_bPrint: false,
        varFieldId: "0",
        variableId: "42",
      };
      temp1 = { ...temp1, ["v_42_0"]: tempdata }; // key = [v_${variableId}_${varFieldId}]
      setAllData(temp1);

      let temp = { ...localLoadedActivityPropertyData };
      let SavePrint = {
        ...temp.ActivityProperty?.sendInfo?.emailInfo?.mapselectedprintDocList,
      };
      temp.ActivityProperty.sendInfo.emailInfo.mapselectedprintDocList = {
        ...SavePrint,
        [`v_42_0`]: tempdata,
      };
      setlocalLoadedActivityPropertyData(temp);
      dispatch(
        setActivityPropertyChange({
          [propertiesLabel.send]: { isModified: true, hasError: false },
        })
      );
    }
  };

  const CheckHandler = (e, el) => {
    let tempCheck = { ...checked };
    let isPrintAllChecked = true;
    if (e.target.name === "m_bPrint" && !e.target.checked) {
      tempCheck[el] = {
        ...tempCheck[el],
        [e.target.name]: e.target.checked,
        m_bCreateCheckbox: false,
      };
    } else {
      tempCheck[el] = { ...tempCheck[el], [e.target.name]: e.target.checked };
    }
    Object.keys(allData)?.forEach((el) => {
      if (!tempCheck[el].m_bPrint) {
        isPrintAllChecked = false;
      }
    });
    setChecked(tempCheck);
    setAllChecked(isPrintAllChecked);
    let temp = { ...localLoadedActivityPropertyData };
    let SavePrint = {
      ...temp.ActivityProperty?.sendInfo?.emailInfo?.mapselectedprintDocList,
    };
    if (el === "-998") {
      temp.ActivityProperty.sendInfo.emailInfo.mapselectedprintDocList = {
        ...SavePrint,
        [`${allData[el].docTypeId}`]: {
          createDoc: allData[el].createDoc,
          docTypeId: allData[el].docTypeId,
          m_bCreateCheckbox: tempCheck[el].m_bCreateCheckbox ? true : false,
          m_bPrint: tempCheck[el].m_bPrint ? true : false,
          varFieldId: allData[el].varFieldId,
          variableId: allData[el].variableId,
        },
      };
    } else if (el === "v_42_0") {
      temp.ActivityProperty.sendInfo.emailInfo.mapselectedprintDocList = {
        ...SavePrint,
        [`v_42_0`]: {
          createDoc: tempCheck[el].m_bCreateCheckbox
            ? "Y"
            : allData[el].createDoc,
          docTypeId: allData[el].docTypeId,
          m_bCreateCheckbox: tempCheck[el].m_bCreateCheckbox ? true : false,
          m_bPrint: tempCheck[el].m_bPrint ? true : false,
          varFieldId: allData[el].varFieldId,
          variableId: allData[el].variableId,
        },
      };
    } else {
      temp.ActivityProperty.sendInfo.emailInfo.mapselectedprintDocList = {
        ...SavePrint,
        [`d_${allData[el].docTypeId}`]: {
          createDoc: templateDoc.includes(allData[el].DocName)
            ? tempCheck[el].m_bCreateCheckbox
              ? "Y"
              : "N"
            : allData[el].createDoc, // code edited on 13 Jan 2023 for BugId 122384
          docTypeId: allData[el].docTypeId,
          m_bCreateCheckbox: tempCheck[el].m_bCreateCheckbox ? true : false,
          m_bPrint: tempCheck[el].m_bPrint ? true : false,
          varFieldId: allData[el].varFieldId,
          variableId: allData[el].variableId,
        },
      };
    }

    setlocalLoadedActivityPropertyData(temp);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.send]: { isModified: true, hasError: false },
      })
    );
  };

  const setActivityData = (tempData) => {
    let temp = JSON.parse(JSON.stringify(localLoadedActivityPropertyData));
    let newObj = {};
    if (!fromConstant) {
      newObj = {
        ...newObj,
        fromUser: tempData.from?.VariableName,
        variableIdFrom: tempData.from?.VariableId,
        varFieldIdFrom: tempData.from?.VarFieldId,
        varFieldTypeFrom: tempData.from?.VariableScope,
        extObjIDFrom: tempData.from?.ExtObjectId,
        m_bFromConst: false,
      };
    } else {
      newObj = {
        ...newObj,
        fromConstant: tempData.from,
        variableIdFrom: "0",
        varFieldIdFrom: "0",
        varFieldTypeFrom: TRIGGER_CONSTANT,
        extObjIDFrom: "0",
        m_bFromConst: true,
      };
    }
    if (!toConstant) {
      newObj = {
        ...newObj,
        toUser: tempData.to?.VariableName,
        variableIdTo: tempData.to?.VariableId,
        varFieldIdTo: tempData.to?.VarFieldId,
        varFieldTypeTo: tempData.to?.VariableScope,
        extObjIDTo: tempData.to?.ExtObjectId,
        m_bToConst: false,
      };
    } else {
      newObj = {
        ...newObj,
        toConstant: tempData.to,
        variableIdTo: "0",
        varFieldIdTo: "0",
        varFieldTypeTo: TRIGGER_CONSTANT,
        extObjIDTo: "0",
        m_bToConst: true,
      };
    }
    if (!ccConstant) {
      newObj = {
        ...newObj,
        ccUser: tempData.cc?.VariableName,
        variableIdCC: tempData.cc?.VariableId,
        varFieldIdCC: tempData.cc?.VarFieldId,
        varFieldTypeCC: tempData.cc?.VariableScope,
        extObjIDCC: tempData.cc?.ExtObjectId,
        m_bCcConst: false,
      };
    } else {
      newObj = {
        ...newObj,
        ccConstant: tempData.cc,
        variableIdCC: "0",
        varFieldIdCC: "0",
        varFieldTypeCC: TRIGGER_CONSTANT,
        extObjIDCC: "0",
        m_bCcConst: true,
      };
    }
    if (!bccConstant) {
      newObj = {
        ...newObj,
        bccUser: tempData.bcc?.VariableName,
        variableIdBCC: tempData.bcc?.VariableId,
        varFieldIdBCC: tempData.bcc?.VarFieldId,
        varFieldTypeBCC: tempData.bcc?.VariableScope,
        extObjIDBCC: tempData.bcc?.ExtObjectId,
        m_bBCcConst: false,
      };
    } else {
      newObj = {
        ...newObj,
        bccConstant: tempData.bcc,
        variableIdBCC: "0",
        varFieldIdBCC: "0",
        varFieldTypeBCC: TRIGGER_CONSTANT,
        extObjIDBCC: "0",
        m_bBCcConst: true,
      };
    }

    let priorityVar = getVariableByName(
      priority,
      loadedProcessData.value.Variable
    );

    if (priorityVar === null) {
      let priorityVal = null;
      if (priority == t("low")) {
        priorityVal = 1;
      }
      if (priority == t("medium")) {
        priorityVal = 2;
      }
      if (priority == t("high")) {
        priorityVal = 3;
      }

      newObj = {
        ...newObj,
        priority: priorityVal,
        variableIdPriority: "0",
        varFieldIdPriority: "0",
        varFieldTypePriority: TRIGGER_CONSTANT,
        extObjIDPriority: "0",
      };
    } else {
      newObj = {
        ...newObj,
        priority: priority,
        variableIdPriority: priorityVar.VariableId,
        varFieldIdPriority: priorityVar.VarFieldId,
        varFieldTypePriority: priorityVar.VariableScope,
        extObjIDPriority: priorityVar.ExtObjectId,
      };
    }

    newObj = {
      ...newObj,
      /*    priority: priority ? priority : "",
      variableIdPriority: "0",
      varFieldIdPriority: "0",
      varFieldTypePriority: TRIGGER_CONSTANT, */
      // extObjIDPriority: "0",
      subject: encode_utf8(contentSubject),
      message: encode_utf8(contentMessage),
    };

    temp.ActivityProperty.sendInfo.emailInfo.mailInfo = {
      ...newObj,
    };

    setlocalLoadedActivityPropertyData(temp);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.send]: { isModified: true, hasError: false },
      })
    );
  };

  const addSubjectHandler = () => {
    let statement = contentSubject;
    statement = addConstantsToString(statement, Subject);
    setcontentSubject(statement);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.send]: { isModified: true, hasError: false },
      })
    );
  };

  const addMsgHandler = () => {
    let statement = contentMessage;
    statement = addConstantsToString(statement, Message);
    setcontentMessage(statement);
  };

  // Function that checks if the mandatory fields are filled or not when <constant> is selected.
  const checkMandatoryFields = () => {
    let isMandatoryFieldsFilled = true;
    if (
      fromConstant
        ? data?.from?.trim() === ""
        : data?.from?.VariableName?.trim() === ""
    ) {
      isMandatoryFieldsFilled = false;
    }

    if (
      toConstant
        ? data?.to?.trim() === ""
        : data?.to?.VariableName?.trim() === ""
    ) {
      isMandatoryFieldsFilled = false;
    }
    return isMandatoryFieldsFilled;
  };

  const validateFunc = () => {
    let isValid = true;
    if (!checkMandatoryFields()) {
      isValid = false;
    }

    let mailInfo =
      localLoadedActivityPropertyData?.ActivityProperty?.sendInfo?.emailInfo
        ?.mailInfo;
    if (mailInfo?.m_bFromConst) {
      if (!mailInfo?.fromConstant || mailInfo?.fromConstant?.trim() === "") {
        isValid = false;
      }
    } else {
      if (mailInfo?.fromUser?.trim() === "") {
        isValid = false;
      }
    }
    if (mailInfo?.m_bToConst) {
      if (!mailInfo?.toConstant || mailInfo?.toConstant?.trim() === "") {
        isValid = false;
      }
    } else {
      if (mailInfo?.toUser?.trim() === "") {
        isValid = false;
      }
    }

    if (mailInfo?.subject.trim() === "") {
      isValid = false;
    }
    return isValid;
  };

  const onChange = (field, val) => {
    if (val.VariableName && field === "from") {
      setFromError(false);
    } else if (val.VariableName && field === "to") {
      setToError(false);
    } else if (val.VariableName && field == "cc") {
      setCcError(false);
    } else if (val.VariableName && field == "bcc") {
      setBccError(false);
    }
    let tempData = { ...data };
    tempData = { ...tempData, [field]: val };
    setIsDefaultVal(false);
    setData(tempData);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.send]: {
          isModified: true,
          hasError: false,
        },
      })
    );
  };

  const docTypeHandler = (e) => {
    setVarDocSelected(e.target.value);
  };

  const handleAllCheck = (e) => {
    setAllChecked(e.target.checked);
    let tempCheck = { ...checked };
    Object.keys(allData)?.forEach((el) => {
      if (!e.target.checked) {
        tempCheck[el] = {
          ...tempCheck[el],
          m_bPrint: e.target.checked,
          m_bCreateCheckbox: false,
        };
      } else {
        tempCheck[el] = { ...tempCheck[el], m_bPrint: e.target.checked };
      }
    });
    setChecked(tempCheck);
    let temp = { ...localLoadedActivityPropertyData };
    let SavePrint = {
      ...temp.ActivityProperty?.sendInfo?.emailInfo?.mapselectedprintDocList,
    };
    let tempLocalCheck = {};
    Object.keys(allData)?.forEach((el) => {
      if (el === "-998") {
        tempLocalCheck = {
          ...tempLocalCheck,
          [`${allData[el].docTypeId}`]: {
            createDoc: allData[el].createDoc,
            docTypeId: allData[el].docTypeId,
            m_bCreateCheckbox: tempCheck[el].m_bCreateCheckbox ? true : false,
            m_bPrint: tempCheck[el].m_bPrint ? true : false,
            varFieldId: allData[el].varFieldId,
            variableId: allData[el].variableId,
          },
        };
      } else if (el === "v_42_0") {
        tempLocalCheck = {
          ...tempLocalCheck,
          [`v_42_0`]: {
            createDoc: tempCheck[el].m_bCreateCheckbox
              ? "Y"
              : allData[el].createDoc,
            docTypeId: allData[el].docTypeId,
            m_bCreateCheckbox: tempCheck[el].m_bCreateCheckbox ? true : false,
            m_bPrint: tempCheck[el].m_bPrint ? true : false,
            varFieldId: allData[el].varFieldId,
            variableId: allData[el].variableId,
          },
        };
      } else {
        tempLocalCheck = {
          ...tempLocalCheck,
          [`d_${allData[el].docTypeId}`]: {
            createDoc: allData[el].createDoc,
            docTypeId: allData[el].docTypeId,
            m_bCreateCheckbox: tempCheck[el].m_bCreateCheckbox ? true : false,
            m_bPrint: tempCheck[el].m_bPrint ? true : false,
            varFieldId: allData[el].varFieldId,
            variableId: allData[el].variableId,
          },
        };
      }
    });

    temp.ActivityProperty.sendInfo.emailInfo.mapselectedprintDocList = {
      ...SavePrint,
      ...tempLocalCheck,
    };
    setlocalLoadedActivityPropertyData(temp);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.send]: { isModified: true, hasError: false },
      })
    );
  };

  return (
    <div
      className="marginAllAround"
      style={{
        direction: direction,
        /* code added on 6 July 2023 for issue - save and discard button hide 
        issue in case of tablet(landscape mode)*/
        height: `calc((${windowInnerHeight}px - ${headerHeight}) - 15rem)`,
      }}
    >
      <div>
        <div
          className="row"
          style={{
            justifyContent: "space-between",
            // added on 25-09-2023 for bug_id: 138129
            gap: "0.5vw",
            //till here
            alignItems: "start",
          }}
        >
          <div style={{ flex: "1" }}>
            <p
              className={clsx(
                direction === RTL_DIRECTION
                  ? arabicStyles.varUsedLabel
                  : "varUsedLabel",
                classes.pcolor
              )}
            >
              {t("from")}
              <span className="starIcon">*</span>
            </p>
            {/*<label
              htmlFor="pmweb_EmailTab_from_select_input"
              className="pmweb_sr_only"
            >
              From Input
              </label>*/}
            <SelectWithInput
              // constantIconStyles={styles.constIconHeight}
              dropdownOptions={dropdown}
              optionKey="VariableName"
              setIsConstant={(val) => {
                setFromConstant(val);
              }}
              onBlur={() => {
                if (fromConstant) {
                  if (!validateRegex(data.from, PMWEB_REGEX.EmailId)) {
                    setFromError(true);
                  } else {
                    setFromError(false);
                  }
                }
              }}
              setValue={(val) => onChange("from", val)}
              value={data.from}
              isConstant={fromConstant}
              showEmptyString={false}
              showConstValue={true}
              setError={setError}
              disabled={isReadOnly}
              id="pmweb_EmailTab_from_select_input"
              arialabel={t("from")}
              error={error?.fromError}
              helperText={error?.fromMessage}
            />
            {fromError ? (
              <span
                style={{
                  fontSize: "10px",
                  color: "red",
                  margin: "-10px 0px 5px 0px",
                  textAlign: "start",
                }}
              >
                {t("pleaseEnterAValidEmail")}
              </span>
            ) : null}
          </div>
          <div style={{ flex: "1" }}>
            <p
              className={clsx(
                direction === RTL_DIRECTION
                  ? arabicStyles.varUsedLabel
                  : "varUsedLabel",
                classes.pcolor
              )}
            >
              {t("to")}
              <span className="starIcon">*</span>
            </p>
            {/* <label
              htmlFor="pmweb_EmailTab_to_select_input"
              className="pmweb_sr_only"
            >
              To Input
              </label>*/}
            <SelectWithInput
              // constantIconStyles={styles.constIconHeight}
              dropdownOptions={dropdown}
              optionKey="VariableName"
              setIsConstant={settoConstant}
              setValue={(val) => onChange("to", val)}
              value={data.to}
              isConstant={toConstant}
              showEmptyString={false}
              showConstValue={true}
              disabled={isReadOnly}
              id="pmweb_EmailTab_to_select_input"
              arialabel={t("to")}
              error={error?.toError}
              helperText={error?.toMessage}
              onBlur={() => {
                if (toConstant) {
                  if (!validateRegex(data.to, PMWEB_REGEX.EmailId)) {
                    setToError(true);
                  } else {
                    setToError(false);
                  }
                }
              }}
            />
            {toError ? (
              <span
                style={{
                  fontSize: "10px",
                  color: "red",
                  margin: "-10px 0px 5px 0px",
                  textAlign: "start",
                }}
              >
                {t("pleaseEnterAValidEmail")}
              </span>
            ) : null}
          </div>
          <div style={{ flex: "1" }}>
            <p
              className={clsx(
                direction === RTL_DIRECTION
                  ? arabicStyles.varUsedLabel
                  : "varUsedLabel",
                classes.pcolor
              )}
            >
              {t("CC")}
            </p>
            {/*<label
              htmlFor="pmweb_EmailTab_cc_select_input"
              className="pmweb_sr_only"
            >
              CC Input
              </label>*/}
            <SelectWithInput
              dropdownOptions={dropdown}
              optionKey="VariableName"
              setIsConstant={setccConstant}
              setValue={(val) => onChange("cc", val)}
              value={data.cc}
              isConstant={ccConstant}
              showEmptyString={false}
              showConstValue={true}
              disabled={isReadOnly}
              onBlur={() => {
                if (ccConstant) {
                  if (data.cc?.trim() !== "") {
                    if (!validateRegex(data.cc, PMWEB_REGEX.EmailId)) {
                      setCcError(true);
                    } else {
                      setCcError(false);
                    }
                  }
                }
              }}
              id="pmweb_EmailTab_cc_select_input" //code edited on 21 June 2022 for BugId 110973
              arialabel={t("CC")}
            />
            {ccError ? (
              <span
                style={{
                  fontSize: "10px",
                  color: "red",
                  margin: "-10px 0px 5px 0px",
                  textAlign: "start",
                }}
              >
                {t("pleaseEnterAValidEmail")}
              </span>
            ) : null}
          </div>
          <div style={{ flex: "1" }}>
            <p
              className={clsx(
                direction === RTL_DIRECTION
                  ? arabicStyles.varUsedLabel
                  : "varUsedLabel",
                classes.pcolor
              )}
            >
              {t("BCC")}
            </p>
            {/* <label
              htmlFor="pmweb_EmailTab_bcc_select_input"
              className="pmweb_sr_only"
            >
              BCC Input
              </label>*/}
            <SelectWithInput
              dropdownOptions={dropdown}
              optionKey="VariableName"
              setIsConstant={setbccConstant}
              setValue={(val) => onChange("bcc", val)}
              value={data.bcc}
              isConstant={bccConstant}
              showEmptyString={false}
              showConstValue={true}
              disabled={isReadOnly}
              onBlur={() => {
                if (bccConstant) {
                  if (data.bcc?.trim() !== "") {
                    if (!validateRegex(data.bcc, PMWEB_REGEX.EmailId)) {
                      setBccError(true);
                    } else {
                      setBccError(false);
                    }
                  }
                }
              }}
              id="pmweb_EmailTab_bcc_select_input" //code edited on 21 June 2022 for BugId 110973
              arialabel={t("BCC")}
            />
            {bccError ? (
              <span
                style={{
                  fontSize: "10px",
                  color: "red",
                  margin: "-10px 0px 5px 0px",
                  textAlign: "start",
                }}
              >
                {t("pleaseEnterAValidEmail")}
              </span>
            ) : null}
          </div>
          <div style={{ flex: "1" }}>
            <p
              className={clsx(
                direction === RTL_DIRECTION
                  ? arabicStyles.varUsedLabel
                  : "varUsedLabel",
                classes.pcolor
              )}
            >
              {t("Priority")}
            </p>
            <label htmlFor="EmailTab_priority_email" className="pmweb_sr_only">
              {t("SelectPriority")}
            </label>
            <Select
              className="dropdownEmail"
              MenuProps={menuProps}
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value);
                setIsDefaultVal(false);
              }}
              id="pmweb_EmailTab_priority_email"
              disabled={isReadOnly}
              style={{
                marginBottom: "1rem",
                // added on 25-09-2023 for bug_id: 138129
                width: "100%",
                //till here
              }}
              inputProps={{
                id: "EmailTab_priority_email",
                "aria-label": t("SelectPriority"),
              }}
            >
              {priorityDropdown?.map((element) => {
                return (
                  <MenuItem
                    className="menuItemStylesDropdown"
                    key={element}
                    value={element}
                    style={{
                      justifyContent:
                        direction === RTL_DIRECTION ? "end" : "start",
                    }}
                  >
                    {element}
                  </MenuItem>
                );
              })}

              {/* Changes made to solve Bug 132215  */}
              {localLoadedProcessData?.Variable?.filter(
                (el) =>
                  (el.VariableScope == "U" &&
                    (el.VariableType == "3" || el.VariableType == "4")) ||
                  (el.VariableScope == "I" &&
                    (el.VariableType == "3" || el.VariableType == "4"))
                // till here dated 26thSept
              ).map((data, i) => {
                return (
                  <MenuItem
                    className="menuItemStylesDropdown"
                    key={i}
                    value={data.VariableName}
                    style={{
                      justifyContent:
                        direction === RTL_DIRECTION ? "end" : "start",
                    }}
                  >
                    {data.VariableName}
                  </MenuItem>
                );
              })}
              {/* Changes made to solve Bug 132215 */}
              {tempVarList?.map((val) => {
                return (
                  <MenuItem
                    className="menuItemStylesDropdown"
                    value={val}
                    style={{
                      justifyContent:
                        direction === RTL_DIRECTION ? "end" : "start",
                    }}
                  >
                    {val}
                  </MenuItem>
                );
              })}
              {/* till here */}
            </Select>
          </div>
        </div>
      </div>
      <p className="boldText">
        {t("Subject")}
        <span className="starIcon">*</span>
      </p>
      <p
        className={clsx(
          direction === RTL_DIRECTION
            ? arabicStyles.varUsedLabel
            : "varUsedLabel",
          classes.pcolor
        )}
      >
        {t("includeVariable")}
      </p>
      <div className="row" style={{ gap: "1vw" }}>
        <label htmlFor="Subject_includeVar_email" className="pmweb_sr_only">
          {t("SelectSubjectIncludeVariable")}{" "}
        </label>
        <Select
          className="dropdownEmail"
          MenuProps={menuProps}
          id="pmweb_EmailTab_includeVar_email"
          value={Subject}
          disabled={isReadOnly}
          onChange={(e) => {
            setSubject(e.target.value);
            setIsDefaultVal(false);
          }}
          inputProps={{
            id: "Subject_includeVar_email",
            "aria-label": t("SelectSubjectIncludeVariable"),
          }}
        >
          {dropdown?.map((element) => {
            return (
              <MenuItem
                className="menuItemStylesDropdown"
                value={element.VariableName}
                style={{
                  justifyContent: direction === RTL_DIRECTION ? "end" : "start",
                }}
              >
                {element.VariableName}
              </MenuItem>
            );
          })}
        </Select>
        <button
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.addbtnEmail
              : isReadOnly
              ? "disabledbtnEmail"
              : "addbtnEmail"
          }
          disabled={isReadOnly || Subject === ""}
          onClick={addSubjectHandler}
          id="pmweb_EmailTab_add_includevariable_button"
        >
          {t("add")}
        </button>
      </div>
      <p
        className={clsx(
          direction === RTL_DIRECTION
            ? arabicStyles.varUsedLabel
            : "varUsedLabel",
          classes.pcolor
        )}
      >
        {t("Content")}
      </p>
      <label htmlFor="pmweb_EmailTab_content_email" className="pmweb_sr_only">
        {t("SubjectContentInput")}
      </label>
      <textarea
        style={{
          width: props.isDrawerExpanded ? "80%" : "95%",
          height: "5rem",
          border: "1px solid #c4c4c4",
          textAlign: "start",
        }}
        id="pmweb_EmailTab_content_email"
        aria-label={t("SubjectContentInput")}
        value={contentSubject}
        disabled={isReadOnly}
        onChange={(e) => {
          setcontentSubject(e.target.value);
          setIsDefaultVal(false);
        }}
      />
      <p className="boldText">{t("msg")}</p>
      <p
        className={clsx(
          direction === RTL_DIRECTION
            ? arabicStyles.varUsedLabel
            : "varUsedLabel",
          classes.pcolor
        )}
      >
        {t("includeVariable")}
      </p>
      <div className="row" style={{ gap: "1vw" }}>
        <label htmlFor="messageIncludevaribale_email" className="pmweb_sr_only">
          {t("SelectMessageIncludeVariable")}
        </label>
        <Select
          className="dropdownEmail"
          MenuProps={menuProps}
          id="pmweb_Emailtab_messageIncludevaribale_email"
          value={Message}
          onChange={(e) => {
            setMessage(e.target.value);
            setIsDefaultVal(false);
          }}
          disabled={isReadOnly}
          inputProps={{
            id: "messageIncludevaribale_email",
            "aria-label": t("SelectMessageIncludeVariable"),
          }}
        >
          {dropdown?.map((element) => {
            return (
              <MenuItem
                className="menuItemStylesDropdown"
                value={element.VariableName}
                style={{
                  justifyContent: direction === RTL_DIRECTION ? "end" : "start",
                }}
              >
                {element.VariableName}
              </MenuItem>
            );
          })}
        </Select>
        <button
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.addbtnEmail
              : isReadOnly
              ? "disabledbtnEmail"
              : "addbtnEmail"
          }
          disabled={isReadOnly || Message === ""}
          onClick={addMsgHandler}
          id="pmweb_EmailTab_messageincludevariable_add_button"
        >
          {t("add")}
        </button>
      </div>
      <p
        className={clsx(
          direction === RTL_DIRECTION
            ? arabicStyles.varUsedLabel
            : "varUsedLabel",
          classes.pcolor
        )}
      >
        {t("Content")}
      </p>
      <label
        htmlFor="pmweb_EmailTab_messagecontent_textarea"
        className="pmweb_sr_only"
      >
        {t("MessageContentInput")}
      </label>
      <textarea
        style={{
          width: props.isDrawerExpanded ? "80%" : "95%",
          height: "5rem",
          border: "1px solid #c4c4c4",
          textAlign: "start",
        }}
        id="pmweb_EmailTab_messagecontent_textarea"
        aria-label={t("MessageContentInput")}
        value={contentMessage}
        disabled={isReadOnly}
        onChange={(e) => {
          setcontentMessage(e.target.value);
          setIsDefaultVal(false);
        }}
        error={error?.toError}
        helperText={error?.toMessage}
      />
      <hr className="hrLineSend" />

      <div className="row" style={{ alignItems: "end", gap: "1vw" }}>
        <div>
          <p
            className={clsx(
              direction === RTL_DIRECTION
                ? arabicStyles.varUsedLabel
                : "varUsedLabel",
              classes.pcolor
            )}
          >
            {t("DocType")}
          </p>
          <label htmlFor="Documenttype_dropdown" className="pmweb_sr_only">
            {t("DocumentType")}
          </label>
          <Select
            className="dropdownEmail"
            MenuProps={menuProps}
            value={varDocSelected}
            onChange={(event) => docTypeHandler(event)}
            style={{ margin: "var(--spacing_v) 0" }}
            disabled={isReadOnly}
            id="pmweb_EmailTab_Documenttype_dropdown"
            inputProps={{
              id: "Documenttype_dropdown",
              "aria-label": t("DocumentType"),
            }}
          >
            {DropdownOptions?.map((element) => {
              return (
                <MenuItem
                  className="menuItemStylesDropdown"
                  key={element}
                  value={element}
                  style={{
                    justifyContent:
                      direction === RTL_DIRECTION ? "end" : "start",
                  }}
                >
                  {element}
                </MenuItem>
              );
            })}
          </Select>
        </div>
        <button
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.addbtnEmail
              : isReadOnly
              ? "disabledbtnEmail"
              : "addbtnEmail"
          }
          disabled={isReadOnly}
          style={{ margin: "0 !important" }}
          onClick={addHandler}
          id="pmweb_EmailTab_adddocumenttype_addbutton"
        >
          {t("add")}
        </button>
      </div>

      <TableContainer component={Paper} className={classes.tableContainer}>
        <Table
          className={`${classes.table} ${
            props.isDrawerExpanded
              ? "webServicePropertiestableEx"
              : "webServicePropertiestableCo"
          } webServicePropertiestable`}
          style={{ width: props.isDrawerExpanded ? "70%" : "100%" }}
          aria-label="customized table"
          stickyHeader
        >
          <TableHead>
            <StyledTableRow className={classes.tableRow}>
              <StyledTableCell
                className={classes.tableHeader}
                style={{ width: props.isDrawerExpanded ? "32vw" : "25%" }}
                width={props.isDrawerExpanded ? "32vw" : "25%"}
              >
                {t("document")}
              </StyledTableCell>
              <StyledTableCell
                className={classes.tableHeader}
                style={{ width: props.isDrawerExpanded ? "32vw" : "25%" }}
                width={props.isDrawerExpanded ? "32vw" : "25%"}
              >
                {/* <label htmlFor="emailcheck_checkbox" style={{display:"none"}}>Email Checkbox</label> */}

                <Checkbox
                  className="emailCheck"
                  checked={allChecked}
                  onChange={(e) => handleAllCheck(e)}
                  disabled={isReadOnly}
                  id="pmweb_EmailTab_emailcheck_checkbox"
                  inputProps={{
                    // id:"emailcheck_checkbox"
                    "aria-label": t("SelectAllDocForEmail"),
                  }}
                  onKeyUp={(e) => {
                    if (e.key === "Enter") {
                      handleAllCheck({
                        ...e,
                        target: {
                          ...e.target,
                          checked: !allChecked,
                        },
                      });
                    }
                  }}
                />
                {t("email")}
              </StyledTableCell>
              <StyledTableCell
                className={classes.tableHeader}
                style={{ width: props.isDrawerExpanded ? "32vw" : "50%" }}
                width={props.isDrawerExpanded ? "32vw" : "50%"}
              >
                {/* <label htmlFor="emailtab_createifnotfound_checkbox" style={{display:"none"}}>Create If Not Found Checkbox</label> */}
                <Checkbox
                  className="emailCheck"
                  disabled
                  id="pmweb_EmailTab_createifnotfound_checkbox"
                  inputProps={{
                    // id:"emailtab_createifnotfound_checkbox"
                    "aria-label": t("SelectAllDocCreateIfNotFoundForEmail"),
                  }}
                />
                {t("CreateIfNotFound")}
              </StyledTableCell>
            </StyledTableRow>
          </TableHead>
          <TableBody className="associatedTemplateDiv">
            {Object.keys(allData).map((el) => (
              <StyledTableRow
                key={allData[el].DocId}
                className={classes.tableRow}
              >
                <StyledTableCell
                  className={classes.tableBodyCell}
                  component="th"
                  scope="row"
                  style={{ width: props.isDrawerExpanded ? "32vw" : "25%" }}
                  width={props.isDrawerExpanded ? "32vw" : "25%"}
                >
                  {allData[el].DocName}
                </StyledTableCell>

                <StyledTableCell
                  className={classes.tableBodyCell}
                  style={{ width: props.isDrawerExpanded ? "32vw" : "25%" }}
                  width={props.isDrawerExpanded ? "32vw" : "25%"}
                >
                  {/* <label htmlFor={`m_b_emailcheckbox_${el}`} style={{display:"none"}}>{allData[el].DocName}</label> */}
                  <Checkbox
                    className="emailCheck"
                    name="m_bPrint"
                    checked={checked[el]?.m_bPrint}
                    onChange={(e) => CheckHandler(e, el)}
                    disabled={isReadOnly}
                    id={`pmweb_EmailTab_m_bprint_checkbox_${el}`}
                    inputProps={{
                      // id:`m_b_emailcheckbox_${el}`
                      "aria-label": allData[el]?.DocName,
                    }}
                    onKeyUp={(e) => {
                      if (e.key === "Enter") {
                        CheckHandler(
                          {
                            ...e,
                            target: {
                              ...e.target,
                              checked: !checked[el]?.m_bPrint,
                            },
                          },
                          el
                        );
                      }
                    }}
                  />
                </StyledTableCell>
                <StyledTableCell
                  className={classes.tableBodyCell}
                  style={{ width: props.isDrawerExpanded ? "32vw" : "50%" }}
                  width={props.isDrawerExpanded ? "32vw" : "50%"}
                >
                  {/* code edited on 13 Jan 2023 for BugId 122384 */}
                  {/* <label htmlFor={`m_b_CreateCheckbox_${el}`} style={{display:"none"}}>{allData[el].DocName}</label> */}
                  <Checkbox
                    className="emailCheck"
                    name="m_bCreateCheckbox"
                    disabled={
                      (allData[el].DocName !== t("status") &&
                        !templateDoc.includes(allData[el].DocName)) ||
                      isReadOnly
                        ? true
                        : !checked[el]?.m_bPrint || isReadOnly
                        ? true
                        : false
                    }
                    checked={
                      allData[el].DocName !== t("status") &&
                      !templateDoc.includes(allData[el].DocName)
                        ? false
                        : checked[el]?.m_bCreateCheckbox
                    }
                    onChange={(e) => CheckHandler(e, el)}
                    id={`pmweb_EmailTab_m_bCreateCheckbox_${el}`}
                    inputProps={{
                      // id:`m_b_CreateCheckbox_${el}`
                      "aria-label": allData[el]?.DocName,
                    }}
                    onKeyUp={(e) => {
                      if (e.key === "Enter") {
                        CheckHandler(
                          {
                            ...e,
                            target: {
                              ...e.target,
                              checked: !(allData[el].DocName !== t("status") &&
                              !templateDoc.includes(allData[el].DocName)
                                ? false
                                : checked[el]?.m_bCreateCheckbox),
                            },
                          },
                          el
                        );
                      }
                    }}
                  />
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    cellCheckedOut: state.selectedCellReducer.selectedCheckedOut,
    cellLaneId: state.selectedCellReducer.selectedActLaneId,
    openTemplateFlag: state.openTemplateReducer.openFlag,
  };
};

export default connect(mapStateToProps, null)(EmailTab);
