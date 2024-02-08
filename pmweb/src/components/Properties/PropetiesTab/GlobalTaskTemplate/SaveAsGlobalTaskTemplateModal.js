import React, { useState, useRef } from "react";
import { makeStyles } from "@material-ui/core/styles";
import ModalForm from "./../../../../UI/ModalForm/modalForm";
import Field from "./../../../../UI/InputFields/TextField/Field";
import { useTranslation } from "react-i18next";
import { store, useGlobalState } from "state-pool";
import { setToastDataFunc } from "../../../../redux-store/slices/ToastDataHandlerSlice";
import { createInstance } from "../../../../utility/CommonFunctionCall/CommonFunctionCall";
import {
  ENDPOINT_ADD_GLOBAL_TEMPLATE,
  ENDPOINT_GET_GLOBALTASKTEMPLATES,
  SERVER_URL,
} from "../../../../Constants/appConstants";
import { useDispatch, useSelector } from "react-redux";
import { Typography } from "@material-ui/core";
import { setGlobalTaskTemplates } from "./../../../../redux-store/actions/Properties/globalTaskTemplateAction";
import { FieldValidations } from "../../../../utility/FieldValidations/fieldValidations";
import { validateEntity } from "../../../../utility/abstarctView/addWorkstepAbstractView";
import axios from "axios";

const useStyles = makeStyles(() => ({
  container: {
    marginTop: "4rem",
  },
  note: {
    fontSize: "0.75rem",
  },
}));

/*Making inputs for fields */
const makeFieldInputs = (value) => {
  return {
    value: value,
    error: false,
    helperText: "",
  };
};

const SaveAsGlobalTaskTemplateModal = (props) => {
  const [open, setOpen] = useState(props.isOpen ? true : false);
  const dispatch = useDispatch();
  const globalTemplates = useSelector(
    (state) => state.globalTaskTemplate.globalTemplates
  );
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const localActivityPropertyData = store.getState("activityPropertyData");
  const [localLoadedActivityPropertyData] = useGlobalState(
    localActivityPropertyData
  );
  const { t } = useTranslation();
  const [isCreating, setIsCreating] = useState(false);
  const [templateName, setTemplateName] = useState(makeFieldInputs(""));
  const handleChange = (e) => {
    const { name, value } = e.target;
    switch (name) {
      case "Template Name":
        validateFields(value);
        break;
      default:
        break;
    }
  };

  const validateFields = (tempName) => {
    let tmpNameErrors = null;
    if (tempName?.trim() === "") {
      tmpNameErrors = t("templateNameEmptyError");
    } else {
      let [isValid, errMsg] = validateEntity(tempName, t, "templateName");
      if (!isValid) {
        tmpNameErrors = errMsg;
      }
    }
    setTemplateName({
      ...templateName,
      value: tempName,
      error: tmpNameErrors ? true : false,
      helperText: tmpNameErrors,
    });
  };

  const handleClose = () => {
    setOpen(false);
    props.handleClose();
  };

  const onClick1 = () => {
    handleClose();
  };

  const onClick2 = async () => {
    let isPresent = false;
    globalTemplates?.forEach((el) => {
      if (el.m_strTemplateName === templateName.value) {
        isPresent = true;
      }
    });
    if (isPresent) {
      setTemplateName({
        ...templateName,
        error: true,
        helperText: t("TaskTemplateDuplicateNameErr"),
      });
    } else {
      if (templateName.value?.trim() === "" || templateName.error) {
        return;
      }
      const axiosInstance = createInstance();
      setIsCreating(true);
      // code edited on 14 Jan 2023 for BugId 119098
      /*   const tempLocal={...localLoadedActivityPropertyData};
      const filterKeys=["m_objOptionsView","m_objTaskRulesListInfo"];
      const raw=tempLocal?.taskGenPropInfo;
      const filtered = Object.keys(raw)
  .filter(key => !filterKeys.includes(key))
  .reduce((obj, key) => {
    obj[key] = raw[key];
    return obj;
  }, {});

console.log("222","FILTER",filtered); */

      try {
        var res = await axiosInstance.post(`${ENDPOINT_ADD_GLOBAL_TEMPLATE}`, {
          ...localLoadedActivityPropertyData,
          m_strTemplateName: templateName.value,
          m_strStatus: "I",
          processDefId: localLoadedProcessData.ProcessDefId,
          m_bGlobalTemplate: true,
          m_arrTaskTemplateVarList:
            localLoadedActivityPropertyData?.taskGenPropInfo?.taskTemplateInfo
              ?.m_arrTaskTemplateVarList || [],
          taskId: localLoadedActivityPropertyData?.taskId,
        });

        if (res.data?.Status === 0) {
          setIsCreating(false);
          handleClose();
          const ids = globalTemplates.map(
            (variable) => +variable.m_iTemplateId
          );

          let maxId = Math.max(...ids);
          if (globalTemplates.length === 0 || maxId == "-1") {
            maxId = 0;
          }
          let templateData = {};
          let varList = localLoadedActivityPropertyData?.taskGenPropInfo
            ?.taskTemplateInfo?.m_arrTaskTemplateVarList
            ? [
                ...localLoadedActivityPropertyData?.taskGenPropInfo
                  ?.taskTemplateInfo?.m_arrTaskTemplateVarList,
              ]
            : [];
          templateData = {
            ...localLoadedActivityPropertyData,
            // code edited on 17 Nov 2022 for BugId 119098
            m_iTemplateId: res.data.Data?.m_iTemplateId || maxId + 1,
            m_strTemplateName: templateName.value,
            m_strStatus: "I",
            processDefId: localLoadedProcessData.ProcessDefId,
            m_bGlobalTemplate: true,
            m_arrTaskTemplateVarList: varList,
          };

          /* const newGts = [...globalTemplates, templateData];
          dispatch(setGlobalTaskTemplates(newGts)); */
          //Modified on 16/10/2023, bug_id:139421
          axios
            .get(SERVER_URL + ENDPOINT_GET_GLOBALTASKTEMPLATES)
            .then((res) => {
              if (res?.data?.Status === 0) {
                const globalTemps = res.data.GlobalTemplates || [];
                dispatch(setGlobalTaskTemplates(globalTemps));
              }
            });
          //till here for bug_id:139421

          dispatch(
            setToastDataFunc({
              message: `${
                res.data.message ||
                templateName.value + ` ${t("createdSuccessfully")}`
              }`,
              severity: "success",
              open: true,
            })
          );
        }
        if (res.data?.Status === -2) {
          setIsCreating(false);
          dispatch(
            setToastDataFunc({
              message: `${res.data.message || t("operationFailed")}`,
              severity: "error",
              open: true,
            })
          );
        }
      } catch (error) {
        setIsCreating(false);
      }
    }
  };

  return (
    <ModalForm
      isOpen={open}
      title={t("SaveAsGlobalTemplate")}
      isProcessing={isCreating}
      Content={
        <Content templateName={templateName} handleChange={handleChange} />
      }
      // Changes on 12-09-23 to resolve the bug Id 136618
      btn1Title={t("cancel")}
      btn2Title={t("save")}
      btn1Id="pmweb_SaveGlobalTaskTemplateModal_cancelbtn"
      btn2Id="pmweb_SaveGlobalTaskTemplateModal_savebtn"
      headerCloseBtn={true}
      onClickHeaderCloseBtn={handleClose}
      onClick1={onClick1}
      onClick2={onClick2}
      btn2Disabled={templateName?.error}
      closeModal={handleClose}
      containerHeight={225}
      containerWidth={450}
    />
  );
};
export default SaveAsGlobalTaskTemplateModal;

/*Fields, content of the modal */
const Content = (props) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { templateName, handleChange } = props;
  const templateRef = useRef();
  const direction = `${t("HTML_DIR")}`;

  return (
    <>
      <div>
        <Field
          id="temNameSaveAsGTId"
          name="Template Name"
          label={t("templateName")}
          {...templateName}
          required={true}
          width={442}
          inputRef={templateRef}
          onChange={(e) => {
            handleChange(e);
          }}
          onKeyPress={(e) => FieldValidations(e, 180, templateRef.current, 30)}
          error={templateName.error}
          helperText={templateName.helperText}
        />
      </div>
      <div>
        <Typography className={classes.note}>{t("saveGtNote")}</Typography>
      </div>
    </>
  );
};
