import React, { useState, useEffect, useRef } from "react";
import {
  Divider,
  Grid,
  Typography,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Button,
  Tooltip,
} from "@material-ui/core";
import "../../Properties.css";
import { useTranslation } from "react-i18next";
import { connect, useDispatch, useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import { store, useGlobalState } from "state-pool";
import axios from "axios";
import CircularProgress from "@material-ui/core/CircularProgress";
import {
  ENDPOINT_GET_ALLDEPLOYEDPROCESSLIST,
  propertiesLabel,
  RTL_DIRECTION,
  SERVER_URL,
  SPACE,
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
import CheckBoxOutlineBlankIcon from "@material-ui/icons/CheckBoxOutlineBlank";
import CheckBoxIcon from "@material-ui/icons/CheckBox";
import ClearOutlinedIcon from "@material-ui/icons/ClearOutlined";
import TurnAroundTime from "../../../../UI/InputFields/TurnAroundTime/TurnAroundTime";
import { setToastDataFunc } from "../../../../redux-store/slices/ToastDataHandlerSlice.js";
import { DeleteIcon } from "../../../../utility/AllImages/AllImages.js";
import { setProcessTaskType } from "../../../../redux-store/slices/ProcessTaskTypeSlice.js";
import TabsHeading from "../../../../UI/TabsHeading/index.js";
import {
  getIncorrectLenErrMsg,
  isProcessDeployedFunc,
} from "../../../../utility/CommonFunctionCall/CommonFunctionCall";
import { FieldValidations } from "../../../../utility/FieldValidations/fieldValidations";
import ModalUsingCSS from "../../../ViewsForms/ModalUsingCSS/ModalUsingCSS";
import {
  encode_utf8,
  decode_utf8,
} from "../../../../utility/UTF8EncodeDecoder";
import { LatestVersionOfProcess } from "../../../../utility/abstarctView/checkLatestVersion";
import secureLocalStorage from "react-secure-storage";
import CustomizedDropdown from "../../../../UI/Components_With_ErrrorHandling/Dropdown";
import { REGEX, validateRegex } from "../../../../validators/validator";

const makeFieldInputs = (value) => {
  return {
    value: value,
    error: false,
    helperText: "",
  };
};

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
    display: "flex",
    flexDirection: "column",
    fontFamily: "var(--font_family)",
    width: "100%",
    direction: props.direction,
  },
  mainHeadDiv: {
    // Changes made to solve Bug 130705 - regression>>Task>>multiple scroll bar is available in collapsed mode
    // overflowY: "auto",
    // overflowX: "hidden",
    background: "#fff",
    // height: `calc((${window.innerHeight}px - ${headerHeight}) - 12rem)`,
    "&::-webkit-scrollbar": {
      backgroundColor: "transparent",
      width: "0.375rem",
      height: "1.125rem",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "transparent",
      borderRadius: "0.313rem",
    },

    "&:hover::-webkit-scrollbar": {
      overflowY: "visible",
      width: "0.375rem",
      height: "1.125rem",
    },
    "&:hover::-webkit-scrollbar-thumb": {
      background: "#8c8c8c 0% 0% no-repeat padding-box",
      borderRadius: "0.313rem",
    },
    scrollbarColor: "#8c8c8c #fafafa",
    scrollbarWidth: "thin",
  },
  GroupTitle: {
    fontWeight: "bold",
    color: "#606060",
    fontSize: "var(--subtitle_text_font_size)",
  },
  btnIcon: {
    cursor: "pointer",
    height: "1.5rem",
    width: "1.5rem",
  },
  dotBtnIcon: {
    cursor: "pointer",
    height: "var(--line_height)",
    width: "var(--line_height)",
    border: "1px solid #CECECE",
    backgroundColor: "#fff !important",
    borderRadius: "2px",
    marginTop: "1rem",
    padding: "0",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  addAdvisorBtnIcon: {
    cursor: "pointer",
    height: "var(--line_height)",
    width: "var(--line_height)",
    border: "1px solid var(--button_color)",
    backgroundColor: "var(--button_color) !important",
    color: "#FFFFFF !important",
    borderRadius: "2px",
    marginTop: "1rem",
    padding: "0",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  plusIcon: {
    color: "#FFFFFF",
    fontSize: "var(--title_text_font_size)",
    fontWeight: "600",
  },
  fontSize: {
    fontSize: "var(--base_text_font_size)",
    fontWeight: 600,
  },
  deleteIcon: {
    width: "1.25rem",
    height: "1.25rem",
    cursor: "pointer",
  },
  clearIcon: {
    width: "1.7rem",
    height: "1.7rem",
    cursor: "pointer",
    color: "rgb(0,0,0,0.5) !important",
  },
  advisorList: {
    border: "1px solid #cecece",
    margin: "0 0 0 0.5vw",
    padding: "0.25rem 0 !important",
    maxHeight: "36vh",
    width: "61%",
    overflow: "auto",
  },
  CheckBoxIcon: {
    color: "var(--checkbox_color)",
    "& .MuiSvgIcon-root": {
      width: "1.5rem !important",
      height: "1.5rem !important",
    },
  },
  icon: {
    height: "16px",
    width: "16px",
    fontSize: "12px",
  },
}));

function TaskDetails(props) {
  let { t } = useTranslation();
  const dispatch = useDispatch();
  const direction = `${t("HTML_DIR")}`;
  const classes = useStyles({ ...props, direction });
  const loadedProcessData = store.getState("loadedProcessData"); //current processdata clicked
  const localActivityPropertyData = store.getState("activityPropertyData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const saveCancelStatus = useSelector(ActivityPropertySaveCancelValue);
  const [localLoadedActivityPropertyData, setlocalLoadedActivityPropertyData] =
    useGlobalState(localActivityPropertyData);
  const [spinner, setspinner] = useState(true);
  const [description, setDescription] = useState(
    makeFieldInputs(
      decode_utf8(
        localLoadedActivityPropertyData?.taskGenPropInfo?.genPropInfo
          ?.description
      ) || ""
    )
  );
  const [taskTemplateName, setTaskTemplateName] = useState(makeFieldInputs(""));
  const [goal, setGoal] = useState(makeFieldInputs(""));
  const [instructions, setInstruction] = useState(makeFieldInputs(""));
  const [cost, setCost] = useState(makeFieldInputs(""));
  const [taskAdvisorList, setAdvisorList] = useState([]);
  const [turnAroundTime, setTurnAroundTime] = useState(
    makeFieldInputs({ days: 0, hours: 0, minutes: 0, calendarType: "" })
  );
  const [registeredProcessErr, setRegisteredProcessErr] = useState(false);
  const [openUserGroupMF, setopenUserGroupMF] = useState(false);
  const [registeredProcessList, setRegisteredProcessList] = useState([]);
  const [selectedRegisteredProcess, setSelectedRegisteredProcess] =
    useState(null);
  const [selectedRegisteredProcessType, setSelectedRegisteredProcessType] =
    useState(null);
  const [repeatable, setRepeatable] = useState(false);
  const [notifyByEmail, setNotifyByEmail] = useState(false);
  const [initiateWorkItem, setInitiateWorkItem] = useState(false);

  let isReadOnly =
    props.openTemplateFlag ||
    isProcessDeployedFunc(localLoadedProcessData) ||
    LatestVersionOfProcess(localLoadedProcessData?.Versions) !==
      +localLoadedProcessData?.VersionNo; // modified on 05/09/2023 for BugId 136103;
  const taskType = useSelector(
    (state) => state.selectedCellReducer.selectedTaskType
  );
  const [userGroupData, setUserGroupData] = useState([]);
  const allTabStatus = useSelector(ActivityPropertyChangeValue);
  const templateNameRef = useRef();
  const goalRef = useRef();
  const instructionsRef = useRef();
  const costRef = React.useRef();

  useEffect(() => {
    if (taskType === "ProcessTask") {
      axios
        .get(SERVER_URL + `${ENDPOINT_GET_ALLDEPLOYEDPROCESSLIST}`)
        .then((res) => {
          if (res?.data?.Status === 0) {
            setRegisteredProcessList(res.data.Processes);
          }
        });
    }
    if (localLoadedActivityPropertyData) {
      setDescription({
        ...description,
        value:
          decode_utf8(
            localLoadedActivityPropertyData?.taskGenPropInfo?.genPropInfo
              ?.description
          ) || "",
      });
    }
  }, []);

  useEffect(() => {
    if (localLoadedActivityPropertyData) {
      const taskGenPropInfo =
        localLoadedActivityPropertyData.taskGenPropInfo || {};
      setDescription({
        ...description,
        value: decode_utf8(taskGenPropInfo?.genPropInfo?.description) || "",
      });
      setTaskTemplateName({
        ...taskTemplateName,
        value: taskGenPropInfo?.taskTemplateInfo?.m_strTemplateName,
      });
      setCost({
        ...cost,
        value: taskGenPropInfo?.genPropInfo?.cost || "",
        error:
          cost.error && taskGenPropInfo?.genPropInfo?.cost > 0
            ? false
            : !cost.error
            ? false
            : cost.error,
        helperText:
          cost.error && taskGenPropInfo?.genPropInfo?.cost > 0
            ? ""
            : !cost.error
            ? ""
            : cost.helperText,
      });
      setInstruction({
        ...instructions,
        value: taskGenPropInfo?.m_strInstructions || "",
        error:
          instructions.error &&
          taskGenPropInfo?.m_strInstructions?.trim() !== ""
            ? false
            : !instructions.error
            ? false
            : instructions.error,
        helperText:
          instructions.error &&
          taskGenPropInfo?.m_strInstructions?.trim() !== ""
            ? ""
            : !instructions.error
            ? ""
            : instructions.helperText,
      });
      setGoal({
        ...goal,
        value: taskGenPropInfo?.m_strGoal || "",
        error:
          goal.error && taskGenPropInfo?.m_strGoal?.trim() !== ""
            ? false
            : !goal.error
            ? false
            : goal.error,
        helperText:
          goal.error && taskGenPropInfo?.m_strGoal?.trim() !== ""
            ? ""
            : !goal.error
            ? ""
            : goal.helperText,
      });

      setSelectedRegisteredProcess(
        localLoadedActivityPropertyData?.m_objPMSubProcess?.importedProcessName
      );

      const tatInfo = taskGenPropInfo?.tatInfo || {};
      const newTurnAroundValues = {
        ...turnAroundTime.value,
        days: tatInfo?.wfDays || 0,
        hours: tatInfo?.wfHours || 0,
        minutes: tatInfo?.wfMinutes || 0,
        calendarType: tatInfo?.tatCalFlag,
      };
      setTurnAroundTime({
        ...turnAroundTime,
        value: { ...newTurnAroundValues },
      });
      setAdvisorList(
        localLoadedActivityPropertyData.taskGenPropInfo?.genPropInfo
          ?.consultantList || []
      );
      setRepeatable(taskGenPropInfo?.isRepeatable);
      setNotifyByEmail(taskGenPropInfo?.isNotifyEmail);
      setInitiateWorkItem(taskGenPropInfo?.isInitiateWorkitem);
      // Changes made to solve Bug 127650 dated 26thApril
      if (
        localLoadedActivityPropertyData?.taskGenPropInfo?.m_strSubPrcType ===
        "U"
      ) {
        dispatch(
          setProcessTaskType(
            localLoadedActivityPropertyData?.taskGenPropInfo?.m_strSubPrcType
          )
        );
      }
      setSelectedRegisteredProcessType(
        localLoadedActivityPropertyData?.taskGenPropInfo?.m_strSubPrcType
      );

      //Modified on 04/09/2023, bug_id:135315
      if (!validateFields()) {
        dispatch(
          setActivityPropertyChange({
            [propertiesLabel.taskDetails]: {
              isModified: allTabStatus[propertiesLabel.taskDetails].isModified,
              hasError: true,
            },
          })
        );
      } else {
        let checkMap = checkMapping();
        if (!checkMap?.isValid && checkMap?.mapping === "forward") {
          dispatch(
            setActivityPropertyChange({
              [propertiesLabel.fwdVarMappingProcessTask]: {
                isModified: true,
                hasError: true,
              },
            })
          );
        }
        if (!checkMap?.isValid && checkMap?.mapping === "reverse") {
          dispatch(
            setActivityPropertyChange({
              [propertiesLabel.revVarMappingProcessTask]: {
                isModified: true,
                hasError: true,
              },
            })
          );
        }
      }
      //till here for bug_id:135315

      /* if (!validateFields()) {
        dispatch(
          setActivityPropertyChange({
            [propertiesLabel.taskDetails]: {
              isModified: allTabStatus[propertiesLabel.taskDetails].isModified,
              hasError: true,
            },
          })
        );
      } */
      setspinner(false);
    }
  }, [localLoadedActivityPropertyData]);

  useEffect(() => {
    if (localLoadedActivityPropertyData && description.value) {
      let tempPropertyDataObj = { ...localLoadedActivityPropertyData };
      tempPropertyDataObj.taskGenPropInfo = {
        ...tempPropertyDataObj.taskGenPropInfo,
        genPropInfo: {
          ...tempPropertyDataObj.taskGenPropInfo.genPropInfo,
          description: encode_utf8(description.value),
        },
      };
      //localLoadedActivityPropertyData.taskGenPropInfo.genPropInfo.description=encode_utf8(description.value)
      setlocalLoadedActivityPropertyData(tempPropertyDataObj);
    }
  }, [description.value]);

  useEffect(() => {
    const tempPropData = JSON.parse(
      JSON.stringify(localLoadedActivityPropertyData)
    );
    /*  if (
      tempPropData?.taskGenPropInfo?.m_objOptionsView?.m_objOptionInfo
        ?.expiryInfo?.variableId
    ) {
      tempPropData.taskGenPropInfo.m_objOptionsView.m_objOptionInfo.expiryInfo.variableId =
        "0";
    } */
    if (
      tempPropData?.taskGenPropInfo?.m_objOptionsView?.m_objOptionInfo
        ?.expiryInfo?.variableId === null
    ) {
      tempPropData.taskGenPropInfo.m_objOptionsView.m_objOptionInfo.expiryInfo.variableId =
        "0";
    }

    setlocalLoadedActivityPropertyData(tempPropData);
  }, []);

  useEffect(() => {
    if (saveCancelStatus.SaveOnceClicked) {
      validateFields();
      dispatch(setSave({ SaveClicked: false }));
    }
  }, [saveCancelStatus.SaveClicked]);

  //added on 9/9/2023 for BugId 136631
  const containsSpecialChars = (str) => {
    var regex = new RegExp('[\\\\/:*?"<>|]+');
    return !regex.test(str);
  };

  //added on 9/9/2023 for BugId 136631
  const validateData = (value, val) => {
    let errorMsg = "";
    if (value?.length > 1000) {
      errorMsg = `${val}${SPACE}${t("lengthShouldNotExceed1000Characters")}`;
    } else if (!containsSpecialChars(value)) {
      errorMsg = `${val}${SPACE}${t(
        "cannotContain"
      )}${SPACE}\/:*?"<>|${SPACE}${t("charactersInIt")}`;
    }
    return errorMsg;
  };

  // Function that handles the setting of various parameters.
  const handleChange = (e) => {
    // let tempPropertyDataObj = { ...localLoadedActivityPropertyData };
    let tempPropertyDataObj = JSON.parse(
      JSON.stringify(localLoadedActivityPropertyData)
    );

    const { name, value, checked } = e.target;
    switch (name) {
      case "Description":
        /*   tempPropertyDataObj.taskGenPropInfo = {
          ...tempPropertyDataObj.taskGenPropInfo,
          genPropInfo: {
            ...tempPropertyDataObj.taskGenPropInfo.genPropInfo,
            description: encode_utf8(value),
          },
        };
        // tempPropertyDataObj["taskGenPropInfo"]["genPropInfo"]["description"] =
        //   encode_utf8(value);*/
        setDescription({ ...description, value });
        ////Modified on 30/10/2023, bug_id:135628
        tempPropertyDataObj.taskGenPropInfo = {
          ...tempPropertyDataObj.taskGenPropInfo,
          genPropInfo: {
            ...tempPropertyDataObj.taskGenPropInfo.genPropInfo,
            description: encode_utf8(value),
          },
        };
        //till here for bug_id:135628
        break;
      case "TaskTemplateName":
        tempPropertyDataObj.taskGenPropInfo.taskTemplateInfo = {
          ...tempPropertyDataObj.taskGenPropInfo.taskTemplateInfo,
          m_strTemplateName: value,
        };
        break;
      case "Goal":
        // tempPropertyDataObj.taskGenPropInfo.m_strGoal = value;
        tempPropertyDataObj.taskGenPropInfo = {
          ...tempPropertyDataObj.taskGenPropInfo,
          m_strGoal: value,
        };
        break;
      case "Instructions":
        //  tempPropertyDataObj.taskGenPropInfo.m_strInstructions = value;
        tempPropertyDataObj.taskGenPropInfo = {
          ...tempPropertyDataObj.taskGenPropInfo,
          m_strInstructions: value,
        };
        break;
      case "Cost":
        if (+value >= 0) {
          //  tempPropertyDataObj.taskGenPropInfo.genPropInfo.cost = value;
          tempPropertyDataObj.taskGenPropInfo = {
            ...tempPropertyDataObj.taskGenPropInfo,
            genPropInfo: {
              ...tempPropertyDataObj.taskGenPropInfo.genPropInfo,
              cost: value,
            },
          };
        }
        break;
      case "Repeatable":
        tempPropertyDataObj.taskGenPropInfo = {
          ...tempPropertyDataObj.taskGenPropInfo,
          isRepeatable: checked,
        };
        break;
      case "NotifyByEmail":
        // tempPropertyDataObj.taskGenPropInfo.isNotifyEmail = checked;
        tempPropertyDataObj.taskGenPropInfo = {
          ...tempPropertyDataObj.taskGenPropInfo,
          isNotifyEmail: checked,
        };
        break;

      case "InitiateWorkItem":
        tempPropertyDataObj.taskGenPropInfo = {
          ...tempPropertyDataObj.taskGenPropInfo,
          isInitiateWorkitem: checked,
        };
        break;
      case "Days":
        if (+value >= 0) {
          tempPropertyDataObj.taskGenPropInfo.tatInfo = {
            ...tempPropertyDataObj.taskGenPropInfo.tatInfo,
            wfDays: +value || 0,
          };
        }
        break;

      case "Minutes":
        if (+value >= 0) {
          tempPropertyDataObj.taskGenPropInfo.tatInfo = {
            ...tempPropertyDataObj.taskGenPropInfo.tatInfo,

            wfMinutes: +value || 0,
          };
        }
        break;
      case "Hours":
        if (+value >= 0) {
          tempPropertyDataObj.taskGenPropInfo.tatInfo = {
            ...tempPropertyDataObj.taskGenPropInfo.tatInfo,

            wfHours: +value || 0,
          };
        }
        break;
      case "CalendarType":
        tempPropertyDataObj.taskGenPropInfo.tatInfo = {
          ...tempPropertyDataObj.taskGenPropInfo.tatInfo,
          tatCalFlag: value,
        };
        break;

      default:
        break;
    }
    setlocalLoadedActivityPropertyData(tempPropertyDataObj);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.taskDetails]: {
          isModified: true,
          hasError: false,
        },
      })
    );
  };

  const validateFields = () => {
    const taskGenPropInfo =
      localLoadedActivityPropertyData?.taskGenPropInfo || {};

    const goalErrors =
      !taskGenPropInfo?.m_strGoal ||
      taskGenPropInfo?.m_strGoal?.trim()?.length === 0
        ? `${t("goalEmptyError")}`
        : null;
    let goalSCErrors;
    if (goalErrors && saveCancelStatus.SaveOnceClicked) {
      setGoal({
        value: taskGenPropInfo?.m_strGoal,
        error: true,
        helperText: goalErrors,
      });
    }
    //added on 9/9/2023 for BugId 136631
    if (!goalErrors) {
      goalSCErrors = validateData(taskGenPropInfo?.m_strGoal, t("goal"));
      if (goalSCErrors !== "")
        setGoal({
          value: taskGenPropInfo?.m_strGoal,
          error: true,
          helperText: goalSCErrors,
        });
    }
    // ============================================================
    let registeredProcessError =
      !localLoadedActivityPropertyData?.m_objPMSubProcess
        ?.importedProcessName ||
      localLoadedActivityPropertyData?.m_objPMSubProcess?.importedProcessName?.trim() ==
        "";

    if (registeredProcessError && saveCancelStatus.SaveOnceClicked) {
      setRegisteredProcessErr(true);
    }
    //  =======================================================

    const insErr =
      !taskGenPropInfo?.m_strInstructions ||
      taskGenPropInfo?.m_strInstructions?.trim()?.length === 0
        ? `${t("instructionsEmptyError")}`
        : null;
    let insSCErrors;
    if (insErr && saveCancelStatus.SaveOnceClicked) {
      setInstruction({
        value: taskGenPropInfo?.m_strInstructions,
        error: true,
        helperText: insErr,
      });
    }
    //added on 9/9/2023 for BugId 136631
    if (!insErr) {
      insSCErrors = validateData(
        taskGenPropInfo?.m_strInstructions,
        t("instructions")
      );
      if (insSCErrors !== "")
        setInstruction({
          value: taskGenPropInfo?.m_strInstructions,
          error: true,
          helperText: insSCErrors,
        });
    }

    /*   const costErr =
    !taskGenPropInfo?.genPropInfo?.cost ||
    taskGenPropInfo?.genPropInfo?.cost < 0
      ? `${t("costEmptyError")}`
      :  null; */
    const costErr =
      !taskGenPropInfo?.genPropInfo?.cost ||
      taskGenPropInfo?.genPropInfo?.cost < 0
        ? `${t("costEmptyError")}`
        : !validateRegex(
            taskGenPropInfo?.genPropInfo?.cost,
            REGEX.FloatPositive
          )
        ? `${t("numericValMsg")}`
        : taskGenPropInfo?.genPropInfo?.cost?.length > 13
        ? getIncorrectLenErrMsg("cost", 13, t)
        : null; //Modified on 17/10/2023, bug_id:135583

    if (costErr && saveCancelStatus.SaveOnceClicked) {
      setCost({
        value: taskGenPropInfo?.genPropInfo?.cost,
        error: true,
        helperText: costErr,
      });
    }

    // const costValidateErr=!validateRegex(taskGenPropInfo?.genPropInfo?.cost, REGEX.FloatPositive)?`${t("numericValMsg")}`:null

    const turnAroundTimeDaysErr =
      taskGenPropInfo?.tatInfo?.wfDays === "" ||
      taskGenPropInfo?.tatInfo?.wfDays < 0
        ? `${t("daysEmptyError")}`
        : null;
    if (turnAroundTimeDaysErr && saveCancelStatus.SaveOnceClicked) {
      dispatch(
        setToastDataFunc({
          message: turnAroundTimeDaysErr,
          severity: "error",
          open: true,
        })
      );
    }
    let templateNameError = "";
    if (
      localLoadedActivityPropertyData?.taskGenPropInfo?.taskTemplateInfo
        ?.m_bGlobalTemplate
    ) {
      templateNameError =
        taskGenPropInfo?.taskTemplateInfo?.m_strTemplateName?.trim().length ===
        0
          ? t("templateNameEmptyError")
          : "";
    }
    if (templateNameError && saveCancelStatus.SaveOnceClicked) {
      setTaskTemplateName({
        value: taskGenPropInfo?.taskTemplateInfo?.m_strTemplateName,
        error: true,
        helperText: templateNameError,
      });
    }

    let errorBool =
      goalErrors ||
      goalSCErrors ||
      insErr ||
      insSCErrors ||
      costErr ||
      turnAroundTimeDaysErr ||
      templateNameError;

    if (taskType === "ProcessTask") {
      return errorBool || registeredProcessError ? false : true;
    } else return errorBool ? false : true;
  };

  const checkMapping = () => {
    if (taskType === "ProcessTask") {
      let temp = { ...localLoadedActivityPropertyData };
      if (temp?.m_objPMSubProcess?.fwdVarMapping.length === 0) {
        return { mapping: "forward", isValid: false };
      }
      if (temp?.m_objPMSubProcess?.revVarMapping.length === 0) {
        return { mapping: "reverse", isValid: false };
      }
    }
  };

  const handleDeleteAdvisor = (id) => {
    const tempPropertyDataObj = { ...localLoadedActivityPropertyData };
    const newAdvisorList = taskAdvisorList.filter(
      (item) => item.consultantId !== id
    );

    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.taskDetails]: {
          isModified: true,
          hasError: false,
        },
      })
    );

    setAdvisorList(newAdvisorList);
    tempPropertyDataObj.taskGenPropInfo.genPropInfo.consultantList = [
      ...newAdvisorList,
    ];
    setlocalLoadedActivityPropertyData(tempPropertyDataObj);
  };

  /*code edited on 16 feb  for BugId 122517 */
  const handleChangeInRegisteredProcess = (e) => {
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.taskDetails]: {
          isModified: true,
          hasError: false,
        },
      })
    );
    setSelectedRegisteredProcess(e.target.value);
    setRegisteredProcessErr(false);
    let temp = { ...localLoadedActivityPropertyData };
    temp.m_objPMSubProcess.importedProcessName = e.target.value;
    registeredProcessList?.map((list) => {
      if (list.ProcessName == e.target.value) {
        localStorage.setItem("selectedTargetProcessID", list.ProcessDefId);

        temp.m_objPMSubProcess.importedProcessDefId = list.ProcessDefId;
      }
    });
    temp.m_objPMSubProcess.fwdVarMapping = [];
    temp.m_objPMSubProcess.fwdDocMapping = [];
    setlocalLoadedActivityPropertyData(temp);
    setlocalLoadedActivityPropertyData(temp);
  };

  const handleChangeInRegisteredProcessType = (e) => {
    let temp = { ...localLoadedActivityPropertyData };
    // modified on 11/09/2023 for BugId 136463;
    /* if (e.target.value == "U") {
      setInitiateWorkItem(false);
      temp.taskGenPropInfo = {
        ...temp.taskGenPropInfo,
        isInitiateWorkitem: false,
      };
    } else {*/
    setInitiateWorkItem(true);
    temp.taskGenPropInfo = {
      ...temp.taskGenPropInfo,
      isInitiateWorkitem: true,
    };
    //}
    dispatch(setProcessTaskType(e.target.value));
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.taskDetails]: {
          isModified: true,
          hasError: false,
        },
      })
    );
    setSelectedRegisteredProcessType(e.target.value);
    temp.taskGenPropInfo.m_strSubPrcType = e.target.value;
    setlocalLoadedActivityPropertyData(temp);
  };

  /*const handleChangeGoal = (event) => {
    let temp = JSON.parse(JSON.stringify(localLoadedActivityPropertyData));
    temp.taskGenPropInfo.m_strGoal = event.target.value;
    setlocalLoadedActivityPropertyData(temp);
    setGoal({ ...goal, value: event.target.value });

    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.taskDetails]: {
          isModified: true,
          hasError: false,
        },
      })
    );
  };

  const handleChangeInstructions = (event) => {
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.taskDetails]: {
          isModified: true,
          hasError: false,
        },
      })
    );

    setInstruction({ ...instructions, value: event.target.value });
    let temp = JSON.parse(JSON.stringify(localLoadedActivityPropertyData));
    temp.taskGenPropInfo.m_strInstructions = event.target.value;
    setlocalLoadedActivityPropertyData(temp);
  };
*/

  //code updated on 06 mar 2023 for BugId 126396
  const pickListHandler = () => {
    setopenUserGroupMF(true);
    let microProps = {
      data: {
        initialSelected: getInitialSelectedUsersGroups(),
        onSelection: (list) => getUserGroupList(list),
        token: JSON.parse(secureLocalStorage.getItem("launchpadKey"))?.token,
        ext: true,
        customStyle: {
          selectedTableMinWidth: "50%", // selected user and group listing width
          listTableMinWidth: "50%", // user/ group listing width
          listHeight: "25rem", // custom height common for selected listing and user/group listing
          showUserFilter: true, // true for showing user filter, false for hiding
          showExpertiseDropDown: true, // true for showing expertise dropdown, false for hiding
          showGroupFilter: false, // true for showing group filter, false for hiding
          hideGroupFilter: true,
          hideExpertiseFilter: true,
        },
      },
      locale: secureLocalStorage.getItem("locale") || "en_US",
      direction: direction,
      ContainerId: "usergroupDiv",
      Module: "ORM",
      Component: "UserGroupPicklistMF",
      InFrame: false,
      type: "users",
      Renderer: "renderUserGroupPicklistMF",
    };
    window.loadUserGroupMF(microProps);
  };

  const closeModalUserGroup = () => {
    setopenUserGroupMF(false);
    setUserGroupData([]);
    var elem = document.getElementById("workspacestudio_assetManifest");
    elem.parentNode.removeChild(elem);
  };

  const saveChangeHandler = () => {
    let temp = global.structuredClone(localLoadedActivityPropertyData);
    // code edited on 22 Dec 2022 for BugId 120959
    let newArr = [];
    userGroupData.forEach((user) => {
      newArr.push({
        consultantName: user.consultantName,
        consultantId: user.consultantId,
        bRenderPlus: user.bRenderPlus,
      });
    });
    temp.taskGenPropInfo.genPropInfo.consultantList = [...newArr];
    setlocalLoadedActivityPropertyData(temp);
    setUserGroupData([]);
    closeModalUserGroup();
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.taskDetails]: {
          isModified: true,
          hasError: false, // code edited on 25 Nov 2022 for BugId 119630
        },
      })
    );
  };

  const getUserGroupList = (list) => {
    let temp = [...userGroupData];
    list.selectedUsers.forEach((user) => {
      temp.push({
        consultantName: user.name,
        consultantId: user.id,
        bRenderPlus: false,
      });
    });
    setUserGroupData(
      temp.sort(function (a, b) {
        return a.consultantName.localeCompare(b.consultantName);
      })
    );
  };

  const getInitialSelectedUsersGroups = () => {
    let users = [];
    Object.values(
      localLoadedActivityPropertyData.taskGenPropInfo?.genPropInfo
        ?.consultantList
    ).forEach((task) => {
      users.push({ id: task.consultantId, name: task.consultantName });
    });

    return { selectedUsers: users };
  };

  return (
    <Grid container direction="column">
      {openUserGroupMF ? (
        <ModalUsingCSS
          style={{
            width: "70%",
            top: "22%",
            height: "40rem",
            left: "18%",
            padding: "0",
            boxShadow: "none",
            background: "white",
            border: "1px solid rgb(211, 211, 211)",
            borderRadius: "0",
          }}
          children={
            <div
              // Changes on 21-10-23 to resolve the bug Id 135809
              style={{
                width: "98.5%",
                height: "100%",
                background: "white",
                display: "flex",
                flexDirection: "column",
                fontFamily: "Open Sans",
              }}
            >
              <div
                style={{
                  // Changes on 21-10-23 to resolve the bug Id 135809
                  width: "101.5%",
                  height: "13%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "var(--title_text_font_size)",
                  paddingInline: "1rem",
                  fontWeight: "600",
                  borderBottom: "1px solid rgb(0,0,0,0.3)",
                }}
              >
                {t("users")}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Button
                    variant="contained"
                    onClick={() => closeModalUserGroup()}
                    style={{ marginInline: "0.3rem", cursor: "pointer" }}
                    id="pmweb_TaskDetails_groupmf_discard_button"
                  >
                    {t("discard")}
                  </Button>
                  <Button
                    variant="contained"
                    style={{ marginInline: "0.3rem", cursor: "pointer" }}
                    color="primary"
                    onClick={saveChangeHandler}
                    id="pmweb_TaskDetails_groupmf_savechanges_button"
                  >
                    {t("save")} {t("changes")}
                  </Button>
                  <ClearOutlinedIcon
                    onClick={() => closeModalUserGroup()}
                    classes={{
                      root: classes.clearIcon,
                    }}
                    id="pmweb_TaskDetails_groupmf_clearicon"
                    tabindex={0}
                    onKeyUp={(e) => {
                      if (e.key === "Enter") {
                        closeModalUserGroup();
                      }
                    }}
                  />
                </div>
              </div>
              <div
                style={{
                  width: "100%",
                  height: "87%",
                }}
              >
                <div id="usergroupDiv"></div>
              </div>
            </div>
          }
        ></ModalUsingCSS>
      ) : null}
      <Grid item>
        <div style={{ width: "100%", height: "100%" }}>
          {spinner ? (
            <CircularProgress
              style={{ marginTop: "30vh", marginLeft: "40%" }}
            />
          ) : (
            <div className={classes.mainHeadDiv}>
              <TabsHeading heading={props?.heading} />
              <div
                className={classes.mainDiv}
                style={{
                  flexDirection: props.isDrawerExpanded ? "row" : "column",
                }}
              >
                <div
                  style={{
                    marginLeft: "0.75vw",
                    marginRight: props.isDrawerExpanded ? "1vw" : "1.45vw",
                    marginBottom: "1rem",
                    width: props.isDrawerExpanded ? "50%" : null,
                    paddingTop: props.isDrawerExpanded ? "1rem" : "0.25rem",
                    direction: direction === RTL_DIRECTION ? "rtl" : "ltr",
                  }}
                >
                  <Grid container direction="column" spacing={2}>
                    {/*****************************************************************************************
                     * @author asloob_ali BUG ID : 112728   Description : task: the Type field for selecting synchronous and asynchronous should be present in Process task instead of new Task as compare to iBPS 5.0
                     * Reason:it was visible for every type's task.
                     *  Resolution :added check for task type.
                     *  Date : 30/08/2022             **************/}
                    {taskType === "ProcessTask" && (
                      <Grid item style={{ padding: "8px 8px 0" }} xs={12}>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "space-between",
                          }}
                        >
                          <p style={{ fontSize: "12px" }}>{t("type")}</p>
                          <CustomizedDropdown
                            className="selectTwo_callActivity"
                            onChange={(e) =>
                              handleChangeInRegisteredProcessType(e)
                            }
                            id="pmweb_TaskDetails_RegisteredProcessType_Select"
                            style={{
                              width: props.isDrawerExpanded ? "25vw" : "135px",
                              height: "28px",
                              background: "#ffffff 0% 0% no-repeat padding-box",
                              font: "normal normal normal 12px/17px Open Sans !important",
                              border: "1px solid #c4c4c4",
                              borderRadius: "2px",
                              fontSize: "12px",
                            }}
                            value={selectedRegisteredProcessType}
                            disabled={isReadOnly}
                            hideDefaultSelect={true}
                            isNotMandatory={true}
                          >
                            <MenuItem
                              className="InputPairDiv_CommonList"
                              value="S"
                              style={{ fontSize: "12px" }}
                            >
                              {t("Synchronous")}
                            </MenuItem>
                            <MenuItem
                              className="InputPairDiv_CommonList"
                              value="A"
                              style={{ fontSize: "12px" }}
                            >
                              {t("Asynchronous")}
                            </MenuItem>
                            <MenuItem
                              className="InputPairDiv_CommonList"
                              value="U"
                              style={{ fontSize: "12px" }}
                            >
                              {t("userMonitoredSynchronous")}
                            </MenuItem>
                          </CustomizedDropdown>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            marginTop: "1rem",
                            marginBottom: "5px",
                            justifyContent: "space-between",
                          }}
                        >
                          <div
                            style={{ display: "flex", flexDirection: "row" }}
                          >
                            <p style={{ fontSize: "12px" }}>
                              {t("selectRegisteredProcess")}
                              <span
                                style={{
                                  color: "red",
                                  margin: props.isDrawerExpanded
                                    ? "-3px 0px 0px 0px"
                                    : "-3px 0px 0px 0px",
                                }}
                              >
                                *
                              </span>
                            </p>
                            {/* <span
                            style={{
                              color: "red",
                              margin: props.isDrawerExpanded
                                ? "-3px 0px 0px 0px"
                                : "-3px 60px 0px 0px",
                            }}
                          >
                            *
                          </span> */}
                          </div>
                          <div
                            style={{ display: "flex", flexDirection: "column" }}
                          >
                            <CustomizedDropdown
                              className="selectTwo_callActivity"
                              onChange={(e) =>
                                handleChangeInRegisteredProcess(e)
                              }
                              id="pmweb_TaskDetails_RegisteredProcess_Select"
                              style={{
                                width: props.isDrawerExpanded
                                  ? "25vw"
                                  : "135px",
                                height: "28px",
                                background:
                                  "#ffffff 0% 0% no-repeat padding-box",
                                font: "normal normal normal 12px/17px Open Sans !important",
                                border: registeredProcessErr
                                  ? "1px solid red"
                                  : "1px solid #c4c4c4",
                                borderRadius: "2px",
                                opacity: "1",
                                fontSize: "12px",
                              }}
                              disabled={isReadOnly}
                              value={selectedRegisteredProcess}
                              hideDefaultSelect={true}
                              isNotMandatory={true}
                            >
                              {registeredProcessList?.map((list) => {
                                return (
                                  <MenuItem
                                    className="InputPairDiv_CommonList"
                                    value={list.ProcessName}
                                    style={{ fontSize: "12px" }}
                                  >
                                    {list.ProcessName}
                                  </MenuItem>
                                );
                              })}
                            </CustomizedDropdown>
                            {registeredProcessErr ? (
                              <span style={{ color: "red", fontSize: "10px" }}>
                                {t("selectRegisteredProcess")}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </Grid>
                    )}
                    {/*code updated on 06 Apr 2023 for BugId 126394*/}
                    {localLoadedActivityPropertyData?.taskGenPropInfo
                      ?.taskTemplateInfo?.m_bGlobalTemplate && (
                      <Grid item xs={props.isDrawerExpanded ? 9 : 12}>
                        <Field
                          id="pmweb_taskdetails_TaskTemplateName_field"
                          name="TaskTemplateName"
                          required={true}
                          label={`${t("task")} ${t("Template")} ${t("name")}`}
                          value={taskTemplateName.value}
                          onChange={handleChange}
                          error={taskTemplateName.error}
                          helperText={taskTemplateName.helperText}
                          disabled={isReadOnly}
                          inputRef={templateNameRef}
                          onKeyPress={(e) =>
                            FieldValidations(
                              e,
                              150,
                              templateNameRef.current,
                              255
                            )
                          }
                        />
                      </Grid>
                    )}
                    <Grid item xs={props.isDrawerExpanded ? 9 : 12}>
                      <Field
                        id="pmweb_taskdetails_description_field"
                        sunEditor={true}
                        name="Description"
                        label={t("description")}
                        value={description.value}
                        onChange={handleChange}
                        placeholder={t("placeholderCustomValidation")}
                        disabled={isReadOnly}
                        sunEditorWidth={
                          props.isDrawerExpanded ? "260px" : "30px"
                        }
                        //Bug 124601 new task>> dropdown of description is getting overlapping with other fields
                        //[09-03-2023] provided zIndex
                        zIndex={99}
                      />
                    </Grid>

                    <Grid
                      item
                      xs={props.isDrawerExpanded ? 9 : 12}
                      style={{ padding: "0 8px" }}
                    >
                      <Field
                        id="pmweb_taskdetails_goal_field"
                        name="Goal"
                        required={true}
                        label={t("goal")}
                        value={goal.value}
                        disabled={isReadOnly}
                        //onChange={(e) => handleChangeGoal(e)}
                        onChange={handleChange}
                        error={goal.error}
                        helperText={goal.helperText}
                        inputRef={goalRef}
                        onKeyPress={(e) =>
                          FieldValidations(e, 168, goalRef.current, 1000)
                        }
                      />
                    </Grid>
                    <Grid
                      item
                      xs={props.isDrawerExpanded ? 9 : 12}
                      style={{ padding: "4px 8px" }}
                    >
                      {/*code updated on 15 September 2022 for BugId 112903*/}
                      <Field
                        id="pmweb_taskdetails_instructions_field"
                        name="Instructions"
                        required={true}
                        label={t("instructions")}
                        value={instructions.value}
                        // onChange={(e) => handleChangeInstructions(e)}
                        onChange={handleChange}
                        error={instructions.error}
                        helperText={instructions.helperText}
                        disabled={isReadOnly}
                        inputRef={instructionsRef}
                        onKeyPress={(e) =>
                          FieldValidations(
                            e,
                            168,
                            instructionsRef.current,
                            1000
                          )
                        }
                      />
                    </Grid>

                    <Grid
                      item
                      style={{
                        padding: "0 10px",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      {/*code edited on 25 Nov 2022 for BugId 119632 */}
                      {taskType !== "ProcessTask" && (
                        <FormControlLabel
                          control={
                            <Checkbox
                              disabled={isReadOnly}
                              size="small"
                              checked={repeatable}
                              id="pmweb_taskdetails_repeatable_checkbox"
                              name="Repeatable"
                              icon={
                                <CheckBoxOutlineBlankIcon
                                  fontSize="small"
                                  className={classes.icon}
                                />
                              }
                              checkedIcon={
                                <CheckBoxIcon
                                  fontSize="small"
                                  className={
                                    classes.icon + " " + classes.CheckBoxIcon
                                  }
                                />
                              }
                              onChange={handleChange}
                              onKeyUp={(e) => {
                                if (e.key === "Enter") {
                                  handleChange({
                                    ...e,
                                    target: {
                                      ...e.target,
                                      checked: !repeatable,
                                    },
                                  });
                                }
                              }}
                            />
                          }
                          label={t("repeatable")}
                        />
                      )}
                      <FormControlLabel
                        control={
                          <Checkbox
                            disabled={isReadOnly}
                            size="small"
                            checked={notifyByEmail}
                            id="pmweb_taskdetails_notifybyemail_checkbox"
                            icon={
                              <CheckBoxOutlineBlankIcon
                                fontSize="small"
                                className={classes.icon}
                              />
                            }
                            checkedIcon={
                              <CheckBoxIcon
                                fontSize="small"
                                className={
                                  classes.icon + " " + classes.CheckBoxIcon
                                }
                              />
                            }
                            name="NotifyByEmail"
                            onChange={handleChange}
                            onKeyUp={(e) => {
                              if (e.key === "Enter") {
                                handleChange({
                                  ...e,
                                  target: {
                                    ...e.target,
                                    checked: !notifyByEmail,
                                  },
                                });
                              }
                            }}
                          />
                        }
                        label={t("NotifyByEmail")}
                      />
                      {/* ================================== */}
                      {/* modified on 11/09/2023 for BugId 136463;*/}
                      {/**
 * 
                      {selectedRegisteredProcessType == "U" ? null : (
 * 
 */}
                      {taskType === "ProcessTask" && (
                        <FormControlLabel
                          control={
                            <Checkbox
                              disabled={isReadOnly}
                              size="small"
                              checked={initiateWorkItem}
                              id="pmweb_taskdetails_InitiateWorkItem_checkbox"
                              icon={
                                <CheckBoxOutlineBlankIcon
                                  fontSize="small"
                                  className={classes.icon}
                                />
                              }
                              checkedIcon={
                                <CheckBoxIcon
                                  fontSize="small"
                                  className={
                                    classes.icon + " " + classes.CheckBoxIcon
                                  }
                                />
                              }
                              name="InitiateWorkItem"
                              onChange={handleChange}
                              onKeyUp={(e) => {
                                if (e.key === "Enter") {
                                  handleChange({
                                    ...e,
                                    target: {
                                      ...e.target,
                                      checked: !initiateWorkItem,
                                    },
                                  });
                                }
                              }}
                            />
                          }
                          label={t("InitiateWorkItem")}
                        />
                      )}
                      {/* ======================================== */}
                    </Grid>
                    <Grid
                      item
                      xs={props.isDrawerExpanded ? 9 : 12}
                      style={{
                        padding: "4px 8px",
                        margin: props.isDrawerExpanded ? "0" : "1rem 0",
                        width: "30vw", // code added on 10-10-23 for bugId: 138141
                      }}
                    >
                      <TurnAroundTime
                        required
                        days={turnAroundTime.value?.days || 0}
                        hours={turnAroundTime.value?.hours || 0}
                        minutes={turnAroundTime.value?.minutes || 0}
                        calendarType={turnAroundTime.value?.calendarType || ""}
                        handleChange={handleChange}
                        label={t("turnaroundTime")}
                        disabled={isReadOnly}
                        isColumn={true}
                      />
                    </Grid>
                  </Grid>
                </div>
                <Divider orientation="vertical" flexItem fullWidth />
                <div
                  style={{
                    marginLeft: "0.75vw",
                    marginRight: props.isDrawerExpanded ? "1vw" : "1.25vw",
                    marginBottom: "1rem",
                    width: props.isDrawerExpanded ? "50%" : null,
                    paddingTop: props.isDrawerExpanded ? "1rem" : "0.25rem",
                    direction: direction === RTL_DIRECTION ? "rtl" : "ltr",
                  }}
                >
                  <div>
                    <Grid container direction="column" spacing={2}>
                      <Grid item xs={3}>
                        <Field
                          id="pmweb_taskdetails_cost_field"
                          type="number"
                          name="Cost"
                          label={t("cost")}
                          required={true}
                          extraLabel={` (${t("in $")})`}
                          step={0.1}
                          min={0}
                          value={cost.value}
                          onChange={handleChange}
                          error={cost.error}
                          helperText={cost.helperText}
                          disabled={isReadOnly}
                          inputRef={costRef} //added on 17/10/2023, bug_id:135583
                          onKeyPress={(e) =>
                            FieldValidations(e, 130, costRef.current, 14)
                          } //added on 17/10/2023, bug_id:135583
                        />
                      </Grid>
                      <Grid
                        item
                        container
                        spacing={2}
                        alignItems="center"
                        xs={props.isDrawerExpanded ? 9 : 12}
                      >
                        <Grid item xs>
                          <Field
                            id="pmweb_taskdetails_TaskAdvisor_field"
                            name="TaskAdvisor"
                            label={`${t("task")} ${t("advisor")}`}
                            disabled={true}
                          />
                        </Grid>
                        {
                          //Modified on 17/09/2023, bug_id:134898
                        }
                        {/*Code added on 11-09-2023 fo Bug 134899 */}
                        {/*   {!isReadOnly && (
                          <Grid
                            item
                            className={classes.dotBtnIcon}
                            onClick={() => pickListHandler()}
                            id="pmweb_taskdetails_dotBtnIcon_grid"
                          >
                          
                            <Tooltip title="Add a task advisor for on-the-fly support to the task owner during task execution">
                            <MoreHoriz
                              className={classes.btnIcon}
                              tabindex={0}
                              onKeyUp={(e) => {
                                if (e.key === "Enter") {
                                  pickListHandler();
                                }
                              }}
                            />
                            </Tooltip>
                          
                          </Grid>
                        )} */}
                        {/*Till here*/}
                        {
                          //till here for bug_id:134898
                        }
                        {!isReadOnly && (
                          <Grid
                            item
                            className={classes.addAdvisorBtnIcon}
                            onClick={() => pickListHandler()}
                            id="pmweb_taskdetails_addAdvisorBtnIcon_grid"
                            tabindex={0}
                            onKeyUp={(e) => {
                              if (e.key === "Enter") {
                                pickListHandler();
                              }
                            }}
                          >
                            {/*Code added on 11-09-2023 fo Bug 134899 */}
                            <Tooltip title="Add">
                              <Typography className={classes.plusIcon}>
                                +
                              </Typography>
                            </Tooltip>
                            {/*Till here*/}
                          </Grid>
                        )}
                      </Grid>
                      {taskAdvisorList?.length > 0 ? (
                        <div className={classes.advisorList}>
                          {taskAdvisorList.map((advisor) => (
                            <Grid
                              item
                              container
                              style={{ padding: "0.5rem 1vw" }}
                            >
                              <Grid item style={{ maxWidth: "80%" }}>
                                <Typography
                                  className={classes.fontSize}
                                  style={{
                                    width: "100%",
                                    textOverflow: "ellipsis",
                                    overflow: "hidden",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {advisor.consultantName}
                                </Typography>
                              </Grid>
                              <Grid item style={{ marginLeft: "auto" }}>
                                {/*Code added on 11-09-2023 fo Bug 134899 */}
                                {!isReadOnly && (
                                  <Tooltip title="Delete">
                                    <DeleteIcon
                                      className={classes.deleteIcon}
                                      onClick={() =>
                                        handleDeleteAdvisor(
                                          advisor.consultantId
                                        )
                                      }
                                      id={`pmweb_taskdetails_deleteicon_${advisor.consultantId}`}
                                      tabindex={0}
                                      onKeyUp={(e) => {
                                        if (e.key === "Enter") {
                                          handleDeleteAdvisor(
                                            advisor.consultantId
                                          );
                                        }
                                      }}
                                    />
                                  </Tooltip>
                                )}
                                {/*Till here*/}
                              </Grid>
                            </Grid>
                          ))}
                        </div>
                      ) : null}
                    </Grid>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Grid>
    </Grid>
  );
}

const mapStateToProps = (state) => {
  return {
    isDrawerExpanded: state.isDrawerExpanded.isDrawerExpanded,
  };
};
export default connect(mapStateToProps, null)(TaskDetails);
