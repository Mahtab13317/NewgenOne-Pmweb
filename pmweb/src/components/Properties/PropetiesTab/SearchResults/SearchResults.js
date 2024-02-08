// #BugID - 112988
// #BugDescription - Search result check/uncheck issue fixed.

import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { store, useGlobalState } from "state-pool";
import { connect, useDispatch } from "react-redux";
import styles from "./index.module.css";
import { setActivityPropertyChange } from "../../../../redux-store/slices/ActivityPropertyChangeSlice";
import {
  Checkbox,
  FormControlLabel,
  FormGroup,
  Tooltip,
  Grid,
} from "@material-ui/core";
import DragIndicatorOutlinedIcon from "@material-ui/icons/DragIndicatorOutlined";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { propertiesLabel } from "../../../../Constants/appConstants.js";
import TabsHeading from "../../../../UI/TabsHeading";
import { isReadOnlyFunc } from "../../../../utility/CommonFunctionCall/CommonFunctionCall";

function SearchResults(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const dispatch = useDispatch();
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const loadedActivityPropertyData = store.getState("activityPropertyData");
  const [localLoadedActivityPropertyData, setlocalLoadedActivityPropertyData] =
    useGlobalState(loadedActivityPropertyData);
  const [check, setCheck] = useState({});
  const [checkedVal, setCheckedVal] = useState([]);
  const [allVariable, setallVariable] = useState([]);
  const [selectAllCheck, setSelectAllCheck] = useState(false);
  const allSelectRef = useRef();
  const VarNameRef = useRef([]);
  let isReadOnly =
    props.openTemplateFlag ||
    isReadOnlyFunc(
      localLoadedProcessData,
      props.cellCheckedOut,
      props.cellLaneId
    );

  function createData(VariableName, VariableId) {
    return { VariableName, VariableId };
  }

  // code edited on 4 April 2023 for BugId 126293
  useEffect(() => {
    if (localLoadedActivityPropertyData?.Status === 0) {
      let temp = [
        ...localLoadedActivityPropertyData?.ActivityProperty?.searchInfo
          ?.searchResultList,
      ];
      let variable = localLoadedProcessData?.Variable?.filter(
        (val) =>
          (val.VariableScope === "U" || val.VariableScope === "I") &&
          val.VariableType !== "11" &&
          val.VariableType !== "18" && // code edited on 15 April 2023 for BugId 126497 - restrict ntext type variable
          val.Unbounded === "N"
      );
      let tempVariable = [];
      temp?.forEach((val) => {
        tempVariable.push(val.varName);
      });

      let tempAllVar = [];
      let tempCheckedVal = [];
      variable.forEach((val) => {
        if (tempVariable.includes(val.VariableName)) {
          tempAllVar.push(val);
          tempCheckedVal.push({
            name: val.VariableName,
            id: val.VariableId,
            checkVal: true,
          });
        } else {
          tempAllVar.push(val);
          tempCheckedVal.push({
            name: val.VariableName,
            id: val.VariableId,
            checkVal: false,
          });
        }
      });
      setallVariable(tempAllVar);

      let tempCheck = {};
      tempAllVar?.forEach((el) => {
        if (tempVariable.includes(el.VariableName)) {
          tempCheck = { ...tempCheck, [el.VariableName]: true };
        } else {
          tempCheck = { ...tempCheck, [el.VariableName]: false };
        }
      });
      setCheck(tempCheck);
      setCheckedVal(tempCheckedVal);
      let areAllValTrue = true;
      tempCheckedVal?.forEach((element) => {
        if (element.checkVal === false) {
          areAllValTrue = false;
        }
      });
      setSelectAllCheck(areAllValTrue);
    }
  }, [localLoadedActivityPropertyData, localLoadedProcessData?.Variable]);

  const rows = allVariable.map((val) => {
    return createData(val.VariableName, val.VariableId);
  });

  // Function that runs when user clicks on select all option in search rights.
  const checkAllHandler = () => {
    let isChecked = false;
    setSelectAllCheck((prevState) => {
      isChecked = !prevState;
      return !prevState;
    });
    let listOfKeys = Object.keys(check);
    let tempObj = JSON.parse(JSON.stringify(check));
    listOfKeys?.forEach((element) => {
      tempObj[element] = isChecked;
    });
    setCheck(tempObj);
    let tempArr = JSON.parse(JSON.stringify(checkedVal));
    tempArr?.forEach((element) => {
      element.checkVal = isChecked;
    });
    setCheckedVal(tempArr);

    let checkData = tempArr;
    let filterList = checkData.filter((d) => d.checkVal === true);
    let filterData = [];
    filterList.forEach((el, j) => {
      filterData.push({
        varName: el.name,
        variableId: el.id,
      });
    });
    // modified on 18/09/23 for BugId 137282
    // let tempData = { ...localLoadedActivityPropertyData };
    let tempData = JSON.parse(JSON.stringify(localLoadedActivityPropertyData));
    // till here BugId 137282
    tempData.ActivityProperty.searchInfo.searchResultList = filterData;
    setlocalLoadedActivityPropertyData(tempData);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.searchResults]: {
          isModified: true,
          hasError: false,
        },
      })
    );
  };

  // Function that gets called when user clicks on individual checkbox in search rights.
  const checkboxHandler = (VariableName, e, index) => {
    let isAllChecked = true;
    let data = { ...check };
    data[VariableName] = e.target.checked;
    setCheck(data);
    let checkData = [...checkedVal];
    checkData.forEach((item, i) => {
      if (item.name === VariableName) {
        item.checkVal = e.target.checked;
      }
    });
    checkData?.forEach((element) => {
      if (element.checkVal === false) {
        isAllChecked = false;
      }
    });
    setSelectAllCheck(isAllChecked);
    setCheckedVal(checkData);

    let filterList = checkData.filter((d) => d.checkVal === true);
    let filterData = [];
    filterList.forEach((el, j) => {
      filterData.push({
        varName: el.name,
        variableId: el.id,
      });
    });
    // modified on 18/09/23 for BugId 137282
    // let tempData = { ...localLoadedActivityPropertyData };
    let tempData = JSON.parse(JSON.stringify(localLoadedActivityPropertyData));
    // till here BugId 137282
    tempData.ActivityProperty.searchInfo.searchResultList = filterData;
    setlocalLoadedActivityPropertyData(tempData);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.searchResults]: { isModified: true, hasError: false },
      })
    );
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;
    let temp = [...allVariable];
    const [reOrderedPickListItem] = temp.splice(source.index, 1);
    temp.splice(destination.index, 0, reOrderedPickListItem);
    setallVariable(temp);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.searchResults]: { isModified: true, hasError: false },
      })
    );
  };

  return (
    <React.Fragment>
      <TabsHeading heading={props?.heading} />
      <div className={styles.SearchVariable} style={{ direction: direction }}>
        <div style={{ width: props.isDrawerExpanded ? "60%" : "98%" }}>
          <table style={{ display: "block" }}>
            <thead style={{ background: "#F8F8F8", display: "block" }}>
              <Grid container xs={12} justifyContent="space-between">
                <Grid item xs={6}>
                  <th
                    className={styles.variableName}
                    style={{
                      paddingInlineStart: "2vw",
                    }}
                  >
                    {t("variableName")}
                  </th>
                </Grid>
                <Grid item xs={6}>
                  <th className={styles.searchRights}>
                    <FormGroup>
                      <FormControlLabel
                        control={
                          <Checkbox
                            id="pmweb_SearchResults_SearchResults"
                            checked={selectAllCheck}
                            onChange={checkAllHandler}
                            disabled={isReadOnly}
                            style={{
                              height: "1.5rem",
                            }}
                            inputRef={allSelectRef}
                            onKeyUp={(e) => {
                              if (e.key === "Enter") {
                                allSelectRef.current.click();
                                e.stopPropagation();
                              }
                            }}
                          />
                        }
                        label={t("searchRights")}
                      />
                    </FormGroup>
                  </th>
                </Grid>
              </Grid>
            </thead>

            <DragDropContext onDragEnd={onDragEnd}>
              <tbody style={{ display: "block" }}>
                <Droppable droppableId="pickListInputs">
                  {(provided) => (
                    <div
                      className="inputs"
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      style={{ height: "28rem", overflow: "auto" }}
                    >
                      {rows?.map((row, index) => {
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
                                <tr
                                  style={{
                                    height: "35px",
                                    // padding: "12px",
                                    background: index % 2 ? "#f8f8f8" : null,
                                    display: "block",
                                  }}
                                >
                                  <Grid
                                    container
                                    xs={12}
                                    justifyContent="space-between"
                                  >
                                    <Grid item xs={6}>
                                      <td
                                        className={styles.variableName}
                                        style={{
                                          width: props.isDrawerExpanded
                                            ? "20vw"
                                            : "14vw",
                                        }}
                                      >
                                        <div
                                          {...provided.dragHandleProps}
                                          style={{
                                            height: "1.25rem",
                                          }}
                                        >
                                          {!isReadOnly && (
                                            <DragIndicatorOutlinedIcon
                                              style={{
                                                height: "1.25rem",
                                                width: "1.25rem",
                                              }}
                                            />
                                          )}
                                        </div>
                                        {/*For Bug 135934 we have added tooltip to handle large text and make the UI work well o responsive screens*/}
                                        <Tooltip
                                          title={row.VariableName}
                                          placement="bottom-start"
                                        >
                                          <span
                                            style={{
                                              fontSize:
                                                "var(--base_text_font_size)",
                                              marginTop: "4px",
                                              overflow: "hidden",
                                              whiteSpace: "nowrap",
                                              textOverflow: "ellipsis",
                                              width: "90%",
                                            }}
                                          >
                                            {row.VariableName}
                                          </span>
                                        </Tooltip>
                                        {/*Till here*/}
                                      </td>
                                    </Grid>
                                    <Grid item xs={6}>
                                      <td
                                        className={styles.searchRights}
                                        style={{
                                          width: props.isDrawerExpanded
                                            ? "20vw"
                                            : "8vw",
                                        }}
                                      >
                                        <FormGroup>
                                          <FormControlLabel
                                            label={
                                              <div
                                                style={{ display: "none" }}
                                              >{`${row.VariableName}`}</div>
                                            }
                                            control={
                                              <Checkbox
                                                id={`pmweb_SearchResults_VariableName_Checkbox`}
                                                checked={
                                                  check[row.VariableName]
                                                }
                                                onChange={(e) =>
                                                  checkboxHandler(
                                                    row.VariableName,
                                                    e,
                                                    index
                                                  )
                                                }
                                                style={{
                                                  height: "14px",
                                                  width: "14px",
                                                }}
                                                disabled={isReadOnly}
                                                inputRef={(item) =>
                                                  (VarNameRef.current[index] =
                                                    item)
                                                }
                                                onKeyUp={(e) => {
                                                  if (e.key === "Enter") {
                                                    VarNameRef.current[
                                                      index
                                                    ].click();
                                                    e.stopPropagation();
                                                  }
                                                }}
                                              />
                                            }
                                          />
                                        </FormGroup>
                                      </td>
                                    </Grid>
                                  </Grid>
                                </tr>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </tbody>
            </DragDropContext>
          </table>
        </div>
      </div>
    </React.Fragment>
  );
}

const mapStateToProps = (state) => {
  return {
    cellCheckedOut: state.selectedCellReducer.selectedCheckedOut,
    cellLaneId: state.selectedCellReducer.selectedActLaneId,
    isDrawerExpanded: state.isDrawerExpanded.isDrawerExpanded,
    openTemplateFlag: state.openTemplateReducer.openFlag,
  };
};

export default connect(mapStateToProps, null)(SearchResults);
