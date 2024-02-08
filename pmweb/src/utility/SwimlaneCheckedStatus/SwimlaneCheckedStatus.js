export const checkIfSwimlaneCheckedOut = (processData) => {
  let arr = [];
  let temp = global.structuredClone(processData || {});
  for (let index in temp?.Lanes) {
    if (temp.Lanes[index].CheckedOut === "Y") {
      arr.push({
        laneId: temp.Lanes[index].LaneId,
        laneName: temp.Lanes[index].LaneName,
      });
      break;
    }
  }
  return arr;
};

export const checkIfParentSwimlaneCheckedOut = (processData, parentLaneId) => {
  let arr = [];
  let temp = global.structuredClone(processData || {});
  for (let index in temp?.Lanes) {
    if (
      temp.Lanes[index].CheckedOut === "Y" &&
      +temp.Lanes[index].LaneId === +parentLaneId
    ) {
      arr.push(temp.Lanes[index].LaneId);
      break;
    }
  }
  return arr;
};

export const checkActivityStatus = (processData, cellId) => {
  let newAct = false;
  let temp = global.structuredClone(processData || {});
  for (let index in temp?.MileStones) {
    for (let index1 in temp?.MileStones[index]?.Activities) {
      if (
        +temp?.MileStones[index]?.Activities[index1].ActivityId === +cellId &&
        temp?.MileStones[index]?.Activities[index1].status === "I"
      ) {
        newAct = true;
        break;
      }
    }
    if (newAct) {
      break;
    }
  }
  return newAct;
};
