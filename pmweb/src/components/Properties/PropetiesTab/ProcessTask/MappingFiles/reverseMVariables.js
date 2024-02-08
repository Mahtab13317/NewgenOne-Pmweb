// Changes made to solve Bug 116651 - Process Task: add variable button is not working and
// Bug 116650 - Process Task: cancel button is not working or it should not be available if not required
// Changes made to solve Bug 126180 - 	regression>>Process task>> mapping variables and document are not displayed in collapsed mode
import React, { useState, useEffect } from "react";
import CommonTabHeader from "../commonHeader";
import { store, useGlobalState } from "state-pool";
import axios from "axios";
import {
  Select,
  MenuItem,
  Tooltip,
  Grid,
  Typography,
  makeStyles,
} from "@material-ui/core";
import { connect, useDispatch, useSelector } from "react-redux";
import {
  propertiesLabel,
  VARDOC_LIST,
  SERVER_URL,
  RTL_DIRECTION,
  headerHeight,
} from "../../../../../Constants/appConstants";
import { setActivityPropertyChange } from "../../../../../redux-store/slices/ActivityPropertyChangeSlice";
import Modal from "../../../../../UI/Modal/Modal";
import deleteImage from "../../../../../assets/icons/Delete.svg";
import VariableListReverse from "../MappingLists/variableListReverse";
import "./index.css";
import TabsHeading from "../../../../../UI/TabsHeading";
import { LatestVersionOfProcess } from "../../../../../utility/abstarctView/checkLatestVersion";
import { useTranslation } from "react-i18next";
import CustomizedDropdown from "../../../../../UI/Components_With_ErrrorHandling/Dropdown";
import { LightTooltip } from "../../../../../UI/StyledTooltip";
import {
  ActivityPropertySaveCancelValue,
  setSave,
} from "../../../../../redux-store/slices/ActivityPropertySaveCancelClicked";
import { setToastDataFunc } from "../../../../../redux-store/slices/ToastDataHandlerSlice";

const useStyles = makeStyles(() => ({
  flex: {
    display: "flex",
    alignItems: "center",
  },
}));

function ReverseForVariables(props) {
  // Process Data
  const { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const classes = useStyles({ direction });
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  // Activity Data
  const loadedActivityPropertyData = store.getState("activityPropertyData");
  const [localLoadedActivityPropertyData, setlocalLoadedActivityPropertyData] =
    useGlobalState(loadedActivityPropertyData);
  // States for this File
  const [reverseVariablesList, setReverseVariablesList] = useState([]);
  const dispatch = useDispatch();
  const [showVariablesModal, setShowVariablesModal] = useState(false);
  const [externalVariablesList, setExternalVariablesList] = useState([]);
  // changes added for bug_id: 134226
  const windowInnerHeight = useSelector(
    (state) => state.setWindowInnerHeight.windowInnerHeight
  );
  const saveCancelStatus = useSelector(ActivityPropertySaveCancelValue);
  let isReadOnly =
    props.openTemplateFlag ||
    LatestVersionOfProcess(localLoadedProcessData?.Versions) !==
      +localLoadedProcessData?.VersionNo; // modified on 05/09/2023 for BugId 136103;

  useEffect(() => {
    /* setReverseVariablesList(
      localLoadedActivityPropertyData?.m_objPMSubProcess?.revVarMapping
    ); */
    let temp = [];
    if (localLoadedActivityPropertyData)
      temp = localLoadedActivityPropertyData?.m_objPMSubProcess?.revVarMapping;
    setReverseVariablesList(temp);
  }, [localLoadedActivityPropertyData]);

  /*code edited on 16 feb  for BugId 122517 */
  useEffect(() => {
    let processID;
    if (
      localLoadedActivityPropertyData?.m_objPMSubProcess
        ?.importedProcessDefId != ""
    ) {
      processID =
        localLoadedActivityPropertyData?.m_objPMSubProcess
          ?.importedProcessDefId;
    } else {
      processID = localStorage.getItem("selectedTargetProcessID");
    }
    let jsonBody = {
      // processDefId: localStorage.getItem("selectedTargetProcessID"),
      processDefId: processID,
      extTableDataFlag: "Y",
      docReq: "Y",
      omniService: "Y",
    };

    axios.post(SERVER_URL + VARDOC_LIST, jsonBody).then((res) => {
      if (res?.data?.Status == 0) {
        setExternalVariablesList(res.data.VarDefinition);
      }
    });
  }, []);

  const getVarDetails = (name) => {
    let temp = {};
    externalVariablesList?.forEach((item) => {
      if (item.VarName == name) {
        temp = item;
      }
    });

    return temp;
  };
  const getVarObjofProcess = (varName) => {
    let temp = {};
    for (let item of localLoadedProcessData.Variable) {
      if (item.VariableName === varName) {
        temp = item;
        break;
      }
    }
    return temp;
  };

  const handleMappingChange = (el, event) => {
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.taskOptions]: {
          isModified: true,
          hasError: false,
        },
      })
    );
    let temp = { ...localLoadedActivityPropertyData };

    temp?.m_objPMSubProcess?.revVarMapping.forEach((ep) => {
      if (ep.importedFieldName == el.importedFieldName) {
        ep.mappedFieldName = event.target.value;
        ep.mappedVarId = getVarDetails(event.target.value).VarID;
        ep.mappedVarFieldId = "0";
        ep.displayName = el.importedFieldName;
        ep.importedVarFieldId = getVarObjofProcess(
          el.importedFieldName
        )?.VarFieldId;
        ep.importedVarId = getVarObjofProcess(el.importedFieldName)?.VariableId;
      }
    });

    setlocalLoadedActivityPropertyData(temp);
  };

  const deleteVariablesFromList = (element) => {
    let tempVariablesList = reverseVariablesList;
    let tempVariablesList_Filtered = tempVariablesList?.filter((variable) => {
      return variable.importedFieldName == element.importedFieldName;
    });
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.revVarMappingProcessTask]: {
          isModified: true,
          hasError: false,
        },
      })
    );
    setReverseVariablesList(tempVariablesList_Filtered);
    // Deleting Document from getActivityAPI Call
    let tempLocalState = { ...localLoadedActivityPropertyData };
    let reverseIncomingDocsList =
      localLoadedActivityPropertyData.m_objPMSubProcess.revVarMapping;
    reverseIncomingDocsList &&
      reverseIncomingDocsList.map((document, index) => {
        if (document.importedFieldName == element.importedFieldName) {
          reverseIncomingDocsList.splice(index, 1);
        }
      });
    tempLocalState.m_objPMSubProcess.revVarMapping = [
      ...reverseIncomingDocsList,
    ];
    setlocalLoadedActivityPropertyData(tempLocalState);
  };

  //Added on 25/08/2023, bug_id:130721
  const validateFunc = () => {
    let temp = { ...localLoadedActivityPropertyData };
    // temp.m_objPMSubProcess.fwdVarMapping = selectedVariables;
    let isAllmapped = true;
    let isEmpty = false;

    //Modified on 04/09/2023, bug_id:135315
    if (temp?.m_objPMSubProcess?.revVarMapping.length > 0) {
      temp?.m_objPMSubProcess?.revVarMapping.map((el) => {
        if (el.mappedFieldName == null) {
          isAllmapped = false;
        } else {
          isAllmapped = true;
        }
      });
      isEmpty = false;
    } else {
      isEmpty = true;
    }
    //till here for bug_id:135315

    /*  temp?.m_objPMSubProcess?.revVarMapping.map((el) => {
      if (el.mappedFieldName == null) {
        isAllmapped = false;
      } else {
        isAllmapped = true;
      }
    }); */

    //Added on 31/08/2023, bug_id:135401
    let isAllFwdMapped = true;
    temp?.m_objPMSubProcess?.fwdVarMapping.map((el) => {
      if (el.mappedFieldName == null) {
        isAllFwdMapped = false;
      } else {
        isAllFwdMapped = true;
      }
    });
    //till here for bug_id:135401

    //Modified on 04/09/2023, bug_id:135315
    return {
      status: isAllmapped,
      value: temp,
      fwdStatus: isAllFwdMapped,
      isEmptyMap: isEmpty,
    };
    //till here for bug_id:135315

    //Modified on 31/08/2023, bug_id:135401
    // return { status: isAllmapped, value: temp, fwdStatus: isAllFwdMapped };
    //till here for bug_id:135401

    //return { status: isAllmapped, value: temp };
  };

  useEffect(() => {
    if (saveCancelStatus.SaveClicked) {
      // Setting in the Activity Property Call

      const checkValidate = validateFunc();
      //Modified on 04/09/2023, bug_id:135315
      if (checkValidate.isEmptyMap) {
        dispatch(
          setToastDataFunc({
            message: `${t("PleaseDefineAtleastOneReverseMapping")}`,
            severity: "error",
            open: true,
          })
        );
        dispatch(setSave({ SaveClicked: false }));

        dispatch(
          setActivityPropertyChange({
            [propertiesLabel.revVarMappingProcessTask]: {
              isModified: true,
              hasError: true,
            },
          })
        );
      } else {
        if (checkValidate.status && checkValidate.fwdStatus) {
          setlocalLoadedActivityPropertyData(checkValidate.value);
          // dispatch(setSave({ SaveClicked: false }));
        } else if (!checkValidate.fwdStatus) {
          dispatch(
            setToastDataFunc({
              message: `${t("allMappingFwd")}`,
              severity: "error",
              open: true,
            })
          );
          dispatch(setSave({ SaveClicked: false }));
          dispatch(
            setActivityPropertyChange({
              [propertiesLabel.fwdVarMappingProcessTask]: {
                isModified: true,
                hasError: true,
              },
            })
          );
        } else {
          dispatch(
            setToastDataFunc({
              message: `${t("allMappingRev")}`,
              severity: "error",
              open: true,
            })
          );
          dispatch(setSave({ SaveClicked: false }));

          dispatch(
            setActivityPropertyChange({
              [propertiesLabel.revVarMappingProcessTask]: {
                isModified: true,
                hasError: true,
              },
            })
          );
        }
      }
      //till here for bug_id:135315

      /* //Modified on 31/08/2023, bug_id:135401
      if (checkValidate.status && checkValidate.fwdStatus) {
        setlocalLoadedActivityPropertyData(checkValidate.value);
        // dispatch(setSave({ SaveClicked: false }));
      } else if (!checkValidate.fwdStatus) {
        dispatch(
          setToastDataFunc({
            message: `${t("allMappingFwd")}`,
            severity: "error",
            open: true,
          })
        );
        dispatch(setSave({ SaveClicked: false }));
        dispatch(
          setActivityPropertyChange({
            [propertiesLabel.fwdVarMappingProcessTask]: {
              isModified: true,
              hasError: true,
            },
          })
        );
      } else {
        dispatch(
          setToastDataFunc({
            message: `${t("allMappingRev")}`,
            severity: "error",
            open: true,
          })
        );
        dispatch(setSave({ SaveClicked: false }));

        dispatch(
          setActivityPropertyChange({
            [propertiesLabel.revVarMappingProcessTask]: {
              isModified: true,
              hasError: true,
            },
          })
        );
      }

      //till here for bug_id:135401 */

      /* if (checkValidate.status) {
        setlocalLoadedActivityPropertyData(checkValidate.value);
        // dispatch(setSave({ SaveClicked: false }));
      }else {
        dispatch(
          setToastDataFunc({
            message: `${t("allMappingRev")}`,
            severity: "error",
            open: true,
          })
        );
        dispatch(setSave({ SaveClicked: false }));

        dispatch(
          setActivityPropertyChange({
            [propertiesLabel.revVarMappingProcessTask]: {
              isModified: true,
              hasError: true,
            },
          })
        );
      } */
    }
  }, [saveCancelStatus.SaveClicked]);

  useEffect(() => {
    const checkValidate = validateFunc();
    //Modified on 04/09/2023, bug_id:135315
    if (checkValidate.isEmptyMap) {
      dispatch(
        setActivityPropertyChange({
          [propertiesLabel.revVarMappingProcessTask]: {
            isModified: true,
            hasError: true,
          },
        })
      );
    } else {
      if (checkValidate.status) {
        dispatch(
          setActivityPropertyChange({
            [propertiesLabel.revVarMappingProcessTask]: {
              isModified: true,
              hasError: false,
            },
          })
        );
      } else if (!checkValidate.fwdStatus) {
        dispatch(
          setActivityPropertyChange({
            [propertiesLabel.fwdVarMappingProcessTask]: {
              isModified: true,
              hasError: true,
            },
          })
        );
      } else {
        dispatch(
          setActivityPropertyChange({
            [propertiesLabel.revVarMappingProcessTask]: {
              isModified: true,
              hasError: true,
            },
          })
        );
      }
    }
    //till here for bug_id:135315

    /*  if (checkValidate.status) {
      dispatch(
        setActivityPropertyChange({
          [propertiesLabel.revVarMappingProcessTask]: {
            isModified: true,
            hasError: false,
          },
        })
      );
    } else if (!checkValidate.fwdStatus) {
      dispatch(
        setActivityPropertyChange({
          [propertiesLabel.fwdVarMappingProcessTask]: {
            isModified: true,
            hasError: true,
          },
        })
      );
    } else {
      dispatch(
        setActivityPropertyChange({
          [propertiesLabel.revVarMappingProcessTask]: {
            isModified: true,
            hasError: true,
          },
        })
      );
    } */
  }, [localLoadedActivityPropertyData]);

  //code ends for bug_id:130721

  const oneLineForMap = () => {
    return reverseVariablesList?.map((el, index) => {
      return (
        <>
          <div
            id="processTaskId1"
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "0.5vh 0.5vw",
              width: props.isDrawerExpanded ? "100%" : "100%",
            }}
          >
            {/* <div
              style={{
                flex: "1",
                height: "36px",
                backgroundColor: "#F4F4F4",
                borderRadius: "1px",
                opacity: "1",
                fontSize: "12px",
                padding: "5px",
                textOverflow: "ellipsis",
                overflow: "hidden",
                whiteSpace: "nowrap",
              }}
            >
              <Tooltip title={el.importedFieldName}>
                <span style={{ padding: "5px" }}>{el.importedFieldName}</span>
              </Tooltip>
            </div>
            <p style={{ marginTop: "5px", flex: "0.2", textAlign: "center" }}>
              =
            </p>
            <div
              style={{
                flex: "1",
                overflow: "hidden",
              }}
            > */}
            {/* Replaced Select component with CustomizedDropdown for Bug 134838 on 25-08-23*/}
            {/* <CustomizedDropdown
                id={`pmweb_ReverseMVariables_MappedField_${index}`}
                inputProps={{ "aria-label": "Without label" }}
                value={el.mappedFieldName}
                style={{
                  width: "100%",
                  height: "34px",
                  border: "1px solid #CECECE",
                  borderRadius: "1px",
                  opacity: "1",
                }}
                onChange={(e) => handleMappingChange(el, e)}
                className="selectDateTime_options"
                isNotMandatory={true}
                relativeStyle={{ width: "100%" }}
              > */}
            {/*code edited on 16 feb  for BugId 122517 */}
            {/* {externalVariablesList
                  ?.filter((d) => d.VarType === el.importedFieldDataType)
                  .map((variable) => {
                    return (
                      <MenuItem value={variable.VarName}>
                        <em style={{ fontSize: "12px", fontStyle: "normal" }}>
                          {variable.VarName}
                        </em>
                      </MenuItem>
                    );
                  })}
              </CustomizedDropdown> */}
            {/* Till here for Bug 134838 */}
            {/* </div>
            <div style={{ marginTop: "9px", flex: "0.2", textAlign: "center" }}> */}
            {/* <DeleteIcon
                className="deleteIconProcessTask"
                style={{
                  cursor: "pointer",
                }}
                onClick={() => deleteVariablesFromList(el)}
              /> */}
            {/* Added tooltip for delete icon for Bug 134838 on 25-08-23*/}
            {/* <LightTooltip
                id={`pmweb_ReverseMVariables_DeleteTooltip_${index}`}
                arrow={true}
                placement="bottom-start"
                title={t("delete")}
              >
                <img
                  id={`pmweb_ReverseMVariables_DeleteVarFromList_${index}`}
                  src={deleteImage}
                  style={{
                    height: "200px",
                    width: "12px",
                    height: "12px",
                    cursor: "pointer",
                  }}
                  onClick={() => deleteVariablesFromList(el)}
                  alt={t("DELETE")}
                />
              </LightTooltip> */}
            {/* Till here for Bug 134838*/}
            {/* </div> */}
            <Grid
              item
              xs={5}
              className={classes.flex}
              style={{
                backgroundColor: "#F4F4F4",
              }}
            >
              <div
                style={{
                  padding:
                    direction === RTL_DIRECTION
                      ? "0px 14px 0px 0px"
                      : "0px 0px 0px 14px",
                }}
              >
                <Tooltip title={el.importedFieldName}>
                  <span>{el.importedFieldName}</span>
                </Tooltip>
              </div>
            </Grid>
            <Grid item xs={1} className={classes.flex} justifyContent="center">
              <div
                style={{
                  textAlign: "center",
                }}
              >
                <span>=</span>
              </div>
            </Grid>
            <Grid item xs={5} className={classes.flex}>
              {/* Replaced Select component with CustomizedDropdown for Bug 134838 on 25-08-23*/}
              <CustomizedDropdown
                id={`pmweb_ReverseMVariables_MappedField_${index}`}
                inputProps={{ "aria-label": "Without label" }}
                value={el.mappedFieldName}
                style={{
                  width: "100%",
                  height: "34px",
                  border: "1px solid #CECECE",
                  borderRadius: "1px",
                  opacity: "1",
                }}
                onChange={(e) => handleMappingChange(el, e)}
                className="selectDateTime_options"
                isNotMandatory={true}
                relativeStyle={{ width: "100%" }}
              >
                {/*code edited on 16 feb  for BugId 122517 */}
                {externalVariablesList
                  ?.filter((d) => d.VarType === el.importedFieldDataType)
                  .map((variable) => {
                    return (
                      <MenuItem value={variable.VarName}>
                        <em
                          style={{
                            fontSize: "12px",
                            fontStyle: "normal",
                            padding:
                              direction === RTL_DIRECTION
                                ? "0px 7px 0px 0px"
                                : "0px 0px 0px 7px",
                          }}
                        >
                          {variable.VarName}
                        </em>
                      </MenuItem>
                    );
                  })}
              </CustomizedDropdown>
              {/* Till here for Bug 134838 */}
            </Grid>
            <Grid
              item
              xs={1}
              className={classes.flex}
              justifyContent="flex-start"
            >
              {/* Added tooltip for delete icon for Bug 134838 on 25-08-23*/}
              <LightTooltip
                id={`pmweb_ReverseMVariables_DeleteTooltip_${index}`}
                arrow={true}
                placement="bottom-start"
                title={t("delete")}
              >
                <img
                  id={`pmweb_ReverseMVariables_DeleteVarFromList_${index}`}
                  src={deleteImage}
                  // style={{
                  //   height: "200px",
                  //   width: "12px",
                  //   height: "12px",
                  //   cursor: "pointer",
                  // }}
                  style={{
                    width: "1.5rem",
                    height: "1.5rem",
                    margin:
                      direction === RTL_DIRECTION
                        ? "0px 5px 0px 0px"
                        : "0px 0px 0px 5px",
                    cursor: "pointer",
                  }}
                  onClick={() => deleteVariablesFromList(el)}
                  alt={t("DELETE")}
                />
              </LightTooltip>
              {/* Till here for Bug 134838*/}
            </Grid>
          </div>
        </>
      );
    });
  };

  return (
    <div>
      <TabsHeading heading={props?.heading} />
      <div
        className="forwardMVarDiv"
        style={{
          // height: `calc(${windowInnerHeight}px - ${headerHeight} - 10.5rem)`,
          height:
            window.innerWidth < 1200
              ? `calc(${windowInnerHeight}px - ${headerHeight} - 11.5rem)`
              : "59vh",
          padding: props.isDrawerExpanded ? "8px 0.5vw" : "0", //Changes made to solve Bug 135428
        }}
      >
        {props.isDrawerExpanded && (
          <div
            style={{
              flex: "1.5",
              boxShadow: "0px 3px 6px #00000029",
              border: "1px solid #D6D6D6",
              borderRadius: "3px",
              backgroundColor: "white",
            }}
          >
            <VariableListReverse
              selectedVariableList={reverseVariablesList}
              setSelectedVariableList={setReverseVariablesList}
              setShowVariablesModal={setShowVariablesModal}
              isDrawerExpanded={props.isDrawerExpanded}
              isReadOnly={isReadOnly}
            />
          </div>
        )}
        <div
          style={{
            flex: "4",
            background: "white",
            overflowY: props.isDrawerExpanded ? "scroll" : "none",
            paddingLeft: "0.58vw",
          }}
        >
          <CommonTabHeader
            tabType="ReverseForVariables"
            setShowVariablesModal={setShowVariablesModal}
            isDrawerExpanded={props.isDrawerExpanded}
            isReadOnly={isReadOnly}
            hideTargetCurrentHeader={reverseVariablesList?.length === 0}
          />

          {
            //code updated on 10 November 2022 for BugId 116619
          }
          <div
            className="mapList"
            // style={{ height: "275px", overflowY: "scroll" }}
            //Bug 123925 - safari>> process task>> too much unnecessary white spacing on mapping variable screen
            //[25-03-2023] updated the height from 275px to 50vh
            style={{
              height: "50vh",
              // overflowY: "scroll",  //Changes made to solve Bug 135141
              scrollbarColor: "#dadada #fafafa",
              scrollbarWidth: "thin",
            }}
          >
            {reverseVariablesList?.length > 0 ? (
              oneLineForMap()
            ) : (
              // <p
              //   className={
              //     props.isDrawerExpanded
              //       ? direction === RTL_DIRECTION
              //         ? "noMappingPresentTaskArabic"
              //         : "noMappingPresentTask"
              //       : "noMappingPresent_expandedTask"
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
          </div>
        </div>
        {showVariablesModal && !props.isDrawerExpanded ? (
          <Modal
            show={showVariablesModal}
            backDropStyle={{ backgroundColor: "transparent" }}
            style={{
              top: "0%",
              // left: direction === RTL_DIRECTION ? "100%" : "-85%",
              // modified on 17/10/2023 for bug_id: 138128
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
              <VariableListReverse
                selectedVariableList={reverseVariablesList}
                setSelectedVariableList={setReverseVariablesList}
                setShowVariablesModal={setShowVariablesModal}
                isReadOnly={isReadOnly}
              />
            }
          ></Modal>
        ) : null}
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
    isDrawerExpanded: state.isDrawerExpanded.isDrawerExpanded,
    openTemplateFlag: state.openTemplateReducer.openFlag,
  };
};

export default connect(mapStateToProps, null)(ReverseForVariables);
