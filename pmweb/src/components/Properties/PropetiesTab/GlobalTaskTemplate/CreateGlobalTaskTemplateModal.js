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
  TaskType,
} from "../../../../Constants/appConstants";
import { useDispatch, useSelector } from "react-redux";
import { showDrawer } from "../../../../redux-store/actions/Properties/showDrawerAction";
import { selectedTemplate } from "../../../../redux-store/actions/selectedCellActions";
import { getSelectedCellType } from "../../../../utility/abstarctView/getSelectedCellType";
import { setGlobalTaskTemplates } from "../../../../redux-store/actions/Properties/globalTaskTemplateAction";
import { FieldValidations } from "../../../../utility/FieldValidations/fieldValidations";
import secureLocalStorage from "react-secure-storage";
import { Typography } from "@material-ui/core";
import { validateEntity } from "../../../../utility/abstarctView/addWorkstepAbstractView";

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

const CreateGlobalTaskTemplateModal = (props) => {
  const [open, setOpen] = useState(props.isOpen ? true : false);
  const dispatch = useDispatch();
  const globalTemplates = useSelector(
    (state) => state.globalTaskTemplate.globalTemplates
  );
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const localActivityPropertyData = store.getState("activityPropertyData");
  const [localLoadedActivityPropertyData, setlocalLoadedActivityPropertyData] =
    useGlobalState(localActivityPropertyData);
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
        helperText: t("TaskTemplateSameNameErr"),
      });
    } else {
      if (templateName.value?.trim() === "" || templateName.error) {
        return;
      }
      const axiosInstance = createInstance();
      setIsCreating(true);
      const ids = globalTemplates.map((variable) => +variable.m_iTemplateId);
      let maxId = Math.max(...ids);
      if (maxId === -1) maxId = 0;
      if (globalTemplates.length === 0) {
        maxId = 0;
      }
      const authKey = JSON.parse(
        secureLocalStorage.getItem("launchpadKey")
      )?.token;
      let config = {
        headers: {
          token: authKey,
        },
      };
      try {
        var res = await axiosInstance.post(
          `${ENDPOINT_ADD_GLOBAL_TEMPLATE}`,
          {
            m_strTemplateName: templateName.value,
            m_strStatus: "I",
            processDefId: localLoadedProcessData.ProcessDefId,
            m_iTemplateId: maxId + 1, // code edited on 17 Nov 2022 for BugId 119098
          },
          config
        );
        if (res.data?.Status === 0) {
          const templateData = {
            m_arrTaskTemplateVarList: [],
            m_bGlobalTemplate: true,
            m_bGlobalTemplateFormCreated: false, // code edited on 17 Nov 2022 for BugId 119098
            m_bCustomFormAssoc: false, // code edited on 17 Nov 2022 for BugId 119098
            m_strTemplateName: templateName.value,
            m_iTemplateId: res.data?.Data?.m_iTemplateId || maxId + 1,
            taskGenPropInfo: {
              isRepeatable: false,
              genPropInfo: {
                cost: "0.00",
                description: "",
                consultantList: [],
              },
              m_objTaskRulesListInfo: {},
              m_strGoal: "",
              m_strInstructions: "",
              bTaskFormView: false,
              tatInfo: {
                wfDays: "0",
                wfMinutes: "0",
                tatCalFlag: "N",
                wfHours: "0",
              },
              isNotifyEmail: false,
              m_objOptionsView: {
                m_objOptionInfo: {
                  expiryInfo: {
                    expCalFlag: "",
                    holdTillVar: ":",
                    varFieldId_Days: "",
                    expiryOperator: "",
                    expiryOperation: "",
                    triggerId: "",
                    wfDays: "",
                    wfMinutes: "",
                    variableId_Days: "",
                    wfSeconds: "",
                    wfHours: "",
                    expFlag: false,
                  },
                },
                m_strExpires: "NE",
                m_SelectedUser: "::",
              },
              taskTemplateInfo: {
                m_arrTaskTemplateVarList: [],
                m_bGlobalTemplate: true,
                m_bGlobalTemplateFormCreated: false, // code edited on 17 Nov 2022 for BugId 119098
                m_bCustomFormAssoc: false, // code edited on 17 Nov 2022 for BugId 119098
                m_strTemplateName: templateName.value,
                m_iTemplateId: maxId + 1,
              },
            },
          };

          const newGts = [...globalTemplates, templateData];
          dispatch(setGlobalTaskTemplates(newGts));
          setIsCreating(false);
          handleClose();
          // code added on 18 Jan 2023 for BugId 122655
          dispatch(
            selectedTemplate(
              res.data?.Data?.m_iTemplateId || maxId + 1,
              templateName.value,
              TaskType.globalTask,
              getSelectedCellType("TASKTEMPLATE")
            )
          );
          setlocalLoadedActivityPropertyData(templateData);
          dispatch(showDrawer(true));

          dispatch(
            setToastDataFunc({
              message: `${templateName.value} ${t("createdSuccessfully")}`,
              severity: "success",
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
      title={t("createAGlobalTemplate")}
      isProcessing={isCreating}
      Content={
        <Content
          templateName={templateName}
          handleChange={handleChange} //Modified on 28/08/2023, bug_id:130692
        />
      }
      //  Changes on 12-09-23 to resolve the bug Id 136600
      btn1Title={t("cancel")}
      btn2Title={t("CreateGlobalTemplate")}
      btn1Id="pmweb_CreateGlobalTaskTemplateModal_cancelbtn"
      btn2Id="pmweb_CreateGlobalTaskTemplateModal_createglobaltemplatebtn"
      headerCloseBtn={true}
      onClickHeaderCloseBtn={handleClose}
      onClick1={onClick1}
      onClick2={onClick2}
      // Changes to resolve the bug Id 137927
      btn2Disabled={templateName?.error || templateName.value?.trim() === ""}
      closeModal={handleClose}
      containerHeight={225}
      containerWidth={450}
    />
  );
};
export default CreateGlobalTaskTemplateModal;

/*Fields, content of the modal */
const Content = (props) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { templateName, handleChange } = props;
  const templateNameRef = useRef();

  return (
    <>
      <div>
        {/* Changes on 12-09-23 to resolve the bug Id 136600 */}
        <Field
          id="temNameCreateGTId"
          label={t("templateName")}
          {...templateName}
          required={true}
          width={442}
          onChange={(e) => {
            handleChange(e);
          }}
          inputRef={templateNameRef}
          onKeyPress={(e) =>
            FieldValidations(e, 180, templateNameRef.current, 30)
          }
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
