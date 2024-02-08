import { SERVER_URL, ENDPOINT_RESIZE_ACT } from "../../Constants/appConstants";
import axios from "axios";

export const ResizeActivity = (
  processDefId,
  actName,
  actId,
  setProcessData,
  width,
  height,
  oldWidth,
  oldHeight,
  laneId
) => {
  let payload = {
    processDefId: processDefId,
    actId: actId,
    actName: actName,
    width: width,
    height: height,
  };

  axios
    .post(SERVER_URL + ENDPOINT_RESIZE_ACT, payload)
    .then((response) => {
      if (response.data.Status === 0) {
        return 0;
      }
    })
    .catch((err) => {
      console.log(err);
      let diffWidth,
        diffHeight,
        laneArr = [],
        laneSeqId = null,
        mileId;
      let xLeftLocAct;
      let yTopLocAct;
      setProcessData((prevProcessData) => {
        let newProcessData = JSON.parse(JSON.stringify(prevProcessData));
        newProcessData.MileStones = JSON.parse(
          JSON.stringify(prevProcessData.MileStones)
        );
        newProcessData.MileStones = newProcessData.MileStones?.map((mile) => {
          let tempAct = mile.Activities?.map((act) => {
            if (+act.ActivityId === +actId) {
              mileId = mile.iMileStoneId;
              diffWidth = oldWidth - width;
              diffHeight = oldHeight - height;
              act.Width = oldWidth;
              act.Height = oldHeight;
              xLeftLocAct = +act.xLeftLoc;
              yTopLocAct = +act.yTopLoc;
              return act;
            }
            return act;
          });
          return { ...mile, Activities: tempAct };
        });
        newProcessData.Lanes?.forEach((lane) => {
          if (+lane.LaneId === +laneId) {
            lane.Height = +lane.Height + diffHeight;
            laneSeqId = +lane.LaneSeqId;
          }
          if (laneSeqId !== null && +lane.LaneSeqId > laneSeqId) {
            laneArr.push(lane.LaneId);
          }
        });
        newProcessData.MileStones?.forEach((mile) => {
          if (mile.iMileStoneId === mileId) {
            mile.Activities.forEach((activity) => {
              if (
                +activity.LaneId === +laneId &&
                +activity.xLeftLoc > xLeftLocAct
              ) {
                activity.xLeftLoc = +activity.xLeftLoc + diffWidth;
              }
              if (
                +activity.LaneId === +laneId &&
                +activity.yTopLoc > yTopLocAct &&
                +activity.xLeftLoc <= xLeftLocAct + width &&
                +activity.xLeftLoc > xLeftLocAct
              ) {
                activity.yTopLoc = +activity.yTopLoc + diffHeight;
              }
              if (laneArr.includes(activity.LaneId)) {
                activity.yTopLoc = +activity.yTopLoc + diffHeight;
              }
            });
            let width = +mile.Width + diffWidth;
            mile.Width = width;
          }
        });
        newProcessData.DataObjects?.forEach((dataObj) => {
          if (+dataObj.LaneId !== 0 && laneArr.includes(+dataObj.LaneId)) {
            dataObj.yTopLoc = +dataObj.yTopLoc + diffHeight;
          }
        });
        newProcessData.MSGAFS?.forEach((mxsgaf) => {
          if (+mxsgaf.LaneId !== 0 && laneArr.includes(+mxsgaf.LaneId)) {
            mxsgaf.yTopLoc = +mxsgaf.yTopLoc + diffHeight;
          }
        });
        newProcessData.Annotations?.forEach((annotation) => {
          if (
            +annotation.LaneId !== 0 &&
            laneArr.includes(+annotation.LaneId)
          ) {
            annotation.yTopLoc = +annotation.yTopLoc + diffHeight;
          }
        });
        newProcessData.GroupBoxes?.forEach((groupBox) => {
          if (+groupBox.LaneId !== 0 && laneArr.includes(+groupBox.LaneId)) {
            groupBox.ITop = +groupBox.ITop + diffHeight;
          }
        });
        return newProcessData;
      });
      let collapseBtn = document.getElementById(`embeddedCollapseBtn_${actId}`);
      if (collapseBtn) {
        collapseBtn.style.width = `${
          parseInt(collapseBtn.style.width.replace("px", "")) + diffWidth
        }px`;
      }
    });
};
