const initialState = {
  GlobalInisState: { locale_type: "0" },
  globalSettings: { date_format: "" },
};

const globalSettingsReducer = (state = initialState, action) => {
  switch (action.type) {
    case "setglobalsettings":
      return {
        ...state,
        globalSettings: { ...action.payload },
      };
    case "setglobalinis":
      return {
        ...state,
        GlobalInisState: { ...action.payload },
      };
    default:
      return state;
  }
};
export default globalSettingsReducer;
