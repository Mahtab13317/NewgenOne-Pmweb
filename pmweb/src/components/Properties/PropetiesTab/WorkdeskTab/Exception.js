// #BugID - 109977
// #BugDescription - validation for exception dulicate name has been added.
// #BugID - 119966
// #BugDescription - Disabling issue has been handled after deassociation the exception.
// #BugID - 119983
// #BugDescription - Respond and Clear in start event disbaled now.
// #BugID - 119983
// #BugDescription - Respond and Clear in start event disbaled now.
// #BugID - 122318
// #BugDescription - Design issue fixed for workdesk exception.

import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import styles from "./todo.module.css";
import {
  Select,
  MenuItem,
  Checkbox,
  Grid,
  FormControlLabel,
} from "@material-ui/core";
import { store, useGlobalState } from "state-pool";
import AddException from "../../../ViewingArea/Tools/Exception/AddExceptions";
import Modal from "@material-ui/core/Modal";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "react-redux";
import {
  ENDPOINT_ADD_EXCEPTION,
  PROCESSTYPE_DEPLOYED,
  PROCESSTYPE_REGISTERED,
  propertiesLabel,
  RTL_DIRECTION,
  SERVER_URL,
} from "../../../../Constants/appConstants";
import { setActivityPropertyChange } from "../../../../redux-store/slices/ActivityPropertyChangeSlice";
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
import CustomizedDropdown from "../../../../UI/Components_With_ErrrorHandling/Dropdown";
import FormGroup from "@material-ui/core/FormGroup/FormGroup";

function Exception(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const dispatch = useDispatch();
  const loadedActivityPropertyData = store.getState("activityPropertyData");
  const [localLoadedActivityPropertyData, setlocalLoadedActivityPropertyData] =
    useGlobalState(loadedActivityPropertyData);
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const [checkException, setCheckException] = useState(false);
  const [allExpData, setAllExpData] = useState([]);
  const [exceptionItemData, setExceptionItemData] = useState({});
  const [viewCheckbox, setViewCheckbox] = useState(false);
  const [raiseCheckbox, setRaiseCheckbox] = useState(false);
  const [respondCheckbox, setRespondCheckbox] = useState(false);
  const [clearCheckbox, setClearCheckbox] = useState(false);
  const [raiseName, setRaiseName] = useState("");
  const [respondName, setRespondName] = useState("");
  const [clearName, setClearName] = useState("");
  const [description, setDescription] = useState("");
  const [expectionListVal, setExpectionListVal] = useState("");
  const [selectedExpItem, setSelectedExpItem] = useState(null);
  const [addExpection, setaddException] = useState(false);
  const [editableField, setEditableField] = useState(true);
  const [triggerList, setTriggerList] = useState([]);
  const [expData, setExpData] = useState({
    ExceptionGroups: [],
  });
  const openProcessData = useSelector(OpenProcessSliceValue);
  const [addAnotherExp, setAddAnotherExp] = useState(false);
  const [localState, setLocalState] = useState(null);
  const exceptionRef = useRef();
  const viewRef = useRef();
  const raiseRef = useRef();
  const respondRef = useRef();
  const clearRef = useRef();
  let isReadOnly =
    props.isReadOnly ||
    isReadOnlyFunc(
      localLoadedProcessData,
      props.cellCheckedOut,
      props.cellLaneId
    );

  const DisableRaise = [
    { activityType: 2, subActivity: 1 },
    { activityType: 3, subActivity: 1 },
    { activityType: 2, subActivity: 2 },
    { activityType: 11, subActivity: 1 },
  ];

  const DisableRespond = [
    { activityType: 2, subActivity: 1 },
    { activityType: 3, subActivity: 1 },
    { activityType: 2, subActivity: 2 },
    { activityType: 11, subActivity: 1 },
    { activityType: 1, subActivity: 1 },
    { activityType: 1, subActivity: 3 },
  ];

  const DisableClear = [
    { activityType: 2, subActivity: 1 },
    { activityType: 3, subActivity: 1 },
    { activityType: 2, subActivity: 2 },
    { activityType: 11, subActivity: 1 },
    { activityType: 1, subActivity: 1 },
    { activityType: 1, subActivity: 3 },
  ];

  const DisableCheckBox = (activity, props) => {
    let temp = false;
    activity.forEach((act) => {
      if (
        act.activityType === props.actType &&
        act.subActivity === props.actSubType
      ) {
        if (props?.hasOwnProperty("toDoIsMandatory")) {
          if (props?.toDoIsMandatory === false) {
            temp = false;
          } else temp = true;
        } else temp = true;
      }
    });

    return temp;
  };

  useEffect(() => {
    let tempList = {
      ...localLoadedActivityPropertyData?.ActivityProperty?.wdeskInfo
        ?.objPMWdeskExceptions?.exceptionMap,
    };
    Object.keys(tempList)?.forEach((el) => {
      tempList[el] = { ...tempList[el], editable: false };
    });
    setExceptionItemData(tempList);
    setCheckException(
      localLoadedActivityPropertyData?.ActivityProperty?.wdeskInfo
        ?.objPMWdeskExceptions?.m_bShowExceptions
    );
  }, [localLoadedActivityPropertyData]);

  useEffect(() => {
    let activityIdString = "";
    openProcessData.loadedData?.MileStones?.forEach((mileStone) => {
      mileStone.Activities?.forEach((activity) => {
        activityIdString = activityIdString + activity.ActivityId + ",";
      });
    });
    setAllExpData(openProcessData.loadedData?.ExceptionList);
    setLocalState(openProcessData.loadedData);
    // code edited on 16 May 2023 for BugId 127715
    if (openProcessData.loadedData?.ProcessDefId) {
      axios
        .get(
          SERVER_URL +
            `/exception/${openProcessData.loadedData?.ProcessDefId}/${openProcessData.loadedData?.ProcessType}/${openProcessData.loadedData?.ProcessName}/${activityIdString}`
        )
        .then((res) => {
          if (res.status === 200) {
            let newState = { ...res.data };
            setExpData(newState);
            setTriggerList(newState.Trigger);
          }
        });
    }
  }, [openProcessData.loadedData]);

  /*****************************************************************************************
   * @author asloob_ali BUG ID : 114885  Exception: description of the associated Exception in activity is not displayed
   * Reason: property name key mismatched.
   *  Resolution :updated key correctly.
   *  Date : 05/10/2022             **************/

  const CheckExceptionHandler = (e) => {
    /*  let val;
    setCheckException((prev) => {
      val = !prev;
      return !prev;
    }); */
    let temp = { ...localLoadedActivityPropertyData };
    if (temp?.ActivityProperty?.wdeskInfo) {
      if (temp?.ActivityProperty?.wdeskInfo?.objPMWdeskExceptions) {
        let valTemp =
          temp?.ActivityProperty?.wdeskInfo?.objPMWdeskExceptions
            ?.m_bShowExceptions;
        if (valTemp === false || valTemp === true) {
          temp.ActivityProperty.wdeskInfo.objPMWdeskExceptions.m_bShowExceptions =
            e.target.checked;
        } else {
          temp.ActivityProperty.wdeskInfo.objPMWdeskExceptions = {
            ...temp.ActivityProperty.wdeskInfo.objPMWdeskExceptions,
            m_bShowExceptions: e.target.checked,
          };
        }
      } else {
        temp.ActivityProperty.wdeskInfo = {
          ...temp.ActivityProperty.wdeskInfo,
          objPMWdeskExceptions: {
            m_bShowExceptions: e.target.checked,
          },
        };
      }
    } else {
      temp.ActivityProperty = {
        ...temp.ActivityProperty,
        wdeskInfo: {
          objPMWdeskExceptions: {
            m_bShowExceptions: e.target.checked,
          },
        },
      };
    }

    setCheckException(e.target.checked);
    setlocalLoadedActivityPropertyData(temp);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.workdesk]: { isModified: true, hasError: false },
      })
    );
  };

  const definedExpHandler = (e) => {
    setExpectionListVal(e.target.value);
    setEditableField(true);

    let alreadyPresent = exceptionItemData[e.target.value] ? true : false;
    if (alreadyPresent) {
      exceptionItemHandler(e.target.value);
    } else {
      let selectedExp = null;
      expData?.ExceptionGroups?.forEach((group) => {
        group?.ExceptionList?.forEach((val) => {
          if (val.ExceptionName === e.target.value) {
            selectedExp = val;
          }
        });
      });
      if (selectedExp) {
        setDescription(selectedExp.Description);
        let selectedAct = null;
        selectedExp?.Activities?.forEach((act) => {
          if (
            +act.ActivityId ===
            +localLoadedActivityPropertyData?.ActivityProperty?.actId
          ) {
            selectedAct = act;
          }
        });
        if (selectedAct) {
          setViewCheckbox(selectedAct.View);
          setRaiseCheckbox(selectedAct.Raise);
          setRespondCheckbox(selectedAct.Respond);
          setClearCheckbox(selectedAct.Clear);
          setRaiseName("");
          setRespondName("");
          setClearName("");
        }
      } else {
        setDescription("");
        setViewCheckbox(false);
        setRaiseCheckbox(false);
        setRespondCheckbox(false);
        setClearCheckbox(false);
        setEditableField(false);
        setRaiseName("");
        setRespondName("");
        setClearName("");
      }
      setSelectedExpItem(null);
    }
  };

  const descHandler = (e) => {
    setDescription(e.target.value);
  };

  const addHandler = () => {
    let alreadyPresent = exceptionItemData[expectionListVal] ? true : false;
    if (!alreadyPresent || alreadyPresent === undefined) {
      if (viewCheckbox) {
        let selected = null;
        setExceptionItemData((prev) => {
          let temp = { ...prev };
          expData?.ExceptionGroups?.forEach((group) => {
            group?.ExceptionList?.forEach((val) => {
              if (val.ExceptionName === expectionListVal) {
                selected = val;
              }
            });
          });
          if (selected) {
            temp = {
              ...temp,
              [expectionListVal]: {
                editable: true,
                expTypeInfo: {
                  expTypeDesc: selected.Description,
                  expTypeId: selected.ExceptionId,
                  expTypeName: selected.ExceptionName,
                },
                vTrigFlag: viewCheckbox,
                vrTrigFlag: raiseCheckbox,
                vrTrigName: raiseName,
                vcTrigFlag: clearCheckbox,
                vcTrigName: clearName,
                vaTrigFlag: respondCheckbox,
                vaTrigName: respondName,
              },
            };
          }
          return temp;
        });
        let tempData = { ...localLoadedActivityPropertyData };
        let tempdataLocal = tempData?.ActivityProperty?.wdeskInfo
          ?.objPMWdeskExceptions
          ? { ...tempData.ActivityProperty.wdeskInfo.objPMWdeskExceptions }
          : {};
        if (tempdataLocal?.exceptionMap) {
          tempData.ActivityProperty.wdeskInfo.objPMWdeskExceptions.exceptionMap =
            {
              ...tempdataLocal?.exceptionMap,
              [expectionListVal]: {
                expTypeInfo: {
                  expTypeDesc: selected.Description,
                  expTypeId: selected.ExceptionId,
                  expTypeName: selected.ExceptionName,
                },
                vTrigFlag: viewCheckbox,
                vrTrigFlag: raiseCheckbox,
                vrTrigName: raiseName,
                vcTrigFlag: clearCheckbox,
                vcTrigName: clearName,
                vaTrigFlag: respondCheckbox,
                vaTrigName: respondName,
              },
            };
        } else {
          tempData.ActivityProperty.wdeskInfo.objPMWdeskExceptions = {
            ...tempData.ActivityProperty.wdeskInfo.objPMWdeskExceptions,
            exceptionMap: {
              [expectionListVal]: {
                expTypeInfo: {
                  expTypeDesc: selected.Description,
                  expTypeId: selected.ExceptionId,
                  expTypeName: selected.ExceptionName,
                },
                vTrigFlag: viewCheckbox,
                vrTrigFlag: raiseCheckbox,
                vrTrigName: raiseName,
                vcTrigFlag: clearCheckbox,
                vcTrigName: clearName,
                vaTrigFlag: respondCheckbox,
                vaTrigName: respondName,
              },
            },
          };
        }
        // code added on 3 Aug 2023 for BugId 127487 - Regression :- form not showing in Task rights.
        if (tempData?.ActivityProperty?.wdeskInfo?.objPMWdeskTasks?.taskMap) {
          Object.values(
            tempData?.ActivityProperty?.wdeskInfo?.objPMWdeskTasks?.taskMap
          )?.forEach((task) => {
            if (task.m_arrExceptionInfo) {
              tempData.ActivityProperty.wdeskInfo.objPMWdeskTasks.taskMap[
                task.taskTypeInfo.taskName
              ].m_arrExceptionInfo = [
                ...task.m_arrExceptionInfo,
                {
                  vTaskTrigFlag: viewCheckbox, //view
                  vrTaskTrigFlag: raiseCheckbox, //raise
                  vaTaskTrigFlag: respondCheckbox, //respond
                  vcTaskTrigFlag: clearCheckbox, //clear
                  expTypeInfo: {
                    expTypeName: selected.ExceptionName,
                    expTypeId: selected.ExceptionId,
                  },
                },
              ];
            } else {
              tempData.ActivityProperty.wdeskInfo.objPMWdeskTasks.taskMap[
                task.taskTypeInfo.taskName
              ] = {
                ...task,
                m_arrExceptionInfo: [
                  ...task.m_arrExceptionInfo,
                  {
                    vTaskTrigFlag: viewCheckbox, //view
                    vrTaskTrigFlag: raiseCheckbox, //raise
                    vaTaskTrigFlag: respondCheckbox, //respond
                    vcTaskTrigFlag: clearCheckbox, //clear
                    expTypeInfo: {
                      expTypeName: selected.ExceptionName,
                      expTypeId: selected.ExceptionId,
                    },
                  },
                ],
              };
            }
          });
        }
        setlocalLoadedActivityPropertyData(tempData);
        // code added on 19 Jan 2023 for BugId 122670
        setDescription("");
        setViewCheckbox(false);
        setRaiseCheckbox(false);
        setRespondCheckbox(false);
        setClearCheckbox(false);
        setEditableField(false);
        setRaiseName("");
        setRespondName("");
        setClearName("");
        dispatch(
          setActivityPropertyChange({
            [propertiesLabel.workdesk]: { isModified: true, hasError: false },
          })
        );
      } else {
        dispatch(
          setToastDataFunc({
            message: t("associateRightsErr"),
            severity: "error",
            open: true,
          })
        );
      }
    } else {
      dispatch(
        setToastDataFunc({
          message: t("SelectedExpAlreadyAssociated"),
          severity: "error",
          open: true,
        })
      );
    }
  };

  const deleteHandler = () => {
    setExpectionListVal("");
    let temp = {};
    Object.keys(exceptionItemData).forEach((el) => {
      if (el != selectedExpItem) {
        temp = { ...temp, [el]: exceptionItemData[el] };
      }
    });
    setExceptionItemData(temp);
    setDescription("");
    setViewCheckbox(false);
    setRaiseCheckbox(false);
    setRespondCheckbox(false);
    setClearCheckbox(false);
    setEditableField(false);
    setRaiseName("");
    setRespondName("");
    setClearName("");
    let tempData = { ...localLoadedActivityPropertyData };
    let tempdataLocal =
      tempData?.ActivityProperty?.wdeskInfo?.objPMWdeskExceptions?.exceptionMap;
    let td = {},
      taskTd = [];
    Object.keys(tempdataLocal)?.forEach((el) => {
      if (el != selectedExpItem) {
        td = { ...td, [el]: tempdataLocal[el] };
        // code added on 3 Aug 2023 for BugId 127487 - Regression :- form not showing in Task rights.
        let exc = tempdataLocal[el];
        taskTd = [
          ...taskTd,
          {
            vTaskTrigFlag: exc.vTrigFlag, //view
            vrTaskTrigFlag: exc.vrTrigFlag, //raise
            vaTaskTrigFlag: exc.vaTrigFlag, //respond
            vcTaskTrigFlag: exc.vcTrigFlag, //clear
            expTypeInfo: {
              expTypeName: exc.expTypeInfo.expTypeName,
              expTypeId: exc.expTypeInfo.expTypeId,
            },
          },
        ];
      }
    });
    tempData.ActivityProperty.wdeskInfo.objPMWdeskExceptions.exceptionMap = {
      ...td,
    };
    // code added on 3 Aug 2023 for BugId 127487 - Regression :- form not showing in Task rights.
    if (tempData?.ActivityProperty?.wdeskInfo?.objPMWdeskTasks?.taskMap) {
      Object.values(
        tempData?.ActivityProperty?.wdeskInfo?.objPMWdeskTasks?.taskMap
      )?.forEach((task) => {
        if (task.m_arrExceptionInfo) {
          tempData.ActivityProperty.wdeskInfo.objPMWdeskTasks.taskMap[
            task.taskTypeInfo.taskName
          ].m_arrExceptionInfo = [...taskTd];
        }
      });
    }
    setlocalLoadedActivityPropertyData(tempData);
    setSelectedExpItem(null);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.workdesk]: { isModified: true, hasError: false },
      })
    );
  };

  const defineHandler = () => {
    setaddException(true);
  };

  const exceptionItemHandler = (val) => {
    setSelectedExpItem(val);
    setEditableField(false);
    setDescription(exceptionItemData[val].expTypeInfo.expTypeDesc);
    setViewCheckbox(exceptionItemData[val].vTrigFlag);
    setClearCheckbox(exceptionItemData[val].vcTrigFlag);
    setRespondCheckbox(exceptionItemData[val].vaTrigFlag);
    setRaiseCheckbox(exceptionItemData[val].vrTrigFlag);
    setRaiseName(exceptionItemData[val].vrTrigName);
    setRespondName(exceptionItemData[val].vaTrigName);
    setClearName(exceptionItemData[val].vcTrigName);
  };

  const addExceptionToList = (
    ExceptionToAdd,
    button_type,
    groupId, // code edited on 7 Sep 2022 for BugId 114884
    ExceptionDesc
  ) => {
    let exist = false;
    expData?.ExceptionGroups.map((group) => {
      group.ExceptionList.map((exception) => {
        if (
          exception.ExceptionName.trim().toLowerCase() ===
          ExceptionToAdd.trim().toLowerCase()
        ) {
          exist = true;
        }
      });
    });
    if (exist) {
      dispatch(
        setToastDataFunc({
          message: t("excepAlreadyExists"),
          severity: "error",
          open: true,
        })
      );
      return;
    } else {
      // code edited on 7 Sep 2022 for BugId 114884
      if (
        ExceptionToAdd?.trim() !== "" &&
        groupId &&
        ExceptionDesc?.trim() !== ""
      ) {
        let maxExceptionId = 0;
        expData.ExceptionGroups.map((group) => {
          group.ExceptionList.map((listElem) => {
            if (+listElem.ExceptionId > +maxExceptionId) {
              maxExceptionId = +listElem.ExceptionId;
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
            if (res.data.Status == 0) {
              let temp = JSON.parse(JSON.stringify(localState));
              temp.ExceptionList.push({
                Description: ExceptionDesc,
                ExceptionId: +maxExceptionId + 1,
                ExceptionName: ExceptionToAdd,
              });
              dispatch(setOpenProcess({ loadedData: temp }));
              let tempData = { ...expData };
              tempData.ExceptionGroups.map((group) => {
                if (group.GroupId == groupId) {
                  group.ExceptionList.push({
                    ExceptionId: maxExceptionId + 1,
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
              if (button_type !== "addAnother") {
                setaddException(false);
                setAddAnotherExp(false);
              } else if (button_type === "addAnother") {
                setAddAnotherExp(true);
              }
            }
          });
      }
      // code edited on 7 Sep 2022 for BugId 114884
      else if (
        ExceptionToAdd?.trim() === "" ||
        !groupId ||
        ExceptionDesc?.trim() === ""
      ) {
        dispatch(
          setToastDataFunc({
            message: t("mandatoryErr"),
            severity: "error",
            open: true,
          })
        );
        setAddAnotherExp(false);
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
                label={<div>{t("EXCEPTION")}</div>}
                control={
                  <Checkbox
                    checked={checkException}
                    onChange={CheckExceptionHandler}
                    className={styles.mainCheckbox}
                    data-testid="CheckExp"
                    disabled={isReadOnly}
                    inputProps={{
                      "aria-label": "Exception",
                    }}
                    type="checkbox"
                    id="pmweb_workdesk_exception_checkbox"
                    inputRef={exceptionRef}
                    onKeyUp={(e) => {
                      if (e.key === "Enter") {
                        exceptionRef.current.click();
                        e.stopPropagation();
                      }
                    }}
                  />
                }
              />
            </FormGroup>
          </div>
          <div
            className="row"
            // style={{ alignItems: "end" }}
          >
            <Grid container xs={12} spacing={1} justifyContent="space-between">
              <Grid item xs={6}>
                <div>
                  <p className={styles.description}>{t("EXCEPTION")}</p>
                  <CustomizedDropdown
                    // MenuProps={{
                    //   anchorOrigin: {
                    //     vertical: "bottom",
                    //     horizontal: "left",
                    //   },
                    //   transformOrigin: {
                    //     vertical: "top",
                    //     horizontal: "left",
                    //   },
                    //   getContentAnchorEl: null,
                    // }}
                    id="pmweb_workdesk_exception_Dropdown"
                    ariaLabel="Exception"
                    className={styles.todoSelect}
                    disabled={!checkException || isReadOnly}
                    value={expectionListVal}
                    onChange={(e) => definedExpHandler(e)}
                  >
                    {/* code updated on 30 Dec 2022 for BugId  116708 */}
                    <MenuItem
                      className={styles.menuItemStyles}
                      value={""}
                      style={{
                        direction: direction === RTL_DIRECTION ? "rtl" : "ltr",
                      }}
                    >
                      {"Please define Exception"}
                    </MenuItem>
                    {allExpData?.map((val) => {
                      return (
                        <MenuItem
                          style={{
                            direction:
                              direction === RTL_DIRECTION ? "rtl" : "ltr",
                          }}
                          className={styles.menuItemStyles}
                          key={val.ExceptionName}
                          value={val.ExceptionName}
                        >
                          {val.ExceptionName}
                        </MenuItem>
                      );
                    })}
                  </CustomizedDropdown>
                </div>
              </Grid>
              {/* <div style={{ flex: "1", marginLeft: "2rem" }}> */}
              <Grid item xs={6}>
                <div style={{ marginTop: "1rem" }}>
                  <Grid
                    container
                    xs={12}
                    spacing={1}
                    justifyContent="space-between"
                  >
                    <Grid item xs={6}>
                      <button
                        disabled={
                          !checkException ||
                          (checkException && expectionListVal.trim() === "") ||
                          (checkException && selectedExpItem) ||
                          isReadOnly
                        }
                        style={{ width: "100%" }}
                        className={
                          !checkException ||
                          (checkException && expectionListVal.trim() === "") ||
                          (checkException && selectedExpItem) ||
                          isReadOnly
                            ? styles.disabledBtn
                            : styles.addBtn
                        }
                        onClick={addHandler}
                        id="pmweb_workdesk_exception_associateBtn"
                        data-testid="associateBtn"
                      >
                        {t("associate")}
                      </button>
                    </Grid>
                    <Grid item xs={6}>
                      <button
                        disabled={
                          isReadOnly ||
                          !checkException ||
                          props.openProcessType === PROCESSTYPE_DEPLOYED ||
                          props.openProcessType === PROCESSTYPE_REGISTERED
                        }
                        style={{ width: "100%" }}
                        className={
                          isReadOnly ||
                          !checkException ||
                          props.openProcessType === PROCESSTYPE_DEPLOYED ||
                          props.openProcessType === PROCESSTYPE_REGISTERED
                            ? styles.disabledBtn
                            : styles.addBtn
                        }
                        onClick={defineHandler}
                        data-testid="defineBtn"
                        id="pmweb_workdesk_exception_defineBtn"
                      >
                        {t("Define")}
                      </button>
                    </Grid>
                  </Grid>
                </div>
              </Grid>
            </Grid>
          </div>
          <p className={styles.todoItem}>{t("associatedExp")}</p>
          <div className={styles.todoTextarea} style={{ minHeight: "2rem" }}>
            <ul>
              {Object.keys(exceptionItemData)?.map((val, index) => {
                return (
                  <li
                    onClick={() => exceptionItemHandler(val)}
                    id={`pmweb_workdesk_exception_associateExp_${index}`}
                    tabIndex={0}
                    onKeyUp={(e) => {
                      if (e.key === "Enter") {
                        exceptionItemHandler(val);
                        e.stopPropagation();
                      }
                    }}
                    className={
                      selectedExpItem == val
                        ? styles.selectedTodo
                        : styles.todoListItem
                    }
                    disabled={isReadOnly}
                  >
                    {val}
                  </li>
                );
              })}
            </ul>
          </div>
          <div className={styles.deassociateDiv}>
            <button
              disabled={
                !checkException ||
                (checkException && !selectedExpItem) ||
                isReadOnly
              }
              className={
                !checkException ||
                (checkException && !selectedExpItem) ||
                isReadOnly
                  ? styles.disabledBtn
                  : styles.deleteBtn
              }
              onClick={deleteHandler}
              id="pmweb_workdesk_exception_deAssociateBtn"
              data-testid="deAssociateBtn"
            >
              {t("deassociate")}
            </button>
          </div>
        </div>
        <div
          // style={{ width: "50%" }}
          style={{ width: props.isDrawerExpanded ? "50%" : "100%" }}
        >
          <p className={styles.todoItemDetails}>{t("exceptionDetail")}</p>
          <p className={styles.description}>{t("description")}</p>
          <textarea
            aria-label="description"
            className={styles.descriptionTextarea}
            id="pmweb_workdesk_exception_descriptionTextBox"
            onChange={(e) => descHandler(e)}
            disabled={true}
            value={decode_utf8(description)}
          />
          <div className="row expCheckList" style={{ width: "96%" }}>
            <FormGroup>
              <FormControlLabel
                label={
                  <span className={styles.checkboxLabel}>
                    {t("view")}
                    <span className={styles.starIcon}>*</span>
                  </span>
                }
                control={
                  <Checkbox
                    checked={viewCheckbox}
                    id="pmweb_workdesk_exception_view_checkBox"
                    onChange={(e) => {
                      setViewCheckbox(e.target.checked);
                    }}
                    inputRef={viewRef}
                    onKeyUp={(e) => {
                      if (e.key === "Enter") {
                        viewRef.current.click();
                        e.stopPropagation();
                      }
                    }}
                    className={styles.mainCheckbox}
                    disabled={
                      isReadOnly ||
                      !checkException ||
                      (checkException &&
                        expectionListVal.trim() === "" &&
                        editableField) ||
                      (checkException && !editableField)
                    }
                  />
                }
              />
            </FormGroup>
          </div>
          <div className="row expCheckList" style={{ width: "96%" }}>
            <div
              style={{
                // flex: "1"
                width: "30%",
              }}
            >
              <FormGroup>
                <FormControlLabel
                  label={
                    <span className={styles.checkboxLabel}>{t("raise")}</span>
                  }
                  control={
                    <Checkbox
                      checked={raiseCheckbox}
                      onChange={(e) => setRaiseCheckbox(e.target.checked)}
                      inputRef={raiseRef}
                      onKeyUp={(e) => {
                        if (e.key === "Enter") {
                          raiseRef.current.click();
                          e.stopPropagation();
                        }
                      }}
                      id="pmweb_workdesk_exception_raise_checkBox"
                      className={styles.mainCheckbox}
                      disabled={
                        isReadOnly ||
                        !checkException ||
                        (checkException && !viewCheckbox && editableField) ||
                        (checkException && !editableField) ||
                        DisableCheckBox(
                          DisableRaise,
                          localLoadedActivityPropertyData.ActivityProperty
                        )
                      }
                    />
                  }
                />
              </FormGroup>
            </div>
            <div
              style={{
                // flex: "2"
                width: "70%",
              }}
            >
              <CustomizedDropdown
                // MenuProps={{
                //   anchorOrigin: {
                //     vertical: "bottom",
                //     horizontal: "left",
                //   },
                //   transformOrigin: {
                //     vertical: "top",
                //     horizontal: "left",
                //   },
                //   getContentAnchorEl: null,
                // }}

                id="pmweb_workdesk_exception_raiseNameDropdown"
                style={{ width: "100%" }}
                ariaLabel="exception_raiseName"
                className={styles.todoSelect}
                value={raiseName}
                onChange={(e) => {
                  setRaiseName(e.target.value);
                }}
                disabled={
                  isReadOnly ||
                  !checkException ||
                  (checkException && !raiseCheckbox && editableField) ||
                  (checkException && !editableField) ||
                  DisableCheckBox(
                    DisableRaise,
                    localLoadedActivityPropertyData.ActivityProperty
                  )
                }
              >
                <MenuItem className={styles.menuItemStyles} value={""}>
                  {""}
                </MenuItem>
                {triggerList?.map((val) => {
                  return (
                    <MenuItem
                      className={styles.menuItemStyles}
                      key={val.TriggerName}
                      value={val.TriggerName}
                    >
                      {val.TriggerName}
                    </MenuItem>
                  );
                })}
              </CustomizedDropdown>
            </div>
          </div>
          <div className="row expCheckList" style={{ width: "96%" }}>
            <div style={{ width: "30%" }}>
              <FormGroup>
                <FormControlLabel
                  label={
                    <span className={styles.checkboxLabel}>{t("respond")}</span>
                  }
                  control={
                    <Checkbox
                      checked={respondCheckbox}
                      onChange={(e) => setRespondCheckbox(e.target.checked)}
                      inputRef={respondRef}
                      onKeyUp={(e) => {
                        if (e.key === "Enter") {
                          respondRef.current.click();
                          e.stopPropagation();
                        }
                      }}
                      id="pmweb_workdesk_exception_respond_checkBox"
                      className={styles.mainCheckbox}
                      disabled={
                        isReadOnly ||
                        !checkException ||
                        (checkException && !viewCheckbox && editableField) ||
                        (checkException && !editableField) ||
                        DisableCheckBox(
                          DisableRespond,
                          localLoadedActivityPropertyData.ActivityProperty
                        )
                      }
                    />
                  }
                />
              </FormGroup>
            </div>
            <div style={{ width: "70%" }}>
              <label htmlFor="respondName_dropdown" style={{ display: "none" }}>
                ResponseDropdown
              </label>
              <Select
                MenuProps={{
                  anchorOrigin: {
                    vertical: "bottom",
                    horizontal: "left",
                  },
                  transformOrigin: {
                    vertical: "top",
                    horizontal: "left",
                  },
                  getContentAnchorEl: null,
                }}
                inputProps={{
                  id: "respondName_dropdown",
                  "aria-label": "respondName_dropdown_",
                }}
                id="pmweb_workdesk_exception_respondName_Dropdown"
                style={{ width: "100%" }}
                className={styles.todoSelect}
                value={respondName}
                onChange={(e) => {
                  setRespondName(e.target.value);
                }}
                disabled={
                  isReadOnly ||
                  !checkException ||
                  (checkException && !respondCheckbox && editableField) ||
                  (checkException && !editableField) ||
                  DisableCheckBox(
                    DisableRespond,
                    localLoadedActivityPropertyData.ActivityProperty
                  )
                }
              >
                <MenuItem
                  className={styles.menuItemStyles}
                  value={""}
                  id={"respondName_dropdown"}
                >
                  {""}
                </MenuItem>
                {triggerList?.map((val) => {
                  return (
                    <MenuItem
                      // id={"respondName_dropdown"}
                      // aria-label={"respondName_dropdown"}
                      className={styles.menuItemStyles}
                      key={val.TriggerName}
                      value={val.TriggerName}
                    >
                      {val.TriggerName}
                    </MenuItem>
                  );
                })}
              </Select>
            </div>
          </div>
          <div className="row expCheckList" style={{ width: "96%" }}>
            <div style={{ width: "30%" }}>
              <FormGroup>
                <FormControlLabel
                  label={
                    <span className={styles.checkboxLabel}>{t("clear")}</span>
                  }
                  control={
                    <Checkbox
                      checked={clearCheckbox}
                      onChange={(e) => setClearCheckbox(e.target.checked)}
                      inputRef={clearRef}
                      onKeyUp={(e) => {
                        if (e.key === "Enter") {
                          clearRef.current.click();
                          e.stopPropagation();
                        }
                      }}
                      id="pmweb_workdesk_exception_clear_checkBox"
                      className={styles.mainCheckbox}
                      disabled={
                        isReadOnly ||
                        !checkException ||
                        (checkException && !viewCheckbox && editableField) ||
                        (checkException && !editableField) ||
                        DisableCheckBox(
                          DisableClear,
                          localLoadedActivityPropertyData.ActivityProperty
                        )
                      }
                    />
                  }
                />
              </FormGroup>
            </div>
            <div style={{ width: "70%" }} aria-label="clearName_dropdown">
              <label htmlFor="clearName_dropdown" style={{ display: "none" }}>
                ClearNameDropdown
              </label>
              <Select
                MenuProps={{
                  anchorOrigin: {
                    vertical: "bottom",
                    horizontal: "left",
                  },
                  transformOrigin: {
                    vertical: "top",
                    horizontal: "left",
                  },
                  getContentAnchorEl: null,
                }}
                inputProps={{
                  "aria-label": "clearName_dropdown_",
                  id: "clearName_dropdown",
                }}
                id="pmweb_workdesk_exception_clearName_Dropdown"
                style={{ width: "100%" }}
                className={styles.todoSelect}
                value={clearName}
                onChange={(e) => {
                  setClearName(e.target.value);
                }}
                disabled={
                  isReadOnly ||
                  !checkException ||
                  (checkException && !clearCheckbox && editableField) ||
                  (checkException && !editableField) ||
                  DisableCheckBox(
                    DisableClear,
                    localLoadedActivityPropertyData.ActivityProperty
                  )
                }
              >
                <MenuItem className={styles.menuItemStyles} value={""}>
                  {""}
                </MenuItem>
                {triggerList?.map((val) => {
                  return (
                    <MenuItem
                      className={styles.menuItemStyles}
                      key={val.TriggerName}
                      value={val.TriggerName}
                    >
                      {val.TriggerName}
                    </MenuItem>
                  );
                })}
              </Select>
            </div>
          </div>
        </div>
      </div>
      <Modal open={addExpection}>
        <AddException
          handleClose={() => setaddException(false)}
          addExceptionToList={addExceptionToList}
          calledFromWorkdesk={true}
          groups={expData.ExceptionGroups}
          addAnotherExp={addAnotherExp}
          setAddAnotherExp={setAddAnotherExp}
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

export default connect(mapStateToProps, null)(Exception);
