const initialState = {
  windowInnerHeight: window.innerHeight,
};

const setWindowInnerHeight = (state = initialState, action) => {
  switch (action.type) {
    case "SET_INNER_HEIGHT":
      return {
        ...state,
        windowInnerHeight: action.payload.height,
      };
    default:
  }
  return state;
};

export default setWindowInnerHeight;
