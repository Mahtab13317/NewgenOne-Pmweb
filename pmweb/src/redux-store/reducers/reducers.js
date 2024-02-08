import { combineReducers } from "redux";
import clickedProcessTileReducer from "./processView/clickedProcessTileReducer";
import processTypesReducer from "./processView/processTypesReducer";
import defaultProcessTileReducer from "./processView//defaultProcessTileReducer";
import selectedTabAtNavReducer from "./processView/selectedTabAtNavPanel";
import openProcessClick from "./Home/openProcessClick";
import selectedCellReducer from "./selectedCellReducers";
import showDrawerReducer from "./Properties/showDrawerReducer.js";
import expandedProcessReducer from "./AbstractView/EmbeddedProcessReducer";
import taskReducer from "./AbstractView/TaskReducer";
import triggerReducer from "./Trigger";
import createProcessFlag from "./processView/createProcessFlag";
import openTemplateReducer from "./processView/openTemplateReducer";
import expandDrawerReducer from "./Properties/ExpandDrawerReducer.js";
import selectedProjectReducer from "./processView/selectedProjectReducer";
import templateReducer from "./Template";
import ActivityPropertyChangeReducer from "../slices/ActivityPropertyChangeSlice";
import ActivityPropertySaveCancelReducer from "../slices/ActivityPropertySaveCancelClicked";
import ImportExportSliceReducer from "../slices/ImportExportSlice";
import ToastDataHandlerReducer from "../slices/ToastDataHandlerSlice";
import LaunchpadTokenReducer from "../slices/LaunchpadTokenSlice";
import globalTaskTemplateReducer from "./Properties/GlobalTaskTemplateReducer";
import OpenProcessSliceReducer from "../slices/OpenProcessSlice";
import OpenProcessLoaderSliceReducer from "../slices/OpenProcessLoaderSlice";
import UserRightsDataHandlerReducer from "../slices/UserRightsSlice";
import ProcessTaskTypeReducer from "../slices/ProcessTaskTypeSlice";
import WebserviceChangeReducer from "../slices/webserviceChangeSlice";
import ProjectCreationReducer from "../slices/projectCreationSlice";
import ActivityCheckoutReducer from "../slices/ActivityCheckoutSlice";
import activityReducer from "./Properties/activityReducer";
import userReducer from "./userDetail/reducer";
import processListReducer from "../slices/processListSlice";
import previousProcessPageReducer from "../slices/storeProcessPage";
import InitialRenderReducer from "../slices/InitialRenderSlice";
import globalSettingsReducer from "./GlobalSettings/globalsettingsreducer";
import setWindowInnerHeight from "./processView/setWindowInnerHeight";
import MarvinPromptHistoryReducer from "../slices/MarvinPromtHistorySlice.js";
import brandDetailsReducer from "../slices/brandDetails/brandDetailsSlice.js";

export default combineReducers({
  processTypesReducer: processTypesReducer,
  clickedProcessTileReducer: clickedProcessTileReducer, //which processTile is clicked at Home Page
  defaultProcessTileReducer: defaultProcessTileReducer, //Which processType to open by Default when we choose 'PROCESSES' from Main Navigation Panel.
  selectedTabAtNavReducer: selectedTabAtNavReducer, //which tab is selected at main Navigation Panel
  openProcessClick: openProcessClick,
  selectedCellReducer: selectedCellReducer, //which cell is selected in AbstractView or BPMN View
  showDrawerReducer: showDrawerReducer, // when to show Side Drawer for Activity Properties
  expandedProcessReducer: expandedProcessReducer,
  taskReducer: taskReducer,
  triggerReducer: triggerReducer,
  createProcessFlag: createProcessFlag, // when user click create process btn
  openTemplateReducer: openTemplateReducer, // when a particular card is being previewed
  selectedProjectReducer: selectedProjectReducer,
  isDrawerExpanded: expandDrawerReducer, // Boolean that tells if the drawer in activity view is expanded or not.
  templateReducer: templateReducer,
  activityPropertyChange: ActivityPropertyChangeReducer,
  activityPropertySaveCancel: ActivityPropertySaveCancelReducer,
  importExportSlice: ImportExportSliceReducer,
  openProcessSlice: OpenProcessSliceReducer,
  toastDataHandlerSlice: ToastDataHandlerReducer,
  launchpadTokenSlice: LaunchpadTokenReducer,
  globalTaskTemplate: globalTaskTemplateReducer,
  userRightsDataHandlerSlice: UserRightsDataHandlerReducer,
  webserviceChange: WebserviceChangeReducer,
  projectCreation: ProjectCreationReducer,
  processTaskTypeSlice: ProcessTaskTypeReducer,
  activityCheckout: ActivityCheckoutReducer,
  activityReducer: activityReducer,
  userDetails: userReducer,
  processList: processListReducer,
  storeProcessPage: previousProcessPageReducer,
  openProcessLoader: OpenProcessLoaderSliceReducer,
  initialRenderSlice: InitialRenderReducer,
  globalSettingsReducer: globalSettingsReducer,
  setWindowInnerHeight: setWindowInnerHeight,
  promptHistory: MarvinPromptHistoryReducer,
  brandDetails: brandDetailsReducer,
});
