const initialState = {
  clickedCreateProcess: 0,
};

const createProcessFlag = (state = initialState, action) => {
  switch (action.type) {
    case "CREATE_PROCESS_FLAG":
      return {
        ...state,
        clickedCreateProcess: action.payload.createProcessFlag,
      };
  }
  return state;
};

export default createProcessFlag;
