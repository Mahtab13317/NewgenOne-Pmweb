// Pollyfills for IE and edge
import "react-app-polyfill/ie11";
import "react-app-polyfill/stable";
import React, { lazy, Suspense } from "react";
import ReactDOM from "react-dom";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
// import './locale/locale';
import "./i18n";
import { Provider } from "react-redux";
import { createStore, applyMiddleware, compose } from "redux";
import reducers from "./redux-store/reducers/reducers";
import thunk from "redux-thunk";
import theme from "./assets/theme/theme";
import {
  ThemeProvider,
  CssBaseline,
  CircularProgress,
} from "@material-ui/core";
import {
  StylesProvider,
  createGenerateClassName,
} from "@material-ui/core/styles";
import styles from "./index.module.css";
import { setToastDataFunc } from "./redux-store/slices/ToastDataHandlerSlice";
// import processTypesReducer from "./redux-store/reducers/processView/processTypesReducer";

// const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const App = lazy(() => import("./containers/App"));
const store = createStore(reducers, applyMiddleware(thunk));

window.showNotification = function ({ message, severity = "success" }) {
  if (message && typeof message === "string") {
    store.dispatch(
      setToastDataFunc({
        message,
        severity,
        open: true,
      })
    );
  }
};

window.loadIntegrator = function () {
  const scriptInt = document.createElement("script");
  scriptInt.type = "text/javascript";
  scriptInt.src = "/integration/integration.js";
  scriptInt.onload = () => {
    console.log("inside integration compo");
  };

  document.body.appendChild(scriptInt);
};

// code added on 21 Feb 2023 for BugId 124125
window.loadSessionPopup = function (props) {
  if (window && window?.loadMicroFrontend) {
    window.loadMicroFrontend(props);
  }
};

window.MdmDataModelPMWEB = function (props) {
  if (window && window?.loadMicroFrontend) {
    window.loadMicroFrontend(props);
  }
};
window.loadUserGroupMF = function (props) {
  if (window && window?.loadMicroFrontend) {
    window.loadMicroFrontend(props);
  }
};

window.loadActivityStreampmweb = function (callback) {
  window.lpweb_containerId_mf = "mf_activitystream_lpweb";
  var props = {
    Module: "LPWEB",
    Component: "ActivityStream",
    InFrame: false,
    ContainerId: "mf_activitystream_lpweb",
    Callback: callback,
    passedData: { componentId: "PMWEB" },
    Renderer: "renderActivityStream",
    helpUrl: `${window.ConfigsLocal.help_URL}?rhmapno=1408`,
  };
  try {
    if (window && window?.loadMicroFrontend) {
      window.loadMicroFrontend(props);
    }
  } catch (err) {
    console.log(err);
  }
};

window.loadFormTemplates = function (callback) {
  window.appdesigner_containerId_mf = "mf_forms_int_des";
  var props = {
    Module: "INTERFACEDESIGNER",
    Component: "template",
    InFrame: false,
    ContainerId: "mf_forms_int_des",
    Callback: callback,
    passedData: null,
    // isMF: true,
    Renderer: "renderTemplate",
  };

  if (window && window?.loadMicroFrontend) {
    window.loadMicroFrontend(props);
  }
};

window.loadForm_INT_DES = function (callback) {
  window.appdesigner_containerId_mf = "mf_formsOtherProcesses";
  var props = {
    Module: "INTERFACEDESIGNER",
    Component: "forms",
    InFrame: false,
    ContainerId: "mf_formsOtherProcesses",
    Callback: callback,
    passedData: null,
    isMF: true,
    Renderer: "renderForms",
    // processState: processType,
    // processDefIdArray: arrProcessDefId,
  };

  if (window && window?.loadMicroFrontend) {
    window.loadMicroFrontend(props);
  }
};

window.loadForm_DesignerPreview = function (passedData, containerId) {
  let passedProps = { ...passedData, device: "Mobile", activePage: undefined };
  var props = {
    Module: "FORMBUILDER",
    Component: "Preview",
    // "Component": "Interface",
    InFrame: false,
    ContainerId: containerId || "process_form_opening_mf",
    Callback: null,
    passedData: passedProps,
  };
  if (window && window?.loadMicroFrontend) {
    window.loadMicroFrontend(props);
  }
};

window.loadFormBuilderPMWEB = function (containerId, passedData, callbackFn) {
  window.formBuilder_containerId_mf = containerId;
  let passedProps = { ...passedData, activePage: undefined };
  passedProps.formPageType = "Processes";
  var props = {
    Module: "FORMBUILDER",
    Component: "App",
    InFrame: false,
    ContainerId: containerId,
    Callback: !!callbackFn ? callbackFn : (data) => console.log(data),
    passedData: passedProps,
  };

  if (window && window?.loadMicroFrontend) {
    window.loadMicroFrontend(props);
  }
};

window.loadFormBuilderPreview = function (passedData, containerId) {
  window.formBuilder_containerId_mf = containerId;
  var props = {
    Module: "FORMBUILDER",
    Component: "Preview",
    // "Component": "Interface",
    InFrame: false,
    ContainerId: containerId,
    Callback: null,
    // code modified on 05-10-23 for BugId 136219
    // passedData: { ...passedData,device: "Mobile", activePage: undefined },

    passedData: { device: "Mobile", ...passedData, activePage: undefined },
  };

  if (window && window?.loadMicroFrontend) {
    window.loadMicroFrontend(props);
  }
};

window.loadFormBusinessFuncPMWEB = function (containerId, passedData) {
  var props = {
    Module: "FORMBUILDER",
    Component: "template",
    InFrame: false,
    ContainerId: containerId,
    Callback: null,
    passedData: passedData,
    Renderer: "renderReusableBusinessFunction",
  };
  if (window && window?.loadMicroFrontend) {
    window.loadMicroFrontend(props);
  }
};

// Function that gets called when maker checker option is selected from more options dropdown.
window.loadInboxMC = function () {
  // window.lpweb_containerId_mf = "mf_inbox_oapweb";

  let props = {
    Module: "WCL",
    Component: "Inbox",
    InFrame: false,
    ContainerId: "mf_inbox_oapweb",
    Callback: null,
    passedData: null,
    Renderer: "renderInbox",
  };

  if (window && window?.loadMicroFrontend) {
    window.loadMicroFrontend(props);
  }
};

window.loadCalender = function (props) {
  if (window && window?.loadMicroFrontend) {
    window.loadMicroFrontend(props);
  }
};
window.loadDoclist = function (props) {
  if (window && window?.loadMicroFrontend) {
    window.loadMicroFrontend(props);
  }
};

window.loadMicroFrontend_formBuilder = function (props) {
  if (window && window?.loadMicroFrontend) {
    window.loadMicroFrontend(props);
  }
};

window.MdmDataObjectsModel = function (props) {
  if (window && window?.loadMicroFrontend) {
    window.loadMicroFrontend(props);
  }
};

// const launchpadKey = JSON.parse(localStorage.getItem("launchpadKey"));
// const token = launchpadKey?.token;
// if (token) {
//   axios.interceptors.request.use(function (config) {
//     config.headers.Authorization = token;
//     return config;
//   });
// }
if (process.env.NODE_ENV === "production") {
  console.log = () => {};
  console.error = () => {};
  console.debug = () => {};
}

const generateClassName = createGenerateClassName({
  disableGlobal: true,
  productionPrefix: "pmwebPD",
});
ReactDOM.render(
  <React.StrictMode>
    {/*code added on 29 Oct 2022 for BugId 116837*/}
    <StylesProvider generateClassName={generateClassName}>
      <Suspense
        fallback={
          <div className={styles.divHeight}>
            <CircularProgress />
          </div>
        }
      >
        <Provider store={store}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <App />
          </ThemeProvider>
        </Provider>
      </Suspense>
    </StylesProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
