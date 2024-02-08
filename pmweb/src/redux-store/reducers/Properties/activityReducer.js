const initialState = {
  activityDependencies: [],
  showDependencyModal: false,
  errorMessage: null,
  workitemValidation: false,
  renameActivityData: null,
  isQueueRenameModalOpen: false,
};

const activityReducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_ACTIVITY_DEPENDENCIES":
      return {
        ...state,
        activityDependencies: action.payload,
      };
    case "SET_SHOW_DEPENDENCY_MODAL":
      return {
        ...state,
        showDependencyModal: action.payload,
      };
    case "SET_DEPENDENCY_ERROR_MSG":
      return {
        ...state,
        errorMessage: action.payload,
      };
    case "SET_WORKITEM_VALIDATION_FLAG":
      return {
        ...state,
        workitemValidation: action.payload,
      };
    case "SET_RENAME_ACTIVITY_DATA":
      return {
        ...state,
        renameActivityData: action.payload,
      };
    case "SET_QUEUE_RENAME_MODAL_OPEN":
      return {
        ...state,
        isQueueRenameModalOpen: action.payload,
      };
  }
  return state;
};

export default activityReducer;
