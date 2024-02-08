import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Grid, makeStyles, IconButton } from "@material-ui/core";
import * as actionCreators from "../../../../redux-store/actions/processView/actions";
import * as actionCreators_template from "../../../../redux-store/actions/Template";
import { connect, useDispatch, useSelector } from "react-redux";
import Modal from "../../../../UI/Modal/Modal";
import ProcessCreation from "../../../../UI/ProcessCreation";
import {
  APP_HEADER_HEIGHT,
  ENDPOINT_FETCH_ALL_TEMPLATES,
  RTL_DIRECTION,
  SERVER_URL,
  PREVIOUS_PAGE_CREATE_FROM_PROCESS,
  PREVIOUS_PAGE_CREATE_FROM_PROCESSES,
  NO_CREATE_PROCESS_FLAG,
  CREATE_PROCESS_FLAG_FROM_PROCESSES,
  CREATE_PROCESS_FLAG_FROM_PROCESS,
  ENDPOINT_GENERATE_PROCESS_AI,
  ENDPOINT_CREATE_PROCESS_AI,
} from "../../../../Constants/appConstants";
import axios from "axios";
import CreateProcessByAI from "../CreateProcessByAI/CreateProcessByAI";
import {
  CloseIcon,
  ProcessCreationAIIcon,
} from "../../../../utility/AllImages/AllImages";
import AIProcessCreation from "../AIProcessCreation/AIProcessCreation";
import { Divider, Drawer, Typography } from "@mui/material";
import BackIcon from "../../../../assets/genAI_Icons/headerBackIcon.svg";
import CreateProcessByTemplate from "../../Create/CreateProcessByTemplate";
import CreateProcessModal from "../CreateProcessModal/CreateProcessModal";
import SelectTemplateType from "../SelectTemplateType/SelectTemplateType";
import { useHistory } from "react-router-dom";
import ConfirmationModal from "../ConfirmationModal";
import ButtonComponent from "../UI/ButtonComponent/ButtonComponent";
import ErrorInfoModal from "../ErrorInfoModal";
import {
  getMarvinGeneratedProcesses,
  getMarvinGeneratedPreviewProcessData,
} from "../CommonMarvinApiCalls/CommonMarvinApiCalls";
import {
  promptHistoryValue,
  setIsMovedToPromptHistory,
  setIsPromptHistoryOpen,
  setPromptHistory,
  setSelectedGeneratedPreview,
  setSelectedGeneratedPreviewProcessData,
} from "../../../../redux-store/slices/MarvinPromtHistorySlice";
import PromptHistory from "../PromptHistory/PromptHistory";
import _ from "lodash";

const useStyles = makeStyles(() => ({
  item: {
    display: "flex",
    alignItems: "center",
  },
  item2: {
    marginInlineEnd: "0.75vw",
    height: "92%",
    marginTop: "2px",
  },

  SkipBtn: {
    margin: "0 0.5vw!important",
    borderRadius: "4px",
  },
  topBarHeading: {
    textAlign: (props) =>
      props.direction === RTL_DIRECTION ? "right" : "left",
    font: "normal normal 600 16px/22px var(--font_family) !important",
    letterSpacing: "0px",
    color: "#252525",
    opacity: "1",
  },
  backIconContainer: {
    cursor: "pointer",
    margin: "0 !important",
  },
  backIcon: {
    width: "1.25rem",
    height: "1.25rem",
    marginInlineEnd: "0.25vw",
  },
  backRevIcon: {
    transform: "rotate(180deg)",
    width: "1.25rem",
    height: "1.25rem",
    marginInlineEnd: "0.25vw",
  },
  createUsingNewgenAITypo: {
    fontFamily: "var(--font_family) !important",
    fontSize: "var(--base_text_font_size) !important",
    fontWeight: "700 !important",
    padding: "2px 5px 2px 5px",
    color: "white",
  },
  createUsingNewgenAIdiv: {
    background: "#FF6901",
    borderRadius: "4px",
  },
  templateContainer: {
    padding: "1.5rem 1vw 0",
    height: "92%",
    background: "#F7F7F7",
    boxShadow: "0px 0px 4px 0px rgba(0, 0, 0, 0.25)",
  },
  drawerPaper: {
    width: "25.5%",
    /*  height: (props) =>
      `calc(${props.windowInnerHeight}px - ${APP_HEADER_HEIGHT} - 70px) !important`,*/
    top: "98px !important",
  },
  promptHistoryContainer: {
    padding: "5px",
    height: (props) =>
      `calc(${props.windowInnerHeight}px - ${APP_HEADER_HEIGHT} - 150px)`,
    overflowY: "auto",
    "&::-webkit-scrollbar": {
      backgroundColor: "transparent",
      width: "0.375rem",
      height: "1.125rem",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "transparent",
      borderRadius: "0.313rem",
    },

    "&:hover::-webkit-scrollbar": {
      overflowY: "visible",
      width: "0.375rem",
      height: "1.125rem",
    },
    "&:hover::-webkit-scrollbar-thumb": {
      background: "#8c8c8c 0% 0% no-repeat padding-box",
      borderRadius: "0.313rem",
    },
  },
}));

const CancelToken = axios.CancelToken;
let cancel;

function CreateProcessByTemplate_WithAI(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const history = useHistory();
  const [modalClicked, setModalClicked] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [categoryList, setCategoryList] = useState([]);
  const [showAIProcessCreation, setShowAIProcessCreation] = useState(false);
  const [processData, setProcessData] = useState({});
  const [spinner, setSpinner] = useState(false);
  const [showOrgTemplate, setShowOrgTemplate] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createSpinner, setCreateSpinner] = useState(false);
  const [NoOutputWasGenerated, setNoOutputWasGenerated] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [showCommonDeleteModal, setShowCommonDeleteModal] = useState(null);

  const [showRegenerateModal, setShowRegenerateModal] = useState(null);
  const [data, setData] = useState({
    processName: "",
    category: "",
    geography: "",
    additional: "",
  });
  const [isRegenerated, setIsRegenerated] = useState(false);
  const [backConfirmationModal, setBackConfirmationModal] = useState(null);
  const [showErrorInfoModal, setShowErrorInfoModal] = useState(null);
  const [tabValue, setTabValue] = useState(1);
  const windowInnerHeight = useSelector(
    (state) => state.setWindowInnerHeight.windowInnerHeight
  );
  const styles = useStyles({ direction, windowInnerHeight });
  const dispatch = useDispatch();
  const {
    allAIGeneratedProcesses,
    selectedGeneratedPreview,
    selectedGeneratedPreviewProcessData,
    isPromptHistoryOpen,
    isLoadingPreviewProcessData,
    isMovedToPromptHistory,
  } = useSelector(promptHistoryValue);

  useEffect(() => {
    axios.get(SERVER_URL + ENDPOINT_FETCH_ALL_TEMPLATES).then((res) => {
      if (res.data.Status === 0) {
        setCategoryList(res.data.Category);
      }
    });
    getMarvinGeneratedProcesses({ dispatch });
  }, []);
  useEffect(() => {
    if (selectedGeneratedPreview) {
      // setProcessData(selectedGeneratedPreviewProcessData);

      if (isMovedToPromptHistory && isPromptHistoryOpen) {
        getMarvinGeneratedPreviewProcessData({
          dispatch,
          previewId: selectedGeneratedPreview?.id,
        });
      }
    }
  }, [selectedGeneratedPreview, isMovedToPromptHistory, isPromptHistoryOpen]);
  useEffect(() => {
    if (selectedGeneratedPreviewProcessData) {
      setNoOutputWasGenerated(false);
      setData((prevData) => ({
        ...prevData,
        processName: selectedGeneratedPreviewProcessData?.name,
        category: selectedGeneratedPreviewProcessData?.inputParams?.category,
        geography: selectedGeneratedPreviewProcessData?.inputParams?.geography,
        additional:
          selectedGeneratedPreviewProcessData?.inputParams?.additionalComments,
      }));
      setProcessData({
        ..._.cloneDeep(selectedGeneratedPreviewProcessData?.templateData),
        id: selectedGeneratedPreviewProcessData?.id,
      });
    }
  }, [JSON.stringify(selectedGeneratedPreviewProcessData || {})]);

  const cancelHandler = () => {
    props.CreateProcessClickFlag(NO_CREATE_PROCESS_FLAG);
    setData(null);
    setProcessData(null);
    dispatch(setIsMovedToPromptHistory(false));
    dispatch(setSelectedGeneratedPreviewProcessData(null));
    dispatch(setSelectedGeneratedPreview(null));
    dispatch(setIsPromptHistoryOpen(false));
  };

  const createHandler = () => {
    props.setTemplateDetails(null, null, false, null, null, false, "", []);
    setSelectedTemplate(null);
    setModalClicked(true);
  };

  const handleViewAllClick = () => {
    setShowOrgTemplate(!showOrgTemplate);
  };

  const handleMoveBackFunction = () => {
    setShowOrgTemplate(!showOrgTemplate);
  };

  const handleCreateProcessByAI = (
    processName,
    projectId,
    projectName,
    isDefaultProject
  ) => {
    let payload = {
      id: processData.id,
      name: processName,
      project: {
        id: projectId,
        name: projectName,
        alreadyExist: isDefaultProject,
      },
      // activities: processData.activities,
      // segments: processData.segments,
      // swimlanes: processData.swimlanes,
      // documents: processData.documents,
      // exceptions: processData.exceptions,
      // todos: processData.todos,
      // queues: processData.queues,
      // connections: processData.connections,
      // dataObjects: processData.dataObjects,
    };
    setCreateSpinner(true);
    //calling the create process API
    axios
      .post(SERVER_URL + ENDPOINT_CREATE_PROCESS_AI, payload)
      .then((res) => {
        if (res && res.status === 200) {
          if (
            res?.data?.dataObjectCreationSummary?.failedDataObjects?.length >
              0 ||
            res?.data?.dataObjectCreationSummary?.renamedDataObjects?.length > 0
          ) {
            setShowCreateModal(false);
            setShowErrorInfoModal(res?.data);
          } else {
            redirectToProcessScreen(res?.data?.OpenProcess);
            setShowCreateModal(false);
            dispatch(setPromptHistory([]));
            dispatch(setSelectedGeneratedPreview(null));
            dispatch(setIsPromptHistoryOpen(false));
            dispatch(setSelectedGeneratedPreviewProcessData(null));
            setProcessData(null);
            setData(null);
          }
          props.setTemplatePage(null);
        }
        setCreateSpinner(false);
      })
      .catch((err) => {
        console.log(err);
        setCreateSpinner(false);
      });
  };

  const redirectToProcessScreen = (processData) => {
    props.openProcessClick(
      processData.ProcessDefId,
      processData.ProjectName,
      processData.ProcessType,
      processData.VersionNo,
      processData.ProcessName
    );
    props.openTemplate(null, null, false);
    if (props.setShowTemplateModal) {
      props.setShowTemplateModal(false);
    }
    history.push("/process");
    props.CreateProcessClickFlag(null);
  };

  const handleClickProcess = (data, isRegenerate) => {
    setSpinner(true);

    setIsRegenerated(isRegenerate);
    let payload = {
      processName: data.currProcessName,
      category: data.currCategory,
      geography: data.currGeography,
      additionalComments: data.currAdditional,
    };
    axios
      .post(SERVER_URL + ENDPOINT_GENERATE_PROCESS_AI, payload, {
        cancelToken: new CancelToken(function executor(c) {
          cancel = c;
        }),
      })
      .then((res) => {
        if (res?.status === 412) {
          setNoOutputWasGenerated(true);
          setSpinner(false);
        } else if (res?.status === 200) {
          setTabValue(1);
          setProcessData(res?.data);
          setSpinner(false);
          setNoOutputWasGenerated(false);
          setIsRegenerated(false);
          getMarvinGeneratedProcesses({ dispatch });
          dispatch(setIsMovedToPromptHistory(true));
        } else {
          setShowAIProcessCreation(false);

          setSpinner(false);
        }
      })
      .catch((err) => {
        console.log(err, "Error aa gyoooooo");
        if (!isRegenerate) {
          setShowAIProcessCreation(false);
        }
        setSpinner(false);
      });
    if (isRegenerate) {
      setSpinner(true);
      setData({
        ...data,
        processName: data.currProcessName,
        category: data.currCategory,
        geography: data.currGeography,
        additional: data.currAdditional,
      });
      setTimeout(() => {
        setData((prevData) => ({
          ...prevData,
          processName: data.currProcessName,
          category: data.currCategory,
          geography: data.currGeography,
          additional: data.currAdditional,
        }));
      }, 100);
    } else {
      setData((prevData) => ({
        ...prevData,
        processName: data.currProcessName,
        category: data.currCategory,
        geography: data.currGeography,
        additional: data.currAdditional,
      }));
      setShowAIProcessCreation(true);
    }
  };

  const cancelAPICall = () => {
    // Cancel previous request
    if (cancel !== undefined) {
      cancel();
    }
  };

  const handleBack = (e) => {
    if (showAIProcessCreation && allAIGeneratedProcesses.length === 0) {
      setShowAIProcessCreation(!showAIProcessCreation);
      setSpinner(false);

      setData(null);
      setProcessData(null);
    } else {
      cancelHandler(e);
    }
  };

  const updateProcessData = (type, updatedData) => {
    switch (type) {
      case "ProcessFlow":
        setProcessData({ ...processData, segments: updatedData });
        break;
      case "DataModel":
        setProcessData({ ...processData, dataObjects: updatedData });
        break;
      case "Documents":
        setProcessData({ ...processData, documents: updatedData });
        break;
      case "Exception":
        setProcessData({ ...processData, exceptions: updatedData });
        break;
      case "ToDo":
        setProcessData({ ...processData, todos: updatedData });
        break;
      default:
    }
  };
  const closePromptHistoryPanel = () => {
    dispatch(setIsPromptHistoryOpen(false));
    dispatch(setSelectedGeneratedPreview(null));
    dispatch(setSelectedGeneratedPreviewProcessData(null));
  };

  return (
    <React.Fragment>
      {showOrgTemplate ? (
        <CreateProcessByTemplate
          bCreateFromScratchBtn={true}
          bCancel={true}
          moveBackFunction={handleMoveBackFunction}
          showBackBtn={true}
          cancelFunction={handleMoveBackFunction}
          showCreateProcessByAI={true}
          cancelHandler={cancelHandler}
        />
      ) : (
        <React.Fragment>
          <Grid
            container
            justifyContent="space-between"
            style={{
              background: "white",
              boxShadow: "0px 0px 4px 0px #00000040",
              padding: "0.75rem 0.25vw",
              gap: "0.5vw",
              opacity: showDeleteModal || showCommonDeleteModal ? "0.5" : "1",
              pointerEvents:
                showDeleteModal || showCommonDeleteModal ? "none" : "auto",
            }}
            xs={12}
            alignItems="center"
          >
            <Grid
              container
              item
              alignItems="center"
              style={{ width: "fit-content" }}
            >
              <IconButton
                id="pmweb_CreateProcessByTemplateWithAI_BackBtn"
                data-testid="pmweb_CreateProcessByTemplateWithAI_BackBtn"
                role="button"
                aria-label="back"
                onClick={() => {
                  if (showAIProcessCreation) {
                    setBackConfirmationModal(0);
                  } else {
                    handleBack();
                  }
                }}
                disabled={spinner}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (showAIProcessCreation) {
                      setBackConfirmationModal(0);
                    } else {
                      handleBack(e);
                    }
                  }
                }}
                className={styles.backIconContainer}
                disableFocusRipple
                disableTouchRipple
                disableRipple
              >
                {direction === RTL_DIRECTION ? (
                  <img
                    src={BackIcon}
                    alt="back"
                    className={styles.backRevIcon}
                  />
                ) : (
                  <img src={BackIcon} alt="back" className={styles.backIcon} />
                )}
              </IconButton>

              <Typography
                className={styles.topBarHeading}
                style={{ direction: direction }}
              >
                {(!showAIProcessCreation || (spinner && !isRegenerated)) &&
                  t("createaProcess")}
                {showAIProcessCreation &&
                  !(spinner && !isRegenerated) &&
                  t("back")}
              </Typography>
            </Grid>
            {showAIProcessCreation && !(spinner && !isRegenerated) && (
              <Grid
                container
                item
                style={{
                  flex: "1",
                  margin: "0 0.5vw",
                  padding: "0 0.75vw",
                  borderInlineStart: "1px solid #D3D3D3",
                }}
                alignItems="center"
              >
                <ProcessCreationAIIcon />
                <Typography
                  className={styles.topBarHeading}
                  style={{ direction: direction, paddingInlineStart: "0.75vw" }}
                >
                  {data?.processName}
                </Typography>
              </Grid>
            )}
            <Grid
              container
              item
              justifyContent="flex-end"
              style={{ width: "fit-content" }}
            >
              {!showAIProcessCreation && (
                <ButtonComponent
                  variant="outlined"
                  onClick={createHandler}
                  tabIndex={0}
                  onKeyUp={(e) => {
                    if (e.key === "Enter") {
                      createHandler();
                      e.stopPropagation();
                    }
                  }}
                  className={styles.SkipBtn}
                  disabled={spinner}
                  id="pmweb_skipToManual_processCreationByTempAI"
                  children={t("skipToCreateManually")}
                />
              )}
              {showAIProcessCreation && (
                <ButtonComponent
                  variant="outlined"
                  onClick={() => setBackConfirmationModal(1)}
                  tabIndex={0}
                  onKeyUp={(e) => {
                    if (e.key === "Enter") {
                      setBackConfirmationModal(1);
                      e.stopPropagation();
                    }
                  }}
                  className={styles.SkipBtn}
                  disabled={spinner}
                  id="pmweb_cancelBtn_processCreationByTempAI"
                  children={t("cancel")}
                />
              )}
            </Grid>
          </Grid>
          {!showAIProcessCreation && (
            <Grid container wrap="nowrap" className={styles.templateContainer}>
              <SelectTemplateType
                data={JSON.parse(JSON.stringify(data || {}))}
                handleClickProcess={handleClickProcess}
                categoryList={categoryList}
                handleViewAllClick={handleViewAllClick}
                setModalClicked={setModalClicked}
                setSelectedTemplate={setSelectedTemplate}
                cancelHandler={cancelHandler}
                setShowAIProcessCreation={setShowAIProcessCreation}
              />
            </Grid>
          )}
          {showAIProcessCreation && (
            <Grid
              container
              wrap="nowrap"
              xs={12}
              style={
                spinner && !isRegenerated
                  ? {
                      height: "98.8%",
                      paddingTop: "1rem",
                      background: "#F7F7F7",
                      marginTop: "3px",
                    }
                  : {
                      height: "100%",
                    }
              }
            >
              <Grid
                item
                xs={spinner && !isRegenerated ? 12 : 9}
                style={{
                  height: "92%",
                  borderBlock: "1px solid #CECECE",
                  background: spinner && !isRegenerated ? "#FFF" : "inherit",
                  boxShadow: "0px 3px 4px 0px rgba(0, 0, 0, 0.12)",
                }}
              >
                <AIProcessCreation
                  processName={data?.processName}
                  processData={JSON.parse(JSON.stringify(processData || {}))}
                  spinner={spinner}
                  updateProcessData={updateProcessData}
                  NoOutput={NoOutputWasGenerated}
                  setShowAIProcessCreation={setShowAIProcessCreation}
                  setSpinner={setSpinner}
                  cancelAPICall={cancelAPICall}
                  showDeleteModal={showDeleteModal}
                  setShowDeleteModal={setShowDeleteModal}
                  showCommonDeleteModal={showCommonDeleteModal}
                  setShowCommonDeleteModal={setShowCommonDeleteModal}
                  tabValue={tabValue}
                  setTabValue={setTabValue}
                />
              </Grid>
              {!(spinner && !isRegenerated) && (
                <Grid
                  item
                  container
                  className={styles.item2}
                  xs={3}
                  style={{
                    opacity: showDeleteModal ? "0.5" : "1",
                    pointerEvents: showDeleteModal ? "none" : "auto",
                  }}
                >
                  <CreateProcessByAI
                    data={JSON.parse(JSON.stringify(data || {}))}
                    IsRegenerate={true}
                    ClickProcess={handleClickProcess}
                    createHandler={() => setShowCreateModal(!showCreateModal)}
                    disableBtn={spinner}
                    setShowRegenerateModal={setShowRegenerateModal}
                    processData={JSON.parse(JSON.stringify(processData || {}))}
                    //  allGeneratedPromptHistory={allAIGeneratedProcesses}
                    showHistoryBtn={true}
                  />
                  {isPromptHistoryOpen && (
                    <Drawer
                      anchor={direction === RTL_DIRECTION ? "left" : "right"}
                      open={isPromptHistoryOpen}
                      // onClose={toggleDrawer("right", false)}
                      classes={{
                        paper: styles.drawerPaper,
                      }}
                      /*  slotProps={{
                        backdrop: {
                          open: false,
                        },
                        
                      }}*/
                      hideBackdrop={true}
                    >
                      <Grid container direction="column">
                        <Grid
                          item
                          container
                          justifyContent={"space-between"}
                          alignItems="center"
                          style={{ padding: "16px", direction: direction }}
                        >
                          <Grid item>
                            <Typography
                              variant="h5"
                              style={{
                                fontSize: "14px",
                                fontWeight: 600,
                                fontFamily: "Open Sans",
                              }}
                            >
                              {t("promptHistory")}
                            </Typography>
                          </Grid>
                          <Grid item>
                            <IconButton
                              id="pmweb_createProcessByTemplate_WithAIGenAI_promtHistoryCloseBtn"
                              data-testid="pmweb_createProcessByTemplate_WithAIGenAI_promtHistoryCloseBtn"
                              role="button"
                              aria-label="Close Prompt History"
                              onClick={closePromptHistoryPanel}
                              disabled={isLoadingPreviewProcessData}
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  closePromptHistoryPanel();
                                }
                              }}
                              className={styles.backIconContainer}
                              disableFocusRipple
                              disableTouchRipple
                              disableRipple
                            >
                              <CloseIcon />
                            </IconButton>
                          </Grid>
                        </Grid>
                        <Divider orientation={"horizontal"} />
                        <Grid item style={{ padding: "16px" }}>
                          <div className={styles.promptHistoryContainer}>
                            {allAIGeneratedProcesses.map(
                              (marvinGeneratedProcess) => (
                                <React.Fragment key={marvinGeneratedProcess.id}>
                                  <PromptHistory
                                    marvinGeneratedProcess={
                                      marvinGeneratedProcess
                                    }
                                  />
                                </React.Fragment>
                              )
                            )}
                          </div>
                        </Grid>
                      </Grid>
                    </Drawer>
                  )}
                </Grid>
              )}
            </Grid>
          )}
          {showCreateModal && (
            <Modal
              show={showCreateModal}
              style={{
                padding: "0",
                borderRadius: "2px",
                border: "0",
                boxShadow: "none",
                width: "32%",
                left: "34%",
                top: "32%",
              }}
              hideBackdrop={false}
              children={
                <CreateProcessModal
                  modalCloseHandler={() => setShowCreateModal(false)}
                  CreateProcessByAIHandler={handleCreateProcessByAI}
                  createSpinner={createSpinner}
                  processName={data?.processName}
                />
              }
            />
          )}
          {modalClicked ? (
            <Modal
              show={modalClicked}
              style={{
                width: "100vw",
                height: `calc(100% - ${APP_HEADER_HEIGHT})`,
                left: "0",
                top: APP_HEADER_HEIGHT,
                padding: "0",
              }}
              hideBackdrop={true}
              modalClosed={() => setModalClicked(false)}
              children={
                <ProcessCreation
                  showCreateProcessByAI={true}
                  moveBackFunction={() => setModalClicked(false)}
                  selectedTemplate={selectedTemplate}
                  backBtnLabel="backToTemplateSelection"
                  templatePage={
                    props.CreateProcessFlag ===
                    CREATE_PROCESS_FLAG_FROM_PROCESSES
                      ? PREVIOUS_PAGE_CREATE_FROM_PROCESSES
                      : props.CreateProcessFlag ===
                        CREATE_PROCESS_FLAG_FROM_PROCESS
                      ? PREVIOUS_PAGE_CREATE_FROM_PROCESS
                      : null
                  }
                  createProcessFlag={
                    props.CreateProcessFlag ===
                      CREATE_PROCESS_FLAG_FROM_PROCESSES ||
                    props.CreateProcessFlag === CREATE_PROCESS_FLAG_FROM_PROCESS
                  }
                />
              }
            />
          ) : null}
          {backConfirmationModal !== null && (
            <Modal
              show={backConfirmationModal !== null}
              style={{
                width: "27%",
                position: "absolute",
                top: "32%",
                left: "36.5%",
                padding: "0",
                boxShadow: "none",
                border: "0",
              }}
              backDropStyle={{
                position: "absolute",
              }}
              children={
                <ConfirmationModal
                  modalHeading={t("warning")}
                  isWarning={true}
                  cancelButtonText={t("No")}
                  confirmButtonText={t("Yes")}
                  confirmationMessage={t("backWarningMsg")}
                  confirmFunc={() => {
                    if (backConfirmationModal === 0) {
                      handleBack();
                    } else {
                      cancelHandler();
                    }
                    setBackConfirmationModal(null);
                  }}
                  modalCloseHandler={() => setBackConfirmationModal(null)}
                />
              }
            />
          )}
          {/*showRegenerateModal !== null && (
            <Modal
              show={showRegenerateModal !== null}
              style={{
                width: "27%",
                position: "absolute",
                top: "32%",
                left: "36.5%",
                padding: "0",
                boxShadow: "none",
                border: "0",
              }}
              backDropStyle={{
                position: "absolute",
              }}
              children={
                <ConfirmationModal
                  modalHeading={t("warning")}
                  isWarning={true}
                  cancelButtonText={t("No")}
                  confirmButtonText={t("Yes")}
                  confirmationMessage={t("regenerateWarningMsg")}
                  confirmFunc={() => {
                    handleClickProcess(showRegenerateModal.data, true);
                    setShowRegenerateModal(null);
                  }}
                  modalCloseHandler={() => setShowRegenerateModal(null)}
                />
              }
            />
            )*/}
          {showErrorInfoModal !== null && (
            <Modal
              show={showErrorInfoModal !== null}
              style={{
                width: "42%",
                position: "absolute",
                top: "15%",
                left: "29%",
                padding: "0",
                boxShadow: "none",
                border: "0",
              }}
              children={
                <ErrorInfoModal
                  errors={
                    showErrorInfoModal?.dataObjectCreationSummary
                      ?.failedDataObjects
                  }
                  information={
                    showErrorInfoModal?.dataObjectCreationSummary
                      ?.renamedDataObjects
                      ? showErrorInfoModal?.dataObjectCreationSummary
                          ?.renamedDataObjects
                      : []
                  }
                  okHandler={() => {
                    redirectToProcessScreen(showErrorInfoModal?.OpenProcess);
                    setShowErrorInfoModal(null);
                  }}
                  processName={data?.processName}
                />
              }
            />
          )}
        </React.Fragment>
      )}
    </React.Fragment>
  );
}

const mapDispatchToProps = (dispatch) => {
  return {
    openProcessClick: (id, name, type, version, processName) =>
      dispatch(
        actionCreators.openProcessClick(id, name, type, version, processName)
      ),
    openTemplate: (id, name, flag) =>
      dispatch(actionCreators.openTemplate(id, name, flag)),
    CreateProcessClickFlag: (flag) =>
      dispatch(actionCreators.createProcessFlag(flag)),
    setTemplatePage: (value) =>
      dispatch(actionCreators_template.storeTemplatePage(value)),
    setTemplateDetails: (
      category,
      view,
      createBtnClick,
      template,
      projectName,
      isProjectNameConstant,
      processName,
      files
    ) =>
      dispatch(
        actionCreators_template.setTemplateDetails(
          category,
          view,
          createBtnClick,
          template,
          projectName,
          isProjectNameConstant,
          processName,
          files
        )
      ),
  };
};

const mapStateToProps = (state) => {
  return {
    getTemplatePage: state.templateReducer.template_page,
    CreateProcessFlag: state.createProcessFlag.clickedCreateProcess,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CreateProcessByTemplate_WithAI);
