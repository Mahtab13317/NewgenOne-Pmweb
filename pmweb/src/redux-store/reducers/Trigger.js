const initialState = {
  trigger_reload: false,
  sessionStatus: false,
  setDefaultValues: false,
  isTriggerEdited: false,
  Mail: {
    isFromConst: false,
    isToConst: false,
    isCConst: false,
    isBccConst: false,
    from: "",
    to: "",
    cc: "",
    bcc: "",
    priority: "",
    subjectValue: "",
    mailBodyValue: "",
  },
  Execute: { funcName: "", serverExecutable: "", argString: "" },
  Exception: { exceptionId: "", exceptionName: "", attribute: "", comment: "" },
  LaunchApp: { appName: "", argumentStrValue: "" },
  generateResponse: {
    fileId: "",
    fileName: "",
    docTypeName: "",
    docTypeId: "",
  },
  CreateChild: {
    m_strAssociatedWS: "",
    type: "",
    generateSameParent: "N",
    variableId: "",
    varFieldId: "",
    list: [],
  },
  Set: [],
  DataEntry: [],
  templateList: [],
};

const triggerReducer = (state = initialState, action) => {
  if (action.type === "RELOAD_TRIGGER") {
    return {
      ...state,
      trigger_reload: action.payload.reload,
    };
  } else if (action.type === "TRIGGER_DEFINITION_EDITED") {
    return {
      ...state,
      isTriggerEdited: action.payload.editValue,
    };
  } else if (action.type === "SESSIONSTATUS") {
    return {
      ...state,
      sessionStatus: action.payload,
    };
  } else if (action.type === "SET_DEFAULT_TRIGGER") {
    return {
      ...state,
      setDefaultValues: action.payload.value,
    };
  } else if (action.type === "MAIL_PROPERTIES") {
    return {
      ...state,
      Mail: action.payload.mail,
    };
  } else if (action.type === "EXECUTE_TRIGGER_PROPERTIES") {
    return {
      ...state,
      Execute: action.payload.execute,
    };
  } else if (action.type === "LA_TRIGGER_PROPERTIES") {
    return {
      ...state,
      LaunchApp: action.payload.launchApp,
    };
  } else if (action.type === "SET_TRIGGER_PROPERTIES") {
    return {
      ...state,
      Set: action.payload.variableList,
    };
  } else if (action.type === "DATA_ENTRY_TRIGGER_PROPERTIES") {
    return {
      ...state,
      DataEntry: action.payload.dataEntryList,
    };
  } else if (action.type === "EXCEPTION_TRIGGER_PROPERTIES") {
    return {
      ...state,
      Exception: action.payload.exception,
    };
  } else if (action.type === "CREATE_CHILDWORKITEM_TRIGGER_PROPERTIES") {
    return {
      ...state,
      CreateChild: action.payload.createChild,
    };
  } else if (action.type === "GR_TRIGGER_PROPERTIES") {
    return {
      ...state,
      generateResponse: action.payload.generateResponse,
    };
  } else if (action.type === "GET_TRIGGER_TEMPLATES") {
    return {
      ...state,
      templateList: action.payload.templateList,
    };
  }
  return state;
};

export default triggerReducer;
