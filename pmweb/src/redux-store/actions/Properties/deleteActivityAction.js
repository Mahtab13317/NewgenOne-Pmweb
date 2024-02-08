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
