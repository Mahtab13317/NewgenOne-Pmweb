// #BugID - 114308
// #BugDescription - Delete button added in expand view,drag drop functionality added and disabled add button designed changed
import React, { useState, useEffect } from "react";
import { setActivityPropertyChange } from "../../../../redux-store/slices/ActivityPropertyChangeSlice.js";
import {
  RTL_DIRECTION,
  SPACE,
  propertiesLabel,
} from "../../../../Constants/appConstants";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import arabicStyles from "./arabicStyles.module.css";
import { useGlobalState, store } from "state-pool";
import CircularProgress from "@material-ui/core/CircularProgress";
import { useTranslation } from "react-i18next";
import { connect, useDispatch } from "react-redux";
import styles from "./Rule.module.css";
import * as actionCreators from "../../../../redux-store/actions/Properties/showDrawerAction";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import DragIndicatorOutlined from "@material-ui/icons/DragIndicatorOutlined.js";
import { IconButton } from "@material-ui/core";
import { useRef } from "react";
import { FieldValidations } from "../../../../utility/FieldValidations/fieldValidations.js";

const InitialRule = (props) => {
  let dispatch = useDispatch();
  let { t } = useTranslation();
  const { isReadOnly } = props;
  const direction = `${t("HTML_DIR")}`;
  const [showInput, setShowInput] = useState(false);
  const [data, setData] = useState({
    condition: "",
    operation: "",
  });
  const localActivityPropertyData = store.getState("activityPropertyData");
  const [spinner, setspinner] = useState(true);
  const [localLoadedActivityPropertyData, setlocalLoadedActivityPropertyData] =
    useGlobalState(localActivityPropertyData);
  const [attachField, setAttachField] = useState([]);
  const ruleConditonRef = useRef([]);
  const ruleOperationRef = useRef([]);
  const conditionRef = useRef();
  const operationRef = useRef();
  const [showDragIcon, setshowDragIcon] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [opName, setOpName] = useState("");
  const [indexId, setIndexId] = useState("");
  useEffect(() => {
    if (localLoadedActivityPropertyData?.Status === 0) {
      setspinner(false);
    }
    if (localLoadedActivityPropertyData?.ActivityProperty?.objPMRuleDetails) {
      setAttachField(
        localLoadedActivityPropertyData?.ActivityProperty?.objPMRuleDetails
          ?.m_arrRuleInfo
      );
    }
  }, [localLoadedActivityPropertyData]);

  //code edited on 5 August 2022 for BugId 110897
  const handleChange = (e, i, val) => {
    const values = [...attachField];
    values[i] = {
      ...values[i],
      [e.target.name]: e.target.value,
      isEdited: true,
    };
    setIndexId(i);
    setOpName(val);
    validateData(e, val);
    setAttachField(values);
  };
  const containsSpecialCharsinDefaultValue = (str) => {
    var regex = new RegExp("^[^<>]+$");
    return regex.test(str);
  };

  const validateData = (e, val) => {
    if (e.target.value.length > 255) {
      setErrorMsg(`${val}${SPACE}${t("lengthShouldNotExceed255Characters")}`);
    } else if (!containsSpecialCharsinDefaultValue(e.target.value)) {
      setErrorMsg(
        `${val}${SPACE}${t("cannotContain")}${SPACE}<>${SPACE}${t(
          "charactersInIt"
        )}`
      );
    } else {
      setErrorMsg("");
    }
    if (e.target.value == "") {
      setErrorMsg(false);
    }
  };

  const handleDataChange = (e, val) => {
    setIndexId("");
    setOpName(val);
    validateData(e, val);
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleRemoveFields = (i, ruleId) => {
    const values = [...attachField];
    values.splice(i, 1);
    setAttachField(values);
    let temp = JSON.parse(JSON.stringify(localLoadedActivityPropertyData));
    let idx = null;
    temp?.ActivityProperty?.objPMRuleDetails?.m_arrRuleInfo?.forEach(
      (el, index) => {
        if (+el.ruleId === +ruleId) {
          idx = index;
        }
      }
    );
    if (idx !== null) {
      temp.ActivityProperty.objPMRuleDetails.m_arrRuleInfo.splice(idx, 1);
    }
    setlocalLoadedActivityPropertyData(temp);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.initialRules]: {
          isModified: true,
          hasError: false,
        },
      })
    );
  };

  // code edited on 5 August 2022 for BugId 111117
  const handleAddFields = () => {
    setAttachField([
      ...attachField,
      { ruleCondition: data.condition, ruleOperation: data.operation },
    ]);
    setData({
      condition: "",
      operation: "",
    });
    let temp = JSON.parse(JSON.stringify(localLoadedActivityPropertyData));
    let maxRuleId = 0;
    if (temp?.ActivityProperty?.objPMRuleDetails) {
      if (temp?.ActivityProperty?.objPMRuleDetails?.m_arrRuleInfo?.length > 0) {
        temp?.ActivityProperty?.objPMRuleDetails?.m_arrRuleInfo?.forEach(
          (el) => {
            if (+el.ruleId > +maxRuleId) {
              maxRuleId = +el.ruleId;
            }
          }
        );
        temp.ActivityProperty.objPMRuleDetails.m_arrRuleInfo.push({
          m_bSelected: false,
          ruleCondition: data.condition,
          ruleId: `${maxRuleId + 1}`,
          ruleOperation: data.operation,
        });
      } else {
        temp.ActivityProperty.objPMRuleDetails = {
          ...temp.ActivityProperty.objPMRuleDetails,
          m_arrRuleInfo: [
            {
              m_bSelected: false,
              ruleCondition: data.condition,
              ruleId: `${maxRuleId + 1}`,
              ruleOperation: data.operation,
            },
          ],
        };
      }
    } else {
      temp.ActivityProperty = {
        ...temp.ActivityProperty,
        objPMRuleDetails: {
          m_arrRuleInfo: [
            {
              m_bSelected: false,
              ruleCondition: data.condition,
              ruleId: `${maxRuleId + 1}`,
              ruleOperation: data.operation,
            },
          ],
        },
      };
    }
    setlocalLoadedActivityPropertyData(temp);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.initialRules]: {
          isModified: true,
          hasError: false,
        },
      })
    );
  };
  // code edited on 5 August 2022 for BugId 110897
  const handleEditFields = (rule) => {
    let temp = JSON.parse(JSON.stringify(localLoadedActivityPropertyData));
    let idx = null;
    temp?.ActivityProperty?.objPMRuleDetails?.m_arrRuleInfo?.forEach(
      (el, index) => {
        if (+el.ruleId === +rule.ruleId) {
          idx = index;
        }
      }
    );
    if (idx !== null) {
      temp.ActivityProperty.objPMRuleDetails.m_arrRuleInfo[idx] = {
        ...temp.ActivityProperty.objPMRuleDetails.m_arrRuleInfo[idx],
        ruleCondition: rule.ruleCondition,
        ruleOperation: rule.ruleOperation,
      };
    }
    setlocalLoadedActivityPropertyData(temp);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.initialRules]: {
          isModified: true,
          hasError: false,
        },
      })
    );
  };

  // code edited on 5 August 2022 for BugId 110897
  const cancelEdit = (i, rule) => {
    let oldRule = null;
    localLoadedActivityPropertyData?.ActivityProperty?.objPMRuleDetails?.m_arrRuleInfo?.forEach(
      (el, index) => {
        if (+el.ruleId === +rule.ruleId) {
          oldRule = el;
        }
      }
    );
    const values = [...attachField];
    values[i] = {
      ...values[i],
      ruleCondition: oldRule.ruleCondition,
      ruleOperation: oldRule.ruleOperation,
      isEdited: false,
    };
    setAttachField(values);
  };

  ///mahtab code added

  function handleOnDragEnd(result) {
    if (!result.destination) return;

    const items = Array.from(attachField);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // updateCharacters(items);
    setAttachField(items);

    let tempLocal = { ...localLoadedActivityPropertyData };
    tempLocal.ActivityProperty.objPMRuleDetails.m_arrRuleInfo = items;
    tempLocal.ActivityProperty.objPMRuleDetails.m_arrRuleInfo.forEach(
      (data, i) => {
        data.ruleId = i + 1;
      }
    );

    setlocalLoadedActivityPropertyData(tempLocal);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.initialRules]: {
          isModified: true,
          hasError: false,
        },
      })
    );
  }

  return (
    <div>
      {spinner ? (
        <CircularProgress style={{ marginTop: "30vh", marginLeft: "40%" }} />
      ) : (
        <div
          className={`${styles.rule} ${
            props.isDrawerExpanded ? styles.expandedView : styles.collapsedView
          }`}
        >
          <div
            className={`${styles.attachmentHeader} ${
              props.isDrawerExpanded
                ? styles.expandedView
                : styles.collapsedView
            } row`}
          >
            <p className={styles.addAttachHeading}>{t("Rule(s)")}</p>
          </div>
          <table className={styles.tableDiv}>
            <thead className={styles.tableHeader}>
              <tr className={styles.tableHeaderRow}>
                {props.isDrawerExpanded && (
                  <td className={styles.serialDiv}></td>
                )}
                <td
                  className={`${styles.conditionDiv1} ${
                    direction === RTL_DIRECTION
                      ? arabicStyles.divHead
                      : styles.divHead
                  }`}
                >
                  {t("condition")}
                </td>
                <td
                  className={`${styles.operationDiv1} ${
                    direction === RTL_DIRECTION
                      ? arabicStyles.divHead
                      : styles.divHead
                  }`}
                >
                  {t("operation")}
                </td>
                <td className={styles.addDiv}>
                  {/* Changes made to solve Bug 132151 */}
                  {(!showInput || !props.isDrawerExpanded) && !isReadOnly && (
                    <button
                      id={"pmweb_Rule_AddAttachBtn"}
                      className={
                        direction === RTL_DIRECTION
                          ? arabicStyles.addAttachBtn
                          : styles.addAttachBtn
                      }
                      onClick={() => {
                        props.expandDrawer(true);
                        setShowInput(true);
                      }}
                    >
                      {t("add")}
                    </button>
                  )}
                </td>
              </tr>
            </thead>
            <tbody>
              {showInput && props.isDrawerExpanded && !isReadOnly && (
                <tr className={styles.showInput}>
                  <td
                    className={`${styles.serialDiv} ${
                      direction === RTL_DIRECTION
                        ? arabicStyles.divBody
                        : styles.divBody
                    }`}
                  ></td>
                  <td
                    className={`${styles.conditionDiv} ${
                      direction === RTL_DIRECTION
                        ? arabicStyles.divBody
                        : styles.divBody
                    }`}
                  >
                    <input
                      autoFocus
                      id="pmweb_Rule_Condition"
                      value={data.condition}
                      className={styles.ruleInput}
                      onChange={(e) => handleDataChange(e, t("condition"))}
                      name="condition"
                      aria-label="condition"
                      ref={conditionRef}
                      onKeyPress={(e) => {
                        FieldValidations(e, 10, conditionRef.current, 255);
                      }}
                    />
                    {errorMsg != "" &&
                    indexId === "" &&
                    opName === t("condition") ? (
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
                  </td>

                  <td
                    className={`${styles.operationDiv} ${
                      direction === RTL_DIRECTION
                        ? arabicStyles.divBody
                        : styles.divBody
                    }`}
                  >
                    <input
                      id="pmweb_Rule_Operation"
                      value={data.operation}
                      className={styles.ruleInput}
                      onChange={(e) => handleDataChange(e, t("operation"))}
                      name="operation"
                      aria-label="operation"
                      ref={operationRef}
                      onKeyPress={(e) => {
                        FieldValidations(e, 10, operationRef.current, 255);
                      }}
                    />
                    {errorMsg != "" &&
                    indexId === "" &&
                    opName === t("operation") ? (
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
                  </td>

                  <td
                    className={`${styles.addDiv} ${
                      direction === RTL_DIRECTION
                        ? arabicStyles.divBody
                        : styles.divBody
                    }`}
                  >
                    <button
                      id="pmweb_Rule_Cancel_Rule_Btn"
                      className={styles.cancelBtn}
                      onClick={() => {
                        setShowInput(false);
                        setData({ condition: "", operation: "" });
                      }}
                    >
                      {t("cancel")}
                    </button>
                    <button
                      id="pmweb_Rule_Add_Rule_Btn"
                      className={
                        data.condition?.trim() !== "" &&
                        data.operation?.trim() !== ""
                          ? styles.addBtn
                          : styles.disabledAddBtn
                      }
                      onClick={() => handleAddFields()}
                      disabled={
                        data.condition?.trim() === "" || //Changes made to solve Bug 136031,136033
                        data.operation?.trim() === ""
                      }
                    >
                      {t("add")}
                    </button>
                  </td>
                </tr>
              )}

              <DragDropContext onDragEnd={handleOnDragEnd}>
                <Droppable droppableId="characters">
                  {(provided) => (
                    <div
                      className="characters"
                      style={{ overflow: "scroll", height: "300px" }}
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                    >
                      {attachField?.map((item, i) => {
                        return (
                          <Draggable
                            draggableId={`${i}`}
                            key={`${i}`}
                            index={i}
                          >
                            {(provided) => (
                              <tr
                                className={styles.showInput1}
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                              >
                                {props.isDrawerExpanded && (
                                  <td
                                    className={`${styles.serialDiv} ${
                                      direction === RTL_DIRECTION
                                        ? arabicStyles.divBody
                                        : styles.divBody
                                    }`}
                                    onMouseOver={() => {
                                      if (!isReadOnly) {
                                        setshowDragIcon(true);
                                      }
                                    }}
                                    onMouseLeave={() => setshowDragIcon(false)}
                                    {...provided.dragHandleProps}
                                  >
                                    {showDragIcon ? (
                                      <span>
                                        <DragIndicatorOutlined />
                                      </span>
                                    ) : (
                                      <span>{i + 1}.</span>
                                    )}
                                  </td>
                                )}
                                {props.isDrawerExpanded && !isReadOnly ? (
                                  <td
                                    className={`${styles.conditionDiv} ${
                                      direction === RTL_DIRECTION
                                        ? arabicStyles.divBody
                                        : styles.divBody
                                    }`}
                                  >
                                    <input
                                      aria-label={`${item.ruleCondition}`}
                                      id={`pmweb_Rule_RuleCondition_${item.ruleCondition}`}
                                      className={styles.ruleInput}
                                      value={item.ruleCondition}
                                      onChange={(e) =>
                                        handleChange(e, i, t("condition"))
                                      }
                                      name="ruleCondition"
                                      ref={(item) =>
                                        (ruleConditonRef.current[i] = item)
                                      }
                                      onKeyPress={(e) => {
                                        FieldValidations(
                                          e,
                                          10,
                                          ruleConditonRef.current[i],
                                          255
                                        );
                                      }}
                                    />
                                    {errorMsg != "" &&
                                    indexId === i &&
                                    opName === t("condition") ? (
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
                                  </td>
                                ) : (
                                  <td
                                    className={`${styles.conditionDiv} ${
                                      direction === RTL_DIRECTION
                                        ? arabicStyles.divBody
                                        : styles.divBody
                                    }`}
                                  >
                                    {item.ruleCondition}
                                  </td>
                                )}

                                {props.isDrawerExpanded && !isReadOnly ? (
                                  <td
                                    className={`${styles.operationDiv} ${
                                      direction === RTL_DIRECTION
                                        ? arabicStyles.divBody
                                        : styles.divBody
                                    }`}
                                  >
                                    <input
                                      aria-label={`${item.ruleOperation}`}
                                      id={`pmweb_Rule_RuleOperation_${item.ruleOperation}`}
                                      className={styles.ruleInput}
                                      value={item.ruleOperation}
                                      onChange={(e) =>
                                        handleChange(e, i, t("operation"))
                                      }
                                      name="ruleOperation"
                                      ref={(item) =>
                                        (ruleOperationRef.current[i] = item)
                                      }
                                      onKeyPress={(e) => {
                                        FieldValidations(
                                          e,
                                          10,
                                          ruleOperationRef.current[i],
                                          255
                                        );
                                      }}
                                    />
                                    {errorMsg != "" &&
                                    indexId === i &&
                                    opName === t("operation") ? (
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
                                  </td>
                                ) : (
                                  <td
                                    className={`${styles.operationDiv} ${
                                      direction === RTL_DIRECTION
                                        ? arabicStyles.divBody
                                        : styles.divBody
                                    }`}
                                    style={{
                                      paddingLeft: props.isDrawerExpanded
                                        ? "0"
                                        : "0.2rem",
                                    }}
                                  >
                                    {item.ruleOperation}
                                  </td>
                                )}

                                <td
                                  className={`${styles.addDiv} ${
                                    direction === RTL_DIRECTION
                                      ? arabicStyles.divBody
                                      : styles.divBody
                                  }`}
                                >
                                  {/*code edited on 5 August 2022 for BugId 110897*/}
                                  {!isReadOnly &&
                                    (item.isEdited ? (
                                      <React.Fragment>
                                        <button
                                          id={"pmweb_Rule_Cancel_Edit_Btn"}
                                          className={styles.cancelBtn}
                                          onClick={() => cancelEdit(i, item)}
                                        >
                                          {t("cancel")}
                                        </button>
                                        <button
                                          className={
                                            item.ruleCondition?.trim() !== "" &&
                                            item.ruleOperation?.trim() !== ""
                                              ? styles.addBtn
                                              : styles.disabledAddBtn
                                          }
                                          onClick={() => handleEditFields(item)}
                                          disabled={
                                            // item.ruleCondition?.trim() === "" &&
                                            // item.ruleOperation?.trim() === ""
                                            //Modified on 04/12/2023, bug_id:139634
                                            item.ruleCondition?.trim() === "" ||
                                            item.ruleOperation?.trim() === ""
                                          }
                                        >
                                          {t("save")}
                                        </button>
                                      </React.Fragment>
                                    ) : (
                                      <IconButton
                                        aria-label="Delete_Rule"
                                        id={`pmweb_Rule_Delete_Rule_Btn_${item.ruleId}`}
                                        tabIndex={0}
                                        onClick={() =>
                                          handleRemoveFields(i, item.ruleId)
                                        }
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter") {
                                            handleRemoveFields(i, item.ruleId);
                                            e.stopPropagation();
                                          }
                                        }}
                                      >
                                        <DeleteOutlineIcon
                                          className={styles.cancelIcon}
                                        />
                                      </IconButton>
                                    ))}
                                </td>
                              </tr>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </tbody>
          </table>
        </div>
      )}

      {/* mahtab testing code */}

      {/*  <header className="App-header">
        <h1>Final Space Characters</h1>

        <DragDropContext onDragEnd={handleOnDragEnd}>
          <Droppable droppableId="characters">
            {(provided) => (
              <ul
                className="characters"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {characters.map((item, index) => {
                  return (
                    <Draggable
                      draggableId={`${index}`}
                      key={`${index}`}
                      index={index}
                    >
                      {(provided) => (
                        <li
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <div className="charactersthumb"></div>
                          <p>{item.name}</p>
                        </li>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>
      </header> */}
    </div>
  );
};
const mapDispatchToProps = (dispatch) => {
  return {
    expandDrawer: (flag) => dispatch(actionCreators.expandDrawer(flag)),
  };
};

const mapStateToProps = (state) => {
  return {
    isDrawerExpanded: state.isDrawerExpanded.isDrawerExpanded,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(InitialRule);
