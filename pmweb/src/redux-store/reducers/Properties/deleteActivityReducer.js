const initialState = {
  activityDependencies: [],
  showDependencyModal: false,
};

const deleteActivityReducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_ACTIVITY_DEPENDENCIES":
      return {
        ...state,
        activityDependencies: action.payload,
      };
    case "SET_SHOW_DEPENDENCY_MODAL":
      return {
        ...state,
        showDependencyModal: action.payload,
      };
  }
  return state;
};

export default deleteActivityReducer;
