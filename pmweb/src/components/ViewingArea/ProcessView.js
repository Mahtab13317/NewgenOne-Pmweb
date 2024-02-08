// Changes made to solve Bug 113392 - Version history: while opening the previous version from the version history the screen loads forever
//Changes made to solve Bug 121464 -Object rights>> Local process mangement and PMweb menu mangement rights are not working correctly
// #BugID - 120987
// #BugDescription - Handled the functionality when more than 3 process will open after 3rd process rest tab will be shown in a dropdown.
import React, { useState, useEffect } from "react";
import cx from "classnames";
import { useTranslation } from "react-i18next";
import Header from "./Header/Header";
import ViewingArea from "./ViewingArea";
import Tabs from "../../UI/Tab/Tab.js";
import "./ProcessView.css";
import { connect, useDispatch, useSelector } from "react-redux";
import ProcessSettings from "../ProcessSettings";
import DocTypes from "./Tools/DocTypes/DocTypes";
import Exception from "./Tools/Exception/Exception.js";
import DataModel from "../DataModel";
import ToDo from "./Tools/ToDo/ToDo.js";
import TriggerDefinition from "../ProcessSettings/Trigger/TriggerDefinition";
import ServiceCatalog from "../ServiceCatalog";
import { store, useGlobalState } from "state-pool";
import {
  SERVER_URL,
  ENDPOINT_OPENTEMPLATE,
  ENDPOINT_OPENPROCESS,
  userRightsMenuNames,
  PROCESSTYPE_LOCAL,
  PROCESSTYPE_LOCAL_CHECKED,
  PROCESSTYPE_REGISTERED,
  PROCESSTYPE_ENABLED,
  PROCESSTYPE_REGISTERED_CHECKED,
  PROCESSTYPE_ENABLED_CHECKED,
  MAX_TABS_IN_HEADER,
} from "../../Constants/appConstants";
import axios from "axios";
import Requirements from "../ViewingArea/ProcessRequirements&Attchments/index.js";
import ViewsForms from "../ViewsForms/ViewsForms";
import { UserRightsValue } from "../../redux-store/slices/UserRightsSlice";
import { getMenuNameFlag } from "../../utility/UserRightsFunctions";
import { setOpenProcessLoader } from "../../redux-store/slices/OpenProcessLoaderSlice";
import { LatestVersionOfProcess } from "../../utility/abstarctView/checkLatestVersion";

const ProcessView = (props) => {
  let { t } = useTranslation();
  const dispatch = useDispatch();
  const userRightsValue = useSelector(UserRightsValue);
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData, setlocalLoadedProcessData] =
    useGlobalState(loadedProcessData);
  const { openProcessID, openProcessName, openProcessType } = props;
  const [isReadOnly, setIsReadOnly] = useState(false);
  const arrProcessesData = store.getState("arrProcessesData");
  const openProcessesArr = store.getState("openProcessesArr");
  const variablesList = store.getState("variableDefinition");
  const calendarList = store.getState("calendarList");
  const [arr, setArr] = useState([]);
  const [variableList, setLocalVariablesList] = useGlobalState(variablesList);
  const [caseEnabled, setCaseEnabled] = useState(false);
  const [spinner, setspinner] = useState(true);
  const [localArrProcessesData, setLocalArrProcessesData] =
    useGlobalState(arrProcessesData);
  const [localCalendarList, setlocalCalendarList] =
    useGlobalState(calendarList);
  const [localOpenProcessesArr, setLocalOpenProcessesArr] =
    useGlobalState(openProcessesArr);
  const [tabsArray, setTabsArray] = useState([]);

  const [defaultTabValue, setDefaultTabValue] = useState(0);

  const [processData, setProcessData] = useState({
    Connections: [],
    MileStones: [
      {
        iMileStoneId: 1,
        Activities: [
          {
            QueueCategory: "F",
            ActivityName: "Start Event_1",
            ActivityId: 1,
            Color: "1234",
            ActivityType: 1,
            ActivitySubType: 1,
            QueueId: -2,
            isActive: "true",
            FromRegistered: "N",
            EventFlag: "",
            xLeftLoc: "221",
            BlockId: 0,
            id: "",
            yTopLoc: "50",
            LaneId: 1,
            CheckedOut: "",
            QUEUERIGHTS: { MQU: "Y", D: "Y", V: "Y", MQA: "Y", MQP: "Y" },
            SequenceId: 1,
          },
        ],
        xLeftLoc: "",
        BackColor: "1234",
        Height: "",
        id: "",
        MileStoneName: "Milestone_1",
        isActive: "true",
        FromRegistered: "N",
        yTopLoc: "",
        Width: "370",
        SequenceId: 1,
      },
    ],
    Lanes: [
      {
        QueueCategory: "L",
        PoolId: "-1",
        BackColor: "1234",
        LaneName: "Swimlane_1",
        QueueId: "-1",
        FromRegistered: "N",
        xLeftLoc: "0",
        DefaultQueue: "N",
        Height: "140",
        IndexInPool: "-1",
        LaneId: 1,
        yTopLoc: "20",
        Width: "645",
        QUEUERIGHTS: {
          MQU: "Y",
          D: "Y",
          RIGHTBITS: "11111111111111111111",
          V: "Y",
          MQA: "Y",
          MQP: "Y",
        },
        CheckedOut: "",
      },
    ],
    Annotations: [],
    DataObjects: [],
    MSGAFS: [],
    GroupBoxes: [],
  });
  const [initialRender, setInitialRender] = useState(true);
  const [tableName, setTableName] = useState("");

  // Boolean that decides whether todos tab will be shown or not.
  const toDosFlag = getMenuNameFlag(
    userRightsValue?.menuRightsList,
    userRightsMenuNames.todoList
  );

  useEffect(() => {
    if (localLoadedProcessData) {
      // modified on 05/09/2023 for BugId 136103
      setIsReadOnly(
        LatestVersionOfProcess(localLoadedProcessData?.Versions) !==
          +localLoadedProcessData?.VersionNo || props.openTemplateFlag
      );
    }
  }, [localLoadedProcessData]);

  // Boolean that decides whether doc types tab will be shown or not.
  const docTypesFlag = getMenuNameFlag(
    userRightsValue?.menuRightsList,
    userRightsMenuNames.documents
  );

  // Boolean that decides whether service catalog tab will be shown or not.
  const catalogDefinitionFlag = getMenuNameFlag(
    userRightsValue?.menuRightsList,
    userRightsMenuNames.catalogDefinition
  );

  // Boolean that decides whether exception tab will be shown or not.
  const exceptionFlag = getMenuNameFlag(
    userRightsValue?.menuRightsList,
    userRightsMenuNames.exception
  );

  // Boolean that decides whether trigger tab will be shown or not.
  const triggerFlag = getMenuNameFlag(
    userRightsValue?.menuRightsList,
    userRightsMenuNames.trigger
  );

  // Boolean that decides whether form tab will be shown or not.
  const formsFlag = getMenuNameFlag(
    userRightsValue?.menuRightsList,
    userRightsMenuNames.manageForm
  );

  useEffect(() => {
    setArr([
      {
        label: t("navigationPanel.requirements"),
        component: (
          <div
            style={{
              position: "absolute",
              top: "13%",
              height: "90%",
              width: "100%",
              color: "black",
              // fontStyle: "italic", commenting to resolve the bug Id 119931
            }}
          >
            <Requirements isReadOnly={isReadOnly} />
          </div>
        ),
      },
      {
        label: t("navigationPanel.dataModel"),
        component: (
          <DataModel
            localLoadedProcessData={localLoadedProcessData}
            openProcessID={openProcessID}
            openProcessType={openProcessType}
            tableName={tableName}
            isReadOnly={isReadOnly}
          />
        ),
      },
      {
        label: t("navigationPanel.forms"),
        component: <ViewsForms isReadOnly={isReadOnly} />,
      },
      {
        label: t("navigationPanel.exceptions"),
        component: <Exception isReadOnly={isReadOnly} />,
      },
      {
        label: t("navigationPanel.docTypes"),
        component: (
          <DocTypes processType={openProcessType} isReadOnly={isReadOnly} />
        ),
      },
      {
        label: t("navigationPanel.toDos"),
        component: (
          <div>
            <ToDo isReadOnly={isReadOnly} />
          </div>
        ),
      },
      {
        label: t("triggers"),
        component: (
          <TriggerDefinition spinner={spinner} isReadOnly={isReadOnly} />
        ),
      },
      {
        label: t("navigationPanel.serviceCatelog"),
        component: <ServiceCatalog isReadOnly={isReadOnly} />,
      },
      {
        label: t("navigationPanel.settings"),
        component: (
          <div>
            <ProcessSettings
              openProcessID={openProcessID}
              openProcessName={openProcessName}
              openProcessType={openProcessType}
              isReadOnly={isReadOnly}
            />
          </div>
        ),
      },
      // Changes made to solve Bug 133144
      // {
      //   label: t("navigationPanel.helpSection"),
      //   component: (
      //     <div
      //       style={{
      //         position: "absolute",
      //         top: "50%",
      //         left: "35%",
      //         color: "black",
      //         fontStyle: "italic",
      //       }}
      //     >
      //       <p style={{ color: "black" }}>
      //         Help Section Section to be painted here.
      //       </p>
      //     </div>
      //   ),
      // },
    ]);
    //code modified for bug id 127613 on 19-10-23
    // }, [isReadOnly]);
  }, [isReadOnly, openProcessID, openProcessName, openProcessType]);

  useEffect(() => {
    let tempArr = [...arr];
    if (!toDosFlag) {
      let toDosIndex;
      tempArr.forEach((element, index) => {
        if (element.label === t("navigationPanel.toDos")) {
          toDosIndex = index;
        }
      });
      tempArr.splice(toDosIndex, 1);
    }
    if (!docTypesFlag) {
      let docTypeIndex;
      tempArr.forEach((element, index) => {
        if (element.label === t("navigationPanel.docTypes")) {
          docTypeIndex = index;
        }
      });
      tempArr.splice(docTypeIndex, 1);
    }
    if (!catalogDefinitionFlag) {
      let catalogDefinitionIndex;
      tempArr.forEach((element, index) => {
        if (element.label === t("navigationPanel.serviceCatelog")) {
          catalogDefinitionIndex = index;
        }
      });
      tempArr.splice(catalogDefinitionIndex, 1);
    }
    if (!exceptionFlag) {
      let exceptionIndex;
      tempArr.forEach((element, index) => {
        if (element.label === t("navigationPanel.exceptions")) {
          exceptionIndex = index;
        }
      });
      tempArr.splice(exceptionIndex, 1);
    }
    if (!triggerFlag) {
      let triggerIndex;
      tempArr.forEach((element, index) => {
        if (element.label === t("triggers")) {
          triggerIndex = index;
        }
      });
      tempArr.splice(triggerIndex, 1);
    }
    if (!formsFlag) {
      let formIndex;
      tempArr.forEach((element, index) => {
        if (element.label === t("navigationPanel.forms")) {
          formIndex = index;
        }
      });
      tempArr.splice(formIndex, 1);
    }
    setTabsArray(tempArr);
  }, [
    catalogDefinitionFlag,
    docTypesFlag,
    exceptionFlag,
    formsFlag,
    toDosFlag,
    triggerFlag,
    arr,
  ]);

  // Function that gives elements based on type
  const getElementAccToType = (array, type) => {
    let tempArr = [];
    array.forEach((element) => {
      if (type === "tabs") {
        tempArr.push(element.label);
      } else if (type === "components") {
        tempArr.push(element.component);
      }
    });
    return tempArr;
  };

  useEffect(() => {
    if (props.openProcessID) {
      setDefaultTabValue(0);
    }
  }, [props.openProcessID]);

  useEffect(() => {
    if (localLoadedProcessData === null) {
      setspinner(true);
      // code added on 22 Dec 2022 for BugId 120859
      dispatch(
        setOpenProcessLoader({
          loader: true,
        })
      );
    }
  }, [localLoadedProcessData]);

  //fetch processData from openProcess API
  useEffect(() => {
    if (initialRender) {
      //check for existing process data before calling api
      if (localLoadedProcessData !== null) {
        //Modified on 04/10/2023, bug_id:135526
        if (
          !props?.openTemplateFlag &&
          localLoadedProcessData?.ProcessVariantType === "T"
        ) {
          axios
            .get(
              SERVER_URL +
                ENDPOINT_OPENPROCESS +
                props.openProcessID +
                "/" +
                props.openProcessName +
                "/" +
                props?.openProcessType
            )
            .then((res) => {
              if (res.data.Status === 0) {
                const newProcessData = res.data.OpenProcess;
                axios
                  .get(
                    SERVER_URL +
                      "/calendar/" +
                      newProcessData.ProcessDefId +
                      "/" +
                      newProcessData.ProcessType
                  )
                  .then((res) => {
                    setlocalCalendarList(res.data?.Calendar);
                  });
                setTableName(newProcessData.TableName);
                setProcessData(newProcessData);
                setlocalLoadedProcessData(newProcessData);
                setCaseEnabled(newProcessData.TaskRequired);
                let tempArrProcessesData = [...localArrProcessesData];
                tempArrProcessesData.forEach((element, idx) => {
                  if (element.isProcessActive !== undefined) {
                    delete tempArrProcessesData[idx].isProcessActive;
                  }
                });
                if (
                  localOpenProcessesArr.includes(
                    `${newProcessData.ProcessDefId}#${newProcessData.ProcessType}`
                  )
                ) {
                  setspinner(false);
                  // code added on 22 Dec 2022 for BugId 120859
                  dispatch(
                    setOpenProcessLoader({
                      loader: false,
                    })
                  );
                  let activeElemIndex = tempArrProcessesData
                    .map((el) => el.ProcessDefId)
                    .indexOf(newProcessData.ProcessDefId);
                  if (activeElemIndex > 2) {
                    let activeElem = tempArrProcessesData[activeElemIndex];
                    tempArrProcessesData.splice(activeElemIndex, 1);
                    tempArrProcessesData.splice(0, 0, activeElem);
                  }
                  setLocalArrProcessesData(tempArrProcessesData);
                } else {
                  setspinner(false);
                  // code added on 22 Dec 2022 for BugId 120859
                  dispatch(
                    setOpenProcessLoader({
                      loader: false,
                    })
                  );
                  setLocalArrProcessesData([
                    {
                      ProcessDefId: newProcessData.ProcessDefId,
                      ProcessType: newProcessData.ProcessType,
                      ProcessName: newProcessData.ProcessName,
                      ProjectName: newProcessData.ProjectName,
                      VersionNo: newProcessData.VersionNo,
                      ProcessVariantType: newProcessData.ProcessVariantType,
                      RequiredNewVersion: newProcessData.IsNewVersion,
                    },
                    ...tempArrProcessesData,
                  ]);
                  let temp = [...localOpenProcessesArr];
                  temp.splice(
                    0,
                    0,
                    `${newProcessData.ProcessDefId}#${newProcessData.ProcessType}`
                  );
                  setLocalOpenProcessesArr(temp);
                }
                setspinner(false);
                // code added on 22 Dec 2022 for BugId 120859
                dispatch(
                  setOpenProcessLoader({
                    loader: false,
                  })
                );
                setLocalVariablesList(newProcessData.Variable); // Updating VariableList
              }
            })
            .catch((err) => {
              console.log(err);
              setspinner(false);
              // code added on 22 Dec 2022 for BugId 120859
              dispatch(
                setOpenProcessLoader({
                  loader: false,
                })
              );
            });
        } else {
          setProcessData(localLoadedProcessData);
          setCaseEnabled(localLoadedProcessData.TaskRequired);
          setInitialRender(false);
          setspinner(false);
          // code added on 22 Dec 2022 for BugId 120859
          dispatch(
            setOpenProcessLoader({
              loader: false,
            })
          );
        }
        // till here for bug_id:bug_id:135526

        /*  setProcessData(localLoadedProcessData);
        setCaseEnabled(localLoadedProcessData.TaskRequired);
        setInitialRender(false);
        setspinner(false);
        // code added on 22 Dec 2022 for BugId 120859
        dispatch(
          setOpenProcessLoader({
            loader: false,
          })
        ); */
      } else {
        if (
          props.openTemplateFlag &&
          props.templateId !== null &&
          props.templateId !== ""
        ) {
          axios
            .get(
              SERVER_URL +
                ENDPOINT_OPENTEMPLATE +
                "/" +
                props.templateId +
                "/" +
                props.templateName
            )
            .then((res) => {
              if (res.data.Status === 0) {
                const newProcessData = res.data.OpenProcess;
                setTableName(newProcessData.TableName);
                setProcessData(newProcessData);
                setlocalLoadedProcessData(newProcessData);
                setCaseEnabled(newProcessData.TaskRequired);
                let tempArrProcessesData = [...localArrProcessesData];
                tempArrProcessesData.forEach((element, idx) => {
                  if (element.isProcessActive !== undefined) {
                    delete tempArrProcessesData[idx].isProcessActive;
                  }
                });
                if (
                  localOpenProcessesArr.includes(
                    `${newProcessData.ProcessDefId}#${newProcessData.ProcessType}`
                  )
                ) {
                  let activeElemIndex = tempArrProcessesData
                    .map((el) => el.ProcessDefId)
                    .indexOf(newProcessData.ProcessDefId);

                  if (activeElemIndex > MAX_TABS_IN_HEADER - 1) {
                    let activeElem = tempArrProcessesData[activeElemIndex];
                    tempArrProcessesData.splice(activeElemIndex, 1);
                    tempArrProcessesData.splice(0, 0, activeElem);
                  }
                  setLocalArrProcessesData(tempArrProcessesData);
                } else {
                  setLocalArrProcessesData([
                    {
                      TemplateId: props.templateId,
                      TemplateName: props.templateName,
                      ProcessDefId: newProcessData.ProcessDefId,
                      ProcessType: newProcessData.ProcessType,
                      ProcessName: newProcessData.ProcessName,
                      ProjectName: newProcessData.ProjectName,
                      VersionNo: newProcessData.VersionNo,
                      ProcessVariantType: newProcessData.ProcessVariantType,
                    },
                    ...tempArrProcessesData,
                  ]);
                  let temp = [...localOpenProcessesArr];
                  temp.splice(
                    0,
                    0,
                    `${newProcessData.ProcessDefId}#${newProcessData.ProcessType}`
                  );
                  setLocalOpenProcessesArr(temp);
                }

                setspinner(false);
                // code added on 22 Dec 2022 for BugId 120859
                dispatch(
                  setOpenProcessLoader({
                    loader: false,
                  })
                );
              }
            })
            .catch((err) => console.log(err));
        } else if (props.openProcessID !== null && props.openProcessID !== "") {
          let processType =
            props.openProcessType === PROCESSTYPE_LOCAL ||
            props.openProcessType === PROCESSTYPE_LOCAL_CHECKED
              ? "L"
              : props.openProcessType === PROCESSTYPE_REGISTERED ||
                props.openProcessType === PROCESSTYPE_ENABLED ||
                props.openProcessType === PROCESSTYPE_REGISTERED_CHECKED ||
                props.openProcessType === PROCESSTYPE_ENABLED_CHECKED
              ? "R"
              : props.openProcessType;
          axios
            .get(
              SERVER_URL +
                ENDPOINT_OPENPROCESS +
                props.openProcessID +
                "/" +
                props.openProcessName +
                "/" +
                processType
            )
            .then((res) => {
              if (res.data.Status === 0) {
                const newProcessData = res.data.OpenProcess;
                axios
                  .get(
                    SERVER_URL +
                      "/calendar/" +
                      newProcessData.ProcessDefId +
                      "/" +
                      newProcessData.ProcessType
                  )
                  .then((res) => {
                    setlocalCalendarList(res.data?.Calendar);
                  });
                setTableName(newProcessData.TableName);
                setProcessData(newProcessData);
                setlocalLoadedProcessData(newProcessData);
                setCaseEnabled(newProcessData.TaskRequired);
                let tempArrProcessesData = [...localArrProcessesData];
                tempArrProcessesData.forEach((element, idx) => {
                  if (element.isProcessActive !== undefined) {
                    delete tempArrProcessesData[idx].isProcessActive;
                  }
                });
                if (
                  localOpenProcessesArr.includes(
                    `${newProcessData.ProcessDefId}#${newProcessData.ProcessType}`
                  )
                ) {
                  setspinner(false);
                  // code added on 22 Dec 2022 for BugId 120859
                  dispatch(
                    setOpenProcessLoader({
                      loader: false,
                    })
                  );
                  let activeElemIndex = tempArrProcessesData
                    .map((el) => el.ProcessDefId)
                    .indexOf(newProcessData.ProcessDefId);
                  if (activeElemIndex > 2) {
                    let activeElem = tempArrProcessesData[activeElemIndex];
                    tempArrProcessesData.splice(activeElemIndex, 1);
                    tempArrProcessesData.splice(0, 0, activeElem);
                  }
                  setLocalArrProcessesData(tempArrProcessesData);
                } else {
                  setspinner(false);
                  // code added on 22 Dec 2022 for BugId 120859
                  dispatch(
                    setOpenProcessLoader({
                      loader: false,
                    })
                  );
                  setLocalArrProcessesData([
                    {
                      ProcessDefId: newProcessData.ProcessDefId,
                      ProcessType: newProcessData.ProcessType,
                      ProcessName: newProcessData.ProcessName,
                      ProjectName: newProcessData.ProjectName,
                      VersionNo: newProcessData.VersionNo,
                      ProcessVariantType: newProcessData.ProcessVariantType,
                      RequiredNewVersion: newProcessData.IsNewVersion,
                    },
                    ...tempArrProcessesData,
                  ]);
                  let temp = [...localOpenProcessesArr];
                  temp.splice(
                    0,
                    0,
                    `${newProcessData.ProcessDefId}#${newProcessData.ProcessType}`
                  );
                  setLocalOpenProcessesArr(temp);
                }
                setspinner(false);
                // code added on 22 Dec 2022 for BugId 120859
                dispatch(
                  setOpenProcessLoader({
                    loader: false,
                  })
                );
                setLocalVariablesList(newProcessData.Variable); // Updating VariableList
              }
            })
            .catch((err) => {
              console.log(err);
              setspinner(false);
              // code added on 22 Dec 2022 for BugId 120859
              dispatch(
                setOpenProcessLoader({
                  loader: false,
                })
              );
            });
        }
      }
    } else {
      setspinner(false);
      // code added on 22 Dec 2022 for BugId 120859
      dispatch(
        setOpenProcessLoader({
          loader: false,
        })
      );
    }
  }, [localLoadedProcessData, initialRender]);

  // connections in localLoadedProcessData updated in properties section, and to reflect that on
  // screen processData needs to be updated
  useEffect(() => {
    if (localLoadedProcessData !== null) {
      setProcessData(localLoadedProcessData);
      setCaseEnabled(localLoadedProcessData.TaskRequired);
    }
  }, [
    localLoadedProcessData?.Connections,
    localLoadedProcessData?.Versions,
    localLoadedProcessData?.TaskRequired,
  ]);

  useEffect(() => {
    if (
      props.openTemplateFlag &&
      props.templateId !== null &&
      props.templateId !== ""
    ) {
      setInitialRender(true);
      setspinner(true);
      // code added on 22 Dec 2022 for BugId 120859
      dispatch(
        setOpenProcessLoader({
          loader: true,
        })
      );
    } else if (
      !props.openTemplateFlag &&
      props.openProcessID !== null &&
      props.openProcessID !== ""
    ) {
      setInitialRender(true);
      setspinner(true);
      // code added on 22 Dec 2022 for BugId 120859
      dispatch(
        setOpenProcessLoader({
          loader: true,
        })
      );
    }
  }, [props.openProcessID, props.openProcessVersion, props.templateId]);

  return (
    <div
      className="tabViewingArea"
      style={{
        pointerEvents: spinner ? "none" : "auto",
      }}
    >
      {/*code edited on 26 July 2022 for BugId 110024*/}
      <Header processData={processData} setProcessData={setProcessData} />
      <td style={{ direction: `${t("HTML_DIR")}` }}>
        <Tabs
          defaultTabValue={defaultTabValue}
          setValue={(val) => {
            setDefaultTabValue(val);
          }}
          // code added on 5 April 2023 for BugId 112610
          tabListStyle={{
            pointerEvents: props.showDrawer ? "none" : "auto",
          }}
          tabType="processSubTab"
          tabContentStyle="processSubTabContentStyle"
          tabBarStyle="processSubTabBarStyle"
          oneTabStyle="processSubOneTabStyle"
          tabStyling="processViewTabs"
          tabsStyle="processViewSubTabs"
          TabNames={[
            t("navigationPanel.processFlow"),
            ...getElementAccToType(tabsArray, "tabs"),
          ]}
          TabElement={[
            <div
              className={cx("pmviewingArea")}
              style={{ marginTop: "0", height: "calc(100vh - 10.5rem)" }} //code edited on 6 Sep 2022 for BugId 114227
            >
              <ViewingArea
                isReadOnly={isReadOnly}
                processType={openProcessType}
                displayMessage={props.setDisplayMessage}
                processData={processData}
                setProcessData={setProcessData}
                caseEnabled={caseEnabled}
                initialRender={initialRender}
                spinner={spinner}
              />
            </div>,
            ...getElementAccToType(tabsArray, "components"),
          ]}
        />
      </td>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    openProcessID: state.openProcessClick.selectedId,
    openProcessName: state.openProcessClick.selectedProcessName,
    openProcessType: state.openProcessClick.selectedType,
    templateId: state.openTemplateReducer.templateId,
    templateName: state.openTemplateReducer.templateName,
    openTemplateFlag: state.openTemplateReducer.openFlag,
    openProcessVersion: state.openProcessClick.selectedVersion,
    showDrawer: state.showDrawerReducer.showDrawer,
  };
};

export default connect(mapStateToProps)(ProcessView);
