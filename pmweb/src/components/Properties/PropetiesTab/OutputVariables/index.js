import React, { useState, useEffect } from "react";
import Checkbox from "@material-ui/core/Checkbox";
import CircularProgress from "@material-ui/core/CircularProgress";
import { connect, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { store, useGlobalState } from "state-pool";
import { setActivityPropertyChange } from "../../../../redux-store/slices/ActivityPropertyChangeSlice";
import styles from "./index.module.css";
import arabicStyles from "./arabicStyles.module.css";
import {
  propertiesLabel,
  RTL_DIRECTION,
} from "../../../../Constants/appConstants";
import emptyStatePic from "../../../../assets/ProcessView/EmptyState.svg";
import TabsHeading from "../../../../UI/TabsHeading";
import { isReadOnlyFunc } from "../../../../utility/CommonFunctionCall/CommonFunctionCall";
import { LatestVersionOfProcess } from "../../../../utility/abstarctView/checkLatestVersion";
import { FormControlLabel, FormGroup } from "@material-ui/core";

function OutputVariables(props) {
  let { t } = useTranslation();
  let dispatch = useDispatch();
  const direction = `${t("HTML_DIR")}`;
  const [spinner, setspinner] = useState(true);
  const [activityDetails, setactivityDetails] = useState([]);
  const [allChecked, setAllChecked] = useState(false);
  const loadedActivityPropertyData = store.getState("activityPropertyData");
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedActivityPropertyData, setlocalLoadedActivityPropertyData] =
    useGlobalState(loadedActivityPropertyData);
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  let isReadOnly =
    props.openTemplateFlag ||
    isReadOnlyFunc(
      localLoadedProcessData,
      props.cellCheckedOut,
      props.cellLaneId
    ) ||
    LatestVersionOfProcess(localLoadedProcessData?.Versions) !==
      +localLoadedProcessData?.VersionNo; // modified on 05/09/2023 for BugId 136103;

  useEffect(() => {
    if (localLoadedActivityPropertyData?.Status === 0) {
      setspinner(false);
    }
    if (localLoadedActivityPropertyData) {
      let tempArr = [];
      let isAllChecked = true;
      localLoadedProcessData?.Variable.forEach((processVar) => {
        if (
          processVar.VariableScope === "U" ||
          processVar.VariableScope === "I"
        ) {
          let bOrderVal = getVariableOutputData(processVar.VariableName);
          let temp = {
            ...processVar,
            name: processVar.VariableName,
            type: processVar.VariableType,
            bOrder: bOrderVal,
            id: processVar.VariableId,
          };
          tempArr.push(temp);
          if (!bOrderVal) {
            isAllChecked = false;
          }
        }
      });
      setAllChecked(isAllChecked);
      setactivityDetails(tempArr);
    }
  }, [localLoadedActivityPropertyData]);

  const changeDataFields = (e, outputVar) => {
    let temp = JSON.parse(JSON.stringify(localLoadedActivityPropertyData));
    if (outputVar !== null) {
      if (e.target.checked) {
        temp.ActivityProperty.outPutInfo.outPutVarList.push({
          isSelected: true,
          processVarInfo: {
            defaultValue: outputVar.DefaultValue,
            extObjectId: outputVar.ExtObjectId,
            sysDefName: outputVar.SystemDefinedName,
            unbounded: outputVar.Unbounded,
            varLength: outputVar.VariableLength,
            varName: outputVar.VariableName,
            varPrecision: outputVar.VarPrecision,
            varScope: outputVar.VariableScope,
            type: outputVar.VariableType,
            variableId: outputVar.VariableId,
          },
        });
      } else {
        let index;
        temp.ActivityProperty.outPutInfo.outPutVarList.forEach(
          (variable, indexVal) => {
            if (variable.processVarInfo.varName === outputVar.VariableName) {
              index = indexVal;
            }
          }
        );
        temp.ActivityProperty.outPutInfo.outPutVarList.splice(index, 1);
      }
    } else {
      if (e.target.checked) {
        let tempArr = [];
        activityDetails.forEach((item) => {
          tempArr.push({
            isSelected: true,
            processVarInfo: {
              defaultValue: item.DefaultValue,
              extObjectId: item.ExtObjectId,
              sysDefName: item.SystemDefinedName,
              unbounded: item.Unbounded,
              varLength: item.VariableLength,
              varName: item.VariableName,
              varPrecision: item.VarPrecision,
              varScope: item.VariableScope,
              type: item.VariableType,
              variableId: item.VariableId,
            },
          });
        });
        temp.ActivityProperty.outPutInfo.outPutVarList = [...tempArr];
      } else {
        temp.ActivityProperty.outPutInfo.outPutVarList = [];
      }
      setAllChecked(e.target.checked);
    }
    setlocalLoadedActivityPropertyData(temp);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.outputVariables]: {
          isModified: true,
          hasError: false,
        },
      })
    );
  };

  const getVariableOutputData = (varName) => {
    let temp = false;
    localLoadedActivityPropertyData?.ActivityProperty?.outPutInfo?.outPutVarList?.forEach(
      (dataVar) => {
        let variable = dataVar.processVarInfo;
        if (variable.varName === varName) temp = true;
      }
    );
    return temp;
  };

  return (
    <>
      <TabsHeading heading={props?.heading} />
      <div className="flexColumn">
        {spinner ? (
          <CircularProgress
            style={
              direction === RTL_DIRECTION
                ? { marginTop: "30vh", marginRight: "50%" }
                : { marginTop: "30vh", marginLeft: "50%" }
            }
          />
        ) : (
          <React.Fragment>
            {activityDetails?.length > 0 ? (
              <div
                style={{
                  padding: direction === RTL_DIRECTION ? "none" : "1rem 0.5vw",
                }}
                className={`${styles.outputVariablesDiv} ${
                  props.isDrawerExpanded
                    ? direction === RTL_DIRECTION
                      ? styles.expandedArabic
                      : styles.expandedView
                    : styles.collapsedView
                }`}
              >
                <div className={styles.outputTableHeader}>
                  <span
                    className={
                      direction === RTL_DIRECTION
                        ? `${arabicStyles.outputHeadDiv} ${styles.outputVarName}`
                        : `${styles.outputHeadDiv} ${styles.outputVarName}`
                    }
                  >
                    {t("variableName")}
                  </span>
                  <span
                    className={
                      direction === RTL_DIRECTION
                        ? `${arabicStyles.outputHeadDiv} ${styles.outputCheck} flex`
                        : `${styles.outputHeadDiv} ${styles.outputCheck} flex`
                    }
                  >
                    <FormGroup>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={allChecked}
                            className={
                              direction === RTL_DIRECTION
                                ? arabicStyles.outputAllCheckbox
                                : styles.outputAllCheckbox
                            }
                            disabled={isReadOnly}
                            name="bAllOrder"
                            id={`pmweb_OutputVariables_bOutput_reply_allCheck`}
                            onChange={(e) => changeDataFields(e, null)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                changeDataFields(e, null);
                                e.stopPropagation();
                              }
                            }}
                          />
                        }
                        label={t("output")}
                      />
                    </FormGroup>
                  </span>
                </div>
                <div className={styles.outputTableBody}>
                  {activityDetails.map((item) => {
                    return (
                      <div className={`${styles.outputTableRow} flex`}>
                        <span
                          className={
                            direction === RTL_DIRECTION
                              ? `${arabicStyles.outputBodyDiv} ${styles.outputVarName}`
                              : `${styles.outputBodyDiv} ${styles.outputVarName}`
                          }
                        >
                          {item.name}
                        </span>
                        <FormGroup>
                          <FormControlLabel
                            // label={
                            //   <div
                            //     style={{ display: "none" }}
                            //   >{`checkbox_For${item.name}`}</div>
                            // }
                            control={
                              <Checkbox
                                aria-label={`${item.name}`}
                                checked={item.bOrder}
                                className={
                                  direction === RTL_DIRECTION
                                    ? `${arabicStyles.outputCheckbox} ${styles.outputCheck}`
                                    : `${styles.outputCheckbox} ${styles.outputCheck}`
                                }
                                disabled={isReadOnly}
                                name="bOrder"
                                id={`pmweb_OutputVariables_bOutput_${item.name}_check`}
                                onChange={(e) => changeDataFields(e, item)}
                              />
                            }
                          />
                        </FormGroup>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div
                className={`${
                  props.isDrawerExpanded
                    ? styles.noOutputVarExp
                    : styles.noOutputVarColl
                }`}
              >
                <img src={emptyStatePic} alt={t("noOutputVarAdded")} />
                <p className={styles.noOutputVarAddedString}>
                  {t("noOutputVarAdded")}
                </p>
              </div>
            )}
          </React.Fragment>
        )}
      </div>
    </>
  );
}

const mapStateToProps = (state) => {
  return {
    isDrawerExpanded: state.isDrawerExpanded.isDrawerExpanded,
    cellCheckedOut: state.selectedCellReducer.selectedCheckedOut,
    cellLaneId: state.selectedCellReducer.selectedActLaneId,
    openTemplateFlag: state.openTemplateReducer.openFlag,
  };
};

export default connect(mapStateToProps, null)(OutputVariables);
