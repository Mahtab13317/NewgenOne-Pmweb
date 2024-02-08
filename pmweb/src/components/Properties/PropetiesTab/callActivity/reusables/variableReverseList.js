// #BugID - 116391
// #BugDescription - Added the functionality for select all data.

// Changes made to solve Bug 126210 - call activity/process task>>add button is enabled without selecting any fields and also after adding the field

import { Checkbox, Grid } from "@material-ui/core";
import React, { useState, useEffect, useRef } from "react";
import SearchComponent from "../../../../../UI/Search Component/index.js";
import "../../callActivity/commonCallActivity.css";
import Button from "@material-ui/core/Button";
import NoResultFound from "../../../../../assets/NoSearchResult.svg";
import { propertiesLabel } from "../../../../../Constants/appConstants";
import { connect, useDispatch, useSelector } from "react-redux";
import { store, useGlobalState } from "state-pool";
import { getVariableType } from "../../../../../utility/ProcessSettings/Triggers/getVariableType.js";
import { setActivityPropertyChange } from "../../../../../redux-store/slices/ActivityPropertyChangeSlice.js";
import { useTranslation } from "react-i18next";
import { v4 as uuidv4 } from "uuid";

/*code edited on 6 Sep 2022 for BugId 115378 */
function VariableReverseList(props) {
  const { isReadOnly } = props;
  let { t } = useTranslation();
  const dispatch = useDispatch();

  let [queueVariablesList, setQueueVariablesList] = useState([]);
  let [searchTerm, setSearchTerm] = useState("");
  let [externalVariablesList, setExternalVariablesList] = useState([]);
  const [varDefinition, setVarDefinition] = useState([]);
  const [selectedVariables, setSelectedVariables] = useState([]);
  const [selectedVariableType, setSelectedVariableType] = useState(0);
  const loadedActivityPropertyData = store.getState("activityPropertyData");
  const [localLoadedActivityPropertyData] = useGlobalState(
    loadedActivityPropertyData
  );
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);

  const [isAllSelect, setIsAllSelect] = useState(false);
  const [addBtnDisable, setAddBtnDisable] = useState(false);
  const selectAllRef = useRef();
  const VarNameRef = useRef([]);
  // changes added for bug_id: 134226
  const windowInnerHeight = useSelector(
    (state) => state.setWindowInnerHeight.windowInnerHeight
  );

  const handleCheckChange = (selectedVariable) => {
    let temp = [...varDefinition];
    // temp?.map((v) => {
    temp?.forEach((v) => {
      if (v.VariableName === selectedVariable.VariableName) {
        v.isChecked = !v.isChecked;
      }
    });
    setVarDefinition(temp);

    if (selectedVariable.isChecked) {
      setSelectedVariables((prev) => {
        return [...prev, selectedVariable];
      });
    } else {
      setSelectedVariables((prev) => {
        let teList = [...prev];
        // teList.map((el, idx) => {
        teList?.forEach((el, idx) => {
          if (el.VariableName === selectedVariable.VariableName) {
            teList.splice(idx, 1);
          }
        });
        return teList;
      });
    }
    let allCheck = temp?.every((doc) => {
      return doc.isChecked === true;
    });
    setIsAllSelect(allCheck);
  };

  const addVariablesToList = () => {
    setIsAllSelect(false); //Code added to solve Bug 127714 dated 24thMay
    props.setShowVariablesModal(false);
    props.selectedVariables(selectedVariables);
    let tempArr = [];
    selectedVariables.map((v) => {
      tempArr.push(v.VarName);
    });

    let newJson =
      selectedVariableType == 0
        ? queueVariablesList.filter((d) => !tempArr.includes(d.VariableName))
        : externalVariablesList.filter(
            (d) => !tempArr.includes(d.VariableName)
          );
    selectedVariableType == 0
      ? setQueueVariablesList(newJson)
      : setExternalVariablesList(newJson);

    console.log("@@@", "ADD VAR", newJson);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel[props.propLabel]]: {
          isModified: true,
          hasError: true,
        },
      })
    );
  };

  // Changes made to solve Bug 122022 - Pmweb- call activity-> select all option is not working as expected
  useEffect(() => {
    setIsAllSelect(false);
  }, [selectedVariableType]);

  useEffect(() => {
    if (
      localLoadedActivityPropertyData?.ActivityProperty?.SubProcess?.importedProcessDefId?.trim() !==
      ""
    ) {
      let tempQueueVars = [];
      let tempExternalVars = [];
      localLoadedProcessData?.Variable?.forEach((variable) => {
        if (
          +variable.ExtObjectId === 0 &&
          variable.VariableScope === "U" &&
          variable.Unbounded === "N"
        ) {
          tempQueueVars.push(variable);
        } else if (
          +variable.ExtObjectId === 1 &&
          variable.VariableScope === "I" &&
          variable.Unbounded === "N"
        ) {
          tempExternalVars.push(variable);
        }
      });
      filterData(tempQueueVars, tempExternalVars);
      setSelectedVariables(props.selectedVariableList);
    }
  }, [
    selectedVariableType,
    props.selectedVariableList,
    localLoadedActivityPropertyData,
  ]);

  const filterData = (queueList, extList) => {
    let newQueueList = [];
    let newExtList = [];
    queueList?.forEach((list) => {
      let tempVariable = false;
      props.selectedVariableList?.forEach((variable) => {
        if (variable.VariableName === list.VariableName) {
          tempVariable = true;
        }
      });
      if (!tempVariable) {
        newQueueList.push(list);
      }
    });
    setQueueVariablesList(newQueueList);
    console.log("@@@", "EXT DATA", extList);

    extList?.forEach((list) => {
      let tempVariable = false;
      //Modified on 12/07/2023, bug_id:130722

      /* props.selectedVariableList?.forEach((variable) => {
        if (variable.VarName === list.VariableName) {
          tempVariable = true;
        }
      }); */
      props.selectedVariableList?.forEach((variable) => {
        if (variable.VariableName === list.VariableName) {
          tempVariable = true;
        }
      });
      if (!tempVariable) {
        newExtList.push(list);
      }
    });
    setExternalVariablesList(newExtList);
  };

  useEffect(() => {
    setVarDefinition(
      selectedVariableType == 0
        ? queueVariablesList?.map((x) => {
            return { ...x, isChecked: false };
          })
        : externalVariablesList?.map((x) => {
            return { ...x, isChecked: false };
          })
    );
  }, [queueVariablesList, externalVariablesList, selectedVariableType]);

  let filteredRows = varDefinition?.filter((row) => {
    if (searchTerm == "") {
      return row;
    } else if (row?.VarName?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return row;
    }
  });

  const selectAllData = (e) => {
    setIsAllSelect(e.target.checked);
    let tempData = [...varDefinition];
    tempData?.forEach((item) => {
      item.isChecked = e.target.checked;
      if (e.target.checked) {
        setSelectedVariables((prev) => {
          return [...prev, item];
        });
      } else {
        setSelectedVariables([]);
      }
    });
    setVarDefinition(tempData);
  };

  useEffect(() => {
    const varList = varDefinition.filter((d) => d.isChecked === true);
    if (varList?.length > 0) {
      setAddBtnDisable(false);
    } else {
      setAddBtnDisable(true);
    }
  }, [varDefinition]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: props.isDrawerExpanded ? "inherit" : "100%",
        //backgroundColor: props.isDrawerExpanded ? "white" : "",
        justifyContent: "space-between", //Bug 123920 - safari>>call activity>> add button is overlapping
      }}
    >
      <div>
        {filteredRows?.length === 0 && searchTerm?.trim() === "" ? null : (
          <SearchComponent
            style={{
              width: "93%",
              maxWidth: "93%",
              margin: "0.75rem 1vw 0.25rem",
            }}
            width={"342px"}
            setSearchTerm={setSearchTerm}
          />
        )}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            borderBottom: "1px solid #D6D6D6",
            padding: "10px 10px 0px 10px",
          }}
        >
          <p
            id="pmweb_VariableReverseList_BasicVariablesTab"
            onClick={() => setSelectedVariableType(0)}
            tabIndex={0}
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                setSelectedVariableType(0);
                e.stopPropagation();
              }
            }}
            style={{
              cursor: "pointer",
              fontSize: "12px",
              paddingBottom: "5px",
              borderBottom:
                selectedVariableType == 0
                  ? "3px solid var(--selected_tab_color)"
                  : null,
            }}
          >
            {t("basicVariables")}
          </p>
          <p
            id="pmweb_VariableReverseList_ExtendedVariablesTab"
            onClick={() => setSelectedVariableType(1)}
            tabIndex={0}
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                setSelectedVariableType(1);
                e.stopPropagation();
              }
            }}
            style={{
              cursor: "pointer",
              fontSize: "12px",
              marginLeft: "25px",
              paddingBottom: "5px",
              borderBottom:
                selectedVariableType == 1
                  ? "3px solid var(--selected_tab_color)"
                  : null,
            }}
          >
            {t("extendedVariables")}
          </p>
        </div>
        {/* -------------------------- */}
        {filteredRows?.length === 0 ? (
          // <>
          //   <img
          //     src={NoResultFound}
          //     alt={t("noResultsFound")}
          //     className={
          //       props.isDrawerExpanded
          //         ? direction === RTL_DIRECTION
          //           ? "noSearchResultImageExpandedArabic"
          //           : "noSearchResultImageExpanded"
          //         : "noSearchResultImage"    //Changes made to solve Bug 136850
          //     }
          //     // style={{
          //     //   width: props.isDrawerExpanded ? "12%" : "50%",
          //     //   height: "auto",
          //     // }}
          //   />
          //   <span
          //     className={
          //       props.isDrawerExpanded
          //         ? direction === RTL_DIRECTION
          //           ? "noVariablesPresentExpandedArabic"
          //           : "noVariablesPresentExpanded"
          //         : "noVariablesPresent"
          //     }
          //   >
          //     {searchTerm?.trim() !== ""
          //       ? t("noVariablesFound")
          //       : t("NoVariablesPresent")}
          //   </span>
          // </>
          <Grid
            container
            direction="column"
            justifyContent="center"
            alignItems="center"
            spacing={2}
          >
            <Grid item>
              <Grid
                container
                direction="column"
                justifyContent="center"
                alignItems="center"
                style={{ paddingTop: "15vh" }}
              >
                <Grid item>
                  <img
                    src={NoResultFound}
                    alt={t("noResultsFound")}
                    style={{
                      height: window.innerWidth < 1000 ? "16vh" : "23vh",
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
              <span>
                {searchTerm?.trim() !== ""
                  ? t("noVariablesFound")
                  : t("NoVariablesPresent")}
              </span>
            </Grid>
          </Grid>
        ) : filteredRows?.length > 0 ? (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                borderBottom: "1px solid #D6D6D6",
                padding: window.innerWidth < 1000 ? "1vh" : "1.5vh",
              }}
            >
              <label
                style={{ display: "none" }}
                htmlFor={`pmweb_VariableList_SelectAll_`}
              >
                selectAll
              </label>
              <Checkbox
                id={`pmweb_VariableList_SelectAll_`}
                style={{
                  borderRadius: "1px",
                  padding: "0",
                }}
                disabled={isReadOnly}
                checked={isAllSelect}
                onChange={selectAllData}
                inputRef={selectAllRef}
                onKeyUp={(e) => {
                  if (e.key === "Enter") {
                    selectAllRef.current.click();
                    e.stopPropagation();
                  }
                }}
                inputProps={{ "aria-label": t("selectAll") }}
              />
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <p
                  style={{
                    fontSize: "11px",
                    color: "black",
                    marginLeft: "15px",
                  }}
                >
                  {t("selectAll")}
                </p>
              </div>
            </div>
            <div
              style={{
                overflowY: "scroll",
                height: "30vh",
                // height: `calc(${windowInnerHeight}px - ${headerHeight} - ${
                //   filteredRows?.length === 0 && searchTerm?.trim() !== ""
                //     ? props.isDrawerExpanded
                //       ? "19rem"
                //       : "7.5rem"
                //     : props.isDrawerExpanded
                //     ? "26rem"
                //     : "14.5rem"
                // })`,
                scrollbarColor: "#dadada #fafafa",
                scrollbarWidth: "thin",
              }}
            >
              {filteredRows.map((variable, index) => {
                return (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderBottom: "1px solid #D6D6D6",
                      padding: "5px 10px 5px 10px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <label
                        style={{ display: "none" }}
                        htmlFor={`pmweb_VariableList_IndividualVarCheckbox_${index}`}
                      >
                        Checkbox
                      </label>
                      <Checkbox
                        id={`pmweb_VariableList_IndividualVarCheckbox_${index}`}
                        onChange={() => handleCheckChange(variable)}
                        checked={variable.isChecked}
                        style={{
                          borderRadius: "1px",
                          padding: "0",
                        }}
                        disabled={isReadOnly}
                        inputRef={(item) => (VarNameRef.current[index] = item)}
                        onKeyUp={(e) => {
                          if (e.key === "Enter") {
                            VarNameRef.current[index].click();
                            e.stopPropagation();
                          }
                        }}
                        inputProps={{ "aria-label": variable.VarName }}
                      />
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          marginLeft: "15px",
                        }}
                      >
                        <p style={{ fontSize: "12px", color: "black" }}>
                          {variable.VariableName}
                        </p>
                        <span style={{ fontSize: "12px", color: "#606060" }}>
                          {variable.SystemDefinedName}
                        </span>
                      </div>
                    </div>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "black",
                        textTransform: "uppercase",
                      }}
                    >
                      {getVariableType(variable.VariableType)}
                    </p>
                  </div>
                );
              })}
            </div>
          </>
        ) : null}
      </div>
      {
        //Added on 22/05/2023, bug_id:127623
      }
      {filteredRows?.length === 0 ? null : (
        <div
          style={{
            display: "flex",
            //padding: "5px 10px",
            //Bug 123920 - safari>>call activity>> add button is overlapping
            // width: props.isDrawerExpanded ? "22.8%" : "100%",
            // bottom: "0%",
            // position: "absolute",
            justifyContent: "end",
            backgroundColor: "rgb(248, 248, 248)",
          }}
        >
          {props.isDrawerExpanded ? null : (
            <Button
              variant="outlined"
              onClick={() => props.setShowVariablesModal(false)}
              id="close_AddVariableModal_CallActivity"
              disabled={isReadOnly}
            >
              {t("cancel")}
            </Button>
          )}
          <Button
            id="add_AddVariableModal_CallActivity"
            onClick={() => addVariablesToList()}
            variant="contained"
            color="primary"
            disabled={filteredRows?.length === 0 || isReadOnly || addBtnDisable}
          >
            {t("add")}
          </Button>
        </div>
      )}
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    isDrawerExpanded: state.isDrawerExpanded.isDrawerExpanded,
  };
};

export default connect(mapStateToProps, null)(VariableReverseList);
