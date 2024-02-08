// Changes made to solve ID Bug 116180 - Associated Queue: not able to create own Queue in Associated Queue &
// Bug 116178 - Associated Queue: not able to save any changes in associated Queue
// Changes made to solve Bug 122821 - queue: after creating new queue no success message appears neither the save button is getting enabled
import React, { useState, useEffect, useRef } from "react";
import Tabs from "../../../../UI/Tab/Tab.js";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import Button from "@material-ui/core/Button";
import "./index.css";
import GroupsTab from "./groupsTab.js";
import { store, useGlobalState } from "state-pool";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { Select, MenuItem, Checkbox, makeStyles } from "@material-ui/core";
import { connect, useDispatch } from "react-redux";
import * as actionCreators_selection from "../../../../redux-store/actions/selectedCellActions";
import {
  SERVER_URL,
  ENDPOINT_QUEUEASSOCIATION_GROUPLIST,
  ENDPOINT_QUEUELIST,
  ENDPOINT_QUEUEASSOCIATION_MODIFY,
  SAVE_QUEUEDATA,
  RTL_DIRECTION,
  SPACE,
} from "../../../../Constants/appConstants.js";
import { FieldValidations } from "../../../../utility/FieldValidations/fieldValidations.js";
import {
  decode_utf8,
  encode_utf8,
} from "../../../../utility/UTF8EncodeDecoder";
import { setToastDataFunc } from "../../../../redux-store/slices/ToastDataHandlerSlice.js";
import { LatestVersionOfProcess } from "../../../../utility/abstarctView/checkLatestVersion.js";
import {
  RedefineEventTarget,
  checkRegex,
  getIncorrectLenErrMsg,
  getIncorrectRegexErrMsg,
} from "../../../../utility/CommonFunctionCall/CommonFunctionCall.js";
import {
  PMWEB_ARB_REGEX,
  PMWEB_REGEX,
} from "../../../../validators/validator.js";

const useStyles = makeStyles({
  focusVisible: {
    outline: "none",
    "&:focus-visible": {
      "& svg": {
        outline: `2px solid #00477A`,
        borderRadius: "10px",
      },
    },
  },
});

function QueueAssociation(props) {
  const classes = useStyles();
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const dispatch = useDispatch();
  const [addedVariableList, setAddedVariableList] = useState([]);
  const [variableList, setVariableList] = useState(null);
  const [queueName, setQueueName] = useState("");
  const [queueDesc, setQueueDesc] = useState("");
  const [filterOption, setFilterOption] = useState("1");
  const [orderByNumber, setOrderByNumber] = useState("2");
  const [filterValue, setFilterValue] = useState("");
  const [filterValueLast, setFilterValueLast] = useState("");
  const [orderByValue, setOrderByValue] = useState("");
  const [queueTypeLocal, setQueueTypeLocal] = useState("wip");
  const [wipAssignmentType, setWipAssignmentType] = useState("N");
  const loadedProcessData = store.getState("loadedProcessData");
  const [query, setQuery] = useState({});
  const descriptionRef = useRef();
  const [sortOrder, setSortOrder] = useState("A");
  const [localLoadedProcessData, setLocalLoadedProcessData] =
    useGlobalState(loadedProcessData);
  const localActivityPropertyData = store.getState("activityPropertyData");
  const [localLoadedActivityPropertyData] = useGlobalState(
    localActivityPropertyData
  );
  const [errorMsg, setErrorMsg] = useState(false);
  const [isEdited, setIsEdited] = useState(false);
  const workItemDropDownValues = [
    {
      orderBy: "3",
      name: "ActivityName",
    },
    {
      orderBy: "7",
      name: "CheckListCompleteFlag",
    },
    {
      orderBy: "10",
      name: "EntryDateTime",
    },
    {
      orderBy: "6",
      name: "InstrumentStatus",
    },
    {
      orderBy: "5",
      name: "IntroducedBy",
    },
    {
      orderBy: "13",
      name: "IntroductionDateTime",
    },
    {
      orderBy: "4",
      name: "LockedByName",
    },
    {
      orderBy: "12",
      name: "LockedTime",
    },
    {
      orderBy: "8",
      name: "LockStatus",
    },
    {
      orderBy: "1",
      name: "PriorityLevel",
    },
    {
      orderBy: "2",
      name: "ProcessInstanceName",
    },
    {
      orderBy: "17",
      name: "Status",
    },
    {
      orderBy: "11",
      name: "ValidTill",
    },
    {
      orderBy: "101",
      name: "VAR_INT1",
    },
    {
      orderBy: "102",
      name: "VAR_INT2",
    },
    {
      orderBy: "103",
      name: "VAR_INT3",
    },
    {
      orderBy: "104",
      name: "VAR_INT4",
    },
    {
      orderBy: "105",
      name: "VAR_INT5",
    },
    {
      orderBy: "106",
      name: "VAR_INT6",
    },
    {
      orderBy: "107",
      name: "VAR_INT7",
    },
    {
      orderBy: "108",
      name: "VAR_INT8",
    },
    {
      orderBy: "109",
      name: "VAR_FLOAT1",
    },
    {
      orderBy: "110",
      name: "VAR_FLOAT2",
    },
    {
      orderBy: "111",
      name: "VAR_DATE1",
    },
    {
      orderBy: "112",
      name: "VAR_DATE2",
    },
    {
      orderBy: "113",
      name: "VAR_DATE3",
    },
    {
      orderBy: "114",
      name: "VAR_DATE4",
    },
    {
      orderBy: "115",
      name: "VAR_LONG1",
    },
    {
      orderBy: "116",
      name: "VAR_LONG2",
    },
    {
      orderBy: "117",
      name: "VAR_LONG3",
    },
    {
      orderBy: "118",
      name: "VAR_LONG4",
    },
    {
      orderBy: "119",
      name: "VAR_STR1",
    },
    {
      orderBy: "120",
      name: "VAR_STR2",
    },
    {
      orderBy: "121",
      name: "VAR_STR3",
    },
    {
      orderBy: "122",
      name: "VAR_STR4",
    },
    {
      orderBy: "123",
      name: "VAR_STR5",
    },
    {
      orderBy: "124",
      name: "VAR_STR6",
    },
    {
      orderBy: "125",
      name: "VAR_STR7",
    },
    {
      orderBy: "126",
      name: "VAR_STR8",
    },
  ];

  // code edited on 25 Aug 2023 for BugId 134868 - regression>>swimlane>>screen is crashing
  // while clicking on queue management
  const [allowReassignment, setAllowReassignment] = useState(
    localLoadedActivityPropertyData?.ActivityProperty?.actId === 32 &&
      localLoadedActivityPropertyData?.ActivityProperty?.actId === 1
      ? true
      : false
  );

  const indexOfDropValues = [
    "VAR_INT1",
    "VAR_INT2",
    "VAR_INT3",
    "VAR_INT4",
    "VAR_INT5",
    "VAR_INT6",
    "VAR_INT7",
    "VAR_INT8",
    "VAR_LONG1",
    "VAR_LONG2",
    "VAR_LONG3",
    "VAR_LONG4",
  ];

  // modified on 23/01/24 for BugId 141169
  /*const isReadOnly =
    props.openTemplateFlag ||
    LatestVersionOfProcess(localLoadedProcessData?.Versions) !==
      +localLoadedProcessData?.VersionNo ||
    isReadOnlyFunc(
      localLoadedProcessData,
      props.cellCheckedOut,
      props.cellLaneId
    );*/
  const isReadOnly =
    props.openTemplateFlag ||
    LatestVersionOfProcess(localLoadedProcessData?.Versions) !==
      +localLoadedProcessData?.VersionNo; // modified on 05/09/2023 for BugId 136103
  // till here BugId 141169

  //  Changes are made to solve Bug 132419
  useEffect(() => {
    if (
      (queueName?.trim() === "" || queueDesc?.trim() === "") &&
      props.queueFrom !== "graph"
    ) {
      setQueueName(
        `${localLoadedProcessData?.ProcessName}_${localLoadedActivityPropertyData?.ActivityProperty?.actName}`
      );
      setQueueDesc(
        `Process Modeler generated Default Queue for ${localLoadedActivityPropertyData?.ActivityProperty?.actName}`
      );
      setErrorMsg(false);
    }
  }, [localLoadedActivityPropertyData, props.queueFrom]);
  // till here

  const queueNameRef = useRef();

  const associateQueueHandler = () => {
    let tempKey = {};
    addedVariableList.forEach((el) => {
      tempKey = {
        ...tempKey,
        [el.ID]: {
          uGId: el.ID,
          uGName: el.GroupName,
          associationType: "1",
          queryFilter: query[el.ID],
          queryPreview: "",
          // modified on 23/01/24 for BugId 141169
          // status: "U",
          status: query[el.ID] ? "U" : "I",
          // till here BugId 141169
          m_strServerQueryFilter: "",
          m_bCurrentFilter: false,
          m_bServerFilter: false,
          m_bConflictedFilter: false,
          m_strServerQueryPreview: "",
          m_bCurrentPreview: false,
          m_bServerPreview: false,
          m_bConflictedPreview: false,
          m_strWorkitemEditable: "",
        },
      };
    });
    let tempQueue;
    localLoadedProcessData.MileStones?.forEach((mile) => {
      mile.Activities?.forEach((el) => {
        if (+el.ActivityId === +props.cellID) {
          tempQueue = el.QueueId;
        }
        // code added on 24 Jan 2023 for BugId 122815
        if (el.EmbeddedActivity) {
          el.EmbeddedActivity[0]?.forEach((embAct) => {
            if (+embAct.ActivityId === +props.cellID) {
              tempQueue = embAct.QueueId;
            }
          });
        }
      });
    });
    props.setShowQueueModal(false);
    let tempFilterValue = "";
    if (queueTypeLocal !== "fifo") {
      tempFilterValue = +filterOption === 2 ? filterValue : filterValueLast;
    }

    if (
      (queueName !== null || queueName?.trim() !== "") &&
      (queueDesc !== null || queueDesc?.trim() !== "")
    ) {
      axios
        .post(SERVER_URL + ENDPOINT_QUEUEASSOCIATION_MODIFY, {
          processDefId: localLoadedProcessData.ProcessDefId,
          processState: localLoadedProcessData.ProcessType,
          queueName: queueName,
          // modified on 25/10/23 for BugId 139392
          /* modified for bug_id: 134474 on 10/10/2023
           queueDesc: decode_utf8(queueDesc?.trim()),
           queueDesc: queueDesc?.trim(), */
          queueDesc: encode_utf8(queueDesc?.trim()),
          queueId:
            props.queueFrom === "graph"
              ? props.showQueueModal.queueId
              : tempQueue,
          queueType: queueTypeLocal === "fifo" ? "F" : wipAssignmentType,
          allowReassignment: allowReassignment ? "Y" : "N",
          orderBy: orderByNumber,
          sortOrder: sortOrder ? sortOrder : "A",
          refreshInterval: "0",
          ugMap: tempKey,
          filterOption: queueTypeLocal === "fifo" ? "0" : filterOption,
          // modified on 19/10/23 for BugId 139919
          // filterValue: queueTypeLocal === "fifo" || +filterOption === 1 ? "" : filterValue,
          filterValue: tempFilterValue,
          // till here BugId 139919
          pendingActions: "N",
          queueFilter: "",
          status: "N",
          // modified on 23/01/24 for BugId 141169
          // actId: +localLoadedActivityPropertyData?.ActivityProperty?.actId,
          actId:
            +props.queueType === 0 && props.queueFrom === "graph"
              ? 0
              : +localLoadedActivityPropertyData?.ActivityProperty?.actId,
          // till here BugId 141169
        })
        .then((res) => {
          if (res?.data?.Status === 0) {
            dispatch(
              setToastDataFunc({
                message: t("queueModifiedSuccessfully"),
                severity: "success",
                open: true,
              })
            );
            setIsEdited(false);
            let tempTe = global.structuredClone(localLoadedProcessData);
            let plag = false;
            tempTe?.Queue?.forEach((el) => {
              if (+el.QueueId === +tempQueue) {
                plag = true;
                el.AllowReassignment = allowReassignment ? "Y" : "N";
                el.FilterOption = filterOption;
                el.FilterValue = tempFilterValue;
                el.OrderBy = orderByNumber;
                el.SortOrder = sortOrder ? sortOrder : "A";
                // modified on 25/10/23 for BugId 139392
                // el.QueueDescription = queueDesc;
                el.QueueDescription = decode_utf8(queueDesc?.trim());
                el.QueueFilter = "";
                el.QueueId =
                  props.queueFrom === "graph"
                    ? props.showQueueModal.queueId
                    : tempQueue;
                el.QueueName = queueName;
                el.QueueType =
                  queueTypeLocal === "fifo" ? "F" : wipAssignmentType;
                el.RefreshInterval = "0";
                el.UG = { ...tempKey };
              }
            });
            if (!plag) {
              tempTe?.Queue?.push({
                AllowReassignment: allowReassignment ? "Y" : "N",
                FilterOption: filterOption,
                FilterValue: tempFilterValue,
                OrderBy: orderByNumber,
                QueueDescription: queueDesc,
                QueueFilter: "",
                sortOrder: sortOrder ? sortOrder : "A",
                // modified on 23/01/24 for BugId 141169
                /*QueueId:
                  props.queueFrom === "graph"
                    ? props.showQueueModal.queueId
                    : tempQueue,*/
                QueueId: res?.data?.QueueId,
                // till here BugId 141169
                QueueName: queueName,
                QueueType: queueTypeLocal === "fifo" ? "F" : wipAssignmentType,
                RefreshInterval: "0",
                UG: { ...tempKey },
              });
            }
            setLocalLoadedProcessData(tempTe);
          }
        });
    } else {
      dispatch(
        setToastDataFunc({
          message: t("fillRequiredFields"),
          severity: "error",
          open: true,
        })
      );
    }
  };
  // added on 30-10-2023 for bug_id: 139917
  const validateData = (e, val) => {
    if (e.target.value === "") {
      setErrorMsg(`${t("pleaseDefine")}${SPACE} ${val}`);
    } else if (e.target.value.length > 255) {
      setErrorMsg(`${val}${SPACE}${t("lengthShouldNotExceed255Characters")}`);
    } else {
      setErrorMsg("");
    }
    if (e.target.value == "") {
      setErrorMsg(false);
    }
  };

  const createQueueHandler = () => {
    let tempKey = {};
    addedVariableList.forEach((el) => {
      tempKey = {
        ...tempKey,
        [el.ID]: {
          uGId: el.ID,
          uGName: el.GroupName,
          associationType: "1",
          queryFilter: query[el.ID],
          queryPreview: "",
          // modified on 23/01/24 for BugId 141169
          // status: "U",
          status: query[el.ID] ? "U" : "I",
          // till here BugId 141169
          m_strServerQueryFilter: "",
          m_bCurrentFilter: false,
          m_bServerFilter: false,
          m_bConflictedFilter: false,
          m_strServerQueryPreview: "",
          m_bCurrentPreview: false,
          m_bServerPreview: false,
          m_bConflictedPreview: false,
          m_strWorkitemEditable: "",
        },
      };
    });
    let myArray = [];
    localLoadedProcessData?.Queue?.forEach((el) => {
      myArray.push(el.QueueId);
    });
    let minimumQueueId =
      localLoadedProcessData?.Queue?.length < 1
        ? "-1"
        : Math.min(...myArray) - 1;

    if (
      // modified on 23/01/24 for BugId 141169
      // +props.queueType === 1 &&
      (+props.queueType === 1 ||
        (+props.queueType === 0 && props.queueFrom === "graph")) &&
      // till here BugId 141169
      queueName?.trim() !== "" &&
      queueDesc?.trim() !== ""
    ) {
      let updatedQueueId = "0";
      let tempFilterValue = "";
      if (queueTypeLocal !== "fifo") {
        tempFilterValue = +filterOption === 2 ? filterValue : filterValueLast;
      }

      axios
        .post(SERVER_URL + SAVE_QUEUEDATA, {
          processDefId: localLoadedProcessData.ProcessDefId,
          processState: localLoadedProcessData.ProcessType,
          queueName: queueName,
          queueId: minimumQueueId == null ? "-1" : minimumQueueId,
          queueType: queueTypeLocal === "fifo" ? "F" : wipAssignmentType,
          pendingActions: "N",
          queueDesc: encode_utf8(queueDesc?.trim()),
          // queueDesc: queueDesc?.trim(),
          allowReassignment: allowReassignment ? "Y" : "N",
          filterOption: filterOption,
          filterValue: tempFilterValue,
          orderBy: orderByNumber,
          // modified on 27/10/23 for BugId 140158
          // sortOrder: sortOrder,
          sortOrder: sortOrder ? sortOrder : "A",
          queueFilter: "",
          refreshInterval: "0",
          status: "N",
          ugMap: tempKey,
          actId: +localLoadedActivityPropertyData.ActivityProperty.actId,
        })
        .then((res) => {
          if (res.data.Status === 0) {
            dispatch(
              setToastDataFunc({
                message: t("queueAddedSuccessfully"),
                severity: "success",
                open: true,
              })
            );
            setIsEdited(false);
            updatedQueueId = res.data.QueueId;
            props.setShowQueueModal(false);
            props.setSelfQueueCreated(true);
            let temp = JSON.parse(JSON.stringify(localLoadedProcessData));
            temp.MileStones?.forEach((mile) => {
              mile.Activities?.forEach((el) => {
                if (+el.ActivityId === +props.cellID) {
                  el.QueueId = updatedQueueId == null ? "-1" : updatedQueueId;
                }
              });
            });
            let tempName;
            workItemDropDownValues?.forEach((el) => {
              if (+el.orderBy === +orderByNumber) {
                tempName = el.name;
              }
            });
            setOrderByValue(tempName);
            temp.Queue.push({
              AllowReassignment: allowReassignment ? "Y" : "N",
              FilterOption: filterOption,
              FilterValue: tempFilterValue,
              OrderBy: orderByNumber,
              // modified on 25/10/23 for BugId 139392
              // QueueDescription: queueDesc,
              QueueDescription: decode_utf8(queueDesc?.trim()),
              QueueFilter: "",
              // QueueId: minimumQueueId == null ? "1" : minimumQueueId,
              QueueId: updatedQueueId,
              QueueName: queueName,
              QueueType: queueTypeLocal === "fifo" ? "F" : wipAssignmentType,
              RefreshInterval: "0",
              // modified on 27/10/23 for BugId 140158
              // sortOrder: sortOrder,
              SortOrder: sortOrder ? sortOrder : "A",
              UG: tempKey,
            });
            setLocalLoadedProcessData(temp);
          }
        });
    } else {
      dispatch(
        setToastDataFunc({
          message: t("fillRequiredFields"),
          severity: "error",
          open: true,
        })
      );
      //Run delete API
      //Remove data from queuedata coming in openProcess call
      //SWimlane ki queue ID update krna hai for that activity
    }
  };

  const addAllVariable = () => {
    setAddedVariableList((prev) => {
      let newData = [...prev];
      variableList.forEach((data) => {
        newData.push(data);
      });
      return newData;
    });
    setVariableList([]);
    setIsEdited(true);
  };
  const addOneVariable = (variable) => {
    setAddedVariableList((prev) => {
      return [...prev, variable];
    });
    setVariableList((prev) => {
      let prevData = [...prev];
      return prevData.filter((data) => {
        if (data.ID !== variable.ID) {
          return data;
        }
      });
    });
    setIsEdited(true);
  };
  const removeAllVariable = () => {
    setVariableList((prev) => {
      let newData = [...prev];
      addedVariableList.forEach((data) => {
        newData.push(data);
      });
      return newData;
    });
    setAddedVariableList([]);
    setIsEdited(true);
  };
  const removeOneVariable = (variable) => {
    setVariableList((prev) => {
      return [...prev, variable];
    });
    setAddedVariableList((prevContent) => {
      let prevData = [...prevContent];
      return prevData.filter((dataContent) => {
        if (dataContent.ID !== variable.ID) {
          return dataContent;
        }
      });
    });
    setIsEdited(true);
  };

  useEffect(() => {
    axios
      .post(SERVER_URL + ENDPOINT_QUEUEASSOCIATION_GROUPLIST, {
        // m_strInit: "",
        // m_strGroupId: "",
        // m_strGroupName: "",
        // m_arrGroupList: "",
        // m_bError: false,
        // m_strErrorMsg: "",
        // m_bDescending: "",
        // m_bEnablePrevBut: "",
        // m_bEnableNextBut: "",
        // m_strDefaultPrefix: "",
      })
      .then((res) => {
        if (res?.data?.Status === 0) {
          setVariableList(res.data.GroupInfo);
        }
      });
  }, []);

  useEffect(() => {
    workItemDropDownValues?.map((el) => {
      if (el.orderBy == orderByNumber) {
        setOrderByValue(el.name);
      }
    });
  }, [orderByNumber]);

  useEffect(() => {
    let plag;
    let plagIndex;
    // code edited on 25 Aug 2023 for BugId 134868 - regression>>swimlane>>screen is crashing
    // while clicking on queue management
    let cellQueueId =
      props.queueFrom === "graph"
        ? props.showQueueModal.queueId
        : props.cellQueueId;

    localLoadedProcessData?.Queue?.forEach((el, index) => {
      if (+el.QueueId === +cellQueueId) {
        plag = true;
        plagIndex = index;
      }
    });

    // modified on 14/10/23 for BugId 139393
    if (+props.queueType === 1 && !props.selfQueueCreated) {
      setIsEdited(true);
    }

    // Changes are made to solve Bug 132356
    if (
      ((+props.queueType === 0 || props.selfQueueCreated) &&
        +cellQueueId < 0) ||
      // modified on 29/10/23 for BugId 140274
      // (+cellQueueId > 0 && !plag && props.selfQueueCreated)
      (+cellQueueId > 0 &&
        !plag &&
        (+props.queueType === 0 || props.selfQueueCreated))
      // till here BugId 140274
    ) {
      let temp = [];
      let tempQueue;
      localLoadedProcessData?.MileStones?.forEach((mile) => {
        mile.Activities?.forEach((el) => {
          if (+el.ActivityId === +props.cellID) {
            tempQueue = el.QueueId;
          }
          // code added on 24 Jan 2023 for BugId 122815
          if (el.EmbeddedActivity) {
            el.EmbeddedActivity[0]?.forEach((embAct) => {
              if (+embAct.ActivityId === +props.cellID) {
                tempQueue = embAct.QueueId;
              }
            });
          }
        });
      });
      // TILL HERE
      let obj = {};
      localLoadedProcessData?.Queue.map((el) => {
        if (
          +el.QueueId === +tempQueue &&
          localLoadedProcessData.CheckedOut == "Y"
        ) {
          // flag = true;
          obj = el;
        }
      });

      setQueueName(obj.QueueName);
      setQueueDesc(obj.QueueDescription);
      setErrorMsg(false);
      // modified on 23/01/24 for BugId 141169
      // if (!props.selfQueueCreated) {
      if (+props.queueType === 1 && !props.selfQueueCreated) {
        setIsEdited(true);
      }
      // till here BugId 141169
      axios
        .post(SERVER_URL + ENDPOINT_QUEUELIST, {
          processDefId: localLoadedProcessData.ProcessDefId,
          processState: localLoadedProcessData.ProcessType,
          queueId:
            props.queueFrom === "graph"
              ? props.showQueueModal.queueId
              : tempQueue,
        })
        .then((res) => {
          if (res?.data?.Queue[0].allowReassignment === "Y") {
            setAllowReassignment(true);
          } else {
            setAllowReassignment(false);
          }
          setQueueName(res?.data?.Queue[0]?.queueName);
          setSortOrder(res?.data?.Queue[0]?.sortOrder);
          // modified on 25/10/23 for BugId 139392
          // setQueueDesc(res?.data?.Queue[0]?.queueDesc);
          setQueueDesc(decode_utf8(res?.data?.Queue[0]?.queueDesc));
          setQueueTypeLocal(
            res?.data?.Queue[0]?.queueType === "F" ? "fifo" : "wip"
          );
          setOrderByNumber(res?.data?.Queue[0]?.orderBy);
          setFilterOption(res?.data?.Queue[0]?.filterOption);
          // setErrorMsg(true);
          let tempy = res?.data?.Queue[0]?.filterOption;
          if (+tempy === 1) {
            setFilterValue("");
          } else if (+tempy === 2) {
            setFilterValue(res?.data?.Queue[0]?.filterValue);
          } else if (+tempy === 3) {
            setFilterValueLast(res?.data?.Queue[0]?.filterValue);
          }
          // setWorkItemVisibility(res?.data?.Queue[0]?.filterOption);
          setWipAssignmentType(
            // res?.data?.Queue[0]?.queueType === "I" ||
            res?.data?.Queue[0]?.queueType === "M"
              ? "N"
              : res?.data?.Queue[0]?.queueType
          );
          let tempQueryFilter = {};
          if (res?.data?.Queue[0].ugMap) {
            Object.keys(res?.data?.Queue[0]?.ugMap).forEach((el) => {
              let tOne = res?.data?.Queue[0]?.ugMap;
              temp.push({
                GroupName: tOne[el].m_strUGName
                  ? tOne[el].m_strUGName
                  : tOne[el].uGName,
                ID: tOne[el].m_strUGId ? tOne[el].m_strUGId : tOne[el].uGId,
              });
              tempQueryFilter = {
                ...tempQueryFilter,
                [tOne[el].m_strUGId ? tOne[el].m_strUGId : tOne[el].uGId]: tOne[
                  el
                ].m_strQueryFilter
                  ? tOne[el].m_strQueryFilter
                  : tOne[el].queryFilter,
              };
            });
          }
          setQuery(tempQueryFilter);
          setAddedVariableList(temp);
        });
    } else if (cellQueueId > 0 && plag) {
      setAllowReassignment(
        localLoadedProcessData.Queue[plagIndex].AllowReassignment
      );
      setFilterOption(localLoadedProcessData.Queue[plagIndex].FilterOption);
      if (localLoadedProcessData.Queue[plagIndex].FilterOption == 1) {
        setFilterValue("");
      } else if (localLoadedProcessData.Queue[plagIndex].FilterOption == 2) {
        setFilterValue(localLoadedProcessData.Queue[plagIndex].FilterValue);
      } else if (localLoadedProcessData.Queue[plagIndex].FilterOption == 3) {
        setFilterValueLast(localLoadedProcessData.Queue[plagIndex].FilterValue);
      }
      setOrderByNumber(localLoadedProcessData.Queue[plagIndex].OrderBy);
      setQueueDesc(localLoadedProcessData.Queue[plagIndex].QueueDescription);
      setQueueName(localLoadedProcessData.Queue[plagIndex].QueueName);
      setErrorMsg(false);
      setSortOrder(localLoadedProcessData.Queue[plagIndex].SortOrder);
      let temp = [];
      let tempQueryFilter = {};
      if (localLoadedProcessData?.Queue[plagIndex]?.UG) {
        Object.keys(localLoadedProcessData?.Queue[plagIndex]?.UG).forEach(
          (el) => {
            let tOne = localLoadedProcessData?.Queue[plagIndex]?.UG;
            temp.push({
              GroupName: tOne[el].uGName,
              ID: tOne[el].uGId,
            });
            tempQueryFilter = {
              ...tempQueryFilter,
              [tOne[el].uGId]: tOne[el].queryFilter,
            };
          }
        );
      }
      setQuery(tempQueryFilter);
      setAddedVariableList(temp);
    }
  }, [
    localLoadedProcessData,
    props.queueType,
    props.selfQueueCreated,
    props.queueFrom,
  ]);

  const onChange = (e) => {
    setWipAssignmentType(e.target.value);
    // added on 19/10/23 for BugId 139918
    setIsEdited(true);
  };

  const onFifoChange = (e) => {
    setOrderByNumber(e.target.value);
    setAllowReassignment(false);
    setIsEdited(true);
  };

  const onWorkItemWipChange = (e) => {
    setFilterOption(e.target.value);
    setIsEdited(true);
    // modified on 19/10/23 for BugId 139919
    /*if (+filterOption === 2) {
      setFilterValueLast(null);
    } else if (+filterOption === 3) {
      setFilterValue(null);
    } else {
      setFilterValue(null);
      setFilterValueLast(null);
    }*/
    if (+e.target.value === 2) {
      setFilterValue("VAR_INT1");
      setFilterValueLast("");
    } else if (+e.target.value === 3) {
      setFilterValue("");
      setFilterValueLast("VAR_INT1");
    } else {
      setFilterValue("");
      setFilterValueLast("");
    }
    // till here BugId 139919
  };

  const showFetchingOrder = () => {
    return (
      <div className="fetchingOrderFIFO">
        {/* ------------------------------ */}
        {queueTypeLocal === "wip" ? (
          <>
            <p
              style={{
                color: "#000000",
                fontSize: "12px",
                fontWeight: "700",
              }}
            >
              {t("assignmentType")}
            </p>
            <FormControl disabled={isReadOnly}>
              <RadioGroup
                disabled={isReadOnly}
                column
                //aria-labelledby="demo-row-radio-buttons-group-label"
                name="row-radio-buttons-group"
                value={wipAssignmentType}
                onChange={onChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const child = e.target.querySelector("input");
                    onChange(RedefineEventTarget(e, child));
                  }
                }}
              >
                <FormControlLabel
                  value="N"
                  control={
                    <Radio
                      size="small"
                      // modified on 23/01/24 for BugId 141169
                      // disabled={props.queueType == 0}
                      disabled={
                        +props.queueType === 0 && props.queueFrom !== "graph"
                      }
                      // till here BugId 141169
                      tabIndex={-1}
                    />
                  }
                  label={
                    <p style={{ fontSize: "12px" }}>{t("noAssignment")}</p>
                  }
                  tabIndex={0}
                  className={classes.focusVisible}
                />
                <FormControlLabel
                  value="D"
                  control={
                    <Radio
                      size="small"
                      // modified on 23/01/24 for BugId 141169
                      // disabled={props.queueType == 0}
                      disabled={
                        +props.queueType === 0 && props.queueFrom !== "graph"
                      }
                      // till here BugId 141169
                      tabIndex={-1}
                    />
                  }
                  label={
                    <p style={{ fontSize: "12px" }}>{t("dynamicAssignment")}</p>
                  }
                  tabIndex={0}
                  className={classes.focusVisible}
                />
                <FormControlLabel
                  value="S"
                  control={
                    <Radio
                      size="small"
                      // modified on 23/01/24 for BugId 141169
                      // disabled={props.queueType == 0}
                      disabled={
                        +props.queueType === 0 && props.queueFrom !== "graph"
                      }
                      // till here BugId 141169
                      tabIndex={-1}
                    />
                  }
                  tabIndex={0}
                  label={
                    <p style={{ fontSize: "12px" }}>
                      {t("permanentAssignment")}
                    </p>
                  }
                  className={classes.focusVisible}
                />
              </RadioGroup>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  margin: "0.25rem 0 1rem",
                }}
              >
                <FormControlLabel
                  label={
                    <span style={{ fontSize: "11px", fontWeight: "600" }}>
                      {t("allowReassignment")}
                    </span>
                  }
                  control={
                    <Checkbox
                      // modified on 23/01/24 for BugId 141169
                      // disabled={isReadOnly || props.queueType == 0}
                      disabled={
                        isReadOnly ||
                        (+props.queueType === 0 && props.queueFrom !== "graph")
                      }
                      // till here BugId 141169
                      size="small"
                      checked={allowReassignment}
                      onChange={() => {
                        // added on 19/10/23 for BugId 139918
                        setIsEdited(true);
                        setAllowReassignment(!allowReassignment);
                      }}
                    />
                  }
                />
              </div>
            </FormControl>
          </>
        ) : null}
        {/* ------------------------------- */}
        <p
          style={{
            color: "#000000",
            fontSize: "12px",
            fontWeight: "700",
          }}
        >
          {t("fetchingOrder")}
        </p>
        {/* --------------------------------*/}
        {queueTypeLocal === "fifo" ? (
          <FormControl>
            <RadioGroup
              column
              //aria-labelledby="demo-row-radio-buttons-group-label"
              name="row-radio-buttons-group"
              value={orderByNumber}
              onChange={onFifoChange}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const child = e.target.querySelector("input");
                  onFifoChange(RedefineEventTarget(e, child));
                }
              }}
            >
              <FormControlLabel
                // modified on 23/01/24 for BugId 141169
                // disabled={isReadOnly || props.queueType == 0}
                disabled={
                  isReadOnly ||
                  (+props.queueType === 0 && props.queueFrom !== "graph")
                }
                // till here BugId 141169
                value="2"
                control={
                  <Radio
                    size="small"
                    // modified on 23/01/24 for BugId 141169
                    // disabled={isReadOnly || props.queueType == 0}
                    disabled={
                      isReadOnly ||
                      (+props.queueType === 0 && props.queueFrom !== "graph")
                    }
                    // till here BugId 141169
                    tabIndex={-1}
                  />
                }
                label={
                  <p style={{ fontSize: "12px" }}>
                    {t("inOrderOfProcessInstanceId")}
                  </p>
                }
                tabIndex={0}
                className={classes.focusVisible}
              />
              <FormControlLabel
                value="10"
                control={
                  <Radio
                    size="small"
                    // modified on 23/01/24 for BugId 141169
                    // disabled={isReadOnly || props.queueType == 0}
                    disabled={
                      isReadOnly ||
                      (+props.queueType === 0 && props.queueFrom !== "graph")
                    }
                    // till here BugId 141169
                    tabIndex={-1}
                  />
                }
                label={
                  <p style={{ fontSize: "12px" }}>
                    {t("inOrderOfEntryDateTime")}
                  </p>
                }
                disabled={isReadOnly}
                tabIndex={0}
                className={classes.focusVisible}
              />
              <FormControlLabel
                value="1"
                control={
                  <Radio
                    size="small"
                    // modified on 23/01/24 for BugId 141169
                    // disabled={isReadOnly || props.queueType == 0}
                    disabled={
                      isReadOnly ||
                      (+props.queueType === 0 && props.queueFrom !== "graph")
                    }
                    // till here BugId 141169
                    tabIndex={-1}
                  />
                }
                label={
                  <p style={{ fontSize: "12px" }}>
                    {t("inOrderOfPriorityLevel")}
                  </p>
                }
                disabled={isReadOnly}
                tabIndex={0}
                className={classes.focusVisible}
              />
            </RadioGroup>
          </FormControl>
        ) : (
          <div>
            <p>
              <label id="pmWeb_QueueAssociation_FetchingWorkItem">
                {t("fetchingWorkitemInOrderOf")}{" "}
              </label>
              <Select
                // modified on 23/01/24 for BugId 141169
                // disabled={isReadOnly || props.queueType == 0}
                disabled={
                  isReadOnly ||
                  (+props.queueType === 0 && props.queueFrom !== "graph")
                }
                // till here BugId 141169
                style={{
                  height: "10px !important",
                  width: "98px",
                  marginTop: "10px",
                  background: "#FFFFFF 0% 0% no-repeat padding-box",
                  border: "1px solid #DADADA",
                  borderRadius: "2px",
                  opacity: "1",
                  flex: "1",
                }}
                inputProps={{
                  "aria-labelledby": "pmWeb_QueueAssociation_FetchingWorkItem",
                }}
                value={orderByValue}
                onChange={(e) => {
                  // added on 19/10/23 for BugId 139918
                  setIsEdited(true);
                  setOrderByValue(e.target.value);
                  workItemDropDownValues?.map((el) => {
                    if (el.name === e.target.value) {
                      setOrderByNumber(el.orderBy);
                    }
                  });
                }}
              >
                {workItemDropDownValues.map((el) => {
                  return (
                    <MenuItem value={el.name}>
                      <em
                        style={{
                          fontSize: "12px",
                          fontStyle: "normal",
                        }}
                      >
                        {el.name}
                      </em>
                    </MenuItem>
                  );
                })}
              </Select>
            </p>
            <p>
              <label id="pmWeb_QueueAssociation_SortOrder">
                {t("sortOrder")}{" "}
              </label>
              <Select
                // modified on 23/01/24 for BugId 141169
                // disabled={isReadOnly || props.queueType == 0}
                disabled={
                  isReadOnly ||
                  (+props.queueType === 0 && props.queueFrom !== "graph")
                }
                // till here BugId 141169
                style={{
                  height: "10px !important",
                  width: "98px",
                  marginTop: "10px",
                  background: "#FFFFFF 0% 0% no-repeat padding-box",
                  border: "1px solid #DADADA",
                  borderRadius: "2px",
                  opacity: "1",
                }}
                value={sortOrder}
                onChange={(e) => {
                  // added on 19/10/23 for BugId 139918
                  setIsEdited(true);
                  setSortOrder(e.target.value);
                }}
                inputProps={{
                  "aria-labelledby": "pmWeb_QueueAssociation_SortOrder",
                  "aria-description": "Kindly Select Sort order",
                }}
              >
                <MenuItem value="A">
                  <em style={{ fontSize: "12px", fontStyle: "normal" }}>
                    {t("ascending")}
                  </em>
                </MenuItem>
                <MenuItem value="D">
                  <em style={{ fontSize: "12px", fontStyle: "normal" }}>
                    {t("descending")}
                  </em>
                </MenuItem>
              </Select>
            </p>
          </div>
        )}
        {/* ------------------------------- */}
        {queueTypeLocal === "wip" ? (
          <>
            <p
              style={{
                color: "#000000",
                fontSize: "12px",
                fontWeight: "700",
                marginTop: "10px",
              }}
            >
              {t("workitemVisibility")}
            </p>
            {/*Modified on 05/10/2023, bug_id:135580*/}
            <FormControl>
              <RadioGroup
                column
                //aria-labelledby="demo-row-radio-buttons-group-label"
                name="row-radio-buttons-group"
                value={filterOption}
                onChange={onWorkItemWipChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (e.key === "Enter") {
                      const child = e.target.querySelector("input");
                      onWorkItemWipChange(RedefineEventTarget(e, child));
                    }
                  }
                }}
              >
                <div id="label1" className="rowRadio">
                  <FormControlLabel
                    value="1"
                    control={
                      <Radio
                        size="small"
                        // modified on 23/01/24 for BugId 141169
                        // disabled={isReadOnly || props.queueType == 0}
                        disabled={
                          isReadOnly ||
                          (+props.queueType === 0 &&
                            props.queueFrom !== "graph")
                        }
                        // till here BugId 141169
                        tabIndex={-1}
                      />
                    }
                    label={
                      <p style={{ fontSize: "12px", height: "1.5rem" }}>
                        {t("showAllWorkitems")}
                      </p>
                    }
                    tabIndex={0}
                    className={`${classes.className} `}
                  />
                </div>
                <div id="label2" className="rowRadio">
                  <FormControlLabel
                    value="2"
                    control={
                      <Radio
                        size="small"
                        // modified on 23/01/24 for BugId 141169
                        // disabled={isReadOnly || props.queueType == 0}
                        disabled={
                          isReadOnly ||
                          (+props.queueType === 0 &&
                            props.queueFrom !== "graph")
                        }
                        // till here BugId 141169
                        inputProps={{
                          "aria-labelledby":
                            "pmWeb_QueueAssociation_ShowWorkItemWithIndexEqual",
                        }}
                        tabIndex={-1}
                      />
                    }
                    label={
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <label
                          style={{
                            fontSize: "12px",
                            height: "1.5rem",
                            flex: "2",
                          }}
                          id="pmWeb_QueueAssociation_ShowWorkItemWithIndexEqual"
                        >
                          {t("showWorkitemBasedOnEqualZindex")}
                        </label>
                      </div>
                    }
                    tabIndex={0}
                    className={`${classes.focusVisible} labelRadio`}
                  />
                  <Select
                    disabled={
                      isReadOnly ||
                      // modified on 23/01/24 for BugId 141169
                      // +props.queueType === 0 ||
                      (+props.queueType === 0 && props.queueFrom !== "graph") ||
                      // till here BugId 141169
                      +filterOption === 3 ||
                      +filterOption === 1
                    }
                    style={{
                      height: "10px !important",
                      width: "98px",
                      marginTop: "10px",
                      background: "#FFFFFF 0% 0% no-repeat padding-box",
                      border: "1px solid #DADADA",
                      borderRadius: "2px",
                      opacity: "1",
                      flex: "1",
                    }}
                    value={filterValue}
                    onChange={(e) => {
                      // added on 19/10/23 for BugId 139918
                      setIsEdited(true);
                      setFilterValue(e.target.value);
                    }}
                    inputProps={{
                      "aria-labelledby":
                        "pmWeb_QueueAssociation_ShowWorkItemWithIndexEqual",
                    }}
                  >
                    {indexOfDropValues?.map((el) => {
                      return (
                        <MenuItem value={el}>
                          <em
                            style={{
                              fontSize: "12px",
                              fontStyle: "normal",
                            }}
                          >
                            {el}
                          </em>
                        </MenuItem>
                      );
                    })}
                  </Select>
                </div>
                <div id="label3" className="rowRadio">
                  <FormControlLabel
                    value="3"
                    control={
                      <Radio
                        size="small"
                        // modified on 23/01/24 for BugId 141169
                        // disabled={isReadOnly || props.queueType == 0}
                        disabled={
                          isReadOnly ||
                          (+props.queueType === 0 &&
                            props.queueFrom !== "graph")
                        }
                        // till here BugId 141169
                        inputProps={{
                          "aria-labelledby":
                            "pmWeb_QueueAssociation_ShowWorkItemWithIndexNotEqual",
                        }}
                        tabIndex={-1}
                      />
                    }
                    label={
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <label
                          style={{
                            fontSize: "12px",
                            height: "1.5rem",
                            flex: "2",
                          }}
                          id="pmWeb_QueueAssociation_ShowWorkItemWithIndexNotEqual"
                        >
                          {t("showWorkitemBasedOnNotEqualZindex")}
                        </label>
                      </div>
                    }
                    tabIndex={0}
                    className={`${classes.focusVisible} labelRadio`}
                  />
                  <Select
                    disabled={
                      isReadOnly ||
                      +props.queueType === 0 ||
                      +filterOption === 2 ||
                      +filterOption === 1
                    }
                    style={{
                      height: "10px !important",
                      width: "98px",
                      marginTop: "10px",
                      background: "#FFFFFF 0% 0% no-repeat padding-box",
                      border: "1px solid #DADADA",
                      borderRadius: "2px",
                      opacity: "1",
                      flex: "1",
                    }}
                    value={filterValueLast}
                    onChange={(e) => {
                      // added on 19/10/23 for BugId 139918
                      setIsEdited(true);
                      setFilterValueLast(e.target.value);
                    }}
                    inputProps={{
                      "aria-labelledby":
                        "pmWeb_QueueAssociation_ShowWorkItemWithIndexNotEqual",
                    }}
                  >
                    {indexOfDropValues.map((el) => {
                      return (
                        <MenuItem value={el}>
                          <em
                            style={{
                              fontSize: "12px",
                              fontStyle: "normal",
                            }}
                          >
                            {el}
                          </em>
                        </MenuItem>
                      );
                    })}
                  </Select>
                </div>
              </RadioGroup>
            </FormControl>
            {/*till here for bug_id:135580*/}
            {/* <FormControl>
              <RadioGroup
                column
                //aria-labelledby="demo-row-radio-buttons-group-label"
                name="row-radio-buttons-group"
                value={filterOption}
                onChange={onWorkItemWipChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (e.key === "Enter") {
                      const child = e.target.querySelector("input");
                      onWorkItemWipChange(RedefineEventTarget(e, child));
                    }
                  }
                }}
              >
                <FormControlLabel
                  value="1"
                  control={
                    <Radio
                      size="small"
                      disabled={isReadOnly || (+props.queueType === 0 && props.queueFrom !== "graph")}
                      tabIndex={-1}
                    />
                  }
                  label={
                    <p style={{ fontSize: "12px", height: "15px" }}>
                      {t("showAllWorkitems")}
                    </p>
                  }
                  tabIndex={0}
                  className={classes.className}
                />
                <FormControlLabel
                  value="2"
                  control={
                    <Radio
                      size="small"
                      disabled={isReadOnly || (+props.queueType === 0 && props.queueFrom !== "graph")}
                      inputProps={{
                        "aria-labelledby":
                          "pmWeb_QueueAssociation_ShowWorkItemWithIndexEqual",
                      }}
                      tabIndex={-1}
                    />
                  }
                  label={
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <label
                        style={{ fontSize: "12px", height: "15px", flex: "2" }}
                        id="pmWeb_QueueAssociation_ShowWorkItemWithIndexEqual"
                      >
                        {t("showWorkitemBasedOnEqualZindex")}
                      </label>
                      <Select
                        disabled={
                          isReadOnly ||
                          (+props.queueType === 0 && props.queueFrom !== "graph") ||
                          filterOption == 3 ||
                          filterOption == 1
                        }
                        style={{
                          height: "10px !important",
                          width: "98px",
                          marginTop: "10px",
                          background: "#FFFFFF 0% 0% no-repeat padding-box",
                          border: "1px solid #DADADA",
                          borderRadius: "2px",
                          opacity: "1",
                          flex: "1",
                        }}
                        value={filterValue}
                        onChange={(e) => setFilterValue(e.target.value)}
                        inputProps={{
                          "aria-labelledby":
                            "pmWeb_QueueAssociation_ShowWorkItemWithIndexEqual",
                        }}
                      >
                        {indexOfDropValues?.map((el) => {
                          return (
                            <MenuItem value={el}>
                              <em
                                style={{
                                  fontSize: "12px",
                                  fontStyle: "normal",
                                }}
                              >
                                {el}
                              </em>
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </div>
                  }
                  tabIndex={0}
                  className={classes.focusVisible}
                />
                <FormControlLabel
                  value="3"
                  control={
                    <Radio
                      size="small"
                      disabled={isReadOnly || (+props.queueType === 0 && props.queueFrom !== "graph")}
                      inputProps={{
                        "aria-labelledby":
                          "pmWeb_QueueAssociation_ShowWorkItemWithIndexNotEqual",
                      }}
                      tabIndex={-1}
                    />
                  }
                  label={
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <label
                        style={{ fontSize: "12px", height: "15px", flex: "2" }}
                        id="pmWeb_QueueAssociation_ShowWorkItemWithIndexNotEqual"
                      >
                        {t("showWorkitemBasedOnEqualZindex")}{" "}
                      </label>
                      <Select
                        disabled={
                          isReadOnly ||
                          (+props.queueType === 0 && props.queueFrom !== "graph") ||
                          filterOption == 2 ||
                          filterOption == 1
                        }
                        style={{
                          height: "10px !important",
                          width: "98px",
                          marginTop: "10px",
                          background: "#FFFFFF 0% 0% no-repeat padding-box",
                          border: "1px solid #DADADA",
                          borderRadius: "2px",
                          opacity: "1",
                          flex: "1",
                        }}
                        value={filterValueLast}
                        onChange={(e) => setFilterValueLast(e.target.value)}
                        inputProps={{
                          "aria-labelledby":
                            "pmWeb_QueueAssociation_ShowWorkItemWithIndexNotEqual",
                        }}
                      >
                        {indexOfDropValues.map((el) => {
                          return (
                            <MenuItem value={el}>
                              <em
                                style={{
                                  fontSize: "12px",
                                  fontStyle: "normal",
                                }}
                              >
                                {el}
                              </em>
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </div>
                  }
                  tabIndex={0}
                  className={classes.focusVisible}
                />
              </RadioGroup>
            </FormControl> */}
          </>
        ) : null}
      </div>
    );
  };

  //Added on 03/10/2023, bug_id:135579
  const queueNameHandler = (e) => {
    setQueueName(e.target.value);
    const isValid = checkRegex(
      e.target.value,
      PMWEB_REGEX.ActionName,
      PMWEB_ARB_REGEX.ActionName
    );
    if (e.target.value?.length === 0) {
      setErrorMsg(true);
    } else if (!isValid) {
      const msg = getIncorrectRegexErrMsg("QueueName", t, `&*|\\:'"<>?/`);
      dispatch(
        setToastDataFunc({
          message: msg,
          severity: "error",
          open: true,
        })
      );
      setErrorMsg(true);
    } else if (e.target.value.length > 62) {
      const msg = getIncorrectLenErrMsg("QueueName", 62, t);
      dispatch(
        setToastDataFunc({
          message: msg,
          severity: "error",
          open: true,
        })
      );
      setErrorMsg(true);
    } else {
      setErrorMsg(false);
      setIsEdited(true);
    }
  };
  //till here for bug_id:135579

  return (
    <div>
      <p
        style={{
          fontSize: "var(--subtitle_text_font_size)",
          fontWeight: "600",
          padding: "0.75rem 1vw",
          borderBottom: "1px solid #c4c4c4",
        }}
      >
        {+props.queueType === 0 ? t("swimlaneQueue") : t("workstepQueue")}
      </p>
      <Tabs
        tabType="processSubTab"
        tabContentStyle="processSubTabContentStyle"
        tabBarStyle="processSubQueueBarStyle"
        oneTabStyle="processSubOneTabStyle"
        tabStyling="processViewTabs"
        TabNames={[`${t("general")}`, `${t("groups")}`]}
        TabElement={[
          <div
            style={{
              backgroundColor: "white",
              display: "flex",
              flexDirection: "column",
              height: "340px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "1rem 1vw 0",
                paddingInlineEnd: "2vw",
              }}
            >
              <label
                style={{ fontSize: "12px", color: "#606060" }}
                htmlFor="pmWeb_QueueAssociation_QueueName_Input"
              >
                {t("QueueName")}
                <span className="starIcon">*</span>
              </label>
              {/*code updated on 15 September 2022 for BugId 112903*/}
              <input
                id="pmWeb_QueueAssociation_QueueName_Input"
                // modified on 23/01/24 for BugId 141169
                // disabled={isReadOnly || props.queueType == 0}
                disabled={
                  isReadOnly ||
                  (+props.queueType === 0 && props.queueFrom !== "graph")
                }
                // till here BugId 141169
                value={queueName}
                style={{
                  width: "72%",
                  height: "var(--line_height)",
                  border: "1px solid #DADADA",
                }}
                onChange={queueNameHandler} //Modified on 03/10/2023, bug_id:135579
                // onChange={(e)=>{setQueueName(e.target.value);}}
                ref={queueNameRef}
                onKeyPress={
                  (e) => FieldValidations(e, 150, queueNameRef.current, 62) //Modified on 12/10/2023, bug_id:135579
                }
              />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "1rem 1vw 0",
                paddingInlineEnd: "2vw",
              }}
            >
              <label
                style={{ fontSize: "12px", color: "#606060" }}
                htmlFor="pmWeb_QueueAssociation_Description_Input"
              >
                {t("description")}
                <span className="starIcon">*</span>
              </label>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  width: "72%",
                }}
              >
                <textarea
                  id="pmWeb_QueueAssociation_Description_Input"
                  // modified on 23/01/24 for BugId 141169
                  // disabled={isReadOnly || props.queueType == 0}
                  disabled={
                    isReadOnly ||
                    (+props.queueType === 0 && props.queueFrom !== "graph")
                  }
                  // till here BugId 141169
                  onChange={(e) => {
                    // added on 30-10-2023 for bug_id: 139917
                    validateData(e, t("description"));
                    setQueueDesc(e.target.value);
                    setIsEdited(true);
                  }}
                  // added on 30-10-2023 for bug_id: 139917
                  ref={descriptionRef}
                  onKeyPress={(e) => {
                    FieldValidations(e, 7, descriptionRef.current, 256);
                  }}
                  // till here for bug_id:139917
                  direction={direction === RTL_DIRECTION ? "rtl" : "ltr"}
                  // modified on 25/10/23 for BugId 139392
                  /* CODE added for bug id 136517
                  value={decode_utf8(queueDesc)} */
                  value={queueDesc}
                  style={{
                    width: "100%",
                    height: "87px",
                    border: "1px solid #DADADA",
                  }}
                />
                {errorMsg ? (
                  <p
                    style={{
                      color: "red",
                      fontSize: "12px",
                      fontWeight: "500",
                      marginInline: "10px",
                    }}
                  >
                    {errorMsg}
                  </p>
                ) : null}
              </div>
            </div>
            {(+props.cellActivityType === 1 &&
              +props.cellActivitySubType === 1) ||
            (+props.cellActivityType === 27 &&
              +props.cellActivitySubType === 1) ||
            (+props.cellActivityType === 19 &&
              +props.cellActivitySubType === 1) ||
            (+props.cellActivityType === 21 &&
              +props.cellActivitySubType === 1) ||
            (+props.cellActivityType === 4 &&
              +props.cellActivitySubType === 1) ||
            (+props.cellActivityType === 33 &&
              +props.cellActivitySubType === 1) ? null : (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "start",
                  padding: "1rem 1vw 0",
                  paddingInlineEnd: "2vw",
                }}
              >
                <p
                  style={{
                    fontSize: "12px",
                    color: "#606060",
                    marginTop: "3px",
                  }}
                >
                  {t("queueType")}
                </p>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    width: "72%",
                  }}
                >
                  <FormControl>
                    <RadioGroup
                      row
                      //aria-labelledby="demo-row-radio-buttons-group-label"
                      name="row-radio-buttons-group"
                      value={queueTypeLocal}
                      // modified on 14/10/23 for BugId 139393
                      // onChange={(e) => setQueueTypeLocal(e.target.value)}
                      onChange={(e) => {
                        let val = e.target.value;
                        setQueueTypeLocal(val);
                        setIsEdited(true);
                        if (val === "wip") {
                          setWipAssignmentType("N");
                          setFilterOption("1");
                        } else if (val === "fifo") {
                          setOrderByNumber("2");
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const child = e.target.querySelector("input");
                          // modified on 14/10/23 for BugId 139393
                          // setQueueTypeLocal(
                          //   RedefineEventTarget(e, child).target.value
                          // );
                          let val = RedefineEventTarget(e, child).target.value;
                          setQueueTypeLocal(val);
                          if (val === "wip") {
                            setWipAssignmentType("N");
                            setFilterOption("1");
                          } else if (val === "fifo") {
                            setOrderByNumber("2");
                          }
                        }
                      }}
                    >
                      <FormControlLabel
                        aria-label="fifo"
                        value="fifo"
                        control={
                          <Radio
                            size="small"
                            disabled={
                              +props.queueType === 0 &&
                              props.queueFrom !== "graph"
                            }
                            tabIndex={-1}
                          />
                        }
                        label={<p style={{ fontSize: "12px" }}>{t("fifo")}</p>}
                        tabIndex={0}
                        className={classes.focusVisible}
                      />
                      <FormControlLabel
                        aria-label="wip"
                        value="wip"
                        control={
                          <Radio
                            size="small"
                            disabled={
                              +props.queueType === 0 &&
                              props.queueFrom !== "graph"
                            }
                            tabIndex={-1}
                          />
                        }
                        label={<p style={{ fontSize: "12px" }}>{t("wip")}</p>}
                        tabIndex={0}
                        className={classes.focusVisible}
                      />
                    </RadioGroup>
                  </FormControl>
                  {showFetchingOrder()}
                </div>
              </div>
            )}
          </div>,
          <div
            style={{
              backgroundColor: "white",
              padding: "0.5rem 0.5vw",
              height: "340px",
            }}
          >
            <p
              style={{ color: "black", display: "flex" }}
              aria-label="GroupTabs"
            >
              {+props.queueType === 0 && props.queueFrom !== "graph" ? (
                <div style={{ width: "60%" }}>
                  <GroupsTab
                    tableType="remove"
                    query={query}
                    setQuery={setQuery}
                    tableContent={addedVariableList}
                    singleEntityClickFunc={removeOneVariable}
                    headerEntityClickFunc={removeAllVariable}
                    id="trigger_de_removeDiv"
                    deSelectedVarList={variableList} //Modified on 06/10/2023, bug_id:135581
                    queueType={props.queueType}
                    queueFrom={props.queueFrom}
                  />
                </div>
              ) : (
                <>
                  <GroupsTab
                    tableType="add"
                    id="trigger_de_addDiv"
                    tableContent={variableList}
                    singleEntityClickFunc={addOneVariable}
                    headerEntityClickFunc={addAllVariable}
                    query={query}
                    setQuery={setQuery}
                    selectedGroupLength={
                      addedVariableList ? addedVariableList.length : 0
                    }
                    addedVarList={addedVariableList} //Modified on 06/10/2023, bug_id:135581
                    setVariableList={setVariableList} //Modified on 06/10/2023, bug_id:135581
                    queueType={props.queueType}
                    queueFrom={props.queueFrom}
                  />
                  <GroupsTab
                    tableType="remove"
                    query={query}
                    setQuery={setQuery}
                    tableContent={addedVariableList}
                    singleEntityClickFunc={removeOneVariable}
                    headerEntityClickFunc={removeAllVariable}
                    id="trigger_de_removeDiv"
                    deSelectedVarList={variableList} //Modified on 06/10/2023, bug_id:135581
                    queueType={props.queueType}
                    queueFrom={props.queueFrom}
                  />
                </>
              )}
            </p>
          </div>,
        ]}
      />
      <div className="buttonsAddToDo_Queue">
        <Button
          variant="outlined"
          onClick={() => props.setShowQueueModal(false)}
          id="pmweb_queueAssoc_cancelBtn"
        >
          {t("cancel")}
        </Button>
        {
          // modified on 23/01/24 for BugId 141169
          // +props.queueType === 0
          +props.queueType === 0 && props.queueFrom !== "graph" ? null : ( // till here BugId 141169
            <Button
              id="pmweb_queueAssoc_saveBtn"
              variant="contained"
              color="primary"
              disabled={isReadOnly ? isReadOnly : isEdited ? errorMsg : true}
              onClick={
                // modified on 23/01/24 for BugId 141169
                // props.selfQueueCreated
                props.selfQueueCreated ||
                (+props.queueType === 0 && props.queueFrom === "graph")
                // till here BugId 141169
                  ? associateQueueHandler
                  : createQueueHandler
              }
            >
              {t("save")}
            </Button>
          )
        }
      </div>
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    cellQueueId: state.selectedCellReducer.selectedQueueId,
    showDrawer: state.showDrawerReducer.showDrawer,
    cellID: state.selectedCellReducer.selectedId,
    cellName: state.selectedCellReducer.selectedName,
    cellType: state.selectedCellReducer.selectedType,
    cellActivityType: state.selectedCellReducer.selectedActivityType,
    cellActivitySubType: state.selectedCellReducer.selectedActivitySubType,
    isDrawerExpanded: state.isDrawerExpanded.isDrawerExpanded,
    openTemplateFlag: state.openTemplateReducer.openFlag,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    selectedCell: (
      id,
      name,
      activityType,
      activitySubType,
      seqId,
      queueId,
      type,
      checkedOut,
      laneId
    ) =>
      dispatch(
        actionCreators_selection.selectedCell(
          id,
          name,
          activityType,
          activitySubType,
          seqId,
          queueId,
          type,
          checkedOut,
          laneId
        )
      ),
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(QueueAssociation);
