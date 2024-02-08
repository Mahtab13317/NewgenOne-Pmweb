//size of each box in grid
export const graphGridSize = 15;
export const gridSize = 2 * graphGridSize;
export const tasklaneName = "tasklaneName";
export const swimlaneName = "swimlaneName";
export const milestoneName = "milestoneName";
export const AddVertexType = "A";
export const MoveVertexType = "M";
export const restrictedNames = [tasklaneName];
export const maxLabelCharacter = 30;
export const minLabelCharacter = 1;
export const graphMinDimension = { w: 1500, h: 1500 };
export const swimlaneTitleSize = 2 * graphGridSize + "";
export const swimlaneTitleWidth = 2 * graphGridSize;
export const milestoneTitleWidth = 2 * graphGridSize;
export const tasklaneTitleWidth = 2 * graphGridSize;
export const minSwimlaneWidth = 6 * graphGridSize;
export const minSegmentWidth = 16 * graphGridSize;
export const minSwimlaneHeight = 10 * graphGridSize;
export const defaultHeightSwimlane = 16 * graphGridSize;
export const defaultHeightTasklane = 10 * graphGridSize;
export const defaultWidthSwimlane = 40 * graphGridSize;
export const defaultWidthMilestone = 24 * graphGridSize;
//size of each vertex
export const cellSize = { w: 2 * graphGridSize, h: 2 * graphGridSize };
export const defaultSpaceBetweenCell = 8 * graphGridSize;
export const gridBackgroundColor = "rgba(236, 239, 241, 0.7)";
//points from where grid should start, x is given value other than 0 to leave space for toolbox
export const gridStartPoint = { x: 2 * graphGridSize, y: 0 };
export const widthForDefaultVertex = 6 * graphGridSize;
export const heightForDefaultVertex = 4 * graphGridSize;
export const expandedViewWidth = 32 * graphGridSize;
export const expandedViewHeight = 14 * graphGridSize;
export const groupboxWidth = 22 * graphGridSize;
export const groupboxHeight = 8 * graphGridSize;
export const commentWidth = 14 * graphGridSize;
export const commentHeight = 4 * graphGridSize;
export const showGrid = true;
export const maxEmbeddedActCount = 10;
// modified on 27/10/23 for BugId 140242
// export const minWidthSpace = 3 * gridSize;
export const minWidthSpace = gridSize;
//style name of each type of activity
export const style = {
  expandedEmbeddedProcess: "expandedEmbeddedProcess",
  embStartEvent: "embStartEvent",
  embEndEvent: "embEndEvent",
  swimlane: "swimlane",
  swimlane_collapsed: "swimlane_collapsed",
  tasklane: "tasklane",
  tasklane_collapsed: "tasklane_collapsed",
  milestone: "milestone",
  newTask: "newTask",
  processTask: "processTask",
  taskTemplate: "taskTemplate",
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
  responseConsumerJMS: "responseConsumerJMS",
  responseConsumerSOAP: "responseConsumerSOAP",
  requestConsumerSOAP: "requestConsumerSOAP",
  restful: "restful",
};

//size of icons
export const smallIconSize = { w: 12, h: 12 };
export const rootId = "rootLayer";
export const TASK_TEMPLATES_HEAD = "toolbox.taskTemplates.head";
export const SUBPROCESS_TEMPLATES_HEAD = "toolbox.subprocessTemplates.head";
export const SUBPROCESS_TEMPLATES_TITLE =
  "toolbox.description.embeddedSubprocess";

//vertex which cannot have incoming edges
export const startVertex = [
  style.startEvent,
  style.conditionalStart,
  style.receive,
  style.query,
  style.event,
  style.embStartEvent,
];

//vertex which cannot have outgoing edges
export const endVertex = [
  style.query,
  style.endEvent,
  style.terminate,
  style.messageEnd,
  style.textAnnotations,
  style.dataObject,
  style.message,
  style.embEndEvent,
];

//vertex which can have only 1 outgoing edge
export const limitOutgoingEdges = [
  style.startEvent,
  style.conditionalStart,
  style.subProcess,
  style.callActivity, //code added on 10 Sep 2022 for Bug 115378
  style.workdesk,
  style.robotWorkdesk,
  style.caseWorkdesk,
  style.receive,
  style.reply,
  style.email,
  style.export,
  style.webService,
  style.responseConsumerJMS,
  style.responseConsumerSOAP,
  style.requestConsumerSOAP,
  style.restful,
  style.businessRule,
  style.sapAdapter,
  style.dmsAdapter,
  style.omsAdapter,
  style.event,
  style.jmsProducer,
  style.jmsConsumer,
  style.timerEvents,
  style.inclusiveCollect,
  style.parallelCollect,
  style.dataExchange,
  style.embStartEvent,
  style.subProcess,
  style.expandedEmbeddedProcess,
];

//vertex which can have only 1 incoming edge
export const limitIncomingEdges = [
  style.textAnnotations,
  style.dataObject,
  style.message,
  style.subProcess,
  style.expandedEmbeddedProcess,
];

//vertex which will be square in shape
export const defaultShapeVertex = [
  style.subProcess,
  style.callActivity,
  style.workdesk,
  style.caseWorkdesk,
  style.receive,
  style.reply,
  style.email,
  style.export,
  style.query,
  style.dataExchange,
  style.webService,
  style.responseConsumerJMS,
  style.responseConsumerSOAP,
  style.requestConsumerSOAP,
  style.restful,
  style.dmsAdapter,
  style.omsAdapter,
  style.sapAdapter,
  style.sharePoint,
  style.robotWorkdesk,
  style.businessRule,
  style.newTask,
  style.processTask,
  style.taskTemplate,
];

export const artifacts = [
  style.textAnnotations,
  style.dataObject,
  style.message,
  style.groupBox,
];

export const activitiesNotAllowedInEmbedded = [
  style.startEvent,
  style.embStartEvent,
  style.conditionalStart,
  style.messageStart,
  style.timerStart,
  style.subProcess,
  style.callActivity,
  style.endEvent,
  style.embEndEvent,
  style.terminate,
  style.messageEnd,
];

export const gateways = [
  style.inclusiveCollect,
  style.inclusiveDistribute,
  style.parallelCollect,
  style.parallelDistribute,
  style.dataBasedExclusive,
];
