// Made changes to solve bug ID 109967 and 109970
// 1. Exceptions are added without adding all the mandatory fields -ID 109967
// 2. Delete button pop up not disappearing after Exception is deleted - ID 109970
// 3. Changes made to solve Todo Screen distorts when the count increases  ID 112558
// #BugID - 109977
// #BugDescription - validation for exception duplicate name has been added.
// #BugID - 112559
// #BugDescription - With theme integration this issue has been resolved.
// #BugID - 119039
// #BugDescription - Switching tab data showing issue for Rules has been fixed.
// #Date - 15 November 2022
// #BugID - 117663
// #BugDescription - Triggers saving issue has been fixed.
// #Date - 15 November 2022
// #BugID - 120666
// #BugDescription - Exception rights for single activity for single exception all rights functionality added.
// #BugID - 121845,121884,122101
// #BugDescription - Handled the exception name,description length and added tooltip to show complete data
import React, { useEffect, useRef, useState } from "react";
import "../Interfaces.css";
import { useTranslation } from "react-i18next";
import CheckBoxes from "./CheckBoxes";
import Checkbox from "@material-ui/core/Checkbox";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import Modal from "@material-ui/core/Modal";
import { store, useGlobalState } from "state-pool";
import {
  SERVER_URL,
  ENDPOINT_ADD_EXCEPTION,
  ENDPOINT_ADD_GROUP,
  ENDPOINT_DELETE_EXCEPTION,
  ENDPOINT_DELETE_GROUP,
  ENDPOINT_MODIFY_EXCEPTION,
  ENDPOINT_MOVETO_OTHERGROUP,
  SCREENTYPE_EXCEPTION,
  RTL_DIRECTION,
  EXP_BATCH_COUNT,
} from "../../../../Constants/appConstants";
import axios from "axios";
import ActivityModal from "./ActivityModal.js";
import { connect } from "react-redux";
import DeleteModal from "../../../../UI/ActivityModal/Modal";
import ArrowForwardIosIcon from "@material-ui/icons/ArrowForwardIos";
import AddException from "./AddExceptions";
import CommonInterface from "../CommonInterface";
import { fullRightsOneActivity } from "../CommonInterfaceFuncs";
import Backdrop from "../../../../UI/Backdrop/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";
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
import { v4 as uuidv4 } from "uuid";
import manageRights from "../../../../assets/abstractView/manageRights.svg";
import { FocusTrap } from "@mui/base";
import { disableExpChecks } from "../../../../utility/Tools/DisableFunc";

function Exception(props) {
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData, setLocalLoadedProcessData] =
    useGlobalState(loadedProcessData);
  const [loadedMileStones, setLoadedMileStones] = useState(
    localLoadedProcessData?.MileStones
  );

  let { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const direction = `${t("HTML_DIR")}`;
  let [activitySearchTerm, setActivitySearchTerm] = useState("");
  const [addGroupModal, setAddGroupModal] = React.useState(false);
  const [addExceptionModal, setAddExceptionModal] = React.useState(null);
  const [compact, setCompact] = useState();
  const [bGroupExists, setbGroupExists] = useState(false);
  const [bExceptionExists, setbExceptionExists] = useState(false);
  const [openActivityModal, setOpenActivityModal] = useState(null);
  const [exceptionDesc, setExceptionDesc] = useState("");
  const [expNameToModify, setExpNameToModify] = useState();
  const [expDescToModify, setExpDescToModify] = useState();
  const [expIdToModify, setExpIdToModify] = useState();
  const [bExpExists, setbExpExists] = useState(false);
  const [newGroupToMove, setNewGroupToMove] = useState();
  const [expSearchTerm, setExpSearchTerm] = useState("");
  const [groupName, setGroupName] = useState(null);
  const [filteredExceptions, setFilteredExceptions] = useState({});
  const [fullRightCheckOneActivityArr, setFullRightCheckOneActivityArr] =
    useState([]);
  const [expData, setExpData] = useState({
    ExceptionGroups: [],
  });
  const [showDescError, setShowDescError] = useState(false);
  const [showNameError, setShowNameError] = useState(false);
  const [showGroupNameError, setShowGroupNameError] = useState(false);
  const [ruleDataArray, setRuleDataArray] = useState("");
  const [exceptionRules, setExceptionRules] = useState([]);
  const [subColumns, setSubColumns] = useState([]);
  const [splicedColumns, setSplicedColumns] = useState([]);
  const [expName, setExpName] = useState(null);
  const [addAnotherExp, setAddAnotherExp] = useState(false);
  const [showDependencyModal, setShowDependencyModal] = useState(false);
  const [taskAssociation, setTaskAssociation] = useState([]);
  const [noExpPresent, setNoExpPresent] = useState(false);
  const { isReadOnly } = props;
  const activityCheckRef = useRef([]);

  useEffect(() => {
    let arr = [];
    let activityIdString = "";
    loadedMileStones?.forEach((mileStone) => {
      mileStone.Activities?.forEach((activity) => {
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
          arr.push(activity);
          activityIdString = activityIdString + activity.ActivityId + ",";
        }
      });
    });
    if (activityIdString !== "" && activityIdString !== null) {
      MapAllActivities(activityIdString);
    }
    setSubColumns(arr);
    //code edited on 19 Sep 2022 for BugId 115547
    setSplicedColumns(arr.slice(0, EXP_BATCH_COUNT));
  }, [
    localLoadedProcessData,
    localLoadedProcessData?.ProcessDefId,
    loadedMileStones,
  ]);

  useEffect(() => {
    if (document.getElementById("oneBoxMatrix")) {
      document.getElementById("oneBoxMatrix").onscroll = function (event) {
        let scrollLeftVal =
          direction === RTL_DIRECTION ? 0 - +this.scrollLeft : this.scrollLeft;
        if (scrollLeftVal >= this.scrollWidth - this.clientWidth) {
          const timeout = setTimeout(() => {
            //code edited on 19 Sep 2022 for BugId 115547
            setSplicedColumns((prev) =>
              subColumns.slice(0, prev.length + EXP_BATCH_COUNT)
            );
          }, 500);
          return () => clearTimeout(timeout);
        }
      };
    }
  });

  useEffect(() => {
    setIsLoading(true);
  }, [localLoadedProcessData?.ProcessDefId]);

  const addGroupViaMoveTo = (
    ExceptionId,
    ExceptionName,
    Description,
    SourceGroupId
  ) => {
    setNewGroupToMove({
      exceptionId: ExceptionId,
      exceptionName: ExceptionName,
      expDesc: Description,
      sourceGroupId: SourceGroupId,
    });
    handleOpen();
  };

  let ExceptionGroup = [];
  expData.ExceptionGroups &&
    expData.ExceptionGroups.map((group) => {
      ExceptionGroup.push(group.GroupName);
    });

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

  const MapAllActivities = (activityIdString) => {
    // code edited on 7 Nov 2022 for BugId 116221
    if (localLoadedProcessData?.ProcessDefId) {
      axios
        .get(
          SERVER_URL +
            `/exception/${localLoadedProcessData.ProcessDefId}/${localLoadedProcessData.ProcessType}/${localLoadedProcessData.ProcessName}/${activityIdString}`
        )
        .then((res) => {
          if (res.status === 200) {
            setExceptionRules(res.data.Rules);
            let grpList = [...res.data.ExceptionGroups];
            let array = [];
            grpList?.forEach((grp) => {
              grp?.ExceptionList?.forEach((name) => {
                let obj = {
                  Name: name.ExceptionName,
                  NameId: name.ExceptionId,
                  Group: grp.GroupName,
                  GroupId: grp.GroupId,
                };
                array.push(obj);
              });
            });
            if (array.length === 0) {
              setNoExpPresent(true);
            } else {
              setNoExpPresent(false);
            }
            setRuleDataArray(array);

            let newState = { ...res.data };
            newState?.ExceptionGroups?.map((group) => {
              group?.ExceptionList?.map((exception) => {
                let tempIds = [];
                let tempData = [];
                exception.Activities?.map((activity) => {
                  if (tempIds.includes(activity.ActivityId)) {
                    tempData &&
                      tempData.forEach((data) => {
                        if (+data.ActivityId === +activity.ActivityId) {
                          data.View = data.View ? data.View : activity.View;
                          data.Raise = data.Raise ? data.Raise : activity.Raise;
                          data.Respond = data.Respond
                            ? data.Respond
                            : activity.Respond;
                          data.Clear = data.Clear ? data.Clear : activity.Clear;
                        }
                      });
                  } else {
                    tempData.push(activity);
                    tempIds.push(activity.ActivityId);
                  }
                });
                exception.Activities = [...tempData];
              });
            });
            // -----------------------
            let localActivityArr = [];
            let localActivityIdArr = [];
            newState?.ExceptionGroups.forEach((group) => {
              group.ExceptionList?.forEach((exception) => {
                exception.Activities = exception.Activities.sort((a, b) =>
                  +a.ActivityId > +b.ActivityId ? 1 : -1
                );
                exception.Activities?.forEach((activity, act_idx) => {
                  let actType = getActType(activity.ActivityId);
                  if (
                    +actType !== 2 &&
                    +actType !== 3 &&
                    +actType !== 1 &&
                    +actType !== 11
                  ) {
                    if (Object.values(activity).includes(false)) {
                      localActivityArr[act_idx] = false;
                    } else {
                      if (localActivityArr[act_idx] !== false) {
                        localActivityArr[act_idx] = true;
                      }
                    }
                  } else if (+actType === 1) {
                    if (!activity.View) {
                      localActivityArr[act_idx] = false;
                    } else if (!activity.Raise) {
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
            // ---------------------------------------
            setExpData(newState);
            setFilteredExceptions(res.data);
            setIsLoading(false);
          }
        })
        .catch(() => setIsLoading(false));
    }
  };

  const addExceptionToList = (
    ExceptionToAdd,
    button_type,
    groupId,
    ExceptionDesc
  ) => {
    let exist = false;
    expData.ExceptionGroups.map((group) => {
      group.ExceptionList.map((exception) => {
        if (
          exception.ExceptionName.trim().toLowerCase() ==
          ExceptionToAdd.trim().toLowerCase()
        ) {
          setbExpExists(true);
          exist = true;
        }
      });
    });
    if (exist) {
      return;
    }

    // Made changes to solve bug ID 109967
    if (ExceptionDesc.trim() == "") {
      setShowDescError(true);
      document.getElementById("ExceptionNameInput")?.focus();
    }
    if (ExceptionToAdd.trim() == "") {
      setShowNameError(true);
    }

    if (ExceptionToAdd.trim() != "" && ExceptionDesc.trim() != "") {
      let maxExceptionId = 0;
      expData.ExceptionGroups.map((group, groupIndex) => {
        group.ExceptionList.map((listElem) => {
          if (listElem.ExceptionId > +maxExceptionId) {
            maxExceptionId = listElem.ExceptionId;
          }
        });
      });
      axios
        .post(SERVER_URL + ENDPOINT_ADD_EXCEPTION, {
          groupId: groupId,
          expTypeId: +maxExceptionId + 1,
          expTypeName: ExceptionToAdd,
          expTypeDesc: encode_utf8(ExceptionDesc),
          processDefId: props.openProcessID,
        })
        .then((res) => {
          if (res?.data?.Status == 0) {
            let tempData = { ...expData };
            let groupName;
            tempData.ExceptionGroups.map((group) => {
              if (group.GroupId == groupId) {
                groupName = group.GroupName;
                group.ExceptionList.push({
                  ExceptionId: +maxExceptionId + 1,
                  ExceptionName: ExceptionToAdd,
                  Description: ExceptionDesc,
                  Activities: [],
                  SetAllChecks: {
                    Clear: false,
                    Raise: false,
                    Respond: false,
                    View: false,
                  },
                });
              }
            });
            setExpData(tempData);
            if (button_type != "addAnother") {
              handleExpClose();
              setAddAnotherExp(false);
            }
            if (button_type == "addAnother") {
              setAddAnotherExp(true);
            }

            //code added on 3 June 2022 for BugId 110101
            //Updating ruleDataArray
            let temp = [...ruleDataArray];
            temp.push({
              Name: ExceptionToAdd,
              NameId: +maxExceptionId + 1,
              Group: groupName,
              GroupId: groupId,
            });
            setRuleDataArray(temp);

            // Updating processData on adding Exception
            let newProcessData = JSON.parse(
              JSON.stringify(localLoadedProcessData)
            );
            newProcessData.ExceptionList.push({
              Description: ExceptionDesc,
              ExceptionId: +maxExceptionId + 1,
              ExceptionName: ExceptionToAdd,
            });
            setLocalLoadedProcessData(newProcessData);
          }
        });
    } else if (ExceptionToAdd.trim() == "") {
      setShowNameError(true);
      document.getElementById("ExceptionNameInput")?.focus();
    }
  };

  const addGroupToList = (GroupToAdd, button_type, newGroupToMoveExp) => {
    let exist = false;
    expData &&
      expData.ExceptionGroups.map((group, groupIndex) => {
        if (group.GroupName.toLowerCase() == GroupToAdd.toLowerCase()) {
          setbGroupExists(true);
          exist = true;
        }
      });
    if (exist) {
      return;
    }
    if (GroupToAdd.trim() !== "") {
      let maxGroupId = expData.ExceptionGroups.reduce(
        (acc, group) => (acc > group.GroupId ? acc : group.GroupId),
        0
      );
      axios
        .post(SERVER_URL + ENDPOINT_ADD_GROUP, {
          m_strGroupName: GroupToAdd,
          m_strGroupId: +maxGroupId + 1,
          interfaceType: "E",
          processDefId: props.openProcessID,
        })
        .then((res) => {
          if (res?.data?.Status == 0) {
            let tempData = { ...expData };
            tempData.ExceptionGroups.push({
              GroupName: GroupToAdd,
              AllGroupRights: {
                Respond: true,
                View: true,
                Raise: false,
                Clear: false,
              },
              GroupId: +maxGroupId + 1,
              ExceptionList: [],
            });
            setExpData(tempData);
            handleExpClose();
            if (newGroupToMoveExp) {
              MoveToOtherGroup(
                GroupToAdd,
                newGroupToMoveExp.exceptionId,
                newGroupToMoveExp.exceptionName,
                newGroupToMoveExp.expDesc,
                newGroupToMoveExp.sourceGroupId
              );
            }
          }
        });
      if (button_type != "addAnother") {
        handleClose();
      } else if (button_type == "addAnother") {
        setGroupName("");
        document.getElementById("groupNameInput_exception")?.focus();
      }
    } else {
      setShowGroupNameError(true);
      document.getElementById("groupNameInput_exception")?.focus();
    }
  };

  const deleteExpType = (expName, expId) => {
    axios
      .post(SERVER_URL + ENDPOINT_DELETE_EXCEPTION, {
        processDefId: props.openProcessID,
        expTypeName: expName,
        expTypeId: expId,
        expTypeDesc: exceptionDesc,
      })
      .then((res) => {
        if (res.data.Status == 0) {
          setTaskAssociation(res?.data?.Validations);
          if (res?.data?.Validations?.length > 0) {
            //setIsDeleteModalOpen(true);
            setShowDependencyModal(true);
          } else {
            let tempData = { ...expData };
            let exceptionToDeleteIndex, parentIndex;
            tempData.ExceptionGroups?.forEach((group, groupIndex) => {
              group.ExceptionList?.forEach((exception, exceptionIndex) => {
                if (exception.ExceptionId == expId) {
                  exceptionToDeleteIndex = exceptionIndex;
                  parentIndex = groupIndex;
                }
              });
            });
            tempData.ExceptionGroups[parentIndex].ExceptionList.splice(
              exceptionToDeleteIndex,
              1
            );
            setExpData(tempData);
            //code added on 3 June 2022 for BugId 110096
            //Updating RuleDataArray
            let tempRule = [...ruleDataArray];
            let idx = null;
            tempRule.forEach((exp, index) => {
              if (exp.NameId === expId) {
                idx = index;
              }
            });
            tempRule.splice(idx, 1);
            setRuleDataArray(tempRule);

            // Updating processData on deleting Exception
            let newProcessData = JSON.parse(
              JSON.stringify(localLoadedProcessData)
            );
            let indexValue;
            newProcessData.ExceptionList.forEach((exception, index) => {
              if (exception.ExceptionId == expId) {
                indexValue = index;
              }
            });
            newProcessData.ExceptionList.splice(indexValue, 1);
            setLocalLoadedProcessData(newProcessData);
          }
        }
      });
  };

  const deleteGroup = (groupName, groupId) => {
    // Changes made to solve Bug 131836
    let allExpsIds = [];
    let allExpsNames = [];
    expData?.ExceptionGroups?.map((el) => {
      if (el.GroupId == groupId) {
        el?.ExceptionList?.map((ep) => {
          allExpsIds.push(ep.ExceptionId);
          allExpsNames.push(ep.ExceptionName);
        });
      }
    });
    axios
      .post(SERVER_URL + ENDPOINT_DELETE_GROUP, {
        processDefId: props.openProcessID,
        m_strGroupName: groupName,
        m_strGroupId: groupId,
        interfaceType: "E",
        interfaceElementId: allExpsIds.join(),
        interfaceElementName: allExpsNames.join(),
      })
      .then((res) => {
        if (res.data.Status == 0) {
          setTaskAssociation(res?.data?.Validations);
          if (res?.data?.Validations?.length > 0) {
            //setIsDeleteModalOpen(true);
            setShowDependencyModal(true);
          } else {
            let groupIndexToDelete;
            let tempData = { ...expData };
            tempData.ExceptionGroups.map((group, groupIndex) => {
              if (group.GroupId == groupId) {
                groupIndexToDelete = groupIndex;
              }
            });
            tempData.ExceptionGroups.splice(groupIndexToDelete, 1);
            setExpData(tempData);
            handleClose();
          }
        }
      });
  };

  const editDescription = (groupId, expName, expDesc, expId) => {
    setExpNameToModify(expName);
    setExpDescToModify(expDesc);
    setExpIdToModify(expId);
    handleExpOpen(groupId);
  };

  const modifyDescription = (expName, groupId, expDesc, expId) => {
    axios
      .post(SERVER_URL + ENDPOINT_MODIFY_EXCEPTION, {
        expTypeId: expId,
        expTypeName: expName,
        expTypeDesc: encode_utf8(expDesc),
        processDefId: props.openProcessID,
      })
      .then((res) => {
        let tempData = { ...expData };
        tempData.ExceptionGroups.map((group) => {
          if (group.GroupId === groupId) {
            group.ExceptionList.map((exp) => {
              if (exp.ExceptionId === expId) {
                exp.Description = expDesc;
              }
            });
          }
        });
        setExpData(tempData);
        handleExpClose();
      });
  };

  const MoveToOtherGroup = (
    targetGroupName,
    exceptionId,
    exceptionName,
    exceptionDesc,
    sourceGroupId
  ) => {
    let targetGroupId;
    expData.ExceptionGroups.map((group) => {
      if (group.GroupName == targetGroupName) {
        targetGroupId = group.GroupId;
      }
    });
    axios
      .post(SERVER_URL + ENDPOINT_MOVETO_OTHERGROUP, {
        processDefId: props.openProcessID,
        interfaceId: exceptionId,
        interfaceName: exceptionName,
        interfaceType: "E",
        sourceGroupId: sourceGroupId,
        targetGroupId: targetGroupId,
        processType: localLoadedProcessData?.ProcessType,
      })
      .then((res) => {
        //  Removing from SourceGroup
        if (res.data.Status == 0) {
          let tempData = { ...expData };
          let exceptionToDeleteIndex, parentIndex;
          tempData.ExceptionGroups.forEach((group, groupIndex) => {
            group.ExceptionList.forEach((exception, exceptionIndex) => {
              if (+exception.ExceptionId == +exceptionId) {
                exceptionToDeleteIndex = exceptionIndex;
                parentIndex = groupIndex;
              }
            });
          });

          const expObj =
            tempData.ExceptionGroups[parentIndex].ExceptionList[
              exceptionToDeleteIndex
            ];
          tempData.ExceptionGroups[parentIndex].ExceptionList.splice(
            exceptionToDeleteIndex,
            1
          );

          // Adding to TargetGroup
          tempData.ExceptionGroups.map((group) => {
            {
              /*code edited on 15 Feb 2023 for BugId 123804 */
            }
            if (group.GroupId == targetGroupId) {
              /* group.ExceptionList.push({
                ExceptionId: exceptionId,
                ExceptionName: exceptionName,
                Description: exceptionDesc,
                Activities: [],
                SetAllChecks: {
                  Clear: false,
                  Raise: false,
                  Respond: false,
                  View: false,
                },
              });*/
              group.ExceptionList.push({
                ...expObj,
              });
            }
          });
          setExpData(tempData);
        }
      });
  };

  const handleOpen = () => {
    setAddGroupModal(true);
  };

  const handleClose = () => {
    setAddGroupModal(false);
    setbGroupExists(false);
    setbExpExists(false);
  };

  const handleExpOpen = (groupId) => {
    setAddExceptionModal(groupId);
  };

  const handleExpClose = () => {
    setAddExceptionModal(null);
    setbExceptionExists(false);
  };

  const handleActivityModalOpen = (activity_id) => {
    setOpenActivityModal(activity_id);
  };

  const handleActivityModalClose = () => {
    setOpenActivityModal(null);
  };

  const clearSearchResult = () => {
    setExpData(filteredExceptions);
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
      expData.ExceptionGroups &&
        expData.ExceptionGroups.forEach((group, index) => {
          let temp = group.ExceptionList.filter((exp) => {
            if (exp.ExceptionName.toLowerCase().includes(value.toLowerCase())) {
              return exp;
            }
          });
          if (temp.length > 0) {
            tempState.push({ ...group, ExceptionList: temp });
          }
        });
      setExpData((prevState) => {
        return { ...prevState, ExceptionGroups: tempState };
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
    check_type,
    exp_idx,
    activity_id,
    groupIndex,
    checkTypeValue,
    checks
  ) => {
    // CASE:1 - Single checkBox of any Activity in Any Exception
    let localCheckArray;
    localCheckArray = {
      View:
        (check_type == "Respond" && !checkTypeValue) ||
        (check_type == "Raise" && !checkTypeValue) ||
        (check_type == "Clear" && !checkTypeValue)
          ? "Y"
          : checks.View
          ? "Y"
          : "N",
      Respond:
        check_type == "View" && checkTypeValue
          ? "N"
          : checks.Respond
          ? "Y"
          : "N",
      Raise:
        check_type == "View" && checkTypeValue ? "N" : checks.Raise ? "Y" : "N",
      Clear:
        check_type == "View" && checkTypeValue ? "N" : checks.Clear ? "Y" : "N",
    };
    let postBody = !checkTypeValue
      ? {
          processDefId: props.openProcessID,
          check: true,
          pMExpTypeInfos: [
            {
              expTypeName:
                expData.ExceptionGroups[groupIndex].ExceptionList[exp_idx]
                  .ExceptionName,
              expTypeId:
                expData.ExceptionGroups[groupIndex].ExceptionList[exp_idx]
                  .ExceptionId,
              pMActRightsInfoList: [
                {
                  actId: activity_id,
                  vTrigFlag: check_type == "View" ? "Y" : localCheckArray.View,
                  vrTrigFlag:
                    check_type == "Raise" ? "Y" : localCheckArray.Raise,
                  vaTrigFlag:
                    check_type == "Respond" ? "Y" : localCheckArray.Respond,
                  vcTrigFlag:
                    check_type == "Clear" ? "Y" : localCheckArray.Clear,
                },
              ],
            },
          ],
        }
      : {
          processDefId: props.openProcessID,
          check: false,
          pMExpTypeInfos: [
            {
              expTypeName:
                expData.ExceptionGroups[groupIndex].ExceptionList[exp_idx]
                  .ExceptionName,
              expTypeId:
                expData.ExceptionGroups[groupIndex].ExceptionList[exp_idx]
                  .ExceptionId,
              pMActRightsInfoList: [
                {
                  actId: activity_id,
                  vTrigFlag: check_type == "View" ? "N" : localCheckArray.View,
                  vrTrigFlag:
                    check_type == "Raise" ? "N" : localCheckArray.Raise,
                  vaTrigFlag:
                    check_type == "Respond" ? "N" : localCheckArray.Respond,
                  vcTrigFlag:
                    check_type == "Clear" ? "N" : localCheckArray.Clear,
                },
              ],
              // code edited on 26 April 2023 as rights were not getting saved in this case, while unchecking the checkboxes
              vTrigFlag: localCheckArray.View,
              vrTrigFlag: localCheckArray.Raise,
              vaTrigFlag: localCheckArray.Respond,
              vcTrigFlag: localCheckArray.Clear,
              // vTrigFlag: check_type == "View" ? "Y" : "N",
              // vrTrigFlag:
              //   check_type == "View" && checkTypeValue && checks.Raise
              //     ? "Y"
              //     : check_type == "Raise"
              //     ? "Y"
              //     : "N",
              // vaTrigFlag:
              //   check_type == "View" && checkTypeValue && checks.Respond
              //     ? "Y"
              //     : check_type == "Respond"
              //     ? "Y"
              //     : "N",
              // vcTrigFlag:
              //   check_type == "View" && checkTypeValue && checks.Clear
              //     ? "Y"
              //     : check_type == "Clear"
              //     ? "Y"
              //     : "N",
            },
          ],
        };
    axios.post(SERVER_URL + `/saveExceptionRight`, postBody).then((res) => {
      if (res.status === 200) {
      }
    });

    let newState = { ...expData };

    // single-check
    newState.ExceptionGroups[groupIndex].ExceptionList[exp_idx].Activities.map(
      (activity) => {
        if (+activity.ActivityId === +activity_id) {
          activity[check_type] = !activity[check_type];
          if (
            (check_type === "Respond" && !checkTypeValue) ||
            (check_type === "Raise" && !checkTypeValue) ||
            (check_type === "Clear" && !checkTypeValue)
          ) {
            activity["View"] = true;
          }
          if (check_type === "View" && checkTypeValue) {
            activity["Raise"] = false;
            activity["Respond"] = false;
            activity["Clear"] = false;
          }
        }
      }
    );

    // set-all check
    let setAllCheck = {
      View: true,
      Raise: true,
      Respond: true,
      Clear: true,
    };
    newState.ExceptionGroups[groupIndex].ExceptionList[
      exp_idx
    ].Activities.forEach((activity) => {
      let actType = getActType(activity.ActivityId);
      if (
        +actType !== 2 &&
        +actType !== 3 &&
        +actType !== 11 &&
        +actType !== 1
      ) {
        if (!activity.View) {
          setAllCheck["View"] = false;
        }
        if (!activity.Raise) {
          setAllCheck["Raise"] = false;
        }
        if (!activity.Respond) {
          setAllCheck["Respond"] = false;
        }
        if (!activity.Clear) {
          setAllCheck["Clear"] = false;
        }
      } else if (+actType === 1) {
        if (!activity.View) {
          setAllCheck["View"] = false;
        }
        if (!activity.Raise) {
          setAllCheck["Raise"] = false;
        }
      } else if (+actType === 2 || +actType === 3 || +actType === 11) {
        if (!activity.View) {
          setAllCheck["View"] = false;
        }
      }
    });
    newState.ExceptionGroups[groupIndex].ExceptionList[exp_idx].SetAllChecks =
      setAllCheck;

    //OneActivityColumn All checks
    let localActivityArr = [];
    let localActivityIdArr = [];
    newState?.ExceptionGroups.forEach((group) => {
      group.ExceptionList?.forEach((exception) => {
        exception.Activities = exception.Activities.sort((a, b) =>
          +a.ActivityId > +b.ActivityId ? 1 : -1
        );
        exception.Activities?.forEach((activity, act_idx) => {
          let actType = getActType(activity.ActivityId);
          if (
            +actType !== 2 &&
            +actType !== 3 &&
            +actType !== 1 &&
            +actType !== 11
          ) {
            if (Object.values(activity).includes(false)) {
              localActivityArr[act_idx] = false;
            } else {
              if (localActivityArr[act_idx] !== false) {
                localActivityArr[act_idx] = true;
              }
            }
          } else if (+actType === 1) {
            if (!activity.View) {
              localActivityArr[act_idx] = false;
            } else if (!activity.Raise) {
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
    setExpData(newState);
  };

  const updateActivitySetAllChecks = (
    check_type,
    activity_id,
    checkTypeValue,
    checks,
    setChecks
  ) => {
    // CASE:5 - Giving a particular right (eg:Raise) for one Activity, in all Exception
    let localCheckArray;
    localCheckArray = {
      View:
        (check_type == "Respond" && checkTypeValue) ||
        (check_type == "Raise" && checkTypeValue) ||
        (check_type == "Clear" && checkTypeValue)
          ? "Y"
          : checks.View
          ? "Y"
          : "N",
      Respond:
        check_type == "View" && !checkTypeValue
          ? "N"
          : checks.Respond
          ? "Y"
          : "N",
      Raise:
        check_type == "View" && !checkTypeValue
          ? "N"
          : checks.Raise
          ? "Y"
          : "N",
      Clear:
        check_type == "View" && !checkTypeValue
          ? "N"
          : checks.Clear
          ? "Y"
          : "N",
    };

    let tempInfoListTrue = [];
    expData.ExceptionGroups.forEach((group) => {
      group.ExceptionList.forEach((exp) => {
        tempInfoListTrue.push({
          expTypeName: exp.ExceptionName,
          expTypeId: exp.ExceptionId,
          pMActRightsInfoList: [
            {
              actId: activity_id,
              vTrigFlag: check_type == "View" ? "Y" : localCheckArray.View,
              vrTrigFlag: check_type == "Raise" ? "Y" : localCheckArray.Raise,
              vaTrigFlag:
                check_type == "Respond" ? "Y" : localCheckArray.Respond,
              vcTrigFlag: check_type == "Clear" ? "Y" : localCheckArray.Clear,
            },
          ],
        });
      });
    });
    let tempInfoListFalse = [];
    expData.ExceptionGroups.forEach((group) => {
      group.ExceptionList.forEach((exp) => {
        tempInfoListFalse.push({
          expTypeName: exp.ExceptionName,
          expTypeId: exp.ExceptionId,
          pMActRightsInfoList: [
            {
              actId: activity_id,
              vTrigFlag: check_type == "View" ? "N" : localCheckArray.View,
              vrTrigFlag: check_type == "Raise" ? "N" : localCheckArray.Raise,
              vaTrigFlag:
                check_type == "Respond" ? "N" : localCheckArray.Respond,
              vcTrigFlag: check_type == "Clear" ? "N" : localCheckArray.Clear,
            },
          ],
          vTrigFlag: "Y",
          vrTrigFlag: check_type == "Raise" ? "Y" : "N",
          vaTrigFlag: check_type == "Respond" ? "Y" : "N",
          vcTrigFlag: check_type == "Clear" ? "Y" : "N",
        });
      });
    });
    let postBody = checkTypeValue
      ? {
          processDefId: props.openProcessID,
          check: true,
          pMExpTypeInfos: tempInfoListTrue,
        }
      : {
          processDefId: props.openProcessID,
          check: false,
          pMExpTypeInfos: tempInfoListFalse,
        };
    axios.post(SERVER_URL + `/saveExceptionRight`, postBody).then((res) => {
      if (res.status === 200) {
      }
    });

    let newState = { ...expData };
    if (
      (check_type === "Raise" && checkTypeValue) ||
      (check_type === "Respond" && checkTypeValue) ||
      (check_type === "Clear" && checkTypeValue)
    ) {
      setChecks((prev) => {
        return {
          ...prev,
          View: true,
        };
      });
    }

    if (check_type === "View" && !checkTypeValue) {
      setChecks((prev) => {
        return {
          ...prev,
          Raise: false,
          Respond: false,
          Clear: false,
        };
      });
    }

    newState.ExceptionGroups = newState.ExceptionGroups.map((group) => {
      group.ExceptionList = group.ExceptionList.map((exp) => {
        let setAllCheck = {
          View: true,
          Raise: true,
          Respond: true,
          Clear: true,
        };
        exp.Activities = exp.Activities.map((activity) => {
          let actType = getActType(activity.ActivityId);
          if (+activity.ActivityId === +activity_id) {
            activity[check_type] = checkTypeValue;
            if (
              (check_type == "Raise" && checkTypeValue) ||
              (check_type == "Respond" && checkTypeValue) ||
              (check_type == "Clear" && checkTypeValue)
            ) {
              activity["View"] = true;
            }
            if (check_type === "View" && !checkTypeValue) {
              activity["Raise"] = false;
              activity["Respond"] = false;
              activity["Clear"] = false;
            }
          }
          if (
            +actType !== 2 &&
            +actType !== 3 &&
            +actType !== 11 &&
            +actType !== 1
          ) {
            if (!activity.View) {
              setAllCheck["View"] = false;
            }
            if (!activity.Raise) {
              setAllCheck["Raise"] = false;
            }
            if (!activity.Respond) {
              setAllCheck["Respond"] = false;
            }
            if (!activity.Clear) {
              setAllCheck["Clear"] = false;
            }
          } else if (+actType === 1) {
            if (!activity.View) {
              setAllCheck["View"] = false;
            }
            if (!activity.Raise) {
              setAllCheck["Raise"] = false;
            }
          } else if (+actType === 2 || +actType === 3 || +actType === 11) {
            if (!activity.View) {
              setAllCheck["View"] = false;
            }
          }
          return activity;
        });
        exp.SetAllChecks = setAllCheck;
        return exp;
      });
      return group;
    });

    // OneActivityColumn All checks
    let bFlag = true;
    // modified on 16/10/23 for BugId 139505
    newState.ExceptionGroups.forEach((group) => {
      group.ExceptionList.forEach((exception) => {
        exception.Activities.forEach((activity) => {
          let actType = getActType(activity.ActivityId);
          if (+activity.ActivityId === +activity_id) {
            if (
              +actType !== 2 &&
              +actType !== 3 &&
              +actType !== 11 &&
              +actType !== 1
            ) {
              if (activity["View"] === false && bFlag) {
                bFlag = false;
              }
              if (activity["Respond"] === false && bFlag) {
                bFlag = false;
              }
              if (activity["Raise"] === false && bFlag) {
                bFlag = false;
              }
              if (activity["Clear"] === false && bFlag) {
                bFlag = false;
              }
            } else if (+actType === 1) {
              if (activity["View"] === false && bFlag) {
                bFlag = false;
              }
              if (activity["Raise"] === false && bFlag) {
                bFlag = false;
              }
            } else if (+actType === 2 || +actType === 3 || +actType === 11) {
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
    setExpData(newState);
  };

  const updateSetAllChecks = (check_val, check_type, exp_idx, groupIndex) => {
    // CASE:3 - Giving a particular right (eg: Raise) for a Single Exception, for all Activities
    let localCheckArray;
    localCheckArray = {
      View:
        (check_type == "Respond" && !check_val) ||
        (check_type == "Raise" && !check_val) ||
        (check_type == "Clear" && !check_val)
          ? "Y"
          : expData.ExceptionGroups[groupIndex].ExceptionList[exp_idx]
              .SetAllChecks["View"]
          ? "Y"
          : "N",
      Respond:
        check_type == "View" && check_val
          ? "N"
          : expData.ExceptionGroups[groupIndex].ExceptionList[exp_idx]
              .SetAllChecks["Respond"]
          ? "Y"
          : "N",
      Raise:
        check_type == "View" && check_val
          ? "N"
          : expData.ExceptionGroups[groupIndex].ExceptionList[exp_idx]
              .SetAllChecks["Raise"]
          ? "Y"
          : "N",
      Clear:
        check_type == "View" && check_val
          ? "N"
          : expData.ExceptionGroups[groupIndex].ExceptionList[exp_idx]
              .SetAllChecks["Clear"]
          ? "Y"
          : "N",
    };

    let postBody = !check_val
      ? {
          processDefId: props.openProcessID,
          check: true,
          pMExpTypeInfos: [
            {
              expTypeName:
                expData.ExceptionGroups[groupIndex].ExceptionList[exp_idx]
                  .ExceptionName,
              expTypeId:
                expData.ExceptionGroups[groupIndex].ExceptionList[exp_idx]
                  .ExceptionId,
              pMActRightsInfoList: [
                {
                  actId: 0,
                  vTrigFlag: check_type == "View" ? "Y" : localCheckArray.View,
                  vrTrigFlag:
                    check_type == "Raise" ? "Y" : localCheckArray.Raise,
                  vaTrigFlag:
                    check_type == "Respond" ? "Y" : localCheckArray.Respond,
                  vcTrigFlag:
                    check_type == "Clear" ? "Y" : localCheckArray.Clear,
                },
              ],
            },
          ],
        }
      : {
          processDefId: props.openProcessID,
          check: false,
          pMExpTypeInfos: [
            {
              expTypeName:
                expData.ExceptionGroups[groupIndex].ExceptionList[exp_idx]
                  .ExceptionName,
              expTypeId:
                expData.ExceptionGroups[groupIndex].ExceptionList[exp_idx]
                  .ExceptionId,
              pMActRightsInfoList: [
                {
                  actId: 0,
                  vTrigFlag: check_type == "View" ? "N" : localCheckArray.View,
                  vrTrigFlag:
                    check_type == "Raise" ? "N" : localCheckArray.Raise,
                  vaTrigFlag:
                    check_type == "Respond" ? "N" : localCheckArray.Respond,
                  vcTrigFlag:
                    check_type == "Clear" ? "N" : localCheckArray.Clear,
                },
              ],
              vTrigFlag: expData.ExceptionGroups[groupIndex].ExceptionList[
                exp_idx
              ].SetAllChecks["View"]
                ? "Y"
                : "N",
              vrTrigFlag: expData.ExceptionGroups[groupIndex].ExceptionList[
                exp_idx
              ].SetAllChecks["Raise"]
                ? "Y"
                : "N",
              vaTrigFlag: expData.ExceptionGroups[groupIndex].ExceptionList[
                exp_idx
              ].SetAllChecks["Respond"]
                ? "Y"
                : "N",
              vcTrigFlag: expData.ExceptionGroups[groupIndex].ExceptionList[
                exp_idx
              ].SetAllChecks["Clear"]
                ? "Y"
                : "N",
            },
          ],
        };
    axios.post(SERVER_URL + `/saveExceptionRight`, postBody).then((res) => {
      if (res.status === 200) {
      }
    });
    let newState = { ...expData };
    //set-all
    newState.ExceptionGroups[groupIndex].ExceptionList[exp_idx].SetAllChecks[
      check_type
    ] = !check_val;
    if (
      (check_type == "Raise" && !check_val) ||
      (check_type == "Respond" && !check_val) ||
      (check_type == "Clear" && !check_val)
    ) {
      expData.ExceptionGroups[groupIndex].ExceptionList[exp_idx].SetAllChecks[
        "View"
      ] = true;
    }

    if (check_type == "View" && check_val) {
      expData.ExceptionGroups[groupIndex].ExceptionList[exp_idx].SetAllChecks[
        "Raise"
      ] = false;
      expData.ExceptionGroups[groupIndex].ExceptionList[exp_idx].SetAllChecks[
        "Respond"
      ] = false;
      expData.ExceptionGroups[groupIndex].ExceptionList[exp_idx].SetAllChecks[
        "Clear"
      ] = false;
    }

    //activities
    newState.ExceptionGroups[groupIndex].ExceptionList[exp_idx].Activities.map(
      (activity) => {
        activity[check_type] = !check_val;
        if (
          (check_type == "Raise" && !check_val) ||
          (check_type == "Respond" && !check_val) ||
          (check_type == "Clear" && !check_val)
        ) {
          activity["View"] = true;
        }
        if (check_type == "View" && check_val) {
          activity["Raise"] = false;
          activity["Respond"] = false;
          activity["Clear"] = false;
        }
      }
    );

    // code edited on 18 Dec 2022 for BugId 120130
    // Column Top full Column handle checkBox
    let localActivityArr = [];
    let localActivityIdArr = [];
    newState?.ExceptionGroups.forEach((group) => {
      group.ExceptionList?.forEach((exception) => {
        exception.Activities = exception.Activities.sort((a, b) =>
          +a.ActivityId > +b.ActivityId ? 1 : -1
        );
        exception.Activities?.forEach((activity, act_idx) => {
          let actType = getActType(activity.ActivityId);
          if (
            +actType !== 2 &&
            +actType !== 3 &&
            +actType !== 1 &&
            +actType !== 11
          ) {
            if (Object.values(activity).includes(false)) {
              localActivityArr[act_idx] = false;
            } else {
              if (localActivityArr[act_idx] !== false) {
                localActivityArr[act_idx] = true;
              }
            }
          } else if (+actType === 1) {
            if (!activity.View) {
              localActivityArr[act_idx] = false;
            } else if (!activity.Raise) {
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
          // till here BugId 139505
          localActivityIdArr[act_idx] = activity.ActivityId;
        });
      });
    });
    let tempObj = [...fullRightCheckOneActivityArr];
    localActivityArr?.forEach((activity, activityIndex) => {
      if (activity === false) {
        tempObj[localActivityIdArr[activityIndex]] = false;
      } else {
        tempObj[localActivityIdArr[activityIndex]] = true;
      }
    });
    setFullRightCheckOneActivityArr(tempObj);
    setExpData(newState);
  };

  const GiveCompleteRights = (exp_idx, groupIndex, allRights) => {
    // CASE:2 - Giving all rights to one Exception for all Activities
    let postBody = allRights
      ? {
          processDefId: props.openProcessID,
          check: true,
          pMExpTypeInfos: [
            {
              expTypeName:
                expData.ExceptionGroups[groupIndex].ExceptionList[exp_idx]
                  .ExceptionName,
              expTypeId:
                expData.ExceptionGroups[groupIndex].ExceptionList[exp_idx]
                  .ExceptionId,
              pMActRightsInfoList: [
                {
                  actId: 0,
                  vTrigFlag: "Y",
                  vrTrigFlag: "Y",
                  vaTrigFlag: "Y",
                  vcTrigFlag: "Y",
                },
              ],
            },
          ],
        }
      : {
          processDefId: props.openProcessID,
          check: false,
          pMExpTypeInfos: [
            {
              expTypeName:
                expData.ExceptionGroups[groupIndex].ExceptionList[exp_idx]
                  .ExceptionName,
              expTypeId:
                expData.ExceptionGroups[groupIndex].ExceptionList[exp_idx]
                  .ExceptionId,
              pMActRightsInfoList: [
                {
                  actId: 0,
                  vTrigFlag: "N",
                  vrTrigFlag: "N",
                  vaTrigFlag: "N",
                  vcTrigFlag: "N",
                },
              ],
            },
          ],
        };
    axios.post(SERVER_URL + `/saveExceptionRight`, postBody).then((res) => {
      if (res.status === 200) {
      }
    });

    let newState = { ...expData };
    let setObj =
      newState.ExceptionGroups[groupIndex].ExceptionList[exp_idx].SetAllChecks;
    for (let property in setObj) {
      setObj[property] = allRights;
    }
    newState.ExceptionGroups[groupIndex].ExceptionList[exp_idx].SetAllChecks =
      setObj;

    newState.ExceptionGroups[groupIndex].ExceptionList[exp_idx].Activities.map(
      (activity) => {
        activity["View"] = allRights;
        activity["Raise"] = allRights;
        activity["Respond"] = allRights;
        activity["Clear"] = allRights;
      }
    );

    // code edited on 18 Dec 2022 for BugId 120130
    // Column Top full Column handle checkBox
    let localActivityArr = [];
    let localActivityIdArr = [];
    newState?.ExceptionGroups.forEach((group) => {
      group.ExceptionList?.forEach((exception) => {
        exception.Activities = exception.Activities.sort((a, b) =>
          +a.ActivityId > +b.ActivityId ? 1 : -1
        );
        exception.Activities?.forEach((activity, act_idx) => {
          let actType = getActType(activity.ActivityId);
          if (
            +actType !== 2 &&
            +actType !== 3 &&
            +actType !== 1 &&
            +actType !== 11
          ) {
            if (Object.values(activity).includes(false)) {
              localActivityArr[act_idx] = false;
            } else {
              if (localActivityArr[act_idx] !== false) {
                localActivityArr[act_idx] = true;
              }
            }
          } else if (+actType === 1) {
            if (!activity.View) {
              localActivityArr[act_idx] = false;
            } else if (!activity.Raise) {
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
          // till here BugId 139505
          localActivityIdArr[act_idx] = activity.ActivityId;
        });
      });
    });
    let fullRightAr = [...fullRightCheckOneActivityArr];
    localActivityArr?.forEach((activity, activityIndex) => {
      if (activity === false) {
        fullRightAr[localActivityIdArr[activityIndex]] = false;
      } else {
        fullRightAr[localActivityIdArr[activityIndex]] = true;
      }
    });
    setFullRightCheckOneActivityArr(fullRightAr);

    setExpData(newState);
  };

  const GiveCompleteRightsToOneActivity = (activityId) => {
    // CASE:4 - Giving full Rights to one Activity in all Exceptions
    let postBody = !fullRightCheckOneActivityArr[activityId]
      ? {
          processDefId: props.openProcessID,
          check: true,
          pMExpTypeInfos: [
            {
              expTypeName: "",
              expTypeId: "0",
              pMActRightsInfoList: [
                {
                  actId: activityId,
                  vTrigFlag: "Y",
                  vrTrigFlag: "Y",
                  vaTrigFlag: "Y",
                  vcTrigFlag: "Y",
                },
              ],
            },
          ],
        }
      : {
          processDefId: props.openProcessID,
          check: false,
          pMExpTypeInfos: [
            {
              expTypeName: "",
              expTypeId: "0",
              pMActRightsInfoList: [
                {
                  actId: activityId,
                  vTrigFlag: "N",
                  vrTrigFlag: "N",
                  vaTrigFlag: "N",
                  vcTrigFlag: "N",
                },
              ],
            },
          ],
        };
    axios.post(SERVER_URL + `/saveExceptionRight`, postBody).then((res) => {
      if (res.status === 200) {
      }
    });

    let fullRightCheck = !fullRightCheckOneActivityArr[activityId];
    let arr = [...fullRightCheckOneActivityArr];
    arr[activityId] = fullRightCheck;

    let newState = { ...expData };
    newState.ExceptionGroups = newState.ExceptionGroups.map((group) => {
      group.ExceptionList = group.ExceptionList.map((exp) => {
        let setAllCheck = {
          View: true,
          Raise: true,
          Respond: true,
          Clear: true,
        };
        exp.Activities = exp.Activities.map((activity) => {
          let actType = getActType(activity.ActivityId);
          if (+activity.ActivityId === +activityId) {
            activity["View"] = fullRightCheck;
            activity["Raise"] = fullRightCheck;
            activity["Respond"] = fullRightCheck;
            activity["Clear"] = fullRightCheck;
          }
          if (
            +actType !== 2 &&
            +actType !== 3 &&
            +actType !== 11 &&
            +actType !== 1
          ) {
            if (!activity.View) {
              setAllCheck["View"] = false;
            }
            if (!activity.Raise) {
              setAllCheck["Raise"] = false;
            }
            if (!activity.Respond) {
              setAllCheck["Respond"] = false;
            }
            if (!activity.Clear) {
              setAllCheck["Clear"] = false;
            }
          } else if (+actType === 1) {
            if (!activity.View) {
              setAllCheck["View"] = false;
            }
            if (!activity.Raise) {
              setAllCheck["Raise"] = false;
            }
          } else if (+actType === 2 || +actType === 3 || +actType === 11) {
            if (!activity.View) {
              setAllCheck["View"] = false;
            }
          }
          return activity;
        });
        exp.SetAllChecks = setAllCheck;
        return exp;
      });
      return group;
    });

    setExpData(newState);
    setFullRightCheckOneActivityArr(arr);
  };

  const handleAllRights = (checkedVal, grpIdx, expIdx, actId, activityType) => {
    let newState = { ...expData };
    newState.ExceptionGroups[grpIdx].ExceptionList[expIdx].Activities.map(
      (activity) => {
        if (+activity.ActivityId === +actId) {
          activity["View"] = checkedVal;
          if (!disableExpChecks(activityType, "Raise")) {
            activity["Raise"] = checkedVal;
          }
          if (!disableExpChecks(activityType, "Respond")) {
            activity["Respond"] = checkedVal;
          }
          if (!disableExpChecks(activityType, "Clear")) {
            activity["Clear"] = checkedVal;
          }
        }
      }
    );

    // Controlling set-all
    let setall_obj = {
      View: true,
      Respond: true,
      Raise: true,
      Clear: true,
    };
    newState.ExceptionGroups[grpIdx].ExceptionList[expIdx].Activities.forEach(
      (activity) => {
        let actType = getActType(activity.ActivityId);
        if (
          +actType !== 2 &&
          +actType !== 3 &&
          +actType !== 11 &&
          +actType !== 1
        ) {
          if (!activity.View) {
            setall_obj["View"] = false;
          }
          if (!activity.Raise) {
            setall_obj["Raise"] = false;
          }
          if (!activity.Respond) {
            setall_obj["Respond"] = false;
          }
          if (!activity.Clear) {
            setall_obj["Clear"] = false;
          }
        } else if (+actType === 1) {
          if (!activity.View) {
            setall_obj["View"] = false;
          }
          if (!activity.Raise) {
            setall_obj["Raise"] = false;
          }
        } else if (+actType === 2 || +actType === 3 || +actType === 11) {
          if (!activity.View) {
            setall_obj["View"] = false;
          }
        }
      }
    );
    newState.ExceptionGroups[grpIdx].ExceptionList[expIdx].SetAllChecks =
      setall_obj;

    // Column Top full Column handle checkBox
    let localActivityArr = [];
    let localActivityIdArr = [];
    newState?.ExceptionGroups.forEach((group) => {
      group.ExceptionList?.forEach((exception) => {
        exception.Activities = exception.Activities.sort((a, b) =>
          +a.ActivityId > +b.ActivityId ? 1 : -1
        );
        exception.Activities?.forEach((activity, act_idx) => {
          let actType = getActType(activity.ActivityId);
          if (
            +actType !== 2 &&
            +actType !== 3 &&
            +actType !== 1 &&
            +actType !== 11
          ) {
            if (Object.values(activity).includes(false)) {
              localActivityArr[act_idx] = false;
            } else {
              if (localActivityArr[act_idx] !== false) {
                localActivityArr[act_idx] = true;
              }
            }
          } else if (+actType === 1) {
            if (!activity.View) {
              localActivityArr[act_idx] = false;
            } else if (!activity.Raise) {
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
          // till here BugId 139505
          localActivityIdArr[act_idx] = activity.ActivityId;
        });
      });
    });
    let fullRightArr = [...fullRightCheckOneActivityArr];
    localActivityArr?.forEach((activity, activityIndex) => {
      if (activity === false) {
        fullRightArr[localActivityIdArr[activityIndex]] = false;
      } else {
        fullRightArr[localActivityIdArr[activityIndex]] = true;
      }
    });
    setFullRightCheckOneActivityArr(fullRightArr);

    let postBody = checkedVal
      ? {
          processDefId: props.openProcessID,
          check: true,
          pMExpTypeInfos: [
            {
              expTypeName:
                expData.ExceptionGroups[grpIdx].ExceptionList[expIdx]
                  .ExceptionName,
              expTypeId:
                expData.ExceptionGroups[grpIdx].ExceptionList[expIdx]
                  .ExceptionId,
              pMActRightsInfoList: [
                {
                  actId: actId,
                  vTrigFlag: "Y",
                  vrTrigFlag: !disableExpChecks(activityType, "Raise")
                    ? "Y"
                    : "N",
                  vaTrigFlag: !disableExpChecks(activityType, "Respond")
                    ? "Y"
                    : "N",
                  vcTrigFlag: !disableExpChecks(activityType, "Clear")
                    ? "Y"
                    : "N",
                },
              ],
            },
          ],
        }
      : {
          processDefId: props.openProcessID,
          check: false,
          pMExpTypeInfos: [
            {
              expTypeName:
                expData.ExceptionGroups[grpIdx].ExceptionList[expIdx]
                  .ExceptionName,
              expTypeId:
                expData.ExceptionGroups[grpIdx].ExceptionList[expIdx]
                  .ExceptionId,
              pMActRightsInfoList: [
                {
                  actId: actId,
                  vTrigFlag: "N",
                  vrTrigFlag: "N",
                  vaTrigFlag: "N",
                  vcTrigFlag: "N",
                },
              ],

              vTrigFlag: "Y",
              vrTrigFlag: "Y",
              vaTrigFlag: "Y",
              vcTrigFlag: "Y",
            },
          ],
        };

    axios.post(SERVER_URL + `/saveExceptionRight`, postBody).then((res) => {
      if (res.status === 200) {
      }
    });

    setExpData(newState);
  };

  // code added on 24 Nov 2022 for BugId 119498
  const GetActivities = () => {
    let display = [];
    if (splicedColumns?.length > 0 && expData?.ExceptionGroups?.length > 0) {
      splicedColumns.map((activity, activityIndex) => {
        let data = [];
        expData.ExceptionGroups?.map((group, groupIndex) => {
          data.push(<p style={{ height: "40px" }}></p>);
          group.ExceptionList.map((exception, expIndex) => {
            data.push(
              <div
                className="oneActivityColumn"
                style={{
                  backgroundColor: "#EEF4FCC4",
                  padding: "8px 10px",
                  borderBottom: "1px solid #DAD0C2",
                }}
              >
                <CheckBoxes //activity CheckBoxes
                  processType={localLoadedProcessData?.ProcessType}
                  exception={exception}
                  processId={props.openProcessID}
                  groupIndex={groupIndex}
                  activityIndex={expIndex}
                  title={expIndex}
                  docIdx={expIndex}
                  activityId={activity.ActivityId}
                  activityType={activity.ActivityType}
                  subActivity={activity.ActivitySubType}
                  expData={expData}
                  setExpData={setExpData}
                  GiveCompleteRights={GiveCompleteRights}
                  toggleSingleChecks={toggleSingleChecks}
                  handleAllChecks={handleAllRights}
                  type={"activity"}
                  processName={props.openProcessName}
                  processData={localLoadedProcessData}
                  isReadOnly={isReadOnly}
                  ariaDescription={`Activity Name : ${activity?.ActivityName} Exception Name: ${exception?.ExceptionName} Group Name: ${group?.GroupName}`}
                />
              </div>
            );
          });
        });
        display.push(
          <div className="activities">
            <div
              className="activityHeader"
              style={{ marginBottom: "1px" }}
              id={`pmweb_exception_${activity?.ActivityName}`}
            >
              {/* Provided the label inside the FormControlLabel */}
              {/*code edited on 27 Dec 2022 for BugId 120743 */}
              {/* <LightTooltip
                id="pmweb_Exception_Tooltip"
                arrow={true}
                enterDelay={500}
                placement="bottom-start"
                title={activity?.ActivityName}
              >
                <span className="actHeaderName">{activity?.ActivityName}</span>
              </LightTooltip> */}
              <FormControlLabel
                label={
                  <LightTooltip
                    id="pmweb_Exception_Tooltip"
                    arrow={true}
                    enterDelay={500}
                    placement="bottom-start"
                    title={activity?.ActivityName}
                  >
                    <span className="actHeaderName">
                      {activity?.ActivityName}
                    </span>
                  </LightTooltip>
                }
                style={{ flexDirection: "row-reverse" }}
                control={
                  <Checkbox
                    name="checkedF"
                    id={`pmweb_masterCheck_oneActivity_exception_checkbox_${activity?.ActivityName}`}
                    //aria-label={`${activity?.ActivityName}`}
                  />
                }
                id={`pmweb_masterCheck_oneActivity_exception_${activity?.ActivityName}`}
                checked={
                  fullRightCheckOneActivityArr[activity.ActivityId] &&
                  (localLoadedProcessData?.ProcessType == "L" ||
                    localLoadedProcessData?.ProcessType == "R")
                    ? true
                    : false
                }
                disabled={
                  isReadOnly || localLoadedProcessData?.ProcessType !== "L"
                    ? true
                    : false
                }
                onChange={() =>
                  GiveCompleteRightsToOneActivity(activity.ActivityId)
                }
                // ref={activityCheckRef}
                ref={(item) => (activityCheckRef.current[activityIndex] = item)}
                onKeyUp={(e) => {
                  if (e.key === "Enter") {
                    activityCheckRef.current[activityIndex].click();
                    e.stopPropagation();
                  }
                }}
              />
              {isReadOnly ||
              localLoadedProcessData?.ProcessType !== "L" ||
              noExpPresent ? null : (
                <img
                  src={manageRights}
                  alt="ManageRights"
                  disabled={noExpPresent}
                  style={{ height: "10px", width: "10px" }}
                  id={`pmweb_oneActivity_particularRight_exception_${activity?.ActivityName}`}
                  className="iconButton"
                  onClick={() => handleActivityModalOpen(activity.ActivityId)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleActivityModalOpen(activity.ActivityId);
                      e.stopPropagation();
                    }
                  }}
                  aria-label={`${activity?.ActivityName} Manage Rights`}
                  disableRipple
                  disableFocusRipple
                />
              )}

              {openActivityModal == activity.ActivityId ? (
                <FocusTrap open={openActivityModal == activity.ActivityId}>
                  <div className="relative">
                    <Backdrop
                      show={openActivityModal}
                      clicked={handleActivityModalClose}
                    />
                    <ActivityModal
                      fullRightCheckOneActivity={
                        fullRightCheckOneActivityArr[activity.ActivityId]
                      }
                      activityType={activity.ActivityType}
                      subActivity={activity.ActivitySubType}
                      activityIndex={activityIndex}
                      activityId={activity.ActivityId}
                      updateActivitySetAllChecks={updateActivitySetAllChecks}
                      type={"set-all"}
                      docTypeList={expData}
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
          }}
        >
          <div>
            <img
              src={NoResultFound}
              // className="noSearchResultImage" // Commented for Bug 127582
              style={{ height: "18rem" }}
              alt={t("noResultsFound")}
            />
            <p
              style={{
                // top: "70%", // Commented for Bug 127582
                marginTop: "10px",
                fontSize: "var(--base_text_font_size)",
                // left: "56%", // Commented for Bug 127582
                // position: "absolute", // Commented for Bug 127582
                // textAlign: "center", // Commented for Bug 127582
                justifyContent: "center",
              }}
            >
              {t("noSearchResult")}
            </p>
          </div>
        </div>
      );
    }

    return display;
  };

  const GetDocList = () => {
    const arrExceptions = [];
    expData.ExceptionGroups &&
      expData.ExceptionGroups.map((group, groupIndex) => {
        arrExceptions.push(
          <React.Fragment>
            <div className="groupNamesDiv" style={{ height: "40px" }}>
              <p className="groupNameExp">
                {/*code added on 2 August for BugId 110100*/}
                <span title={group.GroupName} className="groupNameSpan">
                  {group.GroupName}
                </span>
                <span>{`(${group.ExceptionList.length})`}</span>
              </p>
              {isReadOnly ||
              localLoadedProcessData?.ProcessType !== "L" ? null : (
                <div
                  className="addExpButtonDiv"
                  style={{ position: "relative" }}
                >
                  <span
                    onClick={() => {
                      handleExpOpen(group.GroupId);
                      setExpNameToModify(null);
                      setExpDescToModify(null);
                      setExpIdToModify(null);
                    }}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleExpOpen(group.GroupId);
                        setExpNameToModify(null);
                        setExpDescToModify(null);
                        setExpIdToModify(null);
                        e.stopPropagation();
                      }
                    }}
                    className="addException"
                    id={`pmweb_exception_addException_${uuidv4()}`}
                    aria-description={`Add Exception in Group: ${group?.GroupName}`}
                  >
                    {t("exceptionAdd")}
                  </span>
                  {/*code added on 4 August 2022 for BugId 113922 */}
                  {+group.GroupId !== 0 && !isReadOnly ? (
                    <DeleteModal
                      backDrop={false}
                      isArabic={direction === RTL_DIRECTION ? true : false}
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
                          aria-label={`${group.GroupName} Menu Popper`}
                          disableTouchRipple
                          disableFocusRipple
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
                          id="pmweb_exception_deleteGroup"
                          onClick={() =>
                            deleteGroup(group.GroupName, group.GroupId)
                          }
                          tabIndex={0}
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
              // open={addExceptionModal === group.GroupId}
              open={
                addExceptionModal !== null &&
                +addExceptionModal === +group.GroupId
              }
              // till here BugId 140494
              onClose={handleExpClose}
              aria-label="simple-modal-title"
              aria-description="simple-modal-description"
            >
              <AddException
                bExpExists={bExpExists}
                setbExpExists={setbExpExists}
                expData={expData}
                groupId={group.GroupId}
                addExceptionToList={addExceptionToList}
                handleClose={handleExpClose}
                bGroupExists={bExceptionExists}
                expNameToModify={expNameToModify}
                expDescToModify={expDescToModify}
                expIdToModify={expIdToModify}
                modifyDescription={modifyDescription}
                expName={expName}
                setExpName={setExpName}
                showNameError={showNameError}
                setShowNameError={setShowNameError}
                showDescError={showDescError}
                setShowDescError={setShowDescError}
                addAnotherExp={addAnotherExp}
                setAddAnotherExp={setAddAnotherExp}
                isReadOnly={isReadOnly}
              />
            </Modal>
          </React.Fragment>
        );
        let gp_index = groupIndex;
        group.ExceptionList.map((exception, expIndex) => {
          arrExceptions.push(
            <div>
              <div className="activityNameBlock">
                <div
                  style={{
                    textAlign: direction === RTL_DIRECTION ? "right" : "left",
                  }}
                  className="activityNameDiv"
                >
                  <p className="docName">
                    <LightTooltip
                      id="pmweb_exception_doc_Tooltip"
                      arrow={true}
                      enterDelay={500}
                      placement="bottom-start"
                      title={exception.ExceptionName}
                    >
                      <span>
                        {shortenRuleStatement(exception?.ExceptionName, 12)}
                      </span>
                    </LightTooltip>
                  </p>
                  <p className="docDescription">
                    <LightTooltip
                      id="pmweb_exception_doc_Tooltip"
                      arrow={true}
                      enterDelay={500}
                      placement="bottom-start"
                      title={decode_utf8(exception?.Description)}
                    >
                      <span>
                        {shortenRuleStatement(
                          decode_utf8(exception?.Description),
                          15
                        )}
                      </span>
                    </LightTooltip>
                  </p>
                </div>
                {compact ? null : (
                  <div style={{ display: "flex", position: "relative" }}>
                    <CheckBoxes //setAll CheckBoxes
                      processType={localLoadedProcessData?.ProcessType}
                      exception={exception}
                      title={exception?.ExceptionName}
                      processId={props.openProcessID}
                      groupIndex={gp_index}
                      docIdx={expIndex}
                      expData={expData}
                      setExpData={setExpData}
                      type={"set-all"}
                      activityIndex={expIndex}
                      updateSetAllChecks={updateSetAllChecks}
                      GiveCompleteRights={GiveCompleteRights}
                      isReadOnly={isReadOnly}
                      ariaDescription={`Exception Name: ${exception?.ExceptionName} of Group Name: ${group?.GroupName}`}
                    />
                    {/*code edited on 29 July 2022 for BugId 112407 */}
                    {localLoadedProcessData?.ProcessType === "L" &&
                    !isReadOnly ? (
                      <DeleteModal
                        disabled={isReadOnly}
                        backDrop={false}
                        isArabic={direction === RTL_DIRECTION ? true : false}
                        modalPaper="modalPaperActivity"
                        oneSortOption="oneSortOptionActivity"
                        docIndex={expIndex}
                        hideRelative={true}
                        removePaddings={true}
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
                            disabled={isReadOnly}
                            aria-label={`${exception?.ExceptionName} Menu Popper`}
                            disableFocusRipple
                            disableTouchRipple
                          >
                            <MoreVertIcon
                              style={{
                                color: "#606060",
                                height: "16px",
                                width: "16px",
                                marginLeft: "auto",
                              }}
                            />
                          </IconButton>
                        }
                        modalWidth="180"
                        closeOnClick={true} // code added on 2 Dec 2022 for BugId 109970
                        exceptionOpt={[t("delete"), t("modify")]}
                        sortSectionOne={[
                          <p
                            id="pmweb_exception_deleteExpOption"
                            style={{ width: "100%" }}
                            onClick={() =>
                              deleteExpType(
                                exception.ExceptionName,
                                exception.ExceptionId
                              )
                            }
                            tabIndex={0}
                            onKeyUp={(e) => {
                              if (e.key === "Enter") {
                                deleteExpType(
                                  exception.ExceptionName,
                                  exception.ExceptionId
                                );
                                e.stopPropagation();
                              }
                            }}
                          >
                            {t("delete")}
                          </p>,
                          <p
                            id="pmweb_exception_modifyExpOption"
                            style={{ width: "100%" }}
                            onClick={() =>
                              editDescription(
                                group.GroupId,
                                exception.ExceptionName,
                                exception.Description,
                                exception.ExceptionId
                              )
                            }
                            tabIndex={0}
                            onKeyUp={(e) => {
                              if (e.key === "Enter") {
                                editDescription(
                                  group.GroupId,
                                  exception.ExceptionName,
                                  exception.Description,
                                  exception.ExceptionId
                                );
                                e.stopPropagation();
                              }
                            }}
                          >
                            {t("modify")}
                          </p>,
                          <DeleteModal
                            style={{ width: "100%" }}
                            addNewGroupFunc={() => {
                              addGroupViaMoveTo(
                                exception.ExceptionId,
                                exception.ExceptionName,
                                exception.Description,
                                group.GroupId
                              );
                            }}
                            tabIndex={0}
                            getActionName={(targetGroupName) =>
                              MoveToOtherGroup(
                                targetGroupName,
                                exception.ExceptionId,
                                exception.ExceptionName,
                                exception.Description,
                                group.GroupId
                              )
                            }
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
                            docIndex={expIndex}
                            buttonToOpenModal={
                              <p
                                id="pmweb_exception_moveTodo_To_OtherGroup"
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
                              ...ExceptionGroup?.filter(
                                (grp) => grp !== group.GroupName
                              ),
                              <p
                                id="pmweb_exception_addGroup"
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
    return arrExceptions;
  };

  const changeRules = (data) => {
    let activityIdString = "";
    localLoadedProcessData?.MileStones.map((mileStone) => {
      mileStone.Activities.map((activity, index) => {
        activityIdString = activityIdString + activity.ActivityId + ",";
      });
    });
    MapAllActivities(activityIdString);
  };

  if (isLoading) {
    return <CircularProgress className="circular-progress" />;
  } else
    return (
      <>
        <CommonInterface
          newGroupToMove={newGroupToMove}
          screenHeading={t("navigationPanel.exceptions")}
          bGroupExists={bGroupExists}
          showGroupNameError={showGroupNameError}
          setbGroupExists={setbGroupExists}
          addGroupToList={addGroupToList}
          addGroupModal={addGroupModal}
          setActivitySearchTerm={setActivitySearchTerm}
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
          ruleDataType={ruleDataArray}
          exceptionAllRules={exceptionRules}
          setExceptionAllRules={setExceptionRules}
          screenType={SCREENTYPE_EXCEPTION}
          ruleType="E"
          onSearchChange={onSearchChange}
          clearSearchResult={clearSearchResult}
          setSearchTerm={setExpSearchTerm}
          openProcessType={localLoadedProcessData?.ProcessType}
          onActivitySearchChange={onActivitySearchChange}
          clearActivitySearchResult={clearActivitySearchResult}
          groupName={groupName}
          setGroupName={setGroupName}
          changeRules={changeRules}
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
  };
};

export default connect(mapStateToProps, null)(Exception);
