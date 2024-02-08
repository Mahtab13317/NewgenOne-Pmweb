const initialState = {
  isDrawerExpanded: false,
};

const expandDrawerReducer = (state = initialState, action) => {
  switch (action.type) {
    case "EXPAND_DRAWER":
      return {
        ...state,
        isDrawerExpanded: action.payload,
      };
  }
  return state;
};

export default expandDrawerReducer;
