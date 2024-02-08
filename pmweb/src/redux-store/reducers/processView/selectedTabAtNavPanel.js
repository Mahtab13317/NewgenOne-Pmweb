const initialState = {
  selectedTab : []
};

const selectedTabAtNavReducer = (state = initialState, action) => {
  switch (action.type) {
      case 'SELECTED_NAV_TAB':
        return {
          ...state,
          selectedTab : action.payload,
        }
  }
  return state;
}

export default selectedTabAtNavReducer;