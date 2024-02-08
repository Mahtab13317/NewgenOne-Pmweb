import React, { useState } from "react";
import {
  Button,
  Grid,
  Tab,
  Tabs,
  Typography,
  makeStyles,
} from "@material-ui/core";
import { TabPanel } from "../../../ProcessSettings";
import { useTranslation } from "react-i18next";
import { SPACE } from "../../../../Constants/appConstants";
import classes from "../index.module.css";
import ErrorComponentGenAI from "./ErrorComponent";
import InformationComponentGenAI from "./InformationComponent";

const useStyles = makeStyles(() => ({
  footer: {
    background: "#f8f8f8",
    justifyContent: "space-between",
    borderTop: "1px solid #d3d3d3",
    padding: "1rem 1vw",
  },
  body: { flexDirection: "column" },
  bodyNote: {
    padding: "1rem 1vw",
    color: "#000",
    font: "normal normal 400 var(--base_text_font_size)/17px var(--font_family) !important",
    borderBottom: "1px solid #d3d3d3",
  },
  header: {
    justifyContent: "space-between",
    padding: "1rem 1vw",
    borderBottom: "1px solid #d3d3d3",
  },
  tabStyles: {
    borderBottom: "1px solid #d3d3d3",
  },
  titleHeading: {
    font: "normal normal 600 var(--subtitle_text_font_size)/19px var(--font_family) !important",
  },
  rootTabs: {
    "&.MuiTabs-root": {
      padding: "0 !important",
    },
    padding: "0 1vw !important",
    margin: "0 !important",
    marginInlineEnd: "1.5vw !important",
    minWidth: "3vw !important",
    minHeight: "3.25rem",
  },
  indicatorTab: {},
  tabUnselected: {
    fontFamily: "var(--font_family)",
    fontSize: "var(--base_text_font_size)",
    fontWeight: 400,
  },
  tabSelected: {
    "& p": {
      fontWeight: "600",
      color: "var(--selected_tab_color) !important",
    },
  },
}));

function ErrorInfoModal(props) {
  const { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const styles = useStyles({ direction });
  const { errors, information, okHandler, processName } = props;
  const [tabValue, setTabValue] = useState(errors?.length > 0 ? 0 : 1); // State that maintains the currently selected tab.

  // Function to handle tab change.
  const handleChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Function that concatenates the array elements with new line and numbering.
  const concatenateWithNewLineFor2Keys = (array, key1, key2) => {
    if (array && array !== null && array !== undefined && array.length > 0) {
      const result = array
        ?.map((element, index) => {
          return (
            `${index + 1}. ` +
            `Data Object` +
            SPACE +
            `"${element[key2]}"` +
            SPACE +
            `has been renamed to` +
            SPACE +
            `"${element[key1]}".` +
            "\n"
          );
        })
        .join("");
      return result;
    }
  };

  function createAndDownloadTextFile(textToCopy) {
    const textContent = textToCopy;
    const blob = new Blob([textContent], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${processName}_Data_Object_Errors_Information.txt`; // File name
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  // Function that checks if navigator.clipboard is present or not and handles copy to clipboard function accordingly.
  const handleCreateAndDownloadFile = async (textToCopy) => {
    try {
      createAndDownloadTextFile(textToCopy);
    } catch (error) {
      console.error("Failed to download text:", error);
    }
  };

  // Function that copies the data shown to clipboard based on the selected tab.
  const copyToClipboard = () => {
    let text = "";

    if (errors?.length > 0) {
      text = text.concat(
        t("ProcessCreatedWithoutTheBelowDataObjectsDueToSomeError"),
        "\n"
      );
      text = text.concat(t("DataObjectsNotIncludedInTheProcess"), "\n", "\n");
      errors?.forEach((err, index) => {
        text = text.concat(`${index + 1}. `);
        text = text.concat(`Data Object Name : ${err.name}`, "\n");
        text = text.concat(
          `   Data Object Description : ${err.description}`,
          "\n",
          "\n"
        );
        let maxVarLength = "Variable Name".length + 10,
          maxVarDataLength = "Variable Data Type".length + 10,
          maxVarDescLength = "Variable Description".length + 10;
        err?.variables?.forEach((variable) => {
          maxVarLength =
            maxVarLength < variable.name?.length
              ? variable.name?.length + 10
              : maxVarLength;
          maxVarDataLength =
            maxVarDataLength < variable.type?.length
              ? variable.type?.length + 10
              : maxVarDataLength;
          maxVarDescLength =
            maxVarDescLength < variable.description?.length
              ? variable.description?.length + 10
              : maxVarDescLength;
        });
        text = text.concat(
          "\t",
          "Variable Name",
          new Array(maxVarLength - "Variable Name".length).join(" "),
          "Variable Data Type",
          new Array(maxVarDataLength - "Variable Data Type".length).join(" "),
          "Variable Description",
          new Array(maxVarDescLength - "Variable Description".length).join(" "),
          "\n"
        );
        text = text.concat(
          "\t",
          "",
          new Array(maxVarLength).join("-"),
          "",
          new Array(maxVarDataLength).join("-"),
          "",
          new Array(maxVarDescLength).join("-"),
          "\n"
        );
        err?.variables?.forEach((variable) => {
          text = text.concat(
            "\t",
            variable.name,
            new Array(
              maxVarLength -
                (variable.name !== null ? variable.name?.length : 4)
            ).join(" "),
            variable.type,
            new Array(maxVarDataLength - variable.type?.length).join(" "),
            variable.description,
            new Array(maxVarDescLength - variable.description?.length).join(
              " "
            ),
            "\n"
          );
        });
        text = text.concat("\n", "\n");
      });
    }

    if (information?.length > 0) {
      text = text.concat(
        t("SomeDataObjectsAreAlreadyBeingUsedInOtherProcesses"),
        "\n"
      );
      text = text.concat(t("RenamedDataObjects"), ":", "\n", "\n");
      text = text.concat(
        concatenateWithNewLineFor2Keys(information, "name", "oldName")
      );
    }

    handleCreateAndDownloadFile(text);
  };

  return (
    <Grid container>
      {/* header */}
      <Grid item container className={styles.header}>
        <Grid item>
          <Typography
            className={styles.titleHeading}
            data-testid="pmweb_EIM_Important_Alert"
          >
            {t("importantAlert")}
          </Typography>
        </Grid>
      </Grid>
      {/* //Body */}
      <Grid item container className={styles.body}>
        <Grid item>
          <Typography className={styles.bodyNote} data-testid= "pmweb_EIM_bodyNote">
            Note: The process has been successfully created. However, the errors
            mentioned must be resolved before deploying the process. The
            information provided is for viewing purposes only and does not
            require any action.
          </Typography>
        </Grid>
        <Grid item style={{ paddingTop: "0.5rem" }}>
          <div className={styles.tabStyles}>
            <Tabs
              orientation="horizontal"
              onChange={handleChange}
              value={tabValue}
              classes={{
                root: styles.rootTabs,
                indicator: styles.indicatorTab,
                labelContainer: styles.labelContainer,
              }}
            >
              <Tab
                classes={{
                  selected: styles.tabSelected,
                  root: styles.rootTabs,
                }}
                tabIndex={0}
                data-testid="pmweb_EIM_errors_tab"
                label={
                  <Typography className={styles.tabUnselected}>
                    {t("errors")}
                  </Typography>
                }
                value={0}
                disabled={errors?.length === 0}
                disableRipple
                disableFocusRipple
                disableTouchRipple
              />
              <Tab
                classes={{
                  selected: styles.tabSelected,
                  root: styles.rootTabs,
                }}
                tabIndex={0}
                data-testid="pmweb_EIM_information_tab"
                label={
                  <Typography className={styles.tabUnselected}>
                    {t("Information")}
                  </Typography>
                }
                value={1}
                disabled={information?.length === 0}
                disableRipple
                disableFocusRipple
                disableTouchRipple
              />
            </Tabs>
          </div>
          <div>
            <TabPanel value={tabValue} index={0}>
              <ErrorComponentGenAI errors={errors} height="12rem" />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              <InformationComponentGenAI
                information={information}
                height="12rem"
              />
            </TabPanel>
          </div>
        </Grid>
      </Grid>
      {/* //footer */}
      <Grid item container className={styles.footer}>
        <Grid item>
          <Button
            id="pmweb_EIMGenAI_CopyToClipboardBtn"
            data-testid="pmweb_EIMGenAI_CopyToClipboardBtn"
            className={classes.cancelBtn}
            onClick={() => copyToClipboard()}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                copyToClipboard();
                e.stopPropagation();
              }
            }}
          >
            {t("download")}
          </Button>
        </Grid>
        <Grid item>
          <Button
            className={classes.okBtn}
            onClick={okHandler}
            id="pmweb_EIMGenAI_OkBtn"
            data-testid="pmweb_EIMGenAI_OkBtn"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                okHandler();
                e.stopPropagation();
              }
            }}
          >
            {t("okSmallCase")}
          </Button>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default ErrorInfoModal;
