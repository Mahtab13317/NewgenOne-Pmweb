const initialState = {
  selectedId: "",
  selectedName: "",
  selectedType: "",
  selectedVersion: "",
  selectedProcessName: "",
};

const openProcessClick = (state = initialState, action) => {
  switch (action.type) {
    case "PINNED_TILE":
      return {
        ...state,
        selectedId: action.payload.clickTileID,
        selectedName: action.payload.clickTileProjectName,
        selectedType: action.payload.clickTileType,
        selectedVersion: action.payload.clickVersionType,
        selectedProcessName: action.payload.clickProcessName,
      };
  }
  return state;
};

export default openProcessClick;
