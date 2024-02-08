import { SERVER_URL, ENDPOINT_MOVEMILE } from "../../Constants/appConstants";
import axios from "axios";

export const moveMilestone = (
  milestonesArray,
  setProcessData,
  processDefId,
  sourceIndex,
  destinationIndex,
  processData
) => {
  var obj = {
    processDefId: processDefId,
    milestones: milestonesArray,
  };
  axios
    .post(SERVER_URL + ENDPOINT_MOVEMILE, obj)
    .then((response) => {
      if (response.data.Status === 0) {
        let newProcessData = JSON.parse(JSON.stringify(processData));
        const [reOrderedList] = newProcessData.MileStones.splice(
          sourceIndex,
          1
        );
        newProcessData.MileStones.splice(destinationIndex, 0, reOrderedList);
        newProcessData.MileStones.forEach((element, index) => {
          element.SequenceId = index + 1;
        });
        setProcessData(newProcessData);
        // setProcessData((prevProcessData) => {
        // let newProcessData = JSON.parse(JSON.stringify(prevProcessData));
        //   // console.log(newProcessData.MileStones, "#####SEQUECE ID");

        //   // let newArray =
        //   //   newProcessData.MileStones &&
        //   //   newProcessData.MileStones.map((item, index) => {
        //   //     if (sourceIndex < destinationIndex) {
        //   //       if (index < sourceIndex) {
        //   //         return { ...item };
        //   //       } else if (sourceIndex < index && index <= destinationIndex) {
        //   //         let a = item.SequenceId - 1;
        //   //         return { ...item, SequenceId: a };
        //   //       } else if (index > destinationIndex) {
        //   //         let a = item.SequenceId + 1;
        //   //         return { ...item, SequenceId: a };
        //   //       } else if (index === sourceIndex) {
        //   //         let a = destinationIndex + 1;
        //   //         return { ...item, SequenceId: a };
        //   //       }
        //   //     } else if (sourceIndex > destinationIndex) {
        //   //       if (index > sourceIndex) {
        //   //         return { ...item };
        //   //       } else if (sourceIndex > index && index >= destinationIndex) {
        //   //         let a = item.SequenceId + 1;
        //   //         return { ...item, SequenceId: a };
        //   //       } else if (index < destinationIndex) {
        //   //         return { ...item };
        //   //       } else if (index === sourceIndex) {
        //   //         let a = destinationIndex + 1;
        //   //         return { ...item, SequenceId: a };
        //   //       }
        //   //     }
        //   //   });
        //   const [reOrderedList] = newProcessData.MileStones.splice(
        //     sourceIndex,
        //     1
        //   );
        //   newProcessData.MileStones.splice(destinationIndex, 0, reOrderedList);
        //   newProcessData.MileStones.forEach((element, index) => {
        //     element.SequenceId = index + 1;
        //   });
        //   // newProcessData.MileStones = [...newArray];
        //   // console.log(
        //   //   // newArray,
        //   //   "NEW ARRAY",
        //   //   reOrderedList,
        //   //   newProcessData.MileStones
        //   // );
        //   return newProcessData;
        // });
      }
    })
    .catch((err) => {
      console.log(err);
    });
};
