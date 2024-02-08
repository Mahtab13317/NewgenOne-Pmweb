import React, { useState, useEffect } from "react";
import {
  PROCESSTYPE_REGISTERED,
  RTL_DIRECTION,
  STATE_CREATED,
  userRightsMenuNames,
} from "../../Constants/appConstants";
import { Tab, Tabs, Icon, CircularProgress } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { TabPanel, useStylesCustom } from "../ProcessSettings";
import styles from "./index.module.css";
import { useSelector } from "react-redux";
import arabicStyles from "./ArabicStyles.module.css";
import DefinedConstants from "./DefinedConstants";
import BusinessVariables from "./BusinessVariables";

import BusinessVariableIcon from "../../assets/DataModalIcons/DML_BusinessVariable_Unselected.svg";
import BusinessVariableIcon_EN from "../../assets/DataModalIcons/DML_BusinessVariable_Selected.svg";
import ConstantsIcon from "../../assets/DataModalIcons/DML_Constant_Unselected.svg";
import ConstantsIcon_EN from "../../assets/DataModalIcons/DML_Constant_Selected.svg";
import DataRightsIcon from "../../assets/DataModalIcons/DML_DataRights_Unselected.svg";
import DataRightsIcon_EN from "../../assets/DataModalIcons/DML_DataRights_Selected.svg";
import DataObjectsIcon from "../../assets/DataModalIcons/DML_DataObjects_Unselected.svg";
import DataObjectsIcon_EN from "../../assets/DataModalIcons/DML_DataObjects_Selected.svg";

import { store, useGlobalState } from "state-pool";
import { getMenuNameFlag } from "../../utility/UserRightsFunctions";
import { UserRightsValue } from "../../redux-store/slices/UserRightsSlice";
import DataObject from "./DataObject/DataObject";
import DataRights from "./DataRights";
import { LatestVersionOfProcess } from "../../utility/abstarctView/checkLatestVersion";

function DataModel(props) {
  let { t } = useTranslation();
  const classes = useStylesCustom();
  const userRightsValue = useSelector(UserRightsValue);
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const direction = `${t("HTML_DIR")}`;

  const { openProcessID, openProcessType, isReadOnly } = props;
  const [value, setValue] = useState(0);
  // const [userDefinedCount, setUserDefinedCount] = useState(0);
  const [dataTypesList, setDataTypesList] = useState([]);
  const [dataModelTabs, setDataModelTabs] = useState([]);

  // Boolean that decides whether constants tab will be visible or not.
  const constantsTabFlag = getMenuNameFlag(
    userRightsValue?.menuRightsList,
    userRightsMenuNames.constants
  );

  // // Function that runs when the component loads.
  // useEffect(() => {
  //   setUserDefinedCount(localLoadedProcessData?.ComplexVarDefinition?.length);
  // }, []);

  const [isProcessReadOnly, setIsProcessReadOnly] = useState(
    isReadOnly || false
  );

  useEffect(() => {
    if (
      openProcessType === PROCESSTYPE_REGISTERED ||
      openProcessType === "RC" ||
       //modified on 19/01/24 for BugId 140985
       LatestVersionOfProcess(localLoadedProcessData?.Versions) !==
       +localLoadedProcessData?.VersionNo
     /*  LatestVersionOfProcess(localLoadedProcessData.Versions) !==
        +localLoadedProcessData?.VersionNo */
         //till here for bug id:140985
     /*  LatestVersionOfProcess(localLoadedProcessData.Versions) !==
        +localLoadedProcessData?.VersionNo */
    ) {
      setIsProcessReadOnly(true);
    }
  }, [openProcessType]);

  // Function to get the label data for a tab.
  const getLabel = (labelName) => {
    return (
      <div
        // className={styles.labelData}
        className={
          direction === RTL_DIRECTION
            ? arabicStyles.labelData
            : styles.labelData
        }
      >
        <p
          /*className={
          styles.labelName
          }*/
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.labelName
              : styles.labelName
          }
        >
          {labelName}
        </p>
      </div>
    );
  };

  // Array to create tabs and its components.
  const arr = [
    {
      label: getLabel(t("businessVariablesTab")),
      labelName: t("businessVariablesTab"),
      icon: (
        <Icon
          style={{
            textAlign: "center",
            width: "20px",
            height: "20px",
            marginBottom: 0,
            marginInline: ".825rem",
          }}
        >
          <img
            style={{ height: "100%" }}
            src={BusinessVariableIcon}
            alt={t("businessVariablesTab")}
          />
        </Icon>
      ),
      selectedIcon: (
        <Icon
          style={{
            textAlign: "center",
            width: "20px",
            height: "20px",
            marginBottom: 0,
            marginInline: ".825rem",
          }}
        >
          <img
            style={{ height: "100%" }}
            src={BusinessVariableIcon_EN}
            alt="Business variable"
          />
        </Icon>
      ),
      style: {
        backgroundColor: "#F8F8F8",
      },
      component: (
        <BusinessVariables
          openProcessType={openProcessType}
          openProcessID={openProcessID}
          isReadOnly={isProcessReadOnly || isReadOnly}
        />
      ),
    },
    {
      label: getLabel(t("constants")),
      labelName: t("constants"),
      icon: (
        <Icon
          style={{
            textAlign: "center",
            width: "20px",
            height: "20px",
            marginBottom: 0,
            marginInline: ".825rem",
          }}
        >
          <img
            style={{
              height: "100%",
              transform: direction === RTL_DIRECTION ? "rotate(180deg)" : null,
            }}
            src={ConstantsIcon}
            alt={t("constants")}
          />
        </Icon>
      ),
      selectedIcon: (
        <Icon
          style={{
            textAlign: "center",
            width: "20px",
            height: "20px",
            marginBottom: 0,
            marginInline: ".825rem",
          }}
        >
          <img
            style={{
              height: "100%",
              transform: direction === RTL_DIRECTION ? "rotate(180deg)" : null,
            }}
            src={ConstantsIcon_EN}
            alt={t("constants")}
          />
        </Icon>
      ),
      style: { backgroundColor: "#F8F8F8" },
      component: (
        <DefinedConstants
          openProcessID={openProcessID}
          openProcessType={openProcessType}
          isReadOnly={isProcessReadOnly || isReadOnly}
        />
      ),
    },

    {
      label: getLabel(t("dataObjects")),
      labelName: t("dataObjects"),
      icon: (
        <Icon
          style={{
            textAlign: "center",
            width: "20px",
            height: "20px",
            marginBottom: 0,
            marginInline: ".825rem",
          }}
        >
          <img
            style={{ height: "100%" }}
            src={DataObjectsIcon}
            alt={t("dataObjects")}
          />
        </Icon>
      ),
      selectedIcon: (
        <Icon
          style={{
            textAlign: "center",
            width: "20px",
            height: "20px",
            marginBottom: 0,
            marginInline: ".825rem",
          }}
        >
          <img
            style={{ height: "100%" }}
            src={DataObjectsIcon_EN}
            alt={t("dataObjects")}
          />
        </Icon>
      ),
      style: { padding: "0.625rem" },
      component: (
        <DataObject
          isReadOnly={isProcessReadOnly || isReadOnly}
          openProcessID={openProcessID}
          openProcessType={openProcessType}
        />
      ),
    },
    // code edited on 10 Dec 2022 for BugId 116426
    {
      label: getLabel(t("dataRights")),
      labelName: t("dataRights"),
      icon: (
        <Icon
          style={{
            textAlign: "center",
            width: "20px",
            height: "20px",
            marginBottom: 0,
            marginInline: ".825rem",
          }}
        >
          <img
            style={{
              height: "100%",
            }}
            src={DataRightsIcon}
            alt={t("dataRights")}
          />
        </Icon>
      ),
      selectedIcon: (
        <Icon
          style={{
            textAlign: "center",
            width: "20px",
            height: "20px",
            marginBottom: 0,
            marginInline: ".825rem",
          }}
        >
          <img
            style={{
              height: "100%",
            }}
            src={DataRightsIcon_EN}
            alt={t("dataRights")}
          />
        </Icon>
      ),
      style: { padding: "0.625rem" },
      component: <DataRights isReadOnly={isProcessReadOnly || isReadOnly} />,
    },
  ];

  // Function that runs when the component loads.
  useEffect(() => {
    let tempArr = [...arr];
    if (!constantsTabFlag) {
      let constantsIndex;
      tempArr.forEach((element, index) => {
        if (element.labelName === t("constants")) {
          constantsIndex = index;
        }
      });
      tempArr.splice(constantsIndex, 1);
    }
    setDataModelTabs(tempArr);
  }, [localLoadedProcessData]);

  // Function to handle tab change.
  const handleChange = (event, newValue) => {
    let indexVal;
    let newData = [...dataTypesList];
    //to remove existing temporary dataObjects from list, before adding new temporary dataObject
    newData?.forEach((dataType, index) => {
      if (dataType.status && dataType.status === STATE_CREATED) {
        indexVal = index;
      }
    });
    if (indexVal || indexVal === 0) {
      newData.splice(indexVal, 1);
    }
    setDataTypesList(newData);
    // setUserDefinedCount(newData.length);
    setValue(newValue);
  };

  return (
    <>
      {localLoadedProcessData === null ? (
        <CircularProgress style={{ marginTop: "40vh", marginLeft: "50%" }} />
      ) : (
        <div className={styles.mainDiv}>
          <div
            className={
              direction === RTL_DIRECTION
                ? `${arabicStyles.dataModelNavBar} tabStyle`
                : `${styles.dataModelNavBar} tabStyle`
            }
          >
            <Tabs
              orientation="vertical"
              variant="scrollable"
              style={{ height: "100vh" }}
              value={value}
              onChange={handleChange}
              className={
                direction === RTL_DIRECTION ? classes.tabsRtl : classes.tabs
              }
              TabIndicatorProps={{
                style: {
                  left: direction === RTL_DIRECTION ? "unset" : 0,
                  right: direction !== RTL_DIRECTION ? "unset" : 0,
                },
              }}
              classes={{
                flexContainer:
                  direction === RTL_DIRECTION
                    ? classes.flexContainerRtl
                    : classes.flexContainer,
              }}
            >
              {dataModelTabs?.map((element, index) => (
                <Tab
                  icon={value === index ? element.selectedIcon : element.icon}
                  className={
                    direction === RTL_DIRECTION
                      ? styles.dataModelTabRtl
                      : styles.dataModelTab
                  }
                  classes={{
                    selected:
                      direction === RTL_DIRECTION
                        ? classes.selectedTabRtl
                        : classes.selectedTab,
                    wrapper:
                      direction === RTL_DIRECTION
                        ? classes.wrapperRtl
                        : classes.wrapper,
                  }}
                  label={element.label}
                  id={`pmweb_dataModel_navbar_${index}`}
                />
              ))}
            </Tabs>
          </div>
          <div style={{ width: "82.5vw", height: "80vh" }}>
            {dataModelTabs?.map((element, index) => (
              <TabPanel style={element?.style} value={value} index={index}>
                {element.component}
              </TabPanel>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default DataModel;
