export const showDrawer = (flag) => {
  return {
    type: "SHOW_DRAWER",
    payload: flag,
  };
};

export const expandDrawer = (isDrawerExpanded) => {
  return {
    type: "EXPAND_DRAWER",
    payload: isDrawerExpanded,
  };
};
