// #BugID - 125171
// #BugDescription -  Fixed the issue Without for assignment of pmweb menu rights the user is getting all the access for the same and able to peroform operation

import React, { useState, useEffect } from "react";
import styles from "./index.module.css";
import {
  RTL_DIRECTION,
  userRightsMenuNames,
  PROCESSTYPE_REGISTERED,
  SPACE,
} from "../../../Constants/appConstants";
import arabicStyles from "./ArabicStyles.module.css";
import SystemDefined from "./SystemDefined";
import PrimaryVariables from "./PrimaryVariables";
import {
  Tabs,
  Tab,
  withStyles,
  useTheme,
  useMediaQuery,
} from "@material-ui/core";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import useStyles from "./index.styles";
import { store, useGlobalState } from "state-pool";
import axios from "axios";
import { UserRightsValue } from "../../../redux-store/slices/UserRightsSlice";
import { useSelector } from "react-redux";
import { getMenuNameFlag } from "../../../utility/UserRightsFunctions";
import { LatestVersionOfProcess } from "../../../utility/abstarctView/checkLatestVersion";
import { isProcessDeployedFunc } from "../../../utility/CommonFunctionCall/CommonFunctionCall";
import { TabPanel } from "../../ProcessSettings";
import SearchBox from "../../../UI/Search Component";

function BusinessVariables(props) {
  const { openProcessType, openProcessID, isReadOnly } = props;

  let { t } = useTranslation();
  const userRightsValue = useSelector(UserRightsValue);
  const direction = `${t("HTML_DIR")}`;

  const [isProcessReadOnly, setIsProcessReadOnly] = useState(isReadOnly);

  const [lengthUserDefine, setLengthUserDefine] = useState("");
  const [primaryVariableCount, setPrimaryVariableCount] = useState(0);
  const classes = useStyles();

  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData, setlocalLoadedProcessData] =
    useGlobalState(loadedProcessData);

  const [selectedTabValue, setselectedTabValue] = useState(0);
  const [allVariableTypeCount, setallVariableTypeCount] = useState({
    basic: 0,
    external: 0,
    system: 0,
  });
  const [searchKey, setSearchKey] = useState("");

  const theme = useTheme();
  const matchesTab = useMediaQuery(theme.breakpoints.down("md"));

  const CustomTabs = withStyles({
    root: {
      height: "50px",
      "&$focused": {
        outline: "1px solid var(--button_color)",
        borderRadius: "2px",
      },
    },
  })((props) => <Tabs {...props} />);

  // Boolean that decides whether add queue variables button will be visible or not.
  const queueVariablesFlag = getMenuNameFlag(
    userRightsValue?.menuRightsList,
    userRightsMenuNames.queueVariables
  );

  // Boolean that decides whether extended variables accordion can be opened or not.
  const extendedVariablesFlag = getMenuNameFlag(
    userRightsValue?.menuRightsList,
    userRightsMenuNames.externalVariable
  );

  // Function that runs when the component mounts.

  //code changes for bugid 127613
  useEffect(() => {
    if (
      localLoadedProcessData?.ProcessType === PROCESSTYPE_REGISTERED ||
      localLoadedProcessData?.ProcessType === "RC" ||
      LatestVersionOfProcess(localLoadedProcessData?.Versions) !==
        +localLoadedProcessData?.VersionNo // modified on 05/09/2023 for Bugid 136103
    ) {
      setIsProcessReadOnly(true);
    }
  }, [openProcessType]);

  // function that tells the length of userdefine

  {
    /**
changes related to variable count and switching of tabs. done on 27-02-2023 by Asloob
*/
  }

  const getExtVarCount = (varList) => {
    let temp = [];
    let basicCount = 0,
      systemCount = 0;
    varList.forEach((_var) => {
      if (
        _var.ExtObjectId === "1" &&
        _var.VariableScope === "I" &&
        _var.VariableName.toLowerCase().includes(searchKey.toLowerCase())
      ) {
        temp.push(_var);
      } else if (
        (_var.VariableScope === "U" || _var.VariableScope === "I") &&
        _var.VariableName.toLowerCase().includes(searchKey.toLowerCase())
      )
        basicCount = basicCount + 1;
      else if (
        (_var.VariableScope === "M" || _var.VariableScope === "S") &&
        _var.VariableName.toLowerCase().includes(searchKey.toLowerCase())
      )
        systemCount = systemCount + 1;
    });

    setallVariableTypeCount({
      basic: basicCount,
      external: temp.length,
      system: systemCount,
    });
    if (searchKey) {
      for (let [key, value] of Object.entries({
        basic: basicCount,
        external: temp.length,
        system: systemCount,
      })) {
        if (value > 0) {
          if (key === "basic") setselectedTabValue(0);
          else if (key === "external") setselectedTabValue(1);
          else if (key === "system") setselectedTabValue(2);
          else setselectedTabValue(0);
          break;
        }
      }
    }
    setLengthUserDefine(temp.length);
  };
  useEffect(() => {
    getExtVarCount(localLoadedProcessData.Variable);
  }, [localLoadedProcessData.Variable, searchKey]);

  const checkIsUpdated = (data) => {
    let tempData = global.structuredClone(data);
    let isUpdated = false;
    const newArr = data.columns
      .filter((obj) => {
        return obj.name !== "itemindex";
      })
      .filter((obj) => {
        return obj.name !== "itemtype";
      });
    tempData.columns = newArr;
    for (let col in tempData.columns) {
      if (tempData.columns[col].status !== 4) {
        isUpdated = true;
        break;
      }
    }
    tempData.isUpdate = isUpdated;
    return tempData;
  };

  const callbackFunction = async (data) => {
    if (!!data?.id) {
      data.id = data.id + "";
      data["processName"] = localLoadedProcessData.ProcessName;
      data = checkIsUpdated(data);
    } else {
      data.deleteExtDO = data.deleteExtDo;
      data.isUpdate = true;
      delete data.deleteExtDo;
    }

    if (data?.constraints?.hasOwnProperty("Indexes")) {
      if (
        !data?.constraints.Indexes.hasOwnProperty("definition") ||
        data?.constraints.Indexes.definition.length === 0
      )
        delete data?.constraints.Indexes;
    }
    if (data?.constraints?.hasOwnProperty("FK")) {
      if (
        !data?.constraints.FK.hasOwnProperty("definition") ||
        data?.constraints.FK.definition.length === 0
      )
        delete data?.constraints.FK;
    }
    if (data?.constraints?.hasOwnProperty("NotNull")) {
      if (
        !data?.constraints.NotNull.hasOwnProperty("definition") ||
        data?.constraints.NotNull.definition.length === 0
      )
        delete data?.constraints.NotNull;
    }
    if (data?.constraints?.hasOwnProperty("Unique")) {
      if (
        !data?.constraints.Unique.hasOwnProperty("definition") ||
        data?.constraints.Unique.definition.length === 0
      )
        delete data?.constraints.Unique;
    }

    const formData = new FormData();
    let mystring = JSON.stringify(data);
    let myBlob = new Blob([mystring], {
      type: "text/plain",
    });
    formData.append("file", myBlob);

    const response = await axios({
      method: "post",
      url: `/pmweb/alterExtTable/${localLoadedProcessData.ProcessDefId}`,
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
        // type: "application/json",
      },
    });
    if (response?.data.Status === 0) {
      let temp = JSON.parse(JSON.stringify(localLoadedProcessData));
      if (data.deleteExtDO === "Y") {
        temp.DataObjectId = "";
        temp.DataObjectAliasName = "";
        temp.DataObjectName = "";
      } else {
        temp.DataObjectId = data.id;
        temp.DataObjectAliasName = data.alias_name;
        temp.DataObjectName = data.name;
      }

      temp.Variable = [];
      temp.Variable = [...response.data.Variable];
      getExtVarCount([...response.data.Variable]);
      setlocalLoadedProcessData(temp);
      if (!data.columns) {
        callMicroFrontend(temp);
      }
    }
  };

  const callMicroFrontend = (processData) => {
    const localProcessData = processData || localLoadedProcessData;
    let microProps = {
      source: "PD_EXT", //PD_EXT
      data_object_alias_name: localProcessData.DataObjectAliasName, // Mandatory in props in PD_EXT
      data_object_name: localProcessData.DataObjectName, // Mandatory in props in PD_EXT
      // default_category_name: "simple", //we cant store
      data_object_id: localProcessData.DataObjectId, //object id to save from id in callback
      object_type: "P", //AP/P/C
      object_id: localProcessData.ProcessDefId, //categoryId
      // object_name: "simple",
      default_data_fields: [
        //PD_EXT	// Mandatory
        {
          name: "itemindex",
          alias: "itemindex",
          type: "1",
          key_field: true,
        },
        {
          name: "itemtype",
          alias: "itemtype",
          type: "1",
          key_field: true,
        },
      ],
      filter: searchKey,

      //"1" = String, "2" = Integer, "3" = Long, "4" = Float,"5" =Date and Time,"6" = Binary Data, "7" = Currency, "8" = Boolean,"9" = ShortDate, "10" = Ntext, "11" = Text, "12" = Nvarchar,"13" = Phone Number,"14" =Email.Binary,
      data_types: [1, 2, 3, 4, 5, 8, 9, 10],
      ContainerId: "appdesignerDiv",
      Module: "MDM",
      Callback: callbackFunction,
      Component: "DataModelListViewer",

      InFrame: false,

      Renderer: "renderDataModelListViewer",
      currentState:
        isProcessDeployedFunc(localProcessData) || isProcessReadOnly
          ? "R"
          : "L",
    };
    if (selectedTabValue === 1) {
      window.MdmDataModelPMWEB(microProps);
    }
  };
  useEffect(() => {
    callMicroFrontend();
    //code added for bug id 135516 on 20-09-23
  }, [selectedTabValue, searchKey]);

  const searchHandler = (keyword) => {
    setSearchKey(keyword);
  };

  const getVariablesCount = (varObj) => {
    let sum = 0;
    for (let count of Object.values(varObj)) {
      sum += count;
    }
    return sum;
  };

  //code changes for 131782
  const clearSearchResult = () => {
    searchHandler("");
  };
  return (
    <div className={styles.mainDiv}>
      <div className={clsx(styles.headingsDiv, styles.flexRow)}>
        <p
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.businessVariableHeading
              : styles.businessVariableHeading
          }
        >
          {t("businessVariables")}
          {SPACE}
        </p>
        <p className={styles.countInHeading}>
          {/* {`(${localLoadedProcessData?.Variable.length})`} */}
          {`(${getVariablesCount(allVariableTypeCount)})`}
        </p>
      </div>
      <div
        style={{
          width: "97.5%",
          margin: " 0 1vw",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #c5c5c5",
        }}
      >
        <CustomTabs
          orientation="horizontal"
          // variant="scrollable"
          style={{ maxHeight: "50px !important" }}
          value={selectedTabValue}
          onChange={(e, val) => setselectedTabValue(val)}
        >
          {queueVariablesFlag ? (
            <Tab
              // icon={value === index ? element.selectedIcon : element.icon}
              // className={styles.dataModelTab}
              // classes={{
              //   selected: classes.selectedTab,
              // }}
              label={`${t("basicVariables")} (${allVariableTypeCount.basic})`}
              id="pmweb_businessVar_basicVar"
              // Changes on 28/8/2023 to resolve the bug Id 134030 added clesses & style
              classes={{ root: classes.tab }}
              style={{ minWidth: matchesTab ? "150px" : "160px" }}
            />
          ) : null}

          {extendedVariablesFlag ? (
            <Tab
              // icon={value === index ? element.selectedIcon : element.icon}
              // className={styles.dataModelTab}
              // classes={{
              //   selected: classes.selectedTab,
              // }}
              label={`${t("extendedVariables")} (${
                allVariableTypeCount.external
              })`}
              id="pmweb_businessVar_extendedVar"
              // Changes on 28/8/2023 to resolve the bug Id 134030 added clesses & style
              classes={{ root: classes.tab }}
              style={{ minWidth: matchesTab ? "150px" : "160px" }}
            />
          ) : null}

          <Tab
            // icon={value === index ? element.selectedIcon : element.icon}
            // className={styles.dataModelTab}
            // classes={{
            //   selected: classes.selectedTab,
            // }}
            label={`${t("systemVariables")} (${allVariableTypeCount.system})`}
            id="pmweb_businessVar_systemVar"
            // Changes on 28/8/2023 to resolve the bug Id 134030 added clesses & style
            classes={{ root: classes.tab }}
            style={{ minWidth: matchesTab ? "150px" : "160px" }}
          />
        </CustomTabs>
        <SearchBox
          onSearchSubmit={(val) => searchHandler(val.searchString)}
          width={matchesTab ? "13.4vw" : "13vw"} //code modified on 28-09-2023 width is given in vw for bugId: 133008
          clearSearchResult={clearSearchResult}
          title={"BusinessVar"}
          placeholder={t("search")}
        />
      </div>

      <TabPanel value={selectedTabValue} index={0}>
        <PrimaryVariables
          searchKey={searchKey}
          openProcessID={openProcessID}
          primaryVariableCount={primaryVariableCount}
          setPrimaryVariableCount={setPrimaryVariableCount}
          isProcessReadOnly={isProcessReadOnly || isReadOnly}
          // bForInputStrip={primaryInputStrip}
          // setBForInputStrip={setPrimaryInputStrip}
        />
      </TabPanel>

      <TabPanel value={selectedTabValue} index={1}>
        <div
          id="appdesignerDiv"
          style={{ width: "100%", marginTop: "1rem", height: "60vh" }}
        ></div>
      </TabPanel>

      <TabPanel value={selectedTabValue} index={2}>
        <SystemDefined searchKey={searchKey} />
      </TabPanel>
    </div>
  );
}

export default BusinessVariables;
