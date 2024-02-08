export const setGlobalTaskTemplates = (tempList) => {
  return {
    type: "SET_GLOBAL_TASK_TEMPLATES",
    payload: tempList,
  };
};
