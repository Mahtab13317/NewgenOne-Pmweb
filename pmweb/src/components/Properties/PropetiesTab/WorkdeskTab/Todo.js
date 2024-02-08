// #BugID - 121537
// #BugDescription - Add todo modals button disabling issue has been fixed.
// #BugID - 122156
// #BugDescription - Design issue fixed for workdesk TODO.
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import styles from "./todo.module.css";
import { MenuItem, Checkbox, Grid, FormGroup } from "@material-ui/core";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { store, useGlobalState } from "state-pool";
import AddToDo from "../../../ViewingArea/Tools/ToDo/AddToDo";
import Modal from "@material-ui/core/Modal";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "react-redux";
import { setActivityPropertyChange } from "../../../../redux-store/slices/ActivityPropertyChangeSlice";
import CustomizedDropdown from "../../../../UI/Components_With_ErrrorHandling/Dropdown";
import axios from "axios";
import { LightTooltip } from "../../../../UI/StyledTooltip";
import { shortenRuleStatement } from "../../../../utility/CommonFunctionCall/CommonFunctionCall";
import {
  SERVER_URL,
  ENDPOINT_ADD_TODO,
  ENDPOINT_ADD_GROUP,
  RTL_DIRECTION,
  propertiesLabel,
  PROCESSTYPE_DEPLOYED,
  PROCESSTYPE_REGISTERED,
} from "../../../../Constants/appConstants";
import arabicStyles from "./ArabicStyles.module.css";
import { setToastDataFunc } from "../../../../redux-store/slices/ToastDataHandlerSlice";
import {
  OpenProcessSliceValue,
  setOpenProcess,
} from "../../../../redux-store/slices/OpenProcessSlice";
import "./index.css";
import { isReadOnlyFunc } from "../../../../utility/CommonFunctionCall/CommonFunctionCall";
import {
  decode_utf8,
  encode_utf8,
} from "../../../../utility/UTF8EncodeDecoder";
import { useRef } from "react";

function Todo(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const loadedActivityPropertyData = store.getState("activityPropertyData");
  const [localLoadedActivityPropertyData, setlocalLoadedActivityPropertyData] =
    useGlobalState(loadedActivityPropertyData);
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const [checkTodo, setCheckTodo] = useState(false);
  const [allToDoData, setAllToDoData] = useState([]);
  const [defineListVal, setDefineListVal] = useState("");
  const [todoDesc, setTodoDesc] = useState("");
  const [mandatoryCheck, setMandatoryCheck] = useState(false);
  const [readOnlyCheck, setReadOnlyCheck] = useState(false);
  const [tempTodoItem, setTempTodoItem] = useState(null);
  const [todoItemData, setTodoItemData] = useState([]);
  const [associatedField, setAssociatedField] = useState("defaultValue");
  const [selectType, setSelectType] = useState(null);
  const [selectedTodoItem, setselectedTodoItem] = useState(null);
  const [addTodo, setAddTodo] = useState(false);
  const [editableField, setEditableField] = useState(false);
  const [showTriggerError, setShowTriggerError] = useState(false);
  const [triggerData, setTriggerData] = useState();
  const [toDoData, setToDoData] = useState({
    TodoGroupLists: [],
  });
  const [toDoType, setToDoType] = useState("M"); // code edited on 29 June 2023 for BugId 130728
  const [associateField, setAssociateField] = useState(null);
  const [pickList, setPickList] = useState([]);
  const [mandatoryCheckTodo, setMandatoryCheckTodo] = useState(false);
  const [selectedTrigger, setSelectedTrigger] = useState("");
  const associateFields = ["CalendarName", "Status", "CalenderName"]; // code added on 05 Dec 2022 for BugId 120012
  const dispatch = useDispatch();
  const openProcessData = useSelector(OpenProcessSliceValue);
  const [localState, setLocalState] = useState(null);
  const [addAnotherTodo, setAddAnotherTodo] = useState(false);
  let isReadOnly =
    props.isReadOnly ||
    isReadOnlyFunc(
      localLoadedProcessData,
      props.cellCheckedOut,
      props.cellLaneId
    );
  const [disableAddBtn, setDisableAddBtn] = useState(null);
  const checkTodoRef = useRef();
  const mandatoryRef = useRef();
  const readOnlyRef = useRef();
  const markRef = useRef();
  const pickListRef = useRef();
  const triggerRef = useRef();

  useEffect(() => {
    let tempList = {
      ...localLoadedActivityPropertyData?.ActivityProperty?.wdeskInfo
        ?.objPMWdeskTodoLists?.todoMap,
    };
    Object.keys(tempList).forEach((el) => {
      tempList[el] = { ...tempList[el], editable: false };
    });
    setTodoItemData(tempList);
    setCheckTodo(
      localLoadedActivityPropertyData?.ActivityProperty?.wdeskInfo
        ?.objPMWdeskTodoLists?.todoRendered
    );
  }, [localLoadedActivityPropertyData]);

  useEffect(() => {
    let todoIdString = "";
    openProcessData.loadedData?.MileStones?.forEach((mileStone) => {
      mileStone.Activities?.forEach((activity) => {
        todoIdString = todoIdString + activity.ActivityId + ",";
      });
    });
    setAllToDoData(openProcessData.loadedData?.ToDoList);
    setLocalState(openProcessData.loadedData);
    // code edited on 16 May 2023 for BugId 127715
    if (openProcessData.loadedData?.ProcessDefId) {
      axios
        .get(
          SERVER_URL +
            `/todo/${openProcessData.loadedData?.ProcessDefId}/${openProcessData.loadedData?.ProcessType}/${openProcessData.loadedData?.ProcessName}/${todoIdString}`
        )
        .then((res) => {
          if (res.data.Status === 0) {
            setToDoData(res.data);
            setTriggerData(res.data.Trigger);
          }
        });
    }
  }, [openProcessData.loadedData]);

  const CheckTodoHandler = (e) => {
    let val;
    /* setCheckTodo((prev) => {
      val = !prev;
      return !prev;
    }); */
    let temp = JSON.parse(JSON.stringify(localLoadedActivityPropertyData));
    if (temp?.ActivityProperty?.wdeskInfo) {
      if (temp?.ActivityProperty?.wdeskInfo?.objPMWdeskTodoLists) {
        temp.ActivityProperty.wdeskInfo.objPMWdeskTodoLists = {
          ...temp.ActivityProperty.wdeskInfo.objPMWdeskTodoLists,
          todoRendered: e.target.checked,
        };
      } else {
        temp.ActivityProperty.wdeskInfo = {
          ...temp.ActivityProperty.wdeskInfo,
          objPMWdeskTodoLists: {
            todoRendered: e.target.checked,
          },
        };
      }
    } else {
      temp.ActivityProperty = {
        ...temp.ActivityProperty,
        wdeskInfo: {
          objPMWdeskTodoLists: {
            todoRendered: val,
          },
        },
      };
    }

    setCheckTodo(e.target.checked);
    setlocalLoadedActivityPropertyData(temp);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.workdesk]: { isModified: true, hasError: false },
      })
    );
  };

  const definedListHandler = (e) => {
    setDefineListVal(e.target.value);
    setselectedTodoItem(null);
    setReadOnlyCheck(false);
    let selectedTodo = null;
    toDoData.TodoGroupLists.forEach((group) => {
      group.ToDoList.forEach((listElem) => {
        if (listElem.ToDoName === e.target.value) {
          selectedTodo = listElem;
        }
      });
    });
    if (selectedTodo) {
      setTodoDesc(selectedTodo.Description);
      setSelectType(selectedTodo.Type);
      setMandatoryCheck(selectedTodo.Mandatory);
      if (selectedTodo.FieldName == "&lt;None&gt;") {
        setAssociatedField("defaultValue");
      } else {
        setAssociatedField(selectedTodo.FieldName);
      }

      if (selectedTodo.Type == "T") {
        setSelectedTrigger(selectedTodo.TriggerName);
      }
    } else {
      setTodoDesc("");
      setSelectType(null);
      setMandatoryCheck(false);
      setAssociatedField("defaultValue");
      setSelectedTrigger("");
    }
    setTempTodoItem(e.target.value);
  };

  const todoItemHandler = (val) => {
    let clickedTodo = todoItemData[val];
    setEditableField(clickedTodo.editable);
    setReadOnlyCheck(clickedTodo.isReadOnly);
    let clickedTodoProp = clickedTodo.todoTypeInfo;
    setDefineListVal(clickedTodoProp.todoName);
    setTodoDesc(clickedTodoProp.todoDesc);
    if (clickedTodoProp.associatedField === "&lt;None&gt;") {
      setAssociatedField("defaultValue");
    } else {
      setAssociatedField(clickedTodoProp.associatedField);
    }
    setSelectType(clickedTodoProp.ViewType);
    setMandatoryCheck(clickedTodoProp.mandatory);
    setselectedTodoItem(val);
    // code added on 19 October 2022 for BugId 115479
    let selectedTodo = null;
    toDoData.TodoGroupLists.forEach((group) => {
      group.ToDoList.forEach((listElem) => {
        if (listElem.ToDoName === val) {
          selectedTodo = listElem;
        }
      });
    });

    if (selectedTodo.Type == "T") {
      setSelectedTrigger(selectedTodo.TriggerName);
    }
  };

  const descHandler = (e) => {
    setTodoDesc(e.target.value);
  };

  const mandatoryHandler = () => {
    setMandatoryCheck(!mandatoryCheck);
  };

  const handleMandatoryCheck = (checkValue) => {
    setMandatoryCheckTodo(checkValue);
  };

  const addHandler = () => {
    let alreadyPresent = todoItemData[tempTodoItem];
    if (!alreadyPresent) {
      let selectedTodo = null;
      setTodoItemData((prev) => {
        let temp = { ...prev };
        toDoData.TodoGroupLists.forEach((group) => {
          group.ToDoList.forEach((listElem) => {
            if (listElem.ToDoName === tempTodoItem) {
              selectedTodo = listElem;
            }
          });
        });
        if (selectedTodo) {
          temp[tempTodoItem] = {
            editable: true,
            isReadOnly: readOnlyCheck,
            isView: !readOnlyCheck,
            todoTypeInfo: {
              ViewType: selectedTodo.Type,
              associatedField: selectedTodo.FieldName,
              mandatory: selectedTodo.Mandatory,
              todoDesc: selectedTodo.Description,
              todoId: selectedTodo.ToDoId,
              todoName: selectedTodo.ToDoName,
              variableId: selectedTodo.VariableId,
            },
          };
        }
        return temp;
      });
      if (selectedTodo) {
        let tempData = { ...localLoadedActivityPropertyData };
        let tempdataLocal = tempData?.ActivityProperty?.wdeskInfo
          ?.objPMWdeskTodoLists
          ? { ...tempData?.ActivityProperty?.wdeskInfo?.objPMWdeskTodoLists }
          : {};
        if (tempdataLocal?.todoMap) {
          tempData.ActivityProperty.wdeskInfo.objPMWdeskTodoLists.todoMap = {
            ...tempdataLocal?.todoMap,
            [tempTodoItem]: {
              isReadOnly: readOnlyCheck,
              isView: !readOnlyCheck,
              todoTypeInfo: {
                ViewType: selectedTodo.Type,
                associatedField: selectedTodo.FieldName,
                mandatory: selectedTodo.Mandatory,
                todoDesc: selectedTodo.Description,
                todoId: selectedTodo.ToDoId,
                todoName: selectedTodo.ToDoName,
                variableId: selectedTodo.VariableId,
              },
            },
          };
        } else {
          tempData.ActivityProperty.wdeskInfo.objPMWdeskTodoLists = {
            ...tempData.ActivityProperty.wdeskInfo.objPMWdeskTodoLists,
            todoMap: {
              [tempTodoItem]: {
                isReadOnly: readOnlyCheck,
                isView: !readOnlyCheck,
                todoTypeInfo: {
                  ViewType: selectedTodo.Type,
                  associatedField: selectedTodo.FieldName,
                  mandatory: selectedTodo.Mandatory,
                  todoDesc: selectedTodo.Description,
                  todoId: selectedTodo.ToDoId,
                  todoName: selectedTodo.ToDoName,
                  variableId: selectedTodo.VariableId,
                },
              },
            },
          };
        }
        // code added on 3 Aug 2023 for BugId 127487 - Regression :- form not showing in Task rights.
        if (tempData?.ActivityProperty?.wdeskInfo?.objPMWdeskTasks?.taskMap) {
          Object.values(
            tempData?.ActivityProperty?.wdeskInfo?.objPMWdeskTasks?.taskMap
          )?.forEach((task) => {
            if (task.m_arrTodoInfo) {
              tempData.ActivityProperty.wdeskInfo.objPMWdeskTasks.taskMap[
                task.taskTypeInfo.taskName
              ].m_arrTodoInfo = [
                ...task.m_arrTodoInfo,
                {
                  m_bReadOnlyForTask: readOnlyCheck,
                  m_bModifyForTask: !readOnlyCheck,
                  todoTypeInfo: {
                    todoId: selectedTodo.ToDoId,
                    todoName: selectedTodo.ToDoName,
                  },
                  modifyDisabled: readOnlyCheck,
                },
              ];
            } else {
              tempData.ActivityProperty.wdeskInfo.objPMWdeskTasks.taskMap[
                task.taskTypeInfo.taskName
              ] = {
                ...task,
                m_arrTodoInfo: [
                  ...task.m_arrTodoInfo,
                  {
                    m_bReadOnlyForTask: readOnlyCheck,
                    m_bModifyForTask: !readOnlyCheck,
                    todoTypeInfo: {
                      todoId: selectedTodo.ToDoId,
                      todoName: selectedTodo.ToDoName,
                    },
                    modifyDisabled: readOnlyCheck,
                  },
                ],
              };
            }
          });
        }
        setlocalLoadedActivityPropertyData(tempData);
        // code added on 19 Jan 2023 for BugId 122670
        setTodoDesc("");
        setSelectType(null);
        setMandatoryCheck(false);
        setAssociatedField("defaultValue");
        setSelectedTrigger("");
        setselectedTodoItem(null);
        setReadOnlyCheck(false);
        setDefineListVal("");
        dispatch(
          setActivityPropertyChange({
            [propertiesLabel.workdesk]: { isModified: true, hasError: false },
          })
        );
      }
    } else {
      dispatch(
        setToastDataFunc({
          message: t("SelectedTodoAlreadyAssociated"),
          severity: "error",
          open: true,
        })
      );
    }
  };

  const deleteHandler = () => {
    let temp = {};
    Object.keys(todoItemData).forEach((el) => {
      if (el != selectedTodoItem) {
        temp = { ...temp, [el]: todoItemData[el] };
      }
    });
    setTodoItemData(temp);
    let tempData = { ...localLoadedActivityPropertyData };
    let tempdataLocal =
      tempData?.ActivityProperty?.wdeskInfo?.objPMWdeskTodoLists?.todoMap;
    let td = {},
      taskTd = [];
    Object.keys(tempdataLocal).forEach((el) => {
      if (el != selectedTodoItem) {
        td = { ...td, [el]: tempdataLocal[el] };
        // code added on 3 Aug 2023 for BugId 127487 - Regression :- form not showing in Task rights.
        let exc = tempdataLocal[el];
        taskTd = [
          ...taskTd,
          {
            m_bReadOnlyForTask: exc.isReadOnly,
            m_bModifyForTask: exc.isView,
            todoTypeInfo: {
              todoId: exc.todoTypeInfo.todoId,
              todoName: exc.todoTypeInfo.todoName,
            },
            modifyDisabled: exc.isReadOnly,
          },
        ];
      }
    });
    tempData.ActivityProperty.wdeskInfo.objPMWdeskTodoLists.todoMap = { ...td };
    // code added on 3 Aug 2023 for BugId 127487 - Regression :- form not showing in Task rights.
    if (tempData?.ActivityProperty?.wdeskInfo?.objPMWdeskTasks?.taskMap) {
      Object.values(
        tempData?.ActivityProperty?.wdeskInfo?.objPMWdeskTasks?.taskMap
      )?.forEach((task) => {
        if (task.m_arrTodoInfo) {
          tempData.ActivityProperty.wdeskInfo.objPMWdeskTasks.taskMap[
            task.taskTypeInfo.taskName
          ].m_arrTodoInfo = [...taskTd];
        }
      });
    }
    setlocalLoadedActivityPropertyData(tempData);
    // code added on 19 Jan 2023 for BugId 122670
    setTodoDesc("");
    setSelectType(null);
    setMandatoryCheck(false);
    setAssociatedField("defaultValue");
    setSelectedTrigger("");
    setselectedTodoItem(null);
    setReadOnlyCheck(false);
    setDefineListVal("");
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.workdesk]: { isModified: true, hasError: false },
      })
    );
  };

  const readHandler = () => {
    let val;
    setReadOnlyCheck((prev) => {
      val = !prev;
      return !prev;
    });
    let temp = { ...localLoadedActivityPropertyData };
    let tempdataLocal = {
      ...temp?.ActivityProperty?.wdeskInfo?.objPMWdeskTodoLists,
    };
    if (tempdataLocal?.todoMap && tempdataLocal?.todoMap[selectedTodoItem]) {
      temp.ActivityProperty.wdeskInfo.objPMWdeskTodoLists.todoMap[
        selectedTodoItem
      ].isReadOnly = val;
      // added on 04/01/24 for BugId 142324
      if (temp?.ActivityProperty?.wdeskInfo?.objPMWdeskTasks?.taskMap) {
        Object.values(
          temp?.ActivityProperty?.wdeskInfo?.objPMWdeskTasks?.taskMap
        )?.forEach((task) => {
          if (task.m_arrTodoInfo) {
            let idx = null;
            temp.ActivityProperty.wdeskInfo.objPMWdeskTasks.taskMap[
              task.taskTypeInfo.taskName
            ].m_arrTodoInfo?.forEach((el, index) => {
              if (el?.todoTypeInfo?.todoName === selectedTodoItem) {
                idx = index;
              }
            });
            temp.ActivityProperty.wdeskInfo.objPMWdeskTasks.taskMap[
              task.taskTypeInfo.taskName
            ].m_arrTodoInfo[idx] = {
              ...task.m_arrTodoInfo[idx],
              m_bModifyForTask: !val,
              m_bReadOnlyForTask: val,
              isReadOnly: val,
              isView: !val,
            };
          }
        });
      }
      // till here BugId 142324
      setlocalLoadedActivityPropertyData(temp);
      dispatch(
        setActivityPropertyChange({
          [propertiesLabel.workdesk]: { isModified: true, hasError: false },
        })
      );
    }
  };

  const handleTriggerSelection = (triggerName) => {
    setSelectedTrigger(triggerName);
  };

  const defineHandler = () => {
    setAddTodo(true);
    // added on 08/01/24 for BugId 141670
    setDisableAddBtn(true);
    // till here BugId 141670
  };

  const associatedHandler = (e) => {
    setAssociatedField(e.target.value);
  };

  const handleToDoSelection = (selectedToDoType) => {
    setToDoType(selectedToDoType);
  };

  const addToDoToList = (ToDoToAdd, button_type, groupId, ToDoDesc) => {
    let exist = false;
    toDoData?.TodoGroupLists?.forEach((group) => {
      group?.ToDoList?.forEach((todo) => {
        if (
          todo.ToDoName.trim().toLowerCase() == ToDoToAdd.trim().toLowerCase()
        ) {
          exist = true;
        }
      });
    });
    if (exist) {
      dispatch(
        setToastDataFunc({
          message: t("todoAlreadyExists"),
          severity: "error",
          open: true,
        })
      );
      setDisableAddBtn(null);
    } else {
      // code added on 30 August 2022 for BugId 114886
      let temp = [];
      let isBlackPickPresent = false;
      pickList?.map((el) => {
        if (el.name?.trim() === "") {
          isBlackPickPresent = true;
        } else {
          temp.push(el.name?.trim()?.toLowerCase()); //Changes made to solve Bug 139414
        }
      });
      let uniqueTemp = [...new Set([...temp])];
      if (toDoType === "T" && !selectedTrigger) {
        setShowTriggerError(true);
        setDisableAddBtn(null);
      } else if (uniqueTemp.length !== temp.length) {
        dispatch(
          setToastDataFunc({
            message: t("removeDuplicatePicklists"),
            severity: "error",
            open: true,
          })
        );
        // code added on 9 Jan 2023 for BugId 122016
        setDisableAddBtn(null);
      } else if (isBlackPickPresent) {
        dispatch(
          setToastDataFunc({
            message: t("removeBlankPicklists"),
            severity: "error",
            open: true,
          })
        );
        // code added on 9 Jan 2023 for BugId 122016
        setDisableAddBtn(null);
      }
      // ============================================
      if (
        ToDoToAdd.trim() !== "" &&
        ToDoDesc.trim() !== "" &&
        groupId &&
        (groupId + "")?.trim() !== "" &&
        ToDoDesc.length <= 255 &&
        // Changes made to solve Bug 127658
        !isBlackPickPresent &&
        uniqueTemp.length == temp.length
        // till here dated 21stSept
      ) {
        let maxToDoId = 0;
        toDoData?.TodoGroupLists?.map((group) => {
          group?.ToDoList?.map((listElem) => {
            if (+listElem.ToDoId > +maxToDoId) {
              maxToDoId = listElem.ToDoId;
            }
          });
        });

        axios
          .post(SERVER_URL + ENDPOINT_ADD_TODO, {
            processDefId: props.openProcessID,
            todoName: ToDoToAdd,
            todoId: `${+maxToDoId + 1}`,
            groupId: groupId,
            todoDesc: encode_utf8(ToDoDesc),
            viewType: toDoType,
            mandatory: mandatoryCheckTodo,
            extObjID: "0",
            associatedField: associateField ? associateField : "",
            variableId: associateField === "CalendarName" ? "10001" : "42",
            varFieldId: "0",
            associatedWS: "",
            triggerName: selectedTrigger,
            pickList: [...pickList],
          })
          .then((res) => {
            if (res?.data?.Status == 0) {
              let temp = JSON.parse(JSON.stringify(localState));
              let maxList = 0;
              temp.ToDoList?.forEach((el) => {
                if (+el.ListId > +maxList) {
                  maxList = +el.ListId;
                }
              });
              temp.ToDoList.push({
                AssociatedFieldName: associateField ? associateField : "",
                AssociatedWorksteps: ",",
                Description: ToDoDesc,
                ExtObjID: "0",
                ListId: `${maxList + 1}`,
                ToDoName: ToDoToAdd,
                Type: toDoType,
                VarFieldId: "0",
                VariableId: associateField === "CalendarName" ? "10001" : "42",
              });
              dispatch(setOpenProcess({ loadedData: temp }));
              let tempData = { ...toDoData };
              tempData.TodoGroupLists.map((group) => {
                if (group.GroupId == groupId) {
                  group.ToDoList.push({
                    Activities: [],
                    Description: ToDoDesc,
                    Type: toDoType,
                    TriggerName: selectedTrigger,
                    Mandatory: mandatoryCheckTodo,
                    ToDoId: +maxToDoId + 1,
                    ToDoName: ToDoToAdd,
                    PickListItems: [...pickList],
                    AllTodoRights: {
                      Modify: false,
                      View: false,
                    },
                    ExtObjID: "0",
                    FieldName: associateField,
                    VarFieldId: "0",
                    VarId: associateField === "CalendarName" ? "10001" : "42",
                  });
                }
              });
              setToDoData(tempData);
              setDisableAddBtn(null);
              if (button_type !== "addAnother") {
                setAddTodo(false);
                // code added on 7 September 2022 for BugId 112250
                setAddAnotherTodo(false);
              }
              if (button_type === "addAnother") {
                // code added on 7 September 2022 for BugId 112250
                setAddAnotherTodo(true);
              }
            } else {
              setDisableAddBtn(null);
            }
          })
          .catch((err) => {
            setDisableAddBtn(null);
          });
      }
      // code added on 30 August 2022 for BugId 114886
      else if (
        ToDoToAdd.trim() === "" ||
        ToDoDesc.trim() === "" ||
        !groupId ||
        (groupId + "")?.trim() === ""
      ) {
        //Modified  on 08/08/2023, bug_id:133972
        setDisableAddBtn(null);
        dispatch(
          setToastDataFunc({
            message: t("mandatoryErr"),
            severity: "error",
            open: true,
          })
        );
        document.getElementById("ToDoNameInput")?.focus();
        // code added on 9 Jan 2023 for BugId 122016
      } else if (ToDoDesc.length > 255) {
        setDisableAddBtn(null);
        dispatch(
          setToastDataFunc({
            message: `${t("length")} ${t("lengthOfDescriptionLengthLimit")}`,
            severity: "error",
            open: true,
          })
        );
      }
    }
  };

  const addPickList = (pickList) => {
    setPickList(pickList);
  };

  const handleAssociateFieldSelection = (selectedField) => {
    setAssociateField(selectedField);
  };

  const optionSelectType = (e) => {
    setSelectType(e.target.value);
  };

  const addGroupToList = (GroupToAdd, button_type) => {
    let exist = false;
    toDoData?.TodoGroupLists?.forEach((group) => {
      if (group.GroupName.toLowerCase() === GroupToAdd.toLowerCase()) {
        exist = true;
      }
    });
    if (exist) {
      dispatch(
        setToastDataFunc({
          message: t("groupAlreadyExists"),
          severity: "error",
          open: true,
        })
      );
    } else {
      if (GroupToAdd.trim() !== "") {
        let maxGroupId = toDoData?.TodoGroupLists?.reduce(
          (acc, group) => (acc > group.GroupId ? acc : group.GroupId),
          0
        );

        axios
          .post(SERVER_URL + ENDPOINT_ADD_GROUP, {
            m_strGroupName: GroupToAdd,
            m_strGroupId: +maxGroupId + 1,
            interfaceType: "T",
            processDefId: props.openProcessID,
          })
          .then((res) => {
            if (res.data.Status == 0) {
              let tempData = { ...toDoData };
              tempData?.TodoGroupLists.push({
                GroupName: GroupToAdd,
                AllGroupRights: {
                  View: true,
                  Modify: false,
                },
                GroupId: +maxGroupId + 1,
                ToDoList: [],
              });
              setToDoData(tempData);
            }
            if (button_type == "addAnother") {
              document.getElementById("groupNameInput_todo").value = "";
              document.getElementById("groupNameInput_todo")?.focus();
            }
          });
      } else if (GroupToAdd.trim() === "") {
        dispatch(
          setToastDataFunc({
            message: t("mandatoryErr"),
            severity: "error",
            open: true,
          })
        );
        document.getElementById("groupNameInput_todo")?.focus();
      }
    }
  };

  return (
    <React.Fragment>
      <div
        className={styles.flexRow}
        style={{
          width: props.isDrawerExpanded ? "98%" : "94%",
          flexDirection: props.isDrawerExpanded ? "row" : "column",
          margin: "0 1vw",
          gap: props.isDrawerExpanded ? "3vw" : "0",
        }}
      >
        <div
          style={{
            width: props.isDrawerExpanded ? "50%" : "100%",
          }}
        >
          <div className={styles.checklist}>
            <FormGroup>
              <FormControlLabel
                label={<div>{t("todoList")}</div>}
                control={
                  <Checkbox
                    checked={checkTodo}
                    onChange={CheckTodoHandler}
                    id="pmweb_workdesk_todo_todoList"
                    inputProps={{
                      "aria-label": "todoList",
                    }}
                    className={styles.mainCheckbox}
                    disabled={isReadOnly}
                    data-testid="CheckTodo"
                    type="checkbox"
                    tabIndex={0}
                    inputRef={checkTodoRef}
                    onKeyUp={(e) => {
                      if (e.key === "Enter") {
                        checkTodoRef.current.click();
                        e.stopPropagation();
                      }
                    }}
                  />
                }
              />
            </FormGroup>
          </div>

          <div className="row">
            <Grid container xs={12} spacing={1} justifyContent="space-between">
              <Grid item xs={6}>
                <div>
                  <p className={styles.description}>{t("definedList")}</p>
                  <CustomizedDropdown
                    id="pmweb_workdesk_todo_definedList_Dropdown"
                    className={styles.todoSelect}
                    ariaLabel="definedList"
                    disabled={!checkTodo || isReadOnly}
                    value={defineListVal}
                    onChange={(e) => definedListHandler(e)}
                    style={{ marginLeft: "1px" }}
                  >
                    {/* code updated on 30 Dec 2022 for BugId  116708 */}
                    <MenuItem
                      className={styles.menuItemStyles}
                      style={{
                        direction: direction === RTL_DIRECTION ? "rtl" : "ltr",
                      }}
                      value={""}
                    >
                      {t("defineTodo")}
                    </MenuItem>
                    {allToDoData.map((val) => {
                      return (
                        <MenuItem
                          className={styles.menuItemStyles}
                          key={val.ToDoName}
                          value={val.ToDoName}
                          style={{
                            direction:
                              direction === RTL_DIRECTION ? "rtl" : "ltr",
                          }}
                        >
                          {val.ToDoName}
                        </MenuItem>
                      );
                    })}
                  </CustomizedDropdown>
                </div>
              </Grid>
              {/* <div style={{ flex: "1", marginLeft: "2rem" }}> */}
              <Grid item xs={6}>
                {/* modify on 05-09-2023 increase the margin to resolve the bug Id 135575 */}
                <div style={{ marginTop: "1.1rem" }}>
                  <Grid
                    container
                    xs={12}
                    spacing={1}
                    justifyContent="space-between"
                  >
                    <Grid item xs={6}>
                      <button
                        disabled={
                          !checkTodo ||
                          (checkTodo && defineListVal.trim() === "") ||
                          isReadOnly
                        }
                        style={{ width: "100%" }}
                        className={
                          !checkTodo ||
                          (checkTodo && defineListVal.trim() === "") ||
                          isReadOnly
                            ? styles.disabledBtn
                            : styles.addBtn
                        }
                        onClick={addHandler}
                        id="pmweb_workdesk_todo_associateBtn"
                        data-testid="associateBtn"
                      >
                        {t("associate")}
                      </button>
                    </Grid>
                    <Grid item xs={6}>
                      {!isReadOnly && (
                        <button
                          disabled={
                            !checkTodo ||
                            props.openProcessType === PROCESSTYPE_DEPLOYED ||
                            props.openProcessType === PROCESSTYPE_REGISTERED
                          }
                          style={{ width: "100%" }}
                          className={
                            !checkTodo ||
                            props.openProcessType === PROCESSTYPE_DEPLOYED ||
                            props.openProcessType === PROCESSTYPE_REGISTERED
                              ? styles.disabledBtn
                              : styles.addBtn
                          }
                          onClick={defineHandler}
                          id="pmweb_workdesk_todo_defineBtn"
                          data-testid="defineBtn"
                        >
                          {t("Define")}
                        </button>
                      )}
                    </Grid>
                  </Grid>
                </div>
              </Grid>
            </Grid>
            {/* </div> */}
          </div>
          <p className={styles.todoItem}>{t("associatedList")}</p>
          <div
            className={styles.todoTextarea}
            // Changes to resolve the bug Id 139391
            style={{
              minHeight: direction === RTL_DIRECTION ? "3rem" : "2rem",
              overflowY: "auto",
            }}
          >
            <ul>
              {Object.keys(todoItemData)?.map((val, index) => {
                return (
                  <li
                    onClick={() => todoItemHandler(val)}
                    tabIndex={0}
                    onKeyUp={(e) => {
                      if (e.key === "Enter") {
                        todoItemHandler(val);
                        e.stopPropagation();
                      }
                    }}
                    id={`pmweb_workdesk_todo_todoItam_${index}`}
                    className={
                      selectedTodoItem === val
                        ? styles.selectedTodo
                        : styles.todoListItem
                    }
                  >
                    <LightTooltip
                      id="pmweb_toDo_doc_Tooltip"
                      arrow={true}
                      enterDelay={500}
                      placement="bottom-start"
                      title={val}
                    >
                      <span> {shortenRuleStatement(val, 72)}</span>
                    </LightTooltip>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className={styles.deassociateDiv}>
            <button
              disabled={
                !checkTodo || (checkTodo && !selectedTodoItem) || isReadOnly
              }
              className={
                !checkTodo || (checkTodo && !selectedTodoItem) || isReadOnly
                  ? styles.disabledBtn
                  : styles.deleteBtn
              }
              onClick={deleteHandler}
              data-testid="deAssociateBtn"
              id="pmweb_workdesk_todo_deAssociteBtn"
            >
              {t("deassociate")}
            </button>
          </div>
        </div>
        <div style={{ width: props.isDrawerExpanded ? "50%" : "100%" }}>
          <p className={styles.todoItemDetails}>{t("todoItemDetails")}</p>
          <p className={styles.description}>{t("description")}</p>
          <textarea
            aria-label="descriptionTextBox"
            className={styles.descriptionTextarea}
            data-testid="descriptionTextBox"
            value={decode_utf8(todoDesc)}
            onChange={(e) => descHandler(e)}
            id="pmweb_workdesk_todo_descriptionTextBox"
            disabled={!checkTodo || (checkTodo && !editableField)}
          />
          <div className="row">
            <div
              className={`${styles.checklist} todo_checklist`}
              style={{ marginTop: "0" }}
            >
              <FormGroup>
                <FormControlLabel
                  label={t("mandatory")}
                  control={
                    <Checkbox
                      className={
                        direction === RTL_DIRECTION
                          ? arabicStyles.mainCheckbox
                          : styles.mainCheckbox
                      }
                      disabled={!checkTodo || (checkTodo && !editableField)}
                      checked={mandatoryCheck}
                      onChange={() => mandatoryHandler()}
                      id="pmweb_workdesk_todo_mandatory"
                      inputProps={{
                        "aria-label": "mandatory",
                      }}
                      // tabIndex={0}
                      inputRef={mandatoryRef}
                      onKeyUp={(e) => {
                        if (e.key === "Enter") {
                          mandatoryRef.current.click();
                          e.stopPropagation();
                        }
                      }}
                    />
                  }
                />
              </FormGroup>
            </div>
            <div className={styles.checklist} style={{ marginTop: "0" }}>
              <FormGroup>
                <FormControlLabel
                  label={t("readOnly")}
                  control={
                    <Checkbox
                      className={
                        direction === RTL_DIRECTION
                          ? arabicStyles.mainCheckbox
                          : styles.mainCheckbox
                      }
                      disabled={
                        !checkTodo ||
                        (checkTodo && defineListVal.trim() === "") ||
                        +localLoadedActivityPropertyData?.ActivityProperty
                          ?.actType === 2
                      }
                      checked={readOnlyCheck}
                      onChange={() => readHandler()}
                      id="pmweb_workdesk_todo_readOnly"
                      inputRef={readOnlyRef}
                      onKeyUp={(e) => {
                        if (e.key === "Enter") {
                          readOnlyRef.current.click();
                          e.stopPropagation();
                        }
                      }}
                    />
                  }
                />
              </FormGroup>
            </div>
          </div>

          <div style={{ marginTop: "0.5rem" }}>
            <div className={styles.description}>{t("associatedFeild")}</div>
            <div>
              <CustomizedDropdown
                className={styles.todoSelect}
                id="pmweb_workdesk_todo_associateField_Dropdown"
                style={{ width: "97%" }}
                disabled={!checkTodo || (checkTodo && !editableField)}
                value={associatedField}
                onChange={(e) => associatedHandler(e)}
              >
                <MenuItem value="defaultValue">&lt;None&gt;</MenuItem>
                {associateFields?.map((x) => {
                  return (
                    <MenuItem key={x} value={x}>
                      {x}
                    </MenuItem>
                  );
                })}
              </CustomizedDropdown>
            </div>
          </div>

          <div style={{ marginTop: "0.5rem" }}>
            <p className={styles.description}>{t("type")}</p>
            <RadioGroup
              onChange={optionSelectType}
              value={selectType}
              className={styles.radiobtn}
              id="pmweb_workdesk_todo_type_radiobtns"
              disabled={!checkTodo || (checkTodo && !editableField)}
            >
              <FormControlLabel
                value="M"
                control={<Radio />}
                label={t("mark")}
                id="pmweb_workdesk_todo_type_radiobtns_mark"
                disabled={!checkTodo || (checkTodo && !editableField)}
                // tabIndex={!checkTodo || (checkTodo && !editableField) ? 0 : 1}
                ref={markRef}
                onKeyUp={(e) => {
                  if (e.key === "Enter") {
                    markRef.current.click();
                    e.stopPropagation();
                  }
                }}
              />

              <FormControlLabel
                value="P"
                control={<Radio />}
                label={t("picklist")}
                id="pmweb_workdesk_todo_type_radiobtns_pickList"
                disabled={!checkTodo || (checkTodo && !editableField)}
                // tabIndex={!checkTodo || (checkTodo && !editableField) ? 0 : 1}
                ref={pickListRef}
                onKeyUp={(e) => {
                  if (e.key === "Enter") {
                    pickListRef.current.click();
                    e.stopPropagation();
                  }
                }}
              />

              <FormControlLabel
                value="T"
                control={<Radio />}
                label={t("trigger")}
                id="pmweb_workdesk_todo_type_radiobtns_trigger"
                disabled={!checkTodo || (checkTodo && !editableField)}
                // tabIndex={!checkTodo || (checkTodo && !editableField) ? 0 : 1}
                ref={triggerRef}
                onKeyUp={(e) => {
                  if (e.key === "Enter") {
                    triggerRef.current.click();
                    e.stopPropagation();
                  }
                }}
              />
            </RadioGroup>
          </div>

          {selectType == "T" ? (
            <input
              value={selectedTrigger}
              id="pmweb_workdesk_todo_selectedTrigger"
              disabled={true}
              className={styles.inputField}
            />
          ) : null}
        </div>
      </div>
      <Modal open={addTodo}>
        <AddToDo
          handleClose={() => setAddTodo(false)}
          addToDoToList={addToDoToList}
          selectedToDoType={handleToDoSelection}
          selectedTriggerName={handleTriggerSelection}
          selectedAssociateField={handleAssociateFieldSelection}
          calledFromWorkdesk={true}
          addPickList={addPickList}
          triggerList={triggerData}
          groups={toDoData.TodoGroupLists}
          handleMandatoryCheck={handleMandatoryCheck}
          addGroupToList={addGroupToList}
          addAnotherTodo={addAnotherTodo} // code added on 7 September 2022 for BugId 112250
          setAddAnotherTodo={setAddAnotherTodo} // code added on 7 September 2022 for BugId 112250
          showTriggerError={showTriggerError}
          disableAddBtn={disableAddBtn}
          setDisableAddBtn={setDisableAddBtn}
        />
      </Modal>
    </React.Fragment>
  );
}

const mapStateToProps = (state) => {
  return {
    openProcessID: state.openProcessClick.selectedId,
    openProcessName: state.openProcessClick.selectedProcessName,
    openProcessType: state.openProcessClick.selectedType,
    cellCheckedOut: state.selectedCellReducer.selectedCheckedOut,
    isDrawerExpanded: state.isDrawerExpanded.isDrawerExpanded,
    cellLaneId: state.selectedCellReducer.selectedActLaneId,
  };
};

export default connect(mapStateToProps, null)(Todo);
