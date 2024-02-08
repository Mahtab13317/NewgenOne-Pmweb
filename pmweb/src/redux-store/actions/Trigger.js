export const setTemplates = (templateList) => {
  return {
    type: "GET_TRIGGER_TEMPLATES",
    payload: {
      templateList,
    },
  };
};

export const reload_trigger_fields = (reload) => {
  return {
    type: "RELOAD_TRIGGER",
    payload: {
      reload,
    },
  };
};

export const sessionStatus = (value) => {
  return {
    type: "SESSIONSTATUS",
    payload: value
  };
};

export const is_trigger_definition_edited = (editValue) => {
  return {
    type: "TRIGGER_DEFINITION_EDITED",
    payload: {
      editValue,
    },
  };
};

export const set_trigger_fields = (value) => {
  return {
    type: "SET_DEFAULT_TRIGGER",
    payload: {
      value,
    },
  };
};

export const mail_properties = ({
  from,
  isFromConst,
  to,
  isToConst,
  cc,
  isCConst,
  bcc,
  isBccConst,
  priority,
  subjectValue,
  mailBodyValue,
}) => {
  return {
    type: "MAIL_PROPERTIES",
    payload: {
      mail: {
        from,
        isFromConst,
        to,
        isToConst,
        cc,
        isCConst,
        bcc,
        isBccConst,
        priority,
        subjectValue,
        mailBodyValue,
      },
    },
  };
};

export const execute_properties = ({
  funcName,
  serverExecutable,
  argString,
}) => {
  return {
    type: "EXECUTE_TRIGGER_PROPERTIES",
    payload: {
      execute: { funcName, serverExecutable, argString },
    },
  };
};

export const launch_application_properties = ({
  appName,
  argumentStrValue,
}) => {
  return {
    type: "LA_TRIGGER_PROPERTIES",
    payload: {
      launchApp: { appName, argumentStrValue },
    },
  };
};

export const setTrigger_properties = (list) => {
  return {
    type: "SET_TRIGGER_PROPERTIES",
    payload: {
      variableList: list,
    },
  };
};

export const dataEntryTrigger_properties = (list) => {
  return {
    type: "DATA_ENTRY_TRIGGER_PROPERTIES",
    payload: {
      dataEntryList: list,
    },
  };
};

export const exception_properties = ({
  exceptionId,
  exceptionName,
  attribute,
  comment,
}) => {
  return {
    type: "EXCEPTION_TRIGGER_PROPERTIES",
    payload: {
      exception: {
        exceptionId,
        exceptionName,
        attribute,
        comment,
      },
    },
  };
};

export const generate_response_properties = ({
  fileId,
  fileName,
  docTypeName,
  docTypeId,
}) => {
  return {
    type: "GR_TRIGGER_PROPERTIES",
    payload: {
      generateResponse: {
        fileId,
        fileName,
        docTypeName,
        docTypeId,
      },
    },
  };
};

export const createChildWorkitemTrigger_properties = ({
  m_strAssociatedWS,
  type,
  generateSameParent,
  variableId,
  varFieldId,
  list,
}) => {
  return {
    type: "CREATE_CHILDWORKITEM_TRIGGER_PROPERTIES",
    payload: {
      createChild: {
        m_strAssociatedWS,
        type,
        generateSameParent,
        variableId,
        varFieldId,
        list,
      },
    },
  };
};
