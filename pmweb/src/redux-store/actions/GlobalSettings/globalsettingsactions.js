export const setGlobalSettings = (data) => {
  return { type: "setglobalsettings", payload: data };
};

export const setGlobalInis = (data) => {
  return { type: "setglobalinis", payload: data };
};
