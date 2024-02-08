// #BugID - 111149
// #BugDescription - Icons added as per required tab

// #BugID - 122158
// #BugDescription - Icons added as per required tab

// Changes made to solve Bug 123515 - Process Designer-icons related- UX and UI bugs
import React from "react";
import BasicDetailsIcon from "../../../src/assets/abstractView/Icons/BasicDetails.svg";
import BasicDetailsIcon_EN from "../../../src/assets/abstractView/Icons/BasicDetails_Enabled.svg";
import DataFieldsIcon from "../../../src/assets/abstractView/Icons/DataField.svg";
import DataFieldsIcon_EN from "../../../src/assets/abstractView/Icons/DataField_Enabled.svg";
import AttachmentsIcon from "../../../src/assets/abstractView/Icons/Attachment.svg";
import AttachmentsIcon_EN from "../../../src/assets/abstractView/Icons/Attachment_Enabled.svg";
import InitialRulesIcon from "../../../src/assets/abstractView/Icons/InitialRules.svg";
import InitialRulesIcon_EN from "../../../src/assets/abstractView/Icons/InitialRules_Enabled.svg";
import RequirementsIcon from "../../../src/assets/abstractView/Icons/Requirement.svg";
import RequirementsIcon_EN from "../../../src/assets/abstractView/Icons/Requirement_Enabled.svg";
import WorkdeskIcon from "../../../src/assets/abstractView/Icons/Workdesk.svg";
import WorkdeskIcon_EN from "../../../src/assets/abstractView/Icons/Workdesk_Enabled.svg";
import ForwardMapping from "../../../src/assets/abstractView/Icons/ForwardMapping.svg";
import ForwardMapping_EN from "../../../src/assets/abstractView/Icons/ForwardMapping_Enabled.svg";
import ReverseMapping from "../../../src/assets/abstractView/Icons/ReverseMapping.svg";
import ReverseMapping_EN from "../../../src/assets/abstractView/Icons/ReverseMapping_Enabled.svg";
import EntrySettingsIcon from "../../../src/assets/abstractView/Icons/EntrySetting.svg";
import EntrySettingsIcon_EN from "../../../src/assets/abstractView/Icons/EntrySetting_Enabled.svg";
import WebserviceIcon from "../../../src/assets/abstractView/Icons/Soap.svg";
import WebserviceIcon_EN from "../../../src/assets/abstractView/Icons/Soap_EN.svg";
import ExportIcon from "../../../src/assets/abstractView/Icons/Export.png";
import ExportIcon_EN from "../../../src/assets/abstractView/Icons/Export_Enabled.png";
import OutputVariablesIcon from "../../../src/assets/abstractView/Icons/OutputVariables.png";
import OutputVariablesIcon_EN from "../../../src/assets/abstractView/Icons/OutputVariables_Enabled.png";
import ReceiveIcon from "../../../src/assets/abstractView/Icons/Receive.png";
import ReceiveIcon_EN from "../../../src/assets/abstractView/Icons/Receive_Enabled.png";
import SendIcon from "../../../src/assets/abstractView/Icons/Send.png";
import SendIcon_EN from "../../../src/assets/abstractView/Icons/Send_Enabled.png";
import SearchVariableIcon from "../../../src/assets/abstractView/Icons/SearchVariable.png";
import SearchVariableIcon_EN from "../../../src/assets/abstractView/Icons/SearchVariable_Enabled.png";
import SearchResultIcon from "../../../src/assets/abstractView/Icons/SearchResult.png";
import SearchResultIcon_EN from "../../../src/assets/abstractView/Icons/SearchResult_Enabled.png";
import RoutingCriteriaIcon from "../../../src/assets/abstractView/Icons/RoutingCriteria.png";
import RoutingCriteriaIcon_EN from "../../../src/assets/abstractView/Icons/RoutingCriteria_Enabled.png";
import ArchieveIcon from "../../../src/assets/abstractView/Icons/Archieve.png";
import ArchieveIcon_EN from "../../../src/assets/abstractView/Icons/Archieve_Enabled.png";
import SAPIcon from "../../../src/assets/abstractView/Icons/SAP.png";
import SAPIcon_EN from "../../../src/assets/abstractView/Icons/SAP_Enabled.png";
import RestfulIcon from "../../../src/assets/abstractView/Icons/Rest.svg";
import RestfulIcon_EN from "../../../src/assets/abstractView/Icons/Rest_En.svg";
import fwdDocMappingIcon from "../../../src/assets/abstractView/Icons/ForwardDocMapping.svg";
import fwdDocMappingIcon_EN from "../../../src/assets/abstractView/Icons/ForwardDocMapping_Enabled.svg";
import revDocMappingIcon from "../../../src/assets/abstractView/Icons/ReverseDocMapping.svg";
import revDocMappingIcon_EN from "../../../src/assets/abstractView/Icons/ReverseDocMapping_Enabled.svg";
import omsTemplatesIcon from "../../../src/assets/abstractView/Icons/omsTemplates.png";
import omsTemplatesIcon_EN from "../../../src/assets/abstractView/Icons/omsTemplates_Enabled.png";
import StreamsIcon from "../../../src/assets/abstractView/Icons/Streams_Unselected.svg";
import StreamsIcon_EN from "../../../src/assets/abstractView/Icons/Streams_Selected.svg";
import OptionIcon from "../../../src/assets/abstractView/Icons/Options.svg";
import OptionIcon_EN from "../../../src/assets/abstractView/Icons/Options_Enabled.svg";
import Throw from "../../../src/assets/abstractView/Icons/Throw.svg";
import Catch from "../../../src/assets/abstractView/Icons/Catch.svg";
import DataIcon from "../../../src/assets/abstractView/Icons/Data.svg";
import DataIcon_EN from "../../../src/assets/abstractView/Icons/Data_Enabled.svg";
import EscalationIcon from "../../../src/assets/abstractView/Icons/Escalate.svg";
import EscalationIcon_EN from "../../../src/assets/abstractView/Icons/Escalate_Enabled.svg";
import EventMessageIcon from "../../../src/assets/abstractView/Icons/EventMessage.png";
import EventMessageIcon_EN from "../../../src/assets/abstractView/Icons/EventMessage_Enabled.png";
import CaseTaskIcon from "../../../src/assets/abstractView/Icons/Tasks_Unselected.svg";
import CaseTaskIcon_EN from "../../../src/assets/abstractView/Icons/Tasks_Selected.svg";
import ReminderIcon from "../../../src/assets/abstractView/Icons/Reminder.svg";
import ReminderIcon_EN from "../../../src/assets/abstractView/Icons/Reminder_Enabled.svg";
import TimerIcon from "../../../src/assets/abstractView/Icons/TimerEvent.png";
import TimerIcon_EN from "../../../src/assets/abstractView/Icons/TimerEvent_Enabled.png";
import JMSConsumerIcon from "../../../src/assets/abstractView/Icons/JMS_Consumer.svg";
import JMSConsumerIcon_EN from "../../../src/assets/abstractView/Icons/JMS_Consumer_EN.svg";
import JMSProducerIcon from "../../../src/assets/abstractView/Icons/JMS_Producer.svg";
import JMSProducerIcon_EN from "../../../src/assets/abstractView/Icons/JMS_Producer_EN.svg";
import BRTIcon from "../../../src/assets/abstractView/Icons/BRT.png";
import BRTIcon_EN from "../../../src/assets/abstractView/Icons/BRT_Enabled.png";
import InitiateWSIcon from "../../../src/assets/abstractView/Icons/InitiateWS.png";
import InitiateWSIcon_EN from "../../../src/assets/abstractView/Icons/InitiateWS_Enabled.png";
import DataExchangeIcon from "../../../src/assets/abstractView/Icons/DataExchange.png";
import DataExchangeIcon_EN from "../../../src/assets/abstractView/Icons/DataExchange_Enabled.png";
import RequestConsumerSoapIcon from "../../../src/assets/abstractView/Icons/RequestConsumerSoap.svg";
import RequestConsumerSoapIcon_EN from "../../../src/assets/abstractView/Icons/RequestConsumerSoap_Enabled.svg";
import ResponseConsumerSoapIcon from "../../../src/assets/abstractView/Icons/ResponseConsumerSoap.png";
import ResponseConsumerSoapIcon_EN from "../../../src/assets/abstractView/Icons/ResponseConsumerSoap_Enabled.png";
import ParallelCollectIcon from "../../../src/assets/abstractView/Icons/ParellelCollect.svg";
import ParallelCollectIcon_EN from "../../../src/assets/abstractView/Icons/ParellelCollect_Enabled.svg";
import InclusiveCollectIcon from "../../../src/assets/abstractView/Icons/InclusiveCollect.svg";
import InclusiveCollectIcon_EN from "../../../src/assets/abstractView/Icons/InclusiveCollect_Enabled.svg";
import DistributeIcon from "../../../src/assets/abstractView/Icons/Distribute.svg";
import DistributeIcon_EN from "../../../src/assets/abstractView/Icons/Distribute_Enabled.svg";

import { propertiesLabel, tabsHeading } from "../../Constants/appConstants";
import TaskEscalationRules from "../../components/Properties/PropetiesTab/TaskEscalationRules/TaskEscalationRules";
import TaskData from "../../components/Properties/PropetiesTab/TaskData/TaskData";
import { useTranslation } from "react-i18next";

const TaskDetails = React.lazy(() =>
  import("../../components/Properties/PropetiesTab/TaskDetails/TaskDetails")
);
const TaskOptions = React.lazy(() =>
  import("../../components/Properties/PropetiesTab/TaskOptions/TaskOptions")
);
const BasicDetails = React.lazy(() =>
  import("../../components/Properties/PropetiesTab/basicDetails/basicDetails")
);
const Webservice = React.lazy(() =>
  import("../../components/Properties/PropetiesTab/Webservice/index.js")
);
const InitialRule = React.lazy(() =>
  import("../../components/Properties/PropetiesTab/InitialRule/index")
);
const Attachment = React.lazy(() =>
  import("../../components/Properties/PropetiesTab/Attachment/Attachment")
);
const Restful = React.lazy(() =>
  import("../../components/Properties/PropetiesTab/Restful/index.js")
);
const ResponseConsumerJMS = React.lazy(() =>
  import(
    "../../components/Properties/PropetiesTab/ResponseConsumerJMS/index.js"
  )
);
const RequestConsumerSoap = React.lazy(() =>
  import(
    "../../components/Properties/PropetiesTab/requestConsumerSOAP/index.js"
  )
);
const DataFields = React.lazy(() =>
  import("../../components/Properties/PropetiesTab/dataFields/dataFields")
);
const ReceiveInvocation = React.lazy(() =>
  import("../../components/Properties/PropetiesTab/receive/index")
);
const JmsProducer = React.lazy(() =>
  import("../../components/Properties/PropetiesTab/jmsProducer/index")
);
const Options = React.lazy(() =>
  import("../../components/Properties/PropetiesTab/Options/index")
);
const Export = React.lazy(() =>
  import("../../components/Properties/PropetiesTab/Export/index")
);
const EntrySetting = React.lazy(() =>
  import("../../components/Properties/PropetiesTab/ActivityRules/index")
);
const RoutingCriteria = React.lazy(() =>
  import("../../components/Properties/PropetiesTab/ActivityRules/index")
);
const DistributeTab = React.lazy(() =>
  import("../../components/Properties/PropetiesTab/ActivityRules/index")
);
const JmsConsumer = React.lazy(() =>
  import("../../components/Properties/PropetiesTab/JmsConsumer/JmsConsumer")
);
const Collect = React.lazy(() =>
  import("../../components/Properties/PropetiesTab/Collect/Collect")
);
const ParallelCollect = React.lazy(() =>
  import("../../components/Properties/PropetiesTab/Collect/ParallelCollect")
);
const EntryDetails = React.lazy(
  () => import("../../components/Properties/PropetiesTab/ActivityRules/index") //added by mahtab
);
const Reminder = React.lazy(
  () => import("../../components/Properties/PropetiesTab/Reminder/Reminder") //added by mahtab
);
const Timer = React.lazy(
  () => import("../../components/Properties/PropetiesTab/Timer/index") //added by mahtab
);
const WorkdeskTab = React.lazy(() =>
  import("../../components/Properties/PropetiesTab/WorkdeskTab/Workdesk")
);
const Archieve = React.lazy(() =>
  import("../../components/Properties/PropetiesTab/dmsAdapter/Archieve/index")
);
const ForwardMapping_Variables = React.lazy(() =>
  import(
    "../../components/Properties/PropetiesTab/callActivity/forwardMVariables"
  )
);
const ForwardMapping_Variables_ProcessTask = React.lazy(() =>
  import(
    "../../components/Properties/PropetiesTab/ProcessTask/MappingFiles/forwardMVariables"
  )
);
const ForwardMapping_DocTypes = React.lazy(() =>
  import("../../components/Properties/PropetiesTab/callActivity/forwardMDoc")
);
const ForwardMapping_DocTypes_ProcessTask = React.lazy(() =>
  import(
    "../../components/Properties/PropetiesTab/ProcessTask/MappingFiles/forwardMDocs"
  )
);
const ReverseMapping_Variables = React.lazy(() =>
  import(
    "../../components/Properties/PropetiesTab/callActivity/reverseMVariables"
  )
);
const ReverseMapping_Variables_ProcessTask = React.lazy(() =>
  import(
    "../../components/Properties/PropetiesTab/ProcessTask/MappingFiles/reverseMVariables"
  )
);
const ReverseMDoc = React.lazy(() =>
  import("../../components/Properties/PropetiesTab/callActivity/reverseMDoc")
);
const ReverseMDoc_ProcessTask = React.lazy(() =>
  import(
    "../../components/Properties/PropetiesTab/ProcessTask/MappingFiles/reverseMDocs"
  )
);
const Stream = React.lazy(() =>
  import("../../components/Properties/PropetiesTab/Streams/Stream")
);
const SearchVariable = React.lazy(() =>
  import(
    "../../components/Properties/PropetiesTab/SearchVariable/SearchVariable"
  )
);
const SearchResults = React.lazy(() =>
  import("../../components/Properties/PropetiesTab/SearchResults/SearchResults")
);
const IntiateWorkstep = React.lazy(() =>
  import(
    "../../components/Properties/PropetiesTab/InitialWorkstep/InitialWorkstep"
  )
);

const MessageDocMapping = React.lazy(() =>
  import(
    "../../components/Properties/PropetiesTab/InitialWorkstep/MessageDocMapping"
  )
);

const Email = React.lazy(() =>
  import("../../components/Properties/PropetiesTab/Email/Email")
);
const Task = React.lazy(() =>
  import("../../components/Properties/PropetiesTab/Task/Task")
);
const Templates = React.lazy(() =>
  import("../../components/Properties/PropetiesTab/Templates")
);
const OutputVariables = React.lazy(() =>
  import("../../components/Properties/PropetiesTab/OutputVariables")
);
const Sap = React.lazy(() =>
  import("../../components/Properties/PropetiesTab/SAP/Sap")
);
const Requirements = React.lazy(() =>
  import(
    "../../components/ViewingArea/ProcessRequirements&Attchments/ProcessRequirements/index.js"
  )
);
const DataExchange = React.lazy(() =>
  import("../../components/Properties/PropetiesTab/DataExchange")
);
const BusinessRules = React.lazy(() =>
  import("../../components/Properties/PropetiesTab/BusinessRules/index.js")
);
const SharePointArchives = React.lazy(() =>
  import("../../components/Properties/PropetiesTab/sharePointArchives/index.js")
);
const Message = React.lazy(() =>
  import("../../components/Properties/PropetiesTab/Message/index.js")
);


let isReadOnly = false;
// changes made in toolTip for bug_id: 139107
const tabNames = {
  1: {
    name: <BasicDetails heading={tabsHeading[1]} isReadOnly={isReadOnly} />,
    toolTip: tabsHeading[1],
    icon: BasicDetailsIcon,
    icon_enabled: BasicDetailsIcon_EN,
    label: propertiesLabel.basicDetails,
  },
  2: {
    name: <DataFields heading={tabsHeading[2]} />,
    toolTip: tabsHeading[2],
    icon: DataFieldsIcon,
    icon_enabled: DataFieldsIcon_EN,
    label: propertiesLabel.dataFields,
  },
  3: {
    name: <InitialRule heading={tabsHeading[3]} />,
    toolTip: tabsHeading[3],
    icon: InitialRulesIcon,
    icon_enabled: InitialRulesIcon_EN,
    label: propertiesLabel.initialRules,
  },
  4: {
    name: <Requirements heading={tabsHeading[4]} fromArea="activityLevel" />,
    toolTip: tabsHeading[4],
    icon: RequirementsIcon,
    icon_enabled: RequirementsIcon_EN,
    label: propertiesLabel.requirements,
  },
  5: {
    name: <Attachment heading={tabsHeading[5]} />,
    toolTip: tabsHeading[5],
    icon: AttachmentsIcon,
    icon_enabled: AttachmentsIcon_EN,
    label: propertiesLabel.attachments,
  },
  6: {
    name: <WorkdeskTab heading={tabsHeading[6]} />,
    toolTip: tabsHeading[6],
    icon: WorkdeskIcon,
    icon_enabled: WorkdeskIcon_EN,
    label: propertiesLabel.workdesk,
  },
  7: {
    name: <div>Registration to be painted here</div>,
    toolTip: "registration",
    label: propertiesLabel.registration,
  },
  8: {
    name: <div>Event Configuration to be painted here</div>,
    tabToolTip: "eventConfiguration",
    label: propertiesLabel.eventConfiguration,
  },
  9: {
    name: (
      <ForwardMapping_Variables
        tabType="Forward Variable Mapping"
        heading={tabsHeading[9]}
      />
    ),
    toolTip: tabsHeading[9],
    icon: ForwardMapping,
    icon_enabled: ForwardMapping_EN,
    label: propertiesLabel.fwdVarMapping,
  },
  10: {
    name: (
      <ReverseMapping_Variables
        tabType="Reverse Variable Mapping"
        heading={tabsHeading[10]}
      />
    ),
    toolTip: tabsHeading[10],
    icon: ReverseMapping,
    icon_enabled: ReverseMapping_EN,
    label: propertiesLabel.revVarMapping,
  },
  11: {
    name: <EntrySetting heading={tabsHeading[11]} />,
    toolTip: tabsHeading[11],
    icon: EntrySettingsIcon,
    icon_enabled: EntrySettingsIcon_EN,
    label: propertiesLabel.EntrySetting,
  },
  12: {
    name: <Stream heading={tabsHeading[12]} />,
    toolTip: tabsHeading[12],
    icon: StreamsIcon, //code edited on 28 July 2022 for BugId 111551
    icon_enabled: StreamsIcon_EN, //code edited on 28 July 2022 for BugId 111551
    label: propertiesLabel.streams,
  },
  13: {
    name: <Options heading={tabsHeading[13]} />,
    toolTip: tabsHeading[13],
    icon: OptionIcon,
    icon_enabled: OptionIcon_EN,
    label: propertiesLabel.options,
  },
  14: {
    name: <div>Throw Events to be painted here</div>,
    toolTip: "throwEvents",
    icon: Throw,
    label: propertiesLabel.throwEvents,
  },
  15: {
    name: <div>Catch events to be painted here</div>,
    toolTip: "catchEvents",
    icon: Catch,
    label: propertiesLabel.catchEvents,
  },
  16: {
    name: <Task heading={tabsHeading[16]} />,
    toolTip: tabsHeading[16],
    icon: CaseTaskIcon,
    icon_enabled: CaseTaskIcon_EN,
    label: propertiesLabel.task,
  },
  17: {
    name: <ReceiveInvocation heading={tabsHeading[17]} />,
    toolTip: tabsHeading[17],
    icon: ReceiveIcon,
    icon_enabled: ReceiveIcon_EN,
    label: propertiesLabel.receive,
  },
  18: {
    name: <OutputVariables heading={tabsHeading[18]} />,
    toolTip: tabsHeading[18],
    icon: OutputVariablesIcon,
    icon_enabled: OutputVariablesIcon_EN,
    label: propertiesLabel.outputVariables,
  },
  19: {
    name: <Export heading={tabsHeading[19]} />,
    toolTip: tabsHeading[19],
    icon: ExportIcon,
    icon_enabled: ExportIcon_EN,
    label: propertiesLabel.Export,
  },
  20: {
    name: <SearchVariable heading={tabsHeading[20]} />,
    toolTip: tabsHeading[20],
    icon: SearchVariableIcon,
    icon_enabled: SearchVariableIcon_EN,
    label: propertiesLabel.searchVariables,
  },
  21: {
    name: <SearchResults heading={tabsHeading[21]} />,
    toolTip: tabsHeading[21],
    icon: SearchResultIcon,
    icon_enabled: SearchResultIcon_EN,
    label: propertiesLabel.searchResults,
  },
  22: {
    name: <Webservice heading={tabsHeading[22]} />,
    toolTip: tabsHeading[22],
    icon: WebserviceIcon,
    icon_enabled: WebserviceIcon_EN,
    label: propertiesLabel.webService,
  },
  23: {
    name: <BusinessRules heading={tabsHeading[23]} />,
    toolTip:tabsHeading[23],
    icon: BRTIcon,
    icon_enabled: BRTIcon_EN,
    label: propertiesLabel.businessRule,
  },

  24: {
    name: <Archieve heading={tabsHeading[24]} />,
    toolTip: tabsHeading[24],
    icon: ArchieveIcon,
    icon_enabled: ArchieveIcon_EN,
    label: propertiesLabel.archive,
  },
  25: {
    name: <Templates heading={tabsHeading[25]} />,
    toolTip: tabsHeading[25],
    icon: omsTemplatesIcon, //code edited on 26 August 2022 for BugId 111149
    icon_enabled: omsTemplatesIcon_EN, //code edited on 26 August 2022 for BugId 111149
    label: propertiesLabel.templates,
  },
  26: {
    name: <Message heading={tabsHeading[26]} />,
    toolTip: tabsHeading[26],
    icon: EventMessageIcon,
    icon_enabled: EventMessageIcon_EN,
    label: propertiesLabel.message,
  },
  27: {
    name: <EntryDetails heading={tabsHeading[11]} />,
    toolTip: tabsHeading[11],
    icon: EntrySettingsIcon,
    icon_enabled: EntrySettingsIcon_EN,
    label: propertiesLabel.EntrySetting,
  },
  28: {
    name: <JmsProducer heading={tabsHeading[28]} />,
    toolTip: tabsHeading[28],
    icon: JMSProducerIcon,
    icon_enabled: JMSProducerIcon_EN,
    label: propertiesLabel.jmsProducer,
  },
  29: {
    name: <JmsConsumer heading={tabsHeading[29]} />,
    toolTip: tabsHeading[29],
    icon: JMSConsumerIcon,
    icon_enabled: JMSConsumerIcon_EN,
    label: propertiesLabel.jmsConsumer,
  },
  30: {
    name: <Timer heading={tabsHeading[30]} />,
    toolTip: tabsHeading[30],
    icon: TimerIcon,
    icon_enabled: TimerIcon_EN,
    label: propertiesLabel.timer,
  },
  31: {
    name: <Reminder heading={tabsHeading[31]} />,
    toolTip: tabsHeading[31],
    icon: ReminderIcon,
    icon_enabled: ReminderIcon_EN,
    label: propertiesLabel.reminder,
  },
  32: {
    name: <DistributeTab heading={tabsHeading[32]} />,
    toolTip: tabsHeading[32],
    icon: DistributeIcon,
    icon_enabled: DistributeIcon_EN,
    label: propertiesLabel.distribute,
  },
  33: {
    name: <Collect heading={tabsHeading[33]} />,
    toolTip:tabsHeading[33],
    icon: InclusiveCollectIcon,
    icon_enabled: InclusiveCollectIcon_EN,
    label: propertiesLabel.collect,
  },
  34: {
    name: <RoutingCriteria heading={tabsHeading[53]} />,
    toolTip: tabsHeading[53],
    icon: RoutingCriteriaIcon,
    icon_enabled: RoutingCriteriaIcon_EN,
    label: propertiesLabel.routingCriteria,
  },
  35: {
    name: <IntiateWorkstep heading={tabsHeading[35]} />,
    toolTip: tabsHeading[35],
    icon: ForwardMapping,
    icon_enabled: ForwardMapping_EN,
    label: propertiesLabel.initiateWorkstep,
  },
  36: {
    name: <DataExchange heading={tabsHeading[36]} />,
    toolTip:tabsHeading[36],
    icon: DataExchangeIcon,
    icon_enabled: DataExchangeIcon_EN,
    label: propertiesLabel.dataExchange,
  },
  37: {
    name: <Sap heading={tabsHeading[37]} />,
    toolTip: tabsHeading[37], //Modified  on 09/08/2023, bug_id:133620 
    icon: SAPIcon,
    icon_enabled: SAPIcon_EN,
    label: propertiesLabel.sap,
  },
  38: {
    name: <ResponseConsumerJMS heading={tabsHeading[38]} />,
    toolTip: tabsHeading[38],
    icon: JMSConsumerIcon,
    icon_enabled: JMSConsumerIcon_EN,
    label: propertiesLabel.resConJMS,
  },
  39: {
    name: <Options heading={tabsHeading[13]} />,
    toolTip: tabsHeading[13],
    icon: ResponseConsumerSoapIcon,
    icon_enabled: ResponseConsumerSoapIcon_EN,
    label: propertiesLabel.resConSOAP,
  },
  40: {
    name: <RequestConsumerSoap heading={tabsHeading[40]} />,
    toolTip: tabsHeading[40],
    icon: RequestConsumerSoapIcon,
    icon_enabled: RequestConsumerSoapIcon_EN,
    label: propertiesLabel.reqConSOAP,
  },
  41: {
    name: <Restful heading={tabsHeading[41]} />,
    toolTip: tabsHeading[41],
    icon: RestfulIcon,
    icon_enabled: RestfulIcon_EN,
    label: propertiesLabel.Restful,
  },
  42: {
    name: (
      <ForwardMapping_DocTypes
        tabType="Forward DocType Mapping"
        heading={tabsHeading[42]}
      />
    ),
    toolTip: tabsHeading[42],
    icon: fwdDocMappingIcon,
    icon_enabled: fwdDocMappingIcon_EN,
    label: propertiesLabel.fwdDocMapping,
  },
  43: {
    name: (
      <ReverseMDoc
        tabType="Reverse DocType Mapping"
        heading={tabsHeading[43]}
      />
    ),
    toolTip: tabsHeading[43],
    icon: revDocMappingIcon,
    icon_enabled: revDocMappingIcon_EN,
    label: propertiesLabel.revDocMapping,
  },
  44: {
    name: <Email heading={tabsHeading[44]} />,
    toolTip: tabsHeading[44],
    icon: SendIcon,
    icon_enabled: SendIcon_EN,
    label: propertiesLabel.send,
  },
  45: {
    name: <TaskDetails heading={tabsHeading[45]} />,
    toolTip:tabsHeading[45],
    icon: BasicDetailsIcon,
    icon_enabled: BasicDetailsIcon_EN,
    label: propertiesLabel.taskDetails,
  },
  46: {
    name: <TaskEscalationRules heading={tabsHeading[46]} />,
    toolTip: tabsHeading[46],
    icon: EscalationIcon,
    icon_enabled: EscalationIcon_EN,
    label: propertiesLabel.escalationRules,
  },
  47: {
    name: <TaskOptions heading={tabsHeading[13]} />,
    toolTip:tabsHeading[13],
    icon: OptionIcon,
    icon_enabled: OptionIcon_EN,
    label: propertiesLabel.taskOptions,
  },
  48: {
    name: <TaskData heading={tabsHeading[48]} />,
    toolTip: tabsHeading[48],
    icon: DataIcon,
    icon_enabled: DataIcon_EN,
    label: propertiesLabel.taskData,
  },
  49: {
    name: <SharePointArchives heading={tabsHeading[24]} />,
    toolTip: tabsHeading[24],
    label: propertiesLabel.sharePointArchive,
  },
  50: {
    name: (
      <ForwardMapping_DocTypes_ProcessTask
        tabType="Forward DocType Mapping"
        heading={tabsHeading[42]}
      />
    ),
    toolTip: tabsHeading[42],
    icon: fwdDocMappingIcon,
    icon_enabled: fwdDocMappingIcon_EN,
    label: propertiesLabel.fwdDocMappingProcessTask,
  },
  51: {
    name: (
      <ReverseMDoc_ProcessTask
        tabType="Reverse DocType Mapping"
        heading={tabsHeading[43]}
      />
    ),
    toolTip: tabsHeading[43],
    icon: revDocMappingIcon,
    icon_enabled: revDocMappingIcon_EN,
    label: propertiesLabel.revDocMappingProcessTask,
  },
  52: {
    name: (
      <ForwardMapping_Variables_ProcessTask
        tabType="Forward Variable Mapping"
        heading={tabsHeading[9]}
      />
    ),
    toolTip: tabsHeading[9],
    icon: ForwardMapping,
    icon_enabled: ForwardMapping_EN,
    label: propertiesLabel.fwdVarMappingProcessTask,
  },
  53: {
    name: (
      <ReverseMapping_Variables_ProcessTask
        tabType="Reverse Variable Mapping"
        heading={tabsHeading[10]}
      />
    ),
    toolTip: tabsHeading[10],
    icon: ReverseMapping,
    icon_enabled: ReverseMapping_EN,
    label: propertiesLabel.revVarMappingProcessTask,
  },
  54: {
    name: <ParallelCollect heading={tabsHeading[33]} />,
    toolTip: tabsHeading[33],
    label: propertiesLabel.collect,
    icon: ParallelCollectIcon,
    icon_enabled: ParallelCollectIcon_EN,
  },
  55: {
    name: <MessageDocMapping heading={tabsHeading[52]} />,
    toolTip: tabsHeading[52],
    label: propertiesLabel.initiateWorkstep,
    icon: fwdDocMappingIcon,
    icon_enabled: fwdDocMappingIcon_EN,
  },
};

export const propertiesTabsForActivities = (number, readOnly = true) => {
  isReadOnly = readOnly;
  return tabNames[number];
};
