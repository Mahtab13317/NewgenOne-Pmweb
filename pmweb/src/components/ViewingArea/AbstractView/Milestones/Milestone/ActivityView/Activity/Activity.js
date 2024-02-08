// #BugID - 117237
// #BugDescription - Added else condition for renaming of activities which does not have a queue.
import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import "../Activities.css";
import "../activitiesArabic.css";
import DragIndicatorIcon from "@material-ui/icons/DragIndicator";
import { getActivityProps } from "../../../../../../../utility/abstarctView/getActivityProps";
import c_Names from "classnames";
import { connect, useDispatch, useSelector } from "react-redux";
import * as actionCreators from "../../../../../../../redux-store/actions/Properties/showDrawerAction";
import * as actionCreators_task from "../../../../../../../redux-store/actions/AbstractView/TaskAction";
import * as actionCreatorsOpenProcess from "../../../../../../../redux-store/actions/processView/actions.js";
import {
  Box,
  Card,
  CardContent,
  Grid,
  ClickAwayListener,
  Button,
  Typography,
} from "@material-ui/core";
import Modal from "../../../../../../../UI/ActivityModal/Modal";
import { TaskInActivity } from "./TaskInActivity";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import defaultLogo from "../../../../../../../assets/abstractView/Icons/default.svg";
import okRename from "../../../../../../../assets/abstractView/okRename.svg";
import cancelRename from "../../../../../../../assets/abstractView/cancelRename.svg";
import ActivityCheckedOutLogo from "../../../../../../../assets/bpmnViewIcons/ActivityCheckedOut.svg";
import { useTranslation } from "react-i18next";
import ToolsList from "../../../../../BPMNView/Toolbox/ToolsList";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import EmbeddedActivity from "./EmbeddedActivity";
import {
  startEvents,
  activities,
  intermediateEvents,
  gateway,
  endEvents,
  integrationPoints,
  caseWorkdesk,
} from "../../../../../../../utility/bpmnView/toolboxIcon";
import AddToListDropdown from "../../../../../../../UI/AddToListDropdown/AddToListDropdown";
import dropdown from "../../../../../../../assets/subHeader/dropdown.svg";
import { addSwimLane } from "../../../../../../../utility/CommonAPICall/AddSwimlane";
import { ChangeActivityType } from "../../../../../../../utility/CommonAPICall/ChangeActivityType";
import { renameActivity } from "../../../../../../../utility/CommonAPICall/RenameActivity";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import {
  defaultShapeVertex,
  gridSize,
  milestoneTitleWidth,
  minWidthSpace,
  widthForDefaultVertex,
} from "../../../../../../../Constants/bpmnView";
import { deleteActivity } from "../../../../../../../utility/CommonAPICall/DeleteActivity";
import {
  MENUOPTION_CHECKIN_ACT,
  MENUOPTION_CHECKOUT_ACT,
  MENUOPTION_UNDO_CHECKOUT_ACT,
  PROCESSTYPE_LOCAL,
  userRightsMenuNames,
  PROCESSTYPE_LOCAL_CHECKED,
  PROCESSTYPE_REGISTERED,
  view,
  RTL_DIRECTION,
  SPACE,
} from "../../../../../../../Constants/appConstants";
import { useHistory } from "react-router-dom";
import { store, useGlobalState } from "state-pool";
import { MoveActivity } from "../../../../../../../utility/CommonAPICall/MoveActivity";
import {
  checkIfActHasSystemQueue,
  milestoneWidthToIncrease,
  validateEntity,
} from "../../../../../../../utility/abstarctView/addWorkstepAbstractView";
import { UserRightsValue } from "../../../../../../../redux-store/slices/UserRightsSlice";
import { getMenuNameFlag } from "../../../../../../../utility/UserRightsFunctions";
import { getRenameActivityQueueObj } from "../../../../../../../utility/abstarctView/getRenameActQueueObj";
import CheckOutActModal from "./CheckoutActivity";
import UIModal from "../../../../../../../UI/Modal/Modal.js";
import UndoCheckoutActivity from "./UndoCheckoutActivity";
import CheckInActivity from "./CheckInActivity";
import { validateActivityObject } from "../../../../../../../utility/CommonAPICall/validateActivityObject";
import ModalForm from "../../../../../../../UI/ModalForm/modalForm";
import { FieldValidations } from "../../../../../../../utility/FieldValidations/fieldValidations";
import { listOfImages } from "../../../../../../../utility/iconLibrary";
import { setToastDataFunc } from "../../../../../../../redux-store/slices/ToastDataHandlerSlice";
import { checkActivityStatus } from "../../../../../../../utility/SwimlaneCheckedStatus/SwimlaneCheckedStatus";

function Activity(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const userRightsValue = useSelector(UserRightsValue);
  // Boolean that decides whether delete activity button will be visible or not.
  const deleteActivityRightsFlag = getMenuNameFlag(
    userRightsValue?.menuRightsList,
    userRightsMenuNames.deleteActivity
  );

  // Boolean that decides whether user can modify activity.
  const modifyActivityRightsFlag = getMenuNameFlag(
    userRightsValue?.menuRightsList,
    userRightsMenuNames.modifyActivity
  );
  // Boolean that decides whether user can create swimlane.
  const createSwimlaneRightsFlag = getMenuNameFlag(
    userRightsValue?.menuRightsList,
    userRightsMenuNames.createSwimlane
  );
  const history = useHistory();
  const { provided, caseEnabled, isReadOnly } = props;
  let sortSectionOne, sortSectionTwo, sortSectionLocalProcess;
  const [showDragIcon, setShowDragIcon] = useState(false);
  const [showSwimlaneDropdown, setShowSwimlaneDropdown] = useState(false);
  const [activityType, setactivityType] = useState(false);
  let activityProps = getActivityProps(
    props.activityType,
    props.activitySubType
  );
  const [src, setsrc] = useState(activityProps[0]); // icon to be shown in the activity card
  const [classForActivity, setclassForActivity] = useState(activityProps[1]); //classname exported for the activity card
  const [color, setcolor] = useState(activityProps[2]); //color for activity type dropdown
  const [BackgroundColor, setBackgroundColor] = useState(activityProps[3]); //background color used for background of activity type in right bottom
  const [actNameValue, setActNameValue] = useState(props.activityName);
  const { embeddedActivities, setEmbeddedActivities } = props;
  const [OpenProcessCallActivity, setOpenProcessCallActivity] = useState(false);
  //code added on 3 June 2022 for BugId 110210
  const [searchedVal, setSearchedVal] = useState("");
  const [tabsList, setTabsList] = useState([]);
  const arr = [t("Rename"), t("delete")];
  const [actionModal, setActionModal] = useState(null);
  const [openQRenameConfModal, setOpenQueueRenameConfirmationModal] =
    useState(false);
  const [actRenamed, setActRenamed] = useState(null);
  const [isDefaultIcon, setIsDefaultIcon] = useState(false);
  const [isParentLaneCheckedOut, setIsParentLaneCheckedOut] = useState(false);
  const [actStatusInLCO, setActStatusInLCO] = useState(false);

  const laneId =
    props.processData.MileStones[props.milestoneIndex].Activities[
      props.activityindex
    ].LaneId;

  const dispatch = useDispatch();

  const swimlaneData = props.processData.Lanes?.filter((list) => {
    return +list.LaneId !== -99;
  })?.map((x) => {
    return {
      id: x.LaneId,
      name: x.LaneName,
    };
  });

  const selectedSwimlane = swimlaneData?.map((x) => {
    if (x.id === laneId) {
      return x.id;
    }
  });

  const [swimlaneValue, setSwimlaneValue] = useState(selectedSwimlane);
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData, setlocalLoadedProcessData] =
    useGlobalState(loadedProcessData);
  const activityRef = useRef();

  useLayoutEffect(() => {
    // added on 16/10/23 for BugId 139397
    let tempParentLaneChecked = false;
    props.processData?.Lanes?.forEach((lane) => {
      if (+lane.LaneId === +laneId && lane.CheckedOut === "Y") {
        tempParentLaneChecked = true;
      }
    });
    let tempActStatus = checkActivityStatus(
      props.processData,
      props.processData.MileStones[props.milestoneIndex].Activities[
        props.activityindex
      ].ActivityId
    );
    // till here BugId 139397

    // modified on 16/10/23 for BugId 139397
    /*if (
      isReadOnly ||
      !modifyActivityRightsFlag ||
      props.processData.ProcessType === PROCESSTYPE_REGISTERED ||
      props.processData.ProcessType === "RC" ||
      LatestVersionOfProcess(localLoadedProcessData?.Versions) !==
        +localLoadedProcessData?.VersionNo
    ) */
    if (
      (props.processData.ProcessType !== PROCESSTYPE_LOCAL &&
        props.processData.CheckedOut === "N" &&
        !tempParentLaneChecked) ||
      (props.processData.ProcessType !== PROCESSTYPE_LOCAL &&
        props.processData.CheckedOut === "N" &&
        tempParentLaneChecked &&
        !tempActStatus) ||
      (props.processData.ProcessType !== PROCESSTYPE_LOCAL &&
        props.processData.CheckedOut === "Y") ||
      !modifyActivityRightsFlag ||
      isReadOnly
    ) {
      // till here BugId 139397
      activityRef.current.style.setProperty("border", "none", "important");
      activityRef.current.style.setProperty(
        "background-color",
        "transparent",
        "important"
      );
      activityRef.current.style.setProperty("color", "black", "important");
      // added on 04/09/2023 for BugId 134634
      activityRef.current.style.setProperty("pointer-events", "none");
    }
  }, []);

  useEffect(() => {
    let isDefault = true;
    let tempJson = JSON.parse(JSON.stringify(props.processData));
    tempJson?.MileStones?.forEach((mile) => {
      mile?.Activities?.forEach((act) => {
        if (+act.ActivityId === +props.activityId) {
          if (act.ImageName && act.ImageName?.trim() !== "") {
            isDefault = false;
          }
        }
      });
    });
    setIsDefaultIcon(isDefault);
  }, [props.processData]);

  const getActivityIcon = () => {
    let iconName = null;
    let tempJson = JSON.parse(JSON.stringify(props.processData));
    tempJson?.MileStones?.forEach((mile) => {
      mile?.Activities?.forEach((act) => {
        if (+act.ActivityId === +props.activityId) {
          iconName = act.ImageName;
        }
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

  // Function that changes and updates the activityName for a given activity card.
  const handleInputChange = (e) => {
    if (
      actNameValue ===
      props.processData.MileStones[props.milestoneIndex].Activities[
        props.activityindex
      ].ActivityName
    ) {
      validateActivityObject({
        processDefId: props.processData.ProcessDefId,
        processType: props.processData.ProcessType,
        activityName:
          props.processData.MileStones[props.milestoneIndex].Activities[
            props.activityindex
          ].ActivityName,
        activityId:
          props.processData.MileStones[props.milestoneIndex].Activities[
            props.activityindex
          ].ActivityId,
        errorMsg: `${t("renameValidationErrorMsg")}`,
        onSuccess: (workitemValidationFlag) => {
          if (!workitemValidationFlag) {
            setActNameValue(e.target.value);
          }
        },
        dispatch,
      });
    }
    if (
      !e.target.value.match(/^[a-zA-Z]?[\S]*/) &&
      e.target.value.trim() !== ""
    ) {
      return;
    } else setActNameValue(e.target.value);
  };

  useEffect(() => {
    let tempArr = [...arr];
    if (!deleteActivityRightsFlag) {
      let deleteActivityIndex;
      tempArr.forEach((element, index) => {
        if (element === t("delete")) {
          deleteActivityIndex = index;
        }
      });
      tempArr.splice(deleteActivityIndex, 1);
    }
    setTabsList(tempArr);
  }, [deleteActivityRightsFlag]);

  // Function that gets options for context menu by checking whether the process is
  // case enabled or not.
  const getOptions = () => {
    if (caseEnabled) {
      return [t("ConvertToCaseWorkdesk"), t("Properties")];
    } else return [t("Properties")];
  };

  const isSwimlaneQueue = (qId) => {
    const index = props.processData.Lanes?.findIndex(
      (swimlane) => +swimlane.QueueId === +qId
    );

    return index !== -1;
  };

  const closeQueueRenameModal = () => {
    setOpenQueueRenameConfirmationModal(false);
    setActNameValue(
      props.processData?.MileStones[props.milestoneIndex]?.Activities[
        props.activityindex
      ]?.ActivityName
    );
  };

  const renameActWithoutQueueName = () => {
    renameActivityFunc(false);
    closeQueueRenameModal();
  };

  const renameActWithQueueName = () => {
    renameActivityFunc(true);
    closeQueueRenameModal();
  };

  // Function that gets called when the user changes the activity name and clicksaway from the field.
  const handleRenameActivityFunction = (resetVal) => {
    let actNameExists = false,
      errorMsg = "";
    // code added on 18 Jan 2023 for BugId 110065
    let [isValid, errMsg] = validateEntity(actNameValue, t, t("ActivityName"));
    if (isValid) {
      props.processData?.MileStones?.forEach((milestone) => {
        if (
          milestone.MileStoneName?.toLowerCase() ===
            actNameValue?.toLowerCase() &&
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
              act.ActivityName?.toLowerCase() === actNameValue?.toLowerCase() &&
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
                    actNameValue?.toLowerCase() &&
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
            swimlane.LaneName?.toLowerCase() === actNameValue?.toLowerCase() &&
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
        const qId =
          props.processData?.MileStones[props.milestoneIndex]?.Activities[
            props.activityindex
          ]?.QueueId;
        if (qId && qId < 0) {
          if (
            isSwimlaneQueue(qId) ||
            checkIfActHasSystemQueue(props.activityType, props.activitySubType) // added on 28/09/23 for BugId 136079
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
          setActNameValue(
            props.processData.MileStones[props.milestoneIndex].Activities[
              props.activityindex
            ].ActivityName
          );
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
        setActNameValue(
          props.processData.MileStones[props.milestoneIndex].Activities[
            props.activityindex
          ].ActivityName
        );
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

  const renameActivityFunc = (queueRename) => {
    let currentAct =
      props.processData.MileStones[props.milestoneIndex].Activities[
        props.activityindex
      ];
    // code added on 22 July 2022 for BugId 113305
    if (actNameValue !== currentAct.ActivityName) {
      let queueInfo = getRenameActivityQueueObj(
        currentAct.ActivityType,
        currentAct.ActivitySubType,
        actNameValue.trim().replace(/\s+/g, " "),
        props.processData,
        currentAct.QueueId,
        t
      );
      renameActivity(
        currentAct.ActivityId,
        currentAct.ActivityName,
        actNameValue.trim().replace(/\s+/g, " "),
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

  // Function that updates the activity card when a activityType is dropped on it from the toolbox.
  const updateActivityCard = (
    e,
    mIndex,
    aIndex,
    activityType,
    activitySubType
  ) => {
    let processObject = { ...props.processData };
    if (processObject.MileStones[mIndex].Activities[aIndex].ActivityType) {
      return;
    } else {
      processObject.MileStones[mIndex].Activities[aIndex].ActivityType =
        activityType;
      processObject.MileStones[mIndex].Activities[aIndex].ActivitySubType =
        activitySubType;
    }
    props.setprocessData(processObject);
  };

  const handleClickAway = () => {
    setactivityType(false);
    let currentAct =
      props.processData.MileStones[props.milestoneIndex].Activities[
        props.activityindex
      ];
    if (
      actNameValue !== currentAct.ActivityName &&
      actNameValue?.trim() !== "" &&
      actRenamed === props.activityId
    ) {
      setActNameValue(currentAct.ActivityName);
      setActRenamed(null);
    } else if (actNameValue?.trim() === "") {
      setActNameValue(currentAct.ActivityName);
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
    if (props.selectedActivity === props.activityId) {
      props.selectActivityHandler(null);
    }
  };

  const handleRenameTickClickFunc = () => {
    let currentAct =
      props.processData.MileStones[props.milestoneIndex].Activities[
        props.activityindex
      ];
    // code edited on 3 Nov 2022 for BugId 118320
    if (
      actNameValue !== currentAct.ActivityName &&
      actNameValue?.trim() !== "" &&
      actRenamed !== null
    ) {
      handleRenameActivityFunction(true);
      setActRenamed(null);
    } else if (actNameValue?.trim() === "") {
      setActNameValue(currentAct.ActivityName);
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

  useEffect(() => {
    if (
      props.processData.MileStones[props.milestoneIndex].Activities[
        props.activityindex
      ].AssociatedProcess == undefined ||
      props.processData.MileStones[props.milestoneIndex].Activities[
        props.activityindex
      ].AssociatedProcess.Associated_ProcessDefId == ""
    ) {
      setOpenProcessCallActivity(true);
    } else {
      setOpenProcessCallActivity(false);
    }
    props.processData?.Lanes?.forEach((lane) => {
      if (+lane.LaneId === +laneId && lane.CheckedOut === "Y") {
        setIsParentLaneCheckedOut(true);
      }
    });
    let tempActStatus = checkActivityStatus(
      props.processData,
      props.processData.MileStones[props.milestoneIndex].Activities[
        props.activityindex
      ].ActivityId
    );
    setActStatusInLCO(tempActStatus);
  }, []);

  const getActionName = (actionName) => {
    if (actionName === t("Properties")) {
      props.showDrawer(true);
    } else if (actionName === t("delete")) {
      // added on 29/09/23 for BugId 135398
      props.showDrawer(false);
      let id =
        props.processData.MileStones[props.milestoneIndex].Activities[
          props.activityindex
        ].ActivityId;
      let name =
        props.processData.MileStones[props.milestoneIndex].Activities[
          props.activityindex
        ].ActivityName;
      let actType =
        +props.processData.MileStones[props.milestoneIndex].Activities[
          props.activityindex
        ].ActivityType;
      let actSubType =
        +props.processData.MileStones[props.milestoneIndex].Activities[
          props.activityindex
        ].ActivitySubType;
      let isPrimaryAct =
        props.processData.MileStones[props.milestoneIndex]?.Activities[
          props.activityindex
        ]?.PrimaryActivity === "Y"
          ? true
          : false;
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
        activityName:
          props.processData.MileStones[props.milestoneIndex].Activities[
            props.activityindex
          ].ActivityName,
        activityId:
          props.processData.MileStones[props.milestoneIndex].Activities[
            props.activityindex
          ].ActivityId,
        errorMsg: `${t("renameValidationErrorMsg")}`,
        onSuccess: (workitemValidationFlag) => {
          if (!workitemValidationFlag) {
            // modified on 04/10/23 for BugId 133947
            /*const input = document.getElementById(
              `${props.milestoneIndex} _ ${props.activityindex}`
            );
            input.select();
            input.focus();*/
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
        props.processData.MileStones[props.milestoneIndex].Activities[
          props.activityindex
        ].ActivityName,
        caseWorkdesk.activityTypeId, //code added on 31 May 2022 for BugId 110209
        caseWorkdesk.activitySubTypeId, //code added on 31 May 2022 for BugId 110209
        props.setprocessData,
        props.milestoneIndex,
        props.activityindex,
        props.processData.MileStones[props.milestoneIndex].Activities[
          props.activityindex
        ].ActivityId
      );
    } else if (actionName === t("openProcess")) {
      if (!OpenProcessCallActivity) {
        let selectedElement =
          props.processData.MileStones[props.milestoneIndex].Activities[
            props.activityindex
          ];
        props.openProcessClick(
          selectedElement.AssociatedProcess.Associated_ProcessDefId,
          selectedElement.AssociatedProcess.Associated_ProjectName,
          "R",
          selectedElement.AssociatedProcess.Associated_VersionNo,
          selectedElement.AssociatedProcess.Associated_ProcessName
        );

        props.openTemplate(null, null, false);
        setlocalLoadedProcessData(null);
        history.push("/process");
      }
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

  // Function that runs when the draggable embedded subprocess is dropped.
  const onDragEnd = (result) => {
    if (!result.destination) return;
    const { source, destination } = result;
    const embeddedActivitiesArray = embeddedActivities;
    const [reOrderedList] = embeddedActivitiesArray.splice(source.index, 1);
    embeddedActivitiesArray.splice(destination.index, 0, reOrderedList);
    setEmbeddedActivities(embeddedActivitiesArray);
  };

  useEffect(() => {
    let activityProps = getActivityProps(
      props.activityType,
      props.activitySubType
    );
    setsrc(activityProps[0]);
    setclassForActivity(activityProps[1]);
    setcolor(activityProps[2]);
    setBackgroundColor(activityProps[3]);
  }, [props.activityType, props.activitySubType]);

  // Function that sets some data when dragging starts.
  let onDragStart = (
    e,
    mIndex,
    aIndex,
    activityName,
    activityType,
    activitySubType,
    draggableId
  ) => {
    e.dataTransfer.setData("mIndex", mIndex);
    e.dataTransfer.setData("aIndex", aIndex);
    e.dataTransfer.setData("activityName", activityName);
    e.dataTransfer.setData("activityType", activityType);
    e.dataTransfer.setData("activitySubType", activitySubType);
    e.dataTransfer.setData("draggableId", draggableId);
  };

  // Function that adds a new activity card below the card it was called from.
  // const addActivityInBetween = (mIndex, aIndex) => {
  //   let obj = props.processData;
  //   obj.MileStones[mIndex].Activities.splice(aIndex + 1, 0, {
  //     ActivityName: "",
  //     ActivityType: "",
  //     ActivityId: props.processData.MileStones[mIndex].Activities.length + 1,
  //   });
  //   props.setprocessData(obj);
  // };

  // Function that runs when a draggable item is dragged over a droppable region.
  const onDragOver = (e, mIndex, aIndex) => {
    let processObject = { ...props.processData };
    let activity = processObject.MileStones[mIndex].Activities[aIndex];
    if (activity.ActivityType === 35 && activity.ActivitySubType === 1) {
      e.preventDefault();
    } else {
      return;
    }
  };

  // Function that handles what happens after an item is dragged and dropped in a region.
  const onDropHandler = (e, mIndex, aIndex) => {
    if (JSON.parse(e.dataTransfer.getData("bFromToolbox")) === true) {
      const iActivityId = +e.dataTransfer.getData("iActivityID");
      const iSubActivityId = +e.dataTransfer.getData("iSubActivityID");
      if (aIndex) {
        updateActivityCard(e, mIndex, aIndex, iActivityId, iSubActivityId);
        let droptarget = document.getElementById(
          props.milestoneIndex + "_" + props.activityindex
        );
        if (droptarget) {
          droptarget.focus();
        }
      }
    }
  };

  //change lanes from dropdown
  const changeLaneVal = (data) => {
    setSwimlaneValue([data.id]);
    setShowSwimlaneDropdown(false);
    let maxXLeftLoc = 0,
      mileWidth = 0,
      laneHeight = milestoneTitleWidth,
      laneFound = false,
      isPreviousAct = false;
    let currentAct =
      props.processData.MileStones[props.milestoneIndex].Activities[
        props.activityindex
      ];
    let isPreviousActDefault = false;
    props.processData.MileStones?.forEach((mile, index) => {
      if (index === props.milestoneIndex) {
        mile.Activities?.forEach((eachActivity) => {
          if (eachActivity.LaneId === data.id) {
            if (+maxXLeftLoc < +eachActivity.xLeftLoc) {
              maxXLeftLoc = eachActivity.xLeftLoc;
              isPreviousAct = true;
              isPreviousActDefault = defaultShapeVertex.includes(
                getActivityProps(
                  eachActivity.ActivityType,
                  eachActivity.ActivitySubType
                )[5]
              );
            }
          }
        });
      }
      if (index < props.milestoneIndex) {
        mileWidth = mileWidth + +mile.Width;
      }
    });
    maxXLeftLoc = isPreviousActDefault
      ? +maxXLeftLoc + widthForDefaultVertex + minWidthSpace
      : isPreviousAct
      ? +maxXLeftLoc + gridSize + minWidthSpace
      : +maxXLeftLoc + gridSize * 2;
    props.processData.Lanes.forEach((lane) => {
      if (+lane.LaneId === +data.id) {
        laneFound = true;
      }
      if (!laneFound) {
        if (!caseEnabled && lane.LaneId !== -99) {
          laneHeight = laneHeight + +lane.Height;
        } else if (caseEnabled) {
          laneHeight = laneHeight + +lane.Height;
        }
      }
    });
    MoveActivity(
      props.processData.ProcessDefId,
      currentAct,
      props.processData.MileStones[props.milestoneIndex].iMileStoneId,
      props.processData.MileStones[props.milestoneIndex].iMileStoneId,
      data.id,
      props.setprocessData,
      gridSize + laneHeight,
      maxXLeftLoc + mileWidth,
      maxXLeftLoc,
      null,
      milestoneWidthToIncrease(
        maxXLeftLoc,
        props.processData,
        props.processData.MileStones[props.milestoneIndex].iMileStoneId,
        currentAct.ActivityId,
        defaultShapeVertex.includes(
          getActivityProps(
            currentAct.ActivityType,
            currentAct.ActivitySubType
          )[5]
        )
      )
    );
  };

  const selectedActivityName = (activityType, subActivityType) => {
    let activityProps = getActivityProps(activityType, subActivityType);
    setsrc(activityProps[0]);
    setclassForActivity(activityProps[1]);
    setcolor(activityProps[2]);
    setBackgroundColor(activityProps[3]);
    ChangeActivityType(
      props.processData.ProcessDefId,
      props.processData.MileStones[props.milestoneIndex].Activities[
        props.activityindex
      ].ActivityName,
      activityType,
      subActivityType,
      props.setprocessData,
      props.milestoneIndex,
      props.activityindex,
      props.processData.MileStones[props.milestoneIndex].Activities[
        props.activityindex
      ].ActivityId
    );
    setactivityType(false);
  };

  let toolTypeList = [
    startEvents,
    activities,
    intermediateEvents,
    gateway,
    integrationPoints,
    endEvents,
  ];

  //when new lane is added in lanes dropdown(abstarct view)
  const addNewLane = (swimlaneName) => {
    if (swimlaneName?.trim() !== "") {
      let laneNameExists = false,
        errorMsg = "";
      props.processData?.MileStones?.forEach((milestone) => {
        if (
          milestone.MileStoneName?.toLowerCase() ===
            swimlaneName?.toLowerCase() &&
          !laneNameExists
        ) {
          laneNameExists = true;
          errorMsg = t("entity1_SameEntity2NameError", {
            Entity1: t("LaneName"),
            Entity2: t("milestoneName"),
          });
        } else if (!laneNameExists) {
          milestone?.Activities?.forEach((act) => {
            if (
              act.ActivityName?.toLowerCase() === swimlaneName?.toLowerCase() &&
              !laneNameExists
            ) {
              laneNameExists = true;
              errorMsg = t("entity1_SameEntity2NameError", {
                Entity1: t("LaneName"),
                Entity2: t("Activity"),
              });
            }
          });
        }
      });
      //code added on 30 JAN 2023 for BugId 122088
      if (!laneNameExists) {
        props.processData?.Lanes?.forEach((swimlane) => {
          if (
            swimlane.LaneName?.toLowerCase().trim() ===
              swimlaneName?.toLowerCase().trim() &&
            !laneNameExists
          ) {
            laneNameExists = true;
            errorMsg = t("entitySameNameError", {
              entityName: t("swimlaneName"),
            });
          }
        });
      }

      if (!laneNameExists) {
        let laneId = 0;
        const lanes = props.processData.Lanes;
        for (let i of lanes) {
          if (+laneId < +i.LaneId) {
            laneId = i.LaneId;
          }
        }
        addSwimLane(
          t,
          laneId,
          swimlaneName,
          lanes,
          props.processData.Lanes[props.processData.Lanes.length - 1],
          props.processData.ProcessDefId,
          props.processData.ProcessName,
          props.setprocessData,
          props.setNewId,
          "abstract",
          props.milestoneIndex,
          props.activityindex,
          // code added on 11 Oct 2022 for BugId 116379
          () => {
            setSwimlaneValue([laneId + 1]);
            changeLaneVal({ id: +laneId + 1, name: swimlaneName });
          }
        );
        setShowSwimlaneDropdown(false);
      } else {
        setShowSwimlaneDropdown(false);
        dispatch(
          setToastDataFunc({
            message: errorMsg,
            severity: "error",
            open: true,
          })
        );
      }
    } else {
      dispatch(
        setToastDataFunc({
          message: t("EntityCantBeBlank", {
            entityName: t("LaneName"),
          }),
          severity: "error",
          open: true,
        })
      );
    }
  };

  // code edited on 7 March 2023 for BugId 124772
  if (
    props.processData.ProcessType !== PROCESSTYPE_LOCAL &&
    props.processData.CheckedOut === "N" &&
    !isParentLaneCheckedOut
  ) {
    if (
      props.processData.MileStones[props.milestoneIndex].Activities[
        props.activityindex
      ].CheckedOut === "N"
    ) {
      sortSectionLocalProcess = [t("Properties"), t("Checkout")];
    } else if (
      props.processData.MileStones[props.milestoneIndex].Activities[
        props.activityindex
      ].CheckedOut === "Y"
    ) {
      sortSectionLocalProcess = [
        t("Properties"),
        t("undoCheckout"),
        t("checkIn"),
      ];
    }
  } else if (
    props.processData.ProcessType !== PROCESSTYPE_LOCAL &&
    props.processData.CheckedOut === "N" &&
    isParentLaneCheckedOut
  ) {
    // code edited on 14 July 2023 for BugId 130715 - swimlane checkout>>not able to delete activity
    // activities already present in swimlane, while check-out cannot be deleted and renamed
    if (actStatusInLCO) {
      sortSectionOne = [t("Rename"), t("delete")];
      sortSectionTwo =
        +props.activityType === 10 && +props.activitySubType === 3
          ? getOptions()
          : [t("Properties")];
    } else {
      sortSectionOne = null;
      sortSectionTwo = [t("Properties")];
    }
  } else if (
    props.processData.ProcessType !== PROCESSTYPE_LOCAL &&
    props.processData.CheckedOut === "Y"
  ) {
    sortSectionOne = null;
    sortSectionTwo = [t("Properties")];
  } else if (+props.activityType === 10 && +props.activitySubType === 3) {
    sortSectionOne = tabsList;
    sortSectionTwo = getOptions();
  } else if (+props.activityType === 35 && +props.activitySubType === 1) {
    sortSectionOne = [
      t("Rename"),
      // t("useTemplate"),
      // t("saveAsTemplate"),
      t("delete"),
    ];
  } else if (+props.activityType === 18 && +props.activitySubType === 1) {
    sortSectionOne = [t("Rename"), t("delete")];
    sortSectionTwo = [t("Properties"), t("openProcess")];
  } else {
    sortSectionOne = [t("Rename"), t("delete")];
    sortSectionTwo = [t("Properties")];
  }

  if (sortSectionOne?.length > 0) {
    if (!modifyActivityRightsFlag) {
      const renameIndex = sortSectionOne.findIndex(
        (option) => option === `${t("Rename")}`
      );
      if (renameIndex !== -1) {
        //it means rename option is present but user dont has modify rights. so need to remove it from options.
        sortSectionOne.splice(renameIndex, 1);
      }
    }
    if (!deleteActivityRightsFlag) {
      const deleteIndex = sortSectionOne.findIndex(
        (option) => option === `${t("delete")}`
      );
      if (deleteIndex !== -1) {
        //it means delete option is present but user dont has delete rights. so need to remove it from options.
        sortSectionOne.splice(deleteIndex, 1);
      }
    }
  }

  return (
    <React.Fragment>
      <ClickAwayListener onClickAway={handleClickAway}>
        <div
          class="activityCard-div"
          id={`pmweb_activityCard_${props.milestoneIndex}_${props.activityindex}`}
          onDragStart={(e) =>
            onDragStart(
              e,
              props.milestoneIndex,
              props.activityindex,
              props.activityName,
              props.activityType,
              props.activitySubType,
              "activityCard"
            )
          }
          onDragOver={(e) =>
            onDragOver(e, props.milestoneIndex, props.activityindex)
          }
          onDrop={(e) =>
            onDropHandler(e, props.milestoneIndex, props.activityindex)
          }
        >
          <div>
            <Box
              mt={1}
              id={`pmweb_actbox_${props.milestoneIndex}_${props.activityindex}`}
              onMouseOver={() => {
                //on isReadOnly -> MouseOver must not work
                if (!isReadOnly) {
                  setShowDragIcon(true);
                }
              }}
              onMouseLeave={() => {
                //on isReadOnly -> MouseOver must not work
                if (!isReadOnly) {
                  setShowDragIcon(false);
                }
              }}
            >
              <Card
                variant="outlined"
                className={
                  "outlinedCard" +
                  (props.selectedActivity === props.activityId
                    ? " cardSelected"
                    : "")
                }
              >
                <CardContent
                  className={c_Names({
                    [classForActivity]: true,
                    activityCard: true,
                  })}
                >
                  <div
                    id={`pmweb_mainContentAct_${props.activityId}`}
                    onDoubleClick={() => props.showDrawer(true)}
                    onClick={() => {
                      props.selectActivityHandler(
                        props.processData.MileStones[props.milestoneIndex]
                          .Activities[props.activityindex]
                      );
                      props.setprocessData((prev) => {
                        let newObj = JSON.parse(JSON.stringify(prev));
                        newObj.MileStones.forEach((mile, mileIndex) => {
                          mile.Activities.forEach((act, actIndex) => {
                            if (act?.clicked) {
                              newObj.MileStones[mileIndex].Activities[
                                actIndex
                              ] = {
                                ...newObj.MileStones[mileIndex].Activities[
                                  actIndex
                                ],
                                clicked: false,
                              };
                            }
                          });
                        });
                        newObj.MileStones[props.milestoneIndex].Activities[
                          props.activityindex
                        ] = {
                          ...newObj.MileStones[props.milestoneIndex].Activities[
                            props.activityindex
                          ],
                          clicked: true,
                        };
                        return newObj;
                      });
                    }}
                  >
                    <Box p={0} m={0}>
                      <Box
                        style={{
                          marginInlineStart: "0.75rem",
                          marginBottom: "0.25rem",
                        }}
                      >
                        {props.processData.MileStones[props.milestoneIndex]
                          .Activities[props.activityindex].CheckedOut === "Y" &&
                          !isParentLaneCheckedOut && (
                            <img
                              src={ActivityCheckedOutLogo}
                              alt="Checked-out"
                              className={
                                direction === RTL_DIRECTION
                                  ? "checkedOutIconArabic"
                                  : "checkedOutIcon"
                              }
                            />
                          )}
                        <Grid container style={{ alignItems: "center" }}>
                          <Grid item style={{ height: "1.75rem" }}>
                            {showDragIcon &&
                            props.processData.ProcessType !==
                              PROCESSTYPE_REGISTERED &&
                            props.processData.ProcessType !== "RC" &&
                            !isReadOnly ? (
                              <div
                                className="dragIcon"
                                {...provided.dragHandleProps}
                                tabIndex={-1}
                              >
                                <DragIndicatorIcon
                                  style={{
                                    color: "#606060",
                                    height: "1.75rem",
                                    width: "1.75rem",
                                  }}
                                />
                              </div>
                            ) : (
                              <img
                                src={
                                  isDefaultIcon
                                    ? props.activityType
                                      ? src
                                      : defaultLogo
                                    : getActivityIcon()
                                }
                                className="logoSize"
                                alt={`${props.activityName}_logo`}
                              />
                            )}
                          </Grid>
                          <Grid item style={{ width: "70%" }}>
                            <span title={actNameValue}>
                              {/*code added on 8 August 2022 for BugId 112903*/}
                              <input
                                id={`pmweb_activityInputId_${props.activityId}`}
                                aria-label={props?.activityName}
                                className="activityInput"
                                onChange={(e) => {
                                  if (actRenamed === null) {
                                    setActRenamed(props.activityId);
                                  }
                                  handleInputChange(e);
                                }}
                                onKeyPress={(e) => {
                                  /*code edited on 3 Nov 2022 for BugId 118320*/
                                  if (e.code === "Enter") {
                                    if (
                                      actNameValue !==
                                        props.processData.MileStones[
                                          props.milestoneIndex
                                        ].Activities[props.activityindex]
                                          .ActivityName &&
                                      actNameValue?.trim() !== "" &&
                                      actRenamed === props.activityId
                                    ) {
                                      handleRenameActivityFunction(false);
                                    } else if (actNameValue?.trim() === "") {
                                      setActNameValue(
                                        props.processData.MileStones[
                                          props.milestoneIndex
                                        ].Activities[props.activityindex]
                                          .ActivityName
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
                                    let currentAct =
                                      props.processData.MileStones[
                                        props.milestoneIndex
                                      ].Activities[props.activityindex];
                                    setActNameValue(currentAct.ActivityName);
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
                                value={actNameValue}
                                ref={activityRef}
                                // modified on 16/10/23 for BugId 139397
                                /* disabled={
                                  isReadOnly ||
                                  !modifyActivityRightsFlag ||
                                  props.processData.ProcessType ===
                                    PROCESSTYPE_REGISTERED ||
                                  props.processData.ProcessType === "RC" ||
                                  LatestVersionOfProcess(
                                    localLoadedProcessData?.Versions
                                  ) !== +localLoadedProcessData?.VersionNo
                                    ? true
                                    : null
                                }*/
                                disabled={
                                  (props.processData.ProcessType !==
                                    PROCESSTYPE_LOCAL &&
                                    props.processData.CheckedOut === "N" &&
                                    !isParentLaneCheckedOut) ||
                                  (props.processData.ProcessType !==
                                    PROCESSTYPE_LOCAL &&
                                    props.processData.CheckedOut === "N" &&
                                    isParentLaneCheckedOut &&
                                    !actStatusInLCO) ||
                                  (props.processData.ProcessType !==
                                    PROCESSTYPE_LOCAL &&
                                    props.processData.CheckedOut === "Y") ||
                                  !modifyActivityRightsFlag ||
                                  isReadOnly
                                }
                                // till here BugId 139397
                              />
                            </span>
                          </Grid>
                          {
                            //Modified  on 23/08/2023, bug_id:130481
                          }
                          {isReadOnly ? null : (
                            <Grid
                              item
                              className={
                                direction === RTL_DIRECTION
                                  ? "moreVertIconDivArabic"
                                  : "moreVertIconDiv"
                              }
                            >
                              {actRenamed === props.activityId ? (
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.75vw",
                                  }}
                                >
                                  <img
                                    id={`pmweb_cancelRename_${props.activityId}`}
                                    src={cancelRename}
                                    style={{
                                      width: "1.25rem",
                                      height: "1.25rem",
                                      cursor: "pointer",
                                    }}
                                    alt="Cancel Rename"
                                    onClick={() => {
                                      let currentAct =
                                        props.processData.MileStones[
                                          props.milestoneIndex
                                        ].Activities[props.activityindex];
                                      setActNameValue(currentAct.ActivityName);
                                      setActRenamed(null);
                                    }}
                                  />
                                  <img
                                    id={`pmweb_okRename_${props.activityId}`}
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
                                    disableOption={OpenProcessCallActivity}
                                    disableOptionValue={t("openProcess")}
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
                                        id={`pmweb_moreIcon_${props.activityId}`}
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
                                    processType={props.processData.ProcessType}
                                  />
                                )
                              )}
                            </Grid>
                          )}
                        </Grid>
                      </Box>

                      <Box
                        style={{
                          marginInlineStart: "0.75rem",
                        }}
                        pt={1}
                        className="row"
                      >
                        <Grid container style={{ alignItems: "center" }}>
                          <Grid item>
                            <Button
                              disabled={isReadOnly}
                              className={`${
                                direction === RTL_DIRECTION
                                  ? "SwimlaneButtonArabic"
                                  : "SwimlaneButton"
                              } non-button`}
                              id={`pmweb_swimlaneDrop_${props.activityId}`}
                              onClick={() =>
                                props.processData.ProcessType ===
                                  PROCESSTYPE_LOCAL ||
                                props.processData.ProcessType ===
                                  PROCESSTYPE_LOCAL_CHECKED
                                  ? setShowSwimlaneDropdown(true)
                                  : setShowSwimlaneDropdown(false)
                              }
                            >
                              {swimlaneData?.map((item) => {
                                if (swimlaneValue?.includes(item.id)) {
                                  return item.name;
                                }
                              })}
                              <img
                                src={dropdown}
                                alt="dropdown"
                                width="5px"
                                height="15px"
                                style={{
                                  marginInlineStart: "5px",
                                }}
                              />
                            </Button>
                            {showSwimlaneDropdown ? (
                              <AddToListDropdown
                                processData={props.processData}
                                completeList={swimlaneData}
                                checkboxStyle="swimlaneCheckbox"
                                checkedCheckBoxStyle="swimlaneChecked"
                                associatedList={swimlaneValue}
                                checkIcon="swimlaneCheckIcon"
                                onChange={changeLaneVal}
                                addNewLabel={t("newSwimlane")}
                                noDataLabel={t("noLane")}
                                onKeydown={addNewLane}
                                labelKey="name"
                                handleClickAway={() =>
                                  setShowSwimlaneDropdown(false)
                                }
                                hideCreateButton={!createSwimlaneRightsFlag}
                                entityName={t("LaneName")}
                              />
                            ) : null}
                          </Grid>
                          <Grid
                            item
                            style={{
                              marginInlineStart: "auto",
                            }}
                          >
                            {props.activityType ? (
                              <p
                                className={
                                  direction === RTL_DIRECTION
                                    ? "selectedActivityTypeArabic"
                                    : "selectedActivityType"
                                }
                                style={{
                                  color: color,
                                  background:
                                    BackgroundColor +
                                    " 0% 0% no-repeat padding-box",
                                  padding: "2px 7px",
                                }}
                                id={`workdeskType_${props.activityId}`}
                                // onClick={(e) => clickWorkdesktype(e)}
                              >
                                {t(
                                  getActivityProps(
                                    props.activityType,
                                    props.activitySubType
                                  )[4]
                                )}
                              </p>
                            ) : (
                              <div
                                id={`workdeskType_${props.activityId}`}
                                className={
                                  direction === RTL_DIRECTION
                                    ? "workdeskTypeArabic"
                                    : "workdeskType"
                                }
                                // onClick={(e) => {
                                //   clickWorkdesktype(e);
                                // }}
                              >
                                {t("workstepType")}
                                <ExpandMoreIcon className="expandedIcon" />
                              </div>
                            )}
                          </Grid>
                        </Grid>
                      </Box>
                    </Box>

                    {+props.activityType === 32 &&
                    +props.activitySubType === 1 ? (
                      <TaskInActivity
                        isReadOnly={isReadOnly}
                        processType={props.processData.ProcessType}
                        milestoneIndex={props.milestoneIndex}
                        activityindex={props.activityindex}
                        setprocessData={props.setprocessData}
                        activityId={props.activityId}
                        processData={props.processData}
                        color={color}
                        BackgroundColor={BackgroundColor}
                        taskExpanded={props.taskExpanded}
                        setTaskExpanded={props.setExpandedTask}
                      />
                    ) : null}
                  </div>

                  {+props.activityType === 35 &&
                  +props.activitySubType === 1 ? (
                    <DragDropContext onDragEnd={onDragEnd}>
                      <Droppable
                        droppableId={`${
                          props.milestoneIndex + "_" + props.activityindex
                        }`}
                        key={props.milestoneIndex}
                      >
                        {(provided) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                          >
                            <EmbeddedActivity
                              processType={props.processData.ProcessType}
                              provided={provided}
                              embeddedActivities={embeddedActivities}
                              setEmbeddedActivities={setEmbeddedActivities}
                              milestoneIndex={props.milestoneIndex}
                              activityindex={props.activityindex}
                              setprocessData={props.setprocessData}
                              processData={props.processData}
                              color={color}
                              BackgroundColor={BackgroundColor}
                              setNewId={props.setNewId}
                              mileId={props.mileId}
                              selectedActivity={props.selectedActivity}
                              activityId={props.activityId}
                              isParentLaneCheckedOut={isParentLaneCheckedOut}
                              selectActivityHandler={
                                props.selectActivityHandler
                              }
                              tabsList={tabsList}
                              caseEnabled={caseEnabled}
                              processExpanded={props.processExpanded}
                              setProcessExpanded={props.setProcessExpanded}
                              isReadOnly={isReadOnly}
                            />
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  ) : null}
                </CardContent>
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
                  />
                ) : null}
              </Card>
            </Box>
          </div>
        </div>
      </ClickAwayListener>
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
              actName={
                props.processData.MileStones[props.milestoneIndex].Activities[
                  props.activityindex
                ].ActivityName
              }
              actId={
                props.processData.MileStones[props.milestoneIndex].Activities[
                  props.activityindex
                ].ActivityId
              }
              laneId={
                props.processData.MileStones[props.milestoneIndex].Activities[
                  props.activityindex
                ].LaneId
              }
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
              actName={
                props.processData.MileStones[props.milestoneIndex].Activities[
                  props.activityindex
                ].ActivityName
              }
              actId={
                props.processData.MileStones[props.milestoneIndex].Activities[
                  props.activityindex
                ].ActivityId
              }
              laneId={
                props.processData.MileStones[props.milestoneIndex].Activities[
                  props.activityindex
                ].LaneId
              }
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
              actName={
                props.processData.MileStones[props.milestoneIndex].Activities[
                  props.activityindex
                ].ActivityName
              }
              actId={
                props.processData.MileStones[props.milestoneIndex].Activities[
                  props.activityindex
                ].ActivityId
              }
              activity={
                props.processData.MileStones[props.milestoneIndex].Activities[
                  props.activityindex
                ]
              }
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
    </React.Fragment>
  );
}

const mapStateToProps = (state) => {
  return {
    taskExpanded: state.taskReducer.taskExpanded,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    showDrawer: (flag) => dispatch(actionCreators.showDrawer(flag)),
    setExpandedTask: (taskExpanded) =>
      dispatch(actionCreators_task.expandedTask(taskExpanded)),

    openProcessClick: (id, name, type, version, processName) =>
      dispatch(
        actionCreatorsOpenProcess.openProcessClick(
          id,
          name,
          type,
          version,
          processName
        )
      ),
    openTemplate: (id, name, flag) =>
      dispatch(actionCreatorsOpenProcess.openTemplate(id, name, flag)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Activity);
