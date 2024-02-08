import CreateChildWorkitemProperties from "../../../components/ProcessSettings/Trigger/Properties/CreateChildWorkItem";
import DataEntryProperties from "../../../components/ProcessSettings/Trigger/Properties/DataEntryProperties";
import ExceptionProperties from "../../../components/ProcessSettings/Trigger/Properties/ExceptionProperties";
import ExecuteProperties from "../../../components/ProcessSettings/Trigger/Properties/ExecuteProperties";
import GenerateResponseProperties from "../../../components/ProcessSettings/Trigger/Properties/GenerateResponseProperties";
import LaunchApplicationProperties from "../../../components/ProcessSettings/Trigger/Properties/LaunchApplicationProperties";
import MailProperties from "../../../components/ProcessSettings/Trigger/Properties/MailProperties";
import SetProperties from "../../../components/ProcessSettings/Trigger/Properties/SetProperties";
import {
  TRIGGER_TYPE_CHILDWORKITEM,
  TRIGGER_TYPE_DATAENTRY,
  TRIGGER_TYPE_EXCEPTION,
  TRIGGER_TYPE_EXECUTE,
  TRIGGER_TYPE_GENERATERESPONSE,
  TRIGGER_TYPE_LAUNCHAPP,
  TRIGGER_TYPE_MAIL,
  TRIGGER_TYPE_SET,
} from "../../../Constants/triggerConstants";

export function triggerTypeOptions(triggerType, isReadOnly) {
  let triggerName;
  let properties;
  let mandatory_fields;
  let setTriggerPropertiesFunc;

  if (triggerType === TRIGGER_TYPE_MAIL) {
    triggerName = "MAIL";
    properties = <MailProperties isReadOnly={isReadOnly} />;
    mandatory_fields = ["from", "to", "subjectValue"];
    setTriggerPropertiesFunc = "mailTypeTrigger";
  } else if (triggerType === TRIGGER_TYPE_EXECUTE) {
    triggerName = "EXECUTE";
    properties = <ExecuteProperties isReadOnly={isReadOnly} />;
    mandatory_fields = ["funcName", "serverExecutable", "argString"];
    setTriggerPropertiesFunc = "executeTypeTrigger";
  } else if (triggerType === TRIGGER_TYPE_LAUNCHAPP) {
    triggerName = "LAUNCHAPPLICATION";
    properties = <LaunchApplicationProperties isReadOnly={isReadOnly} />;
    mandatory_fields = ["appName", "argumentStrValue"];
    setTriggerPropertiesFunc = "launchApplicationTypeTrigger";
  } else if (triggerType === TRIGGER_TYPE_DATAENTRY) {
    triggerName = "DATAENTRY";
    properties = <DataEntryProperties isReadOnly={isReadOnly} />;
    setTriggerPropertiesFunc = "dataEntryTypeTrigger";
  } else if (triggerType === TRIGGER_TYPE_SET) {
    triggerName = "SET";
    properties = <SetProperties isReadOnly={isReadOnly} />;
    setTriggerPropertiesFunc = "setTypeTrigger";
  } else if (triggerType === TRIGGER_TYPE_GENERATERESPONSE) {
    triggerName = "GENERATERESPONSE";
    properties = <GenerateResponseProperties isReadOnly={isReadOnly} />;
    mandatory_fields = ["fileId", "docTypeId"];
    setTriggerPropertiesFunc = "generateResponseTypeTrigger";
  } else if (triggerType === TRIGGER_TYPE_EXCEPTION) {
    triggerName = "EXCEPTION";
    properties = <ExceptionProperties isReadOnly={isReadOnly} />;
    mandatory_fields = ["exceptionId", "exceptionName", "attribute", "comment"];
    setTriggerPropertiesFunc = "exceptionTypeTrigger";
  } else if (triggerType === TRIGGER_TYPE_CHILDWORKITEM) {
    triggerName = "CREATE_CHILD_WORKITEM";
    properties = <CreateChildWorkitemProperties isReadOnly={isReadOnly} />;
    mandatory_fields = [
      "m_strAssociatedWS",
      "type",
      "generateSameParent",
      "variableId",
      "varFieldId",
    ];
    setTriggerPropertiesFunc = "createChildWorkitemTypeTrigger";
  }

  return [triggerName, properties, mandatory_fields, setTriggerPropertiesFunc];
}

export function triggerTypeName(triggerType) {
  let triggerName;
  if (triggerType === TRIGGER_TYPE_MAIL) {
    triggerName = "MAIL";
  } else if (triggerType === TRIGGER_TYPE_EXECUTE) {
    triggerName = "EXECUTE";
  } else if (triggerType === TRIGGER_TYPE_LAUNCHAPP) {
    triggerName = "LAUNCHAPPLICATION";
  } else if (triggerType === TRIGGER_TYPE_DATAENTRY) {
    triggerName = "DATAENTRY";
  } else if (triggerType === TRIGGER_TYPE_SET) {
    triggerName = "SET";
  } else if (triggerType === TRIGGER_TYPE_GENERATERESPONSE) {
    triggerName = "GENERATERESPONSE";
  } else if (triggerType === TRIGGER_TYPE_EXCEPTION) {
    triggerName = "EXCEPTION";
  } else if (triggerType === TRIGGER_TYPE_CHILDWORKITEM) {
    triggerName = "CREATE_CHILD_WORKITEM";
  }
  return triggerName;
}
