import React, { useEffect, useRef, useState } from "react";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import { Checkbox, Tabs, Tab } from "@material-ui/core";
import classes from "../Task.module.css";
import { TabPanel } from "../Task";
import { store, useGlobalState } from "state-pool";
import { useTranslation } from "react-i18next";
import { setActivityPropertyChange } from "../../../../../redux-store/slices/ActivityPropertyChangeSlice";
import { useDispatch } from "react-redux";
import {
  BASE_URL,
  RTL_DIRECTION,
  propertiesLabel,
} from "../../../../../Constants/appConstants";
import axios from "axios";
import { LightTooltip } from "../../../../../UI/StyledTooltip";
import { shortenRuleStatement } from "../../../../../utility/CommonFunctionCall/CommonFunctionCall";
import { setToastDataFunc } from "../../../../../redux-store/slices/ToastDataHandlerSlice";

function ManageRights(props) {
  let { t } = useTranslation();
  let { taskInfo, isReadOnly } = props;
  const actProperty = store.getState("activityPropertyData");
  const [localLoadedActivityPropertyData, setlocalLoadedActivityPropertyData] =
    useGlobalState(actProperty);
  const [docRights, setdocRights] = useState([]);
  const [propertyTabValue, setpropertyTabValue] = useState("");
  // const exceptionViewRef = useRef([]);

  useEffect(() => {
    let tabNames = [];
    let temp = JSON.parse(JSON.stringify(localLoadedActivityPropertyData));
    if (
      temp?.ActivityProperty?.wdeskInfo?.objPMWdeskExceptions?.m_bShowExceptions
    ) {
      tabNames.push("exceptions");
      temp?.ActivityProperty?.wdeskInfo?.objPMWdeskTasks?.taskMap &&
        Object.values(
          temp?.ActivityProperty?.wdeskInfo?.objPMWdeskTasks?.taskMap
        ).forEach((task) => {
          if (task.taskTypeInfo?.taskId === taskInfo?.taskTypeInfo?.taskId) {
            localLoadedActivityPropertyData?.ActivityProperty?.wdeskInfo
              ?.objPMWdeskExceptions?.exceptionMap &&
              Object.values(
                localLoadedActivityPropertyData?.ActivityProperty?.wdeskInfo
                  ?.objPMWdeskExceptions?.exceptionMap
              ).forEach((exc) => {
                let m_arr = task.m_arrExceptionInfo
                  ? task.m_arrExceptionInfo?.map(
                      (arr) => arr?.expTypeInfo?.expTypeId
                    )
                  : [];
                // modified on 04/01/24 for BugId 142324
                // if (m_arr.includes(exc.expTypeInfo?.expTypeId)) return;
                if (m_arr.includes(exc.expTypeInfo?.expTypeId)) {
                  temp.ActivityProperty.wdeskInfo.objPMWdeskTasks.taskMap[
                    taskInfo.taskTypeInfo.taskName
                  ].m_arrExceptionInfo[
                    m_arr?.indexOf(exc.expTypeInfo?.expTypeId)
                  ] = {
                    ...task.m_arrExceptionInfo[
                      m_arr?.indexOf(exc.expTypeInfo?.expTypeId)
                    ],
                    vTaskDisabledTrigFlag: !exc.vTrigFlag,
                    vaTaskDisabledTrigFlag: !exc.vaTrigFlag,
                    vcTaskDisabledTrigFlag: !exc.vcTrigFlag,
                    vrTaskDisabledTrigFlag: !exc.vrTrigFlag,
                  };
                }
                // till here BugId 142324

                // commented on 05/01/24 for BugId 142324
                /*else {
                  if (task.m_arrExceptionInfo) {
                    temp.ActivityProperty.wdeskInfo.objPMWdeskTasks.taskMap[
                      taskInfo.taskTypeInfo.taskName
                    ].m_arrExceptionInfo = [
                      ...task.m_arrExceptionInfo,
                      {
                        vTaskTrigFlag: exc.vTrigFlag, //view
                        vrTaskTrigFlag: exc.vrTrigFlag, //raise
                        vaTaskTrigFlag: exc.vaTrigFlag, //respond
                        vcTaskTrigFlag: exc.vcTrigFlag, //clear
                        // added on 04/01/24 for BugId 142324
                        vTaskDisabledTrigFlag: !exc.vTrigFlag,
                        vaTaskDisabledTrigFlag: !exc.vaTrigFlag,
                        vcTaskDisabledTrigFlag: !exc.vcTrigFlag,
                        vrTaskDisabledTrigFlag: !exc.vrTrigFlag,
                        // till here BugId 142324
                        expTypeInfo: {
                          expTypeName: exc.expTypeInfo.expTypeName,
                          expTypeId: exc.expTypeInfo.expTypeId,
                        },
                      },
                    ];
                  } else {
                    temp.ActivityProperty.wdeskInfo.objPMWdeskTasks.taskMap[
                      taskInfo.taskTypeInfo.taskName
                    ] = {
                      ...task,
                      m_arrExceptionInfo: [
                        ...task.m_arrExceptionInfo,
                        {
                          vTaskTrigFlag: exc.vTrigFlag, //view
                          vrTaskTrigFlag: exc.vrTrigFlag, //raise
                          vaTaskTrigFlag: exc.vaTrigFlag, //respond
                          vcTaskTrigFlag: exc.vcTrigFlag, //clear
                          // added on 04/01/24 for BugId 142324
                          vTaskDisabledTrigFlag: !exc.vTrigFlag,
                          vaTaskDisabledTrigFlag: !exc.vaTrigFlag,
                          vcTaskDisabledTrigFlag: !exc.vcTrigFlag,
                          vrTaskDisabledTrigFlag: !exc.vrTrigFlag,
                          // till here BugId 142324
                          expTypeInfo: {
                            expTypeName: exc.expTypeInfo.expTypeName,
                            expTypeId: exc.expTypeInfo.expTypeId,
                          },
                        },
                      ],
                    };
                  }
                }*/
                // till here BugId 142324
              });
          }
        });
    }

    if (
      temp?.ActivityProperty?.wdeskInfo?.objPMWdeskDocuments?.m_bchkBoxChecked
    ) {
      tabNames.push("documents");
      temp?.ActivityProperty?.wdeskInfo?.objPMWdeskTasks?.taskMap &&
        Object.values(
          temp?.ActivityProperty?.wdeskInfo?.objPMWdeskTasks?.taskMap
        ).forEach((task) => {
          if (task.taskTypeInfo?.taskId === taskInfo?.taskTypeInfo?.taskId) {
            localLoadedActivityPropertyData?.ActivityProperty?.wdeskInfo
              ?.objPMWdeskDocuments?.documentMap &&
              Object.values(
                localLoadedActivityPropertyData?.ActivityProperty?.wdeskInfo
                  ?.objPMWdeskDocuments?.documentMap
              ).forEach((exc) => {
                let m_arr = task.m_arrDocumentInfo
                  ? task.m_arrDocumentInfo?.map((arr) => arr?.docTypeId)
                  : [];
                // modified on 04/01/24 for BugId 142324
                // if (m_arr.includes(exc.documentType?.docTypeId)) return;
                if (m_arr.includes(exc.documentType?.docTypeId)) {
                  temp.ActivityProperty.wdeskInfo.objPMWdeskTasks.taskMap[
                    taskInfo.taskTypeInfo.taskName
                  ].m_arrDocumentInfo[
                    m_arr?.indexOf(exc.documentType?.docTypeId)
                  ] = {
                    ...task.m_arrDocumentInfo[
                      m_arr?.indexOf(exc.documentType?.docTypeId)
                    ],
                    m_bIsAddDisabledForTask: !exc.isAdd,
                    m_bIsViewDisabledForTask: !exc.isView,
                    m_bIsModifyDisabledForTask: !exc.isModify,
                  };
                }
                // till here BugId 142324

                // commented on 05/01/24 for BugId 142324
                /*else {
                  if (task.m_arrDocumentInfo) {
                    temp.ActivityProperty.wdeskInfo.objPMWdeskTasks.taskMap[
                      taskInfo.taskTypeInfo.taskName
                    ].m_arrDocumentInfo = [
                      ...task.m_arrDocumentInfo,
                      {
                        m_bIsAddForTask: exc.isAdd,
                        m_bIsViewForTask: exc.isView,
                        m_bIsModifyForTask: exc.isModify,
                        // added on 04/01/24 for BugId 142324
                        m_bIsAddDisabledForTask: !exc.isAdd,
                        m_bIsViewDisabledForTask: !exc.isView,
                        m_bIsModifyDisabledForTask: !exc.isModify,
                        // till here BugId 142324
                        docTypeName: exc.documentType.docTypeName,
                        docTypeId: exc.documentType.docTypeId,
                      },
                    ];
                  } else {
                    temp.ActivityProperty.wdeskInfo.objPMWdeskTasks.taskMap[
                      taskInfo.taskTypeInfo.taskName
                    ] = {
                      ...task,
                      m_arrDocumentInfo: [
                        {
                          m_bIsAddForTask: exc.isAdd,
                          m_bIsViewForTask: exc.isView,
                          m_bIsModifyForTask: exc.isModify,
                          // added on 04/01/24 for BugId 142324
                          m_bIsAddDisabledForTask: !exc.isAdd,
                          m_bIsViewDisabledForTask: !exc.isView,
                          m_bIsModifyDisabledForTask: !exc.isModify,
                          // till here BugId 142324
                          docTypeName: exc.documentType.docTypeName,
                          docTypeId: exc.documentType.docTypeId,
                        },
                      ],
                    };
                  }
                }*/
                // till here BugId 142324
              });
          }
        });
    }

    if (temp?.ActivityProperty?.wdeskInfo?.objPMWdeskTodoLists?.todoRendered) {
      tabNames.push("toDos");
      temp?.ActivityProperty?.wdeskInfo?.objPMWdeskTasks?.taskMap &&
        Object.values(
          temp?.ActivityProperty?.wdeskInfo?.objPMWdeskTasks?.taskMap
        ).forEach((task) => {
          if (task.taskTypeInfo?.taskId === taskInfo?.taskTypeInfo?.taskId) {
            localLoadedActivityPropertyData?.ActivityProperty?.wdeskInfo
              ?.objPMWdeskTodoLists?.todoMap &&
              Object.values(
                localLoadedActivityPropertyData?.ActivityProperty?.wdeskInfo
                  ?.objPMWdeskTodoLists?.todoMap
              )?.forEach((exc) => {
                let m_arr = task.m_arrTodoInfo
                  ? task.m_arrTodoInfo?.map((arr) => arr?.todoTypeInfo?.todoId)
                  : [];
                if (m_arr.includes(exc.todoTypeInfo?.todoId)) {
                  let index = m_arr.indexOf(exc.todoTypeInfo?.todoId);
                  temp.ActivityProperty.wdeskInfo.objPMWdeskTasks.taskMap[
                    taskInfo.taskTypeInfo.taskName
                  ].m_arrTodoInfo[index] = {
                    ...task.m_arrTodoInfo[index],
                    // modified on 04/01/24 for BugId 142324
                    // m_bReadOnlyForTask: exc.isView,
                    // m_bModifyForTask: exc.isReadOnly,
                    // modifyDisabled: exc.isView,
                    modifyDisabled: exc.isReadOnly,
                    // till here BugId 142324
                  };
                }
                // commented on 05/01/24 for BugId 142324
                /*else {
                  if (task.m_arrTodoInfo) {
                    temp.ActivityProperty.wdeskInfo.objPMWdeskTasks.taskMap[
                      taskInfo.taskTypeInfo.taskName
                    ].m_arrTodoInfo = [
                      ...task.m_arrTodoInfo,
                      {
                        // modified on 04/01/24 for BugId 142324
                        // m_bReadOnlyForTask: exc.isView,
                        // m_bModifyForTask: exc.isReadOnly,
                        // modifyDisabled: exc.isView,
                        m_bReadOnlyForTask: exc.isReadOnly,
                        m_bModifyForTask: exc.isView,
                        modifyDisabled: exc.isReadOnly,
                        // till here BugId 142324
                        todoTypeInfo: {
                          todoId: exc.todoTypeInfo.todoId,
                          todoName: exc.todoTypeInfo.todoName,
                        },
                      },
                    ];
                  } else {
                    temp.ActivityProperty.wdeskInfo.objPMWdeskTasks.taskMap[
                      taskInfo.taskTypeInfo.taskName
                    ] = {
                      ...task,
                      m_arrTodoInfo: [
                        {
                          // modified on 04/01/24 for BugId 142324
                          // m_bReadOnlyForTask: exc.isView,
                          // m_bModifyForTask: exc.isReadOnly,
                          // modifyDisabled: exc.isView,
                          m_bReadOnlyForTask: exc.isReadOnly,
                          m_bModifyForTask: exc.isView,
                          modifyDisabled: exc.isReadOnly,
                          // till here BugId 142324
                          todoTypeInfo: {
                            todoId: exc.todoTypeInfo.todoId,
                            todoName: exc.todoTypeInfo.todoName,
                          },
                        },
                      ],
                    };
                  }
                }*/
                // till here BugId 142324
              });
          }
        });
    }

    if (temp?.ActivityProperty?.actGenPropInfo?.m_bFormView) {
      tabNames.push("Forms");
      temp?.ActivityProperty?.wdeskInfo?.objPMWdeskTasks?.taskMap &&
        Object.values(
          temp?.ActivityProperty?.wdeskInfo?.objPMWdeskTasks?.taskMap
        ).forEach((task) => {
          if (task.taskTypeInfo?.taskId === taskInfo?.taskTypeInfo?.taskId) {
            if (
              task.objFormInfo &&
              +task.objFormInfo.formId !==
                +localLoadedActivityPropertyData?.ActivityProperty
                  ?.actGenPropInfo?.selFormId
            ) {
              temp.ActivityProperty.wdeskInfo.objPMWdeskTasks.taskMap[
                taskInfo.taskTypeInfo.taskName
              ].objFormInfo = {
                isReadOnlyForTask: true,
                isModifiedForTask: true,
                formId:
                  localLoadedActivityPropertyData?.ActivityProperty
                    ?.actGenPropInfo?.selFormId,
              };
            } else if (!task.objFormInfo) {
              temp.ActivityProperty.wdeskInfo.objPMWdeskTasks.taskMap[
                taskInfo.taskTypeInfo.taskName
              ] = {
                ...task,
                objFormInfo: {
                  isReadOnlyForTask: true,
                  isModifiedForTask: true,
                  formId:
                    localLoadedActivityPropertyData?.ActivityProperty
                      ?.actGenPropInfo?.selFormId,
                },
              };
            }
          }
        });
    }
    setdocRights(tabNames);
    setlocalLoadedActivityPropertyData(temp);
    setpropertyTabValue(tabNames.length > 0 ? tabNames[0] : "");
  }, [taskInfo?.taskTypeInfo?.taskName]);

  const getTabPanels = () => {
    return (
      <RightsTable
        val={propertyTabValue}
        activeTask={taskInfo}
        isReadOnly={isReadOnly}
      />
    );
  };

  return (
    <TabPanel style={{ height: "10px", width: "100%" }}>
      <Tabs
        value={propertyTabValue}
        onChange={(e, val) => setpropertyTabValue(val)}
        className={props.styling.tabsHorizontal}
      >
        {docRights.map((rights) => (
          <Tab
            classes={{ root: props.styling.tabRoot }}
            label={t(rights)}
            value={rights}
            tabIndex={0}
          />
        ))}
      </Tabs>

      {getTabPanels()}
    </TabPanel>
  );
}

function RightsTable({ val, activeTask, isReadOnly }) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const dispatch = useDispatch();
  const [tableHeaders, settableHeaders] = useState([]);
  const [tableWidth, setTableWidth] = useState("100%");
  const [formsArray, setformsArray] = useState([]);
  const [CurrentTab, setCurrentTab] = useState();
  const actProperty = store.getState("activityPropertyData");
  const [localLoadedActivityPropertyData, setlocalLoadedActivityPropertyData] =
    useGlobalState(actProperty);
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const exceptionViewRef = useRef([]);
  const exceptionRaiseRef = useRef([]);
  const exceptionRespondRef = useRef([]);
  const exceptionClearRef = useRef([]);
  const docAddRef = useRef([]);
  const docViewRef = useRef([]);
  const docModifyRef = useRef([]);

  const formViewRef = useRef([]);
  const formModifyRef = useRef([]);

  const todosViewRef = useRef([]);
  const todosModifyRef = useRef([]);

  useEffect(() => {
    const getAllFormList = async () => {
      try {
        const res = await axios.get(
          BASE_URL +
            `/process/${
              localLoadedProcessData.ProcessType === "R"
                ? "registered"
                : "local"
            }/getFormlist/${localLoadedProcessData?.ProcessDefId}`
        );
        setformsArray([
          { formId: "-1", formName: "Default", deviceType: "H" },
          ...res.data,
        ]);
      } catch (err) {
        dispatch(
          setToastDataFunc({
            message: err?.response?.data?.errorMsg,
            severity: "error",
            open: true,
          })
        );
      }
    };
    getAllFormList();
  }, []);

  useEffect(() => {
    if (val === "Forms") {
      settableHeaders([
        { name: t("formName") },
        { name: t("modify") },
        { name: t("View") },
      ]);
      setTableWidth("33%");
    } else if (val === "exceptions") {
      settableHeaders([
        { name: t("exceptionName") },
        { name: t("view") },
        { name: t("raise") },
        { name: t("respond") },
        { name: t("clear") },
      ]);
      setTableWidth("20%");
    } else if (val === "toDos") {
      settableHeaders([
        { name: t("todoName") },
        { name: t("View") },
        { name: t("modify") },
      ]);
      setTableWidth("20%");
    } else {
      settableHeaders([
        { name: t("documentName") },
        { name: t("add") },
        { name: t("View") },
        { name: t("modify") },
      ]);
      setTableWidth("25%");
    }
    setCurrentTab(val);
  }, [val]);

  const onRightsChange = (e, data) => {
    let temp = JSON.parse(JSON.stringify(localLoadedActivityPropertyData));
    let type = e.target.name.split("_")[0];
    let op = e.target.name.split("_")[1];
    if (type === "exception") {
      temp?.ActivityProperty?.wdeskInfo?.objPMWdeskTasks?.taskMap &&
        Object.values(
          temp?.ActivityProperty?.wdeskInfo?.objPMWdeskTasks?.taskMap
        ).forEach((task) => {
          if (task.taskTypeInfo.taskId === activeTask.taskTypeInfo.taskId) {
            task.m_arrExceptionInfo.forEach((exc) => {
              if (exc.expTypeInfo.expTypeId === data.expTypeInfo.expTypeId) {
                // modified on 04/01/24 for BugId 142324
                // if (op === "view") exc.vTaskTrigFlag = e.target.checked;
                // if (op === "raise") exc.vrTaskTrigFlag = e.target.checked;
                // if (op === "respond") exc.vaTaskTrigFlag = e.target.checked;
                // if (op === "clear") exc.vcTaskTrigFlag = e.target.checked;
                if (op === "view") {
                  exc.vTaskTrigFlag = e.target.checked;
                  exc.vTaskDisabledTrigFlag = false;
                  if (!e.target.checked) {
                    exc.vrTaskTrigFlag = false;
                    exc.vaTaskTrigFlag = false;
                    exc.vcTaskTrigFlag = false;
                  }
                }
                if (op === "raise") {
                  exc.vrTaskTrigFlag = e.target.checked;
                  exc.vrTaskDisabledTrigFlag = false;
                }
                if (op === "respond") {
                  exc.vaTaskTrigFlag = e.target.checked;
                  exc.vaTaskDisabledTrigFlag = false;
                }
                if (op === "clear") {
                  exc.vcTaskTrigFlag = e.target.checked;
                  exc.vcTaskDisabledTrigFlag = false;
                }
                // till here BugId 142324
              }
            });
          }
        });
    } else if (type === "todo") {
      temp?.ActivityProperty?.wdeskInfo?.objPMWdeskTasks?.taskMap &&
        Object.values(
          temp?.ActivityProperty?.wdeskInfo?.objPMWdeskTasks?.taskMap
        ).forEach((task) => {
          if (task.taskTypeInfo.taskId === activeTask?.taskTypeInfo?.taskId) {
            task.m_arrTodoInfo?.forEach((exc) => {
              if (exc.todoTypeInfo.todoId === data.todoTypeInfo.todoId) {
                if (op === "view") {
                  exc.m_bReadOnlyForTask = e.target.checked;
                  if (!exc.modifyDisabled) {
                    exc.m_bModifyForTask = !e.target.checked;
                  }
                }
                if (op === "modify") {
                  exc.m_bReadOnlyForTask = !e.target.checked;
                  exc.m_bModifyForTask = e.target.checked;
                }
              }
            });
          }
        });
    } else if (type === "doc") {
      temp?.ActivityProperty?.wdeskInfo?.objPMWdeskTasks?.taskMap &&
        Object.values(
          temp?.ActivityProperty?.wdeskInfo?.objPMWdeskTasks?.taskMap
        ).forEach((task) => {
          if (task.taskTypeInfo.taskId === activeTask.taskTypeInfo.taskId) {
            task.m_arrDocumentInfo.forEach((exc) => {
              if (exc.docTypeId === data.docTypeId) {
                // modified on 04/01/24 for BugId 142324
                // if (op === "view") exc.m_bIsViewForTask = e.target.checked;
                // if (op === "modify") exc.m_bIsModifyForTask = e.target.checked;
                // if (op === "add") exc.m_bIsAddForTask = e.target.checked;
                if (op === "view") {
                  exc.m_bIsViewForTask = e.target.checked;
                  exc.m_bIsViewDisabledForTask = false;
                  if (!e.target.checked) {
                    exc.m_bIsModifyForTask = false;
                  }
                }
                if (op === "modify") {
                  exc.m_bIsModifyForTask = e.target.checked;
                  exc.m_bIsModifyDisabledForTask = false;
                }
                if (op === "add") {
                  exc.m_bIsAddForTask = e.target.checked;
                  exc.m_bIsAddDisabledForTask = false;
                }
                // till here BugId 142324
              }
            });
          }
        });
    } else if (type === "form") {
      temp?.ActivityProperty?.wdeskInfo?.objPMWdeskTasks?.taskMap &&
        Object.values(
          temp?.ActivityProperty?.wdeskInfo?.objPMWdeskTasks?.taskMap
        ).forEach((task) => {
          if (task.taskTypeInfo.taskId === activeTask.taskTypeInfo.taskId) {
            if (op === "view") {
              task.objFormInfo.isReadOnlyForTask = e.target.checked;
              if (!e.target.checked) {
                task.objFormInfo.isModifiedForTask = false;
              }
            }
            if (op === "modify") {
              if (e.target.checked) {
                task.objFormInfo.isReadOnlyForTask = true;
              }
              task.objFormInfo.isModifiedForTask = e.target.checked;
            }
          }
        });
    }
    setlocalLoadedActivityPropertyData(temp);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.task]: { isModified: true, hasError: false },
      })
    );
  };

  const dataForTabs = () => {
    if (CurrentTab === "exceptions") {
      return (
        <>
          {activeTask?.m_arrExceptionInfo &&
            Object.values(activeTask?.m_arrExceptionInfo).map(
              (exception, index) => (
                <TableRow className={classes.tableRow}>
                  <TableCell
                    width={tableWidth}
                    style={{ padding: "0.5rem 1vw" }}
                    align={direction === "rtl" ? "right" : "left"}
                  >
                    <p
                      style={{
                        fontSize: "var(--base_text_font_size)",
                        fontWeight: "500",
                      }}
                    >
                      <LightTooltip
                        arrow={true}
                        enterDelay={500}
                        placement="bottom"
                        title={exception?.expTypeInfo?.expTypeName}
                      >
                        <span>
                          {shortenRuleStatement(
                            exception.expTypeInfo.expTypeName,
                            30
                          )}
                        </span>
                      </LightTooltip>
                    </p>
                  </TableCell>
                  <TableCell
                    width={tableWidth}
                    style={{ padding: "0.5rem 1vw" }}
                    align={direction === "rtl" ? "right" : "left"}
                  >
                    <Checkbox
                      size="small"
                      name="exception_view"
                      onChange={(e) => onRightsChange(e, exception)}
                      checked={exception?.vTaskTrigFlag}
                      // modified on 04/01/24 for BugId 142324
                      // disabled={isReadOnly}
                      disabled={isReadOnly || exception?.vTaskDisabledTrigFlag}
                      // till here BugId 142324
                      id={`pmweb_ManageRights_exception_view_Checkbox_${exception?.vTaskTrigFlag}`}
                      inputRef={(item) =>
                        (exceptionViewRef.current[index] = item)
                      }
                      onKeyUp={(e) => {
                        if (e.key === "Enter") {
                          exceptionViewRef.current[index].click();
                          e.stopPropagation();
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell
                    width={tableWidth}
                    style={{ padding: "0.5rem 1vw" }}
                    align={direction === "rtl" ? "right" : "left"}
                  >
                    <Checkbox
                      size="small"
                      name="exception_raise"
                      onChange={(e) => onRightsChange(e, exception)}
                      checked={exception?.vrTaskTrigFlag}
                      // modified on 04/01/24 for BugId 142324
                      // disabled={isReadOnly}
                      disabled={
                        isReadOnly ||
                        exception?.vrTaskDisabledTrigFlag ||
                        !exception?.vTaskTrigFlag
                      }
                      // till here BugId 142324
                      id={`pmweb_ManageRights_exception_raise_Checkbox_${exception?.vTaskTrigFlag}`}
                      inputRef={(item) =>
                        (exceptionRaiseRef.current[index] = item)
                      }
                      onKeyUp={(e) => {
                        if (e.key === "Enter") {
                          exceptionRaiseRef.current[index].click();
                          e.stopPropagation();
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell
                    width={tableWidth}
                    style={{ padding: "0.5rem 1vw" }}
                    align={direction === "rtl" ? "right" : "left"}
                  >
                    <Checkbox
                      size="small"
                      name="exception_respond"
                      onChange={(e) => onRightsChange(e, exception)}
                      checked={exception?.vaTaskTrigFlag}
                      // modified on 04/01/24 for BugId 142324
                      // disabled={isReadOnly}
                      disabled={
                        isReadOnly ||
                        exception?.vaTaskDisabledTrigFlag ||
                        !exception?.vTaskTrigFlag
                      }
                      // till here BugId 142324
                      id={`pmweb_ManageRights_exception_respond_Checkbox_${exception?.vTaskTrigFlag}`}
                      inputRef={(item) =>
                        (exceptionRespondRef.current[index] = item)
                      }
                      onKeyUp={(e) => {
                        if (e.key === "Enter") {
                          exceptionRespondRef.current[index].click();
                          e.stopPropagation();
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell
                    width={tableWidth}
                    style={{ padding: "0.5rem 1vw" }}
                    align={direction === "rtl" ? "right" : "left"}
                  >
                    <Checkbox
                      size="small"
                      name="exception_clear"
                      onChange={(e) => onRightsChange(e, exception)}
                      checked={exception?.vcTaskTrigFlag}
                      // modified on 04/01/24 for BugId 142324
                      // disabled={isReadOnly}
                      disabled={
                        isReadOnly ||
                        exception?.vcTaskDisabledTrigFlag ||
                        !exception?.vTaskTrigFlag
                      }
                      // till here BugId 142324
                      id={`pmweb_ManageRights_exception_clear_Checkbox_${exception?.vTaskTrigFlag}`}
                      inputRef={(item) =>
                        (exceptionClearRef.current[index] = item)
                      }
                      onKeyUp={(e) => {
                        if (e.key === "Enter") {
                          exceptionClearRef.current[index].click();
                          e.stopPropagation();
                        }
                      }}
                    />
                  </TableCell>
                </TableRow>
              )
            )}
        </>
      );
    } else if (CurrentTab === "documents") {
      return (
        <>
          {activeTask.m_arrDocumentInfo &&
            Object.values(activeTask.m_arrDocumentInfo).map(
              (document, index) => (
                <TableRow className={classes.tableRow}>
                  <TableCell
                    width={tableWidth}
                    style={{ padding: "0.5rem 1vw" }}
                    align={direction === "rtl" ? "right" : "left"}
                  >
                    <p
                      style={{
                        fontSize: "var(--base_text_font_size)",
                        fontWeight: "500",
                      }}
                    >
                      <LightTooltip
                        arrow={true}
                        enterDelay={500}
                        placement="bottom"
                        title={document?.docTypeName}
                      >
                        <span>
                          {shortenRuleStatement(document.docTypeName, 30)}
                        </span>
                      </LightTooltip>
                    </p>
                  </TableCell>
                  <TableCell
                    width={tableWidth}
                    style={{ padding: "0.5rem 1vw" }}
                    align={direction === "rtl" ? "right" : "left"}
                  >
                    <Checkbox
                      size="small"
                      name="doc_add"
                      onChange={(e) => onRightsChange(e, document)}
                      checked={document.m_bIsAddForTask}
                      // modified on 04/01/24 for BugId 142324
                      // disabled={isReadOnly}
                      disabled={isReadOnly || document.m_bIsAddDisabledForTask}
                      // till here BugId 142324
                      id={`pmweb_ManageRights_doc_add_Checkbox_${document.docTypeName}`}
                      inputProps={{
                        "aria-label": document?.docTypeName,
                      }}
                      inputRef={(item) => (docAddRef.current[index] = item)}
                      onKeyUp={(e) => {
                        if (e.key === "Enter") {
                          docAddRef.current[index].click();
                          e.stopPropagation();
                        }
                      }}
                    />
                  </TableCell>
                  {/* modified on 04/01/24 for BugId 142324 */}
                  {/* <TableCell
                    width={tableWidth}
                    style={{ padding: "0.5rem 1vw" }}
                    align={direction === "rtl" ? "right" : "left"}
                  >
                    <Checkbox
                      size="small"
                      name="doc_modify"
                      onChange={(e) => onRightsChange(e, document)}
                      checked={document.m_bIsModifyForTask}
                      disabled={isReadOnly}
                      id={`pmweb_ManageRights_doc_modify_Checkbox_${document.docTypeName}`}
                      inputRef={(item) => (docModifyRef.current[index] = item)}
                      inputProps={{
                        "aria-label": document?.docTypeName,
                      }}
                      onKeyUp={(e) => {
                        if (e.key === "Enter") {
                          docModifyRef.current[index].click();
                          e.stopPropagation();
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell
                    width={tableWidth}
                    style={{ padding: "0.5rem 1vw" }}
                    align={direction === "rtl" ? "right" : "left"}
                  >
                    <Checkbox
                      size="small"
                      name="doc_view"
                      onChange={(e) => onRightsChange(e, document)}
                      checked={document.m_bIsViewForTask}
                      disabled={isReadOnly}
                      id={`pmweb_ManageRights_doc_view_Checkbox_${document.docTypeName}`}
                      inputProps={{
                        "aria-label": document?.docTypeName,
                      }}
                      inputRef={(item) => (docViewRef.current[index] = item)}
                      onKeyUp={(e) => {
                        if (e.key === "Enter") {
                          docViewRef.current[index].click();
                          e.stopPropagation();
                        }
                      }}
                    />
                  </TableCell> */}
                  <TableCell
                    width={tableWidth}
                    style={{ padding: "0.5rem 1vw" }}
                    align={direction === "rtl" ? "right" : "left"}
                  >
                    <Checkbox
                      size="small"
                      name="doc_view"
                      onChange={(e) => onRightsChange(e, document)}
                      checked={document.m_bIsViewForTask}
                      disabled={isReadOnly || document.m_bIsViewDisabledForTask}
                      id={`pmweb_ManageRights_doc_view_Checkbox_${document.docTypeName}`}
                      inputProps={{
                        "aria-label": document?.docTypeName,
                      }}
                      inputRef={(item) => (docViewRef.current[index] = item)}
                      onKeyUp={(e) => {
                        if (e.key === "Enter") {
                          docViewRef.current[index].click();
                          e.stopPropagation();
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell
                    width={tableWidth}
                    style={{ padding: "0.5rem 1vw" }}
                    align={direction === "rtl" ? "right" : "left"}
                  >
                    <Checkbox
                      size="small"
                      name="doc_modify"
                      onChange={(e) => onRightsChange(e, document)}
                      checked={document.m_bIsModifyForTask}
                      disabled={
                        isReadOnly || document.m_bIsModifyDisabledForTask
                      }
                      id={`pmweb_ManageRights_doc_modify_Checkbox_${document.docTypeName}`}
                      inputRef={(item) => (docModifyRef.current[index] = item)}
                      inputProps={{
                        "aria-label": document?.docTypeName,
                      }}
                      onKeyUp={(e) => {
                        if (e.key === "Enter") {
                          docModifyRef.current[index].click();
                          e.stopPropagation();
                        }
                      }}
                    />
                  </TableCell>
                  {/*till here BugId 142324 */}
                </TableRow>
              )
            )}
        </>
      );
    } else if (CurrentTab === "Forms") {
      return (
        <>
          {formsArray.map((form, index) => (
            <TableRow className={classes.tableRow}>
              <TableCell
                width={tableWidth}
                style={{ padding: "0.5rem 1vw" }}
                align={direction === "rtl" ? "right" : "left"}
              >
                <p
                  style={{
                    fontSize: "var(--base_text_font_size)",
                    fontWeight: "500",
                  }}
                >
                  <LightTooltip
                    arrow={true}
                    enterDelay={500}
                    placement="bottom"
                    title={form?.formName}
                  >
                    <span>{shortenRuleStatement(form.formName, 30)}</span>
                  </LightTooltip>
                </p>
              </TableCell>
              <TableCell
                width={tableWidth}
                style={{ padding: "0.5rem 1vw" }}
                align={direction === "rtl" ? "right" : "left"}
              >
                <label
                  style={{ display: "none" }}
                  htmlFor={`pmweb_ManageRights_form_modify_Checkbox_${form?.formName}`}
                >
                  Form Modify
                </label>
                <Checkbox
                  size="small"
                  name="form_modify"
                  onChange={(e) => onRightsChange(e, form)}
                  checked={
                    form.formId == activeTask.objFormInfo.formId
                      ? activeTask.objFormInfo.isModifiedForTask
                      : false
                  }
                  disabled={
                    isReadOnly ||
                    form.formId + "" !== activeTask.objFormInfo.formId + ""
                  }
                  id={`pmweb_ManageRights_form_modify_Checkbox_${form?.formName}`}
                  inputProps={{
                    "aria-label": form?.formName,
                  }}
                  inputRef={(item) => (formModifyRef.current[index] = item)}
                  onKeyUp={(e) => {
                    if (e.key === "Enter") {
                      formModifyRef.current[index].click();
                      e.stopPropagation();
                    }
                  }}
                />
              </TableCell>
              <TableCell
                width={tableWidth}
                style={{ padding: "0.5rem 1vw" }}
                align={direction === "rtl" ? "right" : "left"}
              >
                <label
                  style={{ display: "none" }}
                  htmlFor={`pmweb_ManageRights_form_view_Checkbox_${form?.formName}`}
                >
                  Form View
                </label>
                <Checkbox
                  size="small"
                  /* disabled={
                    form.formId + "" !== activeTask.objFormInfo.formId + ""
                  }*/
                  disabled={true}
                  name="form_view"
                  onChange={(e) => onRightsChange(e, form)}
                  checked={
                    form.formId == activeTask.objFormInfo.formId
                      ? activeTask.objFormInfo.isReadOnlyForTask
                      : false
                  }
                  id={`pmweb_ManageRights_form_view_Checkbox_${form?.formName}`}
                  inputProps={{
                    "aria-label": form?.formName,
                  }}
                  inputRef={(item) => (formViewRef.current[index] = item)}
                  onKeyUp={(e) => {
                    if (e.key === "Enter") {
                      formViewRef.current[index].click();
                      e.stopPropagation();
                    }
                  }}
                />
              </TableCell>
            </TableRow>
          ))}
        </>
      );
    } else if (CurrentTab === "toDos") {
      return (
        <>
          {activeTask?.m_arrTodoInfo &&
            Object.values(activeTask?.m_arrTodoInfo).map((todo, index) => (
              <TableRow className={classes.tableRow}>
                <TableCell
                  width={tableWidth}
                  style={{ padding: "0.5rem 1vw" }}
                  align={direction === "rtl" ? "right" : "left"}
                >
                  <p
                    style={{
                      fontSize: "var(--base_text_font_size)",
                      fontWeight: "500",
                    }}
                  >
                    <LightTooltip
                      arrow={true}
                      enterDelay={500}
                      placement="bottom"
                      title={todo?.todoTypeInfo?.todoName}
                    >
                      <span>
                        {shortenRuleStatement(todo.todoTypeInfo.todoName, 30)}
                      </span>
                    </LightTooltip>
                  </p>
                </TableCell>
                <TableCell
                  width={tableWidth}
                  style={{ padding: "0.5rem 1vw" }}
                  align={direction === "rtl" ? "right" : "left"}
                >
                  <label
                    style={{ display: "none" }}
                    htmlFor={`pmweb_ManageRights_todo_view_Checkbox_${index}`}
                  >
                    nbs
                  </label>
                  <Checkbox
                    size="small"
                    name="todo_view"
                    onChange={(e) => onRightsChange(e, todo)}
                    checked={todo.m_bReadOnlyForTask}
                    disabled={isReadOnly}
                    id={`pmweb_ManageRights_todo_view_Checkbox_${index}`}
                    inputProps={{
                      "aria-label": todo?.todoTypeInfo?.todoName,
                    }}
                    inputRef={(item) => (todosViewRef.current[index] = item)}
                    onKeyUp={(e) => {
                      if (e.key === "Enter") {
                        todosViewRef.current[index].click();
                        e.stopPropagation();
                      }
                    }}
                  />
                </TableCell>
                <TableCell
                  width={tableWidth}
                  style={{ padding: "0.5rem 1vw" }}
                  align={direction === "rtl" ? "right" : "left"}
                >
                  <label
                    style={{ display: "none" }}
                    htmlFor={`pmweb_ManageRights_todo_modify_Checkbox_${index}`}
                  >
                    nbs
                  </label>
                  <Checkbox
                    size="small"
                    name="todo_modify"
                    onChange={(e) => onRightsChange(e, todo)}
                    checked={todo.m_bModifyForTask}
                    disabled={isReadOnly || todo.modifyDisabled}
                    id={`pmweb_ManageRights_todo_modify_Checkbox_${index}`}
                    inputProps={{
                      "aria-label": todo?.todoTypeInfo?.todoName,
                    }}
                    inputRef={(item) => (todosModifyRef.current[index] = item)}
                    onKeyUp={(e) => {
                      if (e.key === "Enter") {
                        todosModifyRef.current[index].click();
                        e.stopPropagation();
                      }
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
        </>
      );
    }
  };

  return (
    <TableContainer className={classes.queuetable} component={Paper}>
      <Table
        style={{
          width: CurrentTab === "Forms" ? "70%" : "94%",
          margin: "1rem 2vw",
          border: "1px solid #cecece",
        }}
      >
        <TableHead
          className={
            direction === RTL_DIRECTION
              ? classes.tableHeadRTL
              : classes.tableHead
          }
        >
          <TableRow style={{ maxHeight: "2rem" }}>
            {tableHeaders.map((header) => (
              <TableCell
                width={tableWidth}
                style={{ padding: "0.75rem 1vw" }}
                align={direction === "rtl" ? "right" : "left"}
              >
                <p className={classes.tableCellText}>{header.name}</p>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>{dataForTabs()}</TableBody>
      </Table>
    </TableContainer>
  );
}

export default ManageRights;
