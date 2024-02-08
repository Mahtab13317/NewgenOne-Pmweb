import { activityType } from "../../Constants/appConstants";

function ifStartWith(stringArray, valueString) {
  let itr = 0;
  for (itr; itr < stringArray.length; itr++) {
    if (stringArray[itr].startsWith(valueString)) {
      return true;
    }
  }
  return false;
}

export function suggestedActivityType(inputValue) {
  if (inputValue == "" || inputValue === undefined || inputValue === null) {
    return null;
  } else if (
    ifStartWith(["start", "start event", "startevent", "initiate"], inputValue)
  ) {
    return activityType.startEvent;
  } else if (ifStartWith(["reply"], inputValue)) {
    return activityType.reply;
  } else if (
    ifStartWith(["user", "human", "activity", "workdesk"], inputValue)
  ) {
    return activityType.workdesk;
  } else if (
    ifStartWith(
      ["end", "endactivity", "end activity", "stop", "finish"],
      inputValue
    )
  ) {
    return activityType.endEvent;
  } else if (ifStartWith(["decision", "decide"], inputValue)) {
    return activityType.dataBasedExclusive;
  } else if (ifStartWith(["subprocess"], inputValue)) {
    return activityType.subProcess;
  } else if (ifStartWith(["webservice", "web service", "invoke"], inputValue)) {
    return activityType.webService;
  } else if (ifStartWith(["archive", "dms", "dms adapter"], inputValue)) {
    return activityType.dmsAdapter;
  } else if (ifStartWith(["timer", "hold"], inputValue)) {
    return activityType.timerEvents;
  } else if (ifStartWith(["export", "purge"], inputValue)) {
    return activityType.export;
  } else if (ifStartWith(["mail", "send", "email"], inputValue)) {
    return activityType.email;
  } else if (
    ifStartWith(["case", "case activity", "caseactivity"], inputValue)
  ) {
    return activityType.caseWorkdesk;
  } else if (ifStartWith(["distribute"], inputValue)) {
    return activityType.inclusiveDistribute;
  } else if (ifStartWith(["collate", "collect", "merge"], inputValue)) {
    return activityType.inclusiveCollect;
  } else if (
    ifStartWith(["parallel distribute", "paralleldistribute"], inputValue)
  ) {
    return activityType.parallelDistribute;
  } else if (ifStartWith(["Parallel collect", "Parallelcollect"], inputValue)) {
    return activityType.parallelCollect;
  } else if (
    ifStartWith(
      ["condition", "conditional", "conditional start", "conditionalstart"],
      inputValue
    )
  ) {
    return activityType.conditionalEvent;
  } else if (ifStartWith(["receive"], inputValue)) {
    return activityType.receive;
  } else if (ifStartWith(["query", "search"], inputValue)) {
    return activityType.query;
  } else if (
    ifStartWith(["ActivityType exchange", "ActivityTypeexchange"], inputValue)
  ) {
    return activityType.ActivityTypeExchange;
  } else if (
    ifStartWith(["jms", "producer", "jmsproducer", "jms producer"], inputValue)
  ) {
    return activityType.jmsProducer;
  } else if (
    ifStartWith(["consumer", "jmsconsumer", "jms consumer"], inputValue)
  ) {
    return activityType.jmsConsumer;
  } else if (ifStartWith(["brt", "business rule", "rule"], inputValue)) {
    return activityType.businessRule;
  } else if (
    ifStartWith(["oms", "ccm", "ccm adapter", "generate"], inputValue)
  ) {
    return activityType.omsAdapter;
  } else if (ifStartWith(["event"], inputValue)) {
    return activityType.message;
  } else if (ifStartWith(["terminate", "stop", "halt"], inputValue)) {
    return activityType.terminate;
  } else if (ifStartWith(["message end", "Invoke process"], inputValue)) {
    return activityType.messageEnd;
  } else if (ifStartWith(["timer", "timer start", "timerstart"], inputValue)) {
    return activityType.timerStart;
  } else if (
    ifStartWith(["message", "messagestart", "message start"], inputValue)
  ) {
    return activityType.messageStart;
  } else if (
    ifStartWith(
      ["UI path", "UIPath", "robot workdesk", "robotworkdesk"],
      inputValue
    )
  ) {
    return activityType.robotWorkdesk;
  } else if (ifStartWith(["SAP"], inputValue)) {
    return activityType.sapAdapter;
  }
}
