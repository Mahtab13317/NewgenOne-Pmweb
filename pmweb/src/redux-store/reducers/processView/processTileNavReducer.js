const initialState = {
    selectedProcessTile : ''
  };
  
  const processTileNavReducer = (state = initialState, action) => {
    switch (action.type) {
      case 'CLICKED_PROCESS_TILE':
        return {
          ...state,
          selectedProcessTile : action.payload,
        }
    }
    return state;
  }
  
  export default processTileNavReducer;