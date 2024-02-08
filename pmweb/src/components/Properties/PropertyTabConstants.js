import { activityType } from "../../Constants/appConstants.js";

export const arrEntrySettingsPresent = () => {
  return [
    activityType.reply,
    activityType.webService,
    activityType.businessRule,
    activityType.dmsAdapter,
    activityType.jmsProducer,
    activityType.jmsConsumer,
    activityType.timerEvents,
    activityType.endEvent,
    activityType.terminate,
    activityType.messageEnd,
    activityType.dataExchange,
    activityType.email,
    activityType.robotWorkdesk,
    activityType.omsAdapter,
    activityType.sharePoint,
    activityType.sapAdapter,
  ];
};

export const arrMobileEnabledAbsent = () => {
  return [
    activityType.timerEvents,
    activityType.robotWorkdesk,
    activityType.businessRule,
    activityType.dmsAdapter,
    activityType.messageStart,
    activityType.event,
    activityType.jmsProducer,
    activityType.jmsConsumer,
    activityType.timerEvents,
    activityType.inclusiveDistribute,
    activityType.inclusiveCollect,
    activityType.parallelDistribute,
    activityType.parallelCollect,
    activityType.dataBasedExclusive,
    activityType.endEvent,
    activityType.terminate,
    activityType.messageEnd,
    activityType.embeddedSubprocess,
    activityType.robotWorkdesk,
    activityType.omsAdapter,
    activityType.callActivity,
    activityType.sharePoint,
    activityType.subProcess,
    activityType.webService,
    activityType.responseConsumerJMS,
    activityType.requestConsumerSOAP,
    activityType.responseConsumerSOAP,
    activityType.restful,
    activityType.export,
  ];
};

export const arrFormValidationAbsent = () => {
  return [
    activityType.webService,
    activityType.inclusiveDistribute,
    activityType.parallelDistribute,
    activityType.parallelCollect,
    activityType.dataBasedExclusive,
    activityType.receive,
    activityType.reply,
    activityType.export,
    activityType.businessRule,
    activityType.dmsAdapter,
    activityType.jmsProducer,
    activityType.jmsConsumer,
    activityType.inclusiveCollect,
    activityType.email,
    activityType.omsAdapter,
    activityType.callActivity,
    activityType.sapAdapter,
  ];
};
