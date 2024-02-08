// Changes to solve Bug 113567 - Export: Data tab in case of Export activity need not to be there.

import { activityType, TaskType } from "./appConstants";
import { propertiesTabsForActivities as Tab } from "../utility/propertiesTabsForActivity/propertiesTabsForActivity";

export const ActivityPropertyTabs = [
  {
    name: activityType.startEvent,
    components: [Tab(1), Tab(3), Tab(4), Tab(5), Tab(6), Tab(2)],
  },
  {
    name: activityType.callActivity,
    components: [Tab(1), Tab(4), Tab(5), Tab(9), Tab(10), Tab(42), Tab(43)],
  },
  {
    name: activityType.workdesk,
    components: [
      Tab(1),
      Tab(3),
      Tab(11),
      Tab(4),
      Tab(5),
      Tab(6),
      Tab(12),
      Tab(13),
      Tab(2),
      // Tab(14),
      // Tab(15),
    ],
  },
  {
    name: activityType.conditionalStart,
    components: [Tab(1), Tab(3), Tab(4), Tab(5), Tab(6), Tab(2)],
  },
  {
    name: activityType.messageStart,
    components: [Tab(1), Tab(4), Tab(5), Tab(6), Tab(2), Tab(8)],
  },
  {
    name: activityType.timerStart,
    components: [Tab(1), Tab(27), Tab(5), Tab(6), Tab(2), Tab(8)],
  },
  {
    name: activityType.subProcess,
    components: [Tab(1)],
  },
  {
    name: activityType.robotWorkdesk,
    components: [
      Tab(1),
      Tab(3),
      Tab(11),
      Tab(4),
      Tab(5),
      Tab(6),
      Tab(13),
      Tab(2),
    ],
  },
  {
    name: activityType.caseWorkdesk,
    components: [
      Tab(1),
      Tab(3),
      Tab(11),
      Tab(4),
      Tab(5),
      Tab(6),
      Tab(16),
      Tab(12),
      Tab(13),
      Tab(2),
    ],
  },
  {
    name: activityType.receive,
    components: [Tab(1), Tab(3), Tab(4), Tab(5), Tab(17), Tab(2)],
  },

  {
    name: activityType.receive,
    components: [Tab(1), Tab(3), Tab(4), Tab(5), Tab(17), Tab(2)],
  },
  {
    name: activityType.reply,
    components: [Tab(1), Tab(11), Tab(4), Tab(5), Tab(18)],
  },
  {
    name: activityType.email,
    components: [Tab(1), Tab(11), Tab(4), Tab(5), Tab(44), Tab(2)],
  },
  {
    name: activityType.export,
    components: [Tab(1), Tab(4), Tab(5), Tab(19)],
  },
  {
    name: activityType.query,
    components: [Tab(1), Tab(4), Tab(5), Tab(6), Tab(20), Tab(21), Tab(2)],
  },
  {
    name: activityType.webService,
    components: [Tab(1), Tab(11), Tab(4), Tab(5), Tab(22), Tab(2)],
  },
  {
    name: activityType.responseConsumerJMS,
    components: [Tab(1), Tab(11), Tab(4), Tab(5), Tab(38), Tab(2)],
  },
  {
    name: activityType.responseConsumerSOAP,
    components: [Tab(1), Tab(11), Tab(4), Tab(5), Tab(2)],
  },
  {
    name: activityType.requestConsumerSOAP,
    components: [Tab(1), Tab(11), Tab(4), Tab(5), Tab(40), Tab(2)],
  },
  {
    name: activityType.restful,
    components: [Tab(1), Tab(11), Tab(4), Tab(5), Tab(41), Tab(2)],
  },
  {
    name: activityType.businessRule,
    components: [Tab(1), Tab(11), Tab(4), Tab(5), Tab(23), Tab(2)],
  },
  {
    name: activityType.dmsAdapter,
    components: [Tab(1), Tab(11), Tab(4), Tab(5), Tab(24), Tab(2)],
  },
  {
    name: activityType.omsAdapter,
    components: [Tab(1), Tab(11), Tab(4), Tab(5), Tab(25), Tab(2)],
  },

  {
    name: activityType.event,
    components: [Tab(1), Tab(4), Tab(5), Tab(26), Tab(2)],
  },
  {
    name: activityType.jmsProducer,
    components: [Tab(1), Tab(27), Tab(4), Tab(5), Tab(28), Tab(2)],
  },
  {
    name: activityType.jmsConsumer,
    components: [Tab(1), Tab(27), Tab(4), Tab(5), Tab(29)],
  },
  {
    name: activityType.timerEvents,
    components: [
      Tab(1),
      Tab(27),
      Tab(4),
      Tab(5),
      Tab(6),
      Tab(30),
      Tab(31),
      Tab(2),
    ],
  },
  {
    name: activityType.inclusiveDistribute,
    components: [Tab(1), Tab(4), Tab(5), Tab(32)],
  },
  {
    name: activityType.parallelDistribute,
    components: [Tab(1), Tab(4), Tab(5), Tab(32)],
  },
  {
    name: activityType.inclusiveCollect,
    components: [Tab(1), Tab(4), Tab(5), Tab(33)],
  },
  {
    name: activityType.parallelCollect,
    components: [Tab(1), Tab(4), Tab(5), Tab(54)],
  },
  {
    name: activityType.dataBasedExclusive,
    components: [Tab(1), Tab(4), Tab(5), Tab(34)],
  },
  {
    name: activityType.endEvent,
    components: [Tab(1), Tab(11), Tab(4), Tab(5), Tab(6), Tab(2)],
  },
  {
    name: activityType.terminate,
    components: [Tab(1), Tab(11), Tab(4), Tab(5), Tab(6), Tab(2)],
  },
  {
    name: activityType.messageEnd,
    components: [
      Tab(1),
      Tab(11),
      Tab(4),
      Tab(5),
      Tab(6),
      Tab(35),
      Tab(55),
      Tab(2),
    ],
  },
  {
    name: activityType.dataExchange,
    components: [Tab(1), Tab(36), Tab(4), Tab(5), Tab(2)],
  },
  {
    name: activityType.sapAdapter,
    components: [Tab(1), Tab(11), Tab(4), Tab(5), Tab(37), Tab(2)],
  },
  {
    name: activityType.sharePoint,
    components: [Tab(1), Tab(11), Tab(4), Tab(5), Tab(49), Tab(2)],
  },
  {
    name: TaskType.globalTask,
    components: [Tab(45), Tab(48), Tab(47), Tab(46)],
  },
  {
    name: TaskType.processTask,
    components: [Tab(45), Tab(52), Tab(53), Tab(50), Tab(51)],
  },
];
