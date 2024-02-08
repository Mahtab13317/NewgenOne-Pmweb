// Made changes to fix for Bug Ids  113431, 111550 & 110324
// Changes made to solve Bug 116388 - Call Activity: Add document button is not working in Expanded mode

import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import ReusableInputs from "./reusables/reusableInputs_Var.js";
import "./commonCallActivity.css";
import Modal from "../../../../UI/Modal/Modal";
import VariableList from "./reusables/variableList";
import { store, useGlobalState } from "state-pool";
import { setActivityPropertyChange } from "../../../../redux-store/slices/ActivityPropertyChangeSlice.js";
import {
  ActivityPropertySaveCancelValue,
  setSave,
} from "../../../../redux-store/slices/ActivityPropertySaveCancelClicked.js";
import { useDispatch, useSelector } from "react-redux";
import {
  RTL_DIRECTION,
  headerHeight,
  propertiesLabel,
} from "../../../../Constants/appConstants";
import { useTranslation } from "react-i18next";
import TabsHeading from "../../../../UI/TabsHeading/index.js";
import { isReadOnlyFunc } from "../../../../utility/CommonFunctionCall/CommonFunctionCall.js";
import { CircularProgress, Grid, Typography } from "@material-ui/core";
import { setToastDataFunc } from "../../../../redux-store/slices/ToastDataHandlerSlice";
import { LatestVersionOfProcess } from "../../../../utility/abstarctView/checkLatestVersion.js";

/*code edited on 6 Sep 2022 for BugId 115378 */
function ForwardMVariables(props) {
  const dispatch = useDispatch();
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const [showVariablesModal, setShowVariablesModal] = useState(false);
  const [selectedVariableList, setSelectedVariableList] = useState(null);
  const loadedActivityPropertyData = store.getState("activityPropertyData");
  const [localLoadedActivityPropertyData, setlocalLoadedActivityPropertyData] =
    useGlobalState(loadedActivityPropertyData);
  const saveCancelStatus = useSelector(ActivityPropertySaveCancelValue);
  const [showRedBorder, setShowRedBorder] = useState(false);
  const [spinner, setSpinner] = useState(true);
  //Added on 28/08/2023 for BUGID: 134217
  // changes added for bug_id: 134226
  const windowInnerHeight = useSelector(
    (state) => state.setWindowInnerHeight.windowInnerHeight
  );
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
    if (saveCancelStatus.SaveOnceClicked) {
      if (selectedVariableList && selectedVariableList.length > 0) {
        selectedVariableList?.map((el) => {
          if (!el.mappedFieldName || el.mappedFieldName.trim() == "") {
            setShowRedBorder(true);
          }
        });
      }
      let isValid = validateFunction();
      if (!isValid) {
        dispatch(
          setToastDataFunc({
            message: `${t("PleaseDefineAtleastOneForwardMapping")}`,
            severity: "error",
            open: true,
          })
        );
        setShowRedBorder(true);
      }
      dispatch(setSave({ SaveClicked: false }));
    }
  }, [saveCancelStatus.SaveClicked]);

  const validateFunction = () => {
    // Changes made to solve 116398 Call Activity: without making any changes save button is getting enabled
    let isValid = true;
    let forwardMapping =
      localLoadedActivityPropertyData?.ActivityProperty?.SubProcess
        ?.fwdVarMapping;
    if (!forwardMapping) {
      return false;
    }

    forwardMapping?.map((el) => {
      if (!el.mappedFieldName || el.mappedFieldName?.trim() === "") {
        isValid = false;
      }
    });
    return isValid;
  };

  useEffect(() => {
    let tempSelectedVariableList = [];
    let forwardVariableList =
      localLoadedActivityPropertyData?.ActivityProperty?.SubProcess
        ?.fwdVarMapping;
    forwardVariableList?.map((variable) => {
      tempSelectedVariableList.push({
        DefValue: "",
        ExtObjID: "0",
        SysName: variable.displayName,
        Unbounded: "N",
        VarID: variable.importedVarId,
        VarName: variable.importedFieldName,
        VarPrecision: "0",
        VarScope: "U",
        VarType: variable.importedFieldDataType,
        VariableLen: "8",
        isChecked: true,
        mappedFieldName: variable.mappedFieldName,
        mappedVarId: variable.mappedVarId,
        mappedVarFieldId: variable.mappedVarFieldId,
      });
    });
    setSelectedVariableList(tempSelectedVariableList);
    setSpinner(false);
    let isValid = validateFunction();
    if (!isValid) {
      dispatch(
        setActivityPropertyChange({
          [propertiesLabel.fwdVarMapping]: {
            isModified: true,
            hasError: true,
          },
        })
      );
      if (saveCancelStatus.SaveClicked) {
        dispatch(
          setToastDataFunc({
            message: `${t("PleaseDefineAtleastOneForwardMapping")}`,
            severity: "error",
            open: true,
          })
        );
        setShowRedBorder(true);
      }
    }
  }, []);

  const MapSelectedVariables = (selectedVariables) => {
    setShowRedBorder(false);
    setSelectedVariableList(selectedVariables);
    let tempLocalState = JSON.parse(
      JSON.stringify(localLoadedActivityPropertyData)
    );
    let forwardMapArr = [];
    selectedVariables.forEach((variable) => {
      forwardMapArr.push({
        displayName: variable.SysName,
        importedVarId: variable.VarID,
        importedFieldName: variable.VarName,
        importedFieldDataType: variable.VarType,
        importedVarFieldId: "0",
        m_strEntityType: "A",
        m_bSelected: true,
        mappedFieldName: variable.mappedFieldName,
        mappedVarId: variable.mappedVarId,
        mappedVarFieldId: variable.mappedVarFieldId,
      });
    });

    if (tempLocalState?.ActivityProperty?.SubProcess?.fwdVarMapping) {
      tempLocalState.ActivityProperty.SubProcess.fwdVarMapping = [
        ...forwardMapArr,
      ];
    } else {
      tempLocalState.ActivityProperty.SubProcess = {
        ...tempLocalState.ActivityProperty.SubProcess,
        fwdVarMapping: [...forwardMapArr],
      };
    }
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.fwdVarMapping]: { isModified: true, hasError: false },
      })
    );
    setlocalLoadedActivityPropertyData(tempLocalState);
  };

  const handleFieldMapping = (varr, fieldValue) => {
    let temp = [];
    let tempLocalState = JSON.parse(
      JSON.stringify(localLoadedActivityPropertyData)
    );
    let selVariable = null;
    localLoadedProcessData.Variable?.forEach((el) => {
      if (el.VariableName === fieldValue) {
        selVariable = el;
      }
    });

    selectedVariableList.forEach((variable) => {
      temp.push({
        ...variable,
        mappedFieldName:
          variable.VarName === varr.VarName
            ? fieldValue
            : variable.mappedFieldName,
        mappedVarId: selVariable.VariableId,
        mappedVarFieldId: selVariable.VarFieldId,
      });
    });
    tempLocalState?.ActivityProperty?.SubProcess?.fwdVarMapping?.map(
      (el, idx) => {
        if (+el.importedVarId === +varr.VarID) {
          tempLocalState.ActivityProperty.SubProcess.fwdVarMapping[idx] = {
            ...el,
            m_bSelected: true,
            mappedFieldName: fieldValue,
            mappedVarId: selVariable.VariableId,
            mappedVarFieldId: selVariable.VarFieldId,
          };
        }
      }
    );
    setSelectedVariableList(temp);
    setlocalLoadedActivityPropertyData(tempLocalState);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.fwdVarMapping]: { isModified: true, hasError: false },
      })
    );
  };

  const deleteVariablesFromList = (variablesToDelete) => {
    let tempVariablesList = [...selectedVariableList];
    let tempLocalState = JSON.parse(
      JSON.stringify(localLoadedActivityPropertyData)
    );
    let tempVariablesList_Filtered = tempVariablesList.filter((variable) => {
      return variablesToDelete !== variable;
    });
    tempLocalState?.ActivityProperty?.SubProcess?.fwdVarMapping?.map(
      (el, idx) => {
        if (+el.importedVarId === +variablesToDelete.VarID) {
          tempLocalState.ActivityProperty.SubProcess.fwdVarMapping.splice(
            idx,
            1
          );
        }
      }
    );
    setSelectedVariableList(tempVariablesList_Filtered);
    setlocalLoadedActivityPropertyData(tempLocalState);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.fwdVarMapping]: { isModified: true, hasError: false },
      })
    );
  };

  const content = () => {
    return (
      <div
        style={{
          flex: "4",
          background: "white",
          overflowY: props.isDrawerExpanded ? "scroll" : "hidden",
          paddingLeft: "0.58vw",
        }}
      >
        <div
        // style={{
        //   backgroundColor: props.isDrawerExpanded ? "white" : null,
        //   width: props.isDrawerExpanded ? "75%" : "auto",
        //   overflowY: props.isDrawerExpanded ? "scroll" : "none", //Changes made to solve Bug 134211
        // }}
        >
          <div className="forwardMapping_VariablesLabel">
            <p
              style={{ fontSize: "12px", color: "#606060", fontWeight: "600" }}
            >
              {t("forwardMapping").toUpperCase()}
            </p>
            {!isReadOnly && (
              <p
                id="pmweb_ForwardMVariables_AddVariablesText"
                style={{
                  fontSize: "var(--base_text_font_size)",
                  color: "var(--link_color)",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
                onClick={() =>
                  localLoadedActivityPropertyData?.ActivityProperty?.SubProcess?.importedProcessDefId?.trim() !==
                  ""
                    ? setShowVariablesModal(true)
                    : dispatch(
                        setToastDataFunc({
                          message: t("pleaseSelectDeployedProcessName"),
                          severity: "error",
                          open: true,
                        })
                      )
                }
              >
                {props.isDrawerExpanded ? null : t("addVariables")}
              </p>
            )}
          </div>

          {selectedVariableList.length > 0 ? (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  // width: props.isDrawerExpanded ? "64.5%" : "87%",
                  width: "100%",
                  padding: "1.5vh 0vw", //For Bug 134656 we have provided this resolution by giving padding of 0.5vw
                }}
                // className={
                //   props.isDrawerExpanded
                //     ? // ? direction == RTL_DIRECTION
                //       "forwardMapping_VariablesHeaderDiv_ExpandedArabic"
                //     : // : "forwardMapping_VariablesHeaderDiv_Expanded"
                //       "forwardMapping_VariablesHeaderDiv"
                // }
              >
                <div
                  // className={
                  //   props.isDrawerExpanded
                  //     ? "forwardMapping_VariablesHeader_expanded forwardMapping_VariablesHeader_expanded1"
                  //     : "forwardMapping_VariablesHeader"
                  // }
                  // style={{
                  //   marginRight: props.isDrawerExpanded ? "6%" : "10.5%",
                  // }}
                  style={{
                    flex: "1",
                    // marginRight: "5px",
                    // width: props.isDrawerExpanded ? "20.98vw" : "10.16vw",
                    height: "38px",
                    borderRadius: "1px",
                    opacity: "1",
                    backgroundColor: "#F4F4F4",
                    display: "flex",
                    flexDirection: "column",
                    padding:
                      direction === RTL_DIRECTION
                        ? "0px 14px 0px 0px"
                        : "0px 0px 0px 14px", //For Bug 134656 we have provided this resolution by giving padding of 14px
                  }}
                >
                  <p className="targetProcess">{t("targetProcess")}</p>
                  <p className="processName_CallActivity">
                    {
                      localLoadedActivityPropertyData?.ActivityProperty
                        ?.SubProcess?.importedProcessName
                    }
                  </p>
                </div>
                <div style={{ flex: "0.2" }}></div>
                <div
                  style={{
                    flex: "1",
                    // width: props.isDrawerExpanded ? "285px" : "138px",
                    height: "38px",
                    borderRadius: "1px",
                    opacity: "1",
                    backgroundColor: "#F4F4F4",
                    display: "flex",
                    flexDirection: "column",
                    padding:
                      direction === RTL_DIRECTION
                        ? "0px 5px 0px 0px"
                        : "0px 0px 0px 5px",
                  }}
                  // className={
                  //   props.isDrawerExpanded
                  //     ? "forwardMapping_VariablesHeader_expanded"
                  //     : "forwardMapping_VariablesHeader"
                  // }
                >
                  <p className="targetProcess">{t("currentProcess")}</p>
                  <p className="processName_CallActivity">
                    {localLoadedProcessData.ProcessName}
                  </p>
                </div>
                <div style={{ flex: "0.2" }}></div>
              </div>
              {/*code added on 28 Nov 2022 for BugId 116427*/}
              <div className="callActList">
                {selectedVariableList?.map((variable, index) => {
                  return (
                    <ReusableInputs
                      variable={variable}
                      handleFieldMapping={handleFieldMapping}
                      deleteVariablesFromList={deleteVariablesFromList}
                      showRedBorder={showRedBorder}
                      isReadOnly={isReadOnly}
                      index={index}
                    />
                  );
                })}
              </div>
            </>
          ) : (
            // <p
            //   className={
            //     props.isDrawerExpanded
            //       ? direction == RTL_DIRECTION
            //         ? "noMappingPresentArabic"
            //         : "noMappingPresent"
            //       : "noMappingPresent_expanded"
            //   }
            // >
            //   {t("addVariablesMessage")}
            // </p>
            <Grid
              container
              direction="column"
              justifyContent="center"
              alignItems="center"
            >
              <Grid item style={{ paddingTop: "20vh" }}>
                <Typography>{t("addVariablesMessage")}</Typography>
              </Grid>
            </Grid>
          )}

          {showVariablesModal && !props.isDrawerExpanded ? (
            <Modal
              show={showVariablesModal}
              backDropStyle={{ backgroundColor: "transparent" }}
              style={{
                top: "0%",
                // modified on 17/10/2023 for bug_id: 138128
                // left: direction == RTL_DIRECTION ? "100%" : "-85%", //Modified on 12/09/2023, bug_id:136782
                left: direction == RTL_DIRECTION ? "100%" : "unset",
                right: direction === RTL_DIRECTION ? "unset" : "100%",
                position: "absolute",
                width: "25.35vw",
                minWidth: "20rem", //Added on 28/08/2023 for BUGID: 134217
                zIndex: "1500",
                boxShadow: "0px 3px 6px #00000029",
                border: "0",
                borderLeft: "1px solid #D6D6D6",
                borderRadius: "2px",
                padding: "0",
                //Added on 28/08/2023 for BUGID: 134217
                height: `calc(${windowInnerHeight}px - ${headerHeight})`,
              }}
              modalClosed={() => setShowVariablesModal(false)}
              children={
                <VariableList
                  selectedVariables={MapSelectedVariables}
                  setShowVariablesModal={setShowVariablesModal}
                  selectedVariableList={selectedVariableList}
                  tabType="ForwardMapping"
                  propLabel="fwdVarMapping"
                  isReadOnly={isReadOnly}
                />
              }
            ></Modal>
          ) : null}
        </div>
      </div>
    );
  };

  return spinner ? (
    <CircularProgress style={{ marginTop: "30vh", marginLeft: "40%" }} />
  ) : (
    <div>
      <TabsHeading heading={props?.heading} />
      {props.isDrawerExpanded ? (
        <div style={{ display: "flex", gap: "1vw", padding: "0 0.5vw" }}>
          <div
            className="leftSecWidth" //Changes made to solve Bug 134210
            style={{
              flex: "1.5 1 0%",
              boxShadow: "0px 3px 6px #00000029",
              border: "1px solid #D6D6D6",
              borderRadius: "3px",
              // padding: props.isDrawerExpanded ? "8px 0.5vw" : "0",
              height:
                window.innerWidth < 1000
                  ? `calc((${windowInnerHeight}px - ${headerHeight}) - 11.8rem)`
                  : "58.5vh",
              // height: `calc((${windowInnerHeight}px - ${headerHeight}) - 11.5rem)`,
            }}
          >
            <VariableList
              selectedVariables={MapSelectedVariables}
              setShowVariablesModal={setShowVariablesModal}
              selectedVariableList={selectedVariableList}
              tabType="ForwardMapping"
              propLabel="fwdVarMapping"
              isReadOnly={isReadOnly}
            />
          </div>
          {content()}
        </div>
      ) : (
        content()
      )}
    </div>
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

export default connect(mapStateToProps, null)(ForwardMVariables);
