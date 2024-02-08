// Changes made to solve Bug 123515 - Process Designer-icons related- UX and UI bugs
import PropertiesIcon from "../../../src/assets/abstractView/Icons/Properties_Icon.svg";
import React, { useEffect, useState } from "react";
import Graph from "./BPMNView/Graph";
import PropertiesTab from "../Properties/Properties";
import {
  view,
  expandedViewOnDrop,
  PROCESSTYPE_LOCAL,
  RTL_DIRECTION,
  userRightsMenuNames,
  PROCESSTYPE_LOCAL_CHECKED,
  PROCESSTYPE_REGISTERED,
  SPACE,
} from "../../Constants/appConstants";
import SubHeader from "./SubHeader/SubHeader";
import { useTranslation } from "react-i18next";
import classes from "./ViewingArea.module.css";
import Milestones from "./AbstractView/Milestones/Milestones";
import { connect, useDispatch, useSelector } from "react-redux";
import CircularProgress from "@material-ui/core/CircularProgress";
import {
  addMilestone,
  addMilestoneInBetween,
} from "../../utility/CommonAPICall/AddMilestone";
import "../ViewingArea/BPMNView/Graph.css";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { handleDragEnd } from "../../utility/abstarctView/DragDropFunctions";
import ToolBox from "../../components/ViewingArea/BPMNView/Toolbox/Toolbox";
import * as actionCreators from "../../redux-store/actions/selectedCellActions";
import * as actionCreators_activity from "../../redux-store/actions/Properties/showDrawerAction";
import * as actionCreators_task from "../../redux-store/actions/AbstractView/TaskAction";
import {
  defaultWidthMilestone,
  milestoneName as milestoneNameConst,
} from "../../Constants/bpmnView";
import { moveMilestone } from "../../utility/CommonAPICall/MoveMilestone";
import {
  moveMilestoneActWidthFixArray,
  moveMilestoneArray,
} from "../../utility/InputForAPICall/moveMilestoneArray";
import {
  addMileInBetweenActWidthFixArray,
  addMileInBetweenArray,
} from "../../utility/InputForAPICall/addMileInBetweenArray";
import { store, useGlobalState } from "state-pool";
import { getSelectedCellType } from "../../utility/abstarctView/getSelectedCellType";
import { UserRightsValue } from "../../redux-store/slices/UserRightsSlice";
import { getMenuNameFlag } from "../../utility/UserRightsFunctions";
import Modal from "../../UI/Modal/Modal";
import ObjectDependencies from "../../UI/ObjectDependencyModal";
import {
  setActivityDependencies,
  setShowDependencyModal,
  setWorkitemFlag,
  setDependencyErrorMsg,
  setQueueRenameModalOpen,
  setRenameActivityData,
} from "../../redux-store/actions/Properties/activityAction";
import ModalForm from "../../UI/ModalForm/modalForm";
import { renameActivity } from "../../utility/CommonAPICall/RenameActivity";
import { LatestVersionOfProcess } from "../../utility/abstarctView/checkLatestVersion";
import { Typography } from "@material-ui/core";
import { checkIfSwimlaneCheckedOut } from "../../utility/SwimlaneCheckedStatus/SwimlaneCheckedStatus";
import { checkDuplicateNameFunc } from "../../utility/CommonFunctionCall/CommonFunctionCall";
import { setWindowInnerHeight } from "../../redux-store/actions/processView/actions";
import Toast from "../../UI/ErrorToast";
import { OpenProcessLoaderSliceValue } from "../../redux-store/slices/OpenProcessLoaderSlice";

function ViewingArea(props) {
  let { t } = useTranslation();
  const userRightsValue = useSelector(UserRightsValue);
  const direction = `${t("HTML_DIR")}`;
  const [viewType, changeViewType] = useState(view.abstract.langKey);
  const [selectedMile, setSelectedMile] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);
  let [expandedView, setExpandedView] = useState(false);
  const [graphToolbox, setGraphToolbox] = useState(null);
  const [newId, setNewId] = useState({
    milestoneId: 0,
    milestoneSeqId: 0,
    swimlaneId: 0,
    activityId: 0,
    connectionId: 0,
    annotationId: 0,
    dataObjectId: 0,
    groupBoxId: 0,
    messageId: 0,
    minQueueId: 0,
  });
  const [embeddedActivities, setEmbeddedActivities] = useState([]);
  const [processExpanded, setProcessExpanded] = useState(null);
  //Added on 27/09/2023, bug_id:138223
  const windowInnerHeight = useSelector(
    (state) => state.setWindowInnerHeight.windowInnerHeight
  );
  //till bug id:138223
  const openProcessLoader = useSelector(OpenProcessLoaderSliceValue);
  const {
    processData,
    setProcessData,
    caseEnabled,
    initialRender,
    spinner,
    processType,
    isReadOnly,
  } = props;
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData, setlocalLoadedProcessData] =
    useGlobalState(loadedProcessData);
  // Boolean that decides whether add milestone button will be visible or not.
  const createMilestoneFlag = getMenuNameFlag(
    userRightsValue?.menuRightsList,
    userRightsMenuNames.createMilestone
  );

  const showDependencyModal = useSelector(
    (state) => state.activityReducer.showDependencyModal
  );
  const activityDependencies = useSelector(
    (state) => state.activityReducer.activityDependencies
  );

  const isQueueRenameModalOpen = useSelector(
    (state) => state.activityReducer.isQueueRenameModalOpen
  );
  const renameActivityData = useSelector(
    (state) => state.activityReducer.renameActivityData
  );

  const dispatch = useDispatch();

  //function to add mile at the end
  const addNewMile = () => {
    addMilestone(t, setNewId, processData.ProcessDefId, setProcessData);
  };

  //function to add mile in between
  const addInBetweenNewMile = (indexVal) => {
    let milestoneId = 0,
      mileArr;
    setProcessData((prevProcessData) => {
      mileArr = JSON.parse(JSON.stringify(prevProcessData?.MileStones));
      //get max milestoneId
      prevProcessData?.MileStones?.forEach((milestone) => {
        if (+milestoneId < +milestone.iMileStoneId) {
          milestoneId = +milestone.iMileStoneId;
        }
      });
      return prevProcessData;
    });
    let prefix = t(milestoneNameConst);
    // code edited on 31 Jan 2023 for BugId 122662
    let milestoneName = checkDuplicateNameFunc(
      mileArr,
      "MileStoneName",
      prefix,
      milestoneId + 1
    );
    let newArray = addMileInBetweenArray(processData, indexVal);
    let newMile = {
      milestoneName: milestoneName,
      milestoneId: milestoneId + 1,
      seqId: newArray.SequenceId,
      width: defaultWidthMilestone,
      action: "A",
      activities: [],
    };
    newArray.array?.splice(newArray.SequenceId - 1, 0, newMile);
    // added on 27/10/23 for BugId 140242
    newArray = addMileInBetweenActWidthFixArray(newArray);
    addMilestoneInBetween(
      setNewId,
      processData.ProcessDefId,
      setProcessData,
      newMile,
      newArray.array
    );
  };

  const selectActivityHandler = (obj) => {
    if (obj) {
      setSelectedActivity(obj.ActivityId);
      props.selectedCell(
        obj.ActivityId,
        obj.ActivityName,
        obj.ActivityType,
        obj.ActivitySubType,
        null,
        obj.QueueId,
        getSelectedCellType("ACTIVITY"),
        obj.CheckedOut,
        obj.LaneId
      );
    } else if (obj === null) {
      setSelectedActivity(null);
      // code edited on 31 Oct 2022 for BugId 117792
      if (!props.showDrawerVal) {
        props.selectedCell(
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null
        );
      }
    }
  };

  const selectMileHandler = (obj) => {
    if (obj) {
      setSelectedMile(obj.iMileStoneId);
      props.selectedCell(
        obj.iMileStoneId,
        obj.MileStoneName,
        null,
        null,
        obj.SequenceId,
        null,
        getSelectedCellType("MILE"),
        false,
        null
      );
    } else if (obj === null) {
      setSelectedMile(null);
      props.selectedCell(null, null, null, null, null, null, null, null, null);
    }
  };

  // code added on 26 April 2023 for BugId 127607 - milestone/swimlane>>after switching between the process
  // then no option appears to add milestone/swimlane
  useEffect(() => {
    changeViewType(view.abstract.langKey);
  }, [processData?.ProcessDefId]);

  useEffect(() => {
    if (processData !== null || processData !== undefined) {
      //initialRender value is set to avoid localLoadedProcessData and processData from getting into loop
      if (localLoadedProcessData !== null && !initialRender) {
        setlocalLoadedProcessData(processData);
      }
      let maxMilestoneId = 0;
      let maxMilestoneSeqId = 0;
      let maxSwimlaneId = 0;
      let maxActivityId = 0;
      let maxConnectionID = 0;
      let minQueueId = 0;
      let maxDataObjectId = 0;
      let maxMSGAFId = 0;
      let maxGroupBoxId = 0;
      let maxAnnotId = 0;

      //get max milestoneId
      processData?.MileStones?.forEach((milestone) => {
        if (maxMilestoneId < milestone.iMileStoneId) {
          maxMilestoneId = milestone.iMileStoneId;
        }

        //get max SequenceId
        if (maxMilestoneSeqId < milestone.SequenceId) {
          maxMilestoneSeqId = milestone.SequenceId;
        }

        //get max ActivityId
        milestone.Activities.forEach((activity) => {
          if (maxActivityId < activity.ActivityId) {
            maxActivityId = activity.ActivityId;
          }
          if (activity.EmbeddedActivity) {
            activity.EmbeddedActivity[0].forEach((embAct) => {
              if (maxActivityId < embAct.ActivityId) {
                maxActivityId = embAct.ActivityId;
              }
            });
          }
        });
      });
      //get max Swimlaneid
      processData?.Lanes?.forEach((lane) => {
        if (maxSwimlaneId < lane.LaneId) {
          maxSwimlaneId = lane.LaneId;
        }
      });

      //get max ConnectionId
      processData?.Connections?.forEach((connection) => {
        if (maxConnectionID < connection.ConnectionId) {
          maxConnectionID = connection.ConnectionId;
        }
      });

      processData?.DataObjects?.forEach((dataObj) => {
        if (maxDataObjectId < dataObj.DataObjectId) {
          maxDataObjectId = dataObj.DataObjectId;
        }
      });

      processData?.MSGAFS?.forEach((msgAf) => {
        if (maxMSGAFId < msgAf.MsgAFId) {
          maxMSGAFId = msgAf.MsgAFId;
        }
      });

      processData?.Annotations?.forEach((annotation) => {
        if (maxAnnotId < annotation.AnnotationId) {
          maxAnnotId = annotation.AnnotationId;
        }
      });

      processData?.GroupBoxes?.forEach((groupBox) => {
        if (maxGroupBoxId < groupBox.GroupBoxId) {
          maxGroupBoxId = groupBox.GroupBoxId;
        }
      });

      // code added on 2 Dec 2022 for BugId 120032
      processData?.Queue?.forEach((queue) => {
        if (+queue.QueueId < +minQueueId) {
          minQueueId = +queue.QueueId;
        }
      });

      //if there are any changes then update newId state
      if (
        maxActivityId !== newId.activityId ||
        maxConnectionID !== newId.connectionId ||
        maxMilestoneId !== newId.milestoneId ||
        maxSwimlaneId !== newId.swimlaneId ||
        minQueueId !== newId.minQueueId ||
        maxDataObjectId !== newId.dataObjectId ||
        maxMSGAFId !== newId.messageId ||
        maxAnnotId !== newId.annotationId ||
        maxGroupBoxId !== newId.groupBoxId
      ) {
        setNewId({
          ...newId,
          milestoneId: maxMilestoneId,
          milestoneSeqId: maxMilestoneSeqId,
          swimlaneId: maxSwimlaneId,
          activityId: maxActivityId,
          connectionId: maxConnectionID,
          minQueueId: minQueueId,
          dataObjectId: maxDataObjectId,
          messageId: maxMSGAFId,
          annotationId: maxAnnotId,
          groupBoxId: maxGroupBoxId,
        });
      }
    }
  }, [processData]);

  useEffect(() => {
    const popupMenu = document.querySelectorAll(".mxPopupMenu");
    popupMenu?.forEach((item) => {
      item.remove();
    });
  }, [viewType]);

  //code edited on 15 Nov 2022 for BugId 115645
  useEffect(() => {
    let collection = document.getElementsByClassName("mileDivRef");
    let actCol = document.getElementsByClassName("mileActDivRef");
    let mileHeightArr = [];
    Array.from(actCol).forEach(function (element) {
      mileHeightArr.push(element.clientHeight);
    });
    if (mileHeightArr?.length > 0) {
      let maxMileHeight = Math.max(...mileHeightArr);
      Array.from(collection).forEach(function (element) {
        element.style.height = +maxMileHeight + 41 + "px";
      });
    }
  });
  useEffect(() => {
    //Added on 27/09/2023, bug_id:138223
    const updateWindowDimensions = () => {
      dispatch(setWindowInnerHeight(window.innerHeight));
    };
    //till bug id:138223
    window.addEventListener("resize", updateWindowDimensions);
    return () => window.removeEventListener("resize", updateWindowDimensions);
  }, []);

  // Function which handles the drag and drop functionality in the abstract view when a milestone or an activity card is dropped in a region.
  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) {
      return;
      //}  else if (
      //   source.droppableId.includes("_") &&
      //   destination.droppableId.includes("_")
      // ) {
      //   const associatedActivitiesArray = embeddedActivities;
      //   const [reOrderedList] = associatedActivitiesArray.splice(source.index, 1);
      //   associatedActivitiesArray.splice(destination.index, 0, reOrderedList);
      //   setEmbeddedActivities(associatedActivitiesArray);
      // } else if (source.droppableId.includes("_")) {
      //   const sourceId = source.droppableId;
      //   const temp = sourceId.split("_");
      //   const mileStoneIndex = +temp[0];
      //   const activityIndex = +temp[1];
      //   const destinationMileStoneIndex = +destination.droppableId;
      //   const processObjectData = { ...processData };
      //   const [reOrderedList] = embeddedActivities.splice(source.index, 1);
      //   setEmbeddedActivities(embeddedActivities);
      //   processObjectData.MileStones[destinationMileStoneIndex].Activities.splice(
      //     destination.index,
      //     0,
      //     reOrderedList
      //   );
      //   setProcessData(processObjectData);
      // } else if (destination.droppableId.includes("_")) {
      //   const destinationId = destination.droppableId;
      //   const temp = destinationId.split("_");
      //   const mileStoneIndex = +temp[0];
      //   const activityIndex = +temp[1];
      //   const sourceMileStoneIndex = +source.droppableId;
      //   const processObjectData = { ...processData };
      //   const [reOrderedItem] = processObjectData.MileStones[
      //     sourceMileStoneIndex
      //   ].Activities.splice(source.index, 1);
      //   embeddedActivities.splice(destination.index, 0, reOrderedItem);
      //   setEmbeddedActivities(embeddedActivities);
    } else if (
      source.droppableId === "milestones" &&
      source.index !== destination.index &&
      result.type === "MILE"
    ) {
      let mileArr = moveMilestoneArray(processData, source, destination);
      const [reOrderedList] = mileArr.splice(source.index, 1);
      mileArr.splice(destination.index, 0, reOrderedList);
      // added on 27/10/23 for BugId 140242
      mileArr = moveMilestoneActWidthFixArray(mileArr);
      moveMilestone(
        mileArr,
        setProcessData,
        processData.ProcessDefId,
        source.index,
        destination.index,
        processData
      );
    } else {
      if (props.taskExpanded) {
        props.setExpandedTask(expandedViewOnDrop);
      }
      handleDragEnd(result, processData, setProcessData);
    }
  };

  const closeDependencyModal = () => {
    dispatch(setShowDependencyModal(false));
    dispatch(setActivityDependencies(null));
    dispatch(setDependencyErrorMsg(null));
    dispatch(setWorkitemFlag(false));
  };

  const closeQueueRenameModal = () => {
    dispatch(setQueueRenameModalOpen(false));
    dispatch(setRenameActivityData(null));
  };

  const renameActWithoutQueueName = () => {
    renameActivityFunc(false);
  };

  const renameActWithQueueName = () => {
    renameActivityFunc(true);
  };

  const renameActivityFunc = (queueRename) => {
    const actId = renameActivityData?.actId;
    const oldActName = renameActivityData?.oldActName;
    const newActivityName = renameActivityData?.newActivityName;
    const setProcessData = renameActivityData?.setProcessData;
    const processDefId = renameActivityData?.processDefId;
    const processName = renameActivityData?.processName;
    const queueId = renameActivityData?.queueId;
    const queueInfo = renameActivityData?.queueInfo;
    const isBpmn = renameActivityData?.isBpmn;

    renameActivity(
      actId,
      oldActName,
      newActivityName,
      setProcessData,
      processDefId,
      processName,
      queueId,
      queueInfo,
      isBpmn,
      queueRename,
      dispatch,
      t
    );
  };

  let showToolBox = isReadOnly
    ? false
    : (localLoadedProcessData?.ProcessType !== PROCESSTYPE_REGISTERED &&
        localLoadedProcessData?.ProcessType !== "RC" &&
        LatestVersionOfProcess(localLoadedProcessData?.Versions) ===
          +localLoadedProcessData?.VersionNo) ||
      (checkIfSwimlaneCheckedOut(localLoadedProcessData)?.length > 0 &&
        viewType === view.bpmn.langKey);
  const isTouchDevice =
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0;

  return spinner || openProcessLoader.loader ? (
    <CircularProgress
      style={
        direction === RTL_DIRECTION
          ? { marginTop: "40vh", marginRight: "50%" }
          : { marginTop: "40vh", marginLeft: "50%" }
      }
    />
  ) : (
    <div
      style={{
        width: "100%",
      }}
      className={classes.viewingArea}
    >
      {isTouchDevice && viewType === view.bpmn.langKey ? (
        <Toast
          autoHide={false}
          open={true}
          message={t("touchEnabledMsg")}
          severity={"warning"}
          className={classes.bpmnTouchToast}
          alertClassName={classes.bpmnTouchAlert}
        />
      ) : null}
      {/*code edited on 19 Oct 2022 for BugId 117329 */}
      {showToolBox ? (
        <ToolBox
          view={viewType}
          caseEnabled={caseEnabled}
          graph={viewType === view.bpmn.langKey ? graphToolbox : null}
          setProcessData={setProcessData}
          setNewId={setNewId}
          expandedView={expandedView}
          setExpandedView={setExpandedView}
        />
      ) : null}
      <div className={classes.contentViewingArea}>
        <SubHeader
          viewType={viewType}
          changeViewType={changeViewType}
          setProcessData={setProcessData}
          processData={processData}
          floatButtonHeight={props.floatButtonHeight}
          setExpandedView={setExpandedView}
          processType={processType}
          setNewId={setNewId}
        />
        {viewType === view.abstract.langKey ? (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable
              droppableId="milestones"
              direction="horizontal"
              type="MILE"
            >
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  style={
                    showToolBox
                      ? {
                          /* code edited on 6 July 2023 for issue - save and discard button hide issue 
                          in case of tablet(landscape mode)*/
                          height: `calc(${windowInnerHeight}px - 16rem)`,
                        }
                      : {
                          width: props.showDrawerVal ? "70vw" : "99.5vw",
                          /* code edited on 6 July 2023 for issue - save and discard button hide issue 
                          in case of tablet(landscape mode)*/
                          height: `calc(${windowInnerHeight}px - 16rem)`,
                        }
                  }
                  className={
                    (expandedView
                      ? classes.abstractViewExpanded
                      : props.showDrawerVal
                      ? classes.abstractDrawerWidth
                      : classes.abstractView) +
                    (viewType === view.abstract.langKey
                      ? ""
                      : " " + classes.hiddenView)
                  }
                >
                  <Milestones
                    isReadOnly={isReadOnly}
                    caseEnabled={caseEnabled}
                    embeddedActivities={embeddedActivities}
                    setEmbeddedActivities={setEmbeddedActivities}
                    addNewMile={addNewMile}
                    processData={processData}
                    setprocessData={setProcessData}
                    selectedMile={selectedMile}
                    selectedActivity={selectedActivity}
                    selectMileHandler={selectMileHandler}
                    selectActivityHandler={selectActivityHandler}
                    addInBetweenNewMile={addInBetweenNewMile}
                    activityId={newId}
                    processType={processType}
                    setNewId={setNewId}
                    processExpanded={processExpanded}
                    setProcessExpanded={setProcessExpanded}
                    direction={direction}
                  />
                  {provided.placeholder}
                  {createMilestoneFlag && (
                    <div
                      className={
                        direction === RTL_DIRECTION
                          ? classes.addBtnArabic
                          : classes.addBtn
                      }
                      id="pmweb_addMileBtn"
                      onClick={() => addNewMile()}
                      style={{
                        display:
                          processType !== PROCESSTYPE_LOCAL &&
                          processType !== PROCESSTYPE_LOCAL_CHECKED
                            ? "none"
                            : "",
                      }}
                    >
                      <div
                        className={
                          direction === RTL_DIRECTION
                            ? classes.beforeDivArabic
                            : classes.beforeDiv
                        }
                      ></div>
                      <p
                        className={classes.addicon}
                        tabIndex={0}
                        onKeyPress={(e) => {
                          if (e.code === "Enter") {
                            addNewMile();
                          }
                        }}
                      >
                        +
                      </p>
                      <div
                        className={
                          direction === RTL_DIRECTION
                            ? classes.afterDivArabic
                            : classes.afterDiv
                        }
                      ></div>
                    </div>
                  )}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        ) : null}

        {viewType === view.bpmn.langKey ? (
          <div
            className={
              (expandedView
                ? classes.bpmnViewExpanded
                : props.showDrawerVal
                ? classes.bpmnDrawerWidth
                : classes.bpmnView) +
              (viewType === view.bpmn.langKey ? "" : " " + classes.hiddenView)
            }
            id="bpmnView"
            style={
              // modified on 17/10/23 for BugId 138903
              /*showToolBox
                ? {}
                : { width: props.showDrawerVal ? "70vw" : "99.5vw" }*/
              showToolBox
                ? { overflow: "hidden" }
                : {
                    width: props.showDrawerVal ? "70vw" : "99.5vw",
                    overflow: "hidden",
                  }
              // till here BugId 138903
            }
          >
            <Graph
              isReadOnly={isReadOnly}
              caseEnabled={caseEnabled}
              displayMessage={props.displayMessage}
              processData={processData}
              setProcessData={setProcessData}
              setNewId={setNewId}
              setGraphToolbox={setGraphToolbox}
              processType={processType}
              viewType={viewType}
              expandedView={expandedView}
              showToolBox={showToolBox}
            />
          </div>
        ) : null}
      </div>
      <div
        style={{
          width: "0.5vw",
          boxShadow:
            direction === RTL_DIRECTION
              ? "-3px 4px 0px 4px #dadada"
              : "3px 4px 0px 4px #dadada",
          position: "relative",
        }}
      >
        {/*****************************************************************************************
         * @author asloob_ali BUG ID: 113220 Getting blank properties when just the process is created
         * Reason:in case of there is no activity selected it was allowing to open the properties drawer and nothing was visible on that drawr.
         * Resolution :disabled the properties btn in case of there is not any selected activity.
         * Date : 20/09/2022
         ****************/}
        {/*code edited on 28 Oct 2022 for BugId 117792 */}
        <button
          onClick={() => {
            if (
              props.cellID &&
              (props.cellType === getSelectedCellType("TASK") ||
                props.cellType === getSelectedCellType("TASKTEMPLATE") ||
                props.cellType === getSelectedCellType("ACTIVITY"))
            ) {
              props.showDrawer(true);
            }
          }}
          className={`${
            direction === RTL_DIRECTION
              ? "propertiesButtonArabic_abstract"
              : "propertiesButton_abstract"
          } ${
            props.cellID &&
            (props.cellType === getSelectedCellType("TASK") ||
              props.cellType === getSelectedCellType("TASKTEMPLATE") ||
              props.cellType === getSelectedCellType("ACTIVITY"))
              ? ""
              : "disabledPropertiesBtn"
          }`}
          id="pmweb_actPropertiesBtn"
        >
          <div
            className="stopIcon"
            style={{
              cursor:
                props.cellID &&
                (props.cellType === getSelectedCellType("TASK") ||
                  props.cellType === getSelectedCellType("TASKTEMPLATE") ||
                  props.cellType === getSelectedCellType("ACTIVITY"))
                  ? "pointer"
                  : "default",
            }}
          >
            <img
              style={{
                width: "100%",
              }}
              src={PropertiesIcon}
              alt={t("Properties")}
            />
          </div>
          <span>{t("Properties")}</span>
        </button>
        <PropertiesTab
          processData={processData}
          direction={direction}
          isReadOnly={isReadOnly}
          caseEnabled={caseEnabled}
        />
        {/*<ZoomInOut />*/}
      </div>

      {showDependencyModal && activityDependencies?.length > 0 ? (
        <Modal
          show={showDependencyModal}
          style={{
            width: "45vw",
            left: "28%",
            top: "26.5%",
            padding: "0",
          }}
          children={
            <ObjectDependencies
              processAssociation={activityDependencies}
              cancelFunc={() => closeDependencyModal()}
            />
          }
        />
      ) : null}

      {isQueueRenameModalOpen && (
        <ModalForm
          title={`${t("Rename")}${SPACE}${t("queue")}`}
          containerHeight={180}
          isOpen={isQueueRenameModalOpen ? true : false}
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
    </div>
  );
}

const mapDispatchToProps = (dispatch) => {
  return {
    showDrawer: (flag) => dispatch(actionCreators_activity.showDrawer(flag)),
    selectedCell: (
      id,
      name,
      activityType,
      activitySubType,
      seqId,
      queueId,
      type,
      checkedOut,
      laneId
    ) =>
      dispatch(
        actionCreators.selectedCell(
          id,
          name,
          activityType,
          activitySubType,
          seqId,
          queueId,
          type,
          checkedOut,
          laneId
        )
      ),
    setExpandedTask: (taskExpanded) =>
      dispatch(actionCreators_task.expandedTask(taskExpanded)),
  };
};
const mapStateToProps = (state) => {
  return {
    showDrawerVal: state.showDrawerReducer.showDrawer,
    taskExpanded: state.taskReducer.taskExpanded,
    cellID: state.selectedCellReducer.selectedId,
    cellType: state.selectedCellReducer.selectedType,
    openProcessVersion: state.openProcessClick.selectedVersion,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ViewingArea);
