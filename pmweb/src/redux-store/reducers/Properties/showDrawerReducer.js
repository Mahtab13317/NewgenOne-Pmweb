const initialState = {
  showDrawer:null
};
  
  const showDrawerReducer = (state = initialState, action) => {
    switch (action.type) {
      case 'SHOW_DRAWER':
        return {
          ...state,
          showDrawer : action.payload,
        }
    }
    return state;
  }
  
  export default showDrawerReducer;