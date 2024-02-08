// #BugID - 123036
// #BugDescription - Handled screen crashing issue.
import React, { useRef, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { deleteCell } from "../../../utility/bpmnView/deleteCell";
import { addMxGraph } from "../../../utility/bpmnView/addMxGraph";
import { drawOnGraph } from "../../../utility/bpmnView/drawOnGraph";
import { getSelectedCell } from "../../../utility/bpmnView/getSelectedCell";
import { connect, useDispatch, useSelector } from "react-redux";
import * as actionCreators from "../../../redux-store/actions/selectedCellActions";
import { removeToolDivCell } from "../../../utility/bpmnView/getToolDivCell";
import { hideIcons } from "../../../utility/bpmnView/cellOnMouseClick";
import * as actionCreators_drawer from "../../../redux-store/actions/Properties/showDrawerAction";
import {
  copy,
  removeContextMenu,
} from "../../../utility/bpmnView/getContextMenu";
import "./Graph.css";
import { collapseExpandedProcess } from "../../../utility/bpmnView/cellOnMouseHover";
import { graphMinDimension } from "../../../Constants/bpmnView";
import { useHistory } from "react-router-dom";
import * as openActionCreators from "../../../redux-store/actions/processView/actions.js";
import { store, useGlobalState } from "state-pool";
import { getSelectedCellType } from "../../../utility/abstarctView/getSelectedCellType";
import { pasteFunction } from "../../../utility/bpmnView/createPopupMenu";
import ObjectDependencies from "../../../UI/ObjectDependencyModal";
import Modal from "../../../UI/Modal/Modal";
import {
  MENUOPTION_CHECKIN_ACT,
  MENUOPTION_CHECKIN_LANE,
  MENUOPTION_CHECKOUT_ACT,
  MENUOPTION_CHECKOUT_LANE,
  MENUOPTION_UNDO_CHECKOUT_ACT,
  MENUOPTION_UNDO_CHECKOUT_LANE,
  PROCESSTYPE_DEPLOYED,
  PROCESSTYPE_LOCAL,
  PROCESSTYPE_LOCAL_CHECKED,
  PROCESSTYPE_REGISTERED,
  RTL_DIRECTION,
} from "../../../Constants/appConstants";
import CheckOutActModal from "../AbstractView/Milestones/Milestone/ActivityView/Activity/CheckoutActivity";
import UndoCheckoutActivity from "../AbstractView/Milestones/Milestone/ActivityView/Activity/UndoCheckoutActivity";
import QueueAssociation from "../../Properties/PropetiesTab/QueueAssociation";
import CheckInActivity from "../AbstractView/Milestones/Milestone/ActivityView/Activity/CheckInActivity";
import CheckoutLane from "./CheckoutLane";
import CheckinLane from "./CheckinLane";
import UndoCheckoutLane from "./UndoCheckoutLane";
import { checkIfSwimlaneCheckedOut } from "../../../utility/SwimlaneCheckedStatus/SwimlaneCheckedStatus";
import { UserRightsValue } from "../../../redux-store/slices/UserRightsSlice";
import { Box, Drawer } from "@material-ui/core";
import ProcessProgress from "../Header/ProcessValidation/ProcessProgress";

let swimlaneLayer, milestoneLayer, rootLayer;
let buttons = {};

export function getGraphLayers() {
  return [rootLayer, milestoneLayer, swimlaneLayer];
}

function Graph(props) {
  const containerRef = useRef(null);
  const { caseEnabled, isReadOnly, expandedView, showToolBox } = props;
  const userRightsValue = useSelector(UserRightsValue);
  //t is our translation function
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  let [graph, setGraphObj] = useState(null);
  let [openDeployedProcess, setOpenDeployedProcess] = useState(null);
  const [showDependencyModal, setShowDependencyModal] = useState(false);
  const [showQueueModal, setShowQueueModal] = useState({
    show: false,
    queueId: null,
  });
  const [taskAssociation, setTaskAssociation] = useState([]);
  const [actionModal, setActionModal] = useState({ type: null, activity: {} });
  const history = useHistory();
  const dispatch = useDispatch();
  const loadedProcessData = store.getState("loadedProcessData"); //current processdata clicked
  const [localLoadedProcessData, setlocalLoadedProcessData] =
    useGlobalState(loadedProcessData);
  const [errorVariables, setErrorVariables] = useState([]);
  const [warningVariables, setWarningVariables] = useState([]);
  const [state, setState] = useState({
    top: false,
    left: false,
    bottom: false,
    right: false,
  });

  const deleting = (deleteGraph) => {
    deleteCell(
      deleteGraph,
      props.setProcessData,
      setTaskAssociation,
      setShowDependencyModal,
      dispatch,
      t
    );
    //remove other related attributes when particular entity is deleted
    removeToolDivCell();
    removeContextMenu();
    hideIcons();
  };

  const onClick = async ({ openPropertyWindow = false }) => {
    if (graph) {
      //code to select particular entity on bpmn graph
      // code edited on 11 March 2023 for BugId 124899
      let obj = await getSelectedCell(graph, localLoadedProcessData);
      if (obj) {
        if (obj.type === getSelectedCellType("TASK")) {
          props.selectedTask(obj.id, obj.name, obj.taskType, obj.type);
        } else {
          props.selectedCell(
            obj.id,
            obj.name,
            obj.activityType,
            obj.activitySubType,
            obj.seqId,
            obj.queueId,
            obj.type,
            obj.checkedOut,
            obj.laneId
          );
          if (obj.type === null || !obj.type) {
            // added on 29/09/23 for BugId 135398
            props.showDrawer(false);
          }
        }
        if (openPropertyWindow) {
          props.showDrawer(true);
        }
      }
    }
  };

  const onKeyUp = (event) => {
    //if isReadOnly -> don't do any action on keyUp
    if (isReadOnly) return;

    let key = event.key;
    let keyCode = event.which || event.keyCode; // Detecting keyCode
    // Detecting Ctrl
    let ctrl = event.ctrlKey ? event.ctrlKey : keyCode === 17 ? true : false;

    // code added on 28 August 2023 for BugId 134182 - WCAG:Process Designer > create process >
    // Process flow focus is not goin on some object.
    if (event.key === "Enter") {
      onClick({ openPropertyWindow: true });
    } else {
      // code edited on 11 March 2023 for BugId 124899
      if (
        localLoadedProcessData?.ProcessType === PROCESSTYPE_LOCAL ||
        localLoadedProcessData?.ProcessType === PROCESSTYPE_LOCAL_CHECKED ||
        ((localLoadedProcessData?.ProcessType === PROCESSTYPE_REGISTERED ||
          localLoadedProcessData?.ProcessType === PROCESSTYPE_DEPLOYED) &&
          localLoadedProcessData?.CheckedOut === "Y")
      ) {
        // If keyCode pressed is V and if ctrl is true.
        if (keyCode == 86 && ctrl) {
          // Ctrl+V is pressed
          pasteFunction(
            graph,
            null,
            props.setProcessData,
            props.setNewId,
            t,
            caseEnabled
          );
        } else if (keyCode == 67 && ctrl) {
          // Ctrl+C is pressed
          copy(graph, null);
          removeToolDivCell();
          removeContextMenu();
          hideIcons();
        }
      }

      // code added on 7 Sep 2022 for BugId 115477
      // code edited on 11 March 2023 for BugId 124899
      if (
        localLoadedProcessData?.ProcessType === PROCESSTYPE_LOCAL ||
        localLoadedProcessData?.ProcessType === PROCESSTYPE_LOCAL_CHECKED ||
        checkIfSwimlaneCheckedOut(localLoadedProcessData)?.length > 0
      ) {
        if (key === "Delete") {
          deleting(graph);
        }
      }
    }
  };

  // code added on 30 March 2023 for BugId 125900
  const list = (anchor) => (
    <Box
      sx={{ width: anchor === "top" || anchor === "bottom" ? "auto" : 250 }}
      role="presentation"
    >
      <ProcessProgress
        errorVariables={errorVariables}
        setErrorVariables={setErrorVariables}
        warningVariables={warningVariables}
        setWarningVariables={setWarningVariables}
        toggleDrawer={() => toggleDrawer(anchor, false)}
        checkOutData={localLoadedProcessData?.CheckedOut}
        stopValidateCall={true}
        hideDeployOption={true}
      />
    </Box>
  );

  const toggleDrawer = (anchor, open) => {
    setState({ ...state, [anchor]: open });
  };

  useEffect(() => {
    // code edited on 11 March 2023 for BugId 124899
    if (graph) {
      let taskLaneStyle = graph.getStylesheet().getCellStyle("tasklane");
      let swimlaneStyle = graph.getStylesheet().getCellStyle("swimlane");
      let milestoneStyle = graph.getStylesheet().getCellStyle("milestone");
      let expandedEmbeddedStyle = graph
        .getStylesheet()
        .getCellStyle("expandedEmbeddedProcess");
      if (
        localLoadedProcessData?.ProcessType !== PROCESSTYPE_LOCAL &&
        localLoadedProcessData?.ProcessType !== PROCESSTYPE_LOCAL_CHECKED
      ) {
        taskLaneStyle.resizable = 0;
        swimlaneStyle.resizable = 0;
        milestoneStyle.resizable = 0;
        expandedEmbeddedStyle.resizable = 0;
      } else {
        taskLaneStyle.resizable = 1;
        swimlaneStyle.resizable = 1;
        milestoneStyle.resizable = 1;
        expandedEmbeddedStyle.resizable = 1;
      }
      graph.getStylesheet().putCellStyle("tasklane", taskLaneStyle);
      graph.getStylesheet().putCellStyle("swimlane", swimlaneStyle);
      graph.getStylesheet().putCellStyle("milestone", milestoneStyle);
      graph
        .getStylesheet()
        .putCellStyle("expandedEmbeddedProcess", expandedEmbeddedStyle);
    }
  }, [localLoadedProcessData?.ProcessType]);

  useEffect(() => {
    let tempGraph;
    [tempGraph, rootLayer, swimlaneLayer, milestoneLayer, buttons] = [
      ...addMxGraph({
        containerRef,
        setNewId: props.setNewId,
        showDrawer: props.showDrawer,
        translation: t,
        setProcessData: props.setProcessData, // code edited on 7 March 2023 for BugId 124772
        caseEnabled,
        isReadOnly,
        setOpenDeployedProcess,
        setTaskAssociation,
        setShowDependencyModal,
        setShowQueueModal,
        setActionModal,
        dispatch,
        menuRightsList: userRightsValue?.menuRightsList || [],
      }),
    ];
    setGraphObj(tempGraph);
    props.setGraphToolbox(tempGraph);
    collapseExpandedProcess(props.setProcessData, tempGraph);
  }, []);

  useEffect(() => {
    if (openDeployedProcess && openDeployedProcess != null) {
      props.openProcessClick(
        openDeployedProcess.AssociatedProcess.Associated_ProcessDefId,
        openDeployedProcess.AssociatedProcess.Associated_ProjectName,
        "R",
        openDeployedProcess.AssociatedProcess.Associated_VersionNo,
        openDeployedProcess.AssociatedProcess.Associated_ProcessName
      );
      props.openTemplate(null, null, false);
      setlocalLoadedProcessData(null);
      setOpenDeployedProcess(null);
      history.push("/process");
    }
  }, [openDeployedProcess]);

  //call on render to paint processData on graph
  useEffect(() => {
    if (graph && props.processData) {
      drawOnGraph(
        graph,
        [swimlaneLayer, milestoneLayer, rootLayer],
        buttons,
        props.processData,
        caseEnabled,
        t
      );
    }
  });

  useEffect(() => {
    document.addEventListener("click", onClick);
    document.addEventListener("keyup", onKeyUp);
    //document.addEventListener("dblclick", ondblclick)
    return function cleanup() {
      document.removeEventListener("keyup", onKeyUp);
      document.removeEventListener("click", onClick);
      //document.removeEventListener("dblclick", ondblclick)
    };
  });

  return (
    /*height and width are set according to canvas width of graph in bpmn*/
    /*code edited on 7 Oct 2022 for BugId 115317 */
    <div
      id="graph"
      // modified on 17/10/23 for BugId 138903
      className={`${
        expandedView
          ? "bpmnViewExpanded"
          : props.showDrawerVal
          ? "bpmnDrawerWidth"
          : "bpmnView"
      } Graph`}
      style={
        showToolBox
          ? {}
          : {
              width: props.showDrawerVal ? "70vw" : "99.5vw",
            }
      }
      // till here BugId 138903
    >
      <div
        // code added on 28 August 2023 for BugId 134182 - WCAG:Process Designer > create process >
        // Process flow focus is not goin on some object.
        id="bpmnGrid"
        ref={containerRef}
         // modified on 17/10/23 for BugId 138903
        className={`${
          expandedView
            ? "bpmnViewExpanded"
            : props.showDrawerVal
            ? "bpmnDrawerWidth"
            : "bpmnView"
        } Grid`}
        style={
          showToolBox
            ? { overflow: "auto" }
            : {
                width: props.showDrawerVal ? "70vw" : "99.5vw",
                overflow: "auto",
              }
        }
        // till here BugId 138903
        
        // code added on 28 August 2023 for BugId 134182 - WCAG:Process Designer > create process >
        // Process flow focus is not goin on some object.
        tabIndex={0}
      ></div>
      {showDependencyModal ? (
        <Modal
          show={showDependencyModal}
          style={{
            width: "45vw",
            left: "28%",
            top: "21.5%",
            padding: "0",
          }}
          modalClosed={() => setShowDependencyModal(false)}
          children={
            <ObjectDependencies
              {...props}
              processAssociation={taskAssociation}
              cancelFunc={() => setShowDependencyModal(false)}
            />
          }
        />
      ) : null}

      {actionModal.type === MENUOPTION_CHECKOUT_ACT ? (
        <Modal
          show={actionModal.type === MENUOPTION_CHECKOUT_ACT}
          style={{
            padding: "0",
            width: "33vw",
            left: "33%",
            top: "30%",
          }}
          modalClosed={() => setActionModal({ type: null, activity: {} })}
          children={
            <CheckOutActModal
              setModalClosed={() =>
                setActionModal({ type: null, activity: {} })
              }
              modalType={MENUOPTION_CHECKOUT_ACT}
              actName={actionModal.activity.ActivityName}
              actId={actionModal.activity.ActivityId}
              laneId={actionModal.activity.LaneId}
              setprocessData={props.setProcessData}
            />
          }
        />
      ) : null}
      {actionModal.type === MENUOPTION_UNDO_CHECKOUT_ACT ? (
        <Modal
          show={actionModal.type === MENUOPTION_UNDO_CHECKOUT_ACT}
          style={{
            padding: "0",
            width: "33vw",
            left: "33%",
            top: "30%",
          }}
          modalClosed={() => setActionModal({ type: null, activity: {} })}
          children={
            <UndoCheckoutActivity
              setModalClosed={() =>
                setActionModal({ type: null, activity: {} })
              }
              modalType={MENUOPTION_UNDO_CHECKOUT_ACT}
              actName={actionModal.activity.ActivityName}
              actId={actionModal.activity.ActivityId}
              laneId={actionModal.activity.LaneId}
              setprocessData={props.setProcessData}
            />
          }
        />
      ) : null}
      {actionModal.type === MENUOPTION_CHECKIN_ACT ? (
        <Modal
          show={actionModal.type === MENUOPTION_CHECKIN_ACT}
          style={{
            padding: "0",
            width: "33vw",
            left: "33%",
            top: "30%",
          }}
          modalClosed={() => setActionModal({ type: null, activity: {} })}
          children={
            <CheckInActivity
              setModalClosed={() =>
                setActionModal({ type: null, activity: {} })
              }
              modalType={MENUOPTION_CHECKIN_ACT}
              actName={actionModal.activity.ActivityName}
              actId={actionModal.activity.ActivityId}
              activity={actionModal.activity}
              setprocessData={props.setProcessData}
            />
          }
        />
      ) : null}

      {actionModal.type === MENUOPTION_CHECKOUT_LANE ? (
        <Modal
          show={actionModal.type === MENUOPTION_CHECKOUT_LANE}
          style={{
            padding: "0",
            width: "33vw",
            left: "33%",
            top: "30%",
          }}
          modalClosed={() => setActionModal({ type: null, activity: {} })}
          children={
            <CheckoutLane
              setModalClosed={() =>
                setActionModal({ type: null, activity: {} })
              }
              modalType={MENUOPTION_CHECKOUT_LANE}
              laneName={actionModal.activity.LaneName}
              laneId={actionModal.activity.LaneId}
              setprocessData={props.setProcessData}
            />
          }
        />
      ) : null}
      {actionModal.type === MENUOPTION_CHECKIN_LANE ? (
        <Modal
          show={actionModal.type === MENUOPTION_CHECKIN_LANE}
          style={{
            padding: "0",
            width: "33vw",
            left: "33%",
            top: "30%",
          }}
          modalClosed={() => setActionModal({ type: null, activity: {} })}
          children={
            <CheckinLane
              setModalClosed={() =>
                setActionModal({ type: null, activity: {} })
              }
              modalType={MENUOPTION_CHECKIN_LANE}
              laneName={actionModal.activity.LaneName}
              laneId={actionModal.activity.LaneId}
              setprocessData={props.setProcessData}
              // code added on 30 March 2023 for BugId 125900
              setWarningVariables={setWarningVariables}
              setErrorVariables={setErrorVariables}
              toggleDrawer={toggleDrawer}
            />
          }
        />
      ) : null}
      {actionModal.type === MENUOPTION_UNDO_CHECKOUT_LANE ? (
        <Modal
          show={actionModal.type === MENUOPTION_UNDO_CHECKOUT_LANE}
          style={{
            padding: "0",
            width: "33vw",
            left: "33%",
            top: "30%",
          }}
          modalClosed={() => setActionModal({ type: null, activity: {} })}
          children={
            <UndoCheckoutLane
              setModalClosed={() =>
                setActionModal({ type: null, activity: {} })
              }
              modalType={MENUOPTION_UNDO_CHECKOUT_LANE}
              laneName={actionModal.activity.LaneName}
              laneId={actionModal.activity.LaneId}
              setprocessData={props.setProcessData}
            />
          }
        />
      ) : null}

      {showQueueModal.show ? (
        <Modal
          show={showQueueModal.show}
          style={{
            top: window.innerWidth < 1200 ? "26%" : "20%",
            left: direction === RTL_DIRECTION ? "unset" : "calc(50% - 25rem)",
            right: direction === RTL_DIRECTION ? "calc(50% - 25rem)" : "unset",
            minWidth: "50rem",
            zIndex: "1500",
            boxShadow: "0px 3px 6px #00000029",
            border: "1px solid #D6D6D6",
            borderRadius: "3px",
            direction: direction,
            padding: "0px",
          }}
          // modalClosed={() => setShowQueueModal(false)}
          children={
            <QueueAssociation
              queueType="0"
              queueFrom="graph"
              showQueueModal={showQueueModal}
              setShowQueueModal={setShowQueueModal}
            />
          }
        />
      ) : null}
      {/* code added on 30 March 2023 for BugId 125900 */}
      {state["bottom"] ? (
        <Drawer
          anchor={"bottom"}
          open={state["bottom"]}
          onClose={() => toggleDrawer("bottom", false)}
          BackdropProps={{ invisible: true }}
        >
          {list("bottom")}
        </Drawer>
      ) : null}
    </div>
  );
}

const mapDispatchToProps = (dispatch) => {
  return {
    showDrawer: (flag) => dispatch(actionCreators_drawer.showDrawer(flag)),
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
    openProcessClick: (id, name, type, version, processName) =>
      dispatch(
        openActionCreators.openProcessClick(
          id,
          name,
          type,
          version,
          processName
        )
      ),
    openTemplate: (id, name, flag) =>
      dispatch(openActionCreators.openTemplate(id, name, flag)),
    selectedTask: (id, name, taskType, type) =>
      dispatch(actionCreators.selectedTask(id, name, taskType, type)),
  };
};

const mapStateToProps = (state) => {
  return {
    showDrawerVal: state.showDrawerReducer.showDrawer,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Graph);
