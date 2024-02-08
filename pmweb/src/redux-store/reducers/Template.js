const initialState = {
  template_page: null,
  template_category: null,
  template_view: 0,
  template_selected: null,
  is_create_process_clicked: false,
  template_project: "",
  template_project_const: false,
  template_process: "",
  template_files: [],
};

const templateReducer = (state = initialState, action) => {
  if (action.type === "SET_TEMPLATE_PREV_PAGE") {
    return {
      ...state,
      template_page: action.payload.value,
    };
  } else if (action.type === "SET_TEMPLATE_DETAILS") {
    return {
      ...state,
      template_category: action.payload.category,
      template_view: action.payload.view,
      is_create_process_clicked: action.payload.createBtnClick,
      template_selected: action.payload.template,
      template_project: action.payload.projectName,
      template_project_const: action.payload.isProjectNameConstant,
      template_process: action.payload.processName,
      template_files: action.payload.files,
    };
  }
  return state;
};
export default templateReducer;
