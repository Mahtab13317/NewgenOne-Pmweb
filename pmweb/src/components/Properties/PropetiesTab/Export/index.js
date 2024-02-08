import React, { useState, useEffect } from "react";
import axios from "axios";
import { connect, useDispatch, useSelector } from "react-redux";
import { store, useGlobalState } from "state-pool";
import { useTranslation } from "react-i18next";
import styles from "./index.module.css";
import { Tab, Tabs } from "@material-ui/core";
import { TabPanel } from "../../../ProcessSettings";
import TableDetails from "./TableDetails";
import FileDetails from "./FileDetails";
import {
  EXPORT_CSV_FILE_TYPE,
  EXPORT_DAILY_FILE_MOVE,
  EXPORT_FIXED_LENGTH_FIELD_TYPE,
  propertiesLabel,
  SERVER_URL,
  ENDPOINT_GET_ACTIVITY_PROPERTY,
  ERROR_MANDATORY,
} from "../../../../Constants/appConstants";
import {
  ActivityPropertyChangeValue,
  setActivityPropertyChange,
} from "../../../../redux-store/slices/ActivityPropertyChangeSlice";
import TabsHeading from "../../../../UI/TabsHeading";
import { isReadOnlyFunc } from "../../../../utility/CommonFunctionCall/CommonFunctionCall";
import { setToastDataFunc } from "../../../../redux-store/slices/ToastDataHandlerSlice";
import {
  ActivityPropertySaveCancelValue,
  setSave,
} from "../../../../redux-store/slices/ActivityPropertySaveCancelClicked";
import { LatestVersionOfProcess } from "../../../../utility/abstarctView/checkLatestVersion";

function Export(props) {
  const { openProcessType, openProcessID } = props;
  let { t } = useTranslation();
  const dispatch = useDispatch();
  const saveCancelStatus = useSelector(ActivityPropertySaveCancelValue);
  const allTabStatus = useSelector(ActivityPropertyChangeValue);
  const globalActivityData = store.getState("activityPropertyData");
  const loadedProcessData = store.getState("loadedProcessData"); //current process data clicked
  const [localLoadedProcessData] = useGlobalState(loadedProcessData); // State that stores the open process data of the currently open process.
  const [localActivityPropertyData, setLocalActivityPropertyData] =
    useGlobalState(globalActivityData); // State that stores the local activity property data.
  const [fields, setFields] = useState([]); // State that stores the list of all the field (column) names.
  const [value, setValue] = useState(0); // State that stores the value of the selected tab.
  const [activityData, setActivityData] = useState({}); // State that stores the export (export info) data.
  const [varAndConstList, setVarAndConstList] = useState([]); // State that stores the list of variables and constants.
  const [tableName, setTableName] = useState(""); // State that stores the table name for export workstep.
  const [error, setError] = useState({});
  let isReadOnly =
    props.openTemplateFlag ||
    isReadOnlyFunc(
      localLoadedProcessData,
      props.cellCheckedOut,
      props.cellLaneId
    ) || // Variable (Boolean) that tells if the process is readonly or not.
    LatestVersionOfProcess(localLoadedProcessData?.Versions) !==
      +localLoadedProcessData?.VersionNo; // modified on 05/09/2023 for BugId 136103;

  // Function that checks export save validation.
  const checkExportSaveValidation = (showMessage) => {
    let hasError = false;
    if (tableName === null || tableName?.trim() === "") {
      if (showMessage) {
        setError({
          ...error,
          tableName: {
            statement: t("mandatoryFieldStatement"),
            severity: "error",
            errorType: ERROR_MANDATORY,
          },
        });
      }
      hasError = true;
    }
    return hasError;
  };

  // Function that checks if the mapping data has atleast one mapped field for any mapped field.
  const checkMappingData = () => {
    let hasAtleastOneMapping = false;
    const mappingDataArr = activityData.mappingList;
    mappingDataArr?.forEach((element) => {
      if (element.m_objExportMappedFieldInfo.mappedFieldName !== "") {
        hasAtleastOneMapping = true;
      }
    });
    return hasAtleastOneMapping;
  };

  // Function that checks if the file details mandatory fields are filled or not.
  const checkFileDetailsFields = () => {
    let areMandatoryDetailsFilled = true;
    const fileDetails = activityData.fileInfo;
    if (
      fileDetails.csvFileName === "" ||
      fileDetails.filePath === "" ||
      fileDetails.fieldSep === "" ||
      fileDetails.noOfRecord === ""
    ) {
      areMandatoryDetailsFilled = false;
    }
    return areMandatoryDetailsFilled;
  };

  // Function that is used for validating export workstep.
  const validationFunctions = (showMessage) => {
    let isError = false;
    if (!checkExportSaveValidation(showMessage)) {
      if (activityData?.fieldList?.length > 0) {
        if (checkMappingData()) {
          if (checkFileDetailsFields()) {
            if (showMessage) {
              dispatch(
                setActivityPropertyChange({
                  [propertiesLabel.Export]: {
                    isModified: true,
                    hasError: false,
                  },
                })
              );
            }
          } else {
            isError = true;
            if (showMessage) {
              handleChange(null, 1);
              dispatch(
                setToastDataFunc({
                  message: t("mandatoryErrorStatement"),
                  severity: "error",
                  open: true,
                })
              );
            }
          }
        } else {
          isError = true;
          if (showMessage) {
            dispatch(
              setToastDataFunc({
                message: t("pleaseMapFields"),
                severity: "error",
                open: true,
              })
            );
          }
        }
      } else {
        isError = true;
        if (showMessage) {
          dispatch(
            setToastDataFunc({
              message: t("pleaseCreateTableColumns"),
              severity: "error",
              open: true,
            })
          );
        }
      }
    } else {
      isError = true;
    }
    return isError;
  };

  // Function that runs when the saveCancelStatus.SaveClicked, saveCancelStatus.CancelClicked values change and checks validation.
  useEffect(() => {
    if (saveCancelStatus.SaveClicked) {
      validationFunctions(true);
      dispatch(setSave({ SaveClicked: false }));
    }
  }, [saveCancelStatus.SaveClicked, saveCancelStatus.CancelClicked]);

  useEffect(() => {
    setGlobalData(activityData);
    let errorFlag = validationFunctions(false);
    if (errorFlag) {
      dispatch(
        setActivityPropertyChange({
          [propertiesLabel.Export]: {
            isModified: allTabStatus[propertiesLabel.Export]?.isModified,
            hasError: true,
          },
        })
      );
    } else {
      dispatch(
        setActivityPropertyChange({
          [propertiesLabel.Export]: {
            isModified: allTabStatus[propertiesLabel.Export]?.isModified,
            hasError: false,
          },
        })
      );
    }
  }, [activityData]);

  // Function to set global data when the user does any action.
  const setGlobalData = (actData) => {
    let temp = JSON.parse(JSON.stringify(localActivityPropertyData));
    temp.ActivityProperty.exportInfo = { ...actData };
    setLocalActivityPropertyData(temp);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.Export]: {
          isModified: true,
          hasError: allTabStatus[propertiesLabel.Export]?.hasError,
        },
      })
    );
  };

  // Function that returns the get activity data of the currently open activity.
  const getOriginalActivityData = async () => {
    return await axios.get(
      SERVER_URL +
        ENDPOINT_GET_ACTIVITY_PROPERTY +
        localLoadedProcessData.ProcessDefId +
        "/" +
        localLoadedProcessData.ProcessType +
        "/" +
        localLoadedProcessData.VersionNo +
        "/" +
        localLoadedProcessData.ProcessName +
        "/" +
        localLoadedProcessData.ProcessVariantType +
        "/" +
        props.cellID
    );
  };

  // Function that runs when the component loads and localLoadedProcessData.DynamicConstant & localLoadedProcessData.Variable changes.
  useEffect(() => {
    let tempArr = [];
    localLoadedProcessData?.DynamicConstant?.forEach((element) => {
      let tempObj = {
        VariableName: element.ConstantName,
        VariableScope: "C",
      };
      tempArr.push(tempObj);
    });
    localLoadedProcessData?.Variable?.forEach((element) => {
      tempArr.push(element);
    });
    setVarAndConstList(tempArr);
  }, [
    localLoadedProcessData?.DynamicConstant,
    localLoadedProcessData?.Variable,
  ]);

  // Function to handle tab change.
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  // Function that runs when the component loads.
  useEffect(() => {
    if (localActivityPropertyData) {
      // code edited on 14 Feb 2023 for BugId 123848
      let tempLocalActProperty = JSON.parse(
        JSON.stringify(localActivityPropertyData)
      );
      let temp = tempLocalActProperty?.ActivityProperty?.exportInfo
        ? JSON.parse(
            JSON.stringify(tempLocalActProperty?.ActivityProperty?.exportInfo)
          )
        : {};
      if (
        temp?.mappingList?.length === 0 &&
        (temp?.tableName === null || temp?.tableName === "") &&
        temp?.mappingList?.length === 0 &&
        temp?.dbType === "online"
      ) {
        temp.fileInfo.fileType = EXPORT_CSV_FILE_TYPE;
        temp.fileInfo.csvType = EXPORT_FIXED_LENGTH_FIELD_TYPE;
        temp.fileInfo.fileExpiryTrig = EXPORT_DAILY_FILE_MOVE;
      }
      temp.dbName = "(Local)";
      temp.dbType = "offLine";
      setActivityData(temp);
    }
  }, []);

  return (
    <div>
      <TabsHeading heading={props?.heading} />
      <div className={styles.tabStyles}>
        <Tabs
          value={value}
          onChange={handleChange}
          TabIndicatorProps={{ style: { background: "#0072C5" } }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleChange();
              e.stopPropagation();
            }
          }}
        >
          <Tab
            id="pmweb_Export_TableDetailsTab"
            tabIndex={0}
            className={styles.tabLabel}
            label={t("tableDetails")}
          />
          <Tab
            id="pmweb_Export_FileDetailsTab"
            tabIndex={0}
            className={styles.tabLabel}
            label={t("fileDetails")}
          />
        </Tabs>
      </div>
      <div className={styles.tabPanelStyles}>
        <TabPanel value={value} index={0}>
          <TableDetails
            openProcessType={openProcessType}
            openProcessID={openProcessID}
            activityData={activityData}
            localActivityPropertyData={localActivityPropertyData}
            getOriginalActivityData={getOriginalActivityData}
            fields={fields}
            setFields={setFields}
            isReadOnly={isReadOnly}
            documentList={localLoadedProcessData.DocumentTypeList}
            variablesList={varAndConstList}
            setActivityData={setActivityData}
            handleChange={handleChange}
            setGlobalData={setGlobalData}
            tableName={tableName}
            setTableName={setTableName}
            error={error}
          />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <FileDetails
            data={activityData && activityData.fileInfo}
            setActivityData={setActivityData}
            setGlobalData={setGlobalData}
            fields={fields}
            isReadOnly={isReadOnly}
          />
        </TabPanel>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    showDrawer: state.showDrawerReducer.showDrawer,
    cellID: state.selectedCellReducer.selectedId,
    cellName: state.selectedCellReducer.selectedName,
    openProcessType: state.openProcessClick.selectedType,
    openProcessID: state.openProcessClick.selectedId,
    cellCheckedOut: state.selectedCellReducer.selectedCheckedOut,
    cellLaneId: state.selectedCellReducer.selectedActLaneId,
    openTemplateFlag: state.openTemplateReducer.openFlag,
  };
};

export default connect(mapStateToProps, null)(Export);
