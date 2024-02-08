//to store the previous page from where template preview was selected
export const storeTemplatePage = (value) => {
  return {
    type: "SET_TEMPLATE_PREV_PAGE",
    payload: {
      value,
    },
  };
};

export const setTemplateDetails = (
  category,
  view,
  createBtnClick,
  template,
  projectName,
  isProjectNameConstant,
  processName,
  files
) => {
  return {
    type: "SET_TEMPLATE_DETAILS",
    payload: {
      category: category,
      view: view,
      createBtnClick: createBtnClick,
      template: template,
      projectName: projectName,
      isProjectNameConstant: isProjectNameConstant,
      processName: processName,
      files: files,
    },
  };
};
