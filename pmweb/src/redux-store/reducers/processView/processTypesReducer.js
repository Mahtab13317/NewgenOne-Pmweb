const initialState = {
  tileData : [],
  pinnedData : []
};

const processTypesReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_PROCESS_TYPE_LIST':
      return {
        ...state,
        tileData : action.list,
      }
      case 'SET_PINNED_DATA_LIST':
        return {
          ...state,
          pinnedData : action.list,
        }
  }
  return state;
}

export default processTypesReducer;