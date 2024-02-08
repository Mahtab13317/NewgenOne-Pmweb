import {
  Button,
  Grid,
  IconButton,
  Tab,
  Tabs,
  Typography,
  makeStyles,
} from "@material-ui/core";
import React from "react";
import { RTL_DIRECTION } from "../../../../Constants/appConstants";
import { useTranslation } from "react-i18next";
import DataModel from "../DataModal/DataModel";
import Documents from "../Documents/Documents";
import Todos from "../Todo/Todo";
import {
  BackCircleIcon,
  NextCircleIcon,
  NoRecordIcon,
} from "../../../../utility/AllImages/AllImages";
import Exceptions from "../Exceptions/Exceptions";
import ProcessFlow from "../ProcessFlow/ProcessFlow";
import GenAILoader from "../../../../UI/genAI_Loader";
import Modal from "../../../../UI/Modal/Modal";
import ConfirmationModal from "../ConfirmationModal";
import AIProcessGenerationContainer from "./AIProcessGenerationContainer";
import { useSelector } from "react-redux";
import { promptHistoryValue } from "../../../../redux-store/slices/MarvinPromtHistorySlice";
import CircularLoader from "./CircularLoader";

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
    top: "3px",
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

const AIProcessCreation = (props) => {
  let { t } = useTranslation();
  const { isLoadingPreviewProcessData } = useSelector(promptHistoryValue);
  const classes = useStyles();
  const direction = `${t("HTML_DIR")}`;
  const {
    spinner,
    processData,
    updateProcessData,
    NoOutput,
    setShowAIProcessCreation,
    setSpinner,
    cancelAPICall,
    showDeleteModal,
    setShowDeleteModal,
    tabValue,
    setTabValue,
    showCommonDeleteModal,
    setShowCommonDeleteModal,
  } = props;

  const handleBack = () => {
    if (tabValue > 1) {
      setTabValue(tabValue - 1);
    } else {
      setTabValue(5);
    }
  };

  const stopGenerateFunc = () => {
    cancelAPICall();
    //setShowAIProcessCreation(false);
    setSpinner(false);
  };

  const handleNext = () => {
    if (tabValue < 5) setTabValue(tabValue + 1);
    else setTabValue(1);
  };

  const TabList = [
    {
      label: t("navigationPanel.processFlow"),
      value: 1,
      id: "pmweb_AIProcessCreation_tablist_processFow",
    },
    {
      label: t("navigationPanel.dataModel"),
      value: 2,
      id: "pmweb_AIProcessCreation_tablist_dataModel",
    },
    {
      label: t("navigationPanel.documents"),
      value: 3,
      id: "pmweb_AIProcessCreation_tablist_documents",
    },
    {
      label: t("navigationPanel.exceptions"),
      value: 4,
      id: "pmweb_AIProcessCreation_tablist_exceptions",
    },
    {
      label: t("navigationPanel.toDos"),
      value: 5,
      id: "pmweb_AIProcessCreation_tablist_toDos",
    },
  ];
  const handleTabChange = (e, value) => {
    setTabValue(value);
  };

  const getModelHeading = (deletedItem) => {
    switch (deletedItem.type) {
      case "todo":
        return t("deleteTodo");
      case "exception":
        return t("deleteException");
      case "document":
        return t("deleteDocument");
      case "variable":
        return t("deleteVariable");
      default:
        return "";
    }
  };
  const getConfirmationMessage = (deletedItem) => {
    switch (deletedItem.type) {
      case "todo":
        return `${t("deleteTodoConfirmationMsg")} ${deletedItem.name} ?`;
      case "exception":
        return `${t("deleteExceptionConfirmationMsg")} ${deletedItem.name} ?`;
      case "document":
        return `${t("deleteDocumentConfirmationMsg")} ${deletedItem.name} ?`;
      case "variable":
        return `${t("deleteVariableConfirmationMsg")} ${deletedItem.name} ?`;
      default:
        return "";
    }
  };

  return (
    <>
      {spinner ? (
        // <Grid
        //   container
        //   className={classes.mainContainer}
        //   style={{ flexDirection: "column", height: "100%" }}
        // >
        //   <Grid item style={{ width: "4rem", height: "4rem" }}>
        //     <GenAILoader />
        //   </Grid>
        //   <Grid item>
        //     <Typography className={classes.loaderTitle}>
        //       {t("Generating")}
        //     </Typography>
        //   </Grid>
        //   <Grid item style={{ display: "flex", justifyContent: "center" }}>
        //     <Typography className={classes.loaderText}>
        //       {t("MarvinGeneratingMsg")}
        //     </Typography>
        //   </Grid>
        //   <Grid item>
        //     <Button
        //       className={classes.stopLoaderBtn}
        //       onClick={stopGenerateFunc}
        //       id="pmweb_stopGeneratingAI_btn"
        //       tabIndex={0}
        //       onKeyDown={(e) => {
        //         if (e.key === "Enter") {
        //           stopGenerateFunc();
        //         }
        //       }}
        //     >
        //       {t("StopGenerating")}
        //     </Button>
        //   </Grid>
        // </Grid>
        <AIProcessGenerationContainer stopGenerateFunc={stopGenerateFunc} />
      ) : !processData || Object.keys(processData).length === 0 || NoOutput ? (
        isLoadingPreviewProcessData ? (
          <CircularLoader
            open={isLoadingPreviewProcessData}
            backDropStyle={{
              opacity: "0.4",
              height: "92%",
              top: "100px",
              right: direction === RTL_DIRECTION ? "0" : "25.5%",
              left: direction !== RTL_DIRECTION ? "0" : "25.5%",
            }}
          />
        ) : (
          <Grid container className={classes.innerContainer}>
            <Grid item>
              <NoRecordIcon />
            </Grid>
            <Grid item>
              <Typography
                className={classes.noOutputTitle}
                data-testid="pmweb_AIPC_UnableToGenerateProcess"
              >
                {t("UnableToGenerateProcess")}
              </Typography>
            </Grid>
            <Grid
              item
              style={{
                display: "flex",
                justifyContent: "center",
                flexDirection: "column",
              }}
            >
              <Typography
                className={classes.noOutputText}
                data-testid="pmweb_AIPC_ProcessGenerationFailedMsg"
              >
                {t("ProcessGenerationFailedMsg")}
              </Typography>
              <Typography
                className={classes.noOutputText}
                data-testid="pmweb_AIPC_PleaseRegenerate"
              >
                {t("PleaseRegenerate")}
              </Typography>
            </Grid>
          </Grid>
        )
      ) : (
        <Grid
          container
          style={{ height: "100%", position: "relative" }}
          sx={12}
        >
          <Grid item container className={classes.tabContainer}>
            <Tabs
              orientation="horizontal"
              onChange={handleTabChange}
              value={tabValue}
              classes={{
                root: classes.rootTabs,
                indicator: classes.indicatorTab,
                labelContainer: classes.labelContainer,
              }}
            >
              {TabList.map((item) => {
                return (
                  <Tab
                    classes={{
                      selected: classes.tabSelected,
                      root: classes.rootTabs,
                    }}
                    tabIndex={0}
                    data-testid={item.id}
                    label={
                      <Typography className={classes.tabUnselected}>
                        {item.label}
                      </Typography>
                    }
                    value={item.value}
                    disableRipple
                    disableFocusRipple
                    disableTouchRipple
                  />
                );
              })}
            </Tabs>
          </Grid>
          <Grid
            item
            className={classes.mainDataArea}
            xs={12}
            style={{
              height: "92%",
            }}
          >
            <Grid item xs={1} className={classes.itemContainer}>
              <IconButton
                id="pmweb_processFlowGenAI_BackBtn"
                data-testid="pmweb_processFlowGenAI_BackBtn"
                role="button"
                aria-label="back"
                onClick={handleBack}
                disabled={tabValue === 1}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleBack();
                  }
                }}
                className={classes.backIconContainer}
                disableFocusRipple
                disableTouchRipple
                disableRipple
              >
                {direction === RTL_DIRECTION ? (
                  <NextCircleIcon />
                ) : (
                  <BackCircleIcon />
                )}
              </IconButton>
            </Grid>
            <Grid item container xs className={classes.showArea}>
              {isLoadingPreviewProcessData && (
                <CircularLoader
                  open={isLoadingPreviewProcessData}
                  backDropStyle={{
                    opacity: "0.4",
                    height: "92%",
                    top: "100px",
                    right: direction === RTL_DIRECTION ? "0" : "25.5%",
                    left: direction !== RTL_DIRECTION ? "0" : "25.5%",
                  }}
                />
              )}
              <Grid container className={classes.innerMainDataArea}>
                {tabValue === 1 && (
                  <>
                    <Grid
                      className={classes.subHeader}
                      role="grid"
                      aria-label="Process Flow SubHeader Message"
                    >
                      <Typography className={classes.subHeaderText}>
                        {t("ProcessFlowSubHeaderMsg")}
                      </Typography>
                    </Grid>
                    <ProcessFlow
                      data={JSON.parse(
                        JSON.stringify(processData.segments || [])
                      )}
                      updateData={(data) =>
                        updateProcessData("ProcessFlow", data)
                      }
                      previewId={processData.id}
                    />
                  </>
                )}
                {tabValue === 2 && (
                  <DataModel
                    data={JSON.parse(JSON.stringify(processData.dataObjects))}
                    updateData={(data) => updateProcessData("DataModel", data)}
                    showDeleteModal={showDeleteModal}
                    setShowDeleteModal={setShowDeleteModal}
                    setShowCommonDeleteModal={setShowCommonDeleteModal}
                    showCommonDeleteModal={showCommonDeleteModal}
                  />
                )}
                {tabValue === 3 && (
                  <Documents
                    data={JSON.parse(JSON.stringify(processData.documents))}
                    updateData={(data) => updateProcessData("Documents", data)}
                    setShowCommonDeleteModal={setShowCommonDeleteModal}
                    showCommonDeleteModal={showCommonDeleteModal}
                  />
                )}
                {tabValue === 4 && (
                  <Exceptions
                    data={JSON.parse(JSON.stringify(processData.exceptions))}
                    updateData={(data) => updateProcessData("Exception", data)}
                    setShowCommonDeleteModal={setShowCommonDeleteModal}
                    showCommonDeleteModal={showCommonDeleteModal}
                  />
                )}
                {tabValue === 5 && (
                  <Todos
                    data={JSON.parse(JSON.stringify(processData.todos))}
                    updateData={(data) => updateProcessData("ToDo", data)}
                    setShowCommonDeleteModal={setShowCommonDeleteModal}
                    showCommonDeleteModal={showCommonDeleteModal}
                  />
                )}
              </Grid>
            </Grid>
            <Grid item xs={1} className={classes.itemContainer}>
              <IconButton
                id="pmweb_processFlowGenAI_NextBtn"
                data-testid="pmweb_processFlowGenAI_NextBtn"
                role="button"
                aria-label="next"
                onClick={handleNext}
                disabled={tabValue === 5}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleNext();
                  }
                }}
                className={classes.backIconContainer}
                disableFocusRipple
                disableTouchRipple
                disableRipple
              >
                {direction === RTL_DIRECTION ? (
                  <BackCircleIcon />
                ) : (
                  <NextCircleIcon />
                )}
              </IconButton>
            </Grid>
          </Grid>
          {showDeleteModal !== null && (
            <Modal
              show={showDeleteModal !== null}
              style={{
                width: showDeleteModal?.isDataObject ? "46%" : "42%",
                position: "absolute",
                top: "30%",
                left: showDeleteModal?.isDataObject ? "27%" : "29%",
                padding: "0",
                boxShadow: "none",
                border: "0",
              }}
              backDropStyle={{
                position: "absolute",
              }}
              children={
                <ConfirmationModal
                  modalHeading={
                    showDeleteModal?.isDataObject
                      ? t("deleteDataObject")
                      : t("deleteVariable")
                  }
                  cancelButtonText={t("cancel")}
                  confirmButtonText={t("delete")}
                  confirmationMessage={
                    showDeleteModal?.isDataObject
                      ? `${t("deleteDataObjectConfirmDelete")} ${
                          showDeleteModal?.dataObject
                        }?`
                      : `${t("deletingVarWillDeleteEntire")} ${
                          showDeleteModal?.dataObject
                        }. ${t("confirmDelete")}`
                  }
                  confirmFunc={() => {
                    showDeleteModal.deleteFunc(processData?.id);
                    setShowDeleteModal(null);
                  }}
                  modalCloseHandler={() => setShowDeleteModal(null)}
                />
              }
            />
          )}

          {showCommonDeleteModal !== null && (
            <Modal
              show={showCommonDeleteModal !== null}
              style={{
                width: "42%",
                position: "absolute",
                top: "30%",
                left: "29%",
                padding: "0",
                boxShadow: "none",
                border: "0",
              }}
              backDropStyle={{
                position: "absolute",
              }}
              children={
                <ConfirmationModal
                  modalHeading={getModelHeading(showCommonDeleteModal)}
                  cancelButtonText={t("cancel")}
                  confirmButtonText={t("delete")}
                  confirmationMessage={getConfirmationMessage(
                    showCommonDeleteModal
                  )}
                  confirmFunc={() => {
                    showCommonDeleteModal.deleteFunc(processData.id);
                    setShowCommonDeleteModal(null);
                  }}
                  modalCloseHandler={() => setShowCommonDeleteModal(null)}
                />
              }
            />
          )}
        </Grid>
      )}
    </>
  );
};
export default AIProcessCreation;
