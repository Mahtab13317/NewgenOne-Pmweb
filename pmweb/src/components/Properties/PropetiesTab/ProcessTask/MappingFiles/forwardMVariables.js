// Changes made to solve Bug 126180 - 	regression>>Process task>> mapping variables and document are not displayed in collapsed mode

import React, { useState, useEffect } from "react";
import CommonTabHeader from "../commonHeader";
import { useTranslation } from "react-i18next";
import { store, useGlobalState } from "state-pool";
import {
  Grid,
  MenuItem,
  Tooltip,
  Typography,
  makeStyles,
} from "@material-ui/core";
import { connect, useDispatch, useSelector } from "react-redux";
import {
  RTL_DIRECTION,
  headerHeight,
  propertiesLabel,
} from "../../../../../Constants/appConstants";
import { setActivityPropertyChange } from "../../../../../redux-store/slices/ActivityPropertyChangeSlice";
import Modal from "../../../../../UI/Modal/Modal";
import VariableList from "../MappingLists/variableListForward";
import deleteImage from "../../../../../assets/icons/Delete.svg";
import "./index.css";
import TabsHeading from "../../../../../UI/TabsHeading";
import { getVarDetails } from "../../../../../utility/CommonFunctionCall/CommonFunctionCall";
import { LatestVersionOfProcess } from "../../../../../utility/abstarctView/checkLatestVersion";
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

function ForwardForVariables(props) {
  // Process Data
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const classes = useStyles({ direction });
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  // Activity Data
  const loadedActivityPropertyData = store.getState("activityPropertyData");
  const [localLoadedActivityPropertyData, setlocalLoadedActivityPropertyData] =
    useGlobalState(loadedActivityPropertyData);
  // States for this File
  const [forwardVariablesList, setForwardVariablesList] = useState(null);
  const dispatch = useDispatch();
  const [showVariablesModal, setShowVariablesModal] = useState(false);
    // changes added for bug_id: 134226
  const windowInnerHeight = useSelector(
    (state) => state.setWindowInnerHeight.windowInnerHeight
  );
  let isReadOnly =
    props.openTemplateFlag ||
    LatestVersionOfProcess(localLoadedProcessData?.Versions) !==
      +localLoadedProcessData?.VersionNo; // modified on 05/09/2023 for BugId 136103;

  const saveCancelStatus = useSelector(ActivityPropertySaveCancelValue);

  // code edited on 26 April 2023 for BugID 127490 - process task>>while removing one variable from mapping all are getting removed
  useEffect(() => {
    let temp = [];
    if (localLoadedActivityPropertyData)
      temp = localLoadedActivityPropertyData?.m_objPMSubProcess?.fwdVarMapping;
    setForwardVariablesList(temp);
  }, [localLoadedActivityPropertyData]);

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
    temp?.m_objPMSubProcess?.fwdVarMapping.map((ep) => {
      if (ep.importedFieldName == el.importedFieldName) {
        ep.mappedFieldName = event.target.value;
        ep.mappedVarId = getVarDetails(
          localLoadedProcessData?.Variable,
          event.target.value
        ).VariableId;
        ep.mappedVarFieldId = getVarDetails(
          localLoadedProcessData?.Variable,
          event.target.value
        ).VarFieldId;
        ep.displayName = event.target.value;
      }
    });

    setlocalLoadedActivityPropertyData(temp);
  };

  // code edited on 26 April 2023 for BugID 127490 - process task>>while removing one variable from mapping all are getting removed
  const deleteVariablesFromList = (element) => {
    // Deleting Document from getActivityAPI Call
    let tempLocalState = { ...localLoadedActivityPropertyData };
    let forwardIncomingDocsList =
      localLoadedActivityPropertyData.m_objPMSubProcess.fwdVarMapping;
    forwardIncomingDocsList?.map((document, index) => {
      if (document.importedFieldName === element.importedFieldName) {
        forwardIncomingDocsList.splice(index, 1);
      }
    });
    tempLocalState.m_objPMSubProcess.fwdVarMapping = [
      ...forwardIncomingDocsList,
    ];
    setlocalLoadedActivityPropertyData(tempLocalState);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.fwdVarMappingProcessTask]: {
          isModified: true,
          hasError: false,
        },
      })
    );
  };

  //Added on 26/06/2023, bug_id:130721

  const validateFunc = () => {
    let temp = { ...localLoadedActivityPropertyData };
    // temp.m_objPMSubProcess.fwdVarMapping = selectedVariables;
    let isAllmapped = true;
    let isEmpty = false;
    if (temp?.m_objPMSubProcess?.fwdVarMapping?.length > 0) {
      temp?.m_objPMSubProcess?.fwdVarMapping.map((el) => {
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

    //Added on 31/08/2023, bug_id:135401
    let isAllRevMapped = true;
    temp?.m_objPMSubProcess?.revVarMapping.map((el) => {
      if (el.mappedFieldName == null) {
        isAllRevMapped = false;
      } else {
        isAllRevMapped = true;
      }
    });

    //till here for bug_id:135401

    //Modified on 04/09/2023, bug_id:135315
    return {
      status: isAllmapped,
      value: temp,
      revStatus: isAllRevMapped,
      isEmptyMap: isEmpty,
    };
    //till here for bug_id:135315

    //Modified on 31/08/2023, bug_id:135401
    //return { status: isAllmapped, value: temp, revStatus: isAllRevMapped };

    //till here for bug_id:135401

    // return { status: isAllmapped, value: temp };
  };

  useEffect(() => {
    if (saveCancelStatus.SaveClicked) {
      // Setting in the Activity Property Call

      const checkValidate = validateFunc();

      //Modified on 04/09/2023, bug_id:135315

      if (checkValidate.isEmptyMap) {
        dispatch(
          setToastDataFunc({
            message: `${t("PleaseDefineAtleastOneForwardMapping")}`,
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
        if (checkValidate.status && checkValidate.revStatus) {
          setlocalLoadedActivityPropertyData(checkValidate.value);
          // dispatch(setSave({ SaveClicked: false }));
        } else if (!checkValidate.revStatus) {
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
        } else {
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
        }
      }
      //till here for bug_id:135315

      //Modified on 31/08/2023, bug_id:135401
      /*  if (checkValidate.status && checkValidate.revStatus) {
        setlocalLoadedActivityPropertyData(checkValidate.value);
        // dispatch(setSave({ SaveClicked: false }));
      } else if (!checkValidate.revStatus) {
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
      } else {
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
      } */

      //till here for bug_id:135401

      /* if (checkValidate.status ) {
        setlocalLoadedActivityPropertyData(checkValidate.value);
        // dispatch(setSave({ SaveClicked: false }));
      }  else {
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
      } */
    }
  }, [saveCancelStatus.SaveClicked]);

  useEffect(() => {
    const checkValidate = validateFunc();
    if (checkValidate.isEmptyMap) {
      dispatch(
        setActivityPropertyChange({
          [propertiesLabel.fwdVarMappingProcessTask]: {
            isModified: true,
            hasError: true,
          },
        })
      );
    } else {
      if (checkValidate.status) {
        dispatch(
          setActivityPropertyChange({
            [propertiesLabel.fwdVarMappingProcessTask]: {
              isModified: true,
              hasError: false,
            },
          })
        );
      } else if (!checkValidate.revStatus) {
        dispatch(
          setActivityPropertyChange({
            [propertiesLabel.revVarMappingProcessTask]: {
              isModified: true,
              hasError: true,
            },
          })
        );
      } else {
        dispatch(
          setActivityPropertyChange({
            [propertiesLabel.fwdVarMappingProcessTask]: {
              isModified: true,
              hasError: true,
            },
          })
        );
      }
    }
  }, [localLoadedActivityPropertyData]);

  //code ends for bug_id:130721

  const oneLineForMap = () => {
    return forwardVariablesList?.map((el, index) => {
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
                fontSize: "12px",
                padding: "5px", //Code added on 14-09-2023 for bug 136220
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
            >
              {/* Replaced Select component with CustomizedDropdown for Bug 127016 on 26-05-23*/}
            {/* <CustomizedDropdown
                id={`pmweb_ForwardMVariables_MappedField_${index}`}
                inputProps={{ "aria-label": "Without label" }}
                value={el.mappedFieldName}
                style={{
                  width: "100%",
                  height: "34px",
                  border: "1px solid #CECECE",
                  borderRadius: "1px",
                  opacity: "1",
                }}
                disabled={isReadOnly}
                onChange={(e) => handleMappingChange(el, e)}
                className="selectDateTime_options"
                isNotMandatory={true}
              >
                {/*code edited on 16 feb  for BugId 122517 */}
            {/* {localLoadedProcessData?.Variable?.filter(
                  (d) => d.VariableType === el.importedFieldDataType
                ).map((variable) => {
                  return (
                    <MenuItem value={variable.VariableName}>
                      <em style={{ fontSize: "12px", fontStyle: "normal" }}>
                        {variable.VariableName}
                      </em>
                    </MenuItem>
                  );
                })}
              </CustomizedDropdown> */}
            {/* Till here for Bug 127016 */}
            {/* </div>
            <div style={{ marginTop: "9px", flex: "0.2", textAlign: "center" }}>
              {/* <DeleteIcon
                className="deleteIconProcessTask"
                style={{
                  cursor: "pointer",
                }}
                onClick={() => deleteVariablesFromList(el)}
              /> */}
            {/* Added tooltip for delete icon for Bug 127016 on 26-05-23*/}
            {/* <LightTooltip
                id={`pmweb_ForwardMVariables_DeleteTooltip_${index}`}
                arrow={true}
                placement="bottom-start"
                title={t("delete")}
              >
                <img
                  id={`pmweb_ForwardMVariables_DeleteVarIcon_${index}`}
                  src={deleteImage}
                  style={{ width: "12px", height: "12px", cursor: "pointer" }}
                  onClick={() => deleteVariablesFromList(el)}
                  alt={t("DELETE")}
                />
              </LightTooltip> */}
            {/* Till here for Bug 127016*/}
            {/* </div>  */}
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
              {/* Replaced Select component with CustomizedDropdown for Bug 127016 on 26-05-23*/}
              <CustomizedDropdown
                id={`pmweb_ForwardMVariables_MappedField_${index}`}
                inputProps={{ "aria-label": "Without label" }}
                value={el.mappedFieldName}
                style={{
                  width: "100%",
                  height: "34px",
                  border: "1px solid #CECECE",
                  borderRadius: "1px",
                  opacity: "1",
                }}
                disabled={isReadOnly}
                onChange={(e) => handleMappingChange(el, e)}
                className="selectDateTime_options"
                isNotMandatory={true}
                relativeStyle={{
                  width: "100%",
                }}
              >
                {/*code edited on 16 feb  for BugId 122517 */}
                {localLoadedProcessData?.Variable?.filter(
                  (d) => d.VariableType === el.importedFieldDataType
                ).map((variable) => {
                  return (
                    <MenuItem value={variable.VariableName}>
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
                        {variable.VariableName}
                      </em>
                    </MenuItem>
                  );
                })}
              </CustomizedDropdown>
            </Grid>
            <Grid
              item
              xs={1}
              className={classes.flex}
              justifyContent="flex-start"
            >
              <LightTooltip
                id={`pmweb_ForwardMVariables_DeleteTooltip_${index}`}
                arrow={true}
                placement="bottom-start"
                title={t("delete")}
              >
                <img
                  id={`pmweb_ForwardMVariables_DeleteVarIcon_${index}`}
                  src={deleteImage}
                  // style={{ width: "12px", height: "12px", cursor: "pointer" }}
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
            <VariableList
              selectedVariableList={forwardVariablesList}
              setSelectedVariableList={setForwardVariablesList}
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
            overflowY: props.isDrawerExpanded ? "scroll" : "hidden",
            paddingLeft: "0.58vw", //Code added on 14-09-2023 for bug 136220
          }}
        >
          <CommonTabHeader
            tabType="ForwardForVariables"
            setShowVariablesModal={setShowVariablesModal}
            isDrawerExpanded={props.isDrawerExpanded}
            isReadOnly={isReadOnly}
            hideTargetCurrentHeader={forwardVariablesList?.length === 0}
          />
          {forwardVariablesList?.length > 0 ? (
            oneLineForMap()
          ) : (
            // Code modified on 11-10-23 added grid for responsiveness for bug 139108
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
            // till here for bug 139108
          )}
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
              <VariableList
                selectedVariableList={forwardVariablesList}
                setSelectedVariableList={setForwardVariablesList}
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

export default connect(mapStateToProps, null)(ForwardForVariables);
