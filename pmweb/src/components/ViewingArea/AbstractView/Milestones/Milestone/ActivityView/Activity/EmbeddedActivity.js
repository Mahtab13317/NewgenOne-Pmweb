import React, { useState, useEffect } from "react";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import AddIcon from "@material-ui/icons/Add";
import { Box, Grid, Tooltip, withStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { AssociatedActivityCard } from "./AssociatedActivityCard";
import {
  ENDPOINT_ADDACTIVITY,
  ENDPOINT_MOVEACTIVITY,
  expandedViewOnDrop,
  PROCESSTYPE_LOCAL,
  PROCESSTYPE_LOCAL_CHECKED,
  PROCESSTYPE_REGISTERED,
  RTL_DIRECTION,
  SERVER_URL,
} from "../../../../../../../Constants/appConstants";
import { getActivityQueueObj } from "../../../../../../../utility/abstarctView/getActivityQueueObj";
import {
  activitiesNotAllowedInEmbedded,
  defaultShapeVertex,
  graphGridSize,
  gridSize,
  maxEmbeddedActCount,
  minWidthSpace,
  widthForDefaultVertex,
} from "../../../../../../../Constants/bpmnView";
import axios from "axios";
import { connect, useDispatch } from "react-redux";
import * as actionCreators_process from "../../../../../../../redux-store/actions/AbstractView/EmbeddedProcessAction";
import { getActivityProps } from "../../../../../../../utility/abstarctView/getActivityProps";
import * as actionCreators from "../../../../../../../redux-store/actions/Properties/showDrawerAction";
import "../Activities.css";
import "../activitiesArabic.css";
import { LatestVersionOfProcess } from "../../../../../../../utility/abstarctView/checkLatestVersion";
import { onDrop } from "../../../../../../../utility/abstarctView/addWorkstepAbstractView";
import { setToastDataFunc } from "../../../../../../../redux-store/slices/ToastDataHandlerSlice";
import { isActNameAlreadyPresent } from "../../../../../../../utility/CommonFunctionCall/CommonFunctionCall";

const EmbeddedActivity = (props) => {
  let { t } = useTranslation();
  const dispatch = useDispatch();
  const direction = `${t("HTML_DIR")}`;
  const { BackgroundColor, processExpanded, setProcessExpanded, isReadOnly } =
    props;
  const [embeddedActivities, setEmbeddedActivities] = useState([]);

  const EmbeddedTooltip = withStyles((theme) => ({
    tooltip: {
      background: "#FFFFFF 0% 0% no-repeat padding-box",
      boxShadow: "0px 3px 6px #00000029",
      border: "1px solid #70707075",
      fontSize: "var(--base_text_font_size)",
      fontWeight: "400 !important",
      letterSpacing: "0px",
      color: "#000000",
      transform: "translate3d(0px, -0.25rem, 0px) !important",
    },
    arrow: {
      "&:before": {
        backgroundColor: "#FFFFFF !important",
        border: "1px solid #70707075 !important",
        zIndex: "100",
      },
    },
  }))(Tooltip);

  useEffect(() => {
    setProcessExpanded(
      props.expandedProcess && expandedViewOnDrop
        ? props.expandedProcess[props.activityId]
        : null
    );
  }, []);

  useEffect(() => {
    if (
      props.processData.MileStones[props.milestoneIndex].Activities[
        props.activityindex
      ].EmbeddedActivity
    ) {
      let arr = [];
      let embArr = [
        ...props.processData.MileStones[props.milestoneIndex].Activities[
          props.activityindex
        ].EmbeddedActivity[0],
      ];
      embArr?.forEach((el) => {
        if (+el.ActivityType === 1 && +el.ActivitySubType === 1) {
          arr.splice(0, 0, el);
        } else if (+el.ActivityType === 2 && +el.ActivitySubType === 1) {
          arr.splice(arr?.length, 0, el);
        } else {
          arr.splice(arr?.length - 1, 0, el);
        }
      });
      setEmbeddedActivities(arr);
    }
  }, [
    props.processData?.MileStones[props.milestoneIndex]?.Activities[
      props.activityindex
    ]?.EmbeddedActivity,
  ]);

  useEffect(() => {
    props.setExpandedProcess({
      ...props.expandedProcess,
      [props.activityId]: props.activityId,
    });
  }, [processExpanded]);

  // Function that adds a new activity card below the card it was called from.
  const addActivityInBetween = (
    iActivityId = 10,
    iSubActivityId = 3,
    index
  ) => {
    let MaxseqId = 0,
      maxActivityId = 0,
      maxXleftLoc = 0,
      endEventXLeftLoc = 0;
    const mIndex = props.milestoneIndex;
    let LaneId =
      props.processData.MileStones[mIndex].Activities[props.activityindex]
        .LaneId;
    let actWidth =
      props.processData.MileStones[mIndex].Activities[props.activityindex]
        .Width;
    let actHeight =
      props.processData.MileStones[mIndex].Activities[props.activityindex]
        .Height;
    let isPreviousActDefault = false;
    props.processData.MileStones?.forEach((mile, index) => {
      mile.Activities?.forEach((activity) => {
        if (+activity.SequenceId > +MaxseqId && mIndex === index) {
          MaxseqId = +activity.SequenceId;
        }
        if (+maxActivityId < +activity.ActivityId) {
          maxActivityId = +activity.ActivityId;
        }
        if (activity.EmbeddedActivity) {
          activity.EmbeddedActivity[0].forEach((embAct) => {
            if (+embAct.SequenceId > +MaxseqId) {
              MaxseqId = +embAct.SequenceId;
            }
            if (
              !(+embAct.ActivityType === 2 && +embAct.ActivitySubType === 1)
            ) {
              if (+maxXleftLoc < +embAct.xLeftLoc) {
                maxXleftLoc = +embAct.xLeftLoc;
                isPreviousActDefault = defaultShapeVertex.includes(
                  getActivityProps(
                    embAct.ActivityType,
                    embAct.ActivitySubType
                  )[5]
                );
              }
            } else {
              endEventXLeftLoc = +embAct.xLeftLoc;
            }
            if (+maxActivityId < +embAct.ActivityId) {
              maxActivityId = +embAct.ActivityId;
            }
          });
        }
      });
    });
    let isEndEventLast = endEventXLeftLoc > maxXleftLoc;
    let newActivityName =
      t(getActivityProps(iActivityId, iSubActivityId)[4]) +
      "_" +
      (maxActivityId + 1);
    // Added on 19-01-24 for Bug 141498
    if (
      isActNameAlreadyPresent(newActivityName, props.processData.MileStones)
    ) {
      newActivityName =
        t(getActivityProps(iActivityId, iSubActivityId)[4]) +
        "_" +
        (maxActivityId + 2);
    }
    // Till here for Bug 141498
    let queueInfo = getActivityQueueObj(
      props.setNewId,
      iActivityId,
      iSubActivityId,
      newActivityName,
      props.processData,
      LaneId,
      t
    );
    maxXleftLoc = isPreviousActDefault
      ? maxXleftLoc + widthForDefaultVertex + minWidthSpace
      : maxXleftLoc + gridSize + minWidthSpace;

    let currentActWidth = defaultShapeVertex.includes(
      getActivityProps(iActivityId, iSubActivityId)[5]
    )
      ? widthForDefaultVertex + minWidthSpace
      : gridSize + minWidthSpace;

    if (maxXleftLoc + currentActWidth + gridSize + minWidthSpace >= actWidth) {
      actWidth = maxXleftLoc + currentActWidth + gridSize + minWidthSpace;
    }

    const ActivityAddPostBody = {
      processDefId: props.processData.ProcessDefId,
      processName: props.processData.ProcessName,
      actName: newActivityName,
      actId: +maxActivityId + 1,
      actType: iActivityId,
      actSubType: iSubActivityId,
      actAssocId: 0,
      seqId: +MaxseqId + 1,
      laneId: LaneId,
      blockId: 0,
      queueId: queueInfo.queueId,
      queueInfo: queueInfo,
      queueExist: queueInfo.queueExist,
      xLeftLoc: maxXleftLoc,
      yTopLoc: 6 * graphGridSize,
      milestoneId: props.mileId,
      parentActivityId: props.activityId,
      embeddedActivityType: "I", // code added on 1 March 2023 for BugId 124474
      height: actHeight,
      width: actWidth,
    };
    let newObj = {
      ActivityId: ActivityAddPostBody.actId,
      ActivityName: ActivityAddPostBody.actName,
      ActivityType: ActivityAddPostBody.actType,
      ActivitySubType: ActivityAddPostBody.actSubType,
      LaneId: ActivityAddPostBody.laneId,
      xLeftLoc: maxXleftLoc,
      yTopLoc: 6 * graphGridSize,
      isActive: "true",
      BlockId: 0,
      CheckedOut: "",
      Color: "1234",
      FromRegistered: "N",
      QueueCategory: "",
      QueueId: ActivityAddPostBody.queueInfo.queueId,
      SequenceId: ActivityAddPostBody.seqId,
      EmbeddedActivityType: "I", // code added on 1 March 2023 for BugId 124474
      id: "",
      AssociatedTasks: [],
    };
    setEmbeddedActivities((prev) => {
      let newData = [...prev];
      newData.splice(index + 1, 0, newObj);
      return newData;
    });
    let newProcessData = { ...props.processData };
    newProcessData.MileStones[mIndex].Activities[
      props.activityindex
    ].EmbeddedActivity[0].splice(0, 0, newObj);
    newProcessData.MileStones[mIndex].Activities[props.activityindex].Width =
      actWidth;
    newProcessData.MileStones[mIndex].Activities[props.activityindex].Height =
      actHeight;
    props.setprocessData(newProcessData);
    axios
      .post(SERVER_URL + ENDPOINT_ADDACTIVITY, ActivityAddPostBody)
      .then((res) => {
        if (res.data.Status === 0) {
          let maxXleftWidth = maxXleftLoc + currentActWidth;
          if (
            isEndEventLast &&
            (endEventXLeftLoc <= maxXleftLoc ||
              endEventXLeftLoc <= maxXleftWidth)
          ) {
            let endEventAct = embeddedActivities[embeddedActivities.length - 1];
            let payload = {
              actId: endEventAct.ActivityId,
              actName: endEventAct.ActivityName,
              blockId: endEventAct.BlockId,
              laneId: endEventAct.LaneId,
              milestoneId: props.mileId,
              prevLaneId: endEventAct.LaneId,
              prevMilestoneId: props.mileId,
              processDefId: props.processData.ProcessDefId,
              seqId: endEventAct.SequenceId,
              xLeftLoc: maxXleftLoc + currentActWidth,
              yTopLoc: endEventAct.yTopLoc,
            };
            axios
              .post(SERVER_URL + ENDPOINT_MOVEACTIVITY, payload)
              .then((res) => {
                if (res.data.Status === 0) {
                  let newProcessData = { ...props.processData };
                  newProcessData.MileStones[mIndex].Activities[
                    props.activityindex
                  ].EmbeddedActivity[0]?.map((embAct, idx) => {
                    if (embAct.ActivityId === endEventAct.ActivityId) {
                      newProcessData.MileStones[mIndex].Activities[
                        props.activityindex
                      ].EmbeddedActivity[0][idx].xLeftLoc =
                        maxXleftLoc + currentActWidth;
                    }
                  });
                  props.setprocessData(newProcessData);
                  return 0;
                }
              });
          }
        } else if (res.data.Status !== 0) {
          setEmbeddedActivities((prev) => {
            let newData = [...prev];
            newData.splice(index + 1, 1);
            return newData;
          });
          let newProcessData = { ...props.processData };
          newProcessData.MileStones[mIndex].Activities[
            props.activityindex
          ].EmbeddedActivity[0].splice(0, 1);
          props.setprocessData(newProcessData);
        }
      })
      .catch((err) => {
        setEmbeddedActivities((prev) => {
          let newData = [...prev];
          newData.splice(index + 1, 1);
          return newData;
        });
        let newProcessData = { ...props.processData };
        newProcessData.MileStones[mIndex].Activities[
          props.activityindex
        ].EmbeddedActivity[0].splice(0, 1);
        props.setprocessData(newProcessData);
      });
  };

  const onDropHandler = (e, index) => {
    if (JSON.parse(e.dataTransfer.getData("bFromToolbox")) === true) {
      const iActivityId = +e.dataTransfer.getData("iActivityID");
      const iSubActivityId = +e.dataTransfer.getData("iSubActivityID");
      if (
        activitiesNotAllowedInEmbedded.includes(
          getActivityProps(iActivityId, iSubActivityId)[5]
        )
      ) {
        dispatch(
          setToastDataFunc({
            message:
              t(getActivityProps(iActivityId, iSubActivityId)[4]) +
              " " +
              t("cannotBeAddedInTheEmbeddedSubprocess"),
            severity: "error",
            open: true,
          })
        );
      } else {
        onDrop(e, "newActivityDiv", addActivityInBetween, index);
      }
    }
  };

  return (
    <Box pl={1} ml={1} style={{ marginLeft: "0" }}>
      <Grid
        containerclassName="selectedActivityType"
        style={{
          display: "flex",
          alignItems: "center",
          color: props.color,
          background: props.BackgroundColor + " 0% 0% no-repeat padding-box",
        }}
      >
        <Grid item style={{ flex: "1", padding: "4px 8px" }}>
          <p
            className={
              direction === RTL_DIRECTION
                ? "task_count_activityArabic"
                : "task_count_activity"
            }
          >
            {embeddedActivities?.length}{" "}
            {embeddedActivities?.length !== 1 ? t("worksteps") : t("workstep")}
          </p>
        </Grid>
        <Grid
          item
          style={{
            flex: "1",
            display: "flex",
            justifyContent: direction === RTL_DIRECTION ? "start" : "end",
            alignItems: "center",
          }}
        >
          {!isReadOnly &&
          (props.processType === PROCESSTYPE_LOCAL ||
            props.processType === PROCESSTYPE_LOCAL_CHECKED) ? (
            embeddedActivities?.length >= maxEmbeddedActCount ? (
              <EmbeddedTooltip
                arrow
                title={t("maxEmbeddedCountReached")}
                placement={"bottom-start"}
              >
                <AddIcon
                  style={{
                    width: "15px",
                    height: "15px",
                  }}
                  className="embeddedAddDisabledBtn"
                />
              </EmbeddedTooltip>
            ) : (
              <AddIcon
                style={{
                  width: "15px",
                  height: "15px",
                  cursor: "pointer",
                  outline: "0",
                }}
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.code === "Enter") {
                    if (processExpanded !== null) {
                      setProcessExpanded(props.activityId);
                    }
                    addActivityInBetween(10, 3, embeddedActivities?.length - 2);
                  }
                }}
                onClick={() => {
                  if (processExpanded !== null) {
                    setProcessExpanded(props.activityId);
                  }
                  addActivityInBetween(10, 3, embeddedActivities?.length - 2);
                }}
                className="embeddedAddBtn"
              />
            )
          ) : null}
          {+processExpanded === +props.activityId ? (
            <ExpandLessIcon
              style={{
                color: "#606060",
                width: "15px",
                height: "15px",
                marginInline: "0.5vw",
                cursor: "pointer",
                outline: "0",
              }}
              className="taskSvg"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.code === "Enter") {
                  setProcessExpanded(null);
                }
              }}
              onClick={() => setProcessExpanded(null)}
            />
          ) : (
            <ExpandMoreIcon
              style={{
                color: "#606060",
                width: "15px",
                height: "15px",
                marginInline: "0.5vw",
                cursor: "pointer",
                outline: "0",
              }}
              className="taskSvg"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.code === "Enter") {
                  setProcessExpanded(props.activityId);
                }
              }}
              onClick={() => {
                setProcessExpanded(props.activityId);
              }}
            />
          )}
        </Grid>
      </Grid>
      {+processExpanded === +props.activityId &&
        embeddedActivities?.map((elem, index) => {
          return (
            <>
              {!isReadOnly &&
                index === embeddedActivities?.length - 1 &&
                embeddedActivities?.length < maxEmbeddedActCount && (
                  <Grid
                    container
                    style={{
                      background:
                        BackgroundColor + " 0% 0% no-repeat padding-box",
                      display:
                        props.processType === PROCESSTYPE_REGISTERED ||
                        props.processType === "RC" ||
                        LatestVersionOfProcess(props.processData?.Versions) !==
                          +props.processData?.VersionNo
                          ? "none"
                          : "flex",
                      justifyContent: "center",
                      paddingBottom: "0.75rem",
                    }}
                  >
                    <div
                      className="newAssociatedActivityDiv"
                      onClick={() => addActivityInBetween(10, 3, index - 1)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => onDropHandler(e, index - 1)}
                      tabIndex={0}
                      onKeyPress={(e) => {
                        if (e.code === "Enter") {
                          addActivityInBetween(10, 3, index - 1);
                        }
                      }}
                    >
                      {t("milestone.newStep")}
                    </div>
                  </Grid>
                )}
              <Grid
                container
                className={
                  direction === RTL_DIRECTION
                    ? "selectedActivityTypeArabic"
                    : "selectedActivityType"
                }
                style={{
                  background: BackgroundColor + " 0% 0% no-repeat padding-box",
                }}
              >
                <AssociatedActivityCard
                  isReadOnly={isReadOnly}
                  index={index}
                  ActivityId={elem.ActivityId}
                  ActivityType={elem.ActivityType}
                  ActivitySubType={elem.ActivitySubType}
                  ActivityName={elem.ActivityName}
                  addActivityInBetween={addActivityInBetween}
                  embeddedActivities={embeddedActivities}
                  setEmbeddedActivities={setEmbeddedActivities}
                  processType={props.processType}
                  selectedActivity={props.selectedActivity}
                  selectActivityHandler={props.selectActivityHandler}
                  setprocessData={props.setprocessData}
                  processData={props.processData}
                  milestoneIndex={props.milestoneIndex}
                  activityindex={props.activityindex}
                  showDrawer={props.showDrawer}
                  isParentLaneCheckedOut={props.isParentLaneCheckedOut}
                  tabsList={props.tabsList}
                  caseEnabled={props.caseEnabled}
                />
              </Grid>
            </>
          );
        })}
    </Box>
  );
};

const mapStateToProps = (state) => {
  return {
    expandedProcess: state.expandedProcessReducer.processExpanded,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setExpandedProcess: (processExpanded) =>
      dispatch(actionCreators_process.expandedProcess(processExpanded)),
    showDrawer: (flag) => dispatch(actionCreators.showDrawer(flag)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(EmbeddedActivity);
