// Changes made to solve Bug Bug 116922 - Workstep streams: while opening the property window and clicking on streams tab the blank screen appears
// #BugID - 122999
// #BugDescription - Add new stream issue has been handled.

import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { store, useGlobalState } from "state-pool";
import { connect, useSelector, useDispatch } from "react-redux";
import styles from "./index.module.css";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import AddCondition from "./AddCondition";
import SearchBox from "../../../../UI/Search Component/index";
import {
  getConditionalOperatorLabel,
  getLogicalOperator,
} from "../ActivityRules/CommonFunctionCall.js";
import {
  ADD_SYMBOL,
  CONSTANT,
  headerHeight,
  propertiesLabel,
  RTL_DIRECTION,
  SPACE,
} from "../../../../Constants/appConstants.js";
import DragIndicatorOutlinedIcon from "@material-ui/icons/DragIndicatorOutlined";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
  ActivityPropertyChangeValue,
  setActivityPropertyChange,
} from "../../../../redux-store/slices/ActivityPropertyChangeSlice";
import arabicStyles from "./ArabicStyles.module.css";
import * as actionCreators from "../../../../redux-store/actions/Properties/showDrawerAction";
import { PMWEB_ARB_REGEX, PMWEB_REGEX } from "../../../../validators/validator";
import { setToastDataFunc } from "../../../../redux-store/slices/ToastDataHandlerSlice";
import {
  checkRegex,
  getIncorrectRegexErrMsg,
  isReadOnlyFunc,
  shortenRuleStatement,
} from "../../../../utility/CommonFunctionCall/CommonFunctionCall";
import {
  ActivityPropertySaveCancelValue,
  setSave,
} from "../../../../redux-store/slices/ActivityPropertySaveCancelClicked";
import { convertToArabicDate } from "../../../../UI/DatePicker/DateInternalization";
import { FieldValidations } from "../../../../utility/FieldValidations/fieldValidations";
import { LightTooltip } from "../../../../UI/StyledTooltip";

function RuleStatement(props) {
  const {
    provided,
    streamStatement,
    streamSelectHandler,
    index,
    val,
    showDragIcon,
    isSelected,
    isNewRuleBeingAdded,
  } = props;
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  return (
    <div
      className="flex"
      style={{
        marginTop: "0.5rem",
        cursor: "pointer",
        padding: "0.5rem 0.75vw",
        background: isSelected ? "#e8f3fa 0% 0% no-repeat padding-box" : "#fff",
      }}
      onClick={() => streamSelectHandler(index)}
    >
      {/* Modified on 18-10-23 for Bug 139521 */}
      {showDragIcon && !isNewRuleBeingAdded ? (
        <div
          {...provided.dragHandleProps}
          style={{
            height: "1.5rem",
            display: "flex",
            paddingInlineEnd: "0.1vw",
          }}
        >
          <DragIndicatorOutlinedIcon
            style={{ width: "1.35rem", height: "1.45rem" }}
          />
        </div>
      ) : (
        <div className={styles.showIndex}>{index + 1}. </div>
      )}
      {/* Till here for Bug 139521 */}
      <div id="stream_list">
        <h5
          style={{
            font: "normal normal bold var(--base_text_font_size)/17px var(--font_family)",
          }}
        >
          {val.ruleName}
          {SPACE}
        </h5>
        {/* Added on 13-10-23 for Bug 139344 */}
        <LightTooltip
          id="ES_Tooltip_StreamDesc"
          arrow={true}
          enterDelay={500}
          placement="bottom"
          title={streamStatement[index]}
        >
          <p
            style={{
              fontSize: "11px",
              direction: "ltr",
              textAlign: direction === RTL_DIRECTION ? "right" : "left",
            }}
          >
            {shortenRuleStatement(streamStatement[index], 70)}
          </p>
        </LightTooltip>
        {/* Till here for Bug 139344 */}
      </div>
    </div>
  );
}

function Stream(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const saveCancelStatus = useSelector(ActivityPropertySaveCancelValue);
  const allTabStatus = useSelector(ActivityPropertyChangeValue);
  const loadedActivityPropertyData = store.getState("activityPropertyData");
  const [localLoadedActivityPropertyData, setlocalLoadedActivityPropertyData] =
    useGlobalState(loadedActivityPropertyData);
  const loadedProcessData = store.getState("loadedProcessData"); //current processdata clicked
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const [streamName, setStreamName] = useState("");
  const [workList, setWorkList] = useState("A");
  const [selectedStream, setSelectedStream] = useState(0);
  const [streamStatement, setstreamStatement] = useState([]);
  const [disable, setdisable] = useState(true);
  const [streamsData, setStreamData] = useState([]);
  const dispatch = useDispatch();
  const [showDragIcon, setshowDragIcon] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(null);
  const [searchedStreamData, setSearchedStreamData] = useState([]);
  const [validateError, setValidateError] = useState(false);
  // changes added for bug_id: 134226
  const windowInnerHeight = useSelector(
    (state) => state.setWindowInnerHeight.windowInnerHeight
  );
  const [isNewRuleBeingAdded, setIsNewRuleBeingAdded] = useState(false);
  const streamNameRef = useRef();

  let isReadOnly =
    props.openTemplateFlag ||
    isReadOnlyFunc(
      localLoadedProcessData,
      props.cellCheckedOut,
      props.cellLaneId
    );

  // Function that runs when the saveCancelStatus.SaveClicked, saveCancelStatus.CancelClicked values change and checks validation.
  useEffect(() => {
    if (saveCancelStatus.SaveClicked && isNewRuleBeingAdded) {
      dispatch(
        setToastDataFunc({
          message: t("addStreamValidationMsg"),
          severity: "error",
          open: true,
        })
      );
      dispatch(setSave({ SaveClicked: false }));
    }
  }, [saveCancelStatus.SaveClicked, saveCancelStatus.CancelClicked]);

  // Function that runs when the dependency value changes and checks if the user trying to save a stream without adding it.
  useEffect(() => {
    if (isNewRuleBeingAdded) {
      dispatch(
        setActivityPropertyChange({
          [propertiesLabel.streams]: {
            isModified: allTabStatus[propertiesLabel.streams]?.isModified,
            hasError: true,
          },
        })
      );
    } else {
      dispatch(
        setActivityPropertyChange({
          [propertiesLabel.streams]: {
            isModified: allTabStatus[propertiesLabel.streams]?.isModified,
            hasError: false,
          },
        })
      );
    }
  }, [
    isNewRuleBeingAdded,
    allTabStatus[propertiesLabel.streams]?.isModified,
    streamName,
  ]);

  const streamNameHandler = (e) => {
    // added on 07/10/23 for BugId 139086
    let streamErr = null;
    let tempStreamName = e.target.value;
    if (tempStreamName?.trim() === "") {
      streamErr = t("streamErrorInput");
    } else if (
      tempStreamName?.trim() !== "" &&
      !checkRegex(
        tempStreamName,
        PMWEB_REGEX.ActionName,
        PMWEB_ARB_REGEX.ActionName
      )
    ) {
      streamErr = getIncorrectRegexErrMsg(
        "streamName",
        t,
        `\\ / : * ? " < > | ' &`
      );
    } else if (tempStreamName?.trim() !== "" && tempStreamName?.length > 30) {
      streamErr = t("streamErrorLength");
    }
    setError(streamErr);

    setStreamName(e.target.value);
    if (
      streamsData?.ActivityProperty?.streamInfo?.esRuleList[selectedStream]
        ?.status === "added"
    ) {
      setStreamData((prev) => {
        let temp = { ...prev };
        temp.ActivityProperty.streamInfo.esRuleList[selectedStream].status =
          "edited";
        return temp;
      });
    }
    // Commented on 13-10-23 for Bug 139353
    // dispatch(
    //   setActivityPropertyChange({
    //     [propertiesLabel.streams]: { isModified: false, hasError: false },
    //   })
    // );
    // Till here for Bug 139353
  };

  const workListHandler = (e) => {
    setWorkList(e.target.value);
    if (e.target.value === "A") {
      setdisable(true);
    } else if (e.target.value === "O") {
      setdisable(false);
    }
    if (
      streamsData?.ActivityProperty?.streamInfo?.esRuleList[selectedStream]
        ?.status === "added"
    ) {
      setStreamData((prev) => {
        let temp = { ...prev };
        temp.ActivityProperty.streamInfo.esRuleList[selectedStream].status =
          "edited";
        return temp;
      });
    }
    // Commented on 13-10-23 for Bug 139353
    // dispatch(
    //   setActivityPropertyChange({
    //     [propertiesLabel.streams]: { isModified: true, hasError: false },
    //   })
    // );
    // Till here for Bug 139353
  };

  const streamSelectHandler = (index) => {
    setSelectedStream(index);
    if (
      localLoadedActivityPropertyData?.ActivityProperty?.streamInfo
        ?.esRuleList &&
      localLoadedActivityPropertyData?.ActivityProperty?.streamInfo?.esRuleList
        ?.length > 0
    ) {
      let ruleName =
        localLoadedActivityPropertyData?.ActivityProperty?.streamInfo
          ?.esRuleList[index]?.ruleName;
      setStreamName(ruleName);

      /*code edited on 28 July 2022 for BugId 111554 */
      if (ruleName?.trim() === "Default") {
        setWorkList("A");
        setdisable(true);
      } else if (
        localLoadedActivityPropertyData?.ActivityProperty?.streamInfo?.esRuleList[
          index
        ]?.ruleCondList[0]?.param1?.trim() === ""
      ) {
        setWorkList("A");
        setdisable(true);
      } else {
        setWorkList("O");
        setdisable(false);
      }
    }
    setError(null);
    //code edited on 5 August 2022 for Bug 112847
    setValidateError(false);
  };

  const addNewStreamHandler = () => {
    setIsNewRuleBeingAdded(true);
    let maxRuleId = 0;
    localLoadedActivityPropertyData?.ActivityProperty?.streamInfo?.esRuleList?.forEach(
      (element) => {
        if (+element.ruleOrderId > +maxRuleId) {
          maxRuleId = element.ruleOrderId;
        }
      }
    );
    let newRule = {
      ruleCondList: [{ condOrderId: "1", ...blankObjectCondition }],
      ruleId: +maxRuleId + 1 + "",
      ruleType: "S",
      ruleName: t("newStream"), // added transaltaion for bug 139088
      ruleOrderId: 1,
      status: "temporary",
    };
    let temp = JSON.parse(JSON.stringify(localLoadedActivityPropertyData));
    let isTempAvailable = false;
    temp?.ActivityProperty?.streamInfo?.esRuleList?.forEach((el) => {
      if (el.status === "temporary") {
        isTempAvailable = true;
      }
    });
    //console.log(newRule);
    if (isTempAvailable) {
      //  const len = temp?.ActivityProperty?.streamInfo?.esRuleList?.length || 1;
      //temp.ActivityProperty.streamInfo.esRuleList[len - 1] = { ...newRule };
      temp.ActivityProperty.streamInfo.esRuleList[0] = { ...newRule };
      //console.log(temp.ActivityProperty.streamInfo.esRuleList);
    } else {
      /*  const len =
        temp?.ActivityProperty?.streamInfo?.esRuleList?.length - 1 || 1;
      temp.ActivityProperty.streamInfo.esRuleList.splice(len - 1, 0, newRule);

      let ruleOrderId = 1;*/
      temp?.ActivityProperty?.streamInfo?.esRuleList?.forEach(
        (element, index) => {
          temp.ActivityProperty.streamInfo.esRuleList[index].ruleOrderId =
            +element.ruleOrderId + 1;
          // ruleOrderId++;
        }
      );
      //  console.log(temp.ActivityProperty.streamInfo.esRuleList);
      temp.ActivityProperty.streamInfo.esRuleList.splice(0, 0, newRule);
    }
    setlocalLoadedActivityPropertyData(temp);
    if (!props.isDrawerExpanded) {
      props.expandDrawer(true);
    }
    //code edited on 5 August 2022 for Bug 112847
    setValidateError(false);
    const timeout = setTimeout(() => {
      const input = document.getElementById("StreamNameInput");
      input.select();
      input.focus();
    }, 500);
    return () => clearTimeout(timeout);
  };

  const blankObjectCondition = {
    param1: "",
    type1: "M",
    extObjID1: "0",
    variableId_1: "0",
    varFieldId_1: "0",
    param2: "",
    type2: "M",
    extObjID2: "0",
    variableId_2: "0",
    varFieldId_2: "0",
    operator: "",
    logicalOp: "3",
    datatype1: "",
  };

  const streamCondListAll = {
    condOrderId: "1",
    param1: "",
    type1: "M",
    extObjID1: "0",
    variableId_1: "0",
    varFieldId_1: "0",
    param2: "",
    type2: "M",
    extObjID2: "0",
    variableId_2: "0",
    varFieldId_2: "0",
    operator: "4",
    logicalOp: "3",
    datatype1: "",
  };

  const newRow = (value, index) => {
    if (value === ADD_SYMBOL) {
      let maxId = 0;
      streamsData.ActivityProperty.streamInfo.esRuleList[
        index
      ].ruleCondList.forEach((element) => {
        if (element.condOrderId > maxId) {
          maxId = element.condOrderId;
        }
      });
      let ConOrderID = { condOrderId: +maxId + 1 + "" };
      let newRow = { ...ConOrderID, ...blankObjectCondition, isNew: true };
      let temp = { ...streamsData };
      temp.ActivityProperty.streamInfo.esRuleList[index].ruleCondList.push(
        newRow
      );
      setStreamData(temp);
    }
  };

  const addStreamHandler = () => {
    // Added on 07-10-23 for Bug 138719
    if (streamName?.trim()?.length > 30) {
      dispatch(
        setToastDataFunc({
          message: t("streamNameCannotBeMoreThan30Characters"),
          severity: "error",
          open: true,
        })
      );
    }
    // Till here for Bug 138719
    else {
      //code edited on 5 August 2022 for Bug 112847
      let tempStream = { ...streamsData };
      tempStream?.ActivityProperty?.streamInfo?.esRuleList[
        selectedStream
      ]?.ruleCondList?.forEach((element) => {
        if (element.isNew) {
          delete element.isNew;
        }
      });
      setStreamData(tempStream);
      setValidateError(true);

      // modified on 07/10/23 for BugId 139086
      /*
      if (streamName == null || streamName.trim() === "") {
        setError({
          streamName: {
            statement: t("streamErrorInput"),
            severity: "error",
            errorType: ERROR_MANDATORY,
          },
        });
      } else if (streamName.length > 30) {
        setError({
          streamName: {
            statement: t("streamErrorLength"),
            severity: "error",
            errorType: ERROR_RANGE,
          },
        });
      } else if (
        !validateRegex(streamName, REGEX.StartWithAlphaThenAlphaNumAndOnlyUs)
      ) {
        setError({
          streamName: {
            //Modified  on 15/08/2023, bug_id:130947
            statement: t("startAlphaNumWithOnlyUnderscoreHiphenStream"),
            severity: "error",
            errorType: ERROR_INCORRECT_FORMAT,
          },
        });
      } else {
       */
      if (error === null) {
        setIsNewRuleBeingAdded(false);
        let temp = { ...localLoadedActivityPropertyData };
        let doExists = false;
        // Modified on 26-09-23 for Bug 138496
        temp?.ActivityProperty?.streamInfo?.esRuleList?.forEach((el, index) => {
          if (
            el.ruleName?.toLowerCase() === streamName?.trim()?.toLowerCase() &&
            index > 0
          ) {
            doExists = true;
          }
        });
        // Till here for Bug 138496
        if (doExists) {
          dispatch(
            setToastDataFunc({
              message: `${t("StreamAlreadyExists")}`,
              severity: "error",
              open: true,
            })
          );
          const input = document.getElementById("StreamNameInput");
          input.select();
          input.focus();
        } else {
          //code edited on 5 August 2022 for Bug 112847
          let isValid = true;
          if (workList === "O") {
            tempStream?.ActivityProperty?.streamInfo?.esRuleList[
              selectedStream
            ]?.ruleCondList?.forEach((el) => {
              // Added if condition for Bug 135397 on 26-09-23
              if (el.operator === "9" || el.operator === "10") {
                if (
                  !el.param1 ||
                  el.param1?.trim() === "" ||
                  !el.operator ||
                  el.operator?.trim() === ""
                ) {
                  isValid = false;
                }
              } else {
                if (
                  !el.param1 ||
                  el.param1?.trim() === "" ||
                  !el.operator ||
                  el.operator?.trim() === "" ||
                  !el.param2 ||
                  el.param2?.trim() === "" ||
                  el.param2?.trim() === CONSTANT // code added on 23 Aug 2022 for BugId 114353
                ) {
                  isValid = false;
                }
              }
              // Till here Bug 135397
            });
          }
          if (isValid) {
            temp.ActivityProperty.streamInfo.esRuleList[0] = {
              ruleCondList:
                workList === "A"
                  ? [streamCondListAll]
                  : tempStream?.ActivityProperty?.streamInfo?.esRuleList[
                      selectedStream
                    ]?.ruleCondList,
              ruleId: temp.ActivityProperty.streamInfo.esRuleList[0].ruleId,
              ruleType: temp.ActivityProperty.streamInfo.esRuleList[0].ruleType,
              ruleName: streamName?.trim(),
              ruleOrderId:
                temp.ActivityProperty.streamInfo.esRuleList[0].ruleOrderId,
            };
            setlocalLoadedActivityPropertyData(temp);
            // Added on 13-10-23 for Bug 139353
            dispatch(
              setActivityPropertyChange({
                [propertiesLabel.streams]: {
                  isModified: true,
                  hasError: false,
                },
              })
            );
            // Till here for Bug 139353
          }
        }
      }
    }
  };

  const modifyStreamHandler = () => {
    // Added on 07-10-23 for Bug 138719
    if (streamName?.trim()?.length > 30) {
      dispatch(
        setToastDataFunc({
          message: t("streamNameCannotBeMoreThan30Characters"),
          severity: "error",
          open: true,
        })
      );
    }
    // Till here for Bug 138719
    else {
      //code edited on 5 August 2022 for Bug 112847
      let tempStream = { ...streamsData };
      tempStream?.ActivityProperty?.streamInfo?.esRuleList[
        selectedStream
      ]?.ruleCondList?.forEach((element) => {
        if (element.isNew) {
          delete element.isNew;
        }
      });
      setStreamData(tempStream);
      setValidateError(true);

      // modified on 07/10/23 for BugId 139086
      /*
      if (streamName == null || streamName.trim() === "") {
        setError({
          streamName: {
            statement: t("streamErrorInput"),
            severity: "error",
            errorType: ERROR_MANDATORY,
          },
        });
      } else if (streamName.length > 30) {
        setError({
          streamName: {
            statement: t("streamErrorLength"),
            severity: "error",
            errorType: ERROR_RANGE,
          },
        });
      } else if (
        !validateRegex(streamName, REGEX.StartWithAlphaThenAlphaNumAndOnlyUs)
      ) {
        //Modified  on 25/08/2023, bug_id:130947
        setError({
          streamName: {
            statement: t("startAlphaNumWithOnlyUnderscoreHiphenStream"),
            severity: "error",
            errorType: ERROR_INCORRECT_FORMAT,
          },
        });
      } else {
      */
      if (error === null) {
        let temp = JSON.parse(JSON.stringify(streamsData));
        let tempLocal = JSON.parse(
          JSON.stringify(localLoadedActivityPropertyData)
        );
        let doExists = false;
        tempLocal?.ActivityProperty?.streamInfo?.esRuleList?.forEach(
          (el, index) => {
            // Modified on 20-10-23 for Bug 139731
            if (
              el.ruleName?.toLowerCase() ===
                streamName?.trim()?.toLowerCase() &&
              index !== selectedStream
            ) {
              doExists = true;
            }
            // Till here for Bug 139731
          }
        );
        if (doExists) {
          dispatch(
            setToastDataFunc({
              message: `${t("StreamAlreadyExists")}`,
              severity: "error",
              open: true,
            })
          );
          const input = document.getElementById("StreamNameInput");
          input.select();
          input.focus();
        } else {
          let isValid = true;
          if (workList === "O") {
            temp?.ActivityProperty?.streamInfo?.esRuleList[
              selectedStream
            ]?.ruleCondList?.forEach((el) => {
              // Added on 15-10-23 for Bug 139490
              if (el.operator === "9" || el.operator === "10") {
                if (
                  !el.param1 ||
                  el.param1?.trim() === "" ||
                  !el.operator ||
                  el.operator?.trim() === ""
                ) {
                  isValid = false;
                }
              }
              // Till here for Bug 139490
              else if (
                !el.param1 ||
                el.param1?.trim() === "" ||
                !el.operator ||
                el.operator?.trim() === "" ||
                !el.param2 ||
                el.param2?.trim() === "" ||
                el.param2?.trim() === CONSTANT // code added on 23 Aug 2022 for BugId 114353
              ) {
                isValid = false;
              }
            });
          }
          if (isValid) {
            tempLocal.ActivityProperty.streamInfo.esRuleList[selectedStream] = {
              ruleCondList:
                workList === "A"
                  ? [streamCondListAll]
                  : temp?.ActivityProperty?.streamInfo?.esRuleList[
                      selectedStream
                    ]?.ruleCondList,
              ruleId: temp.ActivityProperty.streamInfo.esRuleList[0].ruleId,
              ruleType: temp.ActivityProperty.streamInfo.esRuleList[0].ruleType,
              ruleName: streamName?.trim(),
              ruleOrderId:
                temp.ActivityProperty.streamInfo.esRuleList[0].ruleOrderId,
            };
            setlocalLoadedActivityPropertyData(tempLocal);
            // Added on 12-10-23 for Bug 139343
            dispatch(
              setActivityPropertyChange({
                [propertiesLabel.streams]: {
                  isModified: true,
                  hasError: false,
                },
              })
            );
            // Till here for Bug 139343
          }
        }
      }
    }
  };

  const cancelHandler = () => {
    setIsNewRuleBeingAdded(false);
    if (
      streamsData?.ActivityProperty?.streamInfo?.esRuleList[selectedStream]
        ?.status === "edited"
    ) {
      setStreamData((prev) => {
        let temp = JSON.parse(JSON.stringify(prev));
        let tempLocal = JSON.parse(
          JSON.stringify(localLoadedActivityPropertyData)
        );
        temp.ActivityProperty.streamInfo.esRuleList[selectedStream] =
          tempLocal.ActivityProperty.streamInfo.esRuleList[selectedStream];
        // Added on 17-10-23 for Bug 139522
        setStreamName(
          temp?.ActivityProperty?.streamInfo?.esRuleList[selectedStream]
            ?.ruleName
        );
        if (
          temp.ActivityProperty.streamInfo.esRuleList[
            selectedStream
          ]?.ruleCondList[0]?.param1?.trim() === ""
        ) {
          setWorkList("A");
        } else {
          setWorkList("O");
        }
        // Till here for Bug 139522
        temp.ActivityProperty.streamInfo.esRuleList[selectedStream] = {
          ...temp.ActivityProperty.streamInfo.esRuleList[selectedStream],
          status: "added",
        };
        return temp;
      });
    } else {
      let temp = { ...localLoadedActivityPropertyData };
      temp.ActivityProperty.streamInfo.esRuleList.splice(selectedStream, 1);
      temp?.ActivityProperty?.streamInfo?.esRuleList?.forEach((element) => {
        element.ruleOrderId = +element.ruleOrderId - 1;
      });
      setlocalLoadedActivityPropertyData(temp);
    }
    //code edited on 5 August 2022 for Bug 112847
    setValidateError(false);
  };

  const deleteHandler = () => {
    let temp = { ...localLoadedActivityPropertyData };
    temp.ActivityProperty.streamInfo.esRuleList.splice(selectedStream, 1);
    setlocalLoadedActivityPropertyData(temp);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.streams]: { isModified: true, hasError: false },
      })
    );
  };

  // code added on 28 July 2022 for BugId 111553
  const onSearchSubmit = (searchVal) => {
    setSearchTerm(null);
    if (searchVal?.trim() !== "") {
      let arr = [];
      let temp = JSON.parse(JSON.stringify(streamsData));
      temp?.ActivityProperty?.streamInfo?.esRuleList?.forEach((elem) => {
        // Modified on 04-10-23 for Bug 138650
        if (
          elem.ruleName.toLowerCase().includes(searchVal.trim()?.toLowerCase())
        ) {
          arr.push(elem);
        }
        // Till here for Bug 138650
      });
      temp.ActivityProperty.streamInfo.esRuleList = [...arr];
      setSearchedStreamData(temp);
    } else {
      clearResult();
    }
  };

  // code added on 28 July 2022 for BugId 111553
  const clearResult = () => {
    setSearchedStreamData(streamsData ? streamsData : []);
  };

  useEffect(() => {
    // code added on 7 Sep 2022 for BugId 115470
    if (localLoadedActivityPropertyData?.Status === 0) {
      let sentence = [];
      let tempData = JSON.parse(
        JSON.stringify(localLoadedActivityPropertyData)
      );
      let tempStreamData = tempData?.ActivityProperty?.streamInfo?.esRuleList
        ? [...tempData?.ActivityProperty?.streamInfo?.esRuleList]
        : [];
      tempStreamData?.forEach((val, index) => {
        let ruleStatement = "";
        val.ruleCondList &&
          val.ruleCondList.forEach((element) => {
            if (element.param1?.trim() !== "") {
              const concatenatedString = ruleStatement.concat(
                " ",
                element.param1,
                " ",
                element.param1 === "" ? "" : "is",
                " ",
                getConditionalOperatorLabel(element.operator),
                " ",
                // modified on 27/09/2023 for BugId 136677
                // element.param2,
                (element.datatype1 === "8" || element.datatype1 === "15") &&
                  element.type2 === "C"
                  ? convertToArabicDate(element.param2)
                  : element.param2,
                // till here BugId 136677
                " ",
                getLogicalOperator(element.logicalOp)
              );
              ruleStatement = concatenatedString;
            }
          });
        sentence.push(ruleStatement);
        if (
          tempData?.ActivityProperty?.streamInfo?.esRuleList[index]?.status !==
          "temporary"
        ) {
          tempData.ActivityProperty.streamInfo.esRuleList[index] = {
            ...tempData?.ActivityProperty?.streamInfo?.esRuleList[index],
            status: "added",
          };
        }
      });
      setStreamData(tempData);
      setSearchedStreamData(tempData);
      setstreamStatement(sentence);
      streamSelectHandler(0);
    }
  }, [localLoadedActivityPropertyData]);

  // code edited on 13 Feb 2023 for BugId 123760
  useEffect(() => {
    if (localLoadedActivityPropertyData?.Status === 0) {
      let temp = global.structuredClone(localLoadedActivityPropertyData);
      temp?.ActivityProperty?.streamInfo?.esRuleList?.forEach((rule, index) => {
        if (rule?.status === "temporary") {
          temp.ActivityProperty.streamInfo.esRuleList.splice(index, 1);
        }
      });
      setlocalLoadedActivityPropertyData(temp);
    }
  }, []);

  const onDragEnd = (result) => {
    let sentence = [];
    // Updated on 27-10-23 for Bug 139523
    const { source, destination } = result;
    let streamArray = { ...localLoadedActivityPropertyData };
    if (!destination) return;
    if (
      destination.index ===
      streamArray.ActivityProperty.streamInfo.esRuleList?.length - 1
    )
      return;
    const [reOrderedPickListItem] =
      streamArray.ActivityProperty.streamInfo.esRuleList.splice(
        source.index,
        1
      );
    streamArray.ActivityProperty.streamInfo.esRuleList.splice(
      destination.index,
      0,
      reOrderedPickListItem
    );
    streamArray.ActivityProperty.streamInfo.esRuleList.forEach((val) => {
      let ruleStatement = "";
      val.ruleCondList &&
        val.ruleCondList.forEach((element) => {
          const concatenatedString = ruleStatement.concat(
            " ",
            element.param1,
            " ",
            element.param1 == "" ? "" : t("is"),
            " ",
            getConditionalOperatorLabel(element.operator),
            " ",
            element.param2,
            " ",
            getLogicalOperator(element.logicalOp)
          );
          ruleStatement = concatenatedString;
        });
      sentence.push(ruleStatement);
    });
    setstreamStatement(sentence);
    setSelectedStream(destination.index);
    setStreamName(
      localLoadedActivityPropertyData.ActivityProperty.streamInfo.esRuleList[
        destination.index
      ].ruleName
    );
    streamArray.ActivityProperty.streamInfo.esRuleList?.forEach(
      (element, index) => {
        element.ruleOrderId = index + 1;
      }
    );
    // Till here for Bug 139523
    setlocalLoadedActivityPropertyData(streamArray);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.streams]: {
          isModified: true,
          hasError: allTabStatus[propertiesLabel.streams]?.hasError,
        },
      })
    );
  };

  return (
    <div
      className={styles.streamScreen}
      /* code added on 6 July 2023 for issue - save and discard button hide 
      issue in case of tablet(landscape mode)*/
      style={{
        height: `calc((${windowInnerHeight}px - ${headerHeight}) - 10rem)`,
      }}
    >
      <div className={styles.leftPanel}>
        <div className="row" style={{ padding: "0 1vw" }}>
          <h5 style={{ fontSize: "var(--subtitle_text_font_size)" }}>
            {t("streams")}
          </h5>
          {!isReadOnly && (
            <button
              className={styles.addButton}
              id="AddStream"
              data-testid="addNewStreamBtn"
              onClick={addNewStreamHandler}
            >
              {t("addNewStream")}
            </button>
          )}
        </div>
        <div style={{ padding: "0 1vw", marginTop: "0.5rem" }}>
          <SearchBox
            width="100%"
            style={{
              maxWidth: "100%",
            }}
            placeholder={t("search")}
            onSearchChange={onSearchSubmit} // code added on 28 July 2022 for BugId 111553
            clearSearchResult={clearResult} // code added on 28 July 2022 for BugId 111553
            name="search"
            searchTerm={searchTerm}
            title={"stream_search"}
          />
        </div>
        {/*code added on 23 August 2022 for BugId 114355*/}
        <div
          className={styles.streamListDiv}
          /* code added on 6 July 2023 for issue - save and discard button hide 
          issue in case of tablet(landscape mode)*/
          style={{
            height: `calc((${windowInnerHeight}px - ${headerHeight}) - 16.5rem)`,
          }}
        >
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="pickListInputs">
              {(provided) => (
                <div
                  className="inputs"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  <div
                    onMouseOver={() => {
                      if (!isReadOnly) {
                        setshowDragIcon(true);
                      }
                    }}
                    onMouseLeave={() => setshowDragIcon(false)}
                  >
                    {searchedStreamData?.ActivityProperty?.streamInfo?.esRuleList?.map(
                      (val, index) => {
                        return (
                          <Draggable
                            draggableId={`${index}`}
                            key={`${index}`}
                            index={index}
                            isDragDisabled={isReadOnly}
                          >
                            {(provided) => (
                              <div
                                {...provided.draggableProps}
                                ref={provided.innerRef}
                              >
                                <RuleStatement
                                  streamStatement={streamStatement}
                                  streamSelectHandler={streamSelectHandler}
                                  index={index}
                                  isSelected={selectedStream === index}
                                  val={val}
                                  provided={provided}
                                  showDragIcon={
                                    showDragIcon && val?.ruleId !== "1"
                                  }
                                  isNewRuleBeingAdded={isNewRuleBeingAdded}
                                />
                              </div>
                            )}
                          </Draggable>
                        );
                      }
                    )}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </div>

      {props.isDrawerExpanded && (
        <div className={styles.rightPanel}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "start",
            }}
          >
            <div style={{ maxWidth: "70%" }}>
              <p className={styles.labelTittle}>
                {t("streamName")}
                <span className={styles.starIcon}>*</span>
              </p>
              {/*modified on 07/10/23 for BugId 139086 */}
              {/* <TextInput
                inputValue={streamName}
                classTag={styles.nameInput}
                name="ruleName"
                onChangeEvent={(e) => streamNameHandler(e)}
                idTag="StreamNameInput"
                readOnlyCondition={
                  streamName?.trim() === "Default" || isReadOnly
                }
                errorStatement={error?.streamName?.statement}
                rangeVal={{ start: 0, end: 30 }}
                regexStr={REGEX.StartWithAlphaThenAlphaNumAndOnlyUs}
                errorSeverity={"error"}
                errorType={error?.streamName?.errorType}
                inlineError={true}
              /> */}
              <input
                onChange={(event) => streamNameHandler(event)}
                value={streamName}
                disabled={streamName?.trim() === "Default" || isReadOnly}
                className={styles.nameInput}
                style={{
                  border:
                    error !== null ? "1px solid #b52a2a" : "1px solid #c4c4c4",
                }}
                ref={streamNameRef}
                id="StreamNameInput"
                onKeyPress={(e) =>
                  FieldValidations(e, 150, streamNameRef.current, 30)
                }
              />
              {error !== null ? (
                <p className={styles.errorStatementAction}>{error}</p>
              ) : null}
            </div>
            {/*code edited on 28 July 2022 for BugId 111552 */}
            {streamName?.trim() === "Default" || isReadOnly ? null : (
              <div className={styles.footerStream}>
                {streamsData?.ActivityProperty?.streamInfo?.esRuleList &&
                streamsData?.ActivityProperty?.streamInfo?.esRuleList?.length >
                  0 &&
                streamsData?.ActivityProperty?.streamInfo?.esRuleList[
                  selectedStream
                ]?.status === "added" ? (
                  <button
                    className={styles.cancelButton}
                    data-testid="delBtn"
                    id="stream_delBtn"
                    onClick={deleteHandler}
                  >
                    {t("delete")}
                  </button>
                ) : (
                  <button
                    className={styles.cancelButton}
                    data-testid="cancelBtn"
                    id="stream_cancelBtn"
                    onClick={cancelHandler}
                  >
                    {t("cancel")}
                  </button>
                )}
                {streamsData?.ActivityProperty?.streamInfo?.esRuleList &&
                streamsData?.ActivityProperty?.streamInfo?.esRuleList?.length >
                  0 &&
                streamsData?.ActivityProperty?.streamInfo?.esRuleList[
                  selectedStream
                ]?.status === "edited" ? (
                  <button
                    className={styles.addButton}
                    data-testid="modifyStreamBtn"
                    id="stream_modifyStreamBtn"
                    // added on 07/10/23 for BugId 139086
                    disabled={error !== null}
                    style={{ cursor: error !== null ? "default" : "pointer" }}
                    onClick={() => modifyStreamHandler()}
                  >
                    {t("modifyStream")}
                  </button>
                ) : streamsData?.ActivityProperty?.streamInfo?.esRuleList &&
                  streamsData?.ActivityProperty?.streamInfo?.esRuleList
                    ?.length > 0 &&
                  streamsData?.ActivityProperty?.streamInfo?.esRuleList[
                    selectedStream
                  ]?.status === "temporary" ? (
                  <button
                    className={styles.addButton}
                    data-testid="addStreamBtn"
                    id="stream_addStreamBtn"
                    // added on 07/10/23 for BugId 139086
                    disabled={error !== null}
                    style={{ cursor: error !== null ? "default" : "pointer" }}
                    onClick={() => addStreamHandler()}
                  >
                    {t("addStream")}
                  </button>
                ) : null}
              </div>
            )}
          </div>
          <p className={styles.labelTittle} style={{ marginTop: "1rem" }}>
            {t("worklist")}
          </p>
          <RadioGroup
            onChange={(e) => workListHandler(e)}
            value={workList}
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.radiobtn
                : styles.radiobtn
            }
            id="radiobtns"
          >
            <FormControlLabel
              value="A"
              data-testid="First"
              control={<Radio />}
              label={t("all")}
              disabled={streamName?.trim() === "Default" || isReadOnly}
            />
            <FormControlLabel
              value="O"
              data-testid="Second"
              control={<Radio />}
              label={t("onFilter")}
              disabled={streamName?.trim() === "Default" || isReadOnly}
            />
          </RadioGroup>
          {/*code added on 28 July 2022 for BugId 111555 */}
          <div className={styles.addCondDiv}>
            {(streamsData?.ActivityProperty?.streamInfo?.esRuleList &&
            streamsData?.ActivityProperty?.streamInfo?.esRuleList?.length > 0 &&
            streamsData?.ActivityProperty?.streamInfo?.esRuleList[
              selectedStream
            ]?.ruleCondList
              ? streamsData.ActivityProperty.streamInfo.esRuleList[
                  selectedStream
                ].ruleCondList
              : [{ condOrderId: "1", ...blankObjectCondition }]
            ).map((val, index) => {
              return (
                <AddCondition
                  workList={workList}
                  setdisable={setdisable}
                  localData={val}
                  index={index}
                  streamsData={streamsData}
                  setStreamData={setStreamData}
                  parentIndex={selectedStream}
                  newRow={newRow}
                  showDelIcon={
                    streamsData.ActivityProperty?.streamInfo?.esRuleList[
                      selectedStream
                    ].ruleCondList?.length > 1 && workList === "O"
                  }
                  disabled={disable || isReadOnly}
                  validateError={validateError} //code edited on 5 August 2022 for Bug 112847
                  isReadOnly={isReadOnly}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    isDrawerExpanded: state.isDrawerExpanded.isDrawerExpanded,
    cellCheckedOut: state.selectedCellReducer.selectedCheckedOut,
    cellLaneId: state.selectedCellReducer.selectedActLaneId,
    openTemplateFlag: state.openTemplateReducer.openFlag,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    expandDrawer: (flag) => dispatch(actionCreators.expandDrawer(flag)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Stream);
