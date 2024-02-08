const initialState = {
  selectedProcessTile : ''
};

const clickedProcessTileReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'CLICKED_PROCESS_TILE':
      return {
        ...state,
        selectedProcessTile : action.payload,
      }
  }
  return state;
}

export default clickedProcessTileReducer;