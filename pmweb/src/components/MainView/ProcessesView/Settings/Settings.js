// #BugID - 119486
// #BugDescription - Tab has been hide.
import React, { useState } from "react";
import { Tabs, Tab, Grid, useMediaQuery } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import "./settings.css";
import GlobalRequirementSections from "./GlobalRequirementSections/GlobalRequirementSections";
import { TabPanel, tabProps, useStylesCustom } from "../../../ProcessSettings";
import ServiceCatalog from "./ServiceCatalog";

function Settings() {
  const classes = useStylesCustom();
  let { t } = useTranslation();
  const [value, setValue] = useState(0);
  const direction = `${t("HTML_DIR")}`;

  // Function to handle tab change.
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const smallScreen = useMediaQuery("(max-width: 999px)");

  // const theme = createTheme({
  //   breakpoints: {
  //     values: {
  //      xs: 0,
  //      sm: 600,
  //      md:1000,
  //    }
  //  }
  // });
  return (
    <div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          // changes added for bug_id: 134226
          // height: "91.84vh",
          height: "100vh",
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
                // width: "20%",
                // minWidth: "12rem",
                background: "#FFF",
                // boxShadow: "0px 3px 6px #00000029",
              }}
            >
              <Tabs
                orientation={smallScreen ? "horizontal" : "vertical"}
                variant="scrollable"
                style={{
                  height: "100%",
                  // changes added for bug_id: 134226
                  // minHeight: "36px"
                  minHeight: "2.25rem",
                }}
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
                  label={t("serviceCatalog")}
                  {...tabProps(0)}
                  id="pmweb_Settings_serviceCatalogTab"
                  tabIndex={0}
                />
                {/* <Tab
              className={
                direction === "rtl"
                  ? "processSettingTabrtl"
                  : "processSettingTab"
              }
              classes={{
                selected: classes.selectedTab,
              }}
              label={t("processFeaturesCatalog")}
              {...tabProps(1)}
            /> */}
                <Tab
                  className={
                    direction === "rtl"
                      ? "processSettingTabrtl"
                      : "processSettingTab"
                  }
                  classes={{
                    selected: classes.selectedTab,
                  }}
                  label={t("globalRequirementSections")}
                  {...tabProps(1)}
                  id="pmweb_Settings_globalReqSectionTab"
                  tabIndex={0}
                />
              </Tabs>
            </div>
          </Grid>
          {/* style={{ width: "80%" }} */}
          <Grid item xs={12} md={10}>
            <div
              style={{
                // changes added for bug_id: 134226
                // height: "98vh"
                height: "100%",
              }}
              id="vertical-tab"
            >
              <TabPanel
                style={{
                  backgroundColor: "#F8F8F8",
                  padding: "0 1vw",
                  // width: "78vw",
                  // changes added for bug_id: 134226
                  // height: "100%",
                  height: "98vh",
                }}
                value={value}
                index={0}
              >
                <ServiceCatalog />
              </TabPanel>
              {/*  <TabPanel style={{ padding: "0.625rem" }} value={value} index={1}>
            Process Features Catalog to be painted here.
          </TabPanel> */}
              <TabPanel
                style={{
                  backgroundColor: "#F8F8F8",
                  padding: "0.625rem",
                  height: "98vh",
                }}
                value={value}
                index={1}
              >
                <GlobalRequirementSections callLocation="Settings" />
              </TabPanel>
            </div>
          </Grid>
        </Grid>
      </div>
    </div>
  );
}

export default Settings;
