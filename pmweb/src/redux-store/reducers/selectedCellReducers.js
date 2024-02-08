const initialState = {
  selectedId: null,
  selectedName: null,
  selectedSeqId: null,
  selectedQueueId: null,
  selectedActivityType: null,
  selectedActivitySubType: null,
  selectedType: null,
  selectedCheckedOut: false,
  selectedActLaneId: null,
};

const selectedCellReducer = (state = initialState, action) => {
  if (action.type === "SELECTED_CELL") {
    return {
      ...state,
      selectedId: action.payload.id,
      selectedName: action.payload.name,
      selectedActivityType: action.payload.activityType,
      selectedActivitySubType: action.payload.activitySubType,
      selectedSeqId: action.payload.seqId,
      selectedQueueId: action.payload.queueId,
      selectedType: action.payload.type,
      selectedCheckedOut: action.payload.checkedOut,
      selectedActLaneId: action.payload.laneId,
    };
  }
  if (action.type === "SELECTED_TASK") {
    return {
      selectedId: action.payload.id,
      selectedName: action.payload.name,
      selectedTaskType: action.payload.taskType,
      selectedType: action.payload.type,
    };
  }
  if (action.type === "SELECTED_TEMPLATE") {
    return {
      selectedId: action.payload.id,
      selectedName: action.payload.name,
      selectedTaskType: action.payload.taskType,
      selectedType: action.payload.type,
    };
  }
  return state;
};

export default selectedCellReducer;
