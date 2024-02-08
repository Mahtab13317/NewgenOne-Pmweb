import {
  SERVER_URL,
  ENDPOINT_MODIFY_ANNOTATION,
} from "../../Constants/appConstants";
import axios from "axios";

export const ModifyAnnotation = (
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
  oldComment
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

  axios
    .post(SERVER_URL + ENDPOINT_MODIFY_ANNOTATION, annotationJson)
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
            processObject.Annotations[index].Comment = oldComment;
          }
        });
        return processObject;
      });
    });
};
