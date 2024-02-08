import React, { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  getTypeByVariable,
  getVariableType,
} from "../../../../utility/ProcessSettings/Triggers/getVariableType";
import styles from "./index.module.css";
import arabicStyles from "./arabicStyles.module.css";
import "../common.css";
import PublicIcon from "@material-ui/icons/Public";
import Tooltip from "@material-ui/core/Tooltip";
import { withStyles } from "@material-ui/core/styles";
import ParamDivOnHover from "../ParamDivOnHover";
import DeleteOutlinedIcon from "@material-ui/icons/DeleteOutlined";
import {
  COMPLEX_VARTYPE,
  DEFAULT_GLOBAL_ID,
  DEFAULT_GLOBAL_TYPE,
  ENDPOINT_ADD_EXTERNAL_METHODS,
  ENDPOINT_DELETE_EXTERNAL_METHODS,
  ENDPOINT_MODIFY_EXTERNAL_METHODS,
  ENDPOINT_PROCESS_ASSOCIATION,
  GLOBAL_SCOPE,
  LOCAL_SCOPE,
  RETURN_TYPE_OPTIONS,
  RTL_DIRECTION,
  SERVER_URL,
  USER_DEFINED_SCOPE,
  SPACE,
  ARABIC_LOCALE,
  ARABIC_SA_LOCALE,
} from "../../../../Constants/appConstants";
import {
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Grid,
  useMediaQuery,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import EditIcon from "@material-ui/icons/Edit";
import DoneIcon from "@material-ui/icons/Done";
import axios from "axios";
import { connect, useDispatch } from "react-redux";
import { store, useGlobalState } from "state-pool";
import { FieldValidations } from "../../../../utility/FieldValidations/fieldValidations";
import UserDefinedIcon from "../../../../assets/icons/UserDefined.svg";
import DefaultModal from "../../../../UI/Modal/Modal";
import ObjectDependencies from "../../../../UI/ObjectDependencyModal";
import CustomizedDropdown from "../../../../UI/Components_With_ErrrorHandling/Dropdown";
import secureLocalStorage from "react-secure-storage";
import { isArabicLocaleSelected } from "../../../../utility/CommonFunctionCall/CommonFunctionCall";
import { LightTooltip } from "../../../../UI/StyledTooltip";
import { setToastDataFunc } from "../../../../redux-store/slices/ToastDataHandlerSlice";

function UserDefined(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  let {
    methodList,
    primaryInputStrip,
    setPrimaryInputStrip,
    setMethodList,
    maxMethodCount,
    setMaxMethodCount,
    scope,
    isReadOnly,
  } = props;
  const [data, setData] = useState({
    appName: "",
    methodName: "",
    returnType: "",
    isGlobal: false,
    paramList: [],
  });
  const [editMethod, setEditMethod] = useState(null);
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData, setlocalLoadedProcessData] =
    useGlobalState(loadedProcessData);
  const [taskAssociation, setTaskAssociation] = useState([]);
  const [showDependencyModal, setShowDependencyModal] = useState(false);
  const smallScreen = useMediaQuery("(max-width: 999px)");
  const appNameRef = useRef();
  const methodNameRef = useRef();
  const paramNameRef = useRef();
  const [errorMsg, setErrorMsg] = useState({ name: "", errMsg: "" });
  const dispatch = useDispatch();
  const errorParamNameref = useRef(null);
  const [checktypeValidation, setChecktypeValidation] = useState(false);
  const regexObj = {
    appName: {
      engRegex: "^[A-Za-z][\\w-#]*$",
      arbRegex: "[~`!@$%^&*()+={}\\[\\]|\\\\:\";'<>?,.//]+",
      charRestricted: "~`!@$%^&*()+={}[]|:\";'<>?,./",
    },
    methodName: {
      engRegex: "^[A-Za-z][\\w,$]*$",
      arbRegex: "[~`!@#$%^&*()+\\-={}\\[\\]|\\\\:\";'<>?,.//]+",
      charRestricted: "~`!@#%^&*()-+={}|[]:\";'<>?,./",
    },
    paramName: {
      engRegex: "^[A-Za-z][\\w,$]*$",
      arbRegex: "[~`!@#$%^&*()+\\-={}\\[\\]|\\\\:\";'<>?,.//]+",
      charRestricted: "~`!@#%^&*()-+={}|[]:\";'<>?,./",
    },
  };

  const ParamTooltip = withStyles(() => ({
    tooltip: {
      background: "#FFFFFF 0% 0% no-repeat padding-box",
      boxShadow: "0px 3px 6px #00000029",
      border: "1px solid #70707075",
      font: "normal normal normal 12px/17px Open Sans",
      letterSpacing: "0px",
      color: "#000000",
      zIndex: "100",
      transform: "translate3d(0px, -0.125rem, 0px) !important",
    },
    arrow: {
      "&:before": {
        backgroundColor: "#FFFFFF !important",
        border: "1px solid #70707075 !important",
        zIndex: "100",
      },
    },
  }))(Tooltip);

  //code edited on 21 June 2022 for BugId 111099
  const addExternalMethod = () => {
    let newData = [...methodList];
    let maxVarId;
    //code added on 16 June 2022 for BugId 110949
    if (scope === GLOBAL_SCOPE) {
      maxVarId = +maxMethodCount + 1;
    } else {
      maxVarId = +localLoadedProcessData.MaxMethodIndex + 1;
    }
    let jsonParams = data.paramList?.map((el) => {
      return {
        paramName: el.paramName,
        paramType: getTypeByVariable(el.paramType),
        paramIndex: el.paramId,
        paramScope: "",
        unbounded: el.isArray ? "Y" : "N",
        dataStructureId: "0",
      };
    });
    let json = {
      processDefId:
        scope === GLOBAL_SCOPE ? DEFAULT_GLOBAL_ID : props.openProcessID,
      processType:
        scope === GLOBAL_SCOPE ? DEFAULT_GLOBAL_TYPE : props.openProcessType,
      methodName: data.methodName,
      methodIndex: maxVarId,
      returnType: getTypeByVariable(data.returnType),
      appName: data.appName,
      appType: USER_DEFINED_SCOPE,
      paramList: jsonParams,
      methodType: scope,
    };
    axios.post(SERVER_URL + ENDPOINT_ADD_EXTERNAL_METHODS, json).then((res) => {
      if (res?.data?.Status === 0) {
        let parameters = data.paramList?.map((param) => {
          return {
            DataStructureId: "0",
            ParamIndex: param.paramId,
            ParamName: param.paramName,
            ParamScope: "",
            ParamType: getTypeByVariable(param.paramType),
            Unbounded: param.isArray ? "Y" : "N",
          };
        });
        newData.push({
          AppName: data.appName,
          AppType: USER_DEFINED_SCOPE,
          MethodIndex: maxVarId + 1,
          MethodName: data.methodName,
          MethodType: scope,
          Parameter: parameters,
          ReturnType: getTypeByVariable(data.returnType),
        });
        setMethodList(newData);
        setData({
          appName: "",
          methodName: "",
          returnType: "",
          isGlobal: false,
          // code edited on 26 July 2022 for BugId 111099
          paramList: [],
        });
        //code added on 16 June 2022 for BugId 110949
        if (scope === GLOBAL_SCOPE) {
          setMaxMethodCount((prev) => {
            return prev + 1;
          });
        } else {
          let temp = JSON.parse(JSON.stringify(localLoadedProcessData));
          temp.MaxMethodIndex = temp.MaxMethodIndex + 1;
          setlocalLoadedProcessData(temp);
        }
        setPrimaryInputStrip(false);
      }
    });
  };

  const modifyExternalMethod = () => {
    let parameterList = editMethod.Parameter?.map((param) => {
      return {
        paramName: param.ParamName,
        paramType: param.ParamType,
        paramIndex: param.ParamIndex,
        paramScope: param.ParamScope,
        unbounded: param.Unbounded,
        dataStructureId: param.DataStructureId,
      };
    });
    // added on 6/2/2024 for bug_id: 143316
    let paramNameEmptyParameter = parameterList.some(
      (param) => param.paramName === ""
    );
    let paramTypeEmptyParameter = parameterList.some(
      (param) => param.paramType === ""
    );

    if (paramNameEmptyParameter) {
      dispatch(
        setToastDataFunc({
          message: t("paramDefNameError"),
          severity: "error",
          open: true,
        })
      );
      if (errorParamNameref.current) {
        errorParamNameref.current.focus();
      }
    } else if (paramTypeEmptyParameter) {
      dispatch(
        setToastDataFunc({
          message: t("paramDefTypeError"),
          severity: "error",
          open: true,
        })
      );
      setChecktypeValidation(true);
    } else {
      // till here for bug_id: 143316
      // code edited on 26 July 2022 for Bug 111880
      let json = {
        processDefId:
          scope === GLOBAL_SCOPE ? DEFAULT_GLOBAL_ID : props.openProcessID,
        processType:
          scope === GLOBAL_SCOPE ? DEFAULT_GLOBAL_TYPE : props.openProcessType,
        methodName: editMethod.MethodName,
        methodIndex: editMethod.MethodIndex,
        methodType: editMethod.MethodType,
        returnType: editMethod.ReturnType,
        appName: editMethod.AppName,
        appType: editMethod.AppType,
        paramList: parameterList,
      };
      axios
        .post(SERVER_URL + ENDPOINT_MODIFY_EXTERNAL_METHODS, json)
        .then((res) => {
          if (res?.data?.Status === 0) {
            let newData = [...methodList];
            // newData?.map((data) => {
            newData?.forEach((data) => {
              if (+data.MethodIndex === +editMethod.MethodIndex) {
                data.AppName = editMethod.AppName;
                data.AppType = editMethod.AppType;
                data.MethodName = editMethod.MethodName;
                data.MethodType = editMethod.MethodType;
                data.Parameter = editMethod.Parameter;
                data.ReturnType = editMethod.ReturnType;
              }
            });
            console.log("Data", newData);
            setMethodList(newData);
            setEditMethod(null);
          }
        });
    }
  };

  const deleteExternalMethod = (externalMethod) => {
    // code edited on 26 July 2022 for Bug 111880

    let payload = {
      processId:
        scope === GLOBAL_SCOPE ? DEFAULT_GLOBAL_ID : props.openProcessID,
      processType:
        scope === GLOBAL_SCOPE ? DEFAULT_GLOBAL_TYPE : props.openProcessType,
      objectName: externalMethod.MethodName,
      objectId: externalMethod.MethodIndex,
      wsType: scope === GLOBAL_SCOPE ? "EFG" : "EF",
      deviceType: "D",
    };

    let json = {
      processDefId:
        scope === GLOBAL_SCOPE ? DEFAULT_GLOBAL_ID : props.openProcessID,
      processType:
        scope === GLOBAL_SCOPE ? DEFAULT_GLOBAL_TYPE : props.openProcessType,
      methodName: externalMethod.MethodName,
      methodIndex: externalMethod.MethodIndex,
      methodType: externalMethod.MethodType,
      returnType: externalMethod.ReturnType,
      appName: externalMethod.AppName,
      appType: externalMethod.AppType,
    };

    axios
      .post(SERVER_URL + ENDPOINT_PROCESS_ASSOCIATION, payload)
      .then((res) => {
        if (res.data.Status === 0) {
          if (res?.data?.Validations?.length > 0) {
            setTaskAssociation(res?.data?.Validations);
            setShowDependencyModal(true);
          } else {
            axios
              .post(SERVER_URL + ENDPOINT_DELETE_EXTERNAL_METHODS, json)
              .then((res) => {
                if (res.data.Status === 0) {
                  let indexVal;
                  let newData = [...methodList];
                  newData?.forEach((val, index) => {
                    if (+val.MethodIndex === +externalMethod.MethodIndex) {
                      indexVal = index;
                    }
                  });
                  newData.splice(indexVal, 1);
                  setMethodList(newData);
                }
              });
          }
        }
      });
  };

  const onChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const onParamChange = (index, e, value) => {
    let newParamList = [...data.paramList];
    newParamList[index] = {
      ...newParamList[index],
      [e.target.name]: value,
    };
    setData((prev) => {
      return { ...prev, paramList: newParamList };
    });
  };

  const onParamChangeInEditMethod = (index, e, value) => {
    let newParamList = editMethod.Parameter ? [...editMethod.Parameter] : [];
    newParamList[index] = {
      ...newParamList[index],
      [e.target.name]: value,
    };
    setEditMethod((prev) => {
      return { ...prev, Parameter: newParamList };
    });
  };

  const addParam = () => {
    let newParamList = [...data.paramList];
    let maxId = 0;
    newParamList?.forEach((param) => {
      if (+param.paramId > +maxId) {
        maxId = +param.paramId;
      }
    });
    newParamList.push({
      paramId: maxId + 1,
      paramName: "",
      paramType: "",
      isArray: false,
    });
    setData((prev) => {
      return { ...prev, paramList: newParamList };
    });
  };

  const addParamInEditMethod = () => {
    let newParamList = editMethod.Parameter ? [...editMethod.Parameter] : [];
    let maxId = 0;
    newParamList?.forEach((param) => {
      if (+param.ParamIndex > +maxId) {
        maxId = +param.ParamIndex;
      }
    });
    newParamList.push({
      ParamIndex: maxId + 1,
      DataStructureId: "0",
      ParamName: "",
      ParamScope: "",
      ParamType: "",
      Unbounded: "N",
    });
    setEditMethod((prev) => {
      return { ...prev, Parameter: newParamList };
    });
  };

  const removeParam = (index) => {
    let newParamList = [...data.paramList];
    newParamList.splice(index, 1);
    setData((prev) => {
      return { ...prev, paramList: newParamList };
    });
  };

  const removeParamInEditMethod = (index) => {
    let newParamList = editMethod.Parameter ? [...editMethod.Parameter] : [];
    newParamList.splice(index, 1);
    setEditMethod((prev) => {
      return { ...prev, Parameter: newParamList };
    });
  };

  {
    /*code added on 10 October 2022 for BugId 116894*/
  }

  const containsSpecialChars = (str, name) => {
    if (isArabicLocaleSelected()) {
      var regex = new RegExp(regexObj[name].arbRegex);
      return !regex.test(str);
    } else {
      var regex = new RegExp(regexObj[name].engRegex);
      return regex.test(str);
    }
  };

  const validateData = (e, val) => {
    if (!containsSpecialChars(e.target.value, e.target.name)) {
      if (isArabicLocaleSelected()) {
        /*setErrorMsg(
          `${val}${SPACE}${t("cannotContain")}${SPACE}${regexObj[e.target.name].charRestricted
          }${SPACE}${t("charactersInIt")}`
        );*/
        setErrorMsg({
          ...errorMsg,
          [e.target.name]: `${val}${SPACE}${t("cannotContain")}${SPACE}${
            regexObj[e.target.name].charRestricted
          }${SPACE}${t("charactersInIt")}`,
        });
      } else {
        setErrorMsg({
          ...errorMsg,
          [e.target.name]: `${t("AllCharactersAreAllowedExcept")}${SPACE}${
            regexObj[e.target.name].charRestricted
          }${SPACE}${t("AndFirstCharacterShouldBeAlphabet")}
        `,
        });
      }
    } else if (e.target.value?.length > 500) {
      // setErrorMsg(`${t("max500CharAllowed")}`);
      setErrorMsg({
        ...errorMsg,

        [e.target.name]: `${t("max500CharAllowed")}`,
      });
    } else {
      setErrorMsg({ ...errorMsg, [e.target.name]: "" });
    }
    if (e.target.value == "") {
      setErrorMsg({ ...errorMsg, [e.target.name]: "" });
    }
  };

  return (
    <div className={styles.mainDiv}>
      <div className={styles.headerDiv}>
        <Grid container xs={12} justifyContent="space-between" spacing={1}>
          <Grid item xs={1}>
            <p
              className={
                direction === RTL_DIRECTION
                  ? arabicStyles.iconDiv
                  : styles.iconDiv
              }
            ></p>
          </Grid>
          <Grid item xs={3} md={2}>
            <label
              className={
                direction === RTL_DIRECTION
                  ? arabicStyles.variableName
                  : styles.variableName
              }
              htmlFor="pmweb_external_userdef_appName"
            >
              {t("applicationName")}
            </label>
          </Grid>
          <Grid item xs={3} md={2}>
            <label
              className={
                direction === RTL_DIRECTION
                  ? arabicStyles.dataType
                  : styles.dataType
              }
              htmlFor="pmweb_external_userdef_method_name"
            >{`${t("method")} ${t("name")}`}</label>
          </Grid>
          <Grid item xs={2} md={2}>
            <label
              className={
                direction === RTL_DIRECTION
                  ? arabicStyles.variableLength
                  : styles.variableLength
              }
              htmlFor="pmweb_external_userdef_returnType"
            >
              {t("returnType")}
            </label>
          </Grid>
          <Grid item md={5} xs={3}>
            <p
              className={
                direction === RTL_DIRECTION
                  ? arabicStyles.variableLength
                  : styles.variableLength
              }
            ></p>
          </Grid>
        </Grid>
      </div>
      <div className={styles.bodyDiv}>
        {primaryInputStrip ? (
          <div className={styles.inputStrip}>
            <div className={styles.dataDiv}>
              <Grid
                container
                xs={12}
                justifyContent="space-between"
                spacing={1}
              >
                <Grid item xs={1}>
                  <p
                    className={
                      direction === RTL_DIRECTION
                        ? arabicStyles.iconDiv
                        : styles.iconDiv
                    }
                  ></p>
                </Grid>
                <Grid item xs={3} md={2}>
                  <p
                    className={
                      direction === RTL_DIRECTION
                        ? arabicStyles.variableNameData
                        : styles.variableNameData
                    }
                  >
                    <input
                      className={
                        direction === RTL_DIRECTION
                          ? arabicStyles.variableNameInput
                          : styles.variableNameInput
                      }
                      //code added on 16 June 2022 for BugId 110847
                      //code updated on 13 August 2022 for BugId 112903
                      autocomplete="off"
                      name="appName"
                      id="pmweb_external_userdef_appName"
                      value={data.appName}
                      onChange={(event) => {
                        validateData(event, t("applicationName"));
                        setData({
                          ...data,
                          [event.target.name]: event.target.value,
                        });
                      }}
                      ref={appNameRef}
                      onKeyPress={(e) =>
                        FieldValidations(e, 148, appNameRef.current, 500)
                      }
                    />
                    {errorMsg["appName"] ? (
                      <p
                        style={{
                          color: "red",
                          fontSize: "var(--sub_text_font_size)",
                          marginBottom: "0.5rem",
                          display: "block",
                          marginInlineStart:
                            direction === RTL_DIRECTION ? "5%" : null,
                          textWrap: "wrap",
                        }}
                      >
                        {errorMsg["appName"]}
                      </p>
                    ) : (
                      ""
                    )}
                  </p>
                </Grid>
                <Grid item xs={3} md={2}>
                  <p
                    className={
                      direction === RTL_DIRECTION
                        ? arabicStyles.dataTypeValue
                        : styles.dataTypeValue
                    }
                  >
                    <input
                      className={
                        direction === RTL_DIRECTION
                          ? arabicStyles.variableNameInput
                          : styles.variableNameInput
                      }
                      //code added on 16 June 2022 for BugId 110847
                      autocomplete="off"
                      name="methodName"
                      id="pmweb_external_userdef_method_name"
                      value={data.methodName}
                      onChange={(event) => {
                        validateData(event, `${t("method")} ${t("name")}`);
                        setData({
                          ...data,
                          [event.target.name]: event.target.value,
                        });
                      }}
                      ref={methodNameRef}
                      onKeyPress={(e) =>
                        FieldValidations(e, 152, methodNameRef.current, 500)
                      }
                    />
                    {errorMsg["methodName"] ? (
                      <p
                        style={{
                          color: "red",
                          fontSize: "var(--sub_text_font_size)",
                          marginBottom: "0.5rem",
                          display: "block",
                          marginInlineStart:
                            direction === RTL_DIRECTION ? "5%" : null,
                          textWrap: "wrap",
                        }}
                      >
                        {errorMsg["methodName"]}
                      </p>
                    ) : (
                      ""
                    )}
                  </p>
                </Grid>
                <Grid item xs={2} md={2}>
                  <p
                    //Bug 121789 - Setting Page: Service Catalog-Catalog issues
                    //[23-03-2023] Corrected the CSS - for correcting the Height of DropDown
                    className={
                      direction === RTL_DIRECTION
                        ? arabicStyles.returnTypeData
                        : styles.returnTypeData
                    }
                  >
                    {/* <Select
                      className={
                        direction === RTL_DIRECTION
                          ? `${arabicStyles.selectInput} selectInput`
                          : `${styles.selectInput} selectInput`
                      }
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
                      value={data.returnType}
                      name="returnType"
                      onChange={onChange}
                    >
                      <MenuItem value={""} style={{ display: "none" }}>
                        ""
                      </MenuItem>
                      {RETURN_TYPE_OPTIONS.map((opt) => {
                        return (
                          <MenuItem
                            className={
                              direction === RTL_DIRECTION
                                ? arabicStyles.dropdownData
                                : styles.dropdownData
                            }
                            value={t(getVariableType(opt))}
                          >
                            {t(getVariableType(opt))}
                          </MenuItem>
                        );
                      })}
                    </Select> */}
                    <CustomizedDropdown
                      variant="outlined"
                      defaultValue={"defaultValue"}
                      isNotMandatory={true}
                      className={
                        direction === RTL_DIRECTION
                          ? `${arabicStyles.selectInput} selectInput`
                          : `${styles.selectInput} selectInput`
                      }
                      value={data.returnType}
                      name="returnType"
                      onChange={onChange}
                      id="pmweb_external_userdef_returnType"
                    >
                      <MenuItem value={""} style={{ display: "none" }}>
                        ""
                      </MenuItem>
                      {RETURN_TYPE_OPTIONS.map((opt) => {
                        return (
                          <MenuItem
                            className={
                              direction === RTL_DIRECTION
                                ? arabicStyles.dropdownData
                                : styles.dropdownData
                            }
                            // Added on 19-09-2023 for bug_id:136526
                            value={getVariableType(opt)}
                            style={{
                              justifyContent:
                                direction === RTL_DIRECTION ? "end" : null,
                            }}
                            id={`pmweb_external_userdef_${opt}`}
                          >
                            {/* Added on 19-09-2023 for bug_id:136526  */}
                            {getVariableType(opt)}
                          </MenuItem>
                        );
                      })}
                    </CustomizedDropdown>
                  </p>
                </Grid>
                <Grid item xs={3} md={5}>
                  <Grid
                    container
                    xs={12}
                    justifyContent="space-between"
                    spacing={1}
                  >
                    <Grid item xs={1}>
                      <p
                        className={
                          direction === RTL_DIRECTION
                            ? arabicStyles.variableLengthData
                            : styles.variableLengthData
                        }
                      >
                        {/*code commented on 21 June 2022 for BugId 111099 */}
                        {/* <span
                  className={styles.paramArray}
                  style={{ textAlign: "left" }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="isGlobal"
                        checked={data.isGlobal}
                        onChange={(e) => {
                          setData((prev) => {
                            return {
                              ...prev,
                              isGlobal: !prev.isGlobal,
                            };
                          });
                        }}
                        id="isGlobalCheck_em"
                        color="primary"
                      />
                    }
                    className={
                      direction === RTL_DIRECTION
                        ? arabicStyles.properties_radioButton
                        : styles.properties_radioButton
                    }
                    label={t("globalMethod")}
                  />
                </span> */}
                      </p>
                    </Grid>
                    <Grid item xs={9}>
                      <p className={styles.addButtonDiv}>
                        <button
                          className={
                            data.appName.trim() === "" ||
                            data.methodName.trim() === "" ||
                            data.returnType === "" ||
                            /* added on 18-10-2023 for bug_id: 139364 */
                            errorMsg["appName"] ||
                            errorMsg["methodName"]
                              ? styles.disableMethodBtn
                              : styles.addMethodBtn
                          }
                          id={`pmweb_external_userDef_${props.id}_all`}
                          onClick={addExternalMethod}
                          disabled={
                            data.appName.trim() === "" ||
                            data.methodName.trim() === "" ||
                            data.returnType === "" ||
                            /* added on 18-10-2023 for bug_id: 139364 */
                            errorMsg["appName"] ||
                            errorMsg["methodName"]
                          }
                        >
                          + {t("add")} {t("method")}
                        </button>
                      </p>
                    </Grid>
                    <Grid item xs={2}>
                      <p className={styles.closeIconButtonDiv}>
                        <button
                          className={styles.closeButton}
                          onClick={() => {
                            setPrimaryInputStrip(false);
                          }}
                          id="pmweb_external_userDef_Close"
                        >
                          <span style={{ display: "none" }}>ji</span>
                          <CloseIcon className={styles.closeIcon} />
                        </button>
                      </p>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </div>
            <div className={styles.dataDiv}>
              {data.paramList?.length > 0 ? (
                <div
                  className={
                    direction === RTL_DIRECTION
                      ? arabicStyles.paramAddDiv
                      : styles.paramAddDiv
                  }
                  // added on 28-9-2023 for bug_id:138194
                  style={{ width: smallScreen ? "82vw" : "41vw" }}
                >
                  <span
                    className={
                      direction === RTL_DIRECTION
                        ? arabicStyles.paramDefinition
                        : styles.paramDefinition
                    }
                  >
                    {t("Parameter")} {t("definition")}
                  </span>
                  <span
                    className={styles.addParamBtn}
                    onClick={addParam}
                    id="pmweb_external_userDef_AddParamBtn"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        addParam();
                        e.stopPropagation();
                      }
                    }}
                  >
                    {t("add")}
                  </span>
                </div>
              ) : (
                <span
                  className={
                    direction === RTL_DIRECTION
                      ? arabicStyles.addParametersBtn
                      : styles.addParametersBtn
                  }
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      addParam();
                      e.stopPropagation();
                    }
                  }}
                  onClick={addParam}
                >
                  {t("addDataObject")} {t("Parameters")}
                </span>
              )}
            </div>
            {data.paramList?.length > 0 ? (
              <div
                className={
                  direction === RTL_DIRECTION
                    ? arabicStyles.paramDiv
                    : styles.paramDiv
                }
                // added on 28-9-2023 for bug_id:138194
                style={{ width: smallScreen ? "100%" : "41vw" }}
              >
                {/* added grid mediaquery for bug_id: 138194 */}
                <div className={styles.paramHeadDiv}>
                  <Grid
                    container
                    xs={12}
                    justifyContent="space-between"
                    spacing={1}
                  >
                    <Grid item xs={4}>
                      <label
                        htmlFor="pmweb_external_userDef_paramName"
                        className={styles.paramName}
                      >
                        {t("name")}
                      </label>
                    </Grid>
                    <Grid item xs={4}>
                      <label
                        className={
                          direction === RTL_DIRECTION
                            ? arabicStyles.paramType
                            : styles.paramType
                        }
                        htmlFor="pmweb_external_userDef_paramType"
                      >
                        {t("type")}
                      </label>
                    </Grid>
                    <Grid item xs={2}>
                      <label
                        className={styles.paramArray}
                        htmlFor="pmweb_external_userDef_paramisArray"
                      >
                        {t("array")}
                      </label>
                    </Grid>
                    <Grid item xs={2}>
                      <span
                        className={
                          direction === RTL_DIRECTION
                            ? arabicStyles.paramMoreDiv
                            : styles.paramMoreDiv
                        }
                      ></span>
                    </Grid>
                  </Grid>
                </div>
                <div className={styles.paramBodyDiv}>
                  {data.paramList?.map((param, index) => {
                    return (
                      <div className={styles.paramRow}>
                        <Grid
                          container
                          xs={12}
                          justifyContent="space-between"
                          spacing={1}
                        >
                          <Grid item xs={4}>
                            <span
                              className={styles.paramName}
                              style={{
                                display: "flex",
                                flexDirection: "column",
                              }}
                            >
                              <input
                                className={
                                  direction === RTL_DIRECTION
                                    ? arabicStyles.variableNameInput
                                    : styles.variableNameInput
                                }
                                name="paramName"
                                value={param.paramName}
                                onChange={(event) => {
                                  validateData(event, t("name"));
                                  onParamChange(
                                    index,
                                    event,
                                    event.target.value
                                  );
                                }}
                                id="pmweb_external_userDef_paramName"
                                ref={paramNameRef}
                                onKeyPress={(e) =>
                                  FieldValidations(
                                    e,
                                    152,
                                    paramNameRef.current,
                                    500
                                  )
                                }
                              />
                              {errorMsg["paramName"] ? (
                                <p
                                  style={{
                                    color: "red",
                                    fontSize: "var(--sub_text_font_size)",
                                    // marginBottom: "0.5rem",
                                    display: "inline-block",
                                    textWrap: "wrap",
                                    marginInlineStart:
                                      direction === RTL_DIRECTION ? "5%" : null,
                                  }}
                                >
                                  {errorMsg["paramName"]}
                                </p>
                              ) : (
                                ""
                              )}
                            </span>
                          </Grid>
                          <Grid item xs={4}>
                            <span
                              className={
                                direction === RTL_DIRECTION
                                  ? arabicStyles.paramType
                                  : styles.paramType
                              }
                            >
                              <CustomizedDropdown
                                className={
                                  direction === RTL_DIRECTION
                                    ? `${arabicStyles.selectInput} selectInput`
                                    : `${styles.selectInput} selectInput`
                                }
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
                                name="paramType"
                                value={param.paramType}
                                onChange={(e) =>
                                  onParamChange(index, e, e.target.value)
                                }
                                ariaLabel="Select paramType"
                                id="pmweb_external_userDef_paramType"
                              >
                                {RETURN_TYPE_OPTIONS.map((opt) => {
                                  return (
                                    <MenuItem
                                      className={
                                        direction === RTL_DIRECTION
                                          ? arabicStyles.dropdownData
                                          : styles.dropdownData
                                      }
                                      // Added on 19-09-2023 for bug_id:136526
                                      value={getVariableType(opt)}
                                      id={`pmweb_external_userDef_${opt}`}
                                      style={{
                                        display: "flex",
                                        justifyContent:
                                          direction === RTL_DIRECTION
                                            ? "end"
                                            : null,
                                      }}
                                    >
                                      {/* Added on 19-09-2023 for bug_id:136526  */}
                                      {getVariableType(opt)}
                                    </MenuItem>
                                  );
                                })}
                              </CustomizedDropdown>
                            </span>
                          </Grid>
                          <Grid item xs={2}>
                            <span className={styles.paramArray}>
                              <Checkbox
                                name="isArray"
                                checked={param.isArray}
                                onChange={(e) =>
                                  onParamChange(index, e, e.target.checked)
                                }
                                className={
                                  direction === RTL_DIRECTION
                                    ? arabicStyles.properties_radioButton
                                    : styles.properties_radioButton
                                }
                                color="primary"
                                id="pmweb_external_userDef_paramisArray"
                              />
                            </span>
                          </Grid>
                          <Grid item xs={2}>
                            <span
                              className={
                                direction === RTL_DIRECTION
                                  ? arabicStyles.paramMoreDiv
                                  : styles.paramMoreDiv
                              }
                            >
                              <button
                                className={styles.closeButton}
                                onClick={() => removeParam(index)}
                                id="pmweb_external_userDef_paramClose"
                              >
                                <span style={{ display: "none" }}>jg</span>
                                <CloseIcon className={styles.closeIcon} />
                              </button>
                            </span>
                          </Grid>
                        </Grid>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
        <div className={styles.listDiv}>
          {methodList
            ?.filter((e) => e.AppType === USER_DEFINED_SCOPE)
            ?.map((d) => {
              return (
                <React.Fragment>
                  {editMethod?.MethodIndex === d.MethodIndex ? (
                    <div className={styles.inputStripEdit}>
                      <div className={styles.dataDiv}>
                        <Grid
                          container
                          xs={12}
                          justifyContent="space-between"
                          spacing={1}
                          style={{ marginTop: "0.5rem" }}
                        >
                          <Grid item xs={1}>
                            <p
                              className={
                                direction === RTL_DIRECTION
                                  ? arabicStyles.iconDiv
                                  : styles.iconDiv
                              }
                            ></p>
                          </Grid>
                          <Grid item xs={3} md={2}>
                            <p
                              className={
                                direction === RTL_DIRECTION
                                  ? arabicStyles.variableNameData
                                  : styles.variableNameData
                              }
                            >
                              <label
                                style={{ display: "none" }}
                                htmlFor="pmweb_external_userDef_editAppName"
                              >
                                Label
                              </label>
                              <input
                                value={editMethod.AppName}
                                disabled={true}
                                className={
                                  direction === RTL_DIRECTION
                                    ? arabicStyles.variableNameInput
                                    : styles.variableNameInput
                                }
                                id="pmweb_external_userDef_editAppName"
                              />
                            </p>
                          </Grid>
                          <Grid item xs={3} md={2}>
                            <p
                              className={
                                direction === RTL_DIRECTION
                                  ? arabicStyles.dataTypeValue
                                  : styles.dataTypeValue
                              }
                            >
                              <label
                                style={{ display: "none" }}
                                htmlFor="pmweb_external_userDef_editMethodName"
                              >
                                Label
                              </label>
                              <input
                                value={editMethod.MethodName}
                                disabled={true}
                                className={
                                  direction === RTL_DIRECTION
                                    ? arabicStyles.variableNameInput
                                    : styles.variableNameInput
                                }
                                id="pmweb_external_userDef_editMethodName"
                              />
                            </p>
                          </Grid>
                          <Grid item xs={2} md={2}>
                            <p
                              className={
                                direction === RTL_DIRECTION
                                  ? arabicStyles.returnTypeData
                                  : styles.returnTypeData
                              }
                            >
                              {/* <Select
                                className={
                                  direction === RTL_DIRECTION
                                    ? `${arabicStyles.selectInput} selectInput`
                                    : `${styles.selectInput} selectInput`
                                }
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
                                value={
                                  editMethod.ReturnType !== COMPLEX_VARTYPE
                                    ? getVariableType(editMethod.ReturnType)
                                    : t("Void")
                                }
                                onChange={(e) => {
                                  setEditMethod((prev) => {
                                    let newData = { ...prev };
                                    newData.ReturnType = getTypeByVariable(
                                      e.target.value
                                    );
                                    return newData;
                                  });
                                }}
                              >
                                {RETURN_TYPE_OPTIONS.map((opt) => {
                                  return (
                                    <MenuItem
                                      className={
                                        direction === RTL_DIRECTION
                                          ? arabicStyles.dropdownData
                                          : styles.dropdownData
                                      }
                                      value={t(getVariableType(opt))}
                                    >
                                      {t(getVariableType(opt))}
                                    </MenuItem>
                                  );
                                })}
                              </Select> */}
                              <CustomizedDropdown
                                variant="outlined"
                                defaultValue={"defaultValue"}
                                isNotMandatory={true}
                                className={
                                  direction === RTL_DIRECTION
                                    ? `${arabicStyles.selectInput} selectInput`
                                    : `${styles.selectInput} selectInput`
                                }
                                value={
                                  editMethod.ReturnType !== COMPLEX_VARTYPE
                                    ? getVariableType(editMethod.ReturnType)
                                    : t("Void")
                                }
                                onChange={(e) => {
                                  setEditMethod((prev) => {
                                    let newData = { ...prev };
                                    newData.ReturnType = getTypeByVariable(
                                      e.target.value
                                    );
                                    return newData;
                                  });
                                }}
                                id="pmweb_external_userDef_edit_returnType"
                              >
                                {RETURN_TYPE_OPTIONS.map((opt) => {
                                  return (
                                    <MenuItem
                                      className={
                                        direction === RTL_DIRECTION
                                          ? arabicStyles.dropdownData
                                          : styles.dropdownData
                                      }
                                      // Added on 19-09-2023 for bug_id:136526
                                      value={getVariableType(opt)}
                                      style={{
                                        justifyContent:
                                          direction === RTL_DIRECTION
                                            ? "end"
                                            : null,
                                      }}
                                      id={`pmweb_external_userDef_edit_returnType_${opt}`}
                                    >
                                      {/* Added on 19-09-2023 for bug_id:136526  */}
                                      {getVariableType(opt)}
                                    </MenuItem>
                                  );
                                })}
                              </CustomizedDropdown>
                            </p>
                          </Grid>
                          <Grid item xs={3} md={5}>
                            <Grid
                              container
                              xs={12}
                              justifyContent="space-between"
                            >
                              <Grid item xs={1}>
                                <p
                                  className={
                                    direction === RTL_DIRECTION
                                      ? arabicStyles.variableLengthData
                                      : styles.variableLengthData
                                  }
                                >
                                  {/*code commented on 21 June 2022 for BugId 111099 */}
                                  {/* <span
                            className={styles.paramArray}
                            style={{ textAlign: "left" }}
                          >
                            <FormControlLabel
                              control={
                                <Checkbox
                                  name="isGlobal"
                                  checked={
                                    editMethod.MethodType === GLOBAL_SCOPE
                                  }
                                  disabled={true}
                                  color="primary"
                                />
                              }
                              className={
                                direction === RTL_DIRECTION
                                  ? arabicStyles.properties_radioButton
                                  : styles.properties_radioButton
                              }
                              label={t("globalMethod")}
                            />
                          </span> */}
                                </p>
                              </Grid>
                              <Grid item xs={9}>
                                <p className={styles.addButtonDiv}></p>
                              </Grid>
                              <Grid item xs={2}>
                                <p className={styles.closeIconButtonDiv}>
                                  <button
                                    className={styles.closeButton}
                                    onClick={() => {
                                      setEditMethod(null);
                                    }}
                                    id="pmweb_external_userDef_edit_Close"
                                    style={{ marginRight: "0.5vw" }}
                                  >
                                    <span style={{ display: "none" }}>
                                      Button
                                    </span>
                                    <CloseIcon className={styles.closeIcon} />
                                  </button>
                                  <button
                                    className={styles.closeButton}
                                    onClick={modifyExternalMethod}
                                    id="pmweb_external_userDef_edit_OK"
                                  >
                                    <span style={{ display: "none" }}>
                                      Button
                                    </span>
                                    <DoneIcon className={styles.closeIcon} />
                                  </button>
                                </p>
                              </Grid>
                            </Grid>
                          </Grid>
                        </Grid>
                      </div>
                      <div className={styles.dataDiv}>
                        {editMethod.Parameter?.length > 0 ? (
                          <div className={styles.paramAddDiv}>
                            <span
                              className={
                                direction === RTL_DIRECTION
                                  ? arabicStyles.paramDefinition
                                  : styles.paramDefinition
                              }
                            >
                              {t("Parameter")} {t("definition")}
                            </span>
                            <span
                              className={styles.addParamBtn}
                              onClick={addParamInEditMethod}
                            >
                              {t("add")}
                            </span>
                          </div>
                        ) : (
                          <span
                            className={
                              direction === RTL_DIRECTION
                                ? arabicStyles.addParametersBtn
                                : styles.addParametersBtn
                            }
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                addParamInEditMethod();
                                e.stopPropagation();
                              }
                            }}
                            onClick={addParamInEditMethod}
                          >
                            {t("addDataObject")} {t("Parameters")}
                          </span>
                        )}
                      </div>
                      {editMethod.Parameter?.length > 0 ? (
                        <div
                          className={
                            direction === RTL_DIRECTION
                              ? arabicStyles.paramEditDiv
                              : styles.paramEditDiv
                          }
                        >
                          <div className={styles.paramHeadDiv}>
                            {/* Added on 16/10/2023 for bug_id: 139364 */}
                            <Grid
                              container
                              xs={12}
                              spacing={1}
                              justifyContent="space-between"
                            >
                              <Grid item xs={4}>
                                <label
                                  className={styles.paramName}
                                  htmlFor="pmweb_external_userDef_edit_paramName"
                                >
                                  {t("name")}
                                </label>
                              </Grid>
                              <Grid item xs={4}>
                                <label
                                  className={
                                    direction === RTL_DIRECTION
                                      ? arabicStyles.paramType
                                      : styles.paramType
                                  }
                                  htmlFor="pmweb_external_userDef_edit_paramType"
                                >
                                  {t("type")}
                                </label>
                              </Grid>
                              <Grid item xs={2}>
                                <label
                                  className={styles.paramArray}
                                  htmlFor="pmweb_external_userDef_edit_paramArray"
                                >
                                  {t("array")}
                                </label>
                              </Grid>
                              <Grid item xs={2}>
                                <span
                                  className={
                                    direction === RTL_DIRECTION
                                      ? arabicStyles.paramMoreDiv
                                      : styles.paramMoreDiv
                                  }
                                ></span>
                              </Grid>
                            </Grid>
                          </div>
                          <div className={styles.paramBodyDiv}>
                            {editMethod.Parameter?.map((param, index) => {
                              return (
                                <div className={styles.paramRow}>
                                  <Grid
                                    container
                                    xs={12}
                                    spacing={1}
                                    justifyContent="space-between"
                                  >
                                    <Grid item xs={4}>
                                      <span className={styles.paramName}>
                                        <input
                                          className={
                                            direction === RTL_DIRECTION
                                              ? arabicStyles.variableNameInput
                                              : styles.variableNameInput
                                          }
                                          name="ParamName"
                                          ref={errorParamNameref} //added on 6/2/2024 for bug_id: 143316
                                          value={param.ParamName}
                                          onChange={(e) =>
                                            onParamChangeInEditMethod(
                                              index,
                                              e,
                                              e.target.value
                                            )
                                          }
                                          id="pmweb_external_userDef_edit_paramName"
                                        />
                                      </span>
                                    </Grid>
                                    <Grid item xs={4}>
                                      <span
                                        className={
                                          direction === RTL_DIRECTION
                                            ? arabicStyles.paramType
                                            : styles.paramType
                                        }
                                      >
                                        {/*code updated on 27 October 2022 for BugId 116894*/}
                                        <CustomizedDropdown
                                          className={
                                            direction === RTL_DIRECTION
                                              ? `${arabicStyles.selectInput} selectInput`
                                              : `${styles.selectInput} selectInput`
                                          }
                                          validationBoolean={
                                            checktypeValidation
                                          } // added on 6/2/2024 for bug_id: 143316
                                          name="ParamType"
                                          //value={getVariableType(param.ParamType)}
                                          //value={checkParamType(param.ParamType)}
                                          value={param.ParamType}
                                          onChange={(e) =>
                                            onParamChangeInEditMethod(
                                              index,
                                              e,
                                              e.target.value
                                            )
                                          }
                                          id="pmweb_external_userDef_edit_paramType"
                                        >
                                          {RETURN_TYPE_OPTIONS.map((opt) => {
                                            return (
                                              <MenuItem
                                                className={
                                                  direction === RTL_DIRECTION
                                                    ? arabicStyles.dropdownData
                                                    : styles.dropdownData
                                                }
                                                //value={t(getVariableType(opt))}
                                                value={opt}
                                                id={`pmweb_external_userDef_edit_paramType_${opt}`}
                                              >
                                                {/* Added on 19-09-2023 for bug_id:136526  */}
                                                {getVariableType(opt)}
                                              </MenuItem>
                                            );
                                          })}
                                        </CustomizedDropdown>
                                      </span>
                                    </Grid>
                                    <Grid item xs={2}>
                                      <span className={styles.paramArray}>
                                        <Checkbox
                                          name="Unbounded"
                                          checked={param.Unbounded === "Y"}
                                          onChange={(e) =>
                                            onParamChangeInEditMethod(
                                              index,
                                              e,
                                              e.target.checked ? "Y" : "N"
                                            )
                                          }
                                          className={
                                            direction === RTL_DIRECTION
                                              ? arabicStyles.properties_radioButton
                                              : styles.properties_radioButton
                                          }
                                          color="primary"
                                          id="pmweb_external_userDef_edit_paramArray"
                                        />
                                      </span>
                                    </Grid>
                                    <Grid item xs={2}>
                                      <span
                                        className={
                                          direction === RTL_DIRECTION
                                            ? arabicStyles.paramMoreDiv
                                            : styles.paramMoreDiv
                                        }
                                      >
                                        <button
                                          className={styles.closeButton}
                                          id={`pmweb_external_userDef_emUD_${d.MethodName}_removeParamInEdit`}
                                          onClick={() =>
                                            removeParamInEditMethod(index)
                                          }
                                        >
                                          <span style={{ display: "none" }}>
                                            CloseBTn
                                          </span>
                                          <CloseIcon
                                            className={styles.closeIcon}
                                          />
                                        </button>
                                      </span>
                                    </Grid>
                                  </Grid>
                                  {/* till here for bug_id: 139364 */}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <div className={styles.dataDiv}>
                      <Grid
                        container
                        xs={12}
                        justifyContent="space-between"
                        spacing={1}
                      >
                        <Grid item xs={1}>
                          <p
                            className={
                              direction === RTL_DIRECTION
                                ? arabicStyles.iconDiv
                                : styles.iconDiv
                            }
                          >
                            {d.MethodType === GLOBAL_SCOPE ? (
                              <ParamTooltip
                                enterDelay={500}
                                arrow
                                placement="bottom"
                                title={t("globalMethod")}
                              >
                                <PublicIcon className={styles.globalVarIcon} />
                              </ParamTooltip>
                            ) : (
                              <img
                                className={styles.globalVarIcon}
                                src={UserDefinedIcon}
                                alt="UserDefinedIcon"
                              />
                            )}
                          </p>
                        </Grid>
                        {/*Added tootlip for bugID 138197  on 25-09-2023*/}
                        <Grid item xs={3} md={2}>
                          <LightTooltip title={d.AppName}>
                            <p
                              className={
                                direction === RTL_DIRECTION
                                  ? arabicStyles.variableNameData
                                  : styles.variableNameData
                              }
                            >
                              {d.AppName}
                            </p>
                          </LightTooltip>
                        </Grid>
                        <Grid item xs={3} md={2}>
                          <LightTooltip title={d.MethodName}>
                            <p
                              className={
                                direction === RTL_DIRECTION
                                  ? arabicStyles.dataTypeValue
                                  : styles.dataTypeValue
                              }
                            >
                              {d.MethodName}
                            </p>
                          </LightTooltip>
                        </Grid>
                        {/*till here for bugID 138197 */}
                        <Grid item xs={2} md={2}>
                          <p
                            className={
                              direction === RTL_DIRECTION
                                ? arabicStyles.variableLengthData
                                : styles.variableLengthData
                            }
                          >
                            {d?.ReturnType?.trim() !== ""
                              ? getVariableType(d.ReturnType)
                              : t("Void")}
                          </p>
                        </Grid>
                        <Grid item xs={3} md={5}>
                          <Grid
                            container
                            xs={12}
                            justifyContent="space-between"
                          >
                            <Grid item xs={1}>
                              <p
                                className={
                                  direction === RTL_DIRECTION
                                    ? arabicStyles.variableLengthData
                                    : styles.variableLengthData
                                }
                              >
                                {d.Parameter?.length > 0 ? (
                                  d.Parameter.length > 1 ? (
                                    <ParamTooltip
                                      enterDelay={500}
                                      arrow
                                      placement={
                                        direction === RTL_DIRECTION
                                          ? "left"
                                          : "right"
                                      }
                                      title={
                                        <React.Fragment>
                                          <ParamDivOnHover
                                            parameters={d.Parameter}
                                          />
                                        </React.Fragment>
                                      }
                                    >
                                      <span
                                        className={
                                          direction === RTL_DIRECTION
                                            ? arabicStyles.paramCount
                                            : styles.paramCount
                                        }
                                      >
                                        {t("accepts")} {d.Parameter.length}{" "}
                                        {t("parameters")}
                                      </span>
                                    </ParamTooltip>
                                  ) : (
                                    <ParamTooltip
                                      enterDelay={500}
                                      arrow
                                      placement={
                                        direction === RTL_DIRECTION
                                          ? "left"
                                          : "right"
                                      }
                                      title={
                                        <React.Fragment>
                                          <ParamDivOnHover
                                            parameters={d.Parameter}
                                          />
                                        </React.Fragment>
                                      }
                                    >
                                      <span
                                        className={
                                          direction === RTL_DIRECTION
                                            ? arabicStyles.paramCount
                                            : styles.paramCount
                                        }
                                      >
                                        {t("accepts")} 1 {t("parameter")}
                                      </span>
                                    </ParamTooltip>
                                  )
                                ) : null}
                              </p>
                            </Grid>
                            <Grid item xs={9}>
                              <p className={styles.addButtonDiv}></p>
                            </Grid>
                            {!isReadOnly && (
                              <Grid>
                                <p className={styles.closeIconButtonDiv}>
                                  <button
                                    className={styles.btnIcon}
                                    id={`pmweb_external_userDef_emUD_${d.MethodName}_editBtn`}
                                    onClick={() => setEditMethod(d)}
                                    style={{ marginRight: "0.5vw" }}
                                  >
                                    <span style={{ display: "none" }}>
                                      EditButton
                                    </span>
                                    <EditIcon className={styles.closeIcon} />
                                  </button>
                                  <button
                                    className={styles.btnIcon}
                                    id={`pmweb_external_userDef_emUD_${d.MethodName}_deleteBtn`}
                                    onClick={() => deleteExternalMethod(d)}
                                  >
                                    <span style={{ display: "none" }}>
                                      DeleteButton
                                    </span>
                                    <DeleteOutlinedIcon
                                      className={styles.closeIcon}
                                    />
                                  </button>
                                </p>
                              </Grid>
                            )}
                          </Grid>
                        </Grid>
                      </Grid>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
        </div>
      </div>

      {showDependencyModal ? (
        <DefaultModal
          show={showDependencyModal}
          style={{
            width: "45vw",
            left: "28%",
            top: "21.5%",
            padding: "0",
          }}
          modalClosed={() => setShowDependencyModal(false)}
          children={
            <ObjectDependencies
              {...props}
              processAssociation={taskAssociation}
              cancelFunc={() => setShowDependencyModal(false)}
            />
          }
        />
      ) : null}
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    openProcessID: state.openProcessClick.selectedId,
    openProcessType: state.openProcessClick.selectedType,
  };
};

export default connect(mapStateToProps)(UserDefined);
