// #BugID - 123151
// #BugDescription - Added constant and variable in dropdown list.
import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { useTranslation } from "react-i18next";
import classes from "./Collect.module.css";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Select from "@material-ui/core/Select";
import Checkbox from "@material-ui/core/Checkbox";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import SelectWithInput from "../../../../UI/SelectWithInput/index.js";
import { useGlobalState, store } from "state-pool";
import {
  headerHeight,
  propertiesLabel,
  RTL_DIRECTION,
} from "../../../../Constants/appConstants.js";
import MenuItem from "@material-ui/core/MenuItem";
import { useDispatch, useSelector } from "react-redux";
import {
  ActivityPropertyChangeValue,
  setActivityPropertyChange,
} from "../../../../redux-store/slices/ActivityPropertyChangeSlice";
import {
  ActivityPropertySaveCancelValue,
  setSave,
} from "../../../../redux-store/slices/ActivityPropertySaveCancelClicked.js";
import TabsHeading from "../../../../UI/TabsHeading";
import { isReadOnlyFunc } from "../../../../utility/CommonFunctionCall/CommonFunctionCall";
import { LatestVersionOfProcess } from "../../../../utility/abstarctView/checkLatestVersion";
import { makeStyles } from "@material-ui/core";
import { ReplaceSpaceToUnderScore } from "../../../../utility/ReplaceChar";

const useStyles = makeStyles({
  select: {
    width: "100%",
    font: "normal normal normal var(--base_text_font_size)/17px Open Sans",
    borderRadius: "2px",
    opacity: "1",
    textAlign: (props) =>
      props.direction === RTL_DIRECTION ? "right" : "left",
    "&$select": {
      paddingRight: (props) =>
        props.direction === RTL_DIRECTION ? "0.5vw" : "1.75vw",
      paddingLeft: (props) =>
        props.direction === RTL_DIRECTION ? "1.75vw" : "0.5vw",
    },
    "&::before": {
      display: "none",
    },
    "&::after": {
      display: "none",
    },
  },
  icon: {
    left: (props) => (props.direction === RTL_DIRECTION ? "0px" : "unset"),
    right: (props) => (props.direction === RTL_DIRECTION ? "unset" : "0px"),
  },
});

function Collect(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const dispatch = useDispatch();
  const {
    cellActivityType,
    cellActivitySubType,
    cellCheckedOut,
    cellLaneId,
    cellID,
    heading,
    isDrawerExpanded,
  } = props;
  const loadedActivityPropertyData = store.getState("activityPropertyData");
  const [localLoadedActivityPropertyData, setlocalLoadedActivityPropertyData] =
    useGlobalState(loadedActivityPropertyData);
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const allTabStatus = useSelector(ActivityPropertyChangeValue);
  const saveCancelStatus = useSelector(ActivityPropertySaveCancelValue);
  let isReadOnly =
    props.openTemplateFlag ||
    isReadOnlyFunc(localLoadedProcessData, cellCheckedOut, cellLaneId) ||
    LatestVersionOfProcess(localLoadedProcessData?.Versions) !==
      +localLoadedProcessData?.VersionNo; // modified on 05/09/2023 for BugId 136103;

  const [
    inclusiveDistributeActivitiesList,
    setInclusiveDistributeActivitiesList,
  ] = useState([]);

  const [
    parallelDistributeActivitiesList,
    setparallelDistributeActivitiesList,
  ] = useState([]);

  const [PrimaryActivityList, setPrimaryActivityList] = useState([]);
  const [isParallelCollect, setisParallelCollect] = useState(false);
  const [isConstantFlag, setisConstantFlag] = useState(false);
  const [intVariables, setintVariables] = useState([]);
  const [primaryError, setprimaryError] = useState(false);
  const [distributeError, setdistributeError] = useState(false);
  const [comboBoxError, setcomboBoxError] = useState(false);

  //Added on 16/01/2024 for bug_id:141247
  const [instanceError, setInstanceError] = useState({
    isValid: false,
    msg: "",
  });
  //till here for bug_id:141247

  const classesMUI = useStyles({ direction });
  // changes added for bug_id: 134226
  const windowInnerHeight = useSelector(
    (state) => state.setWindowInnerHeight.windowInnerHeight
  );
  const menuProps = {
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
        maxHeight: props.maxHeight ? props.maxHeight : "15rem",
      },
    },
  };

  useEffect(() => {
    if (saveCancelStatus.SaveOnceClicked) {
      validateCollectInfo("SAVE_CLICKED");
      dispatch(setSave({ SaveClicked: false }));
    }
  }, [saveCancelStatus.SaveClicked, saveCancelStatus.CancelClicked]);

  //check if activity is parallel or inclusive collect
  useEffect(() => {
    // code edited on 12 August 2022 for BugId 114242
    function checkParallelCollectActivity() {
      if (cellActivityType === 6 && cellActivitySubType === 2) {
        setisParallelCollect(true);
      } else {
        setisParallelCollect(false);
      }
    }
    checkParallelCollectActivity();
  }, [
    localLoadedActivityPropertyData?.ActivityProperty?.actSubType,
    localLoadedActivityPropertyData?.ActivityProperty?.actType,
  ]);

  useEffect(() => {
    if (localLoadedActivityPropertyData) {
      if (
        localLoadedActivityPropertyData?.ActivityProperty.collectInfo
          .collNoOfIns &&
        localLoadedActivityPropertyData?.ActivityProperty.collectInfo.collNoOfIns?.trim() !==
          "" &&
        localLoadedActivityPropertyData?.ActivityProperty.collectInfo
          .holdTillVar === ""
      ) {
        setisConstantFlag(true);
      }
    }
  }, [localLoadedActivityPropertyData]);

  //create distributeworkstep dropdown
  useEffect(() => {
    // code edited on 12 August 2022 for BugId 114242
    let tempOpenProcess = JSON.parse(JSON.stringify(localLoadedProcessData));
    let inclusiveDistributeList = [];
    let parallelDistributeList = [];
    tempOpenProcess?.MileStones?.forEach((mileStone) => {
      mileStone?.Activities?.forEach((activity) => {
        if (!isParallelCollect) {
          if (+activity.ActivityType === 5 && +activity.ActivitySubType === 1) {
            inclusiveDistributeList.push(activity);
          }
        } else if (isParallelCollect) {
          if (+activity.ActivityType === 5 && +activity.ActivitySubType === 2) {
            parallelDistributeList.push(activity);
          }
        }
      });
    });
    setInclusiveDistributeActivitiesList(inclusiveDistributeList);
    setparallelDistributeActivitiesList(parallelDistributeList);
  }, [isParallelCollect, localLoadedProcessData]);

  const getActivityDetailsFromId = (id) => {
    let tempOpenProcess = JSON.parse(JSON.stringify(localLoadedProcessData));
    let act;
    tempOpenProcess?.MileStones?.forEach((mileStone) => {
      mileStone?.Activities?.forEach((activity) => {
        if (+activity.ActivityId === +id) {
          act = activity;
        }
      });
    });
    return act;
  };

  //create primaryworkstep dropdown
  useEffect(() => {
    function createPrimaryWorkstepActivityList() {
      let tempOpenProcess = JSON.parse(JSON.stringify(localLoadedProcessData));
      let newArr = [];
      // code edited on 10 Feb 2022 for BugId 123666
      tempOpenProcess?.Connections.forEach((conn) => {
        if (conn.TargetId === cellID) {
          newArr.push(getActivityDetailsFromId(conn.SourceId));
        }
      });
      setPrimaryActivityList(newArr);
    }
    createPrimaryWorkstepActivityList();
  }, [localLoadedProcessData]);

  useEffect(() => {
    let tempList = [];
    let variableWithConstants = [];
    localLoadedProcessData?.DynamicConstant?.forEach((element) => {
      let tempObj = {
        VariableName: element.ConstantName,
        VariableScope: "C",
      };
      variableWithConstants.push(tempObj);
    });

    localLoadedProcessData?.Variable?.forEach((item) => {
      if (+item.VariableType === +3) {
        tempList.push(item);
        variableWithConstants.push(item);
      }
    });
    setintVariables(variableWithConstants);
  }, [localLoadedProcessData?.Variable]);

  const getSelectedActivity = (data) => {};

  const collectChangeHandler = (e) => {
    let temp = JSON.parse(JSON.stringify(localLoadedActivityPropertyData));
    if (e.target.value !== "") {
      setprimaryError(false);
    }
    if (e.target.name === "primaryDistributeDropdown") {
      temp.ActivityProperty.collectInfo.primaryAct = e.target.value;
    } else if (e.target.name === "DistributeWorkstepDropdown") {
      temp.ActivityProperty.collectInfo.assocActId = e.target.value + "";
    } else if (e.target.name === "deleteCheckbox") {
      temp.ActivityProperty.collectInfo.deleteOnCollect = e.target.checked
        ? "Y"
        : "N";
    } else if (e.target.name === "radioGroup") {
      temp.ActivityProperty.collectInfo.exOnPrimaryFlag = e.target.value;
      if (e.target.value === "A") {
        temp.ActivityProperty.collectInfo.holdTillVar = "";
        temp.ActivityProperty.collectInfo.collNoOfIns = 0;
      }
      // code added on 23 Feb 2023 for BugId 122600
      if (e.target.value === "C") {
        temp.ActivityProperty.collectInfo.primaryAct = "";
        temp.ActivityProperty.collectInfo.collNoOfIns = "0";
        temp.ActivityProperty.collectInfo.holdTillVar = "";
        setisConstantFlag(true);
      }
      // Added on 25-10-23 for review point of Bug 135674
      if (e.target.value === "F") {
        temp.ActivityProperty.collectInfo.collNoOfIns = "0";
        temp.ActivityProperty.collectInfo.primaryAct = "";
        temp.ActivityProperty.collectInfo.holdTillVar = "";
        setisConstantFlag(true);
      }
    }
    setlocalLoadedActivityPropertyData(temp);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.collect]: { isModified: true, hasError: false },
      })
    );
  };

  const handleComboBoxValue = (val) => {
    let temp = JSON.parse(JSON.stringify(localLoadedActivityPropertyData));
    if (!isNaN(val)) {

       //Added on 16/01/2024 for bug_id:141247


       const actId = temp?.ActivityProperty?.actId;
       const instanceCount = localLoadedProcessData?.Connections.filter(
         (d) => d.TargetId === actId
       );

       if (
        temp.ActivityProperty.collectInfo.exOnPrimaryFlag == "C" &&
        val > instanceCount.length
      ) {
        setInstanceError({
          isValid: true,
          msg: `${t("collectInstanceCount")} ${instanceCount.length}`,
        });
      } else if (
        temp.ActivityProperty.collectInfo.exOnPrimaryFlag == "F" &&
        val > instanceCount.length - 1
      ) {
        setInstanceError({
          isValid: true,
          msg: `${t("collectInstanceCountPrimary")} ${
            instanceCount.length - 1
          }`,
        });
      } else {
        setInstanceError({ isValid: false, msg: "" });
      }

      //till here for for bug_id:141247

      temp.ActivityProperty.collectInfo.collNoOfIns = val;
      temp.ActivityProperty.collectInfo.holdTillVar = "";
    } else {
      temp.ActivityProperty.collectInfo.holdTillVar = val.VariableName;
      temp.ActivityProperty.collectInfo.collNoOfIns = "";
    }
    setlocalLoadedActivityPropertyData(temp);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.collect]: { isModified: true, hasError: false },
      })
    );
  };

  // code edited on 12 August 2022 for BugId 114242
  const validateCollectInfo = (type) => {
    let hasError = false;
    if (
      localLoadedActivityPropertyData?.ActivityProperty?.collectInfo
        ?.assocActId === ""
    ) {
      if (type === "SAVE_CLICKED") {
        setdistributeError(true);
      }
      hasError = true;
    }
    if (
      localLoadedActivityPropertyData?.ActivityProperty?.collectInfo
        ?.collNoOfIns === "" &&
      localLoadedActivityPropertyData?.ActivityProperty?.collectInfo
        ?.holdTillVar === "" &&
      localLoadedActivityPropertyData?.ActivityProperty?.collectInfo
        ?.exOnPrimaryFlag !== "A" &&
      !isParallelCollect
    ) {
      if (type === "SAVE_CLICKED") {
        setcomboBoxError(true);
      }
      hasError = true;
    }
    if (
      localLoadedActivityPropertyData?.ActivityProperty?.collectInfo
        ?.exOnPrimaryFlag !== "C" &&
      localLoadedActivityPropertyData?.ActivityProperty?.collectInfo
        ?.primaryAct === "" &&
      !isParallelCollect
    ) {
      if (type === "SAVE_CLICKED") {
        setprimaryError(true);
      }
      hasError = true;
    }

    //Added on 10/01/2024 for bug_id:141247
    if (instanceError.isValid) {
      if (type === "SAVE_CLICKED") {
        hasError = true;
      }
      hasError = true;
    }
    //till here for bug_id:141247


    if (hasError) {
      dispatch(
        setActivityPropertyChange({
          [propertiesLabel.collect]: { isModified: true, hasError: true },
        })
      );
    }
    // Added on 05-10-23 for Bug 135674
    else {
      setcomboBoxError(false);
    }
    // Till here for Bug 135674
  };

  // Function that gets the value of criteria type based on whether the activity is new or has been saved earlier.
  const getInclusiveCollectCriteriaType = (value) => {
    let type = value;
    if (type === "N") {
      type = "C";
      let temp = JSON.parse(JSON.stringify(localLoadedActivityPropertyData));
      temp.ActivityProperty.collectInfo.exOnPrimaryFlag = type;
      setlocalLoadedActivityPropertyData(temp);
    }
    return type;
  };

  useEffect(() => {
    // code edited on 12 August 2022 for BugId 114242
    if (
      localLoadedActivityPropertyData?.ActivityProperty?.collectInfo &&
      allTabStatus[propertiesLabel.collect].isModified
    ) {
      validateCollectInfo("GENERAL");
    }
  }, [localLoadedActivityPropertyData?.ActivityProperty?.collectInfo]);

  return (
    <div
      className={classes.mainDiv}
      /* code added on 6 July 2023 for issue - save and discard button hide 
      issue in case of tablet(landscape mode)*/
      style={{
        height: `calc(${windowInnerHeight}px - ${headerHeight} - 9rem)`,
      }}
    >
      <TabsHeading heading={heading} />
      <div
        className={classes.mainContent}
        style={{ flexDirection: isDrawerExpanded ? "row" : "column" }}
      >
        <div
          className={classes.firstContentBox}
          style={{ width: isDrawerExpanded ? "50%" : "100%" }}
        >
          {!isParallelCollect ? (
            <div style={{ marginBlock: "0.4rem" }}>
              {/*Modified on 14/10/2023, bug_id:139400 */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  marginBottom: "0.2rem",
                }}
              >
                <label
                  style={{
                    color: "#727272",
                    fontWeight: "600",
                    marginBottom: "0.2rem",
                    fontSize: "1rem",
                  }}
                  htmlFor={`pmweb_Collect_PrimaryDistributeDropdown`}
                >
                  {t("primaryWorkstep")}
                </label>
              </div>
              {/*till here for bug_id:139400 */}
              {/*  <label
                style={{
                  color: "#727272",
                  fontWeight: "600",
                  marginBottom: "0.2rem",
                  fontSize: "1rem",
                }}
                htmlFor={`pmweb_Collect_PrimaryDistributeDropdown`}
              >
                {t("primaryWorkstep")}
              </label> */}
              <Select
                disabled={
                  isReadOnly ||
                  localLoadedActivityPropertyData?.ActivityProperty.collectInfo
                    ?.exOnPrimaryFlag === "C"
                }
                IconComponent={ExpandMoreIcon}
                classes={{ icon: classesMUI.icon, select: classesMUI.select }}
                MenuProps={menuProps}
                style={{
                  width: isDrawerExpanded ? "65%" : "95%",
                  height: "var(--line_height)",
                  opacity:
                    localLoadedActivityPropertyData?.ActivityProperty
                      ?.collectInfo?.exOnPrimaryFlag === "i"
                      ? "0.5"
                      : "1",
                }}
                variant="outlined"
                value={
                  localLoadedActivityPropertyData?.ActivityProperty?.collectInfo
                    ?.primaryAct || 0
                }
                onChange={collectChangeHandler}
                name="primaryDistributeDropdown"
                inputProps={{ id: `pmweb_Collect_PrimaryDistributeDropdown` }}
              >
                {/*Bug 113066 [24-02-2023]- Provided a placeholder*/}
                <MenuItem
                  value={0}
                  style={{
                    width: "100%",
                    height: "var(--line_height)",
                    justifyContent:
                      direction === RTL_DIRECTION ? "end" : "start",
                  }}
                  disabled
                >
                  <p
                    style={{
                      font: "normal normal normal var(--base_text_font_size)/17px Open Sans",
                    }}
                  >
                    -- {t("selectPrimaryWorkstep")} --
                  </p>
                </MenuItem>
                {PrimaryActivityList?.map((item, index) => {
                  return (
                    <MenuItem
                      style={{
                        width: "100%",
                        marginBlock: "0.2rem",
                        justifyContent:
                          direction === RTL_DIRECTION ? "end" : "start",
                      }}
                      value={item.ActivityName}
                      onClick={() => getSelectedActivity(item)}
                      id={`pmweb_Collect_PrimaryActivityList_${index}`}
                      key={`pmweb_Collect_PrimaryActivityList_${index}`}
                    >
                      <p
                        style={{
                          marginInline: "0.4rem",
                          font: "normal normal normal var(--base_text_font_size)/17px Open Sans",
                        }}
                      >
                        {item.ActivityName}
                      </p>
                    </MenuItem>
                  );
                })}
              </Select>
              {primaryError ? (
                <p style={{ fontSize: "12px", color: "red" }}>
                  {t("pleaseSelectPrimary")}
                </p>
              ) : null}
            </div>
          ) : null}

          <div style={{ marginBlock: "0.4rem" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                marginBottom: "0.2rem",
              }}
            >
              <label
                style={{
                  color: "#727272",
                  fontWeight: "600",
                  fontSize: "1rem",
                }}
                htmlFor={`pmweb_Collect_DistributeWorkstepDropdown_${
                  +localLoadedActivityPropertyData?.ActivityProperty
                    ?.collectInfo?.assocActId || 0
                }`}
              >
                {t("distributeWorkStep")}
              </label>
              <span className={classes.starIcon}>*</span>
            </div>

            {!isParallelCollect ? (
              <Select
                disabled={isReadOnly}
                IconComponent={ExpandMoreIcon}
                classes={{ icon: classesMUI.icon, select: classesMUI.select }}
                style={{
                  width: isDrawerExpanded ? "65%" : "95%",
                  height: "var(--line_height)",
                }}
                MenuProps={menuProps}
                variant="outlined"
                value={
                  +localLoadedActivityPropertyData?.ActivityProperty
                    ?.collectInfo?.assocActId || 0
                }
                onChange={collectChangeHandler}
                name="DistributeWorkstepDropdown"
                inputProps={{
                  id: `pmweb_Collect_DistributeWorkstepDropdown_${
                    +localLoadedActivityPropertyData?.ActivityProperty
                      ?.collectInfo?.assocActId || 0
                  }`,
                }}
              >
                {/*Bug 113066 [24-02-2023]- Provided a placeholder*/}
                <MenuItem
                  value={0}
                  style={{
                    width: "100%",
                    height: "var(--line_height)",
                    justifyContent:
                      direction === RTL_DIRECTION ? "end" : "start",
                  }}
                  disabled
                >
                  <p
                    style={{
                      font: "normal normal normal var(--base_text_font_size)/17px Open Sans",
                    }}
                  >
                    -- {t("selectDistributiveWorkstep")} --
                  </p>
                </MenuItem>
                {inclusiveDistributeActivitiesList?.map((item, index) => {
                  return (
                    <MenuItem
                      style={{
                        width: "100%",
                        marginBlock: "0.2rem",
                        justifyContent:
                          direction === RTL_DIRECTION ? "end" : "start",
                      }}
                      value={item.ActivityId}
                      onClick={() => getSelectedActivity(item)}
                      id={`pmweb_Collect_SelectDistributiveWorkstep_${index}`}
                      key={`pmweb_Collect_SelectDistributiveWorkstep_${index}`}
                    >
                      <p
                        style={{
                          font: "normal normal normal var(--base_text_font_size)/17px Open Sans",
                        }}
                      >
                        {item.ActivityName}
                      </p>
                    </MenuItem>
                  );
                })}
              </Select>
            ) : (
              <Select
                disabled={isReadOnly}
                IconComponent={ExpandMoreIcon}
                classes={{ icon: classesMUI.icon, select: classesMUI.select }}
                style={{
                  width: isDrawerExpanded ? "65%" : "95%",
                  height: "var(--line_height)",
                }}
                MenuProps={menuProps}
                variant="outlined"
                value={
                  +localLoadedActivityPropertyData?.ActivityProperty
                    ?.collectInfo?.assocActId
                }
                onChange={collectChangeHandler}
                name="DistributeWorkstepDropdown"
                inputProps={{
                  id: `pmweb_Collect_DistributeWorkstepDropdown_${+localLoadedActivityPropertyData
                    ?.ActivityProperty?.collectInfo?.assocActId}`,
                }}
              >
                {parallelDistributeActivitiesList?.map((item, index) => {
                  return (
                    <MenuItem
                      style={{
                        width: "100%",
                        marginBlock: "0.2rem",
                        justifyContent:
                          direction === RTL_DIRECTION ? "end" : "start",
                      }}
                      value={+item.ActivityId}
                      onClick={() => getSelectedActivity(item)}
                      id={`pmweb_Collect_ParallelDistributeActivitiesList_${index}`}
                      key={`pmweb_Collect_ParallelDistributeActivitiesList_${index}`}
                    >
                      <p
                        style={{
                          font: "normal normal normal var(--base_text_font_size)/17px Open Sans",
                        }}
                      >
                        {item.ActivityName}
                      </p>
                    </MenuItem>
                  );
                })}
              </Select>
            )}

            {distributeError ? (
              <p style={{ fontSize: "12px", color: "red" }}>
                {t("pleaseSelectDistribute")}
              </p>
            ) : null}
          </div>

          {!isParallelCollect ? (
            <div
              style={{
                marginBlock: "0.4rem",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Checkbox
                style={{ marginInlineStart: "0" }}
                disabled={isReadOnly}
                checked={
                  localLoadedActivityPropertyData?.ActivityProperty.collectInfo
                    ?.deleteOnCollect === "Y"
                    ? true
                    : false
                }
                size="small"
                onChange={collectChangeHandler}
                name="deleteCheckbox"
                id={`pmweb_Collect_DeleteCheckbox`}
              />
              <label
                htmlFor={`pmweb_Collect_DeleteCheckbox`}
                style={{
                  color: "#727272",
                  fontWeight: "600",
                  fontSize: "1rem",
                }}
              >
                {t("deleteOnCollect")}
              </label>
            </div>
          ) : null}
        </div>
        <hr
          style={{
            width: isDrawerExpanded ? "0" : "100%",
            height: isDrawerExpanded ? "inherit" : "0",
          }}
        />
        <div
          className={classes.firstContentBox}
          style={{ width: isDrawerExpanded ? "50%" : "100%" }}
        >
          <p
            style={{
              color: "#727272",
              fontWeight: "600",
              paddingTop: "0.5rem",
              fontSize: "1rem",
            }}
          >
            {t("collectionCriteria")}
          </p>
          <RadioGroup
            name="radioGroup"
            value={
              isParallelCollect
                ? "C"
                : getInclusiveCollectCriteriaType(
                    localLoadedActivityPropertyData?.ActivityProperty
                      ?.collectInfo?.exOnPrimaryFlag
                  )
            } //code edited on 12 August 2022 for BugId 114242
            onChange={collectChangeHandler}
            id="pmweb_collect_collectionCriteria"
          >
            {!isParallelCollect ? (
              <FormControlLabel
                classes={{
                  label: classes.radioButton,
                  root: classes.radioBtnRoot,
                }}
                value="A"
                control={
                  <Radio size="small" style={{ color: "var(--radio_color)" }} />
                }
                disabled={isReadOnly}
                label={t("waitPrimary")}
                id={`pmweb_collect_collectionCriteria_${ReplaceSpaceToUnderScore(
                  t("waitPrimary")
                )}`}
              />
            ) : null}

            {!isParallelCollect ? (
              <FormControlLabel
                classes={{
                  label: classes.radioButton,
                }}
                value="F"
                control={
                  <Radio size="small" style={{ color: "var(--radio_color)" }} />
                }
                disabled={isReadOnly}
                label={t("waitPrimaryAndInstances")}
                id={`pmweb_collect_collectionCriteria_${ReplaceSpaceToUnderScore(
                  t("waitPrimaryAndInstances")
                )}`}
              />
            ) : null}

            <FormControlLabel
              classes={{
                label: classes.radioButton,
              }}
              disabled={isParallelCollect || isReadOnly}
              value="C"
              control={
                <Radio size="small" style={{ color: "var(--radio_color)" }} />
              }
              label={t("waitInstances")}
              id={`pmweb_collect_collectionCriteria_${ReplaceSpaceToUnderScore(
                t("waitInstances")
              )}`}
            />
          </RadioGroup>

          {localLoadedActivityPropertyData?.ActivityProperty.collectInfo
            ?.exOnPrimaryFlag === "C" ||
          localLoadedActivityPropertyData?.ActivityProperty.collectInfo
            ?.exOnPrimaryFlag === "F" ? (
            <div
              style={{
                marginTop: "0.6rem",
              }}
            >
              <label
                htmlFor={`pmweb_Collect_InstancesCount_${
                  localLoadedActivityPropertyData?.ActivityProperty.collectInfo
                    .holdTillVar === ""
                    ? localLoadedActivityPropertyData?.ActivityProperty
                        .collectInfo.collNoOfIns
                    : localLoadedActivityPropertyData?.ActivityProperty
                        .collectInfo.holdTillVar
                }`}
                style={{
                  color: "#727272",
                  fontWeight: "600",
                  fontSize: "var(--base_text_font_size)",
                }}
              >
                {t("NoOfInstances")}
              </label>

              <div style={{ width: isDrawerExpanded ? "65%" : "95%" }}>
                <SelectWithInput
                  dropdownOptions={intVariables}
                  optionKey="VariableName"
                  setIsConstant={(val) => setisConstantFlag(val)}
                  setValue={(val) => handleComboBoxValue(val)}
                  value={
                    localLoadedActivityPropertyData?.ActivityProperty
                      .collectInfo.holdTillVar === ""
                      ? localLoadedActivityPropertyData?.ActivityProperty
                          .collectInfo.collNoOfIns
                      : localLoadedActivityPropertyData?.ActivityProperty
                          .collectInfo.holdTillVar
                  }
                  isConstant={isConstantFlag}
                  // constantInputClass={classes.textFieldHeight}
                  showEmptyString={false}
                  showConstValue={true}
                  inputProps={{
                    id: `pmweb_Collect_InstancesCount_${
                      localLoadedActivityPropertyData?.ActivityProperty
                        .collectInfo.holdTillVar === ""
                        ? localLoadedActivityPropertyData?.ActivityProperty
                            .collectInfo.collNoOfIns
                        : localLoadedActivityPropertyData?.ActivityProperty
                            .collectInfo.holdTillVar
                    }`,
                  }}
                  disabled={isParallelCollect || isReadOnly}
                />
              </div>
              {/* code edited on 12 August 2022 for BugId 114242*/}
              {comboBoxError ? (
                <p style={{ fontSize: "12px", color: "red" }}>
                  {t("pleaseSpecifyInstances")}
                </p>
              ) : null}

              {
                //Added on 16/01/2024 for bug_id:141247
              }
              {instanceError.isValid ? (
                <p style={{ fontSize: "12px", color: "red" }}>
                  {instanceError.msg}
                </p>
              ) : null}
              {
                //till here for bug_id:141247
              }
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    cellID: state.selectedCellReducer.selectedId,
    cellActivityType: state.selectedCellReducer.selectedActivityType,
    cellActivitySubType: state.selectedCellReducer.selectedActivitySubType,
    isDrawerExpanded: state.isDrawerExpanded.isDrawerExpanded,
    cellCheckedOut: state.selectedCellReducer.selectedCheckedOut,
    cellLaneId: state.selectedCellReducer.selectedActLaneId,
    openTemplateFlag: state.openTemplateReducer.openFlag,
  };
};

export default connect(mapStateToProps, null)(Collect);
