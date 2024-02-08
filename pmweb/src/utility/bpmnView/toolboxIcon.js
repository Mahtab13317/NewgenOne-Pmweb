import { style, TASK_TEMPLATES_HEAD } from "../../Constants/bpmnView";
import {
  activityType,
  activityType_label,
  TaskType,
  taskType_label,
} from "../../Constants/appConstants";

import startEventIcon from "../../assets/bpmnViewIcons/StartEvent.svg";
import conditionalStartIcon from "../../assets/bpmnViewIcons/ConditionalStart.svg";
import messageStartIcon from "../../assets/bpmnViewIcons/MessageStart.svg";
import timerStartIcon from "../../assets/bpmnViewIcons/TimerStart.svg";
import subProcessIcon from "../../assets/bpmnViewIcons/EmbeddedSubprocess.svg";
import callActivityIcon from "../../assets/bpmnViewIcons/CallActivity.svg";
import caseWorkdeskIcon from "../../assets/bpmnViewIcons/CaseWorkdesk.svg";
import receiveIcon from "../../assets/bpmnViewIcons/Receive.svg";
import replyIcon from "../../assets/bpmnViewIcons/Reply.svg";
import emailIcon from "../../assets/bpmnViewIcons/Email.svg";
import exportIcon from "../../assets/bpmnViewIcons/Export.svg";
import queryIcon from "../../assets/bpmnViewIcons/Query.svg";
import workdeskIcon from "../../assets/bpmnViewIcons/Workdesk.svg";
import eventIcon from "../../assets/bpmnViewIcons/Event.svg";
import jmsConsumerIcon from "../../assets/bpmnViewIcons/JMSConsumer.svg";
import jmsProducerIcon from "../../assets/bpmnViewIcons/JMSProducer.svg";
import timerEventIcon from "../../assets/bpmnViewIcons/TimerEvent.svg";
import exclusiveGatewayIcon from "../../assets/bpmnViewIcons/DataBasedExclusive.svg";
import inclusiveCollectIcon from "../../assets/bpmnViewIcons/InclusiveCollect.svg";
import inclusiveGatewayIcon from "../../assets/bpmnViewIcons/InclusiveDistribute.svg";
import parallelGatewayIcon from "../../assets/bpmnViewIcons/ParallelDistribute.svg";
import parallelCollectIcon from "../../assets/bpmnViewIcons/ParallelCollect.svg";
import endEventIcon from "../../assets/bpmnViewIcons/EndEvent.svg";
import messageEndIcon from "../../assets/bpmnViewIcons/MessageEnd.svg";
import terminateIcon from "../../assets/bpmnViewIcons/TerminateEvent.svg";
import robotWorkdeskIcon from "../../assets/bpmnViewIcons/RobotWorkdesk.svg";
import sapAdapterIcon from "../../assets/bpmnViewIcons/SAP.svg";
import omsAdapterIcon from "../../assets/bpmnViewIcons/OMSAdapter.svg";
import webServiceIcon from "../../assets/bpmnViewIcons/Webservices.svg";
import businessRuleIcon from "../../assets/bpmnViewIcons/BusinessRule.svg";
import dmsAdapterIcon from "../../assets/bpmnViewIcons/DMSAdapter.svg";
import dataExchangeIcon from "../../assets/bpmnViewIcons/DataExchange.svg";
import integrationPointsIcon from "../../assets/bpmnViewIcons/DataExchangeHead.svg";
import activityIcon from "../../assets/bpmnViewIcons/ActivitiesHead.svg";
import startHeadIcon from "../../assets/bpmnViewIcons/StartEventHead.svg";
import intermediateEventIcon from "../../assets/bpmnViewIcons/IntermediateEventsHead.svg";
import decisionIcon from "../../assets/bpmnViewIcons/GatewaysHead.svg";
import endHeadIcon from "../../assets/bpmnViewIcons/EndEventHead.svg";
import taskTemplateIcon from "../../assets/bpmnViewIcons/TaskTemplate.svg";
import artefactsIcon from "../../assets/bpmnViewIcons/ArtefactsHead.svg";
import taskIcon from "../../assets/bpmnViewIcons/TaskIcon.svg";
import sharePointIcon from "../../assets/bpmnViewIcons/SharePoint.svg";
import dataObjectIcon from "../../assets/bpmnViewIcons/DataObject.svg";
import groupBoxIcon from "../../assets/bpmnViewIcons/GroupBox.svg";
import messageIcon from "../../assets/bpmnViewIcons/Message.svg";
import textAnnotationIcon from "../../assets/bpmnViewIcons/TextAnnotation.svg";
import embStartEventIcon from "../../assets/bpmnViewIcons/EmbeddedStartEvent.svg";
import embEndEventIcon from "../../assets/bpmnViewIcons/EmbeddedEndEvent.svg";

export const newTask = {
  icon: taskTemplateIcon,
  title: taskType_label.newTask_label, // code edited on 13 Oct 2022 for BugId 117089
  styleName: style.newTask,
  activitySubType: TaskType.globalTask,
};

export const processTask = {
  icon: taskTemplateIcon,
  title: taskType_label.processTask_label, // code edited on 13 Oct 2022 for BugId 117089
  styleName: style.processTask,
  activitySubType: TaskType.processTask,
};

export const taskTemplate = {
  icon: taskIcon,
};

export const startEvent = {
  icon: startEventIcon,
  title: activityType_label.startEvent,
  description: "toolbox.description.startEvent",
  styleName: style.startEvent,
  activitySubType: activityType.startEvent,
  activitySubTypeId: 1,
  activityTypeId: 1,
};

// code added on 29 March 2023 for BugId 124819
export const embeddedStartEvent = {
  icon: embStartEventIcon,
  title: activityType_label.embStartEvent,
  description: "toolbox.description.startEvent",
  styleName: style.embStartEvent,
  activitySubType: activityType.embStartEvent,
  activitySubTypeId: 1,
  activityTypeId: 1,
};

export const conditionalEvents = {
  icon: conditionalStartIcon,
  title: activityType_label.conditionalStart,
  description: "toolbox.description.conditionalStart",
  styleName: style.conditionalStart,
  activitySubType: activityType.conditionalStart,
  activitySubTypeId: 3,
  activityTypeId: 1,
};

export const messageStart = {
  icon: messageStartIcon,
  title: activityType_label.messageStart,
  description: "toolbox.description.messageStart",
  styleName: style.messageStart,
  activitySubType: activityType.messageStart,
  activitySubTypeId: 7,
  activityTypeId: 1,
};

export const timerStart = {
  icon: timerStartIcon,
  title: activityType_label.timerStart,
  description: "toolbox.description.timerStart",
  styleName: style.timerStart,
  activitySubType: activityType.timerStart,
  activitySubTypeId: 6,
  activityTypeId: 1,
};

export const subProcess = {
  icon: subProcessIcon,
  title: activityType_label.subProcess,
  description: "toolbox.description.embeddedSubprocess",
  styleName: style.subProcess,
  activitySubType: activityType.subProcess,
  activitySubTypeId: 1,
  activityTypeId: 35,
};

export const callActivity = {
  icon: callActivityIcon,
  title: activityType_label.callActivity,
  description: "toolbox.description.callActivity",
  styleName: style.callActivity,
  activitySubType: activityType.callActivity,
  activitySubTypeId: 1,
  activityTypeId: 18,
};

export const workdesk = {
  icon: workdeskIcon,
  title: activityType_label.workdesk,
  description: "toolbox.description.workDesk",
  styleName: style.workdesk,
  activitySubType: activityType.workdesk,
  activitySubTypeId: 3,
  activityTypeId: 10,
};

export const robotWorkdesk = {
  icon: robotWorkdeskIcon,
  title: activityType_label.robotWorkdesk,
  description: "toolbox.description.robotWorkdesk",
  styleName: style.robotWorkdesk,
  activitySubType: activityType.robotWorkdesk,
  activitySubTypeId: 7,
  activityTypeId: 10,
};

export const caseWorkdesk = {
  icon: caseWorkdeskIcon,
  title: activityType_label.caseWorkdesk,
  description: "toolbox.description.caseWorkdesk",
  styleName: style.caseWorkdesk,
  activitySubType: activityType.caseWorkdesk,
  activitySubTypeId: 1,
  activityTypeId: 32,
};

export const email = {
  icon: emailIcon,
  title: activityType_label.email,
  description: "toolbox.description.email",
  styleName: style.email,
  activitySubType: activityType.email,
  activitySubTypeId: 1,
  activityTypeId: 10,
};

export const exportActivity = {
  icon: exportIcon,
  title: activityType_label.export,
  description: "toolbox.description.export",
  styleName: style.export,
  activitySubType: activityType.export,
  activitySubTypeId: 1,
  activityTypeId: 20,
};

export const query = {
  icon: queryIcon,
  title: activityType_label.query,
  description: "toolbox.description.query",
  styleName: style.query,
  activitySubType: activityType.query,
  activitySubTypeId: 1,
  activityTypeId: 11,
};

export const sapAdapter = {
  icon: sapAdapterIcon,
  title: activityType_label.sapAdapter,
  description: "toolbox.description.sapAdapter",
  styleName: style.sapAdapter,
  activitySubType: activityType.sapAdapter,
  activitySubTypeId: 1,
  activityTypeId: 29,
};

export const webService = {
  icon: webServiceIcon,
  title: activityType_label.webService,
  description: "toolbox.description.webService",
  styleName: style.webService,
  activitySubType: activityType.webService,
  activitySubTypeId: 1,
  activityTypeId: 22,
};

export const responseConsumerJMS = {
  icon: webServiceIcon,
  title: activityType_label.responseConsumerJMS,
  description: "toolbox.description.webService",
  styleName: style.responseConsumerJMS,
  activitySubType: activityType.responseConsumerJMS,
  activitySubTypeId: 1,
  activityTypeId: 23,
};

export const responseConsumerSOAP = {
  icon: webServiceIcon,
  title: activityType_label.responseConsumerSOAP,
  description: "toolbox.description.webService",
  styleName: style.responseConsumerSOAP,
  activitySubType: activityType.responseConsumerSOAP,
  activitySubTypeId: 1,
  activityTypeId: 25,
};

export const requestConsumerSOAP = {
  icon: webServiceIcon,
  title: activityType_label.requestConsumerSOAP,
  description: "toolbox.description.webService",
  styleName: style.requestConsumerSOAP,
  activitySubType: activityType.requestConsumerSOAP,
  activitySubTypeId: 1,
  activityTypeId: 24,
};

export const restful = {
  icon: webServiceIcon,
  title: activityType_label.restful,
  description: "toolbox.description.webService",
  styleName: style.restful,
  activitySubType: activityType.restful,
  activitySubTypeId: 1,
  activityTypeId: 40,
};

export const businessRule = {
  icon: businessRuleIcon,
  title: activityType_label.businessRule,
  description: "toolbox.description.businessRule",
  styleName: style.businessRule,
  activitySubType: activityType.businessRule,
  activitySubTypeId: 1,
  activityTypeId: 31,
};

export const dmsAdapter = {
  icon: dmsAdapterIcon,
  title: activityType_label.dmsAdapter,
  description: "toolbox.description.dmsAdapter",
  styleName: style.dmsAdapter,
  activitySubType: activityType.dmsAdapter,
  activitySubTypeId: 4,
  activityTypeId: 10,
};

export const sharePoint = {
  icon: sharePointIcon,
  title: activityType_label.sharePoint,
  description: "toolbox.description.sharePoint",
  styleName: style.sharePoint,
  activitySubType: activityType.sharePoint,
  activitySubTypeId: 1,
  activityTypeId: 30,
};

export const receive = {
  icon: receiveIcon,
  title: activityType_label.receive,
  description: "toolbox.description.receive",
  styleName: style.receive,
  activitySubType: activityType.receive,
  activitySubTypeId: 2,
  activityTypeId: 1,
};

export const reply = {
  icon: replyIcon,
  title: activityType_label.reply,
  description: "toolbox.description.reply",
  styleName: style.reply,
  activitySubType: activityType.reply,
  activitySubTypeId: 1,
  activityTypeId: 26,
};

export const omsAdapter = {
  icon: omsAdapterIcon,
  title: activityType_label.ccm,
  description: "toolbox.description.omsAdapter",
  styleName: style.omsAdapter,
  activitySubType: activityType.omsAdapter,
  activitySubTypeId: 1,
  activityTypeId: 33,
};

export const event = {
  icon: eventIcon,
  title: activityType_label.event,
  description: "toolbox.description.eventWorkstep",
  styleName: style.event,
  activitySubType: activityType.event,
  activitySubTypeId: 1,
  activityTypeId: 27,
};

export const jmsProducer = {
  icon: jmsProducerIcon,
  title: activityType_label.jmsProducer,
  description: "toolbox.description.jmsProducer",
  styleName: style.jmsProducer,
  activitySubType: activityType.jmsProducer,
  activitySubTypeId: 1,
  activityTypeId: 19,
};

export const jmsConsumer = {
  icon: jmsConsumerIcon,
  title: activityType_label.jmsConsumer,
  description: "toolbox.description.jmsConsumer",
  styleName: style.jmsConsumer,
  activitySubType: activityType.jmsConsumer,
  activitySubTypeId: 1,
  activityTypeId: 21,
};

export const timerEvents = {
  icon: timerEventIcon,
  title: activityType_label.timerEvents,
  description: "toolbox.description.timerEventWorkstep",
  styleName: style.timerEvents,
  activitySubType: activityType.timerEvents,
  activitySubTypeId: 1,
  activityTypeId: 4,
};

export const inclusiveDistribute = {
  icon: inclusiveGatewayIcon,
  title: activityType_label.inclusiveDistribute,
  description: "toolbox.description.inclusiveDistribute",
  styleName: style.inclusiveDistribute,
  activitySubType: activityType.inclusiveDistribute,
  activitySubTypeId: 1,
  activityTypeId: 5,
};

export const parallelDistribute = {
  icon: parallelGatewayIcon,
  title: activityType_label.parallelDistribute,
  description: "toolbox.description.parallelDistribute",
  styleName: style.parallelDistribute,
  activitySubType: activityType.parallelDistribute,
  activitySubTypeId: 2,
  activityTypeId: 5,
};

export const parallelCollect = {
  icon: parallelCollectIcon,
  title: activityType_label.parallelCollect,
  description: "toolbox.description.parallelCollect",
  styleName: style.parallelCollect,
  activitySubType: activityType.parallelCollect,
  activitySubTypeId: 2,
  activityTypeId: 6,
};

export const dataBasedExclusive = {
  icon: exclusiveGatewayIcon,
  title: activityType_label.dataBasedExclusive,
  description: "toolbox.description.dataBasedExclusive",
  styleName: style.dataBasedExclusive,
  activitySubType: activityType.dataBasedExclusive,
  activitySubTypeId: 1,
  activityTypeId: 7,
};

export const inclusiveCollect = {
  icon: inclusiveCollectIcon,
  title: activityType_label.inclusiveCollect,
  description: "toolbox.description.inclusiveCollect",
  styleName: style.inclusiveCollect,
  activitySubType: activityType.inclusiveCollect,
  activitySubTypeId: 1,
  activityTypeId: 6,
};

export const endEvent = {
  icon: endEventIcon,
  title: activityType_label.endEvent,
  description: "toolbox.description.endEvent",
  styleName: style.endEvent,
  activitySubType: activityType.endEvent,
  activitySubTypeId: 1,
  activityTypeId: 2,
};

// code added on 29 March 2023 for BugId 124819
export const embeddedEndEvent = {
  icon: embEndEventIcon,
  title: activityType_label.embEndEvent,
  description: "toolbox.description.endEvent",
  styleName: style.embEndEvent,
  activitySubType: activityType.embEndEvent,
  activitySubTypeId: 1,
  activityTypeId: 2,
};

export const terminate = {
  icon: terminateIcon,
  title: activityType_label.terminate,
  description: "toolbox.description.terminateEvent",
  styleName: style.terminate,
  activitySubType: activityType.terminate,
  activitySubTypeId: 1,
  activityTypeId: 3,
};

export const messageEnd = {
  icon: messageEndIcon,
  title: activityType_label.messageEnd,
  description: "toolbox.description.messageEnd",
  styleName: style.messageEnd,
  activitySubType: activityType.messageEnd,
  activitySubTypeId: 2,
  activityTypeId: 2,
};

export const dataExchange = {
  icon: dataExchangeIcon,
  title: activityType_label.dataExchange,
  description: "toolbox.description.dataExchange",
  styleName: style.dataExchange,
  activitySubType: activityType.dataExchange,
  activitySubTypeId: 1,
  activityTypeId: 34,
};

export const textAnnotations = {
  icon: textAnnotationIcon,
  title: "toolbox.artefacts.textAnnotations",
  description: "toolbox.description.textAnnotation",
  styleName: style.textAnnotations,
  activitySubType: activityType.textAnnotations,
};

export const groupBox = {
  icon: groupBoxIcon,
  title: "toolbox.artefacts.groupBox",
  description: "toolbox.description.groupBox",
  styleName: style.groupBox,
  activitySubType: activityType.groupBox,
};

export const dataObject = {
  icon: dataObjectIcon,
  title: "toolbox.artefacts.dataObject",
  description: "toolbox.description.dataObject",
  styleName: style.dataObject,
  activitySubType: activityType.dataObject,
};

export const message = {
  icon: messageIcon,
  title: "toolbox.artefacts.message",
  description: "toolbox.description.message",
  styleName: style.message,
  activitySubType: activityType.message,
};

//now each of the tooltypes are defined

export const taskTemplates = {
  icon: taskTemplateIcon,
  title: TASK_TEMPLATES_HEAD,
  tools: [newTask, processTask],
};

export const startEvents = {
  icon: startHeadIcon,
  title: "toolbox.startEvents.head",
  tools: [
    startEvent,
    conditionalEvents,
    //messageStart,
    // timerStart
  ],
};

export const activities = {
  icon: activityIcon,
  title: "toolbox.activities.head",
  tools: [
    subProcess,
    callActivity,
    workdesk,
    caseWorkdesk,
    receive,
    reply,
    email,
    exportActivity,
    query,
  ],
};

export const intermediateEvents = {
  icon: intermediateEventIcon,
  title: "toolbox.intermediateEvents.head",
  tools: [event, jmsProducer, jmsConsumer, timerEvents],
};

export const gateway = {
  icon: decisionIcon,
  title: "toolbox.gateway.head",
  tools: [
    inclusiveDistribute,
    inclusiveCollect,
    parallelDistribute,
    parallelCollect,
    dataBasedExclusive,
  ],
};

export const endEvents = {
  icon: endHeadIcon,
  title: "toolbox.endEvents.head",
  tools: [endEvent, terminate, messageEnd],
};

export const integrationPoints = {
  icon: integrationPointsIcon,
  title: "toolbox.integrationPoints.head",
  tools: [
    dataExchange,
    webService,
    dmsAdapter,
    omsAdapter,
    sapAdapter,
    sharePoint,
    robotWorkdesk,
    businessRule,
  ],
};

export const artefacts = {
  icon: artefactsIcon,
  title: "toolbox.artefacts.head",
  tools: [textAnnotations, groupBox, dataObject, message],
};

export const extras = {
  icon: integrationPointsIcon,
  title: "toolbox.integrationPoints.head",
  tools: [
    responseConsumerJMS,
    responseConsumerSOAP,
    requestConsumerSOAP,
    restful,
    embeddedStartEvent, // code added on 29 March 2023 for BugId 124819
    embeddedEndEvent, // code added on 29 March 2023 for BugId 124819
  ],
};
