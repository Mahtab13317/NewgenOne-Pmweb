// #BugID - 120239
// #BugDescription - Handled the checks to manage the variable with space.
// #BugID - 113644,119891
// #BugDescription - Aligned the data in same row with checkbox.
// #BugID - 124655
// #BugDescription - Alignment issue of datafields has been fixed.
import React, { useEffect, useState, useRef } from "react";
import Checkbox from "@material-ui/core/Checkbox";
import { connect, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { store, useGlobalState } from "state-pool";
import { getVariableType } from "../../../../utility/ProcessSettings/Triggers/getVariableType";
import { setActivityPropertyChange } from "../../../../redux-store/slices/ActivityPropertyChangeSlice";
import { Grid, Tooltip } from "@material-ui/core";
import {
  PROCESSTYPE_DEPLOYED,
  PROCESSTYPE_REGISTERED,
} from "../../../../Constants/appConstants";
import { isActivityModifyDisabled } from "../../../../utility/ActivityModifyDisabled/isActivityModifyDisabled";
import { checkIfSwimlaneCheckedOut } from "../../../../utility/SwimlaneCheckedStatus/SwimlaneCheckedStatus";
import { LatestVersionOfProcess } from "../../../../utility/abstarctView/checkLatestVersion";
import "./dataField.css";

import TabsHeading from "../../../../UI/TabsHeading";
function ExpenseInitiation(props) {
  let { t } = useTranslation();
  let dispatch = useDispatch();
  const direction = `${t("HTML_DIR")}`;

  const [activityDetails, setactivityDetails] = useState([]);
  const loadedActivityPropertyData = store.getState("activityPropertyData");
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedActivityPropertyData, setlocalLoadedActivityPropertyData] =
    useGlobalState(loadedActivityPropertyData);
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const [allReadBool, setallReadBool] = useState(false);
  const [allModifyBool, setallModifyBool] = useState(false);
  const [allBulkBool, setallBulkBool] = useState(false);
  const allReadRef = useRef();
  const allModifyRef = useRef();
  const allBulkRef = useRef();
  const readRef = useRef([]);
  const modifyRef = useRef([]);
  const bulkRef = useRef([]);
  const getIfActivityInCheckoutLane = () => {
    let flag = false;
    if (checkIfSwimlaneCheckedOut(localLoadedProcessData).length > 0) {
      for (let mile of localLoadedProcessData.MileStones) {
        for (let act of mile.Activities) {
          if (
            act.ActivityId == props.cellID &&
            act.LaneId ==
              checkIfSwimlaneCheckedOut(localLoadedProcessData)[0].laneId
          ) {
            flag = true;
            break;
          }
        }
      }
      return flag;
    } else return false;
  };
  const isReadOnly =
    props.openTemplateFlag ||
    LatestVersionOfProcess(localLoadedProcessData?.Versions) !==
      +localLoadedProcessData?.VersionNo || // modified on 05/09/2023 for BugId 136103
    ((props.openProcessType === PROCESSTYPE_DEPLOYED ||
      props.openProcessType === PROCESSTYPE_REGISTERED) &&
      props.cellCheckedOut === "N" &&
      !getIfActivityInCheckoutLane());

  //code edited on 13-09-2023 for bugId 136574
  const activitytHeadDetails = [
    {
      name: t("name"),
      type: t("type"),
      length: t("length"),
      read: t("read"),
      modify: t("modify"),
      bulk: t("bulk"),
    },
  ];

  useEffect(() => {
    if (localLoadedActivityPropertyData) {
      let tempArr = [];
      localLoadedProcessData?.Variable.map((processVar) => {
        if (
          processVar.VariableScope === "U" ||
          processVar.VariableScope === "I"
        ) {
          let temp = {
            name: processVar.VariableName,
            type: processVar.VariableType,
            length: processVar.VariableLength,
            bRead:
              getVariableReadModifyData(processVar.VariableName) === "R" ||
              getVariableReadModifyData(processVar.VariableName) === "O" ||
              getVariableReadModifyData(processVar.VariableName) === "A"
                ? true
                : false,
            bModify:
              getVariableReadModifyData(processVar.VariableName) === "O" ||
              getVariableReadModifyData(processVar.VariableName) === "A"
                ? true
                : false,
            bBulk:
              getVariableReadModifyData(processVar.VariableName) === "A"
                ? true
                : false,
            id: processVar.VariableId,
          };
          tempArr.push(temp);
        }
      });
      setactivityDetails(tempArr);
      checkAllReadModify(tempArr);
    }
  }, [localLoadedActivityPropertyData?.Status]);

  const getVariableReadModifyType = (data) => {
    let temp = "";
    if (!!data.bBulk) temp = "A";
    else {
      if (!!data.bRead && !!data.bModify) {
        temp = "O";
      } else if (data.bRead === true && data.bModify === false) temp = "R";
      else if (data.bRead === false && data.bModify === true) temp = "O";
      else if (!data.bRead && !data.bModify) temp = "S";
      else temp = "R";
    }

    return temp;
  };

  const getVariableInfo = (name) => {
    let temp2 = {};
    let temp = JSON.parse(JSON.stringify(localLoadedProcessData));
    temp?.Variable.forEach((variable) => {
      if (variable.VariableName === name) {
        temp2 = variable;
      }
    });
    return temp2;
  };

  const changeDataFields = (e, _var) => {
    let temp = JSON.parse(JSON.stringify(localLoadedActivityPropertyData));
    let actTemp = JSON.parse(JSON.stringify(activityDetails));
    let deleteBool = false;
    let dataVariable = {};

    if (e.target.name === "bRead") {
      actTemp.forEach((act) => {
        if (act.name === _var.name) {
          dataVariable = act;
          if (e.target.checked) {
            act.bRead = e.target.checked;
          } else {
            act.bRead = e.target.checked;
            act.bModify = e.target.checked;
            act.bBulk = e.target.checked;
          }
        }
      });
    } else if (e.target.name === "bBulk") {
      actTemp.forEach((act) => {
        if (act.name === _var.name) {
          if (e.target.checked === true) {
            act.bModify = e.target.checked;
            act.bRead = e.target.checked;
            act.bBulk = e.target.checked;

            dataVariable = act;
          } else {
            act.bBulk = e.target.checked;
          }
        }
      });
    } else {
      actTemp.forEach((act) => {
        if (act.name === _var.name) {
          if (e.target.checked === true) {
            act.bModify = e.target.checked;
            act.bRead = e.target.checked;
          } else {
            act.bModify = e.target.checked;
            act.bBulk = e.target.checked;
          }
          dataVariable = act;
        }
      });
    }

    temp.ActivityProperty.m_objDataVarMappingInfo.dataVarList = [];
    let tempArr = [];
    actTemp.forEach((act) => {
      let el = {
        m_strFetchedRights: getVariableReadModifyType(act),
        processVarInfo: {
          varName: act.name.trim(),
          variableId: getVariableInfo(act.name).VariableId,
          varScope: getVariableInfo(act.name).VariableScope,
          type: getVariableInfo(act.name).VariableType,
        },
      };

      if (el.m_strFetchedRights !== "S") {
        tempArr.push(el);
      }
    });

    temp.ActivityProperty.m_objDataVarMappingInfo.dataVarList = tempArr;

    setlocalLoadedActivityPropertyData(temp);
    setactivityDetails(actTemp);
    checkAllReadModify(actTemp);
    dispatch(
      setActivityPropertyChange({
        DataFields: { isModified: true, hasError: false },
      })
    );
  };

  const getVariableReadModifyData = (varName) => {
    let temp = "";

    localLoadedActivityPropertyData?.ActivityProperty?.m_objDataVarMappingInfo?.dataVarList.forEach(
      (dataVar) => {
        if (dataVar.processVarInfo.varName.trim() === varName.trim())
          temp = dataVar.m_strFetchedRights;
      }
    );
    return temp;
  };

  const checkAllReadModify = (activityDetails) => {
    let temp = JSON.parse(JSON.stringify(activityDetails));
    let readArr = [];
    let modifyArr = [];
    let bulkArr = [];
    temp.forEach((act) => {
      readArr.push(act.bRead);
      modifyArr.push(act.bModify);
      bulkArr.push(act.bBulk);
    });

    if (readArr?.includes(false) || readArr?.length === 0)
      setallReadBool(false);
    else setallReadBool(true);
    if (modifyArr.includes(false) || modifyArr?.length === 0)
      setallModifyBool(false);
    else setallModifyBool(true);
    if (bulkArr.includes(false) || bulkArr.length === 0) setallBulkBool(false);
    else setallBulkBool(true);
  };

  const allChangeHandler = (e) => {
    let temp = JSON.parse(JSON.stringify(activityDetails));
    let temp2 = JSON.parse(JSON.stringify(localLoadedActivityPropertyData));
    temp2.ActivityProperty.m_objDataVarMappingInfo.dataVarList = [];
    if (e.target.name === "allRead") {
      if (e.target.checked) {
        temp.forEach((act) => {
          act.bRead = true;
          let el = {
            m_strFetchedRights: getVariableReadModifyType(act),
            processVarInfo: {
              varName: act.name.trim(),
              variableId: getVariableInfo(act.name).VariableId,
              varScope: getVariableInfo(act.name).VariableScope,
              type: getVariableInfo(act.name).VariableType,
            },
          };
          temp2?.ActivityProperty?.m_objDataVarMappingInfo?.dataVarList.push(
            el
          );
        });
      } else {
        temp.forEach((act) => {
          act.bRead = false;
          act.bModify = false;
          act.bBulk = false;
        });
        temp2.ActivityProperty.m_objDataVarMappingInfo.dataVarList = [];

        setallModifyBool(e.target.checked);
      }
      setallReadBool(e.target.checked);
    } else if (e.target.name === "allBulk") {
      if (e.target.checked) {
        temp2.ActivityProperty.m_objDataVarMappingInfo.dataVarList = [];
        temp.forEach((act) => {
          act.bRead = true;
          act.bModify = true;
          act.bBulk = true;
          let el = {
            m_strFetchedRights: getVariableReadModifyType(act),
            processVarInfo: {
              varName: act.name.trim(),
              variableId: getVariableInfo(act.name).VariableId,
              varScope: getVariableInfo(act.name).VariableScope,
              type: getVariableInfo(act.name).VariableType,
            },
          };
          temp2?.ActivityProperty?.m_objDataVarMappingInfo?.dataVarList.push(
            el
          );

          setallBulkBool(e.target.checked);
        });
      } else {
        temp2.ActivityProperty.m_objDataVarMappingInfo.dataVarList = [];
        temp.forEach((act) => {
          act.bBulk = false;
          let el = {
            m_strFetchedRights: getVariableReadModifyType(act),
            processVarInfo: {
              varName: act.name.trim(),
              variableId: getVariableInfo(act.name).VariableId,
              varScope: getVariableInfo(act.name).VariableScope,
              type: getVariableInfo(act.name).VariableType,
            },
          };
          temp2?.ActivityProperty?.m_objDataVarMappingInfo?.dataVarList.push(
            el
          );
        });
      }
      setallModifyBool(e.target.checked);
    } else {
      if (e.target.checked) {
        temp2.ActivityProperty.m_objDataVarMappingInfo.dataVarList = [];
        temp.forEach((act) => {
          act.bRead = true;
          act.bModify = true;

          let el = {
            m_strFetchedRights: getVariableReadModifyType(act),
            processVarInfo: {
              varName: act.name.trim(),
              variableId: getVariableInfo(act.name).VariableId,
              varScope: getVariableInfo(act.name).VariableScope,
              type: getVariableInfo(act.name).VariableType,
            },
          };
          temp2?.ActivityProperty?.m_objDataVarMappingInfo?.dataVarList.push(
            el
          );

          setallReadBool(e.target.checked);
        });
      } else {
        temp2.ActivityProperty.m_objDataVarMappingInfo.dataVarList = [];
        temp.forEach((act) => {
          act.bBulk = false;
          act.bModify = false;
          let el = {
            m_strFetchedRights: getVariableReadModifyType(act),
            processVarInfo: {
              varName: act.name.trim(),
              variableId: getVariableInfo(act.name).VariableId,
              varScope: getVariableInfo(act.name).VariableScope,
              type: getVariableInfo(act.name).VariableType,
            },
          };
          temp2?.ActivityProperty?.m_objDataVarMappingInfo?.dataVarList.push(
            el
          );
        });
      }
      setallModifyBool(e.target.checked);
    }

    setlocalLoadedActivityPropertyData(temp2);
    setactivityDetails(temp);
    checkAllReadModify(temp);
    dispatch(
      setActivityPropertyChange({
        DataFields: { isModified: true, hasError: false },
      })
    );
  };

  return (
    <div>
      {/* <div className="headingSectionTab">{<h4>{props?.heading}</h4>}</div> */}
      {<TabsHeading heading={props?.heading} />}

      {/* Changes made to solve Bug 113526  */}
      <div
        className="modify"
        style={{
          height: "100%",
          width: props.isDrawerExpanded ? "60%" : "100%",

          display: "flex",
          flexDirection: "column",
          paddingInline: "0.8rem",
          paddingTop: "0.3rem",
          direction: direction,
        }}
      >
        {activitytHeadDetails.map((item, index) => {
          return (
            <div
              style={{
                display: "flex",
                flexDirection: "row",

                /* 
               width: "100%",
               msFlexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                */
                // width: props.isDrawerExpanded ? "100%" : "430px",
                // width: "100%"
              }}
              className={
                props.isDrawerExpanded ? "expandContainer" : "collapseContainer"
              }
            >
              <Grid
                container
                xs={12}
                justifyContent="space-between"
                spacing={1}
              >
                <Grid item xs={2}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      // width: "16.5%",
                      // width: "16.5%",
                      //textAlign: direction === "rtl" ? "right" : "left",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "var(--base_text_font_size)",
                        marginTop: "4px",
                        fontWeight: "600",
                      }}
                    >
                      {item.name}
                    </span>
                  </div>
                </Grid>
                <Grid item xs={2}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      // width: "16.5%",
                      // width: "16.5%",
                      //textAlign: direction === "rtl" ? "left" : "right",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "var(--base_text_font_size)",
                        marginTop: "4px",
                        fontWeight: "600",
                      }}
                    >
                      {item.type}
                    </span>
                  </div>
                </Grid>
                <Grid item xs={2}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      // width: "16.5%",
                      // width: "16.5%",
                      // textAlign: direction === "rtl" ? "left" : "right",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "var(--base_text_font_size)",
                        marginTop: "4px",
                        fontWeight: "600",
                      }}
                    >
                      {item.length}
                    </span>
                  </div>
                </Grid>
                <Grid item xs={2}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      // width: "16.5%",
                      // width: "16.5%",
                      //textAlign: direction === "rtl" ? "left" : "right",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "var(--base_text_font_size)",
                        // marginTop: "10px",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Checkbox
                        checked={allReadBool}
                        name="allRead"
                        onChange={allChangeHandler}
                        size="medium"
                        disabled={isReadOnly}
                        id="pmweb_datafields_read_checkbox"
                        inputRef={allReadRef}
                        onKeyUp={(e) => {
                          if (e.key === "Enter") {
                            allReadRef.current.click();
                            e.stopPropagation();
                          }
                        }}
                      />
                      <label htmlFor="pmweb_datafields_read_checkbox">
                        {item.read}
                      </label>
                    </span>
                  </div>
                </Grid>
                <Grid item xs={2}>
                  <div
                    // style={{
                    //   width: "16.5%",
                    //   //textAlign: direction === "rtl" ? "left" : "right",
                    // }}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      // width: "16.5%",
                    }}
                  >
                    {" "}
                    <span
                      style={{
                        fontSize: "var(--base_text_font_size)",
                        // marginTop: "10px",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Checkbox
                        checked={allModifyBool}
                        disabled={
                          isActivityModifyDisabled(
                            props.cellActivityType,
                            props.cellActivitySubType
                          ) || isReadOnly
                        } //for endevent && messageend
                        name="allModify"
                        onChange={allChangeHandler}
                        size="medium"
                        id="pmweb_datafield_modify_checkbox"
                        inputRef={allModifyRef}
                        onKeyUp={(e) => {
                          if (e.key === "Enter") {
                            allModifyRef.current.click();
                            e.stopPropagation();
                          }
                        }}
                      />
                      <label htmlFor="pmweb_datafield_modify_checkbox">
                        {item.modify}
                      </label>
                    </span>
                  </div>
                </Grid>
                <Grid item xs={2}>
                  <div
                    // style={
                    //   {
                    //     // width: "16.5%",
                    //     //textAlign: direction === "rtl" ? "left" : "right",
                    //   }
                    // }
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      // width: "16.5%",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "var(--base_text_font_size)",
                        // marginTop: "10px",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Checkbox
                        checked={allBulkBool}
                        name="allBulk"
                        onChange={allChangeHandler}
                        size="medium"
                        disabled={
                          isReadOnly ||
                          isActivityModifyDisabled(
                            props.cellActivityType,
                            props.cellActivitySubType
                          )
                        }
                        id="pmweb_datafields_bulk_checkbox"
                        inputRef={allBulkRef}
                        onKeyUp={(e) => {
                          if (e.key === "Enter") {
                            allBulkRef.current.click();
                            e.stopPropagation();
                          }
                        }}
                      />
                      <label htmlFor="pmweb_datafields_bulk_checkbox">
                        {item.bulk}
                      </label>
                    </span>
                  </div>
                </Grid>
              </Grid>
            </div>
          );
        })}

        {activityDetails?.map((item, index) => {
          return (
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                //justifyContent: "space-between",
                //alignItems: "center",
                // width: props.isDrawerExpanded ? "100%" : "430px",
                // width: "100%"
              }}
              className={
                props.isDrawerExpanded ? "expandContainer" : "collapseContainer"
              }
            >
              <Grid container xs={12} justifyContent="space-between">
                <Grid item xs={2}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      // width: "16.5%",
                    }}
                  >
                    <Tooltip title={item.name} placement="bottom-start">
                      <span
                        style={{
                          fontSize: "var(--base_text_font_size)",
                          marginTop: "4px",
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                          textOverflow: "ellipsis",
                          width: "90%",
                        }}
                      >
                        {item.name}
                      </span>
                    </Tooltip>
                  </div>
                </Grid>
                <Grid item xs={2}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      // width: "16.5%",
                      // textAlign: direction === "rtl" ? "right" : "left",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "var(--base_text_font_size)",
                        marginTop: "4px",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                        width: "90%",
                      }}
                    >
                      {getVariableType(item.type)}
                    </span>
                  </div>
                </Grid>
                <Grid item xs={2}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      // width: "16.5%",
                      // textAlign: direction === "rtl" ? "right" : "left",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "var(--base_text_font_size)",
                        marginTop: "4px",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                        width: "90%",
                      }}
                    >
                      {item.length}
                    </span>
                  </div>
                </Grid>
                <Grid item xs={2}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      // width: "16.5%",
                      //  textAlign: direction === "rtl" ? "right" : "left",
                      alignItems: "flex-start",
                    }}
                  >
                    <Checkbox
                      checked={item.bRead}
                      size="medium"
                      name="bRead"
                      inputProps={{
                        "aria-label": `Name: ${
                          item.name
                        } Type: ${getVariableType(item.type)} Length: ${
                          item.length
                        } Read`,
                      }}
                      onChange={(e) => changeDataFields(e, item)}
                      disabled={isReadOnly}
                      id={`pmweb_datafields_bread_Checkbox_${item.name}`}
                      inputRef={(item) => (readRef.current[index] = item)}
                      onKeyUp={(e) => {
                        if (e.key === "Enter") {
                          readRef.current[index].click();
                          e.stopPropagation();
                        }
                      }}
                    />
                  </div>
                </Grid>
                <Grid item xs={2}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      // width: "16.5%",
                      alignItems: "flex-start",
                    }}
                  >
                    {/*****************************************************************************************
                     * @author asloob_ali BUG ID : 114898 Message End: modify data rights should not be allowed in the property of message end
                     *  Resolution : disabled modify rights in case of message end activity.
                     *  Date : 13/09/2022             ****************/}
                    <Checkbox
                      checked={item.bModify}
                      disabled={
                        isActivityModifyDisabled(
                          props.cellActivityType,
                          props.cellActivitySubType
                        ) || isReadOnly
                      } //for endevent && message end
                      size="medium"
                      name="bModify"
                      inputProps={{
                        "aria-label": `Name: ${
                          item.name
                        } Type: ${getVariableType(item.type)} Length: ${
                          item.length
                        } Modify`,
                      }}
                      onChange={(e) => changeDataFields(e, item)}
                      id={`pmweb_datafields_bmodify_Checkbox_${item.name}`}
                      inputRef={(item) => (modifyRef.current[index] = item)}
                      onKeyUp={(e) => {
                        if (e.key === "Enter") {
                          modifyRef.current[index].click();
                          e.stopPropagation();
                        }
                      }}
                    />
                  </div>
                </Grid>
                <Grid item xs={2}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      // width: "16.5%",
                      alignItems: "flex-start",
                    }}
                  >
                    <Checkbox
                      checked={item.bBulk}
                      disabled={
                        isActivityModifyDisabled(
                          props.cellActivityType,
                          props.cellActivitySubType
                        ) || isReadOnly
                      } //for endevent && message end
                      size="medium"
                      name="bBulk"
                      inputProps={{
                        "aria-label": `Name: ${
                          item.name
                        } Type: ${getVariableType(item.type)} Length: ${
                          item.length
                        } Bulk`,
                      }}
                      onChange={(e) => changeDataFields(e, item)}
                      id={`pmweb_datafields_bbulk_Checkbox_${item.name}`}
                      inputRef={(item) => (bulkRef.current[index] = item)}
                      onKeyUp={(e) => {
                        if (e.key === "Enter") {
                          bulkRef.current[index].click();
                          e.stopPropagation();
                        }
                      }}
                    />
                  </div>
                </Grid>
              </Grid>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    showDrawer: state.showDrawerReducer.showDrawer,
    cellID: state.selectedCellReducer.selectedId,
    cellName: state.selectedCellReducer.selectedName,
    cellType: state.selectedCellReducer.selectedType,
    cellActivityType: state.selectedCellReducer.selectedActivityType,
    cellActivitySubType: state.selectedCellReducer.selectedActivitySubType,
    openProcessType: state.openProcessClick.selectedType,
    cellCheckedOut: state.selectedCellReducer.selectedCheckedOut,
    isDrawerExpanded: state.isDrawerExpanded.isDrawerExpanded,
    openTemplateFlag: state.openTemplateReducer.openFlag,
  };
};

export default connect(mapStateToProps, null)(ExpenseInitiation);
