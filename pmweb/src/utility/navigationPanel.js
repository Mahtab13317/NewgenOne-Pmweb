import DataModel from "../assets/navigationPanelIcon/DataModel.svg";
import Documents from "../assets/navigationPanelIcon/Documents.svg";
import Interfaces from "../assets/navigationPanelIcon/InterfacesCopy.svg";
import ProcessFlow from "../assets/navigationPanelIcon/ProcessFlow.svg";
import Requirements from "../assets/navigationPanelIcon/Requirements.svg";
import MyInbox from "../assets/navigationPanelIcon/InboxEnabled.svg";
import SelectedMyInbox from "../assets/navigationPanelIcon/InboxSelected.svg";
import Processes from "../assets/navigationPanelIcon/ProcessEnabled.svg";
import SelectedProcesses from "../assets/navigationPanelIcon/ProcessSelected.svg";
import Home from "../assets/navigationPanelIcon/HomeEnabled.svg";
import SelectedHome from "../assets/navigationPanelIcon/HomeSelected.svg";
import Create from "../assets/navigationPanelIcon/Create.svg";
import Template from "../assets/navigationPanelIcon/TemplatesEnabled.svg";
import SelectedTemplate from "../assets/navigationPanelIcon/TemplatesSelected.svg";
import Settings from "../assets/navigationPanelIcon/SettingsEnabled.svg";
import SelectedSettings from "../assets/navigationPanelIcon/SettingsSelected.svg";
import AuditLog from "../assets/navigationPanelIcon/AuditLogEnabled.svg";
import SelectedAuditLog from "../assets/navigationPanelIcon/AuditLogSelected.svg";

export let defaultSelectedForProcessView = "navigationPanel.processFlow";
export let defaultSelectedForMainView = "navigationPanel.home";

export let iconsForMainView = [
  {
    icon: Create,
    default: "Create",
    langKey: "navigationPanel.create",
    noCaption: true,
  },
  {
    icon: Home,
    selectedIcon: SelectedHome,
    default: "Home",
    langKey: "navigationPanel.home",
  },
  // {
  //   icon: MyInbox,
  //   selectedIcon: SelectedMyInbox,
  //   default: "My Inbox",
  //   langKey: "navigationPanel.myInbox",
  // },
  {
    icon: Processes,
    selectedIcon: SelectedProcesses,
    default: "Processes",
    langKey: "navigationPanel.processes",
  },
  {
    icon: Template,
    selectedIcon: SelectedTemplate,
    default: "Templates",
    langKey: "navigationPanel.templates",
  },
  {
    icon: Settings,
    selectedIcon: SelectedSettings,
    default: "Settings",
    langKey: "navigationPanel.settings",
  },
  {
    icon: AuditLog,
    selectedIcon: SelectedAuditLog,
    default: "Audit Log",
    langKey: "navigationPanel.auditLog",
  },
];

export let iconsForProcessView = [
  {
    icon: Requirements,
    default: "Requirements",
    langKey: "navigationPanel.requirements",
  },
  {
    icon: ProcessFlow,
    default: "Process Flow",
    langKey: "navigationPanel.processFlow",
  },
  {
    icon: DataModel,
    default: "Data Model",
    langKey: "navigationPanel.dataModel",
  },
  {
    icon: Interfaces,
    default: "Interfaces",
    langKey: "navigationPanel.interfaces",
  },
  {
    icon: Documents,
    default: "Documents",
    langKey: "navigationPanel.documents",
  },
];
