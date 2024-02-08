const initialState = {
  globalTemplates: [],
};

const globalTaskTemplateReducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_GLOBAL_TASK_TEMPLATES":
      return {
        ...state,
        globalTemplates: action.payload,
      };
  }
  return state;
};

export default globalTaskTemplateReducer;
