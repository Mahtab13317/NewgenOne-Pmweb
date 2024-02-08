import { activityType } from "../../Constants/appConstants";
export function dropdownList() {
  let dropdown = [
    activityType.startEvent,
    activityType.conditionalStart,
    activityType.timerStart,
    activityType.messageStart,
    activityType.subProcess,
    activityType.workdesk,
    activityType.robotWorkdesk,
    activityType.caseWorkdesk,
    activityType.email,
    activityType.export,
    activityType.query,
    activityType.omsAdapter,
    activityType.webService,
    activityType.businessRule,
    activityType.dmsAdapter,
    activityType.sharePoint,
    activityType.sapAdapter,
    activityType.message,
    activityType.jmsConsumer,
    activityType.jmsProducer,
    activityType.timerEvents,
    activityType.inclusiveDistribute,
    activityType.parallelDistribute,
    activityType.inclusiveCollect,
    activityType.parallelCollect,
    activityType.dataBasedExclusive,
    activityType.endEvent,
    activityType.terminate,
    activityType.messageEnd,
    activityType.dataExchange,
    activityType.receive,
    activityType.reply,
  ];

  return dropdown;
}
