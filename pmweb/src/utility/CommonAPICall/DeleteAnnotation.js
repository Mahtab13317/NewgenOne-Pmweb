import {
  SERVER_URL,
  ENDPOINT_DELETE_ANNOTATION,
} from "../../Constants/appConstants";
import axios from "axios";

export const DeleteAnnotation = (
  processDefId,
  processState,
  comment,
  annotationId,
  xLeftLoc,
  yTopLoc,
  height,
  width,
  swimLaneId,
  setProcessData
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
    .post(SERVER_URL + ENDPOINT_DELETE_ANNOTATION, annotationJson)
    .then((response) => {
      if (response.data.Status === 0) {
        setProcessData((prevData) => {
          let processObject = JSON.parse(JSON.stringify(prevData));
          processObject.Annotations = JSON.parse(
            JSON.stringify(prevData.Annotations)
          );
          processObject.Annotations.forEach((annotation, index) => {
            if (annotation.AnnotationId === annotationId) {
              processObject.Annotations.splice(index, 1);
            }
          });
          return processObject;
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
};
