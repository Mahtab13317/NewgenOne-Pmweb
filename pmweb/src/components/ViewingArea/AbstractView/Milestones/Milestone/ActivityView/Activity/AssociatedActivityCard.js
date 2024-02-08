import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import {
  Box,
  Grid,
  Card,
  CardContent,
  ClickAwayListener,
  Typography,
} from "@material-ui/core";
import defaultLogo from "../../../../../../../assets/abstractView/Icons/default.svg";
import { Draggable } from "react-beautiful-dnd";
import DragIndicatorIcon from "@material-ui/icons/DragIndicator";
import ActivityCheckedOutLogo from "../../../../../../../assets/bpmnViewIcons/ActivityCheckedOut.svg";
import styles from "./AssociatedActivityCard.module.css";
import ToolsList from "../../../../../BPMNView/Toolbox/ToolsList";
import CheckOutActModal from "./CheckoutActivity";
import UIModal from "../../../../../../../UI/Modal/Modal.js";
import {
  intermediateEvents,
  gateway,
  integrationPoints,
  caseWorkdesk,
  callActivity,
} from "../../../../../../../utility/bpmnView/toolboxIcon";
import { useTranslation } from "react-i18next";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import {
  MENUOPTION_CHECKIN_ACT,
  MENUOPTION_CHECKOUT_ACT,
  MENUOPTION_UNDO_CHECKOUT_ACT,
  PROCESSTYPE_LOCAL,
  PROCESSTYPE_LOCAL_CHECKED,
  PROCESSTYPE_REGISTERED,
  RTL_DIRECTION,
  SPACE,
  userRightsMenuNames,
  view,
} from "../../../../../../../Constants/appConstants";
import { getActivityProps } from "../../../../../../../utility/abstarctView/getActivityProps";
import { listOfImages } from "../../../../../../../utility/iconLibrary";
import { useDispatch, useSelector } from "react-redux";
import { validateActivityObject } from "../../../../../../../utility/CommonAPICall/validateActivityObject";
import { setToastDataFunc } from "../../../../../../../redux-store/slices/ToastDataHandlerSlice";
import { FieldValidations } from "../../../../../../../utility/FieldValidations/fieldValidations";
import { getRenameActivityQueueObj } from "../../../../../../../utility/abstarctView/getRenameActQueueObj";
import { renameActivity } from "../../../../../../../utility/CommonAPICall/RenameActivity";
import Modal from "../../../../../../../UI/ActivityModal/Modal";
import { deleteActivity } from "../../../../../../../utility/CommonAPICall/DeleteActivity";
import { ChangeActivityType } from "../../../../../../../utility/CommonAPICall/ChangeActivityType";
import UndoCheckoutActivity from "./UndoCheckoutActivity";
import CheckInActivity from "./CheckInActivity";
import ModalForm from "../../../../../../../UI/ModalForm/modalForm";
import {
  activitiesNotAllowedInEmbedded,
  style,
} from "../../../../../../../Constants/bpmnView";
import { getEmbeddedActivities } from "../../../../../../../utility/ViewingArea/CaseEnabledActivities";
import "../activitiesArabic.css";
import clsx from "clsx";
import okRename from "../../../../../../../assets/abstractView/okRename.svg";
import cancelRename from "../../../../../../../assets/abstractView/cancelRename.svg";
import {
  checkIfActHasSystemQueue,
  validateEntity,
} from "../../../../../../../utility/abstarctView/addWorkstepAbstractView";
import { LatestVersionOfProcess } from "../../../../../../../utility/abstarctView/checkLatestVersion";
import { store, useGlobalState } from "state-pool";
import { getMenuNameFlag } from "../../../../../../../utility/UserRightsFunctions";
import { UserRightsValue } from "../../../../../../../redux-store/slices/UserRightsSlice";

export function AssociatedActivityCard(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const dispatch = useDispatch();
  const activityRef = useRef();
  let sortSectionOne, sortSectionTwo, sortSectionLocalProcess;
  const [inputValue, setInputValue] = useState("");
  const [showDragIcon, setShowDragIcon] = useState(false);
  const [activityType, setactivityType] = useState(false);
  const [isDefaultIcon, setIsDefaultIcon] = useState(false);
  const [actRenamed, setActRenamed] = useState(null);
  const [openQRenameConfModal, setOpenQueueRenameConfirmationModal] =
    useState(false);
  const [searchedVal, setSearchedVal] = useState("");
  const [actionModal, setActionModal] = useState(null);
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const userRightsValue = useSelector(UserRightsValue);

  // Boolean that decides whether user can modify activity.
  const modifyActivityRightsFlag = getMenuNameFlag(
    userRightsValue?.menuRightsList,
    userRightsMenuNames.modifyActivity
  );

  let activityProps = getActivityProps(
    props.ActivityType,
    props.ActivitySubType,
    "embedded"
  );

  useLayoutEffect(() => {
    if (
      isReadOnly ||
      activityProps[5] === style.embEndEvent ||
      activityProps[5] === style.embStartEvent ||
      !modifyActivityRightsFlag ||
      props.processData.ProcessType === PROCESSTYPE_REGISTERED ||
      props.processData.ProcessType === "RC" ||
      LatestVersionOfProcess(localLoadedProcessData?.Versions) !==
        +localLoadedProcessData?.VersionNo
    ) {
      activityRef.current.style.setProperty("border", "none", "important");
      activityRef.current.style.setProperty(
        "background-color",
        "inherit",
        "important"
      );
      activityRef.current.style.setProperty("color", "black", "important");
      // added on 04/09/2023 for BugId 134634
      activityRef.current.style.setProperty("pointer-events", "none");
    }
  }, []);

  useEffect(() => {
    setInputValue(props.ActivityName);
    activityProps = getActivityProps(
      props.ActivityType,
      props.ActivitySubType,
      "embedded"
    );
  }, [props.ActivityType, props.ActivitySubType, props.ActivityName]);

  let toolTypeList = [
    getEmbeddedActivities([callActivity]),
    intermediateEvents,
    gateway,
    integrationPoints,
  ];

  const {
    index,
    embeddedActivities,
    setEmbeddedActivities,
    isParentLaneCheckedOut,
    tabsList,
    caseEnabled,
    isReadOnly,
  } = props;

  useEffect(() => {
    let isDefault = true;
    let tempJson = JSON.parse(JSON.stringify(props.processData));
    tempJson?.MileStones?.forEach((mile) => {
      mile?.Activities?.forEach((act) => {
        act.EmbeddedActivity &&
          act.EmbeddedActivity[0]?.forEach((emAct) => {
            if (+emAct.ActivityId === +props.ActivityId) {
              if (emAct.ImageName && emAct.ImageName?.trim() !== "") {
                isDefault = false;
              }
            }
          });
      });
    });
    setIsDefaultIcon(isDefault);
  }, [props.processData]);

  const getActivityIcon = () => {
    let iconName = null;
    let tempJson = JSON.parse(JSON.stringify(props.processData));
    tempJson?.MileStones?.forEach((mile) => {
      mile?.Activities?.forEach((act) => {
        act.EmbeddedActivity &&
          act.EmbeddedActivity[0]?.forEach((emAct) => {
            if (+emAct.ActivityId === +props.ActivityId) {
              iconName = act.ImageName;
            }
          });
      });
    });
    let iconImage;
    listOfImages?.names?.forEach((el, index) => {
      if (el === iconName) {
        iconImage = listOfImages?.images[index];
      }
    });
    return iconImage?.default;
  };

  // Function that gets options for context menu by checking whether the process is
  // case enabled or not.
  const getOptions = () => {
    if (caseEnabled) {
      return [t("ConvertToCaseWorkdesk"), t("Properties")];
    } else return [t("Properties")];
  };

  // Function that handles the change in name of the card.
  const handleChange = (value) => {
    if (inputValue === embeddedActivities[index].ActivityName) {
      validateActivityObject({
        processDefId: props.processData.ProcessDefId,
        processType: props.processData.ProcessType,
        activityName: embeddedActivities[index].ActivityName,
        activityId: embeddedActivities[index].ActivityId,
        errorMsg: `${t("renameValidationErrorMsg")}`,
        onSuccess: (workitemValidationFlag) => {
          if (!workitemValidationFlag) {
            setInputValue(value);
          }
        },
        dispatch,
      });
    } else {
      setInputValue(value);
    }
  };

  // Function that handles the selected activity for the card.
  const selectedActivityName = (activityType, subActivityType) => {
    embeddedActivities[index].ActivityType = activityType;
    embeddedActivities[index].ActivitySubType = subActivityType;
    setEmbeddedActivities([...embeddedActivities]);
    setactivityType(false);
    setShowDragIcon(false);
  };

  // Function that runs when a draggable item is dragged over a droppable region.
  const onDragOverHandler = (e) => {
    e.preventDefault();
  };

  // Function that handles the click away handle for the cards.
  const handleClickAway = () => {
    setactivityType(false);
    let currentAct = embeddedActivities[index];
    if (
      inputValue !== currentAct.ActivityName &&
      inputValue?.trim() !== "" &&
      actRenamed === props.ActivityId
    ) {
      setInputValue(currentAct.ActivityName);
      setActRenamed(null);
    } else if (inputValue?.trim() === "") {
      setInputValue(currentAct.ActivityName);
      setActRenamed(null);
      dispatch(
        setToastDataFunc({
          message: t("EntityCantBeBlank", {
            entityName: t("ActivityName"),
          }),
          severity: "error",
          open: true,
        })
      );
    }
    if (props.selectedActivity === props.ActivityId) {
      props.selectActivityHandler(null);
    }
  };

  // Function that gets called when the user changes the activity name and clicksaway from the field.
  const handleRenameActivityFunction = (resetVal) => {
    let actNameExists = false,
      errorMsg = "";
    let [isValid, errMsg] = validateEntity(inputValue, t, t("ActivityName"));
    if (isValid) {
      props.processData?.MileStones?.forEach((milestone) => {
        if (
          milestone.MileStoneName?.toLowerCase() ===
            inputValue?.toLowerCase() &&
          !actNameExists
        ) {
          actNameExists = true;
          errorMsg = t("entity1_SameEntity2NameError", {
            Entity1: t("ActivityName"),
            Entity2: t("milestoneName"),
          });
        } else if (!actNameExists) {
          milestone?.Activities?.forEach((act) => {
            if (
              act.ActivityName?.toLowerCase() === inputValue?.toLowerCase() &&
              !actNameExists
            ) {
              actNameExists = true;
              errorMsg = t("entitySameNameError", {
                entityName: t("Activity"),
              });
            }
            if (act.EmbeddedActivity && act.EmbeddedActivity?.length > 0) {
              act.EmbeddedActivity[0]?.forEach((embAct) => {
                if (
                  embAct.ActivityName?.toLowerCase() ===
                    inputValue?.toLowerCase() &&
                  !actNameExists
                ) {
                  actNameExists = true;
                  errorMsg = t("entitySameNameError", {
                    entityName: t("Activity"),
                  });
                }
              });
            }
          });
        }
      });
      if (!actNameExists) {
        props.processData?.Lanes?.forEach((swimlane) => {
          if (
            swimlane.LaneName?.toLowerCase() === inputValue?.toLowerCase() &&
            !actNameExists
          ) {
            actNameExists = true;
            errorMsg = t("entity1_SameEntity2NameError", {
              Entity1: t("ActivityName"),
              Entity2: t("swimlaneName"),
            });
          }
        });
      }
      if (!actNameExists) {
        const qId = embeddedActivities[index]?.QueueId;
        if (qId && qId < 0) {
          if (
            isSwimlaneQueue(qId) ||
            checkIfActHasSystemQueue(props.ActivityType, props.ActivitySubType) // added on 28/09/23 for BugId 136079
          ) {
            renameActivityFunc(false);
          } else {
            setOpenQueueRenameConfirmationModal(true);
          }
        } else {
          renameActivityFunc(false);
        }
        setActRenamed(null);
      } else {
        if (resetVal) {
          setInputValue(embeddedActivities[index].ActivityName);
        }
        dispatch(
          setToastDataFunc({
            message: errorMsg,
            severity: "error",
            open: true,
          })
        );
      }
    } else {
      if (resetVal) {
        setInputValue(embeddedActivities[index].ActivityName);
      }
      dispatch(
        setToastDataFunc({
          message: errMsg,
          severity: "error",
          open: true,
        })
      );
    }
  };

  const isSwimlaneQueue = (qId) => {
    const index = props.processData.Lanes?.findIndex(
      (swimlane) => +swimlane.QueueId === +qId
    );

    return index !== -1;
  };

  const renameActivityFunc = (queueRename) => {
    let currentAct = embeddedActivities[index];
    if (inputValue !== currentAct.ActivityName) {
      let queueInfo = getRenameActivityQueueObj(
        currentAct.ActivityType,
        currentAct.ActivitySubType,
        inputValue,
        props.processData,
        currentAct.QueueId,
        t
      );
      renameActivity(
        currentAct.ActivityId,
        currentAct.ActivityName,
        inputValue,
        props.setprocessData,
        props.processData.ProcessDefId,
        props.processData.ProcessName,
        currentAct.QueueId,
        queueInfo,
        false,
        queueRename,
        dispatch,
        t
      );
    }
  };

  const renameActWithoutQueueName = () => {
    renameActivityFunc(false);
    closeQueueRenameModal();
  };

  const renameActWithQueueName = () => {
    renameActivityFunc(true);
    closeQueueRenameModal();
  };

  const closeQueueRenameModal = () => {
    setOpenQueueRenameConfirmationModal(false);
    setInputValue(embeddedActivities[index]?.ActivityName);
  };

  const getActionName = (actionName) => {
    if (actionName === "Properties") {
      props.showDrawer(true);
    } else if (actionName === t("delete")) {
      // added on 29/09/23 for BugId 135398
      props.showDrawer(false);
      let id = embeddedActivities[index].ActivityId;
      let name = embeddedActivities[index].ActivityName;
      let actType = +embeddedActivities[index].ActivityType;
      let actSubType = +embeddedActivities[index].ActivitySubType;
      let isPrimaryAct =
        embeddedActivities[index]?.PrimaryActivity === "Y" ? true : false;
      deleteActivity(
        id,
        name,
        actType,
        actSubType,
        props.processData.ProcessDefId,
        props.setprocessData,
        props.processData?.CheckedOut,
        dispatch,
        t,
        isPrimaryAct
      );
    } else if (actionName === t("Rename")) {
      // added on 29/09/23 for BugId 135398
      props.showDrawer(false);
      validateActivityObject({
        processDefId: props.processData.ProcessDefId,
        processType: props.processData.ProcessType,
        activityName: embeddedActivities[index].ActivityName,
        activityId: embeddedActivities[index].ActivityId,
        errorMsg: `${t("renameValidationErrorMsg")}`,
        onSuccess: (workitemValidationFlag) => {
          if (!workitemValidationFlag) {
            activityRef?.current?.select();
            activityRef?.current?.focus();
          }
        },
        dispatch,
      });
    } else if (actionName === t("ConvertToCaseWorkdesk")) {
      // added on 29/09/23 for BugId 135398
      props.showDrawer(false);
      ChangeActivityType(
        props.processData.ProcessDefId,
        embeddedActivities[index].ActivityName,
        caseWorkdesk.activityTypeId,
        caseWorkdesk.activitySubTypeId,
        props.setprocessData,
        props.milestoneIndex,
        props.activityindex,
        embeddedActivities[index].ActivityId
      );
    } else if (actionName === t("Checkout")) {
      // added on 29/09/23 for BugId 135398
      props.showDrawer(false);
      setActionModal(MENUOPTION_CHECKOUT_ACT);
    } else if (actionName === t("undoCheckout")) {
      // added on 29/09/23 for BugId 135398
      props.showDrawer(false);
      setActionModal(MENUOPTION_UNDO_CHECKOUT_ACT);
    } else if (actionName === t("checkIn")) {
      // added on 29/09/23 for BugId 135398
      props.showDrawer(false);
      setActionModal(MENUOPTION_CHECKIN_ACT);
    }
  };

  const handleRenameTickClickFunc = () => {
    let currentAct = embeddedActivities[index];
    if (
      inputValue !== currentAct.ActivityName &&
      inputValue?.trim() !== "" &&
      actRenamed !== null
    ) {
      handleRenameActivityFunction(true);
      setActRenamed(null);
    } else if (inputValue?.trim() === "") {
      setInputValue(currentAct.ActivityName);
      setActRenamed(null);
      dispatch(
        setToastDataFunc({
          message: t("EntityCantBeBlank", {
            entityName: t("ActivityName"),
          }),
          severity: "error",
          open: true,
        })
      );
    }
  };

  if (
    props.processType !== PROCESSTYPE_LOCAL &&
    props.processData.CheckedOut === "N" &&
    !isParentLaneCheckedOut
  ) {
    if (embeddedActivities[index].CheckedOut === "N") {
      sortSectionLocalProcess = [t("Properties"), t("Checkout")];
    } else if (embeddedActivities[index].CheckedOut === "Y") {
      sortSectionLocalProcess = [
        t("Properties"),
        t("undoCheckout"),
        t("checkIn"),
      ];
    }
  } else if (+props.activityType === 10 && +props.activitySubType === 3) {
    sortSectionOne = tabsList;
    sortSectionTwo = getOptions();
  } else {
    sortSectionOne = activitiesNotAllowedInEmbedded.includes(activityProps[5])
      ? [t("Rename")]
      : [t("Rename"), t("delete")];
    sortSectionTwo = [t("Properties")];
  }

  return (
    <>
      <Draggable draggableId={`${index}`} key={`${index}`} index={index}>
        {(provided) => (
          <ClickAwayListener onClickAway={() => handleClickAway()}>
            <div
              className={styles.cardDiv}
              {...provided.draggableProps}
              ref={provided.innerRef}
              onDragOver={(e) => onDragOverHandler(e)}
            >
              <Box>
                <Card
                  onMouseOver={() => {
                    if (
                      !isReadOnly &&
                      activityProps[5] !== style.embEndEvent &&
                      activityProps[5] !== style.embStartEvent
                    ) {
                      setShowDragIcon(true);
                    }
                  }}
                  onMouseLeave={() => {
                    if (!isReadOnly) {
                      setShowDragIcon(false);
                    }
                  }}
                  id={`pmweb_assAct_${props.ActivityId}`}
                  variant="outlined"
                  className={clsx(
                    styles.card,
                    props.selectedActivity === props.ActivityId
                      ? "cardSelected"
                      : null
                  )}
                >
                  <CardContent
                    id={`pmweb_assAct_mainContent_${props.ActivityId}`}
                    className={`${activityProps[1]} ${styles.cardContent}`}
                    onDoubleClick={() => {
                      if (
                        activityProps[5] !== style.embStartEvent &&
                        activityProps[5] !== style.embEndEvent
                      ) {
                        props.showDrawer(true);
                      }
                    }}
                    onClick={() => {
                      props.selectActivityHandler(embeddedActivities[index]);
                      props.setprocessData((prev) => {
                        let newObj = JSON.parse(JSON.stringify(prev));
                        newObj.MileStones.forEach((mile, mileIndex) => {
                          mile.Activities.forEach((act, actIndex) => {
                            act.EmbeddedActivity &&
                              act.EmbeddedActivity[0]?.forEach(
                                (embAc, embActIndex) => {
                                  if (embAc?.clicked) {
                                    newObj.MileStones[mileIndex].Activities[
                                      actIndex
                                    ].EmbeddedActivity[0][embActIndex] = {
                                      ...newObj.MileStones[mileIndex]
                                        .Activities[actIndex]
                                        .EmbeddedActivity[0][embActIndex],
                                      clicked: false,
                                    };
                                  } else if (
                                    props.ActivityId === embAc.ActivityId
                                  ) {
                                    newObj.MileStones[mileIndex].Activities[
                                      actIndex
                                    ].EmbeddedActivity[0][embActIndex] = {
                                      ...newObj.MileStones[mileIndex]
                                        .Activities[actIndex]
                                        .EmbeddedActivity[0][embActIndex],
                                      clicked: true,
                                    };
                                  }
                                }
                              );
                          });
                        });

                        return newObj;
                      });
                    }}
                  >
                    <Box
                      pl={1}
                      ml={1}
                      style={{
                        marginInlineStart: "0.75rem",
                      }}
                    >
                      {embeddedActivities[index].CheckedOut === "Y" &&
                        !isParentLaneCheckedOut && (
                          <img
                            src={ActivityCheckedOutLogo}
                            alt="Checked-out"
                            className={styles.checkedOutIcon}
                          />
                        )}
                      <Grid container style={{ alignItems: "center" }}>
                        <Grid item style={{ height: "1.75rem" }}>
                          {showDragIcon &&
                          !activitiesNotAllowedInEmbedded.includes(
                            activityProps[5]
                          ) &&
                          (props.processType === PROCESSTYPE_LOCAL ||
                            props.processType === PROCESSTYPE_LOCAL_CHECKED) ? (
                            <div
                              className="dragIcon"
                              {...provided.dragHandleProps}
                              tabIndex={-1}
                            >
                              <DragIndicatorIcon className={styles.dragIcon} />
                            </div>
                          ) : (
                            <img
                              src={
                                isDefaultIcon
                                  ? !!props.ActivityType
                                    ? activityProps[0]
                                    : defaultLogo
                                  : getActivityIcon()
                              }
                              className={styles.logoSize}
                              alt="Default"
                            />
                          )}
                        </Grid>
                        <Grid
                          item
                          id={`activityInputId_${props.ActivityId}`}
                          style={{ width: "65%" }}
                        >
                          <span title={inputValue}>
                            <input
                              id={`pmweb_assActInput_${props.ActivityId}`}
                              className={styles.activityInput}
                              onChange={(e) => {
                                if (actRenamed === null) {
                                  setActRenamed(props.ActivityId);
                                }
                                handleChange(e.target.value);
                              }}
                              aria-label={props?.ActivityName}
                              value={inputValue}
                              onDragOver={(e) => {
                                return;
                              }}
                              onKeyPress={(e) => {
                                if (e.code === "Enter") {
                                  if (
                                    inputValue !==
                                      embeddedActivities[index].ActivityName &&
                                    inputValue?.trim() !== "" &&
                                    actRenamed === props.ActivityId
                                  ) {
                                    handleRenameActivityFunction(false);
                                  } else if (inputValue?.trim() === "") {
                                    setInputValue(
                                      embeddedActivities[index].ActivityName
                                    );
                                    dispatch(
                                      setToastDataFunc({
                                        message: t("EntityCantBeBlank", {
                                          entityName: t("ActivityName"),
                                        }),
                                        severity: "error",
                                        open: true,
                                      })
                                    );
                                  }
                                } else if (e.code === "Tab") {
                                  let currentAct = embeddedActivities[index];
                                  setInputValue(currentAct.ActivityName);
                                  setActRenamed(null);
                                } else {
                                  FieldValidations(
                                    e,
                                    180,
                                    activityRef.current,
                                    30
                                  );
                                }
                              }}
                              ref={activityRef}
                              disabled={
                                isReadOnly ||
                                !modifyActivityRightsFlag ||
                                activityProps[5] === style.embEndEvent ||
                                activityProps[5] === style.embStartEvent ||
                                props.processData.ProcessType ===
                                  PROCESSTYPE_REGISTERED ||
                                props.processData.ProcessType === "RC" ||
                                LatestVersionOfProcess(
                                  localLoadedProcessData?.Versions
                                ) !== +localLoadedProcessData?.VersionNo
                                  ? true
                                  : null
                              }
                            />
                          </span>
                        </Grid>
                        <Grid item className="moreVertIconDiv">
                          {!isReadOnly &&
                          activityProps[5] !== style.embEndEvent &&
                          activityProps[5] !== style.embStartEvent ? (
                            actRenamed === props.ActivityId ? (
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.75vw",
                                }}
                              >
                                <img
                                  id={`pmweb_cancelRename_${props.ActivityId}`}
                                  src={cancelRename}
                                  style={{
                                    width: "1.25rem",
                                    height: "1.25rem",
                                    cursor: "pointer",
                                  }}
                                  alt="Cancel Rename"
                                  onClick={() => {
                                    let currentAct = embeddedActivities[index];
                                    setInputValue(currentAct.ActivityName);
                                    setActRenamed(null);
                                  }}
                                />
                                <img
                                  id={`pmweb_okRename_${props.ActivityId}`}
                                  alt="Ok Rename"
                                  src={okRename}
                                  style={{
                                    width: "1.25rem",
                                    height: "1.25rem",
                                    cursor: "pointer",
                                  }}
                                  onClick={handleRenameTickClickFunc}
                                />
                              </div>
                            ) : (
                              (sortSectionOne?.length > 0 ||
                                sortSectionTwo?.length > 0 ||
                                sortSectionLocalProcess?.length > 0) && (
                                <Modal
                                  backDrop={false}
                                  getActionName={getActionName}
                                  modalPaper="modalPaperActivity"
                                  sortByDiv="sortByDivActivity"
                                  sortByDiv_arabic="sortByDiv_arabicActivity"
                                  oneSortOption="oneSortOptionActivity"
                                  showTickIcon={false}
                                  sortSectionOne={sortSectionOne}
                                  sortSectionTwo={sortSectionTwo}
                                  processData={props.processData}
                                  isParentLaneCheckedOut={
                                    isParentLaneCheckedOut
                                  }
                                  sortSectionLocalProcess={
                                    sortSectionLocalProcess
                                  }
                                  buttonToOpenModal={
                                    <div
                                      className="threeDotsButton"
                                      id={`pmweb_assActMoreIcon_${props.ActivityId}`}
                                      tabIndex={0}
                                    >
                                      <MoreVertIcon
                                        style={{
                                          color: "#606060",
                                          height: "1.25rem",
                                          width: "1.25rem",
                                        }}
                                      />
                                    </div>
                                  }
                                  modalWidth="180"
                                  dividerLine="dividerLineActivity"
                                  isArabic={false}
                                  processType={props.processType}
                                />
                              )
                            )
                          ) : null}
                        </Grid>
                      </Grid>
                    </Box>
                    <Box pl={1} ml={1} pt={1} className="row">
                      <Grid container>
                        <Grid
                          item
                          className={
                            direction === RTL_DIRECTION
                              ? styles.activityTypeListArabic
                              : styles.activityTypeList
                          }
                        >
                          {props.ActivityType ? (
                            <p
                              className={
                                direction === RTL_DIRECTION
                                  ? "selectedActivityTypeArabic"
                                  : "selectedActivityType"
                              }
                              style={{
                                color: activityProps[2],
                                background:
                                  activityProps[3] +
                                  " 0% 0% no-repeat padding-box",
                                padding: "2px 7px",
                              }}
                              id={`workdeskType_${props.ActivityId}`}
                              // onClick={() => {
                              //   if (
                              //     !activitiesNotAllowedInEmbedded.includes(
                              //       activityProps[5]
                              //     )
                              //   ) {
                              //     setactivityType(true);
                              //   }
                              // }}
                            >
                              {t(
                                getActivityProps(
                                  props.ActivityType,
                                  props.ActivitySubType
                                )[4]
                              )}
                            </p>
                          ) : props.ActivityType === "" ||
                            props.ActivityType == null ? (
                            <div
                              id={`workdeskType_${props.ActivityId}`}
                              className={
                                direction === RTL_DIRECTION
                                  ? "workdeskTypeArabic"
                                  : "workdeskType"
                              }
                            >
                              {t("workstepType")}
                              <ExpandMoreIcon className="expandedIcon" />
                            </div>
                          ) : null}

                          {activityType ? (
                            <ToolsList
                              toolTypeList={toolTypeList}
                              subActivities="subActivities"
                              oneToolList="oneToolList"
                              mainMenu="mainMenu"
                              toolContainer="toolContainer"
                              toolTypeContainerExpanded="activity_dropdown"
                              toolTypeContainerExpandedClass={
                                direction === RTL_DIRECTION
                                  ? "activity_dropdownArabic"
                                  : "activity_dropdown"
                              }
                              expandedList="activityDropdown_List"
                              search={true}
                              selectedActivityName={selectedActivityName}
                              searchedVal={searchedVal} //code added on 3 June 2022 for BugId 110210
                              setSearchedVal={setSearchedVal} //code added on 3 June 2022 for BugId 110210
                              view={view.abstract.langKey}
                              innerList="activityInnerList"
                              bFromActivitySelection={activityType}
                              graph={null}
                              style={{
                                right: direction === "rtl" ? "65%" : "none",
                              }}
                            />
                          ) : null}
                        </Grid>
                      </Grid>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
              {provided.placeholder}
            </div>
          </ClickAwayListener>
        )}
      </Draggable>
      {actionModal === MENUOPTION_CHECKOUT_ACT ? (
        <UIModal
          show={actionModal === MENUOPTION_CHECKOUT_ACT}
          style={{
            padding: "0",
            width: "33vw",
            left: "33%",
            top: "30%",
          }}
          modalClosed={() => setActionModal(null)}
          children={
            <CheckOutActModal
              setModalClosed={() => setActionModal(null)}
              modalType={MENUOPTION_CHECKOUT_ACT}
              actName={embeddedActivities[index].ActivityName}
              actId={embeddedActivities[index].ActivityId}
              laneId={embeddedActivities[index].LaneId}
              setprocessData={props.setprocessData}
            />
          }
        />
      ) : null}
      {actionModal === MENUOPTION_UNDO_CHECKOUT_ACT ? (
        <UIModal
          show={actionModal === MENUOPTION_UNDO_CHECKOUT_ACT}
          style={{
            padding: "0",
            width: "33vw",
            left: "33%",
            top: "30%",
          }}
          modalClosed={() => setActionModal(null)}
          children={
            <UndoCheckoutActivity
              setModalClosed={() => setActionModal(null)}
              modalType={MENUOPTION_UNDO_CHECKOUT_ACT}
              actName={embeddedActivities[index].ActivityName}
              actId={embeddedActivities[index].ActivityId}
              laneId={embeddedActivities[index].LaneId}
              setprocessData={props.setprocessData}
            />
          }
        />
      ) : null}
      {actionModal === MENUOPTION_CHECKIN_ACT ? (
        <UIModal
          show={actionModal === MENUOPTION_CHECKIN_ACT}
          style={{
            padding: "0",
            width: "33vw",
            left: "33%",
            top: "30%",
          }}
          modalClosed={() => setActionModal(null)}
          children={
            <CheckInActivity
              setModalClosed={() => setActionModal(null)}
              modalType={MENUOPTION_CHECKIN_ACT}
              actName={embeddedActivities[index].ActivityName}
              actId={embeddedActivities[index].ActivityId}
              activity={embeddedActivities[index]}
              setprocessData={props.setprocessData}
            />
          }
        />
      ) : null}

      {openQRenameConfModal && (
        <ModalForm
          title={`${t("Rename")}${SPACE}${t("queue")}`}
          containerHeight={180}
          isOpen={openQRenameConfModal}
          closeModal={closeQueueRenameModal}
          Content={
            <Typography style={{ fontSize: "var(--base_text_font_size)" }}>
              {t("renameQueueMessage")}
            </Typography>
          }
          btn1Title={t("no")}
          onClick1={renameActWithoutQueueName}
          headerCloseBtn={true}
          onClickHeaderCloseBtn={closeQueueRenameModal}
          btn2Title={t("Yes")}
          onClick2={renameActWithQueueName}
        />
      )}
    </>
  );
}
