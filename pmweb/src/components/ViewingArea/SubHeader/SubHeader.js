import React, { useEffect, useState } from "react";
import FloatingTab from "../../Tabs/Tabs";
import { RTL_DIRECTION, view } from "../../../Constants/appConstants";
// import undo from "../../../assets/subHeader/undo.svg";
// import redo from "../../../assets/subHeader/redo.svg";
// import cut from "../../../assets/subHeader/cut.svg";
// import copy from "../../../assets/subHeader/copy.svg";
// import copy_disabled from "../../../assets/subHeader/copy_disabled.svg";
// import paste from "../../../assets/subHeader/paste.svg";
// import paste_disabled from "../../../assets/subHeader/paste_disabled.svg";
// import deleteIcon from "../../../assets/subHeader/delete.svg";
// import select from "../../../assets/subHeader/select.svg";
import dropdown from "../../../assets/subHeader/dropdown.svg";
// import viewIcon from "../../../assets/subHeader/view.svg";
import { connect } from "react-redux";
import "./SubHeader.css";
// import { deleteFunctionality } from "../../../utility/SubHeader/deleteFunctionality";
// import { getSelectedCellType } from "../../../utility/abstarctView/getSelectedCellType";
import Modal from "../../../UI/Modal/Modal";
import { useTranslation } from "react-i18next";
import SubProcesses from "./SubProcesses";
// import { hideIcons } from "../../../utility/bpmnView/cellOnMouseClick";
// import { removeContextMenu } from "../../../utility/bpmnView/getContextMenu";
// import { removeToolDivCell } from "../../../utility/bpmnView/getToolDivCell";
// import { pasteFunctionality } from "../../../utility/SubHeader/pasteFunctionality";
import abstractIcon from "../../../assets/abstractView/abstractView.svg";
import selectedAbstractIcon from "../../../assets/abstractView/abstractViewSelected.svg";
import bpmnIcon from "../../../assets/abstractView/bpmnView.svg";
import selectedBpmnIcon from "../../../assets/abstractView/bpmnViewSelected.svg";

const SubHeader = (props) => {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const [showSubprocessModal, setShowSubprocessModal] = useState(false);
  const [subProcessCount, setSubProcessCount] = useState("0");
  const [callActivity, setcallActivity] = useState([]);
  // const [embededSubProcess, setembededSubProcess] = useState([]);
  // const [copiedCell, setCopiedCell] = useState(null);

  const subProcessHandler = () => {
    if (subProcessCount > 0) {
      setShowSubprocessModal(true);
    }
  };

  useEffect(() => {
    let tempCount = 0;
    let tempCallAct = [];
    // let tempEmbededAct = [];
    props.processData &&
      props.processData.MileStones.forEach((el) => {
        el.Activities.forEach((val) => {
          if (+val.ActivityType === 18 && +val.ActivitySubType === 1) {
            tempCallAct.push(val);
            tempCount = tempCount + 1;
          }
          // else if (val.ActivityType == 35 && val.ActivitySubType == 1) {
          //   tempEmbededAct.push(val);
          //   tempCount = tempCount + 1;
          // }
        });
      });
    setSubProcessCount(tempCount);
    setcallActivity(tempCallAct);
    // setembededSubProcess(tempEmbededAct);
  }, [props.processData]);

  // useEffect(() => {
  //   setCopiedCell(null);
  // }, [props.cellID]);

  return (
    <div
      class="sub-header"
      // code added on 5 April 2023 for BugId 112610
      style={{ pointerEvents: props.showDrawer ? "none" : "auto" }}
    >
      <div class="leftDiv">
        <FloatingTab
          tabs={[
            {
              tabName: view.abstract,
              icon: abstractIcon,
              selectedIcon: selectedAbstractIcon,
            },
            {
              tabName: view.bpmn,
              icon: bpmnIcon,
              selectedIcon: selectedBpmnIcon,
            },
          ]}
          tabClassName="FloatButton"
          selectedTab={props.viewType}
          changeTab={props.changeViewType}
          setExpandedView={props.setExpandedView}
          maxHeight={props.floatButtonHeight}
        />
        {/*code commented on 7 June 2022 for BugId 110180*/}
        {/* <div> */}
        {/*<select value="Subprocesses" className="subprocessDropdown">*/}
        {/* {dropdown.map((data, i) => { return*/}
        {/*<option style={{ backgroundColor: "white" }}>Subprocesses</option>
           })} 
        </select>*/}
        {/*<Tabs
          tabType="processSubHeader"
          tabContentStyle="processSubHeaderStyle"
          tabBarStyle="processSubHeaderBarStyle"
          oneTabStyle="processSubOneHeaderStyle"
          tabStyling="processViewTabs"
          TabNames={[
            // ,
            "Main Process",
          ]}
        />*/}
        {/* </div> */}
      </div>
      <div class="rightDiv">
        {/*code commented on 7 June 2022 for BugId 110180*/}
        {/* <div
          class="redoDiv"
          style={{
            display: isDisable ? "none" : "",
          }}
        >
          <button class="buttonImg">
            <img src={undo} width="15px" height="15px" />
          </button>
          <button class="buttonImg">
            <img src={redo} width="15px" height="15px" />
          </button>
        </div> */}
        {/*code commented on 7 June 2022 for BugId 110180*/}
        {/* <div
          class="copyDiv"
          style={{
            display: isDisable ? "none" : "",
          }}
        >
          <button class="buttonImg">
            <img src={cut} width="15px" height="15px" />
          </button>
          {props.viewType !== view.abstract.langKey ? (
            <button
              class={
                props.cellType !== getSelectedCellType("ACTIVITY")
                  ? "buttonImgDisabled"
                  : "buttonImg"
              }
              onClick={() => {
                if (props.cellType === getSelectedCellType("ACTIVITY")) {
                  setCopiedCell(props.cellID);
                  hideIcons();
                  removeContextMenu();
                  removeToolDivCell();
                }
              }}
              title={t("Copy")}
            >
              <img
                src={
                  props.cellType === getSelectedCellType("ACTIVITY")
                    ? copy
                    : copy_disabled
                }
                width="15px"
                height="15px"
              />
            </button>
          ) : null}
          {props.viewType !== view.abstract.langKey ? (
            <button
              class={
                props.cellType !== getSelectedCellType("ACTIVITY") ||
                !copiedCell
                  ? "buttonImgDisabled"
                  : "buttonImg"
              }
              onClick={() => {
                if (
                  props.cellType === getSelectedCellType("ACTIVITY") &&
                  copiedCell
                ) {
                  pasteFunctionality({
                    id: props.cellID,
                    name: props.cellName,
                    activityType: props.cellActivityType,
                    activitySubType: props.cellActivitySubType,
                    setProcessData: props.setProcessData,
                    processData: props.processData,
                    setNewId: props.setNewId,
                    t: t,
                  });
                  setCopiedCell(null);
                }
              }}
              title={t("paste")}
            >
              <img
                src={
                  props.cellType === getSelectedCellType("ACTIVITY") &&
                  copiedCell
                    ? paste
                    : paste_disabled
                }
                width="15px"
                height="15px"
              />
            </button>
          ) : null}
          <button
            class="buttonImg"
            title={t("delete")}
            onClick={() => {
              deleteFunctionality({
                id: props.cellID,
                name: props.cellName,
                activityType: props.cellActivityType,
                seqId: props.cellSeqId,
                queueId: props.cellQueueId,
                processDefId: props.openProcessID,
                processName: props.openProcessName,
                type: props.cellType,
                setProcessData: props.setProcessData,
                processData: props.processData,
                 isPrimaryAct:props.processData.MileStones[props.milestoneIndex]?.Activities[
          props.activityindex
        ]?.PrimaryAct==='Y'?true:false;
              });
            }}
          >
            <img src={deleteIcon} width="16px" height="16px" />
          </button>
        </div> */}
        {/*code commented on 7 June 2022 for BugId 110180*/}
        {/* <div
          class="selectDiv"
          style={{
            display: isDisable ? "none" : "",
          }}
        >
          <button class="buttonImgDropdown">
            <img src={select} width="15px" height="15px" />
          </button>
          <button class="buttonImg">
            <img src={dropdown} width="5px" height="15px" />
          </button>
        </div>
        <div class="viewDiv">
          <button class="buttonImgDropdown">
            <img src={viewIcon} width="15px" height="15px" />
          </button>
          <button class="buttonImg">
            <img src={dropdown} width="5px" height="15px" />
          </button>
        </div> */}
        <div className="relative">
          <button className="subProcessBtn" onClick={subProcessHandler}>
            {t("callActivities")} ({subProcessCount})
            <button class="icon-button buttonImg" tabIndex={-1}>
              <img
                src={dropdown}
                width="5px"
                height="15px"
                style={{ margin: "0 0.25vw" }}
                alt={t("callActivities")}
              />
            </button>
          </button>
          {showSubprocessModal ? (
            <Modal
              show={showSubprocessModal}
              style={{
                width: "19vw",
                height: "12rem",
                position: "absolute",
                left: direction === RTL_DIRECTION ? "0" : "unset",
                right:
                  direction === RTL_DIRECTION ? "unset" : "var(--spacing_h)",
                top: "95%",
                padding: "0.5rem 0.5vw",
                textAlign: "center",
                boxShadow: "none",
                border: "1px solid #ccc",
              }}
              backDropStyle={{
                backgroundColor: "transparent",
              }}
              modalClosed={() => setShowSubprocessModal(false)}
              children={
                <SubProcesses
                  callActivity={callActivity}
                  // embededSubProcess={embededSubProcess}
                />
              }
            />
          ) : null}
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    cellID: state.selectedCellReducer.selectedId,
    cellName: state.selectedCellReducer.selectedName,
    cellActivityType: state.selectedCellReducer.selectedActivityType,
    cellActivitySubType: state.selectedCellReducer.selectedActivitySubType,
    cellSeqId: state.selectedCellReducer.selectedSeqId,
    cellQueueId: state.selectedCellReducer.selectedQueueId,
    openProcessID: state.openProcessClick.selectedId,
    openProcessName: state.openProcessClick.selectedProcessName,
    cellType: state.selectedCellReducer.selectedType,
    showDrawer: state.showDrawerReducer.showDrawer,
  };
};

export default connect(mapStateToProps, null)(SubHeader);
