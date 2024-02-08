const initialState = {
    processExpanded : null,
  };
  
  const expandedProcessReducer = (state , action) => {
    if (action.type === "PROCESS_EXPANDED") {
      return {
        ...initialState,
        processExpanded: action.payload.processExpanded,
      };
    }
    return {...initialState, ...state};
  };
  
  export default expandedProcessReducer;
  