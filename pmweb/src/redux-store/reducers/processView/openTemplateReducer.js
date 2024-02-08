const initialState = { templateId: "", templateName: "", openFlag: false };

const openTemplateReducer = (state = initialState, action) => {
  switch (action.type) {
    case "SELECTED_TEMPLATE":
      return {
        ...state,
        templateId: action.payload.templateId,
        templateName: action.payload.templateName,
        openFlag: action.payload.openFlag,
      };
  }
  return state;
};

export default openTemplateReducer;
