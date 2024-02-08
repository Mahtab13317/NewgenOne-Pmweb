// Made changes to fix for Bug Ids  113431, 111550 & 110324
// Changes made to solve Bug 116388 - Call Activity: Add document button is not working in Expanded mode
// #BugID - 120653
// #BugDescription -added css to handle the buttons of modal
import React, { useEffect, useState } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import ReusableInputs from "./reusableVar.js";
import "./workStep.css";
import Modal from "../../../../UI/Modal/Modal.js";
import VariableList from "./variableList.js";
import { store, useGlobalState } from "state-pool";
import { setActivityPropertyChange } from "../../../../redux-store/slices/ActivityPropertyChangeSlice.js";
import {
  ActivityPropertySaveCancelValue,
  setSave,
} from "../../../../redux-store/slices/ActivityPropertySaveCancelClicked.js";
import ErrorToast from "../../../../UI/ErrorToast";
import {
  RTL_DIRECTION,
  headerHeight,
  propertiesLabel,
} from "../../../../Constants/appConstants";
import { useTranslation } from "react-i18next";
import TabsHeading from "../../../../UI/TabsHeading/index.js";
import { isReadOnlyFunc } from "../../../../utility/CommonFunctionCall/CommonFunctionCall.js";
import { CircularProgress, Grid } from "@material-ui/core";
import { setToastDataFunc } from "../../../../redux-store/slices/ToastDataHandlerSlice";
import { LatestVersionOfProcess } from "../../../../utility/abstarctView/checkLatestVersion.js";

/*code edited on 6 Sep 2022 for BugId 115378 */
function InitialWorkstep(props) {
  const dispatch = useDispatch();
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const [errorToast, setErrorToast] = React.useState(false);
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const [showVariablesModal, setShowVariablesModal] = useState(false);
  const [selectedVariableList, setSelectedVariableList] = useState(null);
  const loadedActivityPropertyData = store.getState("activityPropertyData");
  const [localLoadedActivityPropertyData, setlocalLoadedActivityPropertyData] =
    useGlobalState(loadedActivityPropertyData);
  const saveCancelStatus = useSelector(ActivityPropertySaveCancelValue);
  const [showRedBorder, setShowRedBorder] = useState(false);
  // changes added for bug_id: 134226
  const windowInnerHeight = useSelector(
    (state) => state.setWindowInnerHeight.windowInnerHeight
  );
  const [spinner, setSpinner] = useState(true);
  let isReadOnly =
    props.openTemplateFlag ||
    LatestVersionOfProcess(localLoadedProcessData?.Versions) !==
      +localLoadedProcessData?.VersionNo || // modified on 05/09/2023 for BugId 136103
    isReadOnlyFunc(
      localLoadedProcessData,
      props.cellCheckedOut,
      props.cellLaneId
    );

  const validateFunction = () => {
    // Changes made to solve 116398 Call Activity: without making any changes save button is getting enabled
    let isValid = true;
    localLoadedActivityPropertyData?.ActivityProperty?.pMMessageEnd?.m_arrFwdVarMapping?.map(
      (el) => {
        if (!el.mappedFieldName || el.mappedFieldName?.trim() === "") {
          isValid = false;
        }
      }
    );
    return isValid;
  };

  useEffect(() => {
    if (saveCancelStatus.SaveClicked) {
      if (selectedVariableList && selectedVariableList.length > 0) {
        selectedVariableList?.map((el) => {
          if (!el.mappedFieldName || el.mappedFieldName.trim() == "") {
            setShowRedBorder(true);
          }
        });
      }
      let isValid = validateFunction();
      let checkMap =
        localLoadedActivityPropertyData?.ActivityProperty?.pMMessageEnd
          ?.m_arrFwdVarMapping.length ===
        localLoadedActivityPropertyData?.ActivityProperty?.pMMessageEnd?.m_arrFwdVarMapping.filter(
          (d) => !d.mappedFieldName
        ).length
          ? true
          : false;

      if (!isValid) {
        if (checkMap) {
          dispatch(
            setToastDataFunc({
              message: `${t("PleaseDefineAtleastOneForwardMapping")}`,
              severity: "error",
              open: true,
            })
          );
        } else {
          dispatch(
            setToastDataFunc({
              message: `${t("allMapforAllVar")}`,
              severity: "error",
              open: true,
            })
          );
        }

        setShowRedBorder(true);

        //Modified on 08/10/2023, bug_id:135150,135143
        dispatch(setSave({ SaveClicked: false }));

        dispatch(
          setActivityPropertyChange({
            [propertiesLabel.initiateWorkstep]: {
              isModified: true,
              hasError: true,
            },
          })
        );
        //till here for bug_id:135150,135143
      }
    }
  }, [saveCancelStatus.SaveClicked]);

  useEffect(() => {
    let tempSelectedVariableList = [];
    let forwardVariableList = localLoadedActivityPropertyData?.ActivityProperty
      ?.pMMessageEnd?.m_arrFwdVarMapping
      ? [
          ...localLoadedActivityPropertyData.ActivityProperty.pMMessageEnd
            .m_arrFwdVarMapping,
        ]
      : [];

    // forwardVariableList?.map((variable) => {
    forwardVariableList?.forEach((variable) => {
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
          [propertiesLabel.initiateWorkstep]: {
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
  }, [localLoadedActivityPropertyData]);

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

    if (tempLocalState?.ActivityProperty?.pMMessageEnd?.m_arrFwdVarMapping) {
      tempLocalState.ActivityProperty.pMMessageEnd.m_arrFwdVarMapping = [
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
        [propertiesLabel.initiateWorkstep]: {
          isModified: true,
          hasError: false,
        },
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
    tempLocalState?.ActivityProperty?.pMMessageEnd?.m_arrFwdVarMapping?.map(
      (el, idx) => {
        if (+el.importedVarId === +varr.VarID) {
          tempLocalState.ActivityProperty.pMMessageEnd.m_arrFwdVarMapping[idx] =
            {
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
        [propertiesLabel.initiateWorkstep]: {
          isModified: true,
          hasError: false,
        },
      })
    );
  };

  // code edited on 26 April 2023 for BugID 127490 - process task>>while removing one variable from mapping all are getting removed
  const deleteVariablesFromList = (variablesToDelete) => {
    let tempLocalState = JSON.parse(
      JSON.stringify(localLoadedActivityPropertyData)
    );
    tempLocalState?.ActivityProperty?.pMMessageEnd?.m_arrFwdVarMapping?.map(
      (el, idx) => {
        if (+el.importedVarId === +variablesToDelete.VarID) {
          tempLocalState.ActivityProperty?.pMMessageEnd?.m_arrFwdVarMapping.splice(
            idx,
            1
          );
        }
      }
    );
    setlocalLoadedActivityPropertyData(tempLocalState);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.initiateWorkstep]: {
          isModified: true,
          hasError: false,
        },
      })
    );
  };

  const content = () => {
    return (
      <div
        style={{
          backgroundColor: props.isDrawerExpanded ? "white" : null,
          width: props.isDrawerExpanded ? "75%" : "auto",
        }}
      >
        <div className="forwardMapping_VariablesLabel">
          <p style={{ fontSize: "12px", color: "#606060", fontWeight: "600" }}>
            {t("frwdMapping")}
          </p>
          {!isReadOnly && (
            <p
              style={{
                fontSize: "var(--base_text_font_size)",
                color: "var(--link_color)",
                cursor: "pointer",
                fontWeight: "500",
              }}
              onClick={() => {
                let temp;
                if (
                  props.cellActivityType === 2 &&
                  props.cellActivitySubType === 2
                ) {
                  temp =
                    localLoadedActivityPropertyData.ActivityProperty
                      .pMMessageEnd.processName;
                } else {
                  temp =
                    localLoadedActivityPropertyData?.ActivityProperty
                      ?.SubProcess?.importedProcessDefId;
                }

                temp?.trim() !== ""
                  ? setShowVariablesModal(true)
                  : dispatch(
                      setToastDataFunc({
                        message: t("pleaseSelectDeployedProcessName"),
                        severity: "error",
                        open: true,
                      })
                    );
              }}
            >
              {props.isDrawerExpanded ? null : t("addVariables")}
            </p>
          )}
        </div>
        {selectedVariableList.length > 0 ? (
          <>
            {/*  <div
            style={{
              width: "100%",
              minWidth: props.isDrawerExpanded ? "34rem" : "auto",
            }}
          >
           
            {
              // Modified on 08/10/2023, bug_id:135147
            }
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: props.isDrawerExpanded ? "80.5%" : "100%",
                // padding: "0.5vw 0.5vw", //For Bug 134656 we have provided this resolution by giving padding of 0.5vw
              }}
            >
              <div
                style={{
                  // flex: "0.5 1 0%",
                  marginRight: "5px",
                  width: props.isDrawerExpanded ? "285px" : "155px",
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
                <p
                  style={{
                    fontSize: "var(--base_text_font_size)",
                    color: "#000000",
                  }}
                >
                  {t("targetProcess")}
                </p>
                <p
                  style={{
                    fontSize: "var(--base_text_font_size)",
                    color: "#000000",
                  }}
                >
                  {
                    localLoadedActivityPropertyData?.ActivityProperty
                      ?.pMMessageEnd?.processName
                  }
                </p>
              </div>
             
              <div
                style={{
                  // flex: "0.5 1 0%",
                  width: props.isDrawerExpanded ? "285px" : "155px",
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
                <p
                  style={{
                    fontSize: "var(--base_text_font_size)",
                    color: "#000000",
                  }}
                >
                  {" "}
                  {t("currentProcess")}
                </p>
                <p
                  style={{
                    fontSize: "var(--base_text_font_size)",
                    color: "#000000",
                  }}
                >
                  {localLoadedProcessData.ProcessName}
                </p>
              </div>
             
            </div>
            {
              //till her for bug_id:135147
            }
            {
              //code added on 28 Nov 2022 for BugId 116427
            }
            <div
              className="callActList"
              style={{ width: props.isDrawerExpanded ? "850px" : "null" }}
            >
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
          </div> */}
            {
              // Modified on 08/10/2023, bug_id:135147
            }
            <Grid container spacing={1}>
              <Grid item xs={5}>
                <div
                  style={{
                    // flex: "0.5 1 0%",
                    // marginRight: "5px",
                    // width: props.isDrawerExpanded ? "285px" : "155px",
                    height: "38px",
                    borderRadius: "1px",
                    opacity: "1",
                    backgroundColor: "#F4F4F4",
                    // display: "flex",
                    // flexDirection: "column",
                    padding:
                      direction === RTL_DIRECTION
                        ? "0px 14px 0px 0px"
                        : "0px 0px 0px 14px", //For Bug 134656 we have provided this resolution by giving padding of 14px
                  }}
                >
                  <p
                    style={{
                      fontSize: "var(--base_text_font_size)",
                      color: "#000000",
                    }}
                  >
                    {t("targetProcess")}
                  </p>
                  <p
                    style={{
                      fontSize: "var(--base_text_font_size)",
                      color: "#000000",
                    }}
                  >
                    {
                      localLoadedActivityPropertyData?.ActivityProperty
                        ?.pMMessageEnd?.processName
                    }
                  </p>
                </div>
              </Grid>
              <Grid item xs={1}>
                <span style={{ display: "none" }}>xs=4</span>
              </Grid>
              <Grid item xs={5}>
                <div
                  style={{
                    // flex: "0.5 1 0%",
                    //width: props.isDrawerExpanded ? "285px" : "155px",
                    height: "38px",
                    borderRadius: "1px",
                    opacity: "1",
                    backgroundColor: "#F4F4F4",

                    // padding:
                    //   direction === RTL_DIRECTION
                    //     ? "0px 5px 0px 0px"
                    //     : "0px 0px 0px 5px",
                    padding:
                      direction === RTL_DIRECTION
                        ? "0px 14px 0px 0px"
                        : "0px 0px 0px 14px",
                  }}
                >
                  <p
                    style={{
                      fontSize: "var(--base_text_font_size)",
                      color: "#000000",
                    }}
                  >
                    {t("currentProcess")}
                  </p>
                  <p
                    style={{
                      fontSize: "var(--base_text_font_size)",
                      color: "#000000",
                    }}
                  >
                    {localLoadedProcessData.ProcessName}
                  </p>
                </div>
              </Grid>
              <Grid item xs={1}>
                <span style={{ display: "none" }}>xs=4</span>
              </Grid>
            </Grid>
            <Grid container spacing={1}>
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
            </Grid>
            {
              //till her for bug_id:135147
            }
          </>
        ) : (
          <p
            className={
              props.isDrawerExpanded
                ? direction === RTL_DIRECTION
                  ? "noMappingPresentArabic"
                  : "noMappingPresent"
                : "noMappingPresent_expanded"
            }
          >
            {t("addVariablesMessage")}
          </p>
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
              zIndex: "1500",
              boxShadow: "0px 3px 6px #00000029",
              border: "0",
              borderLeft: "1px solid #D6D6D6",
              borderRadius: "2px",
              padding: "0",
              height: `calc(${windowInnerHeight}px - ${headerHeight})`,
            }}
            modalClosed={() => setShowVariablesModal(false)}
            children={
              <VariableList
                selectedVariables={MapSelectedVariables}
                setShowVariablesModal={setShowVariablesModal}
                selectedVariableList={selectedVariableList}
                tabType="ForwardMapping"
                propLabel="initiateWorkstep"
                isReadOnly={isReadOnly}
              />
            }
          ></Modal>
        ) : null}
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
            style={{
              width: "24%",
              boxShadow: "0px 3px 6px #00000029",
              border: "1px solid #D6D6D6",
              borderRadius: "3px",
              padding: "0",
              height: `calc((${windowInnerHeight}px - ${headerHeight}) - 11.5rem)`,
            }}
          >
            <VariableList
              selectedVariables={MapSelectedVariables}
              setShowVariablesModal={setShowVariablesModal}
              selectedVariableList={selectedVariableList}
              tabType="ForwardMapping"
              propLabel="initiateWorkstep"
              isReadOnly={isReadOnly}
            />
          </div>
          {content()}
        </div>
      ) : (
        content()
      )}

      <ErrorToast
        errorToast={errorToast}
        hideToast={() => setErrorToast(false)}
        errorMessage="This is an error message!"
        errorSeverity="error"
        errorClassName="callActivity_ErrorToast"
      />
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    cellActivityType: state.selectedCellReducer.selectedActivityType,
    cellActivitySubType: state.selectedCellReducer.selectedActivitySubType,
    isDrawerExpanded: state.isDrawerExpanded.isDrawerExpanded,
    cellCheckedOut: state.selectedCellReducer.selectedCheckedOut,
    cellLaneId: state.selectedCellReducer.selectedActLaneId,
    openTemplateFlag: state.openTemplateReducer.openFlag,
  };
};

export default connect(mapStateToProps, null)(InitialWorkstep);
