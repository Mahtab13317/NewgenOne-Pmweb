// #BugID - 124044
// #BugDescription - Added validation for combobox while not define.

// #BugID - 124738
// #BugDescription - Fixed the issue for New task: not able to map variable in one go after creating the form.

// #BugID - 119110
// #BugDescription - Pmweb-task form integration: wrong validation message is appearing while naming the variables issue fixed

// #BugID - 126278
// #BugDescription - Changes made in task>>import form>>form is imported but while saving the changes validation is appearing to add new form

import React, { useState, useEffect, useRef } from "react";
import { Button, Grid, Typography } from "@material-ui/core";
import "../../Properties.css";
import styles from "./index.module.css";
import { useTranslation } from "react-i18next";
import { connect, useDispatch, useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import { store, useGlobalState } from "state-pool";
import * as actionCreatorsDrawer from "../../../../redux-store/actions/Properties/showDrawerAction.js";
import CircularProgress from "@material-ui/core/CircularProgress";
import {
  BASE_URL,
  ENDPOINT_TASK_FORM,
  ENDPOINT_TASK_TEMPLATE_FORM,
  RTL_DIRECTION,
  SPACE,
  headerHeight,
  propertiesLabel,
} from "../../../../Constants/appConstants.js";
import {
  ActivityPropertyChangeValue,
  setActivityPropertyChange,
} from "../../../../redux-store/slices/ActivityPropertyChangeSlice";
import {
  ActivityPropertySaveCancelValue,
  setSave,
} from "../../../../redux-store/slices/ActivityPropertySaveCancelClicked.js";
import Field from "../../../../UI/InputFields/TextField/Field.js";
import {
  DeleteIcon,
  HorizontalMoreIcon,
} from "../../../../utility/AllImages/AllImages.js";
import ComboValuesModal from "./ComboValuesModal.js";
import FormBuilderModal from "./FormBuilderModal.js";
import PreviewHtmlModal from "./PreviewHtmlModal.js";
import { REGEX, PMWEB_ARB_REGEX } from "../../../../validators/validator";
import { setToastDataFunc } from "../../../../redux-store/slices/ToastDataHandlerSlice";
import { getSelectedCellType } from "../../../../utility/abstarctView/getSelectedCellType";
import axios from "axios";
import TabsHeading from "../../../../UI/TabsHeading";
import {
  isArabicLocaleSelected,
  isProcessDeployedFunc,
} from "../../../../utility/CommonFunctionCall/CommonFunctionCall";
import { FieldValidations } from "../../../../utility/FieldValidations/fieldValidations";

const useStyles = makeStyles((props) => ({
  input: {
    height: "var(--line_height)",
  },
  inputWithError: {
    height: "var(--line_height)",
    width: "4.875rem",
  },
  errorStatement: {
    color: "red",
    fontSize: "11px",
  },
  mainDiv: {
    overflowY: "auto",
    overflowX: "hidden",
    display: "flex",
    flexDirection: "column",
    /* code edited on 6 July 2023 for issue - save and 
    discard button hide issue in case of tablet(landscape mode)*/
    height: (props) =>
      `calc((${props.windowInnerHeight}px - ${headerHeight}) - 13rem)`,
    fontFamily: "Open Sans",
    width: "100%",

    direction: props.direction,
    "&::-webkit-scrollbar": {
      backgroundColor: "#ffffff",
      width: "0.475rem",
      height: "1.125rem",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "#8c8c8c !important",
      borderRadius: "0.313rem",
    },
    "&:hover::-webkit-scrollbar": {
      overflowY: "visible",
      width: "0.475rem",
      height: "1.125rem",
    },
    "&:hover::-webkit-scrollbar-thumb": {
      background: "#8c8c8c 0% 0% no-repeat padding-box !important",
      borderRadius: "0.313rem",
    },
  },
  GroupTitleMain: {
    fontWeight: 700,
    color: "#606060",
    fontSize: "var(--subtitle_text_font_size)",
  },
  btnIcon: {
    cursor: "pointer",
    height: "28px",
    width: "28px",
    border: "1px solid #CECECE",
  },
  GroupTitleSecondary: {
    fontWeight: 600,
    color: "#000000",
    fontSize: "var(--subtitle_text_font_size)",
  },
  disabled: {
    pointerEvents: "none",
  },
  deleteBtn: {
    width: "1.25rem",
    height: "1.25rem",
  },
  starIcon: {
    color: "red",
    marginInlineStart: "0.25vw",
    fontSize: "1rem",
    fontWeight: "600",
  },
  horizontalScrolls: {
    overflowX: "auto",
    overflowY: "auto",
    display: "grid",
    gap: "1rem",
    gridAutoFlow: "column",
    gridAutoColumns: "184%",
    overscrollBehaviorInline: "contain",
    alignContent: "space-between",
    "&::-webkit-scrollbar": {
      backgroundColor: "transparent",
      width: ".5rem",
      height: ".6rem !important",
    },
    "&::-webkit-scrollbar-thumb": {
      background: "#dadada 0% 0% no-repeat padding-box !important",
      borderRadius: "0.313rem",
      border: "0",
    },
    scrollbarColor: "#dadada #fafafa",
    scrollbarWidth: "thin",
  },
  trPadding: {
    padding: "1rem",
  },
  tdPadding: {
    padding: ".25rem",
  },
}));

function TaskData(props) {
  let { t } = useTranslation();
  const dispatch = useDispatch();
  const direction = `${t("HTML_DIR")}`;
  const fileRef = useRef();
  // changes added for bug_id: 134226
  const windowInnerHeight = useSelector(
    (state) => state.setWindowInnerHeight.windowInnerHeight
  );
  const classes = useStyles({
    ...props,
    direction,
    windowInnerHeight: windowInnerHeight,
  });
  const loadedProcessData = store.getState("loadedProcessData"); //current processdata clicked
  const localActivityPropertyData = store.getState("activityPropertyData");
  const [localLoadedActivityPropertyData, setlocalLoadedActivityPropertyData] =
    useGlobalState(localActivityPropertyData);
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const saveCancelStatus = useSelector(ActivityPropertySaveCancelValue);
  const saveBtnModified = useSelector(ActivityPropertyChangeValue);
  const [spinner, setspinner] = useState(true);
  const [formType, setFormType] = useState("htmlForm");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isComboModalOpen, setIsComboModalOpen] = useState(false);
  const [selectedComboVar, setSelectedComboVar] = useState(null);
  const [importedFile, setImportedFile] = useState(null);
  const [taskVariablesList, setTaskVariablesList] = useState([]);
  let isReadOnly =
    props.openTemplateFlag || isProcessDeployedFunc(localLoadedProcessData);
  const radioButtonsArrayFormType = [
    { label: `${t("html")} ${t("Form")}`, value: "htmlForm" },
    { label: t("Form"), value: "form" },
  ];

  const variableRef = useRef();
  const displayRef = useRef();
  const variableNameRef = useRef([]);
  const displayNameRef = useRef([]);

  useEffect(() => {
    if (saveCancelStatus.SaveOnceClicked) {
      const formType = localLoadedActivityPropertyData?.taskGenPropInfo
        ?.taskTemplateInfo?.m_bGlobalTemplate
        ? localLoadedActivityPropertyData.taskGenPropInfo.taskTemplateInfo
            .m_bCustomFormAssoc
        : localLoadedActivityPropertyData?.taskGenPropInfo?.bTaskFormView;
      let checkVal = validateFields(
        localLoadedActivityPropertyData?.taskGenPropInfo?.taskTemplateInfo
          ?.m_arrTaskTemplateVarList,
        true,
        formType ? "form" : "htmlForm"
      );
      if (!checkVal?.isValid) {
        dispatch(
          setActivityPropertyChange({
            [propertiesLabel.taskData]: {
              isModified: true,
              hasError: true,
            },
          })
        );
        if (checkVal.errorMsg) {
          dispatch(
            setToastDataFunc({
              message: checkVal.errorMsg,
              severity: "error",
              open: true,
            })
          );
        }
      } else {
        dispatch(
          setActivityPropertyChange({
            [propertiesLabel.taskData]: {
              isModified: true,
              hasError: false,
            },
          })
        );
      }
      dispatch(setSave({ SaveClicked: false }));
    }
  }, [saveCancelStatus.SaveClicked]);

  /*****************************************************************************************
   * @author asloob_ali BUG ID: 111500 Description: Task: Created variables are not saved in data tab
   * Reason:there was some mismatch in keys while saving the data.
   * Resolution : now adding data in proper key in task property object.
   * Date : 04/07/2022
   ****************/
  useEffect(() => {
    if (localLoadedActivityPropertyData) {
      const formView = localLoadedActivityPropertyData?.taskGenPropInfo
        ?.taskTemplateInfo?.m_bGlobalTemplate
        ? localLoadedActivityPropertyData.taskGenPropInfo.taskTemplateInfo
            .m_bCustomFormAssoc
        : localLoadedActivityPropertyData?.taskGenPropInfo?.bTaskFormView;

      setFormType(formView ? "form" : "htmlForm");
      if (!saveCancelStatus.SaveOnceClicked) {
        const taskDataVars =
          localLoadedActivityPropertyData.taskGenPropInfo?.taskTemplateInfo
            ?.m_arrTaskTemplateVarList || [];
        //keeping error object in every variable so that we can easily validate and show error
        setTaskVariablesList(taskDataVars);
      }
      setspinner(false);
    }
  }, [localLoadedActivityPropertyData]);

  const updateTaskTemplateVar = (taskVarList, isModified) => {
    const tempTaskProp = JSON.parse(
      JSON.stringify(localLoadedActivityPropertyData)
    );
    tempTaskProp.taskGenPropInfo.taskTemplateInfo.m_arrTaskTemplateVarList = [
      ...taskVarList,
    ];
    if (
      tempTaskProp?.taskGenPropInfo?.taskTemplateInfo?.m_strModifedStatus ===
        "N" &&
      isModified
    ) {
      tempTaskProp.taskGenPropInfo.taskTemplateInfo.m_strModifedStatus = "C";
    }
    setlocalLoadedActivityPropertyData(tempTaskProp);
    let checkVal = validateFields(taskVarList, false, formType);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.taskData]: {
          isModified: true,
          hasError: !checkVal?.isValid,
        },
      })
    );
  };
  const changeTaskVariableControlType = () => {
    const newTaskVarList = taskVariablesList.map((taskVar) => ({
      ...taskVar,
      m_iControlType: 1,
      m_strDisplayName: "",
    }));

    setTaskVariablesList(newTaskVarList);
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    const tempTaskProp = JSON.parse(
      JSON.stringify(localLoadedActivityPropertyData)
    );

    switch (name) {
      case "FormType":
        if (
          tempTaskProp?.taskGenPropInfo?.taskTemplateInfo?.m_bGlobalTemplate
        ) {
          tempTaskProp.taskGenPropInfo.taskTemplateInfo.m_bCustomFormAssoc =
            value === "form" ? true : false;
          tempTaskProp.taskGenPropInfo.taskTemplateInfo.m_bGlobalTemplateFormCreated =
            value === "form" ? true : false;
        } else {
          tempTaskProp.taskGenPropInfo.bTaskFormView =
            value === "form" ? true : false;
        }
        if (value === "form") {
          changeTaskVariableControlType();
        }
        break;
      default:
        break;
    }
    let checkVal = validateFields(taskVariablesList, false, value);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.taskData]: {
          isModified: true,
          hasError: !checkVal?.isValid,
        },
      })
    );
    setlocalLoadedActivityPropertyData(tempTaskProp);
  };

  const importTaskForm = async (file) => {
    const formData = new FormData();

    formData.append("file", file);
    formData.append("statusFlag", "P");
    formData.append("processDefId", localLoadedProcessData?.ProcessDefId);
    formData.append("taskId", props.cellID);
    const config = {
      headers: {
        "content-type": "multipart/form-data",
      },
    };
    if (file.size / 1024 / 1024 > 5) {
      dispatch(
        setToastDataFunc({
          message: t("fileSizeLarger5MB"),
          severity: "error",
          open: true,
        })
      );
    } else {
      try {
        const response = await axios.post(
          `${BASE_URL}${ENDPOINT_TASK_FORM}/`,
          formData,
          config
        );

        if (response.status === 200) {
          const tempTaskProp = JSON.parse(
            JSON.stringify(localLoadedActivityPropertyData)
          );
          tempTaskProp.taskGenPropInfo.taskFormId =
            response?.data?.processDefId + "";
          setlocalLoadedActivityPropertyData(tempTaskProp);
          dispatch(
            setToastDataFunc({
              message: response?.data?.message || "Form imported successfully",
              severity: "success",
              open: true,
            })
          );
        }
      } catch (err) {}
    }
  };

  const importTaskTemplateForm = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("statusflag", "P");
    formData.append("templatename", props.cellName);
    formData.append("templateid", props.cellID);
    const config = {
      headers: {
        "content-type": "multipart/form-data",
      },
    };
    try {
      const response = await axios.post(
        `${BASE_URL}${ENDPOINT_TASK_TEMPLATE_FORM}/`,
        formData,
        config
      );

      if (response.status === 200) {
        dispatch(
          setToastDataFunc({
            message: response?.data?.message || "Form imported successfully",
            severity: "success",
            open: true,
          })
        );
      }
    } catch (err) {}
  };

  const handleImportForm = async (e) => {
    const file = e.target.files[0];
    setImportedFile(file);
    if (file) {
      if (props.cellType === getSelectedCellType("TASK")) {
        importTaskForm(file);
      } else if (props.cellType === getSelectedCellType("TASKTEMPLATE")) {
        importTaskTemplateForm(file);
      }
    }
  };

  //code updated on 09 mar 2023 for BugId 124469
  const handleChangeVariable = (index, name, value) => {
    const newVar = global.structuredClone(taskVariablesList[index]);
    const newVars = [...taskVariablesList];
    newVar["error"] = {
      VariableName: newVar["error"]?.VariableName
        ? newVar["error"].VariableName
        : "",
      DisplayName: newVar["error"]?.DisplayName
        ? newVar["error"].DisplayName
        : "",
    };
    let varErr = "";
    let disErr = "";
    if (name === "m_strVariableName") {
      // Changes on 09-10-2023 to resolve the bug Id 135629
      if (value?.length > 50) {
        dispatch(
          setToastDataFunc({
            message: t("max50CharAllowed"),
            severity: "error",
            open: true,
          })
        );
        return;
      } else if (value !== "") {
        value = value.replace(/\s+/g, "");
        newVar[name] = value;
        varErr = validateProperties(value)
          ? `${t("startAlphaNumWithOnlyUnderscoreHiphenVar")}`
          : "";
        newVar.error.VariableName = varErr;
      } else {
        newVar.error.VariableName = t("variableNameEmptyError");
      }
    } else if (name === "m_strDisplayName") {
      // Changes on 09-10-2023 to resolve the bug Id 135629
      if (value?.length > 50) {
        dispatch(
          setToastDataFunc({
            message: t("max50CharAllowed"),
            severity: "error",
            open: true,
          })
        );
        return;
      } else if (value !== "") {
        disErr = validateProperties(value)
          ? `${t("startAlphaNumWithOnlyUnderscoreHiphenDisp")}` // added on 12/9/2023 for bug_id: 136922
          : "";
        newVar.error.DisplayName = disErr;
      } else {
        newVar.error.DisplayName = t("displayNameEmptyError");
      }
    }
    newVar[name] = value;
    newVars.splice(index, 1, newVar);
    updateTaskTemplateVar(newVars, true);
    let err = false;
    newVars.forEach((item) => {
      if (
        item.error &&
        (item.error?.VariableName !== "" || item.error?.DisplayName !== "")
      ) {
        err = true;
      }
      //code edited on 6 Jan 2022 for BugId 121805
      if (
        !item.m_strVariableName ||
        item.m_strVariableName?.trim() === "" ||
        ((!item.m_strDisplayName || item.m_strDisplayName?.trim() === "") &&
          formType === "htmlForm")
      ) {
        err = true;
      }
    });
    let checkVal = checkDuplicateValues(newVars);
    if (!checkVal?.isValid) {
      err = true;
    }
    let checkControl = checkControlType(newVars);
    if (!checkControl?.isValid) {
      err = true;
    }
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.taskData]: {
          isModified: true,
          hasError: err,
        },
      })
    );
  };

  const handlePreviewHtml = () => {
    if (taskVariablesList.length > 0) {
      setIsPreviewModalOpen(true);
    } else {
      dispatch(
        setToastDataFunc({
          message: `${t("NoVarError")}`,
          severity: "error",
          open: true,
        })
      );
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleClosePreviewModal = () => {
    setIsPreviewModalOpen(false);
  };

  const handleCloseComboModal = () => {
    setIsComboModalOpen(false);
    setSelectedComboVar(null);
  };

  const handleDelete = (index) => {
    let newVars = [...taskVariablesList];
    newVars.splice(index, 1);
    setTaskVariablesList(newVars);
    updateTaskTemplateVar(newVars);
  };

  const addVariable = () => {
    props.expandDrawer(true);
    const newVars = [...taskVariablesList];
    const ids = newVars.map((variable) => +variable.m_iOrderId);
    let maxId = Math.max(...ids);
    if (ids.length === 0) {
      maxId = 0;
    }
    const newVar = {
      m_bSelectVariable: false,
      m_strVariableName: "",
      m_strDisplayName: "",
      m_strVariableType: 10,
      m_iTemplateId: -1,
      m_iControlType: 1,
      m_strControlType: "",
      m_iOrderId: `${maxId + 1}`,
      m_strVarType: null,
      m_bRenderControl: false,
      m_arrComboPickList: [],
      m_strMappedVariable: "",
      m_arrPopulateProcVars: [],
      m_bReadOnly: false,
      m_iTempVarId: `${maxId + 1}`,
      m_strTaskDynamicQuery: "",
      m_strDBLinking: "N",
      m_bMandatory: false,
      m_strVarStatus: "",
      m_strShortVarName: "",
      m_strShortDispName: "",
      m_bDisableChkbox: false,
      taskStatus: "CREATED",
    };
    setTaskVariablesList([newVar, ...newVars]);
    updateTaskTemplateVar([newVar, ...newVars]);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.taskData]: {
          isModified: true,
          hasError: true,
        },
      })
    );
  };

  const handleFormLauncher = () => {
    if (saveBtnModified.taskData.isModified === true) {
      dispatch(
        setSave({
          SaveFormEnabled: true,
          saveFormCallBack: () => {
            setIsModalOpen(true);
          },
        })
      );
    } else {
      setIsModalOpen(true);
    }
  };

  const handleComboValues = (index) => {
    setSelectedComboVar(taskVariablesList[index]);
    setIsComboModalOpen(true);
  };

  // Function to check duplicate values.
  const checkDuplicateValues = (tempTaskVarList) => {
    const valueArr = tempTaskVarList.map(function (item) {
      return item.m_strVariableName;
    });
    let isDuplicate = valueArr.some(function (item, idx) {
      return valueArr.indexOf(item) != idx;
    });

    const duplicates = valueArr.filter(
      (item, index) => index !== valueArr.indexOf(item)
    );
    const varName = duplicates[0];
    if (isDuplicate) {
      return {
        isValid: false,
        errorMsg: t("sameNameVarErrorMsg"), //Modified on 23/09/2023, bug_id:137372
        //errorMsg: `Variable with the name ${varName} already exists`,
      };
    } else {
      return { isValid: true };
    }
  };

  const checkControlType = (tempTaskVarList) => {
    let varName = "";
    let hasError = false;
    tempTaskVarList.forEach((data, i) => {
      if (
        +data.m_iControlType === 3 &&
        data.m_arrComboPickList?.length === 0 &&
        data.m_strTaskDynamicQuery == ""
      ) {
        hasError = true;
        varName = data.m_strVariableName;
      }
    });

    if (hasError) {
      return {
        isValid: false,
        errorMsg: `${t("comboBoxErrorMsg")}${SPACE}${varName}`, //Modified on 23/09/2023, bug_id:137372
        //errorMsg: `Please define combobox in variable with the name ${varName}`,
      };
    } else {
      return { isValid: true };
    }
  };

  const handleSaveComboVal = (newComboVar) => {
    const newTaskVars = [...taskVariablesList];
    const comboIndex = taskVariablesList.findIndex(
      (variable) => variable.m_iOrderId === newComboVar.m_iOrderId
    );
    if (comboIndex !== -1) {
      newTaskVars.splice(comboIndex, 1, newComboVar);
    }
    setTaskVariablesList(newTaskVars);
    updateTaskTemplateVar(newTaskVars);
    setSelectedComboVar(null);
    setIsComboModalOpen(false);
  };

  const validateFields = (tempTaskVarList, showInlineErr, formTypeVal) => {
    if (tempTaskVarList.length === 0) {
      return {
        isValid: false,
        errorMsg: t("defineAtleastOneTaskVarError"),
      };
    } else {
      const newTaskVariableErrors = []; //errors list
      let hasErrorFlag = false;
      tempTaskVarList.forEach((taskVar) => {
        const newJson = { VariableName: "", DisplayName: "" };
        const VariableNameError =
          taskVar.m_strVariableName?.trim().length === 0
            ? `${t("variableNameEmptyError")}`
            : validateProperties(taskVar.m_strVariableName)
            ? `${t("startAlphaNumWithOnlyUnderscoreHiphenVar")}`
            : "";
        let DisplayNameError = "";
        if (formTypeVal === "htmlForm") {
          DisplayNameError =
            taskVar.m_strDisplayName.trim().length === 0
              ? `${t("displayNameEmptyError")}`
              : validateProperties(taskVar.m_strDisplayName)
              ? `${t("startAlphaNumWithOnlyUnderscoreHiphenDisp")}`
              : "";
          newJson["DisplayName"] = DisplayNameError;
        }
        if (VariableNameError || DisplayNameError) {
          hasErrorFlag = true;
        }
        newJson["VariableName"] = VariableNameError;
        if (showInlineErr) {
          taskVar.taskStatus = "ADDED";
        }
        const newTaskVar =
          taskVar.taskStatus === "CREATED"
            ? { ...taskVar }
            : { ...taskVar, error: newJson };
        newTaskVariableErrors.push(newTaskVar);
      });

      if (hasErrorFlag) {
        setTaskVariablesList([...newTaskVariableErrors]);
        return { isValid: false, errorMsg: null };
      } else {
        if (showInlineErr) {
          setTaskVariablesList([...newTaskVariableErrors]);
        } else {
          setTaskVariablesList([...tempTaskVarList]);
        }
        let checkVal = checkDuplicateValues(tempTaskVarList);
        if (!checkVal?.isValid) {
          return { isValid: false, errorMsg: checkVal.errorMsg };
        }

        let checkControl = checkControlType(tempTaskVarList);

        if (!checkControl?.isValid) {
          return { isValid: false, errorMsg: checkControl.errorMsg };
        }
      }
    }
    return { isValid: true };
  };
  // modified on 12/9/2023 for bug_id: 136922
  const validateProperties = (val) => {
    let isValidRegex;
    if (isArabicLocaleSelected()) {
      const regex = new RegExp(PMWEB_ARB_REGEX.canHaveUnderscoreAndDash);
      isValidRegex = !regex.test(val);
    } else {
      const regex = new RegExp(REGEX.StartWithAlphaThenAlphaNumAndOnlyUs, "u");
      isValidRegex = regex.test(val);
    }
    return isValidRegex ? false : true;
  };

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <TabsHeading heading={props?.heading} />
      {spinner ? (
        <CircularProgress
          style={{ marginTop: "30vh", marginInlineStart: "40%" }}
        />
      ) : (
        <div
          className={classes.mainDiv}
          style={{
            flexDirection: props.isDrawerExpanded ? "row" : "column",
          }}
        >
          <div
            style={{
              marginLeft: "0.5vw",
              marginRight: "0.5vw",
              height: "100%",
              width: props.isDrawerExpanded ? "100%" : null,
              paddingTop: props.isDrawerExpanded ? "0.5rem" : "0.25rem",
              direction: direction === RTL_DIRECTION ? "rtl" : "ltr",
            }}
          >
            <Grid item>
              {/* <Grid container alignItems="center"> */}
              {/* <Grid item> */}
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Field
                  radio={true}
                  ButtonsArray={radioButtonsArrayFormType}
                  name="FormType"
                  label={`${t("Form")} ${t("type")}`}
                  value={formType}
                  onChange={handleChange}
                  disabled={isReadOnly}
                  id="pmweb_taskdata_formtype_radiobutton_field"
                />
                {/* </Grid> */}
                {!isReadOnly && (
                  <div>
                    {formType === "htmlForm" ? (
                      <Grid
                        item
                        style={{
                          marginInlineStart: props.isDrawerExpanded
                            ? null
                            : "auto",
                          paddingInlineEnd: props.isDrawerExpanded
                            ? "0.2rem"
                            : "0.6rem",
                        }}
                      >
                        <Button
                          className={`secondary ${styles.previewHtmlFormBtn}`}
                          onClick={() => handlePreviewHtml()}
                          id="pmweb_taskdata_previewhtmlform_button"
                        >
                          {`${t("preview")} ${t("html")} ${t("Form")}`}
                        </Button>
                      </Grid>
                    ) : (
                      <Grid item>
                        <Grid container spacing={1}>
                          <Grid item>
                            <Button
                              className={
                                props.isDrawerExpanded
                                  ? `secondary ${styles.previewHtmlFormBtn}`
                                  : `secondary ${styles.collapsedStyling}`
                              }
                              onClick={() => fileRef?.current?.click()}
                              style={{
                                marginTop: "1.2rem",
                                marginInlineStart: props.isDrawerExpanded
                                  ? "0px"
                                  : "100px !important",
                              }}
                              id="pmweb_taskdata_importfromsystem_button"
                            >
                              {`${t("import")} ${t("from")} ${t("system")}`}
                            </Button>
                          </Grid>
                          <input
                            name="inputFile"
                            id="pmweb_taskdata_importform_inputfile"
                            ref={fileRef}
                            onChange={handleImportForm}
                            type="file"
                            hidden
                          />
                          <Grid item>
                            <Button
                              className={`secondary ${styles.addVariableBtn}`}
                              onClick={() => handleFormLauncher()}
                              style={{
                                marginTop: "1.2rem",
                                marginInlineEnd: "0px !important",
                              }}
                              id="pmweb_taskdata_addnewform_button"
                            >
                              {
                                //code edited on 01 march 2023 for BugId 122158
                                // `${t("add")} ${t("new")} ${t("Form")}`
                                `${t("addNewForm")}`
                              }
                            </Button>
                          </Grid>
                        </Grid>
                      </Grid>
                    )}
                  </div>
                )}
                {/* </Grid> */}
                {/* </Grid> */}
              </div>
              <Grid
                item
                container
                // xs={props.isDrawerExpanded ? 10 : 12}
                style={{
                  alignItems: "center",
                  // Changes made to solve Bug 130732
                  padding: props.isDrawerExpanded
                    ? "0px 2px 8px 8px"
                    : "0 8px 8px",
                }}
              >
                <Grid item>
                  <Typography
                    component="h5"
                    className={classes.GroupTitleSecondary}
                  >
                    {`${t("variable")} ${t("definition")}`}
                  </Typography>
                </Grid>
                <span className={classes.starIcon}>*</span>
                <Grid
                  item
                  style={{
                    marginInlineStart: "auto",
                    // paddingInlineEnd: props.isDrawerExpanded ? "0rem" : "0.5rem",
                  }}
                >
                  {!isReadOnly && (
                    <Button
                      className={`secondary ${styles.addVariableBtn}`}
                      onClick={() => addVariable()}
                      id="pmweb_taskdata_addvariable_button"
                    >
                      {`+ ${t("add")} ${t("variable")}`}
                    </Button>
                  )}
                </Grid>
              </Grid>
            </Grid>

            {!props.isDrawerExpanded ? (
              <div
                className={classes.horizontalScrolls}
                style={{ height: formType === "htmlForm" ? "44vh" : "38vh" }}
              >
                <table style={{ marginInlineStart: "-0.25vw" }}>
                  {taskVariablesList?.map((taskVar, index) => {
                    return (
                      <tr key={index}>
                        <td className={classes.tdPadding}>
                          <Field
                            name="m_strVariableName"
                            label={`${t("variable")} ${t("name")}`}
                            value={taskVar.m_strVariableName}
                            id={`pmweb_taskdata_variablename_field${index}`}
                            onChange={(e) =>
                              handleChangeVariable(
                                index,
                                e.target.name,
                                e.target.value
                              )
                            }
                            error={
                              taskVar.error?.VariableName &&
                              saveCancelStatus.SaveOnceClicked
                                ? true
                                : false
                            }
                            helperText={
                              taskVar.error?.VariableName &&
                              saveCancelStatus.SaveOnceClicked
                                ? taskVar.error?.VariableName
                                : ""
                            }
                            style={{
                              marginBottom:
                                taskVar.error?.VariableName &&
                                saveCancelStatus.SaveOnceClicked
                                  ? "0"
                                  : "1.32rem",
                            }}
                            disabled={isReadOnly}
                            inputRef={variableRef}
                            onKeyPress={(e) => {
                              FieldValidations(e, 171, variableRef.current, 10);
                            }}
                          />
                        </td>
                        <td className={classes.tdPadding}>
                          <Field
                            dropdown={true}
                            name="m_strVariableType"
                            label={`${t("variable")} ${t("type")}`}
                            id={`pmweb_taskdata_variabletype_field${index}`}
                            value={+taskVar.m_strVariableType}
                            onChange={(e) =>
                              handleChangeVariable(
                                index,
                                e.target.name,
                                e.target.value
                              )
                            }
                            options={[
                              { name: "String", value: 10 },
                              { name: "Float", value: 6 },
                              { name: "Integer", value: 3 },
                              { name: "Long", value: 4 },
                              { name: "Date", value: 8 },
                            ]}
                            disabled={isReadOnly}
                            style={{
                              marginBottom: "1.32rem",
                            }}
                          />
                        </td>

                        <td className={classes.tdPadding}>
                          <Field
                            name="m_strDisplayName"
                            disabled={formType === "form" || isReadOnly}
                            label={`${t("display")} ${t("name")}`}
                            id={`pmweb_taskdata_displayname_field${index}`}
                            value={taskVar.m_strDisplayName}
                            onChange={(e) =>
                              handleChangeVariable(
                                index,
                                e.target.name,
                                e.target.value
                              )
                            }
                            error={
                              formType === "htmlForm" &&
                              taskVar.error?.DisplayName &&
                              saveCancelStatus.SaveOnceClicked
                                ? true
                                : false
                            }
                            helperText={
                              formType === "htmlForm" &&
                              taskVar.error?.DisplayName &&
                              saveCancelStatus.SaveOnceClicked
                                ? taskVar.error?.DisplayName
                                : ""
                            }
                            style={{
                              marginBottom:
                                formType === "htmlForm" &&
                                taskVar.error?.DisplayName &&
                                saveCancelStatus.SaveOnceClicked
                                  ? "0"
                                  : "1.32rem",
                            }}
                            inputRef={displayRef}
                            onKeyPress={(e) =>
                              FieldValidations(e, 164, displayRef.current, 50)
                            }
                          />
                        </td>

                        <td className={classes.tdPadding}>
                          <Field
                            name="m_iControlType"
                            disabled={formType === "form" || isReadOnly}
                            label={`${t("ControlType")}`}
                            id={`pmweb_taskdata_controltype_field${index}`}
                            dropdown={true}
                            value={+taskVar.m_iControlType}
                            onChange={(e) =>
                              handleChangeVariable(
                                index,
                                e.target.name,
                                e.target.value
                              )
                            }
                            options={[
                              { name: `${t("text")}`, value: 1 },
                              { name: `${t("textArea")}`, value: 2 },
                              { name: `${t("comboBox")}`, value: 3 },
                            ]}
                            style={{
                              marginBottom: "1.32rem",
                            }}
                          />
                        </td>

                        {+taskVar.m_iControlType === 3 &&
                          !isReadOnly &&
                          formType !== "form" && (
                            <td
                              className={classes.tdPadding}
                              onClick={() => handleComboValues(index)}
                              id={`pmweb_taskdata_handlecombovalue_td${index}`}
                              tabIndex={0}
                              onKeyUp={(e) => {
                                if (e.key === "Enter") {
                                  handleComboValues(index);
                                }
                              }}
                            >
                              <HorizontalMoreIcon
                                className={classes.deleteBtn}
                                style={{
                                  cursor: "pointer",
                                  marginTop: "0.5rem",
                                }}
                              />
                            </td>
                          )}
                        {!isReadOnly && (
                          <td
                            className={classes.tdPadding}
                            onClick={() => handleDelete(index)}
                            id={`pmweb_taskdata_deleteicon_td${index}`}
                            tabIndex={0}
                            onKeyUp={(e) => {
                              if (e.key === "Enter") {
                                handleDelete(index);
                              }
                            }}
                          >
                            <DeleteIcon
                              className={classes.deleteBtn}
                              style={{
                                cursor: "pointer",
                                marginTop: "0.5rem",
                              }}
                            />
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </table>
              </div>
            ) : (
              <Grid container direction="column" spacing={2}>
                <Grid item xs>
                  <Grid container direction={"row"} spacing={1}>
                    {taskVariablesList.map((taskVar, index) => {
                      return (
                        <Grid
                          container
                          spacing={1}
                          key={index}
                          style={{ margin: "0" }}
                        >
                          <Grid item xs={3}>
                            <Field
                              name="m_strVariableName"
                              label={`${t("variable")} ${t("name")}`}
                              value={taskVar.m_strVariableName}
                              id={`pmweb_taskdata_expan_variablename_field${index}`}
                              onChange={(e) =>
                                handleChangeVariable(
                                  index,
                                  e.target.name,
                                  e.target.value
                                )
                              }
                              error={
                                taskVar.error?.VariableName &&
                                saveCancelStatus.SaveOnceClicked
                                  ? true
                                  : false
                              }
                              helperText={
                                taskVar.error?.VariableName &&
                                saveCancelStatus.SaveOnceClicked
                                  ? taskVar.error?.VariableName
                                  : ""
                              }
                              disabled={isReadOnly}
                              // added on 12/9/2023 for bug_id: 136922
                              inputRef={(item) =>
                                (variableNameRef.current[index] = item)
                              }
                              onKeyPress={(e) => {
                                FieldValidations(
                                  e,
                                  171,
                                  variableNameRef.current[index],
                                  50
                                );
                              }}
                            />
                          </Grid>
                          <Grid item xs={2}>
                            <Field
                              dropdown={true}
                              name="m_strVariableType"
                              label={`${t("variable")} ${t("type")}`}
                              value={+taskVar.m_strVariableType}
                              id={`pmweb_taskdata_expan_variabletype_field${index}`}
                              onChange={(e) =>
                                handleChangeVariable(
                                  index,
                                  e.target.name,
                                  e.target.value
                                )
                              }
                              options={[
                                { name: "String", value: 10 },
                                { name: "float", value: 6 },
                                { name: "integer", value: 3 },
                                { name: "long", value: 4 },
                                { name: "date", value: 8 },
                              ]}
                              disabled={isReadOnly}
                            />
                          </Grid>
                          <Grid item xs={3}>
                            <Field
                              name="m_strDisplayName"
                              disabled={formType === "form" || isReadOnly}
                              label={`${t("display")} ${t("name")}`}
                              value={taskVar.m_strDisplayName}
                              id={`pmweb_taskdata_expan_displayname_field${index}`}
                              onChange={(e) =>
                                handleChangeVariable(
                                  index,
                                  e.target.name,
                                  e.target.value
                                )
                              }
                              error={
                                taskVar.error?.DisplayName &&
                                saveCancelStatus.SaveOnceClicked
                                  ? true
                                  : false
                              }
                              helperText={
                                formType === "htmlForm" &&
                                taskVar.error?.DisplayName &&
                                saveCancelStatus.SaveOnceClicked
                                  ? taskVar.error?.DisplayName
                                  : ""
                              }
                              // added on 12/9/2023 for bug_id: 136922
                              inputRef={(item) =>
                                (displayNameRef.current[index] = item)
                              }
                              onKeyPress={(e) => {
                                FieldValidations(
                                  e,
                                  164,
                                  displayNameRef.current[index],
                                  50
                                );
                              }}
                            />
                          </Grid>

                          <Grid item xs={2}>
                            <Field
                              name="m_iControlType"
                              disabled={formType === "form" || isReadOnly}
                              label={`${t("ControlType")}`}
                              dropdown={true}
                              value={+taskVar.m_iControlType}
                              id={`pmweb_taskdata_expan_controltype_field${index}`}
                              onChange={(e) =>
                                handleChangeVariable(
                                  index,
                                  e.target.name,
                                  e.target.value
                                )
                              }
                              options={[
                                { name: `${t("text")}`, value: 1 },
                                { name: `${t("textArea")}`, value: 2 },
                                { name: `${t("comboBox")}`, value: 3 },
                              ]}
                            />
                          </Grid>
                          {+taskVar.m_iControlType === 3 &&
                            !isReadOnly &&
                            formType !== "form" && (
                              <Grid
                                item
                                onClick={() => handleComboValues(index)}
                                id={`pmweb_taskdata_expan_handlecombovalue_grid${index}`}
                                tabIndex={0}
                                onKeyUp={(e) => {
                                  if (e.key === "Enter") {
                                    handleComboValues(index);
                                  }
                                }}
                              >
                                <HorizontalMoreIcon
                                  className={classes.deleteBtn}
                                  style={{
                                    cursor: "pointer",
                                    marginTop: "2rem",
                                  }}
                                />
                              </Grid>
                            )}
                          {!isReadOnly && (
                            <Grid
                              item
                              onClick={() => handleDelete(index)}
                              tabIndex={0}
                              onKeyUp={(e) => {
                                if (e.key === "Enter") {
                                  handleDelete(index);
                                }
                              }}
                            >
                              <DeleteIcon
                                className={classes.deleteBtn}
                                id={`pmweb_taskdata_expan_deleteicon_delete${index}`}
                                style={{
                                  cursor: "pointer",
                                  marginTop: "2rem",
                                }}
                              />
                            </Grid>
                          )}
                        </Grid>
                      );
                    })}
                  </Grid>
                </Grid>
              </Grid>
            )}
          </div>

          {isModalOpen && (
            <FormBuilderModal
              isOpen={isModalOpen}
              localLoadedProcessData={localLoadedProcessData}
              localLoadedActivityPropertyData={localLoadedActivityPropertyData}
              setlocalLoadedActivityPropertyData={
                setlocalLoadedActivityPropertyData
              }
              cellID={props.cellID}
              cellType={props.cellType}
              handleClose={handleCloseModal}
              isReadOnly={isReadOnly}
            />
          )}
          {isPreviewModalOpen && (
            <PreviewHtmlModal
              isOpen={isPreviewModalOpen}
              taskVariablesList={taskVariablesList}
              handleClose={handleClosePreviewModal}
              isReadOnly={isReadOnly}
            />
          )}
          {isComboModalOpen && (
            <ComboValuesModal
              isOpen={isComboModalOpen}
              editedComboVar={selectedComboVar}
              handleClose={handleCloseComboModal}
              saveComboVal={handleSaveComboVal}
              isReadOnly={isReadOnly}
            />
          )}
        </div>
      )}
    </div>
  );
}

const mapDispatchToProps = (dispatch) => {
  return {
    expandDrawer: (flag) => dispatch(actionCreatorsDrawer.expandDrawer(flag)),
  };
};

const mapStateToProps = (state) => {
  return {
    showDrawer: state.showDrawerReducer.showDrawer,
    cellID: state.selectedCellReducer.selectedId,
    cellName: state.selectedCellReducer.selectedName,
    cellType: state.selectedCellReducer.selectedType,
    cellActivityType: state.selectedCellReducer.selectedActivityType,
    cellActivitySubType: state.selectedCellReducer.selectedActivitySubType,
    isDrawerExpanded: state.isDrawerExpanded.isDrawerExpanded,
    openTemplateFlag: state.openTemplateReducer.openFlag,
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(TaskData);
