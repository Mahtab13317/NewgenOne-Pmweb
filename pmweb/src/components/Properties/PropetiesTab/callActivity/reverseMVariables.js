// Made changes to fix for Bug Ids  113431, 111550 & 110324
// Changes made to solve Bug 116388 - Call Activity: Add document button is not working in Expanded mode
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import ReusableInputs from "./reusables/reusableInputs_VarR.js";
import "./commonCallActivity.css";
import Modal from "../../../../UI/Modal/Modal";
import { store, useGlobalState } from "state-pool";
import {
  headerHeight,
  propertiesLabel,
  RTL_DIRECTION,
  SERVER_URL,
  VARDOC_LIST,
} from "../../../../Constants/appConstants";
import { useDispatch, useSelector } from "react-redux";
import { ActivityPropertySaveCancelValue } from "../../../../redux-store/slices/ActivityPropertySaveCancelClicked.js";
import { setActivityPropertyChange } from "../../../../redux-store/slices/ActivityPropertyChangeSlice.js";
import TabsHeading from "../../../../UI/TabsHeading/index.js";
import { isReadOnlyFunc } from "../../../../utility/CommonFunctionCall/CommonFunctionCall.js";
import { CircularProgress, Grid, Typography } from "@material-ui/core";
import VariableReverseList from "./reusables/variableReverseList.js";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { setToastDataFunc } from "../../../../redux-store/slices/ToastDataHandlerSlice";
import { setSave } from "../../../../redux-store/slices/ActivityPropertySaveCancelClicked.js";
import { LatestVersionOfProcess } from "../../../../utility/abstarctView/checkLatestVersion.js";

/*code edited on 6 Sep 2022 for BugId 115378 */
function ReverseMVariables(props) {
  let { t } = useTranslation();
  const dispatch = useDispatch();
  const direction = `${t("HTML_DIR")}`;
  const loadedProcessData = store.getState("loadedProcessData");
  const [showRedBorder, setShowRedBorder] = useState(false);
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const [showVariablesModal, setShowVariablesModal] = useState(false);
  const [selectedVariableList, setSelectedVariableList] = useState(null);
  const loadedActivityPropertyData = store.getState("activityPropertyData");
  const [localLoadedActivityPropertyData, setlocalLoadedActivityPropertyData] =
    useGlobalState(loadedActivityPropertyData);
  const [spinner, setSpinner] = useState(true);
  const [targetProcessVarList, setTargetProcessVarList] = useState([]);
  const saveCancelStatus = useSelector(ActivityPropertySaveCancelValue);
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
            message: `${t("PleaseDefineAtleastOneReverseMapping")}`,
            severity: "error",
            open: true,
          })
        );
        setShowRedBorder(true);
      }
      dispatch(setSave({ SaveClicked: false }));
    }
  }, [saveCancelStatus.SaveClicked]);

  useEffect(() => {
    let tempSelectedVariableList = [];
    let idmap = {};
    let forwardVariableList =
      localLoadedActivityPropertyData?.ActivityProperty?.SubProcess
        ?.revVarMapping;
    localLoadedProcessData?.Variable?.forEach((variable) => {
      idmap = { ...idmap, [variable.VariableId]: variable.VariableType };
    });

    /*  forwardVariableList?.forEach((variable) => {
      tempSelectedVariableList.push({
        DefaultValue: "",
        ExtObjectId: "0",
        SystemDefinedName: variable.displayName,
        Unbounded: "N",
        VarFieldId: "0",
        VarPrecision: "0",
        VariableId: variable.importedVarId,
        VariableLength: "8",
        VariableName: variable.importedFieldName,
        VariableScope: "U",
        VariableType: idmap[variable.importedVarId],
        isChecked: true,
        mappedFieldName: variable.mappedFieldName,
        mappedVarId: variable.mappedVarId,
        mappedVarFieldId: variable.mappedVarFieldId,
      });
    }); */

    forwardVariableList?.forEach((variable) => {
      tempSelectedVariableList.push({
        DefaultValue: "",
        ExtObjectId: "0",
        SystemDefinedName: variable.displayName,
        Unbounded: "N",
        VarFieldId: "0",
        VarPrecision: "0",
        VariableId: variable.mappedVarId,
        VariableLength: "8",
        VariableName: variable?.mappedFieldName,
        VariableScope: "U",
        VariableType: variable.mappedFieldDataType,
        isChecked: true,
        mappedFieldName: variable.mappedFieldName,
        mappedVarId: variable.mappedVarId,
        mappedVarFieldId: variable.mappedVarFieldId,
        mappedFieldDataType: variable.mappedFieldDataType,
        importedFieldName: variable?.importedFieldName,
        importedFieldDataType: variable.importedFieldDataType,
        importedVarFieldId: variable.importedVarFieldId,
        importedVarId: variable.importedVarId,
      });
    });

    setSelectedVariableList(tempSelectedVariableList);
    if (
      localLoadedActivityPropertyData?.ActivityProperty?.SubProcess
        ?.importedProcessDefId &&
      localLoadedActivityPropertyData?.ActivityProperty?.SubProcess?.importedProcessDefId?.trim() !==
        ""
    ) {
      let jsonBody = {
        processDefId:
          localLoadedActivityPropertyData?.ActivityProperty?.SubProcess
            ?.importedProcessDefId,
        extTableDataFlag: "Y",
        docReq: "Y",
        omniService: "Y",
      };
      axios.post(SERVER_URL + VARDOC_LIST, jsonBody).then((res) => {
        if (res?.data?.Status === 0) {
          setTargetProcessVarList(res.data.VarDefinition);
          setSpinner(false);
        }
      });
    } else {
      setSpinner(false);
    }
    let isValid = validateFunction();
    if (!isValid) {
      dispatch(
        setActivityPropertyChange({
          [propertiesLabel.revVarMapping]: {
            isModified: true,
            hasError: true,
          },
        })
      );
      if (saveCancelStatus.SaveClicked) {
        setShowRedBorder(true);
      }
    }
  }, [localLoadedActivityPropertyData]);

  const validateFunction = () => {
    // Changes made to solve 116398 Call Activity: without making any changes save button is getting enabled
    let isValid = true;

    let reverseMapping =
      localLoadedActivityPropertyData?.ActivityProperty?.SubProcess
        ?.revVarMapping;
    if (!reverseMapping) {
      return false;
    }

    reverseMapping?.map((el) => {
      if (!el.mappedFieldName || el.mappedFieldName?.trim() === "") {
        isValid = false;
      }
    });
    return isValid;
  };

  const MapSelectedVariables = (selectedVariables) => {
    setShowRedBorder(false);
    setSelectedVariableList(selectedVariables);
    let tempLocalState = JSON.parse(
      JSON.stringify(localLoadedActivityPropertyData)
    );
    let forwardMapArr = [];

    //Modified on 12/07/2023, bug_id:132117

    /* selectedVariables.forEach((variable) => {
      forwardMapArr.push({
        displayName: variable.SystemDefinedName,
        importedVarId: variable.VariableId,
        importedFieldName: variable.VariableName,
        importedFieldDataType: variable.VariableType,
        importedVarFieldId: variable.VarFieldId,
        m_strEntityType: "A",
        m_bSelected: true,
        mappedFieldName: variable.mappedFieldName,
        mappedVarId: variable.mappedVarId,
        mappedVarFieldId: variable.mappedVarFieldId,
      });
    }); */

    selectedVariables.forEach((variable) => {
      forwardMapArr.push({
        displayName: variable.SystemDefinedName,
        importedVarId: variable.importedVarId,
        importedFieldName: variable?.importedFieldName,
        importedFieldDataType: variable.importedFieldDataType,
        importedVarFieldId: variable.importedVarFieldId,
        m_strEntityType: "A",
        m_bSelected: true,
        mappedFieldName: variable.VariableName,
        mappedVarId: variable.VariableId,
        mappedVarFieldId: variable.VarFieldId,
        mappedFieldDataType: variable.VariableType,
        VariableType: variable.VariableType,
      });
    });

    if (tempLocalState?.ActivityProperty?.SubProcess?.revVarMapping) {
      tempLocalState.ActivityProperty.SubProcess.revVarMapping = [
        ...forwardMapArr,
      ];
    } else {
      tempLocalState.ActivityProperty.SubProcess = {
        ...tempLocalState.ActivityProperty.SubProcess,
        revVarMapping: [...forwardMapArr],
      };
    }
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.revVarMapping]: { isModified: true, hasError: false },
      })
    );

    setlocalLoadedActivityPropertyData(tempLocalState);
  };

  const handleFieldMapping = (varr, fieldValue) => {
    let forwardMapArr = [];
    let tempLocalState = JSON.parse(
      JSON.stringify(localLoadedActivityPropertyData)
    );
    let selVariable = null;
    targetProcessVarList?.forEach((el) => {
      if (el.VarName === fieldValue) {
        selVariable = el;
      }
    });

    //Modified on 12/07/2023, bug_id:132117

    /* selectedVariableList.forEach((variable) => {
      forwardMapArr.push({
        ...variable,
        mappedFieldName:
          variable.VariableId === varr.VariableId
            ? fieldValue
            : variable.mappedFieldName,
        mappedVarId: selVariable.VarID,
        mappedVarFieldId: "0",
      });
    }); */

    selectedVariableList.forEach((variable) => {
      forwardMapArr.push({
        ...variable,
        mappedFieldName: varr.VariableName,
        mappedVarId: varr.VariableId,
        mappedVarFieldId: varr.VarFieldId,
        mappedFieldDataType: selVariable.VarType,
        importedFieldName: fieldValue,
        importedFieldDataType: selVariable.VarType,
        importedVarFieldId: "0",
        importedVarId: selVariable.VarID,
      });
    });

    //Modified on 12/07/2023, bug_id:132117

    /* tempLocalState?.ActivityProperty?.SubProcess?.revVarMapping?.map(
      (el, idx) => {
        if (+el.importedVarId === +varr.VariableId) {
          tempLocalState.ActivityProperty.SubProcess.revVarMapping[idx] = {
            ...el,
            m_bSelected: true,
            mappedFieldName: fieldValue,
            mappedVarId: selVariable.VarID,
            mappedVarFieldId: "0",
          };
        }
      }
    ); */

    tempLocalState?.ActivityProperty?.SubProcess?.revVarMapping?.forEach(
      (el, idx) => {
        if (+el.mappedVarId === +varr.VariableId) {
          tempLocalState.ActivityProperty.SubProcess.revVarMapping[idx] = {
            ...el,
            m_bSelected: true,
            mappedFieldName: varr.VariableName,
            mappedVarId: varr.VariableId,
            mappedVarFieldId: varr.VarFieldId,
            mappedFieldDataType: selVariable.VarType,
            importedFieldName: fieldValue,
            importedFieldDataType: selVariable.VarType,
            importedVarFieldId: "0",
            importedVarId: selVariable.VarID,
          };
        }
      }
    );
    setSelectedVariableList(forwardMapArr);
    setlocalLoadedActivityPropertyData(tempLocalState);

    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.revVarMapping]: { isModified: true, hasError: false },
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

    //Modified on 12/07/2023, bug_id:132117

    /* tempLocalState?.ActivityProperty?.SubProcess?.revVarMapping?.map(
      (el, idx) => {
        if (+el.importedVarId === +variablesToDelete.VariableId) {
          tempLocalState.ActivityProperty.SubProcess.revVarMapping.splice(
            idx,
            1
          );
        }
      }
    ); */

    tempLocalState?.ActivityProperty?.SubProcess?.revVarMapping?.map(
      (el, idx) => {
        if (+el.mappedVarId === +variablesToDelete.VariableId) {
          tempLocalState.ActivityProperty.SubProcess.revVarMapping.splice(
            idx,
            1
          );
        }
      }
    );
    setSelectedVariableList(tempVariablesList_Filtered);
    setlocalLoadedActivityPropertyData(tempLocalState);

    //Added on 27/06/2023, bug_id:130724
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.revVarMapping]: { isModified: true, hasError: false },
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
        <div>
          <div className="forwardMapping_VariablesLabel">
            <p
              style={{
                fontSize: "12px",
                color: "#606060",
                fontWeight: "600",
              }}
            >
              {t("reverseMapping").toUpperCase()}
            </p>
            {!isReadOnly && (
              <p
                id="pmweb_ReverseMVariables_AddVariablesText"
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
          {selectedVariableList?.length > 0 ? (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  // width: props.isDrawerExpanded ? "64.5%" : "87%",
                  width:"100%",
                   padding: "1.5vh 0vw",
                }}
              >
                <div
                  // className={
                  //   props.isDrawerExpanded
                  //     ? "forwardMapping_VariablesHeader_expanded forwardMapping_VariablesHeader_expanded1"
                  //     : "forwardMapping_VariablesHeader"
                  // }
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
                  {/* <p className="targetProcess">Target process</p> */}
                  <p className="targetProcess">{t("currentProcess")}</p>
                  <p className="processName_CallActivity">
                    {
                      //Modified on 12/07/2023, bug_id:132117
                      /* localLoadedActivityPropertyData?.ActivityProperty
                      ?.SubProcess?.importedProcessName */
                    }

                    {localLoadedProcessData.ProcessName}
                  </p>
                </div>
                <div style={{ flex: "0.2" }}></div>
                <div
                  // className={
                  //   props.isDrawerExpanded
                  //     ? "forwardMapping_VariablesHeader_expanded"
                  //     : "forwardMapping_VariablesHeader"
                  // }
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
                >
                  {/*  <p className="targetProcess">Current process</p> */}
                  <p className="targetProcess">{t("targetProcess")}</p>
                  <p className="processName_CallActivity">
                    {
                      //Modified on 12/07/2023, bug_id:132117
                      /* {localLoadedProcessData.ProcessName} */
                    }
                    {
                      localLoadedActivityPropertyData?.ActivityProperty
                        ?.SubProcess?.importedProcessName
                    }
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
                      targetProcessVarList={targetProcessVarList}
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
                <VariableReverseList
                  selectedVariables={MapSelectedVariables}
                  setShowVariablesModal={setShowVariablesModal}
                  selectedVariableList={selectedVariableList}
                  tabType="ReverseMapping"
                  propLabel="revVarMapping"
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
      <TabsHeading heading={props.heading} />
      {props.isDrawerExpanded ? (
        <div style={{ display: "flex", gap: "1vw", padding: "0 0.5vw" }}>
          <div
            className="leftSecWidth"
            style={{
              flex:"1.5 1 0%",
              boxShadow: "0px 3px 6px #00000029",
              border: "1px solid #D6D6D6",
              borderRadius: "3px",
              // padding: props.isDrawerExpanded ? "8px 0.5vw" : "0",
              height: window.innerWidth<1000?`calc((${windowInnerHeight}px - ${headerHeight}) - 11.8rem)` :"58.5vh",
              // height: `calc((${windowInnerHeight}px - ${headerHeight}) - 11.5rem)`,
            }}
          >
            <VariableReverseList
              selectedVariables={MapSelectedVariables}
              setShowVariablesModal={setShowVariablesModal}
              selectedVariableList={selectedVariableList}
              tabType="ReverseMapping"
              propLabel="revVarMapping"
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
export default connect(mapStateToProps, null)(ReverseMVariables);
