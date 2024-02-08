// #BugID - 117663
// #BugDescription - Triggers saving issue has been fixed.
// #Date - 15 November 2022
import React, { useState, useEffect } from "react";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import "../Interfaces.css";
import { useTranslation } from "react-i18next";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import {
  PROCESSTYPE_LOCAL_CHECKED,
  SERVER_URL,
} from "../../../../Constants/appConstants";
import axios from "axios";
import { DisableCheckBox } from "../../../../utility/Tools/DisableFunc";
import { PROCESSTYPE_LOCAL } from "../../../../Constants/appConstants";
import { v4 as uuidv4 } from "uuid";
import { useRef } from "react";
import { Grid } from "@material-ui/core";

function CheckBoxes(props) {
  let { t } = useTranslation();
  const [allRights, setAllRights] = useState(false);
  const [checks, setChecks] = useState({
    View: false,
    Raise: false,
    Respond: false,
    Clear: false,
  });
  const [initialChecks, setInitialChecks] = useState({
    View: false,
    Raise: false,
    Respond: false,
    Clear: false,
  });
  const [raise, setRaise] = React.useState("");
  const [respond, setRespond] = React.useState("");
  const [clear, setClear] = React.useState("");
  const { processType, setExpData } = props;
  const allRightsRef = useRef();
  const viewRightRef = useRef();
  const raiseRightRef = useRef();
  const clearRightRef = useRef();
  const respondRightRef = useRef();

  const isProcessReadOnly =
    props.isReadOnly ||
    (processType !== PROCESSTYPE_LOCAL &&
      processType !== PROCESSTYPE_LOCAL_CHECKED);

  const DisableRaise = [
    { activityType: 2, subActivity: 1 },
    { activityType: 3, subActivity: 1 },
    { activityType: 2, subActivity: 2 },
    { activityType: 11, subActivity: 1 },
  ];

  const DisableRespond = [
    { activityType: 2, subActivity: 1 },
    { activityType: 3, subActivity: 1 },
    { activityType: 2, subActivity: 2 },
    { activityType: 11, subActivity: 1 },
    { activityType: 1, subActivity: 1 },
    { activityType: 1, subActivity: 3 },
  ];

  const DisableClear = [
    { activityType: 2, subActivity: 1 },
    { activityType: 3, subActivity: 1 },
    { activityType: 2, subActivity: 2 },
    { activityType: 11, subActivity: 1 },
    { activityType: 1, subActivity: 1 },
    { activityType: 1, subActivity: 3 },
  ];

  const handleChange = (event, checkType) => {
    let localActivity = null;
    props.exception.Activities?.forEach((activity) => {
      if (activity.ActivityId == props.activityId) {
        localActivity = activity;
      }
    });

    let rightPayload = null;
    if (checkType == "raise") {
      setRaise(event.target.value);
      rightPayload = {
        actId: localActivity.ActivityId,
        vTrigFlag: localActivity.View ? "Y" : "N",
        vrTrigFlag: localActivity.Raise ? "Y" : "N",
        vaTrigFlag: "N",
        vcTrigFlag: "N",
      };
    } else if (checkType == "respond") {
      setRespond(event.target.value);
      rightPayload = {
        actId: localActivity.ActivityId,
        vTrigFlag: localActivity.View ? "Y" : "N",
        vaTrigFlag: localActivity.Respond ? "Y" : "N",
        vcTrigFlag: "N",
        vrTrigFlag: "N",
      };
    } else {
      setClear(event.target.value);
      rightPayload = {
        actId: localActivity.ActivityId,
        vTrigFlag: localActivity.View ? "Y" : "N",
        vcTrigFlag: localActivity.Clear ? "Y" : "N",
        vaTrigFlag: "N",
        vrTrigFlag: "N",
      };
    }

    axios
      .post(SERVER_URL + `/saveExceptionTriggRight`, {
        processDefId: props.processId,
        pMExpTypeInfos: [
          {
            expTypeName: props.exception.ExceptionName,
            expTypeId: props.exception.ExceptionId,
            pMActRightsInfoList: [rightPayload],
            pMTrigTypeInfo: {
              triggerName: event.target.value,
              associatedExceptionRight: checkType,
            },
          },
        ],
      })
      .then((res) => {
        if (res.status === 200) {
          if (setExpData) {
            setExpData((prev) => {
              let newData = { ...prev };
              let acts =
                newData?.ExceptionGroups[props.groupIndex].ExceptionList[
                  props.activityIndex
                ];
              acts.Activities?.map((activity, actIdx) => {
                if (activity.ActivityId == props.activityId) {
                  if (checkType == "raise") {
                    newData.ExceptionGroups[props.groupIndex].ExceptionList[
                      props.activityIndex
                    ].Activities[actIdx].RaiseTriggerName = event.target.value;
                  } else if (checkType == "respond") {
                    newData.ExceptionGroups[props.groupIndex].ExceptionList[
                      props.activityIndex
                    ].Activities[actIdx].RespondTriggerName =
                      event.target.value;
                  } else {
                    newData.ExceptionGroups[props.groupIndex].ExceptionList[
                      props.activityIndex
                    ].Activities[actIdx].ClearTriggerName = event.target.value;
                  }
                }
              });
              return newData;
            });
          }
        }
      });
  };

  const changeChecks = (check_type) => {
    if (props.type === "set-all") {
      props.updateSetAllChecks(
        checks[check_type],
        check_type,
        props.docIdx,
        props.groupIndex
      );
    } else {
      props.toggleSingleChecks(
        check_type,
        props.activityIndex,
        props.activityId,
        props.groupIndex,
        checks[check_type],
        checks
      );
    }
  };

  useEffect(() => {
    // For each activity checkboxes
    let activityInDocType = false;
    if (props.expData && props.type === "activity") {
      let activities =
        props.expData.ExceptionGroups[props.groupIndex].ExceptionList[
          props.activityIndex
        ];
      activities.Activities?.forEach((activity) => {
        if (+activity.ActivityId === +props.activityId) {
          if (
            +props.activityType !== 2 &&
            +props.activityType !== 3 &&
            +props.activityType !== 1 &&
            +props.activityType !== 11
          ) {
            if (Object.values(activity).includes(false)) {
              setAllRights(false);
            } else {
              setAllRights(true);
            }
          } else if (+props.activityType === 1) {
            if (!activity.View) {
              setAllRights(false);
            } else if (!activity.Raise) {
              setAllRights(false);
            } else {
              setAllRights(true);
            }
          } else if (
            +props.activityType === 2 ||
            +props.activityType === 3 ||
            +props.activityType === 11
          ) {
            if (!activity.View) {
              setAllRights(false);
            } else {
              setAllRights(true);
            }
          }
          activityInDocType = true;
          setChecks(() => {
            return {
              View: activity.View,
              Raise: activity.Raise,
              Respond: activity.Respond,
              Clear: activity.Clear,
            };
          });
          setRaise(activity.RaiseTriggerName);
          setRespond(activity.RespondTriggerName);
          setClear(activity.ClearTriggerName);
        }
      });
      if (!activityInDocType) {
        setChecks(() => {
          return {
            View: false,
            Raise: false,
            Respond: false,
            Clear: false,
          };
        });
      }
    }

    // For setAll checkBoxes
    if (props.type === "set-all" && props.expData) {
      let setobj =
        props.expData.ExceptionGroups[props.groupIndex].ExceptionList[
          props.docIdx
        ].SetAllChecks;
      if (Object.values(setobj).includes(false)) {
        setAllRights(false);
      } else {
        setAllRights(true);
      }
      let doc =
        props.expData &&
        props.expData.ExceptionGroups[props.groupIndex].ExceptionList[
          props.docIdx
        ].SetAllChecks;
      setChecks(() => {
        return {
          View: doc.View,
          Raise: doc.Raise,
          Respond: doc.Respond,
          Clear: doc.Clear,
        };
      });
      setRaise(doc.RaiseTriggerName);
      setRespond(doc.RespondTriggerName);
      setClear(doc.ClearTriggerName);
    }
  }, [props.expData]);

  const handleAllRightsCheck = () => {
    setAllRights(!allRights);
    if (props.activityId) {
      if (props.handleGroupCheckOneColumn) {
        props.handleGroupCheckOneColumn(
          props.groupIndex,
          props.activityId,
          !allRights
        );
      } else {
        props.handleAllChecks(
          !allRights,
          props.groupIndex,
          props.activityIndex,
          props.activityId,
          props.activityType
        );
      }
    } else {
      props.GiveCompleteRights(props.docIdx, props.groupIndex, !allRights);
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <div className="checkBoxesThree">
        {/* Code added on 18-10-23 for Bug:139816   */}
        <FormControlLabel
          // className={styles.rights_Max_Width}
          // till here for Bug:139816
          control={
            <Checkbox
              name="checkedF"
              id={`pmweb_checkBox_${uuidv4()}_allRight`}
            />
          }
          // Changes on 12-09-2023 to resolve the bug Id 136567
          label={t("allRights")}
          checked={allRights}
          disabled={isProcessReadOnly ? true : false}
          onChange={handleAllRightsCheck}
          id={`pmweb_checkBoxes_${uuidv4()}_allRight`}
          // tabIndex={0}
          ref={allRightsRef}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              allRightsRef.current.click();
              e.stopPropagation();
            }
          }}
          aria-description={props.ariaDescription ? props.ariaDescription : ""}
        />

        <div style={{ display: "flex", alignItems: "center" }}>
          <FormControlLabel
            // className={styles.rights_Max_Width}
            control={
              <Checkbox
                name="checkedF"
                id={`pmweb_checkBox_${uuidv4()}_viewRight`}
              />
            }
            label={t("view")}
            checked={checks.View}
            disabled={isProcessReadOnly ? true : false}
            onChange={() => changeChecks("View")}
            id={`pmweb_checkBoxes_${uuidv4()}_viewRight`}
            // tabIndex={0}
            ref={viewRightRef}
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                viewRightRef.current.click();
                e.stopPropagation();
              }
            }}
            aria-description={
              props.ariaDescription ? props.ariaDescription : ""
            }
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
          <Grid container xs={12} spacing={1} justifyContent="space-between">
            <Grid item xs={4}>
              <FormControlLabel
                // className={styles.rights_Max_Width}
                disabled={
                  DisableCheckBox(DisableRaise, props) || isProcessReadOnly
                    ? true
                    : false
                }
                checked={
                  // modified on 08/11/23 for BugId 140802
                  // DisableCheckBox(DisableRaise, props) || isProcessReadOnly
                  DisableCheckBox(DisableRaise, props)
                    ? initialChecks.Raise
                    : checks.Raise
                }
                onChange={() => changeChecks("Raise")}
                // tabIndex={0}
                ref={raiseRightRef}
                onKeyUp={(e) => {
                  if (e.key === "Enter") {
                    raiseRightRef.current.click();
                    e.stopPropagation();
                  }
                }}
                control={
                  <Checkbox
                    name="checkedF"
                    id={`pmweb_checkBox_${uuidv4()}_raiseRight`}
                  />
                }
                label={t("raise")}
                //id={`pmweb_checkBoxes_${uuidv4()}_raiseRight`}
                id={`pmweb_checkBoxes_raiseRight_${props.title}_${props.groupIndex}`}
                aria-description={
                  props.ariaDescription ? props.ariaDescription : ""
                }
              />
            </Grid>
            <Grid item xs={2}></Grid>
            {props.type === "activity" && (
              <Grid item xs={6}>
                <span>
                  {checks.Raise && !DisableCheckBox(DisableRaise, props) ? (
                    <FormControl sx={{ m: 1 }} variant="standard">
                      <Select
                        className="selectTrigger"
                        style={{
                          width: "4.75vw",
                          fontSize: "11px",
                        }}
                        //labelId={`pmweb_checkBoxes_${uuidv4()}_raise_demo-customized-select`}
                        id={`pmweb_checkBoxes_${uuidv4()}_raise_demo-customized-select`}
                        inputProps={{
                          "aria-labelledby": `pmweb_checkBoxes_raiseRight_${props.title}_${props.groupIndex}`,
                        }}
                        value={raise}
                        onChange={(e) => handleChange(e, "raise")}
                        disabled={isProcessReadOnly}
                        aria-description={
                          props.ariaDescription
                            ? `${props.ariaDescription} ${t("raise")} input`
                            : "input"
                        }
                      >
                        <MenuItem value="" style={{ fontSize: "12px" }}>
                          <em>{t("processView.noneWord")}</em>
                        </MenuItem>
                        {props.expData.Trigger &&
                          props.expData.Trigger.map((trigger) => {
                            return (
                              <MenuItem
                                value={trigger.TriggerName}
                                style={{ fontSize: "12px" }}
                              >
                                {trigger.TriggerName}
                              </MenuItem>
                            );
                          })}
                      </Select>
                    </FormControl>
                  ) : null}
                </span>
              </Grid>
            )}
          </Grid>
        </div>

        <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
          <Grid container xs={12} spacing={1} justifyContent="space-between">
            <Grid item xs={4}>
              <FormControlLabel
                // className={styles.rights_Max_Width}
                control={
                  <Checkbox
                    name="checkedF"
                    id={`pmweb_checkBox_${uuidv4()}_respondRight`}
                  />
                }
                onChange={() => changeChecks("Respond")}
                // tabIndex={0}
                ref={respondRightRef}
                onKeyUp={(e) => {
                  if (e.key === "Enter") {
                    respondRightRef.current.click();
                    e.stopPropagation();
                  }
                }}
                label={t("respond")}
                disabled={
                  DisableCheckBox(DisableRespond, props) || isProcessReadOnly
                    ? true
                    : false
                }
                checked={
                  // modified on 08/11/23 for BugId 140802
                  // DisableCheckBox(DisableRespond, props) || isProcessReadOnly
                  DisableCheckBox(DisableRespond, props)
                    ? initialChecks.Respond
                    : checks.Respond
                }
                //id={`pmweb_checkBoxes_${uuidv4()}_respondRight`}
                id={`pmweb_checkBoxes_respondRight_${props.title}_${props.groupIndex}`}
                aria-description={
                  props.ariaDescription ? props.ariaDescription : ""
                }
              />
            </Grid>
            <Grid item xs={2}></Grid>
            {props.type === "activity" && (
              <Grid item xs={6}>
                <span>
                  {checks.Respond && !DisableCheckBox(DisableRespond, props) ? (
                    <FormControl sx={{ m: 1 }} variant="standard">
                      <Select
                        className="selectTrigger"
                        style={{
                          width: "4.75vw",
                          fontSize: "11px",
                        }}
                        //labelId={`pmweb_checkBoxes_respond_${uuidv4()}_demo-customized-select`}
                        id={`pmweb_checkBoxes_respond_${uuidv4()}_demo-customized-select`}
                        inputProps={{
                          "aria-labelledby": `pmweb_checkBoxes_respondRight_${props.title}_${props.groupIndex}`,
                        }}
                        value={respond}
                        onChange={(e) => handleChange(e, "respond")}
                        disabled={isProcessReadOnly}
                        aria-description={
                          props.ariaDescription
                            ? `${props.ariaDescription} ${t("respond")} input`
                            : "input"
                        }
                      >
                        <MenuItem value="" style={{ fontSize: "12px" }}>
                          <em>{t("processView.noneWord")}</em>
                        </MenuItem>
                        {props.expData.Trigger &&
                          props.expData.Trigger.map((trigger) => {
                            return (
                              <MenuItem
                                value={trigger.TriggerName}
                                style={{ fontSize: "12px" }}
                              >
                                {trigger.TriggerName}
                              </MenuItem>
                            );
                          })}
                      </Select>
                    </FormControl>
                  ) : null}
                </span>
              </Grid>
            )}
          </Grid>
        </div>

        <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
          <Grid container xs={12} spacing={1} justifyContent="space-between">
            <Grid item xs={4}>
              <FormControlLabel
                // className={styles.rights_Max_Width}
                control={
                  <Checkbox
                    name="checkedF"
                    id={`pmweb_checkBox_${uuidv4()}_clearRight`}
                    color="default"
                  />
                }
                label={t("clear")}
                onChange={() => changeChecks("Clear")}
                // tabIndex={0}
                ref={clearRightRef}
                onKeyUp={(e) => {
                  if (e.key === "Enter") {
                    clearRightRef.current.click();
                    e.stopPropagation();
                  }
                }}
                disabled={
                  DisableCheckBox(DisableClear, props) || isProcessReadOnly
                    ? true
                    : false
                }
                checked={
                  // modified on 08/11/23 for BugId 140802
                  // DisableCheckBox(DisableClear, props) || isProcessReadOnly
                  DisableCheckBox(DisableClear, props)
                    ? initialChecks.Clear
                    : checks.Clear
                }
                id={`pmweb_checkBoxes_clearRight_${props.title}_${props.groupIndex}`}
                aria-description={
                  props.ariaDescription ? props.ariaDescription : ""
                }
              />
            </Grid>
            <Grid item xs={2}></Grid>
            {props.type === "activity" && (
              <Grid item xs={6}>
                <span>
                  {checks.Clear && !DisableCheckBox(DisableClear, props) ? (
                    <FormControl sx={{ m: 1 }} variant="standard">
                      <Select
                        className="selectTrigger"
                        style={{
                          width: "4.75vw",
                          fontSize: "11px",
                        }}
                        //labelId={`pmweb_checkBoxes_clear_${uuidv4()}_demo-customized-select`}
                        inputProps={{
                          "aria-labelledby": `pmweb_checkBoxes_clearRight_${props.title}_${props.groupIndex}`,
                        }}
                        value={clear}
                        onChange={(e) => handleChange(e, "clear")}
                        disabled={isProcessReadOnly}
                        aria-description={
                          props.ariaDescription
                            ? `${props.ariaDescription} ${t("clear")} input`
                            : "input"
                        }
                      >
                        <MenuItem value="" style={{ fontSize: "12px" }}>
                          <em>{t("processView.noneWord")}</em>
                        </MenuItem>
                        {props.expData.Trigger &&
                          props.expData.Trigger.map((trigger) => {
                            return (
                              <MenuItem
                                value={trigger.TriggerName}
                                style={{ fontSize: "12px" }}
                              >
                                {trigger.TriggerName}
                              </MenuItem>
                            );
                          })}
                      </Select>
                    </FormControl>
                  ) : null}
                </span>
              </Grid>
            )}
          </Grid>
        </div>
      </div>
    </div>
  );
}

export default CheckBoxes;
