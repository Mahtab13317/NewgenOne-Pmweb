import React, { useState } from "react";
import { Tabs, Tab, useMediaQuery, Grid } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { LOCAL_SCOPE } from "../../Constants/appConstants";
import External from "./External";
import Webservice from "../MainView/ProcessesView/Settings/ServiceCatalog/Webservice";
import { TabPanel, tabProps, useStylesCustom } from "../ProcessSettings";
import SAP from "./SAP/SAP";
import { store, useGlobalState } from "state-pool";
import { LatestVersionOfProcess } from "../../utility/abstarctView/checkLatestVersion";
import { isProcessDeployedFunc } from "../../utility/CommonFunctionCall/CommonFunctionCall";
import styles from "./index.module.css";

function ServiceCatalog(props) {
  let { t } = useTranslation();
  const { callLocation, isReadOnly } = props;
  const classes = useStylesCustom();
  const [value, setValue] = useState(0);
  const direction = `${t("HTML_DIR")}`;
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);

  // Function to handle tab change.
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const smallScreen = useMediaQuery("(max-width: 998px");
  const tabLandscape = useMediaQuery(
    "(min-width: 999px) and (max-width: 1280px)"
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        // changes added for bug_id: 134226
        // height: `${callLocation === "webServicePropTab" ? "70vh" : "91.84vh"}`,
        height: `${
          callLocation === "webServicePropTab"
            ? tabLandscape
              ? "68vh"
              : smallScreen
              ? "73vh"
              : "70vh"
            : "91.84vh"
        }`,
        width: "100%",
      }}
    >
      <Grid
        container
        justifyContent="space-between"
        xs={12}
        direction={{ xs: "row", md: "column" }}
      >
        <Grid item md={2} direction={{ xs: "row", md: "column" }}>
          <div
            className="tabs"
            style={{
              // width: "17vw",
              background: "#FFF",
              marginTop: "4px",
            }}
          >
            <Tabs
              orientation={smallScreen ? "horizontal" : "vertical"}
              variant="scrollable"
              style={{ height: "100%", minHeight: "36px" }}
              value={value}
              onChange={handleChange}
            >
              <Tab
                className={
                  direction === "rtl"
                    ? "processSettingTabrtl"
                    : "processSettingTab"
                }
                classes={{
                  selected: classes.selectedTab,
                }}
                label={t("webService")}
                {...tabProps(0)}
                id="pmweb_serviceCatalog_webService"
              />
              <Tab
                className={
                  direction === "rtl"
                    ? "processSettingTabrtl"
                    : "processSettingTab"
                }
                classes={{
                  selected: classes.selectedTab,
                }}
                label={`${t("external")} ${t("Methods")}`}
                {...tabProps(1)}
                id="pmweb_serviceCatalog_externalMethods"
              />
              {localLoadedProcessData?.SAPRequired ? (
                <Tab
                  className={
                    direction === "rtl"
                      ? "processSettingTabrtl"
                      : "processSettingTab"
                  }
                  classes={{
                    selected: classes.selectedTab,
                  }}
                  label={t("SAP")}
                  {...tabProps(2)}
                />
              ) : null}
            </Tabs>
          </div>
        </Grid>
        <Grid item xs={12} md={10}>
          <div
            style={{
              // width: "83vw",
              marginTop: "5px",
              height: "98vh",
            }}
          >
            <TabPanel
              style={{ padding: "0.25rem 0.5rem" }}
              value={value}
              index={0}
            >
              <Webservice
                {...props}
                style={{ height: "80vh" }}
                scope={LOCAL_SCOPE}
                isReadOnly={
                  callLocation === "webServicePropTab"
                    ? isReadOnly
                    : isReadOnly ||
                      isProcessDeployedFunc(localLoadedProcessData) ||
                      LatestVersionOfProcess(
                        localLoadedProcessData?.Versions
                      ) !== +localLoadedProcessData?.VersionNo
                }
              />
            </TabPanel>
            <TabPanel
              className={
                callLocation === "webServicePropTab" && styles.DivScroll
              }
              value={value}
              index={1}
            >
              <External scope={LOCAL_SCOPE} isReadOnly={isReadOnly} />
            </TabPanel>
            <TabPanel
              style={{ padding: "0.625rem" }}
              className={
                callLocation === "webServicePropTab" && styles.DivScroll
              }
              value={value}
              index={2}
            >
              <SAP isReadOnly={isReadOnly} />
            </TabPanel>
          </div>
        </Grid>
      </Grid>
    </div>
  );
}

export default ServiceCatalog;
