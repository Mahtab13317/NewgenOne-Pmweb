const initialState = {
    taskExpanded : false,
  };
  
  const taskReducer = (state = initialState, action) => {
    if (action.type === "TASK_EXPANDED") {
      return {
        ...state,
        taskExpanded: action.payload.taskExpanded,
      };
    }
    return state;
  };
  
  export default taskReducer;
  