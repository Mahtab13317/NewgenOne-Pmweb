import { Button, Grid, Typography, makeStyles } from "@material-ui/core";
import React from "react";
import { RTL_DIRECTION } from "../../../../Constants/appConstants";
import { useTranslation } from "react-i18next";
import GenAILoader from "../../../../UI/genAI_Loader";

const useStyles = makeStyles((theme) => ({
  rootTabs: {
    "&.MuiTabs-root": {
      padding: "0 !important",
    },
    padding: "0 0.25vw !important",
    margin: "0 !important",
    marginInlineEnd: "1.5vw !important",
    minWidth: "3vw !important",
    minHeight: "3.25rem",
  },
  indicatorTab: {},
  container: {
    flexWrap: "nowrap",
    margin: "10px",
    minHeight: "76vh",
    display: "flex",
  },
  tabUnselected: {
    fontFamily: "var(--font_family)",
    fontSize: "var(--base_text_font_size)",
    fontWeight: 400,
  },
  tabSelected: {
    "& p": {
      fontWeight: "600",
    },
  },
  item1: {
    width: "70%",
  },
  item2: {
    width: "30%",
  },
  labelContainer: {
    padding: "0",
    margin: "0",
  },
  mainContainer: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: "70vh",
  },
  innerContainer: {
    height: "100%",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    alignItems: "center",
    justifyContent: "center",
    background: "#fff",
  },
  NoDataText: {
    fontSize: "14px",
    //fontWeight: "550"
  },
  loaderTitle: {
    color: "#434343",
    textAlign: "center",
    fontFamily: "var(--font_family)",
    fontSize: "var(--title_text_font_size)",
    fontWeight: "500",
    marginTop: "1rem",
  },
  loaderText: {
    color: "#000",
    textAlign: "center",
    fontFamily: "var(--font_family)",
    fontSize: "var(--base_text_font_size)",
    fontWeight: "400",
    marginTop: "2rem",
    width: "72%",
  },
  stopLoaderBtn: {
    background: "#FFF",
    border: "1px solid #C4C4C4",
    color: "#606060",
    fontFamily: "var(--font_family)",
    fontSize: "var(--base_text_font_size)",
    fontWeight: "600",
    margin: "0 !important",
    marginTop: "1.25rem !important",
    padding: "0 3vw !important",
  },
  tabContainer: {
    flexWrap: "nowrap",
    background: "white",
    boxShadow: "0px 3px 4px 0px #DADADA",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 1vw",
    height: "fit-content",
    maxHeight: "15%",
  },
  mainDataArea: {
    display: "flex",
    width: "100%",
    height: "90%",
    marginBottom: "0.25rem",
    justifyContent: "space-between",
    position: "relative",
  },
  innerMainDataArea: {
    height: "100%",
    width: "100%",
    padding: "0 1vw",
  },
  itemContainer: {
    alignSelf: "center",
    maxWidth: "fit-content",
    margin: "0px 1vw",
  },
  showArea: { overflowX: "auto", overflowY: "hidden" },
  subHeader: {
    background: "#F2F2F2",
    boxShadow: "0px 3px 4px 0px #DADADA",
    width: "100%",
    padding: "0.25rem 1.5vw 0.5rem",
    position: "absolute",
    left: "-2px",
    top: "4px",
  },
  subHeaderText: {
    color: "#606060",
    font: "normal normal 400 var(--base_text_font_size)/17px var(--font_family)",
  },
  noOutputText: {
    color: "#000",
    textAlign: "center",
    fontFamily: "var(--font_family)",
    fontSize: "var(--base_text_font_size)",
    fontWeight: "400",
  },
  noOutputTitle: {
    color: "#000",
    textAlign: "center",
    fontFamily: "var(--font_family)",
    fontSize: "var(--title_text_font_size)",
    fontWeight: "700",
    marginTop: "0.75rem",
    marginBottom: "0.25rem",
  },
  backIconContainer: {
    width: "2.25rem",
    height: "2.25rem !important",
    background: "#fff",
    margin: "0 !important",
    padding: "0 !important",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0px 0px 6px 0px rgba(0, 0, 0, 0.25)",
    borderRadius: "50%",
  },
}));

const AIProcessGenerationContainer = (props) => {
  let { t } = useTranslation();
  const classes = useStyles();
  const direction = `${t("HTML_DIR")}`;
  return (
    <>
      <Grid
        container
        className={classes.mainContainer}
        style={{ flexDirection: "column", height: "100%" }}
      >
        <Grid
          item
          style={{ width: "4rem", height: "4rem" }}
          role="grid"
          aria-label="AIPGC_genAILoaderContainer"
        >
          <GenAILoader />
        </Grid>
        <Grid item>
          <Typography
            className={classes.loaderTitle}
            data-testid="pmweb_AIPG_generating"
          >
            {t("Generating")}
          </Typography>
        </Grid>
        <Grid item style={{ display: "flex", justifyContent: "center" }}>
          <Typography
            className={classes.loaderText}
            data-testid="pmweb_AIPG_generatingMsg"
          >
            {t("MarvinGeneratingMsg")}
          </Typography>
        </Grid>
        <Grid item>
          <Button
            className={classes.stopLoaderBtn}
            onClick={props.stopGenerateFunc}
            id="pmweb_stopGeneratingAI_btn"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                props.stopGenerateFunc();
              }
            }}
            aria-label="Stop Generating"
          >
            {t("StopGenerating")}
          </Button>
        </Grid>
      </Grid>
    </>
  );
};

export default AIProcessGenerationContainer;
