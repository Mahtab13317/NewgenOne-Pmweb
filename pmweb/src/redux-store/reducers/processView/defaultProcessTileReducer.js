const initialState = {
  defaultProcessTileIndex : '',
};

const defaultProcessTileIndexReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_DEFAULT_PROCESS_TILE':
      return {
        ...state,
        defaultProcessTileIndex : action.payload.defaultProcessTileIndex,
      }
  }
  return state;
}

export default defaultProcessTileIndexReducer;