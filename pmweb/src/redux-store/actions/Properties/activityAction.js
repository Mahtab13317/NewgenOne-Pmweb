export const setActivityDependencies = (dependenciesList) => {
  return {
    type: "SET_ACTIVITY_DEPENDENCIES",
    payload: dependenciesList,
  };
};
export const setShowDependencyModal = (showModal) => {
  return {
    type: "SET_SHOW_DEPENDENCY_MODAL",
    payload: showModal,
  };
};
export const setDependencyErrorMsg = (msg) => {
  return {
    type: "SET_DEPENDENCY_ERROR_MSG",
    payload: msg,
  };
};

export const setWorkitemFlag = (flag) => {
  return {
    type: "SET_WORKITEM_VALIDATION_FLAG",
    payload: flag,
  };
};

export const setRenameActivityData = (obj) => {
  return {
    type: "SET_RENAME_ACTIVITY_DATA",
    payload: obj,
  };
};

export const setQueueRenameModalOpen = (flag) => {
  return {
    type: "SET_QUEUE_RENAME_MODAL_OPEN",
    payload: flag,
  };
};
