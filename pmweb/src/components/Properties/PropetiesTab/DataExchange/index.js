// #BugID - 112517
// #BugDescription - Added a condition for key that was not coming from backend in case of no rules.
// #BugID - 112527
// #BugDescription - Added new parameter to api to get all the tables.
import React, { useState, useEffect } from "react";
import styles from "./index.module.css";
import { connect, useDispatch, useSelector } from "react-redux";
import { store, useGlobalState } from "state-pool";
import {
  Checkbox,
  InputBase,
  MenuItem,
  useMediaQuery,
} from "@material-ui/core";
import * as actionCreators from "../../../../redux-store/actions/Properties/showDrawerAction.js";
import CustomizedDropdown from "../../../../UI/Components_With_ErrrorHandling/Dropdown";
import clsx from "clsx";
import axios from "axios";
import { useTranslation } from "react-i18next";
import {
  SERVER_URL,
  ENDPOINT_GET_EXISTING_TABLES,
  propertiesLabel,
  ENDPOINT_TEST_CONNECTION,
  ENDPOINT_GET_CURRENT_CABINETNAME,
  RTL_DIRECTION,
} from "../../../../Constants/appConstants";
import PropertyDetails from "./PropertyDetails";
import {
  getExportRuleJSON,
  getImportRuleJSON,
  getMultiSelectedTableNames,
  getSelectedTableName,
} from "./CommonFunctions";
import OperationStrip from "./OperationStrip";
import {
  ActivityPropertySaveCancelValue,
  setSave,
} from "../../../../redux-store/slices/ActivityPropertySaveCancelClicked";
import {
  ActivityPropertyChangeValue,
  setActivityPropertyChange,
} from "../../../../redux-store/slices/ActivityPropertyChangeSlice";
import { setToastDataFunc } from "../../../../redux-store/slices/ToastDataHandlerSlice";
import TabsHeading from "../../../../UI/TabsHeading";
import { isReadOnlyFunc } from "../../../../utility/CommonFunctionCall/CommonFunctionCall";
import { LatestVersionOfProcess } from "../../../../utility/abstarctView/checkLatestVersion";

function DataExchange(props) {
  let { t } = useTranslation();
  const dispatch = useDispatch();
  const direction = `${t("HTML_DIR")}`;
  const { openProcessType, openProcessID, isDrawerExpanded, expandDrawer } =
    props;
  const saveCancelStatus = useSelector(ActivityPropertySaveCancelValue);
  const allTabStatus = useSelector(ActivityPropertyChangeValue);
  const loadedProcessData = store.getState("loadedProcessData"); //current processdata clicked
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const globalActivityData = store.getState("activityPropertyData");
  const [localActivityPropertyData, setLocalActivityPropertyData] =
    useGlobalState(globalActivityData); // State that stores the activity property data for the current open properties saved in the global state.
  const [loggedInCabinet, setLoggedInCabinet] = useState(true);
  const [currentCabinetName, setCurrentCabinetName] = useState(""); // State that stores the current cabinet name in which the user is logged in.
  const [cabinetName, setCabinetName] = useState(""); // State that stores the cabinet name which the user fills in the input field.
  const [operationType, setOperationType] = useState("1"); // State that stores the operation type of the data exchange rule.
  const [isCabinetConnected, setIsCabinetConnected] = useState(false); // State that stores the boolean for cabinet connection.
  const [opList, setOpList] = useState([]); // State that stores the data exchange operations data.
  const [variables, setVariables] = useState([]); // List of all variables.
  const [selectedOp, setSelectedOp] = useState(0); // Selected rule value.
  const [existingTableData, setExistingTableData] = useState([]); // List of all existing tables.
  const [filteredVariables, setFilteredVariables] = useState([]); // List of all filtered "U" and "I" scope variables.
  const [tableDetails, setTableDetails] = useState([]); // State that stores all the selected table name for both complex isNested and not isNested and not complex cases.
  const [activityOpType, setActivityOpType] = useState(""); // State that stores the selected data exchange existing activity operation type.
  // changes added for bug_id: 134226
  const windowInnerHeight = useSelector(
    (state) => state.setWindowInnerHeight.windowInnerHeight
  );
  const isTabScreen = useMediaQuery("(max-width: 999px)");

  // to store boolean for check if the process is readonly or not.
  let isReadOnly =
    props.openTemplateFlag ||
    isReadOnlyFunc(
      localLoadedProcessData,
      props.cellCheckedOut,
      props.cellLaneId
    ) ||
    LatestVersionOfProcess(localLoadedProcessData?.Versions) !==
      +localLoadedProcessData?.VersionNo; // modified on 05/09/2023 for BugId 136103;

  const operationTypes = [
    { operationType: "2", operationLabel: t("export") },
    { operationType: "1", operationLabel: t("import") },
  ];

  // Function to set global data when the user does any action.
  const setGlobalData = (actData) => {
    let temp = JSON.parse(JSON.stringify(localActivityPropertyData));
    temp.ActivityProperty.objDataExchange.dbRules = actData;
    setLocalActivityPropertyData(temp);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.Export]: { isModified: true, hasError: false },
      })
    );
  };

  // Function that runs when a rule is selected.
  const handleSelectedOp = (index) => {
    setSelectedOp(index);
    expandDrawer(true);
  };

  // Function that gets called when the activity property data changes.
  useEffect(() => {
    if (localActivityPropertyData) {
      if (
        localActivityPropertyData?.ActivityProperty?.objDataExchange?.hasOwnProperty(
          "dbRules"
        )
      ) {
        setOpList(
          localActivityPropertyData?.ActivityProperty?.objDataExchange?.dbRules
        );
        let temp = [];
        localActivityPropertyData?.ActivityProperty?.objDataExchange?.dbRules?.forEach(
          (el) => {
            let obj = { selectedTableName: "", selectedTableNames: [] };
            if (
              localActivityPropertyData?.ActivityProperty?.objDataExchange
                ?.m_strSelectedOption !== ""
            ) {
              obj = {
                selectedTableName:
                  localActivityPropertyData?.ActivityProperty?.objDataExchange
                    ?.m_strSelectedOption === "1"
                    ? getSelectedTableName(el?.m_arrMappingValuesInfo)
                    : getSelectedTableName(el?.m_arrExportMappingValuesInfo),
                selectedTableNames: [],
              };
            }

            temp.push(obj);
          }
        );
        setTableDetails(temp);
      }
      if (
        localActivityPropertyData?.ActivityProperty?.objDataExchange
          ?.m_strSelectedOption !== ""
      ) {
        setOperationType(
          localActivityPropertyData?.ActivityProperty?.objDataExchange
            ?.m_strSelectedOption
        );
        setActivityOpType(
          localActivityPropertyData?.ActivityProperty?.objDataExchange
            ?.m_strSelectedOption
        );
      } else {
        setActivityOpType(operationType);
      }
    }
  }, [localActivityPropertyData?.ActivityProperty]);

  // Function that runs when the saveCancelStatus.SaveClicked, saveCancelStatus.CancelClicked values change and checks validation.
  useEffect(() => {
    if (saveCancelStatus.SaveClicked) {
      if (
        checkAllRuleData().isMappingDataFilled &&
        checkAllRuleData().isTableRelationDataFilled
      ) {
        dispatch(
          setActivityPropertyChange({
            [propertiesLabel.dataExchange]: {
              isModified: true,
              hasError: false,
            },
          })
        );
      } else {
        dispatch(
          setActivityPropertyChange({
            [propertiesLabel.dataExchange]: {
              isModified: true,
              hasError: true,
            },
          })
        );
        const ruleIndex = checkAllRuleData().ruleIndex + 1;
        const isMappingFilled = checkAllRuleData().isMappingDataFilled;
        const isTableRelationFilled =
          checkAllRuleData().isTableRelationDataFilled;
        if (!isMappingFilled && !isTableRelationFilled) {
          dispatch(
            setToastDataFunc({
              message: `${t("pleaseDefineMappingAndRelation")}${ruleIndex}`,
              severity: "error",
              open: true,
            })
          );
        } else if (!isMappingFilled) {
          dispatch(
            setToastDataFunc({
              message: `${t("pleaseDefineMapping")}${ruleIndex}`,
              severity: "error",
              open: true,
            })
          );
        } else if (!isTableRelationFilled) {
          dispatch(
            setToastDataFunc({
              message: `${t("pleaseDefineRelationMapping")}${ruleIndex}`,
              severity: "error",
              open: true,
            })
          );
        }
      }
      dispatch(setSave({ SaveClicked: false }));
    }
  }, [saveCancelStatus.SaveClicked, saveCancelStatus.CancelClicked]);

  useEffect(() => {
    if (
      checkAllRuleData().isMappingDataFilled &&
      checkAllRuleData().isTableRelationDataFilled
    ) {
      dispatch(
        setActivityPropertyChange({
          [propertiesLabel.dataExchange]: {
            isModified: allTabStatus[propertiesLabel.dataExchange]?.isModified,
            hasError: false,
          },
        })
      );
    } else {
      dispatch(
        setActivityPropertyChange({
          [propertiesLabel.dataExchange]: {
            isModified: allTabStatus[propertiesLabel.dataExchange]?.isModified,
            hasError: true,
          },
        })
      );
    }
  }, [opList]);

  // Function that runs when the cabinetName value changes.
  useEffect(() => {
    if (cabinetName !== "" && loggedInCabinet) {
      setGlobalCabinetDetails(-1, cabinetName);
    } else {
      setGlobalCabinetDetails(1, cabinetName);
    }
  }, [cabinetName]);

  // Function that checks if all the mandatory data is present in all rules or not.
  const checkAllRuleData = () => {
    let ruleIndex = 0;
    let isMappingDataFilled = true;
    let isTableRelationDataFilled = true;

    for (let index = 0; index < opList.length; index++) {
      const element = opList[index];
      if (element.hasOwnProperty("m_arrMappingValuesInfo")) {
        if (element.m_arrMappingValuesInfo?.length === 0) {
          ruleIndex = index;
          isMappingDataFilled = false;
          break;
        }
        if (element.m_arrTableRelationValuesInfo?.length === 0) {
          ruleIndex = index;
          isTableRelationDataFilled = false;
          break;
        }
      } else if (element.hasOwnProperty("m_arrExportMappingValuesInfo")) {
        if (element.m_arrExportMappingValuesInfo?.length === 0) {
          ruleIndex = index;
          isMappingDataFilled = false;
          break;
        }
        if (element.m_arrExTableRelationValuesInfo?.length === 0) {
          ruleIndex = index;
          isTableRelationDataFilled = false;
          break;
        }
      }
    }

    // opList?.forEach((element, index) => {
    //   if (element.hasOwnProperty("m_arrMappingValuesInfo")) {
    //     if (element.m_arrMappingValuesInfo?.length === 0) {
    //       ruleIndex = index;
    //       isMappingDataFilled = false;
    //       return;
    //     }
    //     if (element.m_arrTableRelationValuesInfo?.length === 0) {
    //       ruleIndex = index;
    //       isTableRelationDataFilled = false;
    //       return;
    //     }
    //   }
    // if (operationType === "1") {
    //   if (element.m_arrMappingValuesInfo?.length === 0) {
    //     ruleIndex = index;
    //     isMappingDataFilled = false;
    //     return;
    //   }
    //   if (element.m_arrTableRelationValuesInfo?.length === 0) {
    //     ruleIndex = index;
    //     isTableRelationDataFilled = false;
    //     return;
    //   }
    // }
    // else if (element.hasOwnProperty("m_arrExportMappingValuesInfo")) {
    //   if (element.m_arrExportMappingValuesInfo?.length === 0) {
    //     ruleIndex = index;
    //     isMappingDataFilled = false;
    //     return;
    //   }
    //   if (element.m_arrExTableRelationValuesInfo?.length === 0) {
    //     ruleIndex = index;
    //     isTableRelationDataFilled = false;
    //     return;
    //   }
    // }
    // });
    return {
      isMappingDataFilled: isMappingDataFilled,
      isTableRelationDataFilled: isTableRelationDataFilled,
      ruleIndex: ruleIndex,
    };
  };

  // Function that runs when the Variables in state pool changes.
  useEffect(() => {
    setVariables(localLoadedProcessData?.Variable);
    const filteredVars = localLoadedProcessData?.Variable.filter(
      (element) =>
        element.VariableScope === "U" || element.VariableScope === "I"
    );
    setFilteredVariables(filteredVars);
  }, [localLoadedProcessData?.Variable]);

  // Function to test the connection of a cabinet.
  const testConnectionAPICall = () => {
    axios
      .get(SERVER_URL + ENDPOINT_TEST_CONNECTION + `/${cabinetName}`)
      .then((res) => {
        if (res?.data?.Status === 0) {
          setIsCabinetConnected(true);
          dispatch(
            setToastDataFunc({
              message: res?.data?.Message,
              severity: "success",
              open: true,
            })
          );
        }
      });
  };

  // Function that runs when the component loads.
  useEffect(() => {
    getCurrentCabinetName();
  }, []);

  // Function to fetch existing table data by making an API call.
  const getExistingTableData = () => {
    if (cabinetName.trim() !== "") {
      if (loggedInCabinet) {
        existingTableAPICall(
          `/${openProcessID}` +
            `/${openProcessType}` +
            `?cabinetName=${cabinetName}`
        );
      } else if (isCabinetConnected) {
        existingTableAPICall(
          `/${openProcessID}` +
            `/${openProcessType}` +
            `?cabinetName=${cabinetName}`
        );
      } else {
        dispatch(
          setToastDataFunc({
            message: t("kindlyTestTheConnection"),
            severity: "error",
            open: true,
          })
        );
      }
    } else {
      dispatch(
        setToastDataFunc({
          message: t("kindlyEnterACabinetName"),
          severity: "error",
          open: true,
        })
      );
    }
  };

  // Function that has the api call for getting existing tables.
  const existingTableAPICall = (existingTableURL) => {
    axios
      .get(SERVER_URL + ENDPOINT_GET_EXISTING_TABLES + existingTableURL)
      .then((res) => {
        if (res.status === 200) {
          let modifiedArray = [];
          res?.data?.Table?.forEach((element, index) => {
            let tempObj = {
              id: index + 1,
              TableName: element.TableName,
              TableType: element.TableType,
            };
            modifiedArray.push(tempObj);
          });
          setExistingTableData(modifiedArray);
        }
      })
      .catch((err) => console.log(err));
  };

  // Function to set global cabinet details.
  const setGlobalCabinetDetails = (configId, configName) => {
    let temp = JSON.parse(JSON.stringify(localActivityPropertyData));
    temp.ActivityProperty.objDataExchange.m_iConfigId = configId;
    temp.ActivityProperty.objDataExchange.m_sConfigName = configName;
    setLocalActivityPropertyData(temp);
  };

  // Function to fetch current cabinet name using which the user has logged in.
  const getCurrentCabinetName = () => {
    axios
      .get(SERVER_URL + ENDPOINT_GET_CURRENT_CABINETNAME)
      .then((res) => {
        if (res.status === 200) {
          setCurrentCabinetName(res.data);
          setCabinetName(res.data);
          existingTableAPICall(
            `/${openProcessID}` +
              `/${openProcessType}` +
              `?cabinetName=${res.data}`
          );
        }
      })
      .catch((err) => console.log(err));
  };

  // Function that filters the variables based on the operation type.
  const getFilteredVariableList = () => {
    if (activityOpType === "1") {
      return variables?.filter(
        (element) =>
          (element.VariableScope === "U" || element.VariableScope === "I") &&
          element.VariableType === "3"
      );
    } else {
      return variables?.filter(
        (element) =>
          (element.VariableScope === "U" || element.VariableScope === "I") &&
          (element.VariableType === "3" || element.VariableType === "4")
      );
    }
  };

  // Function to get the operation label of a rule based on the operation type.
  const getOperationLabel = (operationType) => {
    let operationLabel;
    if (operationType === "1") {
      operationLabel = t("import");
    } else {
      operationLabel = t("export");
    }
    return operationLabel;
  };

  // Function that gets the empty rule JSON for import and export rules.
  const getRuleJSON = () => {
    if (operationType === "1") {
      return getImportRuleJSON();
    } else {
      return getExportRuleJSON();
    }
  };

  // Function that gets called when the add new button is clicked.
  const localOpHandler = () => {
    if (checkIfAddNewOpIsValid(operationType)) {
      expandDrawer(true);
      let obj = getRuleJSON();
      let temp = [];
      if (opList?.length > 0) {
        temp = [...opList];
      }
      temp.push(obj);
      setOpList(temp);
      setGlobalData(temp);
      setActivityOpType(operationType);
      const tableObj = { selectedTableName: "", selectedTableNames: [] };
      let tempArr = [...tableDetails];
      tempArr.push(tableObj);
      setTableDetails(tempArr);
      setSelectedOp(temp?.length - 1);
      scrollToBottom("operationDiv");
    } else {
      dispatch(
        setToastDataFunc({
          message: `${t("only")} ${
            operationType === "1" ? `${t("export")}` : `${t("import")}`
          } ${t("operationsCanBeAdded")}.`,
          severity: "error",
          open: true,
        })
      );
    }
  };

  // Function that checks if the new added operation is valid or not.
  const checkIfAddNewOpIsValid = (opType) => {
    let isValid = true;
    if (activityOpType !== "" && activityOpType !== opType) {
      isValid = false;
    }
    return isValid;
  };

  // Function to scroll to bottom of the div.
  const scrollToBottom = (id) => {
    const element = document.getElementById(id);
    element.scrollTop = element.scrollHeight;
  };

  // Function that gets called when the user deletes an existing import/export rule.
  const deleteOpHandler = (index, event) => {
    event.stopPropagation();
    let temp = [...opList];
    temp.splice(index, 1);
    setOpList(temp);
    setGlobalData(temp);
    let tempArr = [...tableDetails];
    tempArr.splice(index, 1);
    setTableDetails(tempArr);
    setSelectedOp(() => {
      if (index > 0) {
        return index - 1;
      } else {
        return 0;
      }
    });
  };

  // Function that runs when opList changes.
  useEffect(() => {
    if (opList && opList?.length > 0) {
      let opType = "";
      if (opList[0].hasOwnProperty("m_arrMappingValuesInfo")) {
        opType = "1";
      } else {
        opType = "2";
      }
      opList.forEach((element, index) => {
        if (
          opType === "1" ? element?.m_bIsNested : element?.m_bIsNestedExport
        ) {
          if (opType === "1") {
            const multiSelectedTableNamesArr = getMultiSelectedTableNames(
              element?.m_arrMappingValuesInfo,
              element?.m_arrTableRelationValuesInfo,
              element?.hasOwnProperty("m_arrDataExValuesInfo") &&
                element?.m_arrDataExValuesInfo,
              element?.hasOwnProperty("m_arrFilterStringTableImpInfo") &&
                element?.m_arrFilterStringTableImpInfo
            );
            setTableDetails((prevState) => {
              let tempArr = [...prevState];
              tempArr[index].selectedTableNames = multiSelectedTableNamesArr;
              return tempArr;
            });
          } else {
            const multiSelectedTableNamesArr = getMultiSelectedTableNames(
              element?.m_arrExportMappingValuesInfo,
              element?.m_arrExTableRelationValuesInfo,
              [],
              element?.hasOwnProperty("m_arrFilterStringTableExpInfo") &&
                element?.m_arrFilterStringTableExpInfo
            );
            setTableDetails((prevState) => {
              let tempArr = [...prevState];
              tempArr[index].selectedTableNames = multiSelectedTableNamesArr;
              return tempArr;
            });
          }
        } else {
          if (opType === "1") {
            const selectedImportTableName = getSelectedTableName(
              element?.m_arrMappingValuesInfo
            );
            setTableDetails((prevState) => {
              let temp = [...prevState];
              temp[selectedOp].selectedTableName = selectedImportTableName;
              return temp;
            });
          } else {
            const selectedExportTableName = getSelectedTableName(
              element?.m_arrExportMappingValuesInfo
            );
            if (tableDetails[selectedOp]?.selectedTableName) {
              setTableDetails((prevState) => {
                let temp = [...prevState];
                temp[selectedOp].selectedTableName = selectedExportTableName;
                return temp;
              });
            }
          }
        }
      });
    }
  }, [opList]);

  return (
    <>
      <TabsHeading heading={props?.heading} />
      <div
        className={
          isDrawerExpanded && !isTabScreen ? styles.flexRow : styles.flexColumn
        }
        style={{ background: "#F8F8F8" }}
      >
        <div
          className={clsx(
            styles.flexColumn,
            styles.cabinetDetailsDiv,
            isDrawerExpanded
              ? clsx(
                  styles.cabinetDetailsWidth,
                  isTabScreen && styles.fullWidth,
                  isTabScreen && styles.fullHeight
                )
              : styles.collapsedWidth
          )}
          // Code commented on 10-10-23 for Bug 138102
          /* code added on 6 July 2023 for issue - save and discard button hide 
          issue in case of tablet(landscape mode)*/
          // style={{
          //   height: !isDrawerExpanded
          //     ? `100%`
          //     : `calc((${windowInnerHeight}px - ${headerHeight}) - 11.5rem)`,
          // }}
          // Till here for Bug 138102
        >
          <p
            className={
              direction === RTL_DIRECTION ? styles.headingRTL : styles.heading
            }
          >
            {t("cabinetDetails")}
          </p>
          <div className={styles.flexRow}>
            <Checkbox
              disabled={isReadOnly}
              id="DE_Logged_in_Cabinet_Checkbox"
              checked={loggedInCabinet}
              size="small"
              inputProps={{ "aria-label": "Logged In Cabinet" }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setExistingTableData([]);
                  setLoggedInCabinet((prevState) => {
                    setIsCabinetConnected(false);
                    if (!prevState) {
                      setCabinetName(currentCabinetName);
                    } else {
                      setCabinetName("");
                    }
                    return !prevState;
                  });
                  e.stopPropagation();
                }
              }}
              onChange={() => {
                setExistingTableData([]);
                setLoggedInCabinet((prevState) => {
                  setIsCabinetConnected(false);
                  if (!prevState) {
                    setCabinetName(currentCabinetName);
                  } else {
                    setCabinetName("");
                  }
                  return !prevState;
                });
              }}
            />
            <p className={styles.loggedInCabinetText}>{t("loggedInCabinet")}</p>
          </div>
          <div
            className={isTabScreen ? styles.flexRow : styles.flexColumn}
            style={{ marginTop: "10px" }}
          >
            <div
              className={
                isDrawerExpanded
                  ? styles.flexColumn
                  : clsx(styles.flexRow, styles.cabinetDivStyles)
              }
              style={{ marginRight: isDrawerExpanded && isTabScreen && "9.5%" }}
            >
              <div className={clsx(styles.flexColumn, styles.cabinetNameDiv)}>
                <p className={styles.fieldTitle}>{t("cabinetName")}</p>
                <InputBase
                  id="DE_Cabinet_Name_Field"
                  variant="outlined"
                  inputProps={{ "aria-label": "Cabinet Name" }}
                  className={clsx(
                    styles.cabinetNameInput,
                    loggedInCabinet && styles.cabinetNameDisabled,
                    isDrawerExpanded
                      ? styles.cabinetDetailsInputWidthExpanded
                      : styles.cabinetDetailsInputWidthCollapsed
                  )}
                  onChange={(event) => {
                    setCabinetName(event.target.value);
                    setIsCabinetConnected(false);
                  }}
                  value={cabinetName}
                  disabled={loggedInCabinet || isReadOnly}
                />
              </div>
              <div
                className={clsx(
                  styles.flexColumn,
                  !isDrawerExpanded && styles.testConnectionBtnDivCollapsed
                )}
              >
                {!isReadOnly && (
                  <button
                    id="pmweb_DataExchange_TestConnectionBtn"
                    disabled={loggedInCabinet || cabinetName.trim() === ""}
                    className={clsx(
                      styles.blueButton,
                      direction === RTL_DIRECTION
                        ? styles.testConnectionBtnRTL
                        : styles.testConnectionBtn,
                      loggedInCabinet && styles.disabledTestConnectionBtn
                    )}
                    onClick={testConnectionAPICall}
                  >
                    {t("testConnection")}
                  </button>
                )}
                {isCabinetConnected && !loggedInCabinet && (
                  <p className={styles.connectionStatusText}>
                    {t("connected")}
                  </p>
                )}
              </div>
            </div>

            <div
              className={clsx(styles.flexColumn, styles.cabinetNameDiv)}
              style={{ width: isDrawerExpanded && isTabScreen && "25%" }}
            >
              <p className={styles.fieldTitle}>{t("selectOperation")}</p>
              <CustomizedDropdown
                disabled={isReadOnly}
                id="DE_Operation_Type_Dropdown"
                className={clsx(
                  styles.dropdown,
                  isDrawerExpanded
                    ? styles.cabinetDetailsInputWidthExpanded
                    : styles.cabinetDetailsInputWidthCollapsed
                )}
                value={operationType}
                onChange={(event) => {
                  setOperationType(event.target.value);
                  if (opList?.length === 0) {
                    setActivityOpType(event.target.value);
                  }
                }}
                isNotMandatory={true}
              >
                {operationTypes?.map((element) => {
                  return (
                    <MenuItem
                      className={styles.menuItemStyles}
                      style={{ direction: direction }}
                      value={element.operationType}
                    >
                      {element.operationLabel}
                    </MenuItem>
                  );
                })}
              </CustomizedDropdown>
            </div>
          </div>
        </div>
        <div
          className={isDrawerExpanded && styles.flexRow}
          style={{
            width: isTabScreen ? "100%" : isDrawerExpanded ? "80%" : "100%",
          }}
        >
          <div
            className={clsx(
              styles.flexColumn,
              styles.cabinetDetailsDiv,
              isDrawerExpanded
                ? isTabScreen
                  ? styles.tabOperationsWidth
                  : styles.operationsWidth
                : styles.collapsedWidth
            )}
            // Code commented on 10-10-23 for Bug 138102
            /* code added on 6 July 2023 for issue - save and discard button hide 
            issue in case of tablet(landscape mode)*/
            // style={{
            //   height: !isDrawerExpanded
            //     ? `100%`
            //     : `calc((${windowInnerHeight}px - ${headerHeight}) - 11.5rem)`,
            // }}
            // Till here for Bug 138102
          >
            <div className={clsx(styles.flexRow, styles.operationSubDiv)}>
              <p className={clsx(styles.heading, styles.listOfOpMargin)}>
                {t("listOfOperations")}
              </p>
              {!isReadOnly && (
                <button
                  id="pmweb_DataExchange_AddOperationBtn"
                  onClick={localOpHandler}
                  className={clsx(
                    styles.blueButton,
                    direction === RTL_DIRECTION
                      ? styles.addNewOperationBtnRTL
                      : styles.addNewOperationBtn
                  )}
                >
                  {t("addNew")}
                </button>
              )}
            </div>
            <div
              id="operationDiv"
              className={clsx(styles.flexColumn, styles.opScroll)}
            >
              {opList?.map((element, index) => {
                return (
                  <OperationStrip
                    index={index}
                    isNested={
                      activityOpType === "1"
                        ? element.m_bIsNested
                        : element.m_bIsNestedExport
                    }
                    handleSelectedOp={handleSelectedOp}
                    selectedOp={selectedOp}
                    getOperationLabel={getOperationLabel}
                    opType={activityOpType}
                    deleteOpHandler={deleteOpHandler}
                    tableDetails={tableDetails}
                    isReadOnly={isReadOnly}
                  />
                );
              })}
            </div>
          </div>
          {isDrawerExpanded && (
            <div
              className={clsx(
                styles.propertiesWidth,
                isTabScreen && styles.propertiesTabWidth
              )}
            >
              {opList?.length > 0 && (
                <PropertyDetails
                  operationType={activityOpType}
                  openProcessType={openProcessType}
                  openProcessID={openProcessID}
                  isReadOnly={isReadOnly}
                  getFilteredVariableList={getFilteredVariableList}
                  existingTableData={existingTableData}
                  filteredVariables={filteredVariables}
                  selectedOp={selectedOp}
                  opList={opList}
                  setOpList={setOpList}
                  setGlobalData={setGlobalData}
                  tableDetails={tableDetails}
                  setTableDetails={setTableDetails}
                  getExistingTableData={getExistingTableData}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

const mapStateToProps = (state) => {
  return {
    openProcessType: state.openProcessClick.selectedType,
    openProcessID: state.openProcessClick.selectedId,
    cellCheckedOut: state.selectedCellReducer.selectedCheckedOut,
    cellLaneId: state.selectedCellReducer.selectedActLaneId,
    isDrawerExpanded: state.isDrawerExpanded.isDrawerExpanded,
    openTemplateFlag: state.openTemplateReducer.openFlag,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    expandDrawer: (flag) => dispatch(actionCreators.expandDrawer(flag)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DataExchange);
