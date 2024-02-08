import React, { useRef } from "react";
import { Select, MenuItem, Checkbox, Tooltip } from "@material-ui/core";
import { store, useGlobalState } from "state-pool";
import classes from "../Task.module.css";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { useTranslation } from "react-i18next";
import { setActivityPropertyChange } from "../../../../../redux-store/slices/ActivityPropertyChangeSlice";
import { useDispatch } from "react-redux";
import { getTypeByVariable } from "../../../../../utility/ProcessSettings/Triggers/getVariableType";
import {
  RTL_DIRECTION,
  propertiesLabel,
} from "../../../../../Constants/appConstants";

function DataMapping({ taskInfo, isReadOnly, ...props }) {
  const dispatch = useDispatch();
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const actProperty = store.getState("activityPropertyData");
  const [localLoadedActivityPropertyData, setlocalLoadedActivityPropertyData] =
    useGlobalState(actProperty);
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const VarNameRef = useRef([]);

  const getVariableDetails = (id) => {
    let temp;
    localLoadedProcessData.Variable.forEach((_var) => {
      if (+_var.VariableId === +id) {
        temp = _var;
      }
    });
    return temp;
  };

  const changeDataMapping = (e, taskVar) => {
    let temp = global.structuredClone(localLoadedActivityPropertyData);
    Object.values(
      temp.ActivityProperty?.wdeskInfo?.objPMWdeskTasks?.taskMap
    ).forEach((task) => {
      if (e.target.value === "selectVar") {
        Object.entries(task.m_hMapFieldsMapping).forEach((taskVariable) => {
          if (taskVariable[1].m_strMappedTaskVarName === taskVar.VariableName) {
            delete temp.ActivityProperty.wdeskInfo.objPMWdeskTasks.taskMap[
              taskInfo.taskTypeInfo.taskName
            ].m_hMapFieldsMapping[taskVariable[0]];
          }
        });
      } else {
        if (+task?.taskTypeInfo?.taskId === +taskInfo?.taskTypeInfo?.taskId) {
          let fieldMapping = {};
          fieldMapping = {
            [`${taskVar.TemplateVariableId}`]: {
              m_strMappedTaskVarName: taskVar.VariableName,
              m_strTaskReadOnlyVar: "N",
              varName: getVariableDetails(e.target.value).VariableName,
              variableId: getVariableDetails(e.target.value).VariableId,
              varTypeFieldId: getVariableDetails(e.target.value).VarFieldId,
            },
          };
          temp.ActivityProperty.wdeskInfo.objPMWdeskTasks.taskMap[
            taskInfo.taskTypeInfo.taskName
          ].m_hMapFieldsMapping = {
            ...task.m_hMapFieldsMapping,
            ...fieldMapping,
          };
        }
      }
    });
    setlocalLoadedActivityPropertyData(temp);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.task]: { isModified: true, hasError: false },
      })
    );
  };

  const getChecked = (varName) => {
    let temp = false;
    Object.values(
      localLoadedActivityPropertyData.ActivityProperty?.wdeskInfo
        ?.objPMWdeskTasks?.taskMap
    ).forEach((task) => {
      if (task.taskTypeInfo.taskId == taskInfo.taskTypeInfo.taskId) {
        Object.values(task?.m_hMapFieldsMapping).forEach((taskVar) => {
          if (taskVar.m_strMappedTaskVarName === varName) {
            temp = taskVar?.m_strTaskReadOnlyVar === "Y" ? true : false;
          }
        });
      }
    });
    return temp;
  };

  const getValue = (name) => {
    let temp = {};
    Object.values(
      localLoadedActivityPropertyData.ActivityProperty?.wdeskInfo
        ?.objPMWdeskTasks?.taskMap
    ).forEach((task) => {
      if (task.taskTypeInfo.taskId == taskInfo.taskTypeInfo.taskId) {
        Object.values(task?.m_hMapFieldsMapping).forEach((taskVar) => {
          if (taskVar.m_strMappedTaskVarName === name) {
            temp = taskVar;
          }
        });
      }
    });
    return temp;
  };

  const changeDataMappingCheck = (e, taskData) => {
    let temp = global.structuredClone(localLoadedActivityPropertyData);
    Object.values(
      temp.ActivityProperty?.wdeskInfo?.objPMWdeskTasks?.taskMap
    ).forEach((task) => {
      if (task.taskTypeInfo.taskId === taskInfo.taskTypeInfo.taskId) {
        Object.keys(task?.m_hMapFieldsMapping).forEach((taskVar, idx) => {
          if (
            task?.m_hMapFieldsMapping[taskVar].m_strMappedTaskVarName ===
            taskData.VariableName
          ) {
            temp.ActivityProperty.wdeskInfo.objPMWdeskTasks.taskMap[
              taskInfo.taskTypeInfo.taskName
            ].m_hMapFieldsMapping[taskVar].m_strTaskReadOnlyVar = e.target
              .checked
              ? "Y"
              : "N";
          }
        });
      }
    });
    setlocalLoadedActivityPropertyData(temp);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.task]: { isModified: true, hasError: false },
      })
    );
  };

  const checkForVarRights = (data) => {
    let temp = false;
    localLoadedActivityPropertyData?.ActivityProperty?.m_objDataVarMappingInfo?.dataVarList?.forEach(
      (item, i) => {
        // code edited on 29 Oct 2022 for BugId 117980
        if (+item?.processVarInfo?.variableId === +data.VariableId) {
          if (
            item?.m_strFetchedRights === "O" ||
            item?.m_strFetchedRights === "R" ||
            item?.m_strFetchedRights === "A" // code edited on 28 Nov 2022 for BugId 117980
          ) {
            temp = true;
          }
        }
      }
    );
    return temp;
  };
  
  const shortenRuleStatement = (str, num) => {
    if (str?.length <= num) {
      return str;
    }
    return str?.slice(0, num) + "...";
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        fontFamily: "var(--font_family)",
        padding: "1rem 1vw",
        direction: direction,
      }}
    >
      {localLoadedProcessData?.Tasks?.filter(
        (task) => +task.TaskId === +taskInfo?.taskTypeInfo?.taskId
      )[0]?.TaskTemplateVar?.length > 0 ? (
        <TableContainer
          className={classes.queuetable}
          style={{ direction: direction }}
        >
          <Table style={{ width: "100%", border: "1px solid #cecece" }}>
            <TableHead
              className={
                direction === RTL_DIRECTION
                  ? classes.tableHeadRTL
                  : classes.tableHead
              }
            >
              <TableRow style={{ height: "var(--line_height)" }}>
                <TableCell
                  width="45%"
                  style={{ padding: "0.75rem 1vw" }}
                  align={direction === "rtl" ? "right" : "left"}
                >
                  <p className={classes.tableCellText}>{t("taskVariable")}</p>
                </TableCell>
                <TableCell
                  width="35%"
                  style={{ padding: "0.75rem 1vw" }}
                  align={direction === "rtl" ? "right" : "left"}
                >
                  <p className={classes.tableCellText}>
                    {t("processvariable(s)")}
                  </p>
                </TableCell>
                <TableCell
                  width="20%"
                  style={{ padding: "0.75rem 1vw" }}
                  align={direction === "rtl" ? "right" : "left"}
                >
                  <p className={classes.tableCellText}>{t("ReadOnly")}</p>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {localLoadedProcessData?.Tasks?.filter(
                (task) => task.TaskId === taskInfo?.taskTypeInfo?.taskId
              )[0]?.TaskTemplateVar?.map((task, index) => {
                return (
                  <TableRow className={classes.tableRow}>
                    <TableCell
                      width="45%"
                      style={{ padding: "0.5rem 1vw" }}
                      align={direction === "rtl" ? "right" : "left"}
                      component="th"
                      scope="row"
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          width: "80%",
                          gap: "3vw",
                          justifyContent: "space-between",
                        }}
                      >
                        <p
                          style={{
                            fontSize: "var(--base_text_font_size)",
                            fontWeight: "500",
                            color: "#000000",
                            flex: "1",
                          }}
                        >
                          {task.VariableName}
                        </p>
                        <p
                          style={{
                            fontSize: "var(--base_text_font_size)",
                          }}
                        >
                          =
                        </p>
                      </div>
                    </TableCell>
                    <TableCell
                      width="35%"
                      align={direction === "rtl" ? "right" : "left"}
                      style={{ padding: "0.5rem 1vw" }}
                    >
                      <label
                        style={{ display: "none" }}
                        htmlFor={`pmweb_DataMapping_selectVar_Select_${index}`}
                      >
                        Select
                      </label>
                      <label style={{ display: "none" }} htmlFor={`${index}`}>
                        Select
                      </label>
                      {/* Changes on 19-10-2023 to resolve the bug Id 135633 */}
                      <Tooltip
                        title={
                          getValue(task.VariableName)?.varName == null
                            ? "Select Variable"
                            : getValue(task.VariableName)?.varName
                        }
                        placement="right-start"
                        arrow
                        disableFocusListener
                        disableTouchListener
                      >
                        <Select
                          IconComponent={ExpandMoreIcon}
                          style={{
                            width: "70%",
                            height: "var(--line_height)",
                            border: "1px solid #cecece",
                          }}
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
                            PaperProps: {
                              style: {
                                maxHeight: "15rem",
                              },
                            },
                          }}
                          value={
                            getValue(task.VariableName)?.variableId
                              ? getValue(task.VariableName)?.variableId
                              : "selectVar"
                          }
                          onChange={(e) => changeDataMapping(e, task)}
                          id={`pmweb_DataMapping_selectVar_Select_${index}`}
                          disabled={isReadOnly}
                          inputProps={{ id: index }}
                        >
                          <MenuItem value="selectVar">
                            <p className={classes.tableCellBody}>
                              {t("selectVariable")}
                            </p>
                          </MenuItem>
                          {localLoadedProcessData?.Variable?.filter(
                            (data) =>
                              (data.VariableScope === "S" ||
                                data.VariableScope === "M" ||
                                (data.VariableScope === "U" &&
                                  checkForVarRights(data)) ||
                                (data.VariableScope === "I" &&
                                  checkForVarRights(data))) &&
                              +getTypeByVariable(task.VariableType) ===
                                +data.VariableType
                          )?.map((item) => {
                            return (
                              <MenuItem
                                key={item.VariableId}
                                value={item.VariableId}
                              >
                                <p className={classes.tableCellBody}>
                                  {shortenRuleStatement(item.VariableName, 24)}
                                  {/* {item.VariableName} */}
                                </p>
                              </MenuItem>
                            );
                          })}
                        </Select>
                      </Tooltip>
                      {/* </LightTooltip> */}
                    </TableCell>
                    <TableCell
                      width="20%"
                      align={direction === "rtl" ? "right" : "left"}
                      style={{ padding: "0.5rem 1vw" }}
                    >
                      <label
                        style={{ display: "none" }}
                        htmlFor={`pmweb_DataMapping_datamappingcheck_Checkbox_${index}`}
                      >
                        Check
                      </label>
                      <Checkbox
                        checked={getChecked(task.VariableName)}
                        disabled={
                          isReadOnly || !getValue(task.VariableName)?.variableId
                        }
                        onChange={(e) => changeDataMappingCheck(e, task)}
                        id={`pmweb_DataMapping_datamappingcheck_Checkbox_${index}`}
                        inputRef={(item) => (VarNameRef.current[index] = item)}
                        onKeyUp={(e) => {
                          if (e.key === "Enter") {
                            VarNameRef.current[index].click();
                            e.stopPropagation();
                          }
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        "No Data"
      )}
    </div>
  );
}

export default DataMapping;
