import { Checkbox } from "@material-ui/core";
import React, { useState, useEffect, useRef } from "react";
import SearchComponent from "../../../../../UI/Search Component/index.js";
import "./TaskList.css";
import { store, useGlobalState } from "state-pool";
import { useDispatch } from "react-redux";
import { setActivityPropertyChange } from "../../../../../redux-store/slices/ActivityPropertyChangeSlice.js";
import { propertiesLabel } from "../../../../../Constants/appConstants.js";
import CloseIcon from "@material-ui/icons/Close";
import styles from "../Task.module.css";
import { useTranslation } from "react-i18next";
import { containsText } from "../../../../../utility/CommonFunctionCall/CommonFunctionCall.js";
import EmptyStateIcon from "../../../../../assets/ProcessView/EmptyState.svg";
import { validateTaskObject } from "../../../../../utility/CommonAPICall/validateActivityObject.js";

function TaskList(props) {
  let { t } = useTranslation();
  let dispatch = useDispatch();
  const [json, setJson] = useState([]);
  const [associatedTasks, setAssociatedTasks] = useState({});
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const actProperty = store.getState("activityPropertyData");
  const [localLoadedActivityPropertyData] = useGlobalState(actProperty);
  const [searchTerm, setSearchTerm] = useState("");
  const { setShowDependencyModal, isReadOnly } = props;
  const allRef = useRef();
  const CheckedRefEl= useRef([]);

  useEffect(() => {
    let temp = JSON.parse(JSON.stringify(localLoadedProcessData));
    setJson(temp.Tasks);
  }, []);

  useEffect(() => {
    setAssociatedTasks(props.tasksAssociated);
  }, [props.tasksAssociated]);

  const checkWorkdeskRights = () => {
    let m_arrTodoInfo = [],
      m_arrDocumentInfo = [],
      m_arrExceptionInfo = [];
    if (
      localLoadedActivityPropertyData?.ActivityProperty?.wdeskInfo
        ?.objPMWdeskExceptions?.m_bShowExceptions
    ) {
      localLoadedActivityPropertyData?.ActivityProperty?.wdeskInfo
        ?.objPMWdeskExceptions?.exceptionMap &&
        Object.values(
          localLoadedActivityPropertyData?.ActivityProperty?.wdeskInfo
            ?.objPMWdeskExceptions?.exceptionMap
        ).forEach((exc) => {
          m_arrExceptionInfo = [
            ...m_arrExceptionInfo,
            {
              vTaskTrigFlag: exc.vTrigFlag, //view
              vrTaskTrigFlag: exc.vrTrigFlag, //raise
              vaTaskTrigFlag: exc.vaTrigFlag, //respond
              vcTaskTrigFlag: exc.vcTrigFlag, //clear
              expTypeInfo: {
                expTypeName: exc.expTypeInfo.expTypeName,
                expTypeId: exc.expTypeInfo.expTypeId,
              },
            },
          ];
        });
    }

    if (
      localLoadedActivityPropertyData?.ActivityProperty?.wdeskInfo
        ?.objPMWdeskDocuments?.m_bchkBoxChecked
    ) {
      localLoadedActivityPropertyData?.ActivityProperty?.wdeskInfo
        ?.objPMWdeskDocuments?.documentMap &&
        Object.values(
          localLoadedActivityPropertyData?.ActivityProperty?.wdeskInfo
            ?.objPMWdeskDocuments?.documentMap
        ).forEach((exc) => {
          m_arrDocumentInfo = [
            ...m_arrDocumentInfo,
            {
              m_bIsAddForTask: exc.isAdd,
              m_bIsViewForTask: exc.isView,
              m_bIsModifyForTask: exc.isModify,
              docTypeName: exc.documentType.docTypeName,
              docTypeId: exc.documentType.docTypeId,
            },
          ];
        });
    }

    if (
      localLoadedActivityPropertyData?.ActivityProperty?.wdeskInfo
        ?.objPMWdeskTodoLists?.todoRendered
    ) {
      localLoadedActivityPropertyData?.ActivityProperty?.wdeskInfo
        ?.objPMWdeskTodoLists?.todoMap &&
        Object.values(
          localLoadedActivityPropertyData?.ActivityProperty?.wdeskInfo
            ?.objPMWdeskTodoLists?.todoMap
        )?.forEach((exc) => {
          m_arrTodoInfo = [
            ...m_arrTodoInfo,
            {
              m_bReadOnlyForTask: exc.isReadOnly,
              m_bModifyForTask: exc.isView,
              todoTypeInfo: {
                todoId: exc.todoTypeInfo.todoId,
                todoName: exc.todoTypeInfo.todoName,
              },
              modifyDisabled: exc.isReadOnly,
            },
          ];
        });
    }
    return {
      m_arrTodoInfo: m_arrTodoInfo,
      m_arrDocumentInfo: m_arrDocumentInfo,
      m_arrExceptionInfo: m_arrExceptionInfo,
    };
  };

  const handleCheckChange = (e, task) => {
    let temp = { ...associatedTasks };
    if (e.target.checked) {
      // code added on 3 Aug 2023 for BugId 127487 - Regression :- form not showing in Task rights.
      let workdeskRights = checkWorkdeskRights();
      temp = {
        ...temp,
        [task.TaskName]: {
          taskTypeInfo: {
            taskName: task.TaskName,
            taskId: task.TaskId,
            taskType: task.TaskType,
            taskGenPropInfo: {
              m_strSubPrcType:
                +task.TaskType === 2 && task.TaskMode !== ""
                  ? task.TaskMode
                  : "A",
            },
          },
          m_bMandatory: false,
          m_bStateAsWait: false,
          m_bTaskDecline: false,
          m_bTaskApprove: false,
          m_bTaskReassign: false,
          m_arrUGInfoList: [],
          m_hMapFieldsMapping: {},
          // code edited on 3 Aug 2023 for BugId 127487 - Regression :- form not showing in Task rights.
          m_arrTodoInfo: workdeskRights.m_arrTodoInfo,
          m_arrExceptionInfo: workdeskRights.m_arrExceptionInfo,
          m_arrDocumentInfo: workdeskRights.m_arrDocumentInfo,
          objFormInfo: {
            isReadOnlyForTask: true,
            isModifiedForTask: true,
            formId:
              localLoadedActivityPropertyData?.ActivityProperty?.actGenPropInfo
                ?.selFormId,
          },
          m_arrRuleInfo: [],
        },
      };
      setAssociatedTasks(temp);
    } else {
      // code edited on 10 Feb 2023 for BugId 123476
      let processDefId = localLoadedProcessData?.ProcessDefId,
        taskName = task.TaskName,
        taskId = task.TaskId,
        processType = localLoadedProcessData?.ProcessType;
      validateTaskObject({
        processDefId,
        processType,
        taskName,
        taskId,
        errorMsg: `${t("deassociateValidationErrorMsg")}`,
        onSuccess: (workitemValidationFlag) => {
          if (!workitemValidationFlag) {
            let newTemp = {};
            Object.keys(temp)?.forEach((el) => {
              if (el !== task.TaskName) {
                newTemp = { ...newTemp, [el]: temp[el] };
              }
            });
            setAssociatedTasks(newTemp);
          }
        },
        dispatch,
        onFailure: (validations) => {
          if (validations?.length > 0) {
            setShowDependencyModal(true);
          }
        },
        wsType: "TDA",
      });
    }
  };

  const handleAllCheckChange = (e) => {
    let temp = {};
    if (e.target.checked) {
      // code added on 3 Aug 2023 for BugId 127487 - Regression :- form not showing in Task rights.
      let workdeskRights = checkWorkdeskRights();
      json?.forEach((task) => {
        temp = {
          ...temp,
          [task.TaskName]: {
            taskTypeInfo: {
              taskName: task.TaskName,
              taskId: task.TaskId,
              taskType: task.TaskType,
              taskGenPropInfo: {
                m_strSubPrcType:
                  +task.TaskType === 2 && task.TaskMode !== ""
                    ? task.TaskMode
                    : "A",
              },
            },
            m_bMandatory: false,
            m_bStateAsWait: false,
            m_bTaskDecline: false,
            m_bTaskApprove: false,
            m_bTaskReassign: false,
            m_arrUGInfoList: [],
            m_hMapFieldsMapping: {},
            // code edited on 3 Aug 2023 for BugId 127487 - Regression :- form not showing in Task rights.
            m_arrTodoInfo: workdeskRights.m_arrTodoInfo,
            m_arrExceptionInfo: workdeskRights.m_arrExceptionInfo,
            m_arrDocumentInfo: workdeskRights.m_arrDocumentInfo,
            objFormInfo: {
              isReadOnlyForTask: true,
              isModifiedForTask: true,
              formId:
                localLoadedActivityPropertyData?.ActivityProperty
                  ?.actGenPropInfo?.selFormId,
            },
            m_arrRuleInfo: [],
          },
        };
      });
    }
    setAssociatedTasks(temp);
  };

  const getCheckedHandler = (taskVar) => {
    let temp = false;
    associatedTasks &&
      Object.values(associatedTasks)?.forEach((assocTask) => {
        if (+assocTask.taskTypeInfo.taskId === +taskVar.TaskId) {
          temp = true;
        }
      });
    return temp;
  };

  const getAllCheckHandler = () => {
    let temp = true;
    if (!json || json?.length === 0) {
      temp = false;
    }
    json?.forEach((el) => {
      let isPresent = false;
      associatedTasks &&
        Object.values(associatedTasks)?.forEach((assocTask) => {
          if (+assocTask.taskTypeInfo.taskId === +el.TaskId) {
            isPresent = true;
          }
        });
      if (!isPresent) {
        temp = false;
      }
    });
    return temp;
  };

  const associateTaskCalled = () => {
    props.selectedTaskToAssoc(associatedTasks);
    props.closeModal();
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.task]: { isModified: true, hasError: false },
      })
    );
  };

  const filteredRows = json?.filter((task) =>
    containsText(task.TaskName, searchTerm)
  );
  // const handleKeyAssociate = (e) => {
  //   if (e.key === "Enter") {
  //     associateTaskCalled();
  //     e.stopPropagation();
  //   }

  //   if (e.keyCode === 27) {
  //     props.closeModal();
  //   }
  // };

  // React.useEffect(() => {
  //   document.addEventListener("keydown", handleKeyAssociate);
  //   return () => document.removeEventListener("keydown", handleKeyAssociate);
  // }, [handleKeyAssociate]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div className={styles.modalHeader}>
        <h3 className={styles.modalHeading}>{t("AssociateTask")}</h3>
        <CloseIcon
          onClick={props.closeModal}
          className={styles.closeIcon}
          tabIndex={0}
          onKeyUp={props.onKeyUp}
        />
      </div>
      <SearchComponent
        style={{
          margin: "1rem 1vw",
        }}
        width="18vw"
        height="var(--line_height)"
        onSearchChange={(val) => setSearchTerm(val)}
        clearSearchResult={() => setSearchTerm("")}
      />
      {filteredRows?.length > 1 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "0 1vw",
          }}
        >
          <label htmlFor={`Tasklist_select_all_checkbox_`} style={{display:"none"}}>{t("selectAll")}</label>
          <Checkbox
            onChange={(e) => handleAllCheckChange(e)}
            checked={getAllCheckHandler()}
            style={{
              borderRadius: "1px",
              padding: "4px 1px",
            }}
            disabled={isReadOnly}
            id="pmweb_Tasklist_getAllCheckHandler_checkbox"
            inputProps={{
               id:"Tasklist_select_all_checkbox_",
               "aria-label":t("selectAll")
            }}
            inputRef={allRef}
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                allRef.current.click();
                e.stopPropagation();
              }
            }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <p
              style={{
                fontSize: "var(--base_text_font_size)",
                color: "black",
              }}
            >
              {t("selectAll")}
            </p>
          </div>
        </div>
      )}
      <div
        style={{
          width: "100%",
          height: "16rem",
          overflowY: "auto",
          scrollbarColor: "#dadada #fafafa",
          scrollbarWidth: "thin",
        }}
      >
        {filteredRows?.length > 0 ? (
          filteredRows?.map((task, index) => {
            return (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0 1vw",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <label htmlFor={`Tasklist_getCheckHandler_checkbox_${task.TaskId}`} style={{display:"none"}}>{task.TaskName}</label>
                  <Checkbox
                    onChange={(e) => handleCheckChange(e, task)}
                    checked={getCheckedHandler(task)}
                    style={{
                      borderRadius: "1px",
                      padding: "4px 1px",
                    }}
                    disabled={isReadOnly}
                    id={`pmweb_Tasklist_getCheckHandler_checkbox_${task.TaskId}`}
                    inputProps={{
                      id:`Tasklist_getCheckHandler_checkbox_${task.TaskId}`,
                      "aria-label": task.TaskName
                      
                    }}
                    inputRef={(item) => (CheckedRefEl.current[index] = item)}
                    tabIndex={0}
                    onKeyUp={(e) => {
                      if (e.key === "Enter") {
                        CheckedRefEl.current[index].click();
                        e.stopPropagation();
                      }
                    }}
                  />
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "var(--base_text_font_size)",
                        color: "black",
                      }}
                    >
                      {task.TaskName}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className={styles.emptyStateMainDiv}>
            <img
              className={styles.emptyStateImage}
              src={EmptyStateIcon}
              alt={t("noTasksCreated")}
              style={{
                marginTop: "2rem",
              }}
            />
            <p className={styles.emptyStateText} style={{ marginBottom: "0" }}>
              {t("noTasksCreated")}
            </p>
          </div>
        )}
      </div>

      {!isReadOnly && (
        <div className={styles.modalFooter}>
          <button
            className={styles.cancelButton}
            onClick={props.closeModal}
            id="pmweb_Tasklist_cancel_button"
          >
            {t("cancel")}
          </button>
          <button
            className={styles.okButton}
            onClick={associateTaskCalled}
            // tabIndex={0}
            // onKeyDown={(e)=>handleKeyAssociate(e)}
            id="pmweb_Tasklist_AssociateTasks_button"
          >
            {t("AssociateTasks")}
          </button>
        </div>
      )}
    </div>
  );
}

export default TaskList;
