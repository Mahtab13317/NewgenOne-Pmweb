import {
  SERVER_URL,
  ENDPOINT_MOVE_ANNOTATION,
} from "../../Constants/appConstants";
import axios from "axios";

export const MoveAnnotation = (
  processDefId,
  processState,
  comment,
  annotationId,
  xLeftLoc,
  yTopLoc,
  height,
  width,
  swimLaneId,
  setProcessData,
  oldXLeftLoc,
  oldYTopLoc,
  oldLaneId,
  mileStoneWidthIncreased,
  laneHeightIncreased,
  isEmbeddedArtifact = null
) => {
  let annotationJson = {
    processDefId: processDefId,
    processState: processState,
    comment: comment,
    annotationId: annotationId,
    xLeftLoc: xLeftLoc,
    yTopLoc: yTopLoc,
    swimLaneId: swimLaneId,
    height: height,
    width: width,
  };

  if (isEmbeddedArtifact !== null) {
    annotationJson = {
      ...annotationJson,
      parentActivityId: isEmbeddedArtifact,
    };
  }

  if (mileStoneWidthIncreased) {
    annotationJson = {
      ...annotationJson,
      ...mileStoneWidthIncreased,
    };
  }
  if (laneHeightIncreased) {
    annotationJson = { ...annotationJson, ...laneHeightIncreased };
  }

  axios
    .post(SERVER_URL + ENDPOINT_MOVE_ANNOTATION, annotationJson)
    .then((response) => {
      if (response.data.Status === 0) {
        return 0;
      }
    })
    .catch((err) => {
      console.log(err);
      setProcessData((prevData) => {
        let processObject = JSON.parse(JSON.stringify(prevData));
        processObject.Annotations = JSON.parse(
          JSON.stringify(prevData.Annotations)
        );
        processObject.Annotations.forEach((dataObj, index) => {
          if (dataObj.AnnotationId === annotationId) {
            processObject.Annotations[index].xLeftLoc = oldXLeftLoc;
            processObject.Annotations[index].yTopLoc = oldYTopLoc;
            processObject.Annotations[index].LaneId = oldLaneId;
          }
        });
        return processObject;
      });
    });
};
