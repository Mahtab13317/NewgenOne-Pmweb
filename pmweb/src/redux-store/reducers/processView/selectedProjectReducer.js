const initialState = {
  selectedProjectId: "",
  selectedProjectName: "",
};

const selectedProjectReducer = (state = initialState, action) => {
  switch (action.type) {
    case "SELECTED_PROJECT":
      return {
        ...state,
        selectedProjectId: action.payload.id,
        selectedProjectName: action.payload.name,
      };
  }
  return state;
};

export default selectedProjectReducer;
