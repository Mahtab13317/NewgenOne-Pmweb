// This stores, list of which processType shall open by default is user Navigates directly to Processes from Main NavBar
export const defaultProcessTileIndex = (defaultProcessTileIndex) => {
  return {
    type: "SET_DEFAULT_PROCESS_TILE",
    payload: {
      defaultProcessTileIndex: defaultProcessTileIndex,
    },
  };
};
// Which processTile is clicked at home to navigate to ProcessView
export const clickedProcessTile = (processTile) => {
  return {
    type: "CLICKED_PROCESS_TILE",
    payload: processTile,
  };
};

// ProcessTile List, fetched using API at Home, stored here to use same list in ProcessesView
export const processTileList = (listData) => {
  return {
    type: "SET_PROCESS_TYPE_LIST",
    list: listData,
  };
};

export const pinnedDataList = (listData) => {
  return {
    type: "SET_PINNED_DATA_LIST",
    list: listData,
  };
};

// This keeps which tab is selected in the Main Navigation Panel
export const selectedTab_AtNavPanel = (selectedTab) => {
  return {
    type: "SELECTED_NAV_TAB",
    payload: selectedTab,
  };
};

export const openProcessClick = (
  clickTileID,
  clickTileProjectName,
  clickTileType,
  clickVersionType,
  clickProcessName
) => {
  return {
    type: "PINNED_TILE",
    payload: {
      clickTileID,
      clickTileProjectName,
      clickTileType,
      clickVersionType,
      clickProcessName,
    },
  };
};

export const createProcessFlag = (createProcessFlag) => {
  return {
    type: "CREATE_PROCESS_FLAG",
    payload: { createProcessFlag },
  };
};

export const openTemplate = (templateId, templateName, openFlag) => {
  return {
    type: "SELECTED_TEMPLATE",
    payload: { templateId, templateName, openFlag },
  };
};

export const selectedProject = (id, name) => {
  return {
    type: "SELECTED_PROJECT",
    payload: { id, name },
  };
};

export const setWindowInnerHeight = (height) => {
  return {
    type: "SET_INNER_HEIGHT",
    payload: { height },
  };
};
