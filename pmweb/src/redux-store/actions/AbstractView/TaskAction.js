export const expandedTask = (
  taskExpanded
) => {
  return {
    type: "TASK_EXPANDED",
    payload: {
      taskExpanded
    },
  };
};
