export const view = {
  abstract: {
    defaultWord: "Abstract View",
    langKey: "views.abstract",
  },
  bpmn: {
    defaultWord: "BPMN View",
    langKey: "views.bpmn",
  },
};

export const messageType = {
  default: {
    icon: null,
    defaultWord: "Message",
    langKey: "messageType.default",
  },
  errorMessage: {
    icon: null,
    defaultWord: "Error!",
    langKey: "messageType.errorMessage",
  },
};

export const TaskType = {
  globalTask: "Generic",
  processTask: "ProcessTask",
};

export const taskType_label = {
  newTask_label: "toolbox.taskTemplates.newTask",
  processTask_label: "toolbox.taskTemplates.processTask",
};

export const activityType = {
  startEvent: "startEvent",
  conditionalStart: "conditionalStart",
  timerStart: "timerStart",
  messageStart: "messageStart",
  subProcess: "subProcess",
  callActivity: "callActivity",
  workdesk: "workdesk",
  robotWorkdesk: "robotWorkdesk",
  caseWorkdesk: "caseWorkdesk",
  email: "email",
  export: "export",
  query: "query",
  omsAdapter: "omsAdapter",
  webService: "webService",
  businessRule: "businessRule",
  dmsAdapter: "dmsAdapter",
  sharePoint: "sharePoint",
  sapAdapter: "sapAdapter",
  responseConsumerJMS: "responseConsumerJMS",
  responseConsumerSOAP: "responseConsumerSOAP",
  requestConsumerSOAP: "requestConsumerSOAP",
  restful: "restful",
  event: "event",
  jmsProducer: "jmsProducer",
  jmsConsumer: "jmsConsumer",
  timerEvents: "timerEvents",
  inclusiveDistribute: "inclusiveDistribute",
  parallelDistribute: "parallelDistribute",
  inclusiveCollect: "inclusiveCollect",
  parallelCollect: "parallelCollect",
  dataBasedExclusive: "dataBasedExclusive",
  endEvent: "endEvent",
  terminate: "terminate",
  messageEnd: "messageEnd",
  dataExchange: "dataExchange",
  receive: "receive",
  reply: "reply",
  textAnnotations: "textAnnotations",
  groupBox: "groupBox",
  dataObject: "dataObject",
  message: "message",
  embStartEvent: "embStartEvent",
  embEndEvent: "embEndEvent",
};

//labels for each type of activity
export const activityType_label = {
  startEvent: "toolbox.startEvents.startEvent",
  conditionalStart: "toolbox.startEvents.conditionalStart",
  messageStart: "toolbox.startEvents.messageStart",
  timerStart: "toolbox.startEvents.timerStart",
  subProcess: "toolbox.activities.subProcess",
  callActivity: "toolbox.activities.callActivity",
  workdesk: "toolbox.activities.workdesk",
  robotWorkdesk: "toolbox.activities.robotWorkdesk",
  caseWorkdesk: "toolbox.activities.caseWorkdesk",
  email: "toolbox.activities.email",
  export: "toolbox.activities.export",
  query: "toolbox.activities.query",
  sapAdapter: "toolbox.activities.sapAdapter",
  webService: "toolbox.activities.webService",
  responseConsumerJMS: "toolbox.activities.responseJMS",
  responseConsumerSOAP: "toolbox.activities.responseSOAP",
  requestConsumerSOAP: "toolbox.activities.requestSOAP",
  restful: "toolbox.activities.restful",
  businessRule: "toolbox.activities.businessRule",
  dmsAdapter: "toolbox.activities.dmsAdapter",
  sharePoint: "toolbox.activities.sharePoint",
  ccm: "toolbox.activities.ccm",
  receive: "toolbox.activities.receive",
  reply: "toolbox.activities.reply",
  event: "toolbox.intermediateEvents.event",
  jmsProducer: "toolbox.intermediateEvents.jmsProducer",
  jmsConsumer: "toolbox.intermediateEvents.jmsConsumer",
  timerEvents: "toolbox.intermediateEvents.timerEvents",
  inclusiveDistribute: "toolbox.gateway.inclusiveDistribute",
  inclusiveCollect: "toolbox.gateway.inclusiveCollect",
  parallelDistribute: "toolbox.gateway.parallelDistribute",
  parallelCollect: "toolbox.gateway.parallelCollect",
  dataBasedExclusive: "toolbox.gateway.dataBasedExclusive",
  endEvent: "toolbox.endEvents.endEvent",
  terminate: "toolbox.endEvents.terminate",
  messageEnd: "toolbox.endEvents.messageEnd",
  dataExchange: "toolbox.integrationPoints.dataExchange",
  textAnnotations: "toolbox.artefacts.textAnnotations",
  groupBox: "toolbox.artefacts.groupBox",
  dataObject: "toolbox.artefacts.dataObject",
  message: "toolbox.artefacts.message",
  embStartEvent: "toolbox.startEvents.embStartEvent",
  embEndEvent: "toolbox.endEvents.embEndEvent",
  expandedEmbeddedProcess: "toolbox.activities.subProcess",
};

// Steps value added for steps in queue variable table mapping.
export const TABLE_STEP = 0;
export const MAPPING_STEP = 1;
export const RELATIONSHIP_STEP = 2;

// Maximum default feature id for process features.
export const MAX_AVAILABLE_FEATURES_ID = 12;

// Rtl direction constant for right to left modification.
export const RTL_DIRECTION = "rtl";

//constant for state of activity when it is dragged and dropped in expanded state
export const expandedViewOnDrop = true;

//constant for Local Process
export const PROCESSTYPE_LOCAL = "L";
export const PROCESSTYPE_LOCAL_CHECKED = "LC";
export const PROCESSTYPE_DEPLOYED = "D";
export const PROCESSTYPE_REGISTERED = "R";
export const PROCESSTYPE_ENABLED = "E";
export const PROCESSTYPE_REGISTERED_CHECKED = "RC";
export const PROCESSTYPE_ENABLED_CHECKED = "EC";

export const PROCESS_CHECKOUT = "Y";
export const PROCESS_NO_CHECKOUT = "N";

export const CONSTANT = "<constant>";
export const CONSTANT_CAPS = "<Constant>";
export const WORD_LIMIT_DESC = 25;
export const APP_HEADER_HEIGHT = "4rem";
export const headerHeight = "10.5rem";

export const PMWEB = "PMWEB";

export const BASE_URL = window.ConfigsLocal.backend_base_URL_FormBuilder;
export const SERVER_URL = window.ConfigsLocal.backend_base_URL_PMWEB;
export const SERVER_URL_LAUNCHPAD =
  window.ConfigsLocal.backend_base_URL_Launchpad;
export const HOME_REDIRECT =
  window.ConfigsLocal.backend_base_URL_processDesigner;

//AI
export const ENDPOINT_GENERATE_PROCESS_AI = "/st/process/generate";
export const ENDPOINT_CREATE_PROCESS_AI = "/st/process/create";

//brt url
export const ENDPOINT_GET_RULE_MEMBER_LIST = "/getRuleMemberList";
export const ENDPOINT_REST_PACKAGE = "/ruleFlowAndRulePackageList";
export const ENDPOINT_SOAP_PACKAGE = "/ruleFlowAndRulePackageList";
export const ENDPOINT_RULE_FLOW_VERSION = "/ruleFlowVersionList";
export const ENDPOINT_RULE_PACKAGE_VERSION = "/ruleSetVersionList";

//sharepoint archive url
export const ENDPOINT_GET_LIBRARY_LIST = "/libraryProperty/";

//data rights

export const ENDPOINT_GET_DATA_ASSOCIATE = "/dataAssoc";
export const ENDPOINT_SAVE_DATA_ASSOCIATE = "/saveDataAssoc";

export const ENDPOINT_GETREGISTRATIONPROPERTY = "/registrationProperty";
export const PMWEB_CONTEXT = "/pmweb";
export const LAUNCHPAD_CONTEXT = "/launchpad";
export const ENDPOINT_GETPROJECTLIST = "/getprojectList/B";
export const ENDPOINT_PROCESSLIST = "/getprocesslist";
export const ENDPOINT_ADDMILE = "/addMilestone";
export const ENDPOINT_REMOVELANE = "/removeLane";
export const ENDPOINT_ADDLANE = "/addLane";
export const ENDPOINT_REMOVEMILE = "/removeMilestone";
export const ENDPOINT_MOVEMILE = "/moveMilestone";
export const ENDPOINT_RENAMEMILE = "/renameMilestone";
export const ENDPOINT_RENAMELANE = "/renameLane";
export const ENDPOINT_ADDTASK = "/addTask";
export const ENDPOINT_DEASSOCIATETASK = "/deassociateTask";
export const ENDPOINT_ASSOCIATETASK = "/associateTask";
export const ENDPOINT_GET_PROCESS_FEATURES = "/featureData";
export const ENDPOINT_REMOVEACTIVITY = "/removeAct";
export const ENDPOINT_REMOVETASK = "/removeTask";
export const ENDPOINT_RENAMEACTIVITY = "/renameAct";
export const ENDPOINT_INCLUDE_PROCESS_FEATURE = "/includeFeature";
export const ENDPOINT_EXCLUDE_PROCESS_FEATURE = "/excludeFeature";
export const ENDPOINT_ADDACTIVITY = "/addAct";
export const ENDPOINT_ADD_DATAOBJECT = "/addDataObject";
export const ENDPOINT_ADD_MSGAF = "/addMessageAF";
export const ENDPOINT_ADD_GROUPBOX = "/addGroupBox";
export const ENDPOINT_ADD_ANNOTATION = "/addAnnotation";
export const ENDPOINT_DELETE_DATAOBJECT = "/deleteDataObject";
export const ENDPOINT_DELETE_MSGAF = "/deleteMessageAF";
export const ENDPOINT_DELETE_GROUPBOX = "/deleteGroupBox";
export const ENDPOINT_DELETE_ANNOTATION = "/deleteAnnotation";
export const ENDPOINT_MOVE_DATAOBJECT = "/moveDataobject";
export const ENDPOINT_MOVE_MSGAF = "/moveMessageAF";
export const ENDPOINT_MOVE_GROUPBOX = "/moveGroupBox";
export const ENDPOINT_MOVE_ANNOTATION = "/moveAnnotation";
export const ENDPOINT_RESIZE_GROUPBOX = "/resizeGroupBox";
export const ENDPOINT_MODIFY_ANNOTATION = "/modifyAnnotation";
export const ENDPOINT_MODIFY_DATAOBJECT = "/modifyDataobject";
export const ENDPOINT_MODIFY_MSGAF = "/modifyMessageAF";
export const ENDPOINT_PASTEACTIVITY = "/pasteActivity";
export const ENDPOINT_CHANGEACTIVITY = "/changeActType";
export const ENDPOINT_EDIT_DOC = "/modifyDocType";
export const ENDPOINT_ADD_EXCEPTION = "/addException";
export const ENDPOINT_ADD_GROUP = "/addGroup";
export const ENDPOINT_DELETE_EXCEPTION = "/removeException";
export const ENDPOINT_DELETE_GROUP = "/removeGroup";
export const ENDPOINT_DELETE_TODO = "/removeTodo";
export const ENDPOINT_ADD_TODO = "/addTodo";
export const ENDPOINT_MODIFY_EXCEPTION = "/modifyException";
export const ENDPOINT_MODIFY_TODO = "/modifyTodo";
export const ENDPOINT_MOVETO_OTHERGROUP = "/moveInterface";
export const ENDPOINT_RESIZEMILE = "/resizeMilestone";
export const ENDPOINT_GETTRIGGER = "/trigger";
export const ENDPOINT_ADDTRIGGER = "/addTrigger";
export const ENDPOINT_REMOVETRIGGER = "/removeTrigger";
export const ENDPOINT_MODIFYTRIGGER = "/modifyTrigger";
export const ENDPOINT_GET_CONSTANTS = "/fetchConstant";
export const ENDPOINT_ADD_CONSTANT = "/addConstant";
export const ENDPOINT_MODIFY_CONSTANT = "/modifyConstant";
export const ENDPOINT_REMOVE_CONSTANT = "/removeConstant";
export const ENDPOINT_ADD_PROJECT = "/addProject";
export const ENDPOINT_ADD_CATEGORY = "/addCategory";
export const ENDPOINT_ADD_TEMPLATE = "/addTemplate";
export const ENDPOINT_OPENTEMPLATE = "/openTemplate";
export const ENDPOINT_FETCH_TEMPLATE = "/fetchTemplate/-1";
export const ENDPOINT_ADD_PROCESS = "/addProcess";
export const ENDPOINT_FETCHRECENTS = "/recentlist";
export const ENDPOINT_FETCHSYSTEMREQUIREMENTS = "/systemRequirement";
export const ENDPOINT_FETCHPROCESSREQUIREMENTS = "/processRequirement";
export const ENDPOINT_FETCHPROJECTREQUIREMENTS = "/projectRequirement";
export const ENDPOINT_DEFAULTQUEUE = "/defaultQueue";
export const ENDPOINT_DELETE_CATEGORY = "/removeCategory";
export const ENDPOINT_DELETE_PROJECT = "/deleteproject";
export const ENDPOINT_DELETE_TEMPLATE = "/deleteTemplate";
export const ENDPOINT_EDIT_CATEGORY = "/modifyCategory";
export const ENDPOINT_GET_ACTIVITY_PROPERTY = "/activityProperty/";
export const ENDPOINT_FETCH_ALL_TEMPLATES = "/fetchTemplate/-1";
export const ENDPOINT_FETCH_CATEGORIES = "/fetchCategory";
export const ENDPOINT_ADD_CONNECTION = "/addConnection";
export const ENDPOINT_DELETE_CONNECTION = "/removeConnection";
export const ENDPOINT_MOVE_CONNECTION = "/moveConnection";
export const ENDPOINT_OPENPROCESS = "/openprocess/";
export const ENDPOINT_MOVE_PINNED_TILES = "/move";
export const ENDPOINT_MOVE_RULES = "/moveInterfaceRule";
export const ENDPOINT_ADD_RULES = "/addInterfaceRule"; // Will not be used after common saving changes are done.
export const ENDPOINT_MODIFY_RULES = "/modifyInterfaceRule"; // Will not be used after common saving changes are done.
export const ENDPOINT_DELETE_RULES = "/deleteInterfaceRule"; // Will not be used after common saving changes are done.
export const ENDPOINT_ADDSYSTEMREQUIREMENTS = "/addSystemRequirement";
export const ENDPOINT_ADDPROJECTREQUIREMENTS = "/addProjectRequirement";
export const ENDPOINT_ADDPROCESSREQUIREMENTS = "/addProcessRequirement";
export const ENDPOINT_SAVE_MAJOR = "/saveMajor";
export const ENDPOINT_GET_GLOBALTASKTEMPLATES = "/globalTemplate";
export const ENDPOINT_GET_EXPORTTEMPLATES = "/exportTaskTemplate";
export const ENDPOINT_SAVE_MINOR = "/saveMinor";
export const ENDPOINT_CHECKOUT = "/checkOutProcess";
export const ENDPOINT_CHECKOUT_ACT = "/checkOutActivity";
export const ENDPOINT_UNDO_CHECKOUT_ACT = "/undoCheckOutActivity";
export const ENDPOINT_CHECKIN_ACT = "/checkInActivity";
export const ENDPOINT_CHECKOUT_LANE = "/checkOutLane";
export const ENDPOINT_CHECKIN_LANE = "/checkInLane";
export const ENDPOINT_UNDOCHECKOUT_LANE = "/undoCheckOutLane";
export const ENDPOINT_ENABLE = "/enableProcess";
export const ENDPOINT_DISABLE = "/disableProcess";
export const ENDPOINT_CHECKIN = "/checkInProcess";
export const ENDPOINT_UNDO_CHECKOUT = "/undoCheckOutProcess";
export const ENDPOINT_SAVE_LOCAL = "/saveLocal";
export const ENDPOINT_ADD_RULE = "/addRule"; // Not being used.
export const ENDPOINT_DELETE_RULE = "/deleteRule"; // Not being used.
export const ENDPOINT_MODIFY_RULE = "/modifyRule"; // Not being used.
export const ENDPOINT_GET_REGISTERED_FUNCTIONS = "/registeredFunc";
export const ENDPOINT_DELETE_PROCESS = "/deleteprocess";
export const ENDPOINT_DELETE_PROCESS_DEPLOYED = "/unregisterProcess";
export const ENDPOINT_DELETESYSTEMREQUIREMENTS = "/removeSystemRequirement";
export const ENDPOINT_DELETEPROJECTREQUIREMENTS = "/removeProjectRequirement";
export const ENDPOINT_DELETEPROCESSREQUIREMENTS = "/removeProcessRequirement";
export const ENDPOINT_EDITSYSTEMREQUIREMENTS = "/modifySystemRequirement";
export const ENDPOINT_EDITPROCESSREQUIREMENTS = "/modifyProcessRequirement";
export const ENDPOINT_EDITPROJECTREQUIREMENTS = "/modifyProjectRequirement";
export const ENDPOINT_MOVESYSTEMREQUIREMENTS = "/moveSystemRequirement";
export const ENDPOINT_MOVEPROJECTREQUIREMENTS = "/moveProjectRequirement";
export const ENDPOINT_MOVEPROCESSREQUIREMENTS = "/moveProcessRequirement";
export const ENDPOINT_REGISTER_PROCESS = "/requirement";
export const ENDPOINT_READXML = "/readXML";
export const ENDPOINT_MODIFY_CONNECTION = "/modifyConnection";
export const ENDPOINT_GET_COMPLEX = "/complexTypeData";
export const ENDPOINT_ADD_COMPLEX = "/addComplex";
export const ENDPOINT_EDIT_COMPLEX = "/modifyComplex";
export const ENDPOINT_DELETE_COMPLEX = "/removeComplex";
export const ENDPOINT_GET_EXTERNAL_METHODS = "/registeredFunc";
export const ENDPOINT_ADD_EXTERNAL_METHODS = "/addRegisterFunc";
export const ENDPOINT_DELETE_EXTERNAL_METHODS = "/deleteRegisterFunc";
export const ENDPOINT_MODIFY_EXTERNAL_METHODS = "/modifyRegisterFunc";
export const ENDPOINT_RESIZELANE = "/resizeLane";
export const ENDPOINT_VALIDATEPROCESS = "/validateProcess";
export const ENDPOINT_DEPLOYPROCESS = "/deploy";
export const ENDPOINT_REGISTERPROCESS = "/registration";
export const ENDPOINT_ADD_USER_DEFINE_VARIABLE = "/addNewColumn";
export const ENDPOINT_DELETE_USER_DEFINE_VARIABLE = "/removeColumn";
export const ENDPOINT_MODIFY_USER_DEFINE_VARIABLE = "/modifyColumn";
export const ARCHIEVE_CONNECT = "/connect";
export const ARCHIEVE_DISCONNECT = "/disconnect";
export const SAVE_ARCHIVE = "/saveArchive";
export const ENDPOINT_GETALLVERSIONS = "/allVersion";
export const ENDPOINT_GET_COLUMN_LIST = "/columnList";
export const ENDPOINT_MOVEACTIVITY = "/moveAct";
export const ENDPOINT_MOVETASK = "/moveTask";
export const ENDPOINT_UPDATE_ACTIVITY = "/updateActivity";
export const ENDPOINT_RENAMETASK = "/renameTask";
export const ENDPOINT_RESIZE_ACT = "/resizeActivity";
export const ENDPOINT_SAVE_QUEUE_DATA = "/saveQueueData";
export const ENDPOINT_GET_QUEUE_ID = "/queueId";

export const ENDPOINT_PROJECT_PROPERTIES = "/updateProjectProperty";
export const ENDPOINT_GET_PROJECT_PROPERTIES = "/projectProperty";
export const ENDPOINT_PROCESS_REPORT = "/processReport";

export const ENDPOINT_SEARCHJMSCONSUMER = "/search";
export const ENDPOINT_UPDATEJMSCONSUMER = "/update";
export const ENDPOINT_PROCESSVARIABLEJMSCONSUMER = "/processVariable";
export const ENDPOINT_DESTINATIONJMSCONSUMER = "/destinationName";

export const ENDPOINT_RESETINVOCATION = "/resetinvocation";
export const ENDPOINT_SETREPLYWORKSTEP = "/setreplyworkstep";

export const ENDPOINT_PROCESS_PROPERTIES = "/processProperty";
export const ENDPOINT_UPDATE_PROCESS_PROPERTIES = "/updateProcessProperty";

export const ENDPOINT_GET_CABINET = "/cabinetOMS";
export const ENDPOINT_CONNECT_CABINET = "/connectOMS";
export const ENDPOINT_DISCONNECT_CABINET = "/disConnectOMS";
export const ENDPOINT_GET_CABINET_TEMPLATE = "/template";
export const ENDPOINT_MAP_TEMPLATE = "/templateMapping";
export const ENDPOINT_DOWNLOAD_ASSOCIATED_TEMPLATE = "/previewTemplate/";

export const ENDPOINT_SAVEPROPERTY = "/saveActProperty";
export const ENDPOINT_GET_WEBSERVICE = "/globalCatalogMethods/";
export const ENDPOINT_FETCH_DETAILS = "/wsDetail";
export const ENDPOINT_SAVE_WEBSERVICE = "/saveCatalogMethod";
export const ENDPOINT_SAVE_REST_WEBSERVICE = "/saveCatalogRestMethod";
export const ENDPOINT_PROCESS_ASSOCIATION = "/validateObject";
export const ENDPOINT_ADD_INTERFACE_RULE = "/addInterfaceRule";
export const ENDPOINT_MODIFY_INTERFACE_RULE = "/modifyInterfaceRule";
export const ENDPOINT_DELETE_INTERFACE_RULE = "/deleteInterfaceRule";
export const ENDPOINT_GET_FORM_RULE = "/formRule";

export const ENDPOINT_GETPROJECTLIST_DRAFTS = "/getprojectList/L";
export const ENDPOINT_GETPROJECTLIST_DEPLOYED = "/getprojectList/R";
export const ENDPOINT_GET_ALLPROCESSLIST = "/getprocesslist/B/-1";
export const ENDPOINT_GET_ALLDRAFTPROCESSLIST = "/getprocesslist/L/-1";
export const ENDPOINT_GET_ALLDEPLOYEDPROCESSLIST = "/getprocesslist/R/-1";
export const ENDPOINT_GET_REGISTER_TEMPLATE = "/registerTemplate";
export const ENDPOINT_GET_EXISTING_TABLES = "/tableList";
export const ENDPOINT_GET_COLUMNS = "/columnList";
export const ENDPOINT_TEST_CONNECTION = "/testConnection";
export const ENDPOINT_GET_CURRENT_CABINETNAME = "/currentCabinetName";
export const ENDPOINT_GET_ARCHIEVE_PROCESS_REPORTLIST =
  "/archievedProcessReportList";
export const ENDPOINT_DOWNLOAD_ARCHIEVE_REPORT = "/downloadArchievedReport";
export const ENDPOINT_GET_USER_RIGHTS = "/assignableRights";
export const ENDPOINT_UPLOAD_ATTACHMENT = "/attachDoc";
export const ENDPOINT_DOWNLOAD_ATTACHMENT = "/downloadDoc";
export const ENDPOINT_SAVE_ATTACHMENT = "/attachment";
export const CONFIG = "/config";

export const ENDPOINT_GET_REGISTER_TRIGGER = "/registerTrigger";
export const ENDPOINT_POST_REGISTER_WINDOW = "/registerWindow";
export const ENDPOINT_GET_FORMASSOCIATIONS = "/formAssociations";
export const ENDPOINT_ADD_DOC = "/addDocType";

export const ENDPOINT_GET_VARIABLE_RULES = "/variableRule";

export const FILETYPE_ZIP = "application/x-zip-compressed";
export const FILETYPE_ZIP1 = "application/zip";
export const FILETYPE_DOC = "application/msword";
export const FILETYPE_XLS = "application/xls";
export const FILETYPE_DOCX = "application/docx";
export const FILETYPE_PNG = "image/png";
export const FILETYPE_JPEG = "image/jpeg";
export const FILETYPE_PDF = "application/pdf";
export const ASSOCIATE_DATACLASS_MAPPING = "/dataDefinitionProperty";
export const FOLDERNAME_ARCHIEVE = "/saveFolderName";
export const TEMPLATE_LIST_VIEW = "list";
export const TEMPLATE_GRID_VIEW = "grid";
export const UD_GRAPH_VIEW = "graph";
export const UD_LIST_VIEW = "list";

export const SYSTEM_DEFINED_SCOPE = "S";
export const USER_DEFINED_SCOPE = "E";
export const GLOBAL_SCOPE = "G";
export const LOCAL_SCOPE = "L";
export const TEMPLATE_VARIANT_TYPE = "T";

export const SYSTEM_DEFINED_VARIABLE = "S";
export const SYSTEM_MODIFIABLE_VARIABLE = "M";
export const USER_DEFINED_VARIABLE = "U";
export const COMPLEX_EXTENDED_VARIABLE = "I";
export const CONSTANT_VARIABLE = "C";

export const BTN_TYPE_ADD_ANOTHER = 1;
export const BTN_TYPE_ADD_CLOSE = 2;
export const BTN_TYPE_EDIT_CLOSE = 3;

export const BTN_SHOW = "show";
export const BTN_HIDE = "hide";

export const PREVIOUS_PAGE_LIST = 1;
export const PREVIOUS_PAGE_GRID = 2;
export const PREVIOUS_PAGE_CREATE_FROM_TEMPLATE = 3;
export const PREVIOUS_PAGE_CREATE_FROM_PROCESS = 4;
export const PREVIOUS_PAGE_CREATE_FROM_NO_PROCESS = 5;
export const PREVIOUS_PAGE_NO_PROCESS = 6;
export const PREVIOUS_PAGE_PROCESS = 7;
export const PREVIOUS_PAGE_CREATE_FROM_PROCESSES = 8;

export const NO_CREATE_PROCESS_FLAG = 0;
export const CREATE_PROCESS_FLAG_FROM_PROCESS = 1;
export const CREATE_PROCESS_FLAG_FROM_PROCESSES = 2;
export const CREATE_PROCESS_FLAG_FROM_TEMPLATES = 3;
export const CHECKIN_PROCESS = "CheckIn";
export const CHECKOUT_PROCESS = "CheckOut";
export const UNDOCHECKOUT_PROCESS = "undoCheckOut";

export const OPTION_PRIMARY = 0;
export const OPTION_USER_DEFINED = 1;
export const OPTION_SYSTEM_DEFINED = 2;

export const REGISTRATION_NO = 14;
export const SEQUENCE_NO = 1;

export const MENUOPTION_SAVE_NEW_V = 1;
export const MENUOPTION_SAVE_TEMPLATE = 2;
export const MENUOPTION_SAVE_LOCAL = 3;
export const MENUOPTION_CHECKIN = 4;
export const MENUOPTION_UNDOCHECKOUT = 5;
export const MENUOPTION_CHECKOUT = 6;
export const MENUOPTION_DELETE = 7;
export const MENUOPTION_DISABLE = 8;
export const MENUOPTION_ENABLE = 9;
export const MENUOPTION_DEPLOY = 10;
export const MENUOPTION_PIN = 11;
export const MENUOPTION_UNPIN = 12;
export const MENUOPTION_IMPORT = 13;
export const MENUOPTION_EXPORT = 14;

export const MENUOPTION_CHECKOUT_ACT = 15;
export const MENUOPTION_UNDO_CHECKOUT_ACT = 16;
export const MENUOPTION_CHECKIN_ACT = 17;

export const MENUOPTION_CHECKOUT_LANE = 18;
export const MENUOPTION_UNDO_CHECKOUT_LANE = 19;
export const MENUOPTION_CHECKIN_LANE = 20;

export const MAX_TABS_IN_HEADER = 3;

export const VERSION_TYPE_MINOR = "minor";
export const VERSION_TYPE_MAJOR = "major";

export const SCREENTYPE_TODO = "ToDo";
export const SCREENTYPE_EXCEPTION = "exp";
export const SCREENTYPE_DOCTYPE = "docType";
export const BLANK_DROPDOWN = "3";

export const RECENT_TABLE_CATEGORY = [
  "currentWeek",
  "previousWeek",
  "thisMonth",
  "earlierMonth",
];

export const BATCH_COUNT = 6;
export const EXP_BATCH_COUNT = 7;
export const TODO_BATCH_COUNT = 8;

export const ADD = "ADD";
export const EDIT = "EDIT";
export const DELETE = "DEL";
export const LEVEL1 = "LEVEL1";
export const LEVEL2 = "LEVEL2";
export const LEVEL3 = "LEVEL3";
export const JMSProducerServers = ["JBossEAP", "JTS", "WebLogic", "WebSphere"];
export const VARIABLE_TYPE_OPTIONS = [
  "10",
  "6",
  "3",
  "4",
  "8",
  "12",
  "15",
  "16",
  "17",
  "18",
];

export const REQ_RES_TYPE_OPTIONS = [
  "10",
  "6",
  "3",
  "4",
  "8",
  "12",
  "15",
  "16",
  "17",
  "18",
  "11",
];

export const COMPLEX_VARTYPE = "11";

export const RETURN_TYPE_OPTIONS = [
  "10",
  "6",
  "3",
  "4",
  "8",
  "12",
  "15",
  "16",
  "17",
  "18",
  "0",
];

export const SCOPE_OPTIONS = ["H", "P", "M", "Q", "F"];

export const ENABLED_STATE = "Enabled";
export const DISABLED_STATE = "Disabled";
export const STATE_EDITED = "edited";
export const STATE_ADDED = "added";
export const STATE_CREATED = "created";

export const WEBSERVICESOAP = "WSRC";
export const WEBSERVICEREST = "REST";
export const RESCONSUMERJMS = "WSJMS";
export const RESCONSUMERSOAP = "RSCS";
export const REQUESTCONSUMERSOAP = "RQCS";

export const DEFAULT = "default";

export const EXPORT_DEFINED_TABLE_TYPE = "Defined";
export const EXPORT_EXISTING_TABLE_TYPE = "Existing";
export const EXPORT_DATA_MAPPING_TYPE = "Data";
export const EXPORT_DOCUMENT_MAPPING_TYPE = "Document";
export const EXPORT_PRIMARY_CONSTRAINT_TYPE = "Primary";
export const EXPORT_UNIQUE_CONSTRAINT_TYPE = "Unique";
export const EXPORT_CSV_FILE_TYPE = "1";
export const EXPORT_TEXT_FILE_TYPE = "2";
export const EXPORT_DAT_FILE_TYPE = "3";
export const EXPORT_RES_FILE_TYPE = "4";
export const EXPORT_FIXED_LENGTH_FIELD_TYPE = "1";
export const EXPORT_VARIABLE_LENGTH_FIELD_TYPE = "2";
export const EXPORT_DAILY_FILE_MOVE = "D";
export const EXPORT_WEEKLY_FILE_MOVE = "W";
export const EXPORT_MONTHLY_FILE_MOVE = "M";
export const ENDPOINT_GETAUDITLOG = "/auditTrail";
export const ADD_SYMBOL = "+";

export const SystemWSQueue = "SystemWSQueue";
export const SystemBRMSQueue = "SystemBRMSQueue";
export const SystemDXQueue = "SystemDXQueue";
export const SystemArchiveQueue = "SystemArchiveQueue";
export const SystemPFEQueue = "SystemPFEQueue";
export const SystemSharepointQueue = "SystemSharepointQueue";
export const SystemSAPQueue = "SystemSAPQueue";

export const DATE_FORMAT = "DD/MM/YYYY";
export const TIME_FORMAT = "h:mm A";
export const SEVEN = "7";
export const FIFTEEN = "15";
export const THIRTY = "30";

export const RULES_IF_CONDITION = "If";
export const RULES_ALWAYS_CONDITION = "Always";
export const VARIABLE_RULES_ALWAYS_CONDITION = "ALWAYS";
export const RULES_OTHERWISE_CONDITION = "Otherwise";
export const ADD_OPERATION_SYSTEM_FUNCTIONS = "System";
export const ADD_OPERATION_EXT_FUNCTIONS = "ext#ExtFunctions";
export const ADD_OPERATION_SECONDARY_DBFLAG = "SecondaryDBFlag";
export const ADD_CONDITION_NO_LOGICALOP_VALUE = "3";
export const SECONDARYDBFLAG = "SecondaryDBFlag";
export const SET_OPERATION_TYPE = "1";
export const INC_PRIORITY_OPERATION_TYPE = "8";
export const DEC_PRIORITY_OPERATION_TYPE = "9";
export const TRIGGER_OPERATION_TYPE = "15";
export const COMMIT_OPERATION_TYPE = "16";
export const ASSIGNED_TO_OPERATION_TYPE = "18";
export const SET_PARENT_DATA_OPERATION_TYPE = "19";
export const CALL_OPERATION_TYPE = "22";
export const SET_AND_EXECUTE_OPERATION_TYPE = "23";
export const ESCALATE_TO_OPERATION_TYPE = "24";
export const ESCALATE_WITH_TRIGGER_OPERATION_TYPE = "26";
export const ROUTE_TO_OPERATION_TYPE = "4";
export const REINITIATE_OPERATION_TYPE = "10";
export const ROLLBACK_OPERATION_TYPE = "17";
export const AUDIT_OPERATION_TYPE = "25";
export const DISTRIBUTE_TO_OPERATION_TYPE = "21";
export const REMINDER_OPERATION_TYPE = "39";
export const SET_READY_OPERATION_TYPE = "101";
export const MANDATORY_OPERATION_TYPE = "102";
export const OPTIONAL_OPERATION_TYPE = "103";
export const AUTO_INITIATE_OPERATION_TYPE = "104";
export const SUBMIT_OPERATION_TYPE = "13";
export const RAISE_OPERATION_TYPE = "5";
export const CLEAR_OPERATION_TYPE = "6";
export const RESPONSE_OPERATION_TYPE = "25";
export const RELEASE_OPERATION_TYPE = "14";

export const DATA_TYPE_RULE_COND = "V";
export const DOC_TYPE_RULE_COND = "D";
export const TASK_TYPE_RULE_COND = "T";

export const STRING_VARIABLE_TYPE = 10;
export const BOOLEAN_VARIABLE_TYPE = 12;
export const DATE_VARIABLE_TYPE = 8;
export const INTEGER_VARIABLE_TYPE = 3;
export const FLOAT_VARIABLE_TYPE = 6;
export const LONG_VARIABLE_TYPE = 4;
export const SHORT_DATE_VARIABLE_TYPE = 15;

export const INSERTION_ORDER_ID = "InsertionOrderId";
export const MAP_ID = "MapID";
export const CONSTRAINT_TYPE_PRIMARY = "Primary";
export const CONSTRAINT_TYPE_UNIQUE = "Unique";
export const VARDOC_LIST = "/varAndDocList";
export const ADD_OPTION = 0;
export const EDIT_OPTION = 1;

export const ENDPOINT_QUEUEASSOCIATION_GROUPLIST = "/groupList";
export const ENDPOINT_QUEUELIST = "/queueData";
export const ENDPOINT_QUEUEASSOCIATION_MODIFY = "/modifyQueueData";
export const ENDPOINT_QUEUEASSOCIATION_DELETE = "/deleteQueueData";
export const SAVE_QUEUEDATA = "/saveQueueData";
export const ENDPOINT_SAP_FUNCTION = "/sapFunction";
export const ENDPOINT_REGISTER_SAP = "/registerSapDetails";
export const ENDPOINT_SAVE_FUNCTION_SAP = "/saveSapFunction";
export const ENDPOINT_ADD_SAP_DEF = "/sapDefinition";
export const ENDPOINT_SAP_DETAIL = "/sapDetail";
export const ENDPOINT_ADD_METHOD = "/methods/ADDREMPAU";
export const ENDPOINT_SAP_FUNCTION_METHOD = "/methods?busObjName=";

export const CONST_XML = "XML";
export const CONST_XPDL = "XPDL 2.2";
export const CONST_BPMN = "BPMN 2.0";
export const CONST_BPEL = "BPEL";

export const Y_FLAG = "Y";
export const N_FLAG = "N";
export const FORWARD_MAPPING = "F";
export const REVERSE_MAPPING = "R";
export const SPACE = " ";
export const EQUAL_TO = "=";
export const PERCENTAGE_SYMBOL = "%";

export const READ_RIGHT = "R";
export const MODIFY_RIGHT = "O";
export const OPTION_VALUE_1 = "1";
export const OPTION_VALUE_2 = "2";

export const SYNCHRONOUS = "S";
export const RULE_TYPE = "R";
export const ATTACHMENT_TYPE = "A";

export const propertiesLabel = {
  basicDetails: "BasicDetails",
  EntrySetting: "EntrySetting",
  EntryDetails: "EntryDetails",
  requirements: "Requirements",
  attachments: "Attachments",
  templates: "templates",
  dataFields: "dataFields",
  initialRules: "initialRules",
  workdesk: "workdesk",
  registration: "registration",
  eventConfiguration: "eventConfiguration",
  fwdVarMapping: "fwdVarMapping",
  revVarMapping: "revVarMapping",
  fwdVarMappingProcessTask: "fwdVarMappingProcessTask",
  revVarMappingProcessTask: "revVarMappingProcessTask",
  streams: "streams",
  options: "options",
  throwEvents: "throwEvents",
  catchEvents: "catchEvents",
  task: "task",
  archieve: "archieve",
  receive: "receive",
  outputVariables: "outputVariables",
  Export: "Export",
  searchVariables: "searchVariables",
  searchResults: "searchResults",
  webService: "webService",
  businessRule: "businessRule",
  archive: "archive",
  message: "message",
  entryDetails: "entryDetails",
  jmsProducer: "jmsProducer",
  jmsConsumer: "jmsConsumer",
  timer: "timer",
  reminder: "reminder",
  distribute: "distribute",
  routingCriteria: "routingCriteria",
  initiateWorkstep: "initiateWorkstep",
  dataExchange: "dataExchange",
  sap: "sap",
  resConJMS: "resConJMS",
  resConSOAP: "resConSOAP",
  reqConSOAP: "reqConSOAP",
  Restful: "Restful",
  fwdDocMapping: "fwdDocMapping",
  fwdDocMappingProcessTask: "fwdDocMapping_ProcessTask",
  revDocMapping: "revDocMapping",
  revDocMappingProcessTask: "revDocMapping_ProcessTask",
  collect: "collect",
  send: "send",
  taskDetails: "taskDetails",
  escalationRules: "escalationRules",
  taskOptions: "taskOptions",
  taskData: "taskData",
  sharePointArchive: "sharepoint_Archive",
};

//added keys for headings in tabs
export const tabsHeading = {
  1: "basicDetails",
  2: "dataFields",
  3: "initialRules",
  4: "requirements",
  5: "attachments",
  6: "workDesk",
  3: "initialRules",
  4: "requirements",
  5: "attachments",
  6: "Workdesk",
  7: "",
  8: "",
  9: "ForwardVariableMapping",
  10: "ReverseVariableMapping",
  11: "entrySettings",
  12: "streams",
  13: "options",
  14: "",
  15: "",
  16: "task",
  17: "receiveInvocation",
  18: "outputVariables",
  19: "export",
  20: "searchVariables",
  21: "searchResults",
  22: "webService",
  23: "businessRule",
  24: "archive",
  25: "templates",
  26: "message",
  27: 11,
  28: "jmsProducer",
  29: "jmsConsumer",
  30: "timer",
  31: "reminder",
  32: "distribute",
  33: "collect",
  34: 11,
  35: "varMapping",
  36: "dataExchange",
  37: "SAP",
  38: "resConsumerJms",
  39: 13,
  40: "reqConsumerSoap",
  41: "restful",
  42: "ForwardDocTypeMapping",
  43: "ReverseDocTypeMapping",
  44: "send",
  45: "TaskDetails",
  46: "EscalationRule(s)",
  47: 13,
  48: "data",
  49: 24,
  50: 42,
  51: 43,
  52: "DocMapping",
  53: "routingCriteria",
};

export const WEBSERVICE_SOAP = "0";
export const WEBSERVICE_REST = "1";
export const WEBSERVICE_REST_MANUAL = "M";
export const WEBSERVICE_REST_LOAD = "L";

export const ERROR_MANDATORY = 0;
export const ERROR_MAX_LENGTH = 1;
export const ERROR_MIN_LENGTH = 2;
export const ERROR_RANGE = 3;
export const ERROR_INCORRECT_FORMAT = 4;
export const ERROR_INCORRECT_VALUE = 5;
export const ERROR_SPACE_ALLOWED = 6;

export const NO_AUTH = "NoAuthentication";
export const BASIC_AUTH = "BasicAuthentication";
export const TOKEN_BASED_AUTH = "TokenBasedAuthentication";
export const DOMAIN_DROPDOWN = ["BPM", "ECM", "CCM", "BRMS", "SAP", "AI_CLOUD"];
export const OPERATION_DROPDOWN = ["GET", "PUT", "POST", "DELETE"];
export const AUTH_TYPE_DROPDOWN = [NO_AUTH, BASIC_AUTH, TOKEN_BASED_AUTH];
export const MEDIA_TYPE_DROPDOWN = ["X", "J", "P", "T", "N"];

export const TOKEN_TYPE_DROPDOWN = ["I", "O", "T"];

export const DEFINE_PARAM = 1;
export const DEFINE_REQUEST_BODY = 2;
export const DEFINE_RESPONSE_BODY = 3;
export const DEFINE_AUTH_DETAILS = 4;

export const DEFAULT_GLOBAL_ID = 0;
export const DEFAULT_GLOBAL_TYPE = "L";
export const DELETE_CONSTANT = "D";
export const ADD_CONSTANT = "I";
export const MODIFY_CONSTANT = "U";
export const mandatoryColumns = [
  "ExportDataId",
  "ProcessDefId",
  "ActivityId",
  "ProcessInstanceId",
  "WorkitemId",
  "EntryDateTime",
  "ExportedDateTime",
  "LockedByName",
  "LockedTime",
  "LockStatus",
  "Status",
  "ExportFileName",
  "ExportFileDateTime",
  "SequenceNumber",
];

export const ENDPOINT_GET_TASK_PROPERTY = "/taskProperty";
export const ENDPOINT_ADD_GLOBAL_TEMPLATE = "/addGlobalTemplate";
export const ENDPOINT_SAVE_TASK_PROPERTY = "/saveTaskProperty";
export const ENDPOINT_UPDATE_GLOBAL_TEMPLATE = "/updateGlobalTemplate";
export const ENDPOINT_DELETE_TASK_FORM = "/deleteTaskform";
export const ENDPOINT_DELETE_GLOBAL_TEMPLATE = "/deleteGlobalTemplate";
export const STATUS_TYPE_ADDED = "S";
export const STATUS_TYPE_TEMP = "T";

export const toDoActivities = [
  { activityId: 1, subActivityId: 1 },
  { activityId: 1, subActivityId: 3 },
  { activityId: 11, subActivityId: 1 },
  { activityId: 10, subActivityId: 3 },
  { activityId: 10, subActivityId: 7 },
  { activityId: 3, subActivityId: 1 },
  { activityId: 2, subActivityId: 1 },
  { activityId: 2, subActivityId: 2 },
  { activityId: 32, subActivityId: 1 },
];

export const invalidTodoActivities = [
  { activityId: 18, subActivityId: 1 },
  { activityId: 1, subActivityId: 2 },
  { activityId: 26, subActivityId: 1 },
  { activityId: 10, subActivityId: 1 },
  { activityId: 20, subActivityId: 1 },
  { activityId: 22, subActivityId: 1 },
  { activityId: 31, subActivityId: 1 },
  { activityId: 10, subActivityId: 4 },
  { activityId: 33, subActivityId: 1 },
  { activityId: 27, subActivityId: 1 },
  { activityId: 19, subActivityId: 1 },
  { activityId: 21, subActivityId: 1 },
  { activityId: 5, subActivityId: 1 },
  { activityId: 6, subActivityId: 1 },
  { activityId: 5, subActivityId: 2 },
  { activityId: 6, subActivityId: 2 },
  { activityId: 7, subActivityId: 1 },
  { activityId: 34, subActivityId: 1 },
  { activityId: 30, subActivityId: 1 }, // code added on 11 Oct 2022 for BugId 116576
];

export const restrictedTodoActivities = [
  { activityType: 2, subActivity: 1 },
  { activityType: 2, subActivity: 2 },
  { activityType: 3, subActivity: 1 },
  { activityType: 11, subActivity: 1 },
];

export const userRightsMenuNames = {
  saveProcess: "SAVEPROCESS",
  version: "VERSION",
  auditTrail: "AUDITRAIL",
  includeWindow: "INCLUDEWINDOW",
  todoList: "TODOLIST",
  documents: "DOCUMENTS",
  catalogDefinition: "CATLOGDEFINATION",
  exception: "EXCEPTION",
  trigger: "TRIGGER",
  registerTemplate: "REGISTERTEMPLATE",
  registerWindow: "REGISTERWINDOW",
  registerTrigger: "RIGSTERTRIGGER",
  constants: "CONSTANTS",
  defineTable: "DEFINETABLE",
  externalVariable: "EXTERNALVARIABLE",
  complexTypes: "COMPLEXTYPES",
  queueVariables: "QUEUEVARIABLES",
  searchVariables: "SEARCHVARIABLES",
  createProject: "CREATEPROJECT",
  deleteProject: "DELETEPROJECT",
  createProcess: "CREATEPROCESS",
  deleteProcess: "DELETEPROCESS",
  registerProcess: "REGISTERPROCESS",
  importProcess: "IMPORTPROCESS",
  exportProcess: "EXPORTPROCESS",
  reportGeneration: "REPORTGENERATION",
  createMilestone: "CREATEMILESTONE",
  deleteMilestone: "DELETEMILESTONE",
  modifyMilestone: "MODIFYMILESTONE",
  addActivity: "ADDACTIVITY",
  deleteActivity: "DELETEACTIVITY",
  modifyActivity: "MODIFYACTIVITY",
  createSwimlane: "CREATESWIMLANE",
  deleteSwimlane: "DELETESWIMLANE",
  modifySwimlane: "MODIFYSWIMLANE",
  manageForm: "MANAGEFORM",
  viewForm: "VIEWFORM",
  importBusinessObject: "IMPORTBUSINESSOBJECT",
  queueManagement: "QUEUEMANAGEMENT",
  makerChecker: "MAKERCHECKER",
  addQueue: "ADDQUEUE",
  defineVarAlias: "DEFINEVARALIAS",
  createApplication: "CREATEAPPLICATION",
  importApplication: "IMPORTAPPLICATION",
  createSurvey: "CREATESURVEY",
};

//Regex
export const ALPHANUMERIC_REGEX_UNIVERSAL =
  /^([a-zA-Z0-9\u0600-\u06FF\u0660-\u0669\u06F0-\u06F9 _.-]+)$/;

export const ENDPOINT_IMPORT_SECTION = "/importSection";
export const ENDPOINT_LOGOUT = "/user/logout";
export const ENDPOINT_VALIDATE_QUERY = "/validateQueryString";

export const Restricted_Names = [
  "QUEUENAME",
  "INDEX",
  "ADD",
  "ABS",
  "BOTH",
  "COMMIT",
  "ALL",
  "BY",
  "CONDITION",
  "ALLOCATE",
  "CALL",
  "CONNECT",
  "ALTER",
  "CALLED",
  "CONSTRAINT",
  "AND",
  "CARDINALITY",
  "CONVERT",
  "ANY",
  "CASCADED",
  "CORR",
  "ARE",
  "CASE",
  "CORRESPONDING",
  "ARRAY",
  "CAST",
  "COUNT",
  "AS",
  "CEIL",
  "COVAR_POP",
  "ASENSITIVE",
  "CEILING",
  "COVAR_SAMP",
  "ASYMMETRIC",
  "CHAR",
  "CREATE",
  "AT",
  "CHAR_LENGTH",
  "CROSS",
  "ATOMIC",
  "CHARACTER",
  "CUBE",
  "AUTHORIZATION",
  "CHARACTER_LENGTH",
  "CUME_DIST",
  "AVG",
  "CHECK",
  "CURRENT",
  "BEGIN",
  "CLOB",
  "CURRENT_CATALOG",
  "BETWEEN",
  "CLOSE",
  "CURRENT_DATE",
  "BIGINT",
  "COALESCE",
  "CURRENT_DEFAULT_TRANSFORM_GROUP",
  "BINARY",
  "COLLATE",
  "CURRENT_PATH",
  "BLOB",
  "COLLECT",
  "CURRENT_ROLE",
  "BOOLEAN",
  "COLUMN",
  "CURRENT_SCHEMA",
  "CURRENT_TIME",
  "END",
  "GROUP",
  "CURRENT_TIMESTAMP",
  "END-EXEC",
  "GROUPING",
  "CURRENT_TRANSFORM_GROUP_FOR_TYPE",
  "ESCAPE",
  "HAVING",
  "CURRENT_USER",
  "EVERY",
  "HOLD",
  "CURSOR",
  "EXCEPT",
  "HOUR",
  "CYCLE",
  "EXEC",
  "IDENTITY",
  "DATE",
  "EXECUTE",
  "IN",
  "DAY",
  "EXISTS",
  "INDICATOR",
  "DEALLOCATE",
  "EXP",
  "INNER",
  "DEC",
  "EXTERNAL",
  "INOUT",
  "DECIMAL",
  "EXTRACT",
  "INSENSITIVE",
  "DECLARE",
  "FALSE",
  "INSERT",
  "DEFAULT",
  "FETCH",
  "INT",
  "DELETE",
  "FILTER",
  "INTEGER",
  "DENSE_RANK",
  "FLOAT",
  "INTERSECT",
  "DEREF",
  "FLOOR",
  "INTERSECTION",
  "DESCRIBE",
  "FOR",
  "INTERVAL",
  "DETERMINISTIC",
  "FOREIGN",
  "INTO",
  "DISCONNECT",
  "FREE",
  "IS",
  "DISTINCT",
  "FROM",
  "JOIN",
  "DOUBLE",
  "FULL",
  "LANGUAGE",
  "DROP",
  "FUNCTION",
  "LARGE",
  "DYNAMIC",
  "FUSION",
  "LATERAL",
  "EACH",
  "GET",
  "LEADING",
  "ELEMENT",
  "GLOBAL",
  "LEFT",
  "ELSE",
  "GRANT",
  "LIKE",
  "LIKE_REGEX",
  "NORMALIZE",
  "POWER",
  "LN",
  "NOT",
  "PRECISION",
  "LOCAL",
  "NULL",
  "PREPARE",
  "LOCALTIME",
  "NULLIF",
  "PRIMARY",
  "LOCALTIMESTAMP",
  "NUMERIC",
  "PROCEDURE",
  "LOWER",
  "OCCURRENCES_REGEX",
  "RANGE",
  "MATCH",
  "OCTET_LENGTH",
  "RANK",
  "MAX",
  "OF",
  "READS",
  "MEMBER",
  "OLD",
  "REAL",
  "MERGE",
  "ON",
  "RECURSIVE",
  "METHOD",
  "ONLY",
  "REF",
  "MIN",
  "OPEN",
  "REFERENCES",
  "MINUTE",
  "OR",
  "REFERENCING",
  "MOD",
  "ORDER",
  "REGR_AVGX",
  "MODIFIES",
  "OUT",
  "REGR_AVGY",
  "MODULE",
  "OUTER",
  "REGR_COUNT",
  "MONTH",
  "OVER",
  "REGR_INTERCEPT",
  "MULTISET",
  "OVERLAPS",
  "REGR_R2",
  "NATIONAL",
  "OVERLAY",
  "REGR_SLOPE",
  "NATURAL",
  "PARAMETER",
  "REGR_SXX",
  "NCHAR",
  "PARTITION",
  "REGR_SXY",
  "NCLOB",
  "PERCENT_RANK",
  "REGR_SYY",
  "NEW",
  "PERCENTILE_CONT",
  "RELEASE",
  "NIL",
  "PERCENTILE_DISC",
  "RESULT",
  "NO",
  "POSITION",
  "RETURN",
  "NONE",
  "POSITION_REGEX",
  "RETURNS",
  "REVOKE",
  "START",
  "TRUE",
  "RIGHT",
  "STATIC",
  "UESCAPE",
  "ROLLBACK",
  "STDDEV_POP",
  "UNION",
  "ROLLUP",
  "STDDEV_SAMP",
  "UNIQUE",
  "ROW",
  "SUBMULTISET",
  "UNKNOWN",
  "ROW_NUMBER",
  "SUBSTRING",
  "UNNEST",
  "ROWS",
  "SUBSTRING_REGEX",
  "UPDATE",
  "SAVEPOINT",
  "SUM",
  "UPPER",
  "SCOPE",
  "SYMMETRIC",
  "USER",
  "SCROLL",
  "SYSTEM",
  "USING",
  "SEARCH",
  "SYSTEM_USER",
  "VALUE",
  "SECOND",
  "TABLE",
  "VALUES",
  "SELECT",
  "TABLESAMPLE",
  "VAR_POP",
  "SENSITIVE",
  "THEN",
  "VAR_SAMP",
  "SESSION_USER",
  "TIME",
  "VARBINARY",
  "SET",
  "TIMESTAMP",
  "VARCHAR",
  "SIMILAR",
  "TIMEZONE_HOUR",
  "VARYING",
  "SMALLINT",
  "TIMEZONE_MINUTE",
  "WHEN",
  "SOME",
  "TO",
  "WHENEVER",
  "SPECIFIC",
  "TRAILING",
  "WHERE",
  "SPECIFICTYPE",
  "TRANSLATE",
  "WIDTH_BUCKET",
  "SQL",
  "TRANSLATE_REGEX",
  "WINDOW",
  "SQLEXCEPTION",
  "TRANSLATION",
  "WITH",
  "SQLSTATE",
  "TREAT",
  "WITHIN",
  "SQLWARNING",
  "TRIGGER",
  "WITHOUT",
  "SQRT",
  "TRIM",
  "YEAR",
  "ExportDataId",
  "ProcessDefId",
  "ActivityId",
  "ProcessInstanceId",
  "WorkitemId",
  "EntryDateTime",
  "ExportedDateTime",
  "LockedByName",
  "LockedTime",
  "LockStatus",
  "Status",
  "ExportFileName",
  "SAVE",
  "ExportFileDateTime",
  "ActivityName",
  "CalendarName",
  "CreatedByName",
  "CreatedDateTime",
  "EntryDateTime",
  "CurrentDateTime",
  "HoldStatus",
  "InstrumentStatus",
  "IntroducedBy",
  "IntroductionDateTime",
  "IntroducedAt",
  "PreviousStage",
  "ProcessInstanceState",
  "PriorityLevel",
  "SaveStage",
  "ProcessedBy",
  "ValidTillDateTime",
  "TurnAroundDateTime",
  "Status",
  "WorkItemId",
  "WorkItemState",
  "WorkItemName",
  "comment",
  "UID",
  "Createdby",
  "Introducedbyid",
  "ExpectedProcessDelay",
  "VAR_INT1",
  "VAR_INT2",
  "VAR_INT3",
  "VAR_INT4",
  "VAR_INT5",
  "VAR_INT6",
  "VAR_INT7",
  "VAR_INT8",
  "VAR_FLOAT1",
  "VAR_FLOAT2",
  "VAR_DATE1",
  "VAR_DATE2",
  "VAR_DATE3",
  "VAR_DATE4",
  "VAR_DATE5",
  "VAR_DATE6",
  "VAR_LONG1",
  "VAR_LONG2",
  "VAR_LONG3",
  "VAR_LONG4",
  "VAR_LONG5",
  "VAR_LONG6",
  "VAR_STR1",
  "VAR_STR2",
  "VAR_STR3",
  "VAR_STR4",
  "VAR_STR5",
  "VAR_STR6",
  "VAR_STR7",
  "VAR_STR8",
  "VAR_STR9",
  "VAR_STR10",
  "VAR_STR11",
  "VAR_STR12",
  "VAR_STR13",
  "VAR_STR14",
  "VAR_STR15",
  "VAR_STR16",
  "VAR_STR17",
  "VAR_STR18",
  "VAR_STR19",
  "VAR_STR20",
  "VAR_REC_1",
  "VAR_REC_2",
  "VAR_REC_3",
  "VAR_REC_4",
  "VAR_REC_5",
  "CheckListCompleteFlag",
  "ReferredTo",
  "ReferredToName",
  "ReferredBy",
  "ReferredByName",
  "ChildProcessInstanceId",
  "ChildWorkitemId",
  "ParentWorkItemID",
  "ProcessName",
  "ProcessVersion",
  "LastProcessedBy",
  "AssignmentType",
  "CollectFlag",
  "ValidTill",
  "Q_StreamId",
  "Q_QueueId",
  "Q_UserId",
  "AssignedUser",
  "FilterValue",
  "Statename",
  "ExpectedWorkitemDelay",
  "RoutingStatus",
  "Queuetype",
  "NotifyStatus",
  "Guid",
  "NoOfCollectedInstances",
  "IsPrimaryCollected",
  "ExportStatus",
  "ProcessVariantId",
  "Q_DivertedByUserId",
  "ActivityType",
  "lastModifiedTime",
  "Number",
  "URN",
  "public",
];

export const COMPLEX = "complex";
export const VAR_TYPE = "variableType";

export const hideComplexFromVariables = true;
export const ARABIC_LOCALE = "ar";
export const ARABIC_SA_LOCALE = "ar_SA";
export const ENGLISH_US_LOCALE = "en_US";
export const ENGLISH_LOCALE = "en";

export const ARABIC_REGEX1 = "[&*\\|:\"'<>?/]+"; // Regex to check if the string has special characters &*|\:"'<>?/
export const ENGLISH_REGEX1 = "^[A-Za-z][^&*|\\:\"'<>?/]*$"; // Regex to check if the string starts with an alphabet only and does not contain special characters &*|\:"'<>?/
export const ARABIC_REGEX2 = "[~`!@#$%^&*()+={[}\\]|\\:;\"'<>,.?]+"; // Regex to check if the string has special characters ~`!@#$%^&*()+={}[]|";'<>?,
export const ENGLISH_REGEX2 = "^[A-Za-z][A-Za-z0-9_:./\\\\]*$"; // Regex to check if the string string starts with an alphabet and contains only alphabets, numerals, underscore, hyphen, decimal point, colon, forward slash, and backslash. ==>> /^[A-Za-z][A-Za-z0-9_\-:./]*$/
export const ARABIC_REGEX3 = "[~`!@#$%^&*()-+={}[]|\\:\";'<>?,./]+"; // Regex to check if the string has special characters ~`!@#$%^&*()-+={}[]|\:";'<>?,./ ==>> [~`!@#$%^&*()\-\+={}[\]|\\:\";'<>?,./]+
export const ENGLISH_REGEX3 = "^(?!#|d)[A-Za-z0-9_]*$"; // Regex to check if the string not starts with # or any number and can have alphabets numbers and _ only ==>> ^(?!#|\d)[A-Za-z0-9_]*$
export const ARABIC_REGEX4 = "[&*|\\:\"'<>?/]+"; // Regex to check if the string has special characters &*|\:"'<>?/
export const ENGLISH_REGEX4 = "^[A-Za-z][^\\/:*?\"<>|'&]*$"; //  Regex to check if the string starts with an alphabet only and does not contain special characters \/:*?"<>|'& ==>> ^[A-Za-z][^\\/:*?\"<>|'&]*$
export const ENDPOINT_CHECK_ARTIFACTS_RIGHTS = "/checkArtifactRights";

export const OMNIAPP_BASEURL = "/oap-rest/app";
export const ENDPOINT_USER_DATA = SERVER_URL_LAUNCHPAD + "/users";
export const ENDPOINT_IMPORT_PROCESS = "/importProcess";
export const ENDPOINT_EXPORT_PROCESS = "/exportProcess";
export const ENDPOINT_EDIT_TEMPLATE = "/editTemplate";
export const ENDPOINT_RENAME_PROJECT = "/renameProject";
export const ENDPOINT_DOWNLOAD = "/download";
export const ENDPOINT_REGISTER_TEMPLATE_MULTILINGUAL =
  "/registerTemplate/multilingual";
export const ENDPOINT_IMPORT_TASK_TEMPLATE = "/importTaskTemplate";
export const ENDPOINT_TASK_FORM = "/taskform";
export const ENDPOINT_TASK_TEMPLATE_FORM = "/tasktemplateform";

//AI related endpoints
export const ENDPOINT_AI_PROCESS_CONTEXT = "/st/process";
export const ENDPOINT_AI_PROMPT_HISTORY =
  ENDPOINT_AI_PROCESS_CONTEXT + "/previews";
export const ENDPOINT_ACTIVITY = "/activity";
export const ENDPOINT_DOCUMENTS = "/documents";
export const ENDPOINT_DATAOBJECTS = "/dataObjects";
export const ENDPOINT_TODOS = "/todos";
export const ENDPOINT_EXCEPTIONS = "/exceptions";
export const ENDPOINT_VARIABLE = "/variable";
export const BRAND_LOGOS = "/branding";
export const CONST_N = "N";
export const CONST_Y = "Y";
export const ENDPOINT_COMPLEX_VARIABLE = "/complexVariable";
