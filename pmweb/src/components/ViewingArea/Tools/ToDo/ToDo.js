// #BugID - 109986
// #BugDescription - validation for ToDO dulicate name has been added.
// #BugID - 117803
// #BugDescription - serch activity issue has been fixed.
// #Date - 30 October 2022
// #BugID - 119039
// #BugDescription - Switching tab data showing issue for Rules has been fixed.
// #Date - 15 November 2022
// #BugID - 119499
// #BugDescription - Add another button closing issue ahs been fixed.
// #BugID - 120688
// #BugDescription - To rights for single activity for single TODO all rights functionality added.
// #BugID - 121845,121884,122101
// #BugDescription - Handled the todo name,description length and added tooltip to show complete data
// #BugID - 124399
// #BugDescription - Handled to fix  Postgres>> todo>> todo rights are not getting removed properly issue.

import React, { useEffect, useState, useRef } from "react";
import "../Interfaces.css";
import { useTranslation } from "react-i18next";
import CheckBoxes from "./CheckBoxes";
import Checkbox from "@material-ui/core/Checkbox";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import Modal from "@material-ui/core/Modal";
import { store, useGlobalState } from "state-pool";
import { v4 as uuidv4 } from "uuid";
import {
  SERVER_URL,
  ENDPOINT_ADD_TODO,
  ENDPOINT_ADD_GROUP,
  ENDPOINT_DELETE_TODO,
  ENDPOINT_DELETE_GROUP,
  ENDPOINT_MOVETO_OTHERGROUP,
  SCREENTYPE_TODO,
  ENDPOINT_MODIFY_TODO,
  TODO_BATCH_COUNT,
  RTL_DIRECTION,
} from "../../../../Constants/appConstants";
import axios from "axios";
import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward";
import ActivityModal from "./ActivityModal.js";
import { giveCompleteRights } from "../../../../utility/Tools/giveCompleteRights_toDo";
import { connect, useDispatch } from "react-redux";
import DeleteModal from "../../../../UI/ActivityModal/Modal";
import ArrowForwardIosIcon from "@material-ui/icons/ArrowForwardIos";
import AddToDo from "./AddToDo";
import CommonInterface from "../CommonInterface";
import Backdrop from "../../../../UI/Backdrop/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";
import {
  disableToDoChecks,
  restrictAct,
} from "../../../../utility/Tools/DisableFunc";
import { setToastDataFunc } from "../../../../redux-store/slices/ToastDataHandlerSlice";
import DefaultModal from "../../../../UI/Modal/Modal";
import ObjectDependencies from "../../../../UI/ObjectDependencyModal";
import NoResultFound from "../../../../assets/NoSearchResult.svg";
import {
  decode_utf8,
  encode_utf8,
} from "../../../../utility/UTF8EncodeDecoder";
import { LightTooltip } from "../../../../UI/StyledTooltip";
import { shortenRuleStatement } from "../../../../utility/CommonFunctionCall/CommonFunctionCall";
import { FormControlLabel, IconButton } from "@material-ui/core";
//import FocusTrap from "focus-trap-react";
import manageRights from "../../../../assets/abstractView/manageRights.svg";
import { FocusTrap } from "@mui/base";

function ToDo(props) {
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData, setLocalLoadedProcessData] =
    useGlobalState(loadedProcessData);
  const [loadedMileStones, setLoadedMileStones] = useState(
    localLoadedProcessData?.MileStones
  );

  let { t } = useTranslation();
  const dispatch = useDispatch();
  const direction = `${t("HTML_DIR")}`;
  const [isLoading, setIsLoading] = useState(true);
  let [activitySearchTerm, setActivitySearchTerm] = useState("");
  const [addGroupModal, setAddGroupModal] = React.useState(false);
  const [addToDoModal, setAddToDoModal] = React.useState(null);
  const [compact, setCompact] = useState();
  const [bGroupExists, setbGroupExists] = useState(false);
  const [bToDoExists, setbToDoExists] = useState(false);
  const [openActivityModal, setOpenActivityModal] = useState(null);
  const [triggerData, setTriggerData] = useState();
  const [fullRightCheckOneActivityArr, setFullRightCheckOneActivityArr] =
    useState([]);
  const [toDoType, setToDoType] = useState("M"); // code edited on 29 June 2023 for BugId 130728
  const [associateField, setAssociateField] = useState(null);
  const [mandatoryCheck, setMandatoryCheck] = useState(false);
  const [toDoNameToModify, setToDoNameToModify] = useState("");
  const [toDoDescToModify, setToDoDescToModify] = useState("");
  const [toDoIdToModify, setToDoIdToModify] = useState();
  const [toDoAssoFieldToModify, setToDoAssoFieldToModify] = useState("");
  const [toDoTypeToModify, setToDoTypeToModify] = useState("");
  const [toDoToModifyTrigger, setToDoToModifyTrigger] = useState("");
  const [toDoMandatoryToModify, setToDoMandatoryToModify] = useState();
  // code added on 9 Nov 2022 for BugId 118803
  const [toDoPicklistToModify, setToDoPicklistToModify] = useState([]);
  const [toDoSearchTerm, setToDoSearchTerm] = useState("");
  const [newGroupToMove, setNewGroupToMove] = useState();
  const [noTodoPresent, setNoTodoPresent] = useState(false);
  const [toDoData, setToDoData] = useState({
    TodoGroupLists: [],
  });
  const [showDescError, setShowDescError] = useState(false);
  const [showNameError, setShowNameError] = useState(false);
  const [showTriggerError, setShowTriggerError] = useState(false);
  const [pickList, setPickList] = useState([]);
  const [filteredToDoTypes, setFilteredToDoTypes] = useState({});
  const [selectedTrigger, setSelectedTrigger] = useState();
  const [subColumns, setSubColumns] = useState([]);
  const [splicedColumns, setSplicedColumns] = useState([]);
  const [groupName, setGroupName] = useState(null);
  const [todoName, setTodoName] = useState(null);
  const [addAnotherTodo, setAddAnotherTodo] = useState(false);
  //code added on 8 June 2022 for BugId 110197
  const [todoRules, setTodoRules] = useState([]);
  const [ruleDataArray, setRuleDataArray] = useState("");
  const [showDependencyModal, setShowDependencyModal] = useState(false);
  const [taskAssociation, setTaskAssociation] = useState([]);
  const { isReadOnly } = props;
  const [disableAddBtn, setDisableAddBtn] = useState(null);
  const [allToDoRightsTemp, setAllToDoRightsTemp] = useState([]);
  const activityCheckRef = useRef([]);

  useEffect(() => {
    let todoIdString = "";
    let arr = [];
    loadedMileStones?.forEach((mileStone) => {
      mileStone?.Activities?.forEach((activity) => {
        if (
          !(activity.ActivityType === 18 && activity.ActivitySubType === 1) &&
          !(activity.ActivityType === 1 && activity.ActivitySubType === 2) &&
          !(activity.ActivityType === 26 && activity.ActivitySubType === 1) &&
          !(activity.ActivityType === 10 && activity.ActivitySubType === 1) &&
          !(activity.ActivityType === 20 && activity.ActivitySubType === 1) &&
          !(activity.ActivityType === 22 && activity.ActivitySubType === 1) &&
          !(activity.ActivityType === 31 && activity.ActivitySubType === 1) &&
          !(activity.ActivityType === 29 && activity.ActivitySubType === 1) &&
          !(activity.ActivityType === 10 && activity.ActivitySubType === 4) &&
          !(activity.ActivityType === 33 && activity.ActivitySubType === 1) &&
          !(activity.ActivityType === 27 && activity.ActivitySubType === 1) &&
          !(activity.ActivityType === 19 && activity.ActivitySubType === 1) &&
          !(activity.ActivityType === 21 && activity.ActivitySubType === 1) &&
          !(activity.ActivityType === 5 && activity.ActivitySubType === 1) &&
          !(activity.ActivityType === 6 && activity.ActivitySubType === 1) &&
          !(activity.ActivityType === 5 && activity.ActivitySubType === 2) &&
          !(activity.ActivityType === 6 && activity.ActivitySubType === 2) &&
          !(activity.ActivityType === 7 && activity.ActivitySubType === 1) &&
          !(activity.ActivityType === 34 && activity.ActivitySubType === 1) &&
          !(activity.ActivityType === 10 && activity.ActivitySubType === 7) &&
          !(activity.ActivityType === 35 && activity.ActivitySubType === 1) &&
          !(activity.ActivityType === 4 && activity.ActivitySubType === 1) && //Added on 04/01/2024 for bug_id:141390
          // code added on 11 Oct 2022 for BugId 116576
          !(activity.ActivityType === 30 && activity.ActivitySubType === 1)
        ) {
          todoIdString = todoIdString + activity.ActivityId + ",";
          arr.push(activity);
        }
      });
    });
    if (todoIdString !== "" && todoIdString !== null) {
      MapAllActivities(todoIdString);
    }
    setSubColumns(arr);
    //code edited on 19 Sep 2022 for BugId 115547
    setSplicedColumns(arr.slice(0, TODO_BATCH_COUNT));
  }, [
    localLoadedProcessData,
    localLoadedProcessData?.ProcessDefId,
    loadedMileStones,
  ]);

  useEffect(() => {
    setIsLoading(true);
  }, [localLoadedProcessData?.ProcessDefId]);

  useEffect(() => {
    if (document.getElementById("oneBoxMatrix")) {
      document.getElementById("oneBoxMatrix").onscroll = function (event) {
        let scrollLeftVal =
          direction === RTL_DIRECTION ? 0 - +this.scrollLeft : this.scrollLeft;
        if (scrollLeftVal >= this.scrollWidth - this.clientWidth) {
          const timeout = setTimeout(() => {
            //code edited on 19 Sep 2022 for BugId 115547
            setSplicedColumns((prev) =>
              subColumns.slice(0, prev.length + TODO_BATCH_COUNT)
            );
          }, 500);
          return () => clearTimeout(timeout);
        }
      };
    }
  });

  let ToDoGroup = [];
  toDoData.TodoGroupLists?.map((group) => {
    ToDoGroup.push(group.GroupName);
  });

  // added on 16/10/23 for BugId 139505
  const getActType = (actId) => {
    let actType = null;
    localLoadedProcessData?.MileStones?.forEach((mile) => {
      mile?.Activities?.forEach((act) => {
        if (+act.ActivityId === +actId) {
          actType = act.ActivityType;
        }
      });
    });
    return actType;
  };

  const MapAllActivities = (todoIdStrings) => {
    // code edited on 7 Nov 2022 for BugId 116221
    if (localLoadedProcessData?.ProcessDefId) {
      axios
        .get(
          SERVER_URL +
            `/todo/${localLoadedProcessData.ProcessDefId}/${localLoadedProcessData.ProcessType}/${localLoadedProcessData.ProcessName}/${todoIdStrings}`
        )
        .then((res) => {
          if (res.status === 200) {
            //code added on 8 June 2022 for BugId 110197
            let tempAllTodoRights = [];
            setTodoRules(res.data.Rules);
            let newState = { ...res.data };
            newState?.TodoGroupLists?.map((group) => {
              group.ToDoList?.map((todo) => {
                tempAllTodoRights.push(todo.AllTodoRights);
                let tempIds = [];
                let tempData = [];
                todo.Activities &&
                  todo.Activities.map((activity) => {
                    if (tempIds.includes(activity.ActivityId)) {
                      tempData &&
                        tempData.forEach((data) => {
                          if (+data.ActivityId === +activity.ActivityId) {
                            data.View = data.View ? data.View : activity.View;
                            data.Modify = data.Modify
                              ? data.Modify
                              : activity.Modify;
                          }
                        });
                    } else {
                      tempData.push(activity);
                      tempIds.push(activity.ActivityId);
                    }
                  });
                todo.Activities = [...tempData];
              });
            });
            //code added on 8 June 2022 for BugId 110197
            let array = [];
            newState?.TodoGroupLists?.forEach((grp) => {
              grp.ToDoList?.forEach((name) => {
                let obj = {
                  Name: name.ToDoName,
                  NameId: name.ToDoId,
                  Group: grp.GroupName,
                  GroupId: grp.GroupId,
                };
                array.push(obj);
              });
            });
            if (array.length === 0) {
              setNoTodoPresent(true);
            } else {
              setNoTodoPresent(false);
            }
            setRuleDataArray(array);

            let localActivityArr = [];
            let localActivityIdArr = [];
            newState?.TodoGroupLists.forEach((group) => {
              group.ToDoList?.forEach((todo) => {
                todo.Activities = todo.Activities.sort((a, b) =>
                  +a.ActivityId > +b.ActivityId ? 1 : -1
                );
                todo.Activities?.forEach((activity, act_idx) => {
                  // modified on 16/10/23 for BugId 139505
                  /*if (
                    Object.values(activity).includes(false) &&
                    !activity?.ActivityName?.includes("End")
                  ) {
                    localActivityArr[act_idx] = false;
                  } else {
                    if (localActivityArr[act_idx] != false) {
                      localActivityArr[act_idx] = true;
                    }
                  }
                  if (activity?.ActivityName?.includes("End")) {
                    localActivityArr[act_idx] =
                      localActivityArr[act_idx] && activity.View;
                  } */
                  let actType = getActType(activity.ActivityId);
                  if (+actType !== 2 && +actType !== 3 && +actType !== 11) {
                    if (Object.values(activity).includes(false)) {
                      localActivityArr[act_idx] = false;
                    } else {
                      if (localActivityArr[act_idx] !== false) {
                        localActivityArr[act_idx] = true;
                      }
                    }
                  } else if (
                    +actType === 2 ||
                    +actType === 3 ||
                    +actType === 11
                  ) {
                    if (!activity.View) {
                      localActivityArr[act_idx] = false;
                    } else {
                      if (localActivityArr[act_idx] !== false) {
                        localActivityArr[act_idx] = true;
                      }
                    }
                  }
                  // till here BugId 139505
                  localActivityIdArr[act_idx] = activity.ActivityId;
                });
              });
            });

            let localObj = [...fullRightCheckOneActivityArr];
            localActivityArr?.forEach((activity, activityIndex) => {
              if (activity === false) {
                localObj[localActivityIdArr[activityIndex]] = false;
              } else {
                localObj[localActivityIdArr[activityIndex]] = true;
              }
            });
            setFullRightCheckOneActivityArr(localObj);

            if (toDoSearchTerm.trim() === "") {
              setToDoData(res.data);
            }
            setFilteredToDoTypes(res.data);
            setAllToDoRightsTemp(tempAllTodoRights);
            setTriggerData(res.data.Trigger);
            setIsLoading(false);
          }
        })
        .catch(() => setIsLoading(false));
    }
  };

  const addPickList = (pickList) => {
    setPickList(pickList);
  };

  const handleAssociateFieldSelection = (selectedField) => {
    setAssociateField(selectedField);
  };

  const handleMandatoryCheck = (checkValue) => {
    setMandatoryCheck(checkValue);
  };

  const editToDo = (
    groupId,
    toDoName,
    toDoDesc,
    toDoId,
    toDoAssociate,
    toDoType,
    mandatoryValue,
    triggerValue,
    todo
  ) => {
    handleToDoOpen(groupId);
    setToDoNameToModify(toDoName);
    setToDoDescToModify(toDoDesc);
    setToDoIdToModify(toDoId);
    setToDoAssoFieldToModify(
      toDoAssociate === "&lt;None&gt;" ? "defaultValue" : toDoAssociate
    );
    setToDoTypeToModify(toDoType);
    setToDoMandatoryToModify(mandatoryValue);
    setToDoToModifyTrigger(triggerValue);
    // code added on 9 Nov 2022 for BugId 118803
    setToDoPicklistToModify(todo.PickListItems);
  };

  const addGroupViaMoveTo = (ToDoId, ToDoName, Description, SourceGroupId) => {
    setNewGroupToMove({
      todoId: ToDoId,
      todoName: ToDoName,
      todoDesc: Description,
      sourceGroupId: SourceGroupId,
    });
    handleOpen();
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
      // code added for BugId 110284
      dispatch(
        setToastDataFunc({
          message: t("todoAlreadyExists"),
          severity: "error",
          open: true,
        })
      );
      setDisableAddBtn(null);
    } else {
      if (ToDoDesc.trim() === "") {
        setShowDescError(true);
        document.getElementById("pmweb_toDo_AddtoDo_ToDoDescInput")?.focus();
        setDisableAddBtn(null);
      }
      if (ToDoToAdd.trim() === "") {
        setShowNameError(true);
        document.getElementById("pmweb_toDo_AddtoDo_ToDoNameInput")?.focus();
        setDisableAddBtn(null);
      }
      if (ToDoToAdd.trim() !== "" && ToDoDesc.trim() !== "") {
        let temp = [];
        let isBlackPickPresent = false;
        pickList?.map((el) => {
          if (el.name?.trim() == "") {
            isBlackPickPresent = true;
          } else {
            temp.push(el.name?.trim()?.toLowerCase()); //Changes made to solve Bug 139414
          }
        });
        let uniqueTemp = [...new Set([...temp])];
        if (toDoType == "T" && !selectedTrigger) {
          setShowTriggerError(true);
          setDisableAddBtn(null);
        } else if (ToDoDesc.length > 255) {
          setDisableAddBtn(null);
          dispatch(
            setToastDataFunc({
              message: `${t("length")} ${t("lengthOfDescriptionLengthLimit")}`,
              severity: "error",
              open: true,
            })
          );
        } else if (uniqueTemp.length != temp.length) {
          dispatch(
            setToastDataFunc({
              message: t("removeDuplicatePicklists"),
              severity: "error",
              open: true,
            })
          );
          setDisableAddBtn(null);
        } else if (isBlackPickPresent && toDoType === "P") {
          dispatch(
            setToastDataFunc({
              message: t("removeBlankPicklists"),
              severity: "error",
              open: true,
            })
          );
          setDisableAddBtn(null);
        } else {
          let maxToDoId = 0;
          toDoData.TodoGroupLists.map((group, groupIndex) => {
            group.ToDoList.map((listElem) => {
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
              mandatory: mandatoryCheck,
              extObjID: "0",
              associatedField: associateField ? associateField : "", //code added on 27 June 2022 for the issue-- todo cannot be added
              variableId: associateField == "CalendarName" ? "10001" : "42",
              varFieldId: "0",
              associatedWS: "",
              triggerName: selectedTrigger ? selectedTrigger : "",
              pickList: toDoType === "P" ? [...pickList] : [],
            })
            .then((res) => {
              if (res.data.Status == 0) {
                let tempData = { ...toDoData };
                let groupName;
                let addedActivity = [];
                if (subColumns.length > 0) {
                  subColumns?.forEach((activity) => {
                    addedActivity.push({
                      ActivityId: activity.ActivityId,
                      View: false,
                      Modify: false,
                    });
                  });
                }
                tempData.TodoGroupLists.map((group) => {
                  if (group.GroupId == groupId) {
                    groupName = group.GroupName;
                    group.ToDoList.push({
                      Activities: addedActivity,
                      Description: ToDoDesc,
                      Type: toDoType,
                      TriggerName: selectedTrigger,
                      Mandatory: mandatoryCheck,
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
                //code added on 8 June 2022 for BugId 110197
                //Updating ruleDataArray
                let temp = [...ruleDataArray];
                temp.push({
                  Name: ToDoToAdd,
                  NameId: +maxToDoId + 1,
                  Group: groupName,
                  GroupId: groupId,
                });
                setRuleDataArray(temp);

                // Updating processData on adding ToDo
                let newProcessData = JSON.parse(
                  JSON.stringify(localLoadedProcessData)
                );
                let maxList = 0;
                newProcessData.ToDoList?.forEach((el) => {
                  if (+el.ListId > +maxList) {
                    maxList = +el.ListId;
                  }
                });
                newProcessData.ToDoList?.push({
                  AssociatedFieldName: associateField ? associateField : "",
                  AssociatedWorksteps: ",",
                  Description: ToDoDesc,
                  ExtObjID: "0",
                  ListId: `${maxList + 1}`,
                  ToDoName: ToDoToAdd,
                  Type: toDoType,
                  VarFieldId: "0",
                  VariableId:
                    associateField === "CalendarName" ? "10001" : "42",
                });
                setLocalLoadedProcessData(newProcessData);
                if (button_type !== "addAnother") {
                  handleToDoClose();
                  setAddAnotherTodo(false);
                } else if (button_type === "addAnother") {
                  setAddAnotherTodo(true);
                  setToDoType("M"); // code edited on 29 June 2023 for BugId 130728
                }
              } else {
                setDisableAddBtn(null);
              }
            })
            .catch((err) => {
              console.log(err);
              setDisableAddBtn(null);
            });
        }
      }
    }
  };

  // code added on 4 July 2022 for BugId 111567
  // code added on 4 August 2022 for BugId 113920
  // code edited on 19 Dec 2022 for BugId 120715
  const modifyToDoFromList = (
    ToDoToAdd,
    groupId,
    ToDoDesc,
    toDoIdToModify,
    mandatoryValue,
    associateField,
    todoTypeValue
  ) => {
    if (ToDoToAdd?.trim() == "") {
      setDisableAddBtn(null);
      setShowNameError(true);
      document.getElementById("pmweb_toDo_AddtoDo_ToDoNameInput")?.focus();
    }
    if (ToDoDesc?.trim() == "") {
      setDisableAddBtn(null);
      setShowDescError(true);
      document.getElementById("pmweb_toDo_AddtoDo_ToDoDescInput")?.focus();
    }

    if (ToDoToAdd?.trim() !== "" && ToDoDesc?.trim() !== "") {
      if (todoTypeValue == "T" && !selectedTrigger) {
        setDisableAddBtn(null);
        setShowTriggerError(true);
      }
      let temp = [];
      let isBlackPickPresent = false;
      pickList?.map((el) => {
        if (el.name?.trim() == "") {
          isBlackPickPresent = true;
        } else {
          temp.push(el.name?.trim()?.toLowerCase()); //Changes made to solve Bug 139414
        }
      });
      let uniqueTemp = [...new Set([...temp])];
      if (toDoType == "T" && !selectedTrigger) {
        setShowTriggerError(true);
        setDisableAddBtn(null);
      }
      // Added for Bug 135568 on 27-09-23
      else if (ToDoDesc.length > 255) {
        setDisableAddBtn(null);
        dispatch(
          setToastDataFunc({
            message: `${t("length")} ${t("lengthOfDescriptionLengthLimit")}`,
            severity: "error",
            open: true,
          })
        );
      }
      // Till here for Bug 135568
      else if (uniqueTemp.length != temp.length) {
        dispatch(
          setToastDataFunc({
            message: t("removeDuplicatePicklists"),
            severity: "error",
            open: true,
          })
        );
        setDisableAddBtn(null);
      } else if (isBlackPickPresent && toDoType === "P") {
        dispatch(
          setToastDataFunc({
            message: t("removeBlankPicklists"),
            severity: "error",
            open: true,
          })
        );
        setDisableAddBtn(null);
      } else {
        axios
          .post(SERVER_URL + ENDPOINT_MODIFY_TODO, {
            processDefId: props.openProcessID,
            todoName: ToDoToAdd,
            todoId: toDoIdToModify,
            groupId: groupId,
            todoDesc: encode_utf8(ToDoDesc),
            viewType: todoTypeValue, // code edited on 19 Dec 2022 for BugId 120715
            mandatory: mandatoryValue, // code edited on 19 Dec 2022 for BugId 120715
            extObjID: "0",
            associatedField:
              associateField && associateField !== "defaultValue"
                ? associateField
                : "", //code added on 27 June 2022 for the issue-- todo cannot be added
            variableId: associateField == "CalendarName" ? "10001" : "42",
            varFieldId: "0",
            associatedWS: "",
            triggerName: selectedTrigger ? selectedTrigger : "",
            pickList: todoTypeValue === "P" ? [...pickList] : [],
          })
          .then((res) => {
            if (res.data.Status === 0) {
              let tempData = JSON.parse(JSON.stringify(toDoData));
              tempData?.TodoGroupLists?.map((group) => {
                group?.ToDoList?.map((todo) => {
                  // Modified on 05-09-2023 for Bug 135566
                  if (todo.ToDoId === toDoIdToModify) {
                    todo.Description = ToDoDesc;
                    todo.Type = todoTypeValue; // code edited on 19 Dec 2022 for BugId 120715
                    todo.TriggerName = selectedTrigger;
                    todo.Mandatory = mandatoryValue; // code edited on 19 Dec 2022 for BugId 120715
                    todo.PickListItems = [...pickList];
                    todo.FieldName = associateField;
                    todo.VarId =
                      associateField === "CalendarName" ? "10001" : "42";
                    todo.ToDoName = ToDoToAdd;
                  }
                  // Till here for Bug 135566
                });
              });
              setToDoData(tempData);

              // Updating processData on adding ToDo
              let newProcessData = JSON.parse(
                JSON.stringify(localLoadedProcessData)
              );
              newProcessData.ToDoList?.map((el) => {
                if (el.ToDoName > ToDoToAdd) {
                  el.AssociatedFieldName = associateField ? associateField : "";
                  el.Description = ToDoDesc;
                  el.Type = todoTypeValue; // code edited on 19 Dec 2022 for BugId 120715
                  el.VariableId =
                    associateField === "CalendarName" ? "10001" : "42";
                }
              });
              setLocalLoadedProcessData(newProcessData);
              handleToDoClose();
              setDisableAddBtn(null);
            }
          })
          .catch((err) => {
            console.log(err);
            setDisableAddBtn(null);
          });
      }
    }
  };

  const addGroupToList = (
    GroupToAdd,
    button_type,
    newGroupToMoveTodo,
    errorMsg
  ) => {
    setGroupName(GroupToAdd);
    let exist = false;
    toDoData?.TodoGroupLists?.map((group) => {
      if (group.GroupName.toLowerCase() == GroupToAdd.toLowerCase()) {
        setbGroupExists(true);
        exist = true;
      }
    });
    if (exist || errorMsg) {
      return;
    }
    if (GroupToAdd.trim() !== "") {
      let maxGroupId = toDoData?.TodoGroupLists?.reduce(
        (acc, group) => (+acc > +group.GroupId ? acc : group.GroupId),
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
            tempData?.TodoGroupLists?.push({
              GroupName: GroupToAdd,
              AllGroupRights: {
                View: true,
                Modify: false,
              },
              GroupId: +maxGroupId + 1,
              ToDoList: [],
            });
            setToDoData(tempData);
            setAddGroupModal(false);
            if (newGroupToMoveTodo) {
              MoveToOtherGroup(
                GroupToAdd,
                newGroupToMoveTodo.todoId,
                newGroupToMoveTodo.todoName,
                newGroupToMoveTodo.todoDesc,
                newGroupToMoveTodo.sourceGroupId
              );
            }
            if (button_type !== "addAnother") {
              handleClose();
              setGroupName("");
            } else if (button_type === "addAnother") {
              handleOpen();
              if (document.getElementById("todo_groupNameId")) {
                document.getElementById("todo_groupNameId")?.focus();
              }
              setGroupName("");
            }
          }
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      dispatch(
        setToastDataFunc({
          message: t("pleaseEnterGroupName"),
          severity: "error",
          open: true,
        })
      );
      document.getElementById("todo_groupNameId")?.focus();
    }
  };

  const deleteToDo = (todoName, todoId) => {
    axios
      .post(SERVER_URL + ENDPOINT_DELETE_TODO, {
        processDefId: props.openProcessID,
        todoName: todoName,
        todoId: todoId,
        viewType: toDoType,
        mandatory: true,
      })
      .then((res) => {
        if (res.data.Status == 0) {
          setTaskAssociation(res?.data?.Validations);
          if (res?.data?.Validations?.length > 0) {
            //setIsDeleteModalOpen(true);
            setShowDependencyModal(true);
          } else {
            let tempData = { ...toDoData };
            let exceptionToDeleteIndex, parentIndex;
            tempData.TodoGroupLists.forEach((group, groupIndex) => {
              group.ToDoList.forEach((exception, exceptionIndex) => {
                if (exception.ToDoId == todoId) {
                  exceptionToDeleteIndex = exceptionIndex;
                  parentIndex = groupIndex;
                }
              });
            });
            //code added on 8 June 2022 for BugId 110197
            //Updating RuleDataArray
            let tempRule = [...ruleDataArray];
            let idx = null;
            tempRule.forEach((exp, index) => {
              if (exp.NameId === todoId) {
                idx = index;
              }
            });
            tempRule.splice(idx, 1);
            setRuleDataArray(tempRule);

            tempData.TodoGroupLists[parentIndex].ToDoList.splice(
              exceptionToDeleteIndex,
              1
            );
            setToDoData(tempData);
            handleClose();

            // Updating processData on deleting ToDo
            let newProcessData = JSON.parse(
              JSON.stringify(localLoadedProcessData)
            );
            let indexValue;
            newProcessData.ToDoList.forEach((todo, index) => {
              if (todo.ToDoName === todoName) {
                indexValue = index;
              }
            });
            newProcessData.ToDoList.splice(indexValue, 1);
            setLocalLoadedProcessData(newProcessData);
          }
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const deleteGroup = (groupName, groupId) => {
    // Changes made to solve Bug 131944
    let allTodoIds = [];
    let allTodoNames = [];
    toDoData?.TodoGroupLists?.map((el) => {
      if (el.GroupId == groupId) {
        el?.ToDoList?.map((ep) => {
          allTodoIds.push(ep.ToDoId);
          allTodoNames.push(ep.ToDoName);
        });
      }
    });
    axios
      .post(SERVER_URL + ENDPOINT_DELETE_GROUP, {
        processDefId: props.openProcessID,
        m_strGroupName: groupName,
        m_strGroupId: groupId,
        interfaceType: "T",
        interfaceElementId: allTodoIds.join(),
        interfaceElementName: allTodoNames.join(),
      })
      .then((res) => {
        if (res.data.Status == 0) {
          setTaskAssociation(res?.data?.Validations);
          if (res?.data?.Validations?.length > 0) {
            //setIsDeleteModalOpen(true);
            setShowDependencyModal(true);
          } else {
            let groupIndexToDelete;
            let tempData = { ...toDoData };
            tempData.TodoGroupLists.map((group, groupIndex) => {
              if (group.GroupId == groupId) {
                groupIndexToDelete = groupIndex;
              }
            });
            tempData.TodoGroupLists.splice(groupIndexToDelete, 1);
            setToDoData(tempData);
            handleToDoClose();
          }
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // commented on 26/09/2023 for BugId 137188 and BugId 137185
  // Changes made to solve Bug 132136
  // useEffect(() => {
  //   let newState = { ...toDoData };
  //   newState?.TodoGroupLists?.forEach((group) => {
  //     group?.ToDoList?.map((todo) => {
  //       if (fullRightCheckOneActivityArr.includes(false)) {
  //         todo.AllTodoRights["Modify"] = false;
  //         todo.AllTodoRights["View"] = false;
  //       } else {
  //         todo.AllTodoRights["Modify"] = true;
  //         todo.AllTodoRights["View"] = true;
  //       }
  //     });
  //     setToDoData(newState);
  //   });
  // }, [fullRightCheckOneActivityArr]);
  //  till here BugId 137188 and BugId 137185

  const handleOpen = () => {
    setAddGroupModal(true);
  };

  const handleClose = () => {
    setAddGroupModal(false);
    setbGroupExists(false);
  };

  const handleToDoOpen = (groupId) => {
    setAddToDoModal(groupId);
    // added on 08/01/24 for BugId 141670
    setDisableAddBtn(true);
    // till here BugId 141670
  };

  const handleToDoClose = () => {
    setAddToDoModal(null);
    setbToDoExists(false);
  };

  const handleActivityModalOpen = (activity_id) => {
    setOpenActivityModal(activity_id);
  };

  const handleActivityModalClose = () => {
    setOpenActivityModal(null);
  };

  const clearSearchResult = () => {
    setToDoData(filteredToDoTypes);
  };

  const clearActivitySearchResult = () => {
    let activityIdString = "";
    localLoadedProcessData?.MileStones.map((mileStone) => {
      mileStone.Activities.map((activity, index) => {
        activityIdString = activityIdString + activity.ActivityId + ",";
      });
    });
    MapAllActivities(activityIdString);
    setLoadedMileStones(localLoadedProcessData?.MileStones);
  };

  const onSearchChange = (value) => {
    if (value.trim() !== "") {
      let tempState = [];
      toDoData.TodoGroupLists &&
        toDoData.TodoGroupLists.forEach((group, index) => {
          let temp = group.ToDoList.filter((todo) => {
            if (todo.ToDoName.toLowerCase().includes(value.toLowerCase())) {
              return todo;
            }
          });
          if (temp.length > 0) {
            tempState.push({ ...group, ToDoList: temp });
          }
        });
      setToDoData((prevState) => {
        return { ...prevState, TodoGroupLists: tempState };
      });
    } else {
      clearSearchResult();
    }
  };

  const onActivitySearchChange = (value) => {
    let temp = [];
    setActivitySearchTerm(value);
    if (value.trim() !== "") {
      let activityIdString = "";
      loadedMileStones.map((mileStone) => {
        let activities = [];
        mileStone.Activities.map((activity, index) => {
          if (
            activity.ActivityName.toLowerCase().includes(value.toLowerCase())
          ) {
            activityIdString = activityIdString + activity.ActivityId + ",";
            activities.push(activity);
          }
        });
        temp.push({ ...mileStone, Activities: activities });
      });
      setLoadedMileStones(temp);
    } else {
      clearActivitySearchResult();
    }
  };

  const toggleSingleChecks = (
    checks,
    check_type,
    todo_idx,
    activity_id,
    groupIndex
  ) => {
    // CASE:1 - Single checkBox of any Activity in Any ToDo
    let localCheckArray;
    localCheckArray = {
      View:
        check_type == "Modify" && !checks[check_type]
          ? "Y"
          : checks.View
          ? "Y"
          : "N",
      Modify:
        check_type == "View" && checks[check_type]
          ? "N"
          : checks.Modify
          ? "Y"
          : "N",
    };

    let postBody = !checks[check_type]
      ? {
          processDefId: props.openProcessID,
          pMTodoTypeInfoList: [
            {
              todoName:
                toDoData.TodoGroupLists[groupIndex].ToDoList[todo_idx].ToDoName,
              todoId:
                toDoData.TodoGroupLists[groupIndex].ToDoList[todo_idx].ToDoId,
              pMActRightsInfoList: [
                {
                  actId: activity_id,
                  view: check_type == "View" ? "Y" : localCheckArray.View,
                  modify: check_type == "Modify" ? "Y" : localCheckArray.Modify,
                },
              ],
            },
          ],
        }
      : {
          processDefId: props.openProcessID,
          pMTodoTypeInfoList: [
            {
              todoName:
                toDoData.TodoGroupLists[groupIndex].ToDoList[todo_idx].ToDoName,
              todoId:
                toDoData.TodoGroupLists[groupIndex].ToDoList[todo_idx].ToDoId,
              pMActRightsInfoList: [
                {
                  actId: activity_id,
                  view: check_type == "View" ? "N" : localCheckArray.View,
                  modify: check_type == "Modify" ? "N" : localCheckArray.Modify,
                },
              ],
            },
          ],
        };
    axios.post(SERVER_URL + `/saveTodoRight`, postBody).then((res) => {
      if (res.status === 200) {
      }
    });
    let newState = { ...toDoData };

    // single-check
    newState.TodoGroupLists[groupIndex].ToDoList[todo_idx].Activities.map(
      (activity) => {
        if (+activity.ActivityId === +activity_id) {
          activity[check_type] = !activity[check_type];
          if (check_type === "Modify" && activity[check_type]) {
            activity["View"] = true;
          }
          if (check_type === "View" && !activity[check_type]) {
            activity["Modify"] = false;
          }
        }
      }
    );

    // set-all check
    let setModifyAllPropCheck = true;
    let setViewAllPropCheck = true;
    newState.TodoGroupLists[groupIndex].ToDoList[todo_idx].Activities.forEach(
      (activity) => {
        let actType = getActType(activity.ActivityId);
        if (+actType !== 2 && +actType !== 3 && +actType !== 11) {
          if (!activity.View) {
            setViewAllPropCheck = false;
          }
          if (!activity.Modify) {
            setModifyAllPropCheck = false;
          }
        } else if (+actType === 2 || +actType === 3 || +actType === 11) {
          if (!activity.View) {
            setViewAllPropCheck = false;
          }
        }
      }
    );
    newState.TodoGroupLists[groupIndex].ToDoList[todo_idx].AllTodoRights[
      "View"
    ] = setViewAllPropCheck;
    newState.TodoGroupLists[groupIndex].ToDoList[todo_idx].AllTodoRights[
      "Modify"
    ] = setModifyAllPropCheck;

    //OneActivityColumn All checks
    /*let bFlag = true;
    newState.TodoGroupLists[groupIndex].ToDoList.map((exception) => {
      exception.Activities.map((activity) => {
        if (activity.ActivityId == activity_id) {
          if (
            restrictAct(
              getActTypesFromActId(activity?.ActivityId).actType,
              getActTypesFromActId(activity?.ActivityId).subActType
            )
              ? activity["View"] === false
              : Object.values(activity).includes(false) && bFlag
          ) {
            bFlag = false;
            setFullRightCheckOneActivityArr((prevArr) => {
              let temp = [...prevArr];
              temp[activity_id] = false;
              return temp;
            });
          }
        }
      });
    });
    if (bFlag) {
      setFullRightCheckOneActivityArr((prevArr) => {
        let temp = [...prevArr];
        temp[activity_id] = true;
        return temp;
      });
    }*/
    let localActivityArr = [];
    let localActivityIdArr = [];
    newState?.TodoGroupLists.forEach((group) => {
      group.ToDoList?.forEach((todo) => {
        todo.Activities = todo.Activities.sort((a, b) =>
          +a.ActivityId > +b.ActivityId ? 1 : -1
        );
        todo.Activities?.forEach((activity, act_idx) => {
          let actType = getActType(activity.ActivityId);
          if (+actType !== 2 && +actType !== 3 && +actType !== 11) {
            if (Object.values(activity).includes(false)) {
              localActivityArr[act_idx] = false;
            } else {
              if (localActivityArr[act_idx] !== false) {
                localActivityArr[act_idx] = true;
              }
            }
          } else if (+actType === 2 || +actType === 3 || +actType === 11) {
            if (!activity.View) {
              localActivityArr[act_idx] = false;
            } else {
              if (localActivityArr[act_idx] !== false) {
                localActivityArr[act_idx] = true;
              }
            }
          }
          localActivityIdArr[act_idx] = activity.ActivityId;
        });
      });
    });

    let localObj = [...fullRightCheckOneActivityArr];
    localActivityArr?.forEach((activity, activityIndex) => {
      if (activity === false) {
        localObj[localActivityIdArr[activityIndex]] = false;
      } else {
        localObj[localActivityIdArr[activityIndex]] = true;
      }
    });
    setFullRightCheckOneActivityArr(localObj);
    setToDoData(newState);
  };

  const updateActivityAllTodoRights = (
    check_type,
    activity_id,
    checkTypeValue,
    setChecks,
    checks
  ) => {
    // CASE:5 - Giving a particular right (eg:View) for one Activity, in all ToDo
    let localCheckArray;
    localCheckArray = {
      View:
        check_type == "Modify" && checkTypeValue
          ? "Y"
          : checks.View
          ? "Y"
          : "N",
      Modify:
        check_type == "View" && !checkTypeValue
          ? "N"
          : checks.Modify
          ? "Y"
          : "N",
    };

    let tempInfoListTrue = [];
    toDoData.TodoGroupLists.forEach((group) => {
      group.ToDoList.forEach((todo) => {
        tempInfoListTrue.push({
          todoName: todo.ToDoName,
          todoId: todo.ToDoId,
          pMActRightsInfoList: [
            {
              actId: activity_id,
              view: check_type == "View" ? "Y" : localCheckArray.View,
              modify: check_type == "Modify" ? "Y" : localCheckArray.Modify,
            },
          ],
        });
      });
    });

    let tempInfoListFalse = [];
    toDoData.TodoGroupLists.forEach((group) => {
      group.ToDoList.forEach((todo) => {
        tempInfoListFalse.push({
          todoName: todo.ToDoName,
          todoId: todo.ToDoId,
          pMActRightsInfoList: [
            {
              actId: activity_id,
              view: check_type == "View" ? "N" : localCheckArray.View,
              modify: check_type == "Modify" ? "N" : localCheckArray.Modify,
            },
          ],
        });
      });
    });
    let postBody = checkTypeValue
      ? {
          processDefId: props.openProcessID,
          pMTodoTypeInfoList: tempInfoListTrue,
        }
      : {
          processDefId: props.openProcessID,
          pMTodoTypeInfoList: tempInfoListFalse,
        };
    axios.post(SERVER_URL + `/saveTodoRight`, postBody).then((res) => {
      if (res.status === 200) {
      }
    });

    let newState = { ...toDoData };
    // modified on 16/10/23 for BugId 139505
    // if (check_type == "Modify") {
    if (check_type === "Modify" && checkTypeValue === true) {
      setChecks((prev) => {
        return {
          ...prev,
          View: true,
        };
      });
    }
    // till here BugId 139505
    if (check_type === "View" && checkTypeValue === false) {
      setChecks((prev) => {
        return {
          ...prev,
          Modify: false,
        };
      });
    }
    newState.TodoGroupLists = newState.TodoGroupLists.map((group) => {
      group.ToDoList = group.ToDoList.map((todo) => {
        let isViewAllChecked = true,
          isModifyAllChecked = true;
        todo.Activities = todo.Activities.map((activity) => {
          let actType = getActType(activity.ActivityId);
          if (+activity.ActivityId === +activity_id) {
            activity[check_type] = checkTypeValue;
            // added on 16/10/23 for BugId 139505
            if (check_type === "View" && checkTypeValue === false) {
              activity["Modify"] = checkTypeValue;
            }
            if (check_type === "Modify" && checkTypeValue === true) {
              activity["View"] = checkTypeValue;
            }
            // till here BugId 139505
          }
          // added on 16/10/23 for BugId 139505
          if (+actType !== 2 && +actType !== 3 && +actType !== 11) {
            if (activity["View"] === false && isViewAllChecked) {
              isViewAllChecked = false;
            }
            if (activity["Modify"] === false && isModifyAllChecked) {
              isModifyAllChecked = false;
            }
          } else {
            if (activity["View"] === false && isViewAllChecked) {
              isViewAllChecked = false;
            }
          }
          // till here BugId 139505
          return activity;
        });
        // added on 16/10/23 for BugId 139505
        todo.AllTodoRights["View"] = isViewAllChecked;
        todo.AllTodoRights["Modify"] = isModifyAllChecked;
        // till here BugId 139505
        return todo;
      });
      return group;
    });
    // //OneActivityColumn All checks
    let bFlag = true;
    // modified on 16/10/23 for BugId 139505
    newState.TodoGroupLists.forEach((group) => {
      group.ToDoList.forEach((exception) => {
        exception.Activities.forEach((activity) => {
          let actType = getActType(activity.ActivityId);
          if (+activity.ActivityId === +activity_id) {
            if (+actType !== 2 && +actType !== 3 && +actType !== 11) {
              if (activity["View"] === false && bFlag) {
                bFlag = false;
              }
              if (activity["Modify"] === false && bFlag) {
                bFlag = false;
              }
            } else {
              if (activity["View"] === false && bFlag) {
                bFlag = false;
              }
            }
          }
        });
      });
    });
    setFullRightCheckOneActivityArr((prevArr) => {
      let temp = [...prevArr];
      temp[activity_id] = bFlag;
      return temp;
    });
    // till here BugId 139505
    setToDoData(newState);
  };

  const updateAllTodoRights = (check_val, check_type, todo_idx, groupIndex) => {
    // CASE:3 - Giving a particular right (eg: Modify) for a Single ToDo, for all Activities
    let localCheckArray;
    localCheckArray = {
      View:
        check_type == "Modify" && !check_val
          ? "Y"
          : toDoData.TodoGroupLists[groupIndex].ToDoList[todo_idx]
              .AllTodoRights["View"]
          ? "Y"
          : "N",
      Modify:
        check_type == "View" && check_val
          ? "N"
          : toDoData.TodoGroupLists[groupIndex].ToDoList[todo_idx]
              .AllTodoRights["Modify"]
          ? "Y"
          : "N",
    };

    let postBody = !check_val
      ? {
          processDefId: props.openProcessID,
          pMTodoTypeInfoList: [
            {
              todoName:
                toDoData.TodoGroupLists[groupIndex].ToDoList[todo_idx].ToDoName,

              todoId:
                toDoData.TodoGroupLists[groupIndex].ToDoList[todo_idx].ToDoId,
              pMActRightsInfoList: [
                {
                  actId: 0,
                  view: check_type == "View" ? "Y" : localCheckArray.View,
                  modify: check_type == "Modify" ? "Y" : localCheckArray.Modify,
                },
              ],
            },
          ],
        }
      : {
          processDefId: props.openProcessID,
          pMTodoTypeInfoList: [
            {
              todoName:
                toDoData.TodoGroupLists[groupIndex].ToDoList[todo_idx].ToDoName,

              todoId:
                toDoData.TodoGroupLists[groupIndex].ToDoList[todo_idx].ToDoId,
              pMActRightsInfoList: [
                {
                  actId: 0,
                  view: check_type == "View" ? "N" : localCheckArray.View,
                  modify: check_type == "Modify" ? "N" : localCheckArray.Modify,
                },
              ],
            },
          ],
        };
    axios.post(SERVER_URL + `/saveTodoRight`, postBody).then((res) => {
      if (res.status === 200) {
      }
    });

    let newState = { ...toDoData };
    //set-all
    newState.TodoGroupLists[groupIndex].ToDoList[todo_idx].AllTodoRights[
      check_type
    ] = !check_val;

    if (check_type === "Modify" && !check_val) {
      newState.TodoGroupLists[groupIndex].ToDoList[todo_idx].AllTodoRights[
        "View"
      ] = !check_val;
    }
    if (check_type === "View" && check_val) {
      newState.TodoGroupLists[groupIndex].ToDoList[todo_idx].AllTodoRights[
        "Modify"
      ] = false;
    }
    //activities
    newState.TodoGroupLists[groupIndex].ToDoList[todo_idx].Activities.map(
      (activity) => {
        activity[check_type] = !check_val;
        if (check_type === "Modify" && !check_val) {
          activity["View"] = !check_val;
        }
        if (check_type === "View" && check_val) {
          activity["Modify"] = false;
        }
      }
    );

    // modified on 16/10/23 for BugId 139505
    /*const filterAllRights = allToDoRightsTemp.filter(
      (d) => d.View === false || d.Modify === false
    );
    let tempFullRightsActArr = [...fullRightCheckOneActivityArr];
    if (filterAllRights.length === 0) {
      tempFullRightsActArr.forEach((item, i) => {
        if (item === false) {
          tempFullRightsActArr[i] = true;
        }
      });
    } else {
      tempFullRightsActArr.forEach((item, i) => {
        if (item === true) {
          tempFullRightsActArr[i] = false;
        }
      });
    }
    setFullRightCheckOneActivityArr(tempFullRightsActArr);*/
    let localActivityArr = [];
    let localActivityIdArr = [];
    newState?.TodoGroupLists.forEach((group) => {
      group.ToDoList?.forEach((todo) => {
        todo.Activities = todo.Activities.sort((a, b) =>
          +a.ActivityId > +b.ActivityId ? 1 : -1
        );
        todo.Activities?.forEach((activity, act_idx) => {
          let actType = getActType(activity.ActivityId);
          if (+actType !== 2 && +actType !== 3 && +actType !== 11) {
            if (Object.values(activity).includes(false)) {
              localActivityArr[act_idx] = false;
            } else {
              if (localActivityArr[act_idx] !== false) {
                localActivityArr[act_idx] = true;
              }
            }
          } else if (+actType === 2 || +actType === 3 || +actType === 11) {
            if (!activity.View) {
              localActivityArr[act_idx] = false;
            } else {
              if (localActivityArr[act_idx] !== false) {
                localActivityArr[act_idx] = true;
              }
            }
          }
          localActivityIdArr[act_idx] = activity.ActivityId;
        });
      });
    });

    let localObj = [...fullRightCheckOneActivityArr];
    localActivityArr?.forEach((activity, activityIndex) => {
      if (activity === false) {
        localObj[localActivityIdArr[activityIndex]] = false;
      } else {
        localObj[localActivityIdArr[activityIndex]] = true;
      }
    });
    setFullRightCheckOneActivityArr(localObj);
    // till here BugId 139505
    setToDoData(newState);
  };

  const GiveCompleteRights = (todo_idx, groupIndex, allRights) => {
    // CASE:2 - Giving all rights to one ToDo for all Activities
    let postBody = allRights
      ? {
          processDefId: props.openProcessID,
          pMTodoTypeInfoList: [
            {
              todoName:
                toDoData.TodoGroupLists[groupIndex].ToDoList[todo_idx].ToDoName,
              todoId:
                toDoData.TodoGroupLists[groupIndex].ToDoList[todo_idx].ToDoId,
              pMActRightsInfoList: [
                {
                  actId: 0,
                  view: "Y",
                  modify: "Y",
                },
              ],
            },
          ],
        }
      : {
          processDefId: props.openProcessID,
          pMTodoTypeInfoList: [
            {
              todoName:
                toDoData.TodoGroupLists[groupIndex].ToDoList[todo_idx].ToDoName,
              todoId:
                toDoData.TodoGroupLists[groupIndex].ToDoList[todo_idx].ToDoId,
              pMActRightsInfoList: [
                {
                  actId: 0,
                  view: "N",
                  modify: "N",
                },
              ],
            },
          ],
        };
    axios.post(SERVER_URL + `/saveTodoRight`, postBody).then((res) => {
      if (res.status === 200) {
      }
    });

    let newState = { ...toDoData };
    let setObj =
      newState.TodoGroupLists[groupIndex].ToDoList[todo_idx].AllTodoRights;
    for (let property in setObj) {
      setObj[property] = allRights;
    }
    newState.TodoGroupLists[groupIndex].ToDoList[todo_idx].AllTodoRights =
      setObj;

    newState.TodoGroupLists[groupIndex].ToDoList[todo_idx].Activities =
      newState.TodoGroupLists[groupIndex].ToDoList[todo_idx].Activities.map(
        (activity) => {
          for (let property in activity) {
            if (property !== "ActivityId" && property !== "ActivityName") {
              activity[property] = allRights;
            }
          }
          return activity;
        }
      );

    // modified on 16/10/23 for BugId 139505
    /*const filterAllRights = allToDoRightsTemp.filter(
      (d) => d.View === false || d.Modify === false
    );

    let tempFullRightsActArr = [...fullRightCheckOneActivityArr];
    if (filterAllRights.length === 0) {
      tempFullRightsActArr.forEach((item, i) => {
        if (item === false) {
          tempFullRightsActArr[i] = true;
        }
      });
      //setFullRightCheckOneActivityArr(fullRightCheckOneActivityArr)
    } else {
      // setFullRightCheckOneActivityArr([])
      tempFullRightsActArr.forEach((item, i) => {
        if (item === true) {
          tempFullRightsActArr[i] = false;
        }
      });
    }
    setFullRightCheckOneActivityArr(tempFullRightsActArr);*/
    let localActivityArr = [];
    let localActivityIdArr = [];
    newState?.TodoGroupLists.forEach((group) => {
      group.ToDoList?.forEach((todo) => {
        todo.Activities = todo.Activities.sort((a, b) =>
          +a.ActivityId > +b.ActivityId ? 1 : -1
        );
        todo.Activities?.forEach((activity, act_idx) => {
          let actType = getActType(activity.ActivityId);
          if (+actType !== 2 && +actType !== 3 && +actType !== 11) {
            if (Object.values(activity).includes(false)) {
              localActivityArr[act_idx] = false;
            } else {
              if (localActivityArr[act_idx] !== false) {
                localActivityArr[act_idx] = true;
              }
            }
          } else if (+actType === 2 || +actType === 3 || +actType === 11) {
            if (!activity.View) {
              localActivityArr[act_idx] = false;
            } else {
              if (localActivityArr[act_idx] !== false) {
                localActivityArr[act_idx] = true;
              }
            }
          }
          localActivityIdArr[act_idx] = activity.ActivityId;
        });
      });
    });

    let localObj = [...fullRightCheckOneActivityArr];
    localActivityArr?.forEach((activity, activityIndex) => {
      if (activity === false) {
        localObj[localActivityIdArr[activityIndex]] = false;
      } else {
        localObj[localActivityIdArr[activityIndex]] = true;
      }
    });
    setFullRightCheckOneActivityArr(localObj);
    setToDoData(newState);
    // till here BugId 139505
  };

  const GiveCompleteRightsToOneActivity = (activityId) => {
    // CASE:4 - Giving full Rights to one Activity in all ToDos
    let postBody = !fullRightCheckOneActivityArr[activityId]
      ? {
          processDefId: props.openProcessID,
          pMTodoTypeInfoList: [
            {
              todoName: "",
              todoId: "0",
              pMActRightsInfoList: [
                {
                  actId: activityId,
                  view: "Y",
                  modify: "Y",
                },
              ],
            },
          ],
        }
      : {
          processDefId: props.openProcessID,
          pMTodoTypeInfoList: [
            {
              todoName: "",
              todoId: "0",
              pMActRightsInfoList: [
                {
                  actId: activityId,
                  view: "N",
                  modify: "N",
                },
              ],
            },
          ],
        };
    axios.post(SERVER_URL + `/saveTodoRight`, postBody).then((res) => {
      if (res?.status === 200) {
      }
    });

    let fullRightCheck = !fullRightCheckOneActivityArr[activityId];
    let arr = [...fullRightCheckOneActivityArr];
    arr[activityId] = fullRightCheck;

    let newState = { ...toDoData };
    newState.TodoGroupLists = newState.TodoGroupLists.map((group) => {
      group.ToDoList = group.ToDoList.map((todo) => {
        let isViewAllChecked = true,
          isModifyAllChecked = true;
        todo.Activities = todo.Activities.map((activity) => {
          let actType = getActType(activity.ActivityId);
          if (+activity.ActivityId === +activityId) {
            giveCompleteRights(fullRightCheck, activity);
            // till here BugId 139505
          }
          // added on 16/10/23 for BugId 139505
          if (+actType !== 2 && +actType !== 3 && +actType !== 11) {
            if (activity["View"] === false && isViewAllChecked) {
              isViewAllChecked = false;
            }
            if (activity["Modify"] === false && isModifyAllChecked) {
              isModifyAllChecked = false;
            }
          } else {
            if (activity["View"] === false && isViewAllChecked) {
              isViewAllChecked = false;
            }
          }
          // till here BugId 139505
          return activity;
        });
        // added on 16/10/23 for BugId 139505
        todo.AllTodoRights["View"] = isViewAllChecked;
        todo.AllTodoRights["Modify"] = isModifyAllChecked;
        // till here BugId 139505
        return todo;
      });
      return group;
    });
    setToDoData(newState);
    setFullRightCheckOneActivityArr(arr);
  };

  const handleAllRights = (
    checkedVal,
    grpIdx,
    todoIdx,
    actId,
    actType,
    subActType
  ) => {
    // CASE: 6 - This function runs when we check/uncheck all rights checkbox for a particular activity for a
    // particular todo.
    let newState = { ...toDoData };
    newState.TodoGroupLists[grpIdx].ToDoList[todoIdx].Activities.map(
      (activity) => {
        if (activity.ActivityId == actId) {
          if (!disableToDoChecks(props, "View")) {
            activity["View"] = checkedVal;
          }
          if (!restrictAct(actType, subActType)) {
            activity["Modify"] = checkedVal;
          }
        }
      }
    );

    // Controlling set-all
    let setModifyAllPropCheck = true;
    let setViewAllPropCheck = true;
    newState?.TodoGroupLists[grpIdx]?.ToDoList[todoIdx]?.Activities.forEach(
      (activity) => {
        let actType = getActType(activity.ActivityId);
        if (+actType !== 2 && +actType !== 3 && +actType !== 11) {
          if (!activity.View) {
            setViewAllPropCheck = false;
          }
          if (!activity.Modify) {
            setModifyAllPropCheck = false;
          }
        } else if (+actType === 2 || +actType === 3 || +actType === 11) {
          if (!activity.View) {
            setViewAllPropCheck = false;
          }
        }
      }
    );
    newState.TodoGroupLists[grpIdx].ToDoList[todoIdx].AllTodoRights["View"] =
      setViewAllPropCheck;
    newState.TodoGroupLists[grpIdx].ToDoList[todoIdx].AllTodoRights["Modify"] =
      setModifyAllPropCheck;

    // Column Top full Column handle checkBox
    let localActivityArr = [];
    let localActivityIdArr = [];
    newState?.TodoGroupLists.forEach((group) => {
      group.ToDoList?.forEach((todo) => {
        todo.Activities = todo.Activities.sort((a, b) =>
          +a.ActivityId > +b.ActivityId ? 1 : -1
        );
        todo.Activities?.forEach((activity, act_idx) => {
          let actType = getActType(activity.ActivityId);
          if (+actType !== 2 && +actType !== 3 && +actType !== 11) {
            if (Object.values(activity).includes(false)) {
              localActivityArr[act_idx] = false;
            } else {
              if (localActivityArr[act_idx] !== false) {
                localActivityArr[act_idx] = true;
              }
            }
          } else if (+actType === 2 || +actType === 3 || +actType === 11) {
            if (!activity.View) {
              localActivityArr[act_idx] = false;
            } else {
              if (localActivityArr[act_idx] !== false) {
                localActivityArr[act_idx] = true;
              }
            }
          }
          localActivityIdArr[act_idx] = activity.ActivityId;
        });
      });
    });
    let localObj = [...fullRightCheckOneActivityArr];
    localActivityArr?.forEach((activity, activityIndex) => {
      if (activity === false) {
        localObj[localActivityIdArr[activityIndex]] = false;
      } else {
        localObj[localActivityIdArr[activityIndex]] = true;
      }
    });
    setFullRightCheckOneActivityArr(localObj);

    let postBody = checkedVal
      ? {
          processDefId: props.openProcessID,
          pMTodoTypeInfoList: [
            {
              todoName:
                toDoData.TodoGroupLists[grpIdx].ToDoList[todoIdx].ToDoName,
              todoId: toDoData.TodoGroupLists[grpIdx].ToDoList[todoIdx].ToDoId,
              pMActRightsInfoList: [
                {
                  actId: actId,
                  view: "Y",
                  modify: restrictAct(actType, subActType) ? "N" : "Y",
                },
              ],
            },
          ],
        }
      : {
          processDefId: props.openProcessID,
          pMTodoTypeInfoList: [
            {
              todoName:
                toDoData.TodoGroupLists[grpIdx].ToDoList[todoIdx].ToDoName,
              todoId: toDoData.TodoGroupLists[grpIdx].ToDoList[todoIdx].ToDoId,
              pMActRightsInfoList: [
                {
                  actId: actId,
                  view: "N",
                  modify: "N",
                },
              ],
            },
          ],
        };
    axios.post(SERVER_URL + `/saveTodoRight`, postBody).then((res) => {
      if (res.status === 200) {
      }
    });

    setToDoData(newState);
  };

  // code added on 24 Nov 2022 for BugId 119498
  const GetActivities = () => {
    let display = [];
    if (splicedColumns?.length > 0 && toDoData?.TodoGroupLists?.length > 0) {
      splicedColumns?.forEach((activity, activityIndex) => {
        let data = [];
        toDoData.TodoGroupLists?.forEach((group, groupIndex) => {
          data.push(<p style={{ height: "40px" }}></p>);
          group.ToDoList?.forEach((todo, todoIndex) => {
            data.push(
              <div>
                <div
                  className="oneActivityColumn"
                  style={{
                    backgroundColor: "#EEF4FCC4",
                    //height: compact ? "38px" : "89px",
                    //[25-03-2023] On Safari, the height 89px was distorting screen
                    height: compact ? "38px" : "",
                    borderBottom: "1px solid #DAD0C2",
                    padding: "10px 10px 6px 10px",
                  }}
                >
                  <CheckBoxes //activity CheckBoxes
                    groupIndex={groupIndex}
                    title={`${todo?.Description}_${activity.ActivityName}_${todoIndex}`}
                    activityIndex={todoIndex}
                    docIdx={todoIndex}
                    activityId={activity.ActivityId}
                    toDoData={toDoData}
                    activityType={activity.ActivityType}
                    processType={localLoadedProcessData?.ProcessType} // code edited on 19 Dec 2022 for BugId 120719
                    subActivity={activity.ActivitySubType}
                    toDoIsMandatory={todo.Mandatory}
                    GiveCompleteRights={GiveCompleteRights}
                    toggleSingleChecks={toggleSingleChecks}
                    handleAllChecks={handleAllRights}
                    type={"activity"}
                    isReadOnly={isReadOnly}
                    ariaDescription={`Acitivty Name: ${activity.ActivityName} ToDo Name: ${todo?.ToDoName} Group Name: ${group.GroupName}`}
                  />
                </div>
              </div>
            );
          });
        });
        display.push(
          <div className="activities">
            <div className="activityHeaderToDo">
              {/*code edited on 27 Dec 2022 for BugId 120743 */}
              {/* <LightTooltip
                id="pmweb_toDo_toolTip_ActivityName"
                arrow={true}
                placement="bottom-start"
                title={activity?.ActivityName}
              >
                <span className="actHeaderName">{activity.ActivityName}</span>
              </LightTooltip> */}
              <FormControlLabel
                // style={{ flexDirection: "row-reverse" }}
                label={
                  <LightTooltip
                    id="pmweb_toDo_toolTip_ActivityName"
                    arrow={true}
                    placement="bottom-start"
                    title={activity?.ActivityName}
                  >
                    <span className="actHeaderName">
                      {activity.ActivityName}
                    </span>
                  </LightTooltip>
                }
                // Checkbox to control all the rights for a single activity in all todos.
                control={<Checkbox tabIndex={0} />}
                id={`pmweb_toDo_masterCheck_${activity.ActivityName}_oneActivity_todo`}
                checked={
                  fullRightCheckOneActivityArr[activity.ActivityId] &&
                  (localLoadedProcessData?.ProcessType === "L" ||
                    localLoadedProcessData?.ProcessType === "R") // code edited on 19 Dec 2022 for BugId 120719
                    ? true
                    : false
                }
                disabled={
                  isReadOnly || localLoadedProcessData?.ProcessType !== "L"
                    ? true
                    : false // code edited on 19 Dec 2022 for BugId 120719
                }
                onChange={() =>
                  GiveCompleteRightsToOneActivity(activity.ActivityId)
                }
                tabIndex={-1}
                ref={(item) => (activityCheckRef.current[activityIndex] = item)}
                onKeyUp={(e) => {
                  if (e.key === "Enter") {
                    activityCheckRef.current[activityIndex].click();
                    e.stopPropagation();
                  }
                }}
              />
              {/*code edited on 19 Dec 2022 for BugId 120719 */}
              {isReadOnly ||
              localLoadedProcessData?.ProcessType !== "L" ||
              noTodoPresent ? null : (
                <img
                  src={manageRights}
                  alt="ManageRights"
                  style={{ height: "10px", width: "10px" }}
                  id={`pmweb_toDo_oneActivity_particularRight_arrow_${uuidv4()}`}
                  onClick={() => handleActivityModalOpen(activity.ActivityId)}
                  tabIndex={0}
                  onKeyUp={(e) => {
                    if (e.key === "Enter") {
                      handleActivityModalOpen(activity.ActivityId);
                      e.stopPropagation();
                    }
                  }}
                  className="iconButton"
                  disableFocusRipple
                  disableTouchRipple
                  aria-label={`${activity?.ActivityName} Manage Rights`}
                />
                // <IconButton
                //   id={`pmweb_toDo_oneActivity_particularRight_arrow_${uuidv4()}`}
                //   onClick={() => handleActivityModalOpen(activity.ActivityId)}
                //   tabIndex={0}
                //   onKeyUp={(e) => {
                //     if (e.key === "Enter") {
                //       handleActivityModalOpen(activity.ActivityId);
                //       e.stopPropagation();
                //     }
                //   }}
                //   className="iconButton"
                //   disableFocusRipple
                //   disableTouchRipple
                //   aria-label={`${activity?.ActivityName} Manage Rights`}
                // >
                // </IconButton>
              )}
              {openActivityModal == activity.ActivityId ? (
                <FocusTrap open={openActivityModal == activity.ActivityId}>
                  <div className="relative">
                    <Backdrop
                      show={openActivityModal}
                      clicked={handleActivityModalClose}
                    />
                    <ActivityModal
                      compact={compact}
                      fullRightCheckOneActivity={
                        fullRightCheckOneActivityArr[activity.ActivityId]
                      }
                      activityIndex={activityIndex}
                      activityId={activity.ActivityId}
                      activityType={activity.ActivityType}
                      activitySubType={activity.ActivitySubType}
                      updateActivityAllTodoRights={updateActivityAllTodoRights}
                      type={"set-all"}
                      docTypeList={toDoData}
                      //Provided handleClose to close this Modal on Escape KeyPress
                      handleClose={handleActivityModalClose}
                    />
                  </div>
                </FocusTrap>
              ) : null}
            </div>
            {data}
          </div>
        );
      });
    } else {
      display.push(
        <div
          className="activities"
          style={{
            height: "72vh",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <img
            src={NoResultFound}
            // className="noSearchResultImage"
            style={{ height: "18rem" }}
            alt={t("noResultsFound")}
          />
          <p
            style={{
              marginTop: "10px",
              fontSize: "var(--base_text_font_size)",
              // top: "70%",
              // fontSize: "13px",
              // left: "56%",
              // position: "absolute",
              // textAlign: "center",
            }}
          >
            {t("noSearchResult")}
          </p>
        </div>
      );
    }

    return display;
  };

  const handleTriggerSelection = (triggerName) => {
    setSelectedTrigger(triggerName);
  };

  const handleToDoSelection = (selectedToDoType) => {
    setToDoType(selectedToDoType);
  };

  const MoveToOtherGroup = (
    targetGroupName,
    exceptionId,
    exceptionName,
    exceptionDesc,
    sourceGroupId
  ) => {
    let targetGroupId;
    toDoData.TodoGroupLists.map((group) => {
      if (group.GroupName == targetGroupName) {
        targetGroupId = group.GroupId;
      }
    });
    axios
      .post(SERVER_URL + ENDPOINT_MOVETO_OTHERGROUP, {
        processDefId: props.openProcessID,
        interfaceId: exceptionId,
        interfaceName: exceptionName,
        interfaceType: "T",
        sourceGroupId: sourceGroupId,
        targetGroupId: targetGroupId,
        processType: localLoadedProcessData?.ProcessType, // code edited on 19 Dec 2022 for BugId 120719
      })
      .then((res) => {
        //  Removing from SourceGroup
        if (res.data.Status == 0) {
          let tempData = { ...toDoData };
          let exceptionToDeleteIndex, parentIndex;
          tempData.TodoGroupLists.forEach((group, groupIndex) => {
            group.ToDoList.forEach((exception, exceptionIndex) => {
              if (+exception.ToDoId == +exceptionId) {
                exceptionToDeleteIndex = exceptionIndex;
                parentIndex = groupIndex;
              }
            });
          });

          const todoObj =
            tempData.TodoGroupLists[parentIndex].ToDoList[
              exceptionToDeleteIndex
            ];
          tempData.TodoGroupLists[parentIndex].ToDoList.splice(
            exceptionToDeleteIndex,
            1
          );
          // Adding to TargetGroup
          tempData.TodoGroupLists.map((group) => {
            if (group.GroupId == targetGroupId) {
              {
                /*code edited on 15 Feb 2023 for BugId 123802 */
              }
              /* group.ToDoList.push({
                Activities: [{}],
                Description: exceptionDesc,
                Type: "T",
                // TriggerName: selectedTrigger,
                ToDoId: exceptionId,
                ToDoName: exceptionName,
                PickListItems: [],
                AllTodoRights: {
                  Modify: false,
                  View: false,
                },
              });*/
              group.ToDoList.push({
                ...todoObj,
              });
            }
          });
          setToDoData(tempData);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const GetDocList = () => {
    const arrToDo = [];
    toDoData.TodoGroupLists &&
      toDoData.TodoGroupLists.map((group, groupIndex) => {
        arrToDo.push(
          <>
            <div className="groupNamesDiv" style={{ height: "40px" }}>
              <p className="groupNameExp">
                {/*code added on 2 August for BugId 110100*/}
                <span title={group.GroupName} className="groupNameSpan">
                  {group.GroupName}
                </span>
                <span className="groupChildListCount">{`(${group.ToDoList.length})`}</span>
              </p>

              {/*code edited on 19 Dec 2022 for BugId 120719*/}
              {localLoadedProcessData?.ProcessType !== "L" ? null : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    position: "relative",
                  }}
                >
                  <span
                    id={`pmweb_toDo_addIcon_${groupIndex}_${uuidv4()}`}
                    onClick={() => {
                      handleToDoOpen(group.GroupId);
                      setToDoNameToModify("");
                      setToDoDescToModify("");
                      setToDoIdToModify();
                      setToDoAssoFieldToModify("");
                      setToDoTypeToModify("");
                      setToDoMandatoryToModify();
                      setToDoToModifyTrigger("");
                      // code added on 9 Nov 2022 for BugId 118803
                      setToDoPicklistToModify([]);
                      // code edited on 29 June 2023 for BugId 130728
                      setToDoType("M");
                    }}
                    tabIndex={0}
                    onKeyUp={(e) => {
                      if (e.key === "Enter") {
                        handleToDoOpen(group.GroupId);
                        setToDoNameToModify("");
                        setToDoDescToModify("");
                        setToDoIdToModify();
                        setToDoAssoFieldToModify("");
                        setToDoTypeToModify("");
                        setToDoMandatoryToModify();
                        setToDoToModifyTrigger("");
                        setToDoPicklistToModify([]);
                        setToDoType("M");
                        e.stopPropagation();
                      }
                    }}
                    className="addException"
                    aria-description={`Add a todo in Group Name: ${group?.GroupName}`}
                  >
                    {"+" + t("todo") + "s"}
                  </span>
                  {/*code added on 4 August 2022 for BugId 113920 */}
                  {!isReadOnly && +group.GroupId !== 0 ? (
                    <DeleteModal
                      backDrop={false}
                      modalPaper="modalPaperActivity"
                      oneSortOption="oneSortOptionActivity"
                      docIndex={groupIndex}
                      hideRelative={true}
                      style={{
                        position: "absolute",
                        right: direction === RTL_DIRECTION ? "unset" : "-16px",
                        left: direction === RTL_DIRECTION ? "-16px" : "unset",
                        top: "-6px",
                      }}
                      buttonToOpenModal={
                        <IconButton
                          className="threeDotsButton"
                          disabled={isReadOnly}
                          aria-label={`Group: ${group?.GroupName} Menu Popper`}
                          disableFocusRipple
                          disableTouchRipple
                        >
                          <MoreVertIcon
                            style={{
                              color: "#606060",
                              height: "16px",
                              width: "16px",
                            }}
                          />
                        </IconButton>
                      }
                      modalWidth="180"
                      sortSectionOne={[
                        <p
                          id="pmweb_toDo_deleteGroup"
                          onClick={() =>
                            deleteGroup(group.GroupName, group.GroupId)
                          }
                          onKeyUp={(e) => {
                            if (e.key === "Enter") {
                              deleteGroup(group.GroupName, group.GroupId);
                              e.stopPropagation();
                            }
                          }}
                        >
                          {t("delete")}
                        </p>,
                      ]}
                    />
                  ) : null}
                </div>
              )}
            </div>
            <Modal
              // modified on 01/11/2023 for BugId 140494
              // open={addToDoModal === group.GroupId}
              open={addToDoModal !== null && +addToDoModal === +group.GroupId}
              // till here BugId 140494
              onClose={handleToDoClose}
              aria-label="simple-modal-title"
              aria-description="simple-modal-description"
            >
              <AddToDo
                toDoNameToModify={toDoNameToModify}
                toDoDescToModify={toDoDescToModify}
                toDoIdToModify={toDoIdToModify}
                toDoMandatoryToModify={toDoMandatoryToModify}
                toDoAssoFieldToModify={toDoAssoFieldToModify}
                toDoToModifyTrigger={toDoToModifyTrigger}
                toDoTypeToModify={toDoTypeToModify}
                toDoPicklistToModify={toDoPicklistToModify}
                addPickList={addPickList}
                groupId={group.GroupId}
                addToDoToList={addToDoToList}
                handleClose={handleToDoClose}
                bGroupExists={bToDoExists}
                triggerList={triggerData}
                selectedTriggerName={handleTriggerSelection}
                selectedToDoType={handleToDoSelection}
                selectedAssociateField={handleAssociateFieldSelection}
                handleMandatoryCheck={handleMandatoryCheck}
                todoName={todoName}
                setTodoName={setTodoName}
                showNameError={showNameError}
                setShowNameError={setShowNameError}
                showDescError={showDescError}
                setShowDescError={setShowDescError}
                showTriggerError={showTriggerError}
                setShowTriggerError={setShowTriggerError}
                modifyToDoFromList={modifyToDoFromList}
                setAddAnotherTodo={setAddAnotherTodo}
                addAnotherTodo={addAnotherTodo}
                disableAddBtn={disableAddBtn}
                setDisableAddBtn={setDisableAddBtn}
                pickList={pickList}
              />
            </Modal>
          </>
        );
        let gp_index = groupIndex;
        group.ToDoList &&
          group.ToDoList.map((todo, todoIndex) => {
            arrToDo.push(
              <div>
                <div
                  style={{
                    backgroundColor: "#EEF4FCC4",
                    borderBottom: "1px solid #DAD0C2",
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "10px",
                    paddingBottom: "6px",
                    paddingInlineEnd: "20px",
                    //height: "89px",
                  }}
                >
                  <div
                    style={{
                      textAlign: direction === RTL_DIRECTION ? "right" : "left",
                    }}
                    className="activityNameDiv"
                  >
                    <p className="docName">
                      <LightTooltip
                        id="pmweb_toDo_doc_Tooltip"
                        arrow={true}
                        enterDelay={500}
                        placement="bottom-start"
                        title={todo.ToDoName}
                      >
                        <span>{shortenRuleStatement(todo?.ToDoName, 12)}</span>
                      </LightTooltip>
                    </p>
                    <p className="docDescription">
                      <LightTooltip
                        id="pmweb_toDo_docdescription_Tooltip"
                        arrow={true}
                        enterDelay={500}
                        placement="bottom-start"
                        title={decode_utf8(todo?.Description)}
                      >
                        <span>
                          {shortenRuleStatement(
                            decode_utf8(todo?.Description),
                            15
                          )}
                        </span>
                      </LightTooltip>
                    </p>
                  </div>
                  {compact ? null : (
                    <div style={{ display: "flex", position: "relative" }}>
                      <CheckBoxes //setAll CheckBoxes
                        processType={localLoadedProcessData?.ProcessType} // code edited on 19 Dec 2022 for BugId 120719
                        groupIndex={gp_index}
                        title={`${todo?.Description}_${todoIndex}`}
                        docIdx={todoIndex}
                        toDoData={toDoData}
                        type={"set-all"}
                        activityIndex={todoIndex}
                        updateAllTodoRights={updateAllTodoRights}
                        GiveCompleteRights={GiveCompleteRights}
                        isReadOnly={isReadOnly}
                        ariaDescription={`ToDo Name: ${todo?.ToDoName} Group Name: ${group?.GroupName}`}
                      />
                      {/*code edited on 29 July 2022 for BugId 112411 and on 19 Dec 2022 for BugId 120719*/}
                      {localLoadedProcessData?.ProcessType === "L" &&
                      !isReadOnly ? (
                        <DeleteModal
                          disabled={isReadOnly}
                          backDrop={false}
                          modalPaper="modalPaperActivity"
                          oneSortOption="oneSortOptionActivity"
                          docIndex={todoIndex}
                          removePaddings={true} //code added to solve Bug 131869
                          closeOnClick={true} // code added on 2 Dec 2022 for BugId 109970
                          exceptionOpt={[t("delete"), t("modify")]}
                          hideRelative={true}
                          style={{
                            position: "absolute",
                            right:
                              direction === RTL_DIRECTION ? "unset" : "-15.5px",
                            left:
                              direction === RTL_DIRECTION ? "-15.5px" : "unset",
                            top: "-2px",
                          }}
                          buttonToOpenModal={
                            <IconButton
                              className="threeDotsButton"
                              disableFocusRipple
                              disableTouchRipple
                              aria-label={`ToDo: ${todo?.ToDoName} Group: ${group?.GroupName} Menu Popper`}
                            >
                              <MoreVertIcon
                                style={{
                                  color: "#606060",
                                  height: "16px",
                                  width: "16px",
                                }}
                              />
                            </IconButton>
                          }
                          modalWidth="180"
                          sortSectionOne={[
                            <span
                              id="pmweb_toDo_deleteTodoOption"
                              onClick={() =>
                                deleteToDo(todo.ToDoName, todo.ToDoId)
                              }
                              style={{ width: "100%" }} // Added on 10-10-23 for Bug 135392
                              tabIndex={0}
                              onKeyUp={(e) => {
                                if (e.key === "Enter") {
                                  deleteToDo(todo.ToDoName, todo.ToDoId);
                                  e.stopPropagation();
                                }
                              }}
                            >
                              {t("delete")}
                            </span>,
                            <span
                              id="pmweb_toDo_modifyTodoOption"
                              style={{ width: "100%" }} // Added on 10-10-23 for Bug 135392
                              onClick={() =>
                                editToDo(
                                  group.GroupId,
                                  todo.ToDoName,
                                  todo.Description,
                                  todo.ToDoId,
                                  todo.FieldName,
                                  todo.Type,
                                  todo.Mandatory,
                                  todo.TriggerName,
                                  todo
                                )
                              }
                              tabIndex={0}
                              onKeyUp={(e) => {
                                if (e.key === "Enter") {
                                  editToDo(
                                    group.GroupId,
                                    todo.ToDoName,
                                    todo.Description,
                                    todo.ToDoId,
                                    todo.FieldName,
                                    todo.Type,
                                    todo.Mandatory,
                                    todo.TriggerName,
                                    todo
                                  );
                                  e.stopPropagation();
                                }
                              }}
                            >
                              {t("modify")}
                            </span>,
                            <DeleteModal
                              style={{ width: "100%" }}
                              addNewGroupFunc={() => {
                                addGroupViaMoveTo(
                                  todo.ToDoId,
                                  todo.ToDoName,
                                  todo.Description,
                                  group.GroupId
                                );
                              }}
                              getActionName={(targetGroupName) =>
                                MoveToOtherGroup(
                                  targetGroupName,
                                  todo.ToDoId,
                                  todo.ToDoName,
                                  todo.Description,
                                  group.GroupId
                                )
                              }
                              // added on 08/10/23 for BugId 137229
                              isArabic={
                                direction === RTL_DIRECTION ? true : false
                              }
                              backDrop={false}
                              // modified on 08/10/23 for BugId 137229
                              // modalPaper="modalPaperActivity exceptionMoveTo"
                              modalPaper={`modalPaperActivity ${
                                direction === RTL_DIRECTION
                                  ? "exceptionMoveToAr"
                                  : "exceptionMoveTo"
                              }`}
                              sortByDiv="sortByDivMoveTo"
                              oneSortOption="oneSortOptionMoveTo"
                              docIndex={todoIndex}
                              tabIndex={0}
                              buttonToOpenModal={
                                <p
                                  id="pmweb_toDo_moveTodo_To_OtherGroup"
                                  style={{
                                    display: "flex",
                                    height: "2rem",
                                    alignItems: "center",
                                  }}
                                >
                                  {t("moveTo")}
                                  <button className="expandIcon" type="button">
                                    <ArrowForwardIosIcon
                                      style={{
                                        color: "#606060",
                                        height: "11px",
                                        width: "12px",
                                        margin: "0px 8px",
                                      }}
                                    />
                                  </button>
                                </p>
                              }
                              modalWidth="180"
                              sortSectionOne={[
                                ...ToDoGroup?.filter(
                                  (grp) => grp !== group.GroupName
                                ),
                                <p
                                  id="pmweb_toDo_addGroup"
                                  style={{
                                    color: "var(--link_color)",
                                    fontWeight: "600",
                                  }}
                                >
                                  {t("newGroup")}
                                </p>,
                              ]}
                            />,
                          ]}
                        />
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            );
          });
      });
    return arrToDo;
  };

  if (isLoading) {
    return <CircularProgress className="circular-progress" />;
  } else
    return (
      <>
        <CommonInterface
          newGroupToMove={newGroupToMove}
          onActivitySearchChange={onActivitySearchChange}
          onSearchChange={onSearchChange}
          screenHeading={t("navigationPanel.toDos")}
          bGroupExists={bGroupExists}
          setbGroupExists={setbGroupExists}
          addGroupToList={addGroupToList}
          addGroupModal={addGroupModal}
          handleOpen={handleOpen}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              handleOpen();
              e.stopPropagation();
            }
          }}
          handleClose={handleClose}
          compact={compact}
          GetActivities={GetActivities}
          GetList={GetDocList}
          screenType={SCREENTYPE_TODO} //code added on 8 June 2022 for BugId 110197
          todoAllRules={todoRules} //code added on 8 June 2022 for BugId 110197
          setTodoAllRules={setTodoRules}
          ruleDataType={ruleDataArray} //code added on 8 June 2022 for BugId 110197
          ruleType="T" //code added on 23 September 2022 for BugId 111853
          setSearchTerm={setToDoSearchTerm}
          setActivitySearchTerm={setActivitySearchTerm}
          clearSearchResult={clearSearchResult}
          clearActivitySearchResult={clearActivitySearchResult}
          openProcessType={localLoadedProcessData?.ProcessType} // code edited on 19 Dec 2022 for BugId 120719
          loadedMileStones={loadedMileStones}
          groupName={groupName}
          setGroupName={setGroupName}
          groupsList={toDoData.TodoGroupLists}
          isReadOnly={isReadOnly}
        />
        {showDependencyModal ? (
          <DefaultModal
            show={showDependencyModal}
            style={{
              width: "45vw",
              left: "28%",
              top: "21.5%",
              padding: "0",
            }}
            modalClosed={() => setShowDependencyModal(false)}
            children={
              <ObjectDependencies
                {...props}
                processAssociation={taskAssociation}
                cancelFunc={() => setShowDependencyModal(false)}
              />
            }
          />
        ) : null}
      </>
    );
}

const mapStateToProps = (state) => {
  return {
    openProcessID: state.openProcessClick.selectedId,
    openProcessName: state.openProcessClick.selectedProcessName,
    openProcessType: state.openProcessClick.selectedType,
    cellActivityType: state.selectedCellReducer.selectedActivityType,
    cellActivitySubType: state.selectedCellReducer.selectedActivitySubType,
  };
};

export default connect(mapStateToProps, null)(ToDo);
