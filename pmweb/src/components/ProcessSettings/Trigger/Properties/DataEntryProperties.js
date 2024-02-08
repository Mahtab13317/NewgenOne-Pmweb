// #BugID - 106096 (Trigger Bug)
// #BugDescription - Implemented Searching in Data Entry Type Trigger
// #BugID - 122007
// #BugDescription - Implemented filter functionality in Data Entry Type Trigger

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import styles from "./properties.module.css";
import arabicStyles from "./propertiesArabicStyles.module.css";
import { connect } from "react-redux";
import * as actionCreators from "../../../../redux-store/actions/Trigger";
import DataTable from "../Properties/Components/DataTable";
import { store, useGlobalState } from "state-pool";
import SearchBox from "../../../../UI/Search Component/index";
import filter from "../../../../assets/Tiles/Filter.svg";
import {
  RTL_DIRECTION,
  PROCESSTYPE_REGISTERED,
  COMPLEX_VARTYPE,
  USER_DEFINED_VARIABLE,
  COMPLEX_EXTENDED_VARIABLE,
  hideComplexFromVariables,
} from "../../../../Constants/appConstants";
import { LatestVersionOfProcess } from "../../../../utility/abstarctView/checkLatestVersion";
import { Checkbox, FormControlLabel } from "@material-ui/core";
import { getComplex } from "../../../../utility/CommonFunctionCall/CommonFunctionCall";

function DataEntryProperties(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const loadedVariables = localLoadedProcessData?.Variable;
  const [variableList, setVariableList] = useState(loadedVariables);
  const [variableListTemp, setVariableListTemp] = useState(loadedVariables);
  const [addedVariableList, setAddedVariableList] = useState([]);
  const [addedVariableListTemp, setAddedVariableListTemp] = useState([]);
  const [existingTrigger, setExistingTrigger] = useState(false);
  const [editView, setEditView] = useState(true);
  let [searchTerm, setSearchTerm] = useState("");
  let [removeSearchTerm, setRemoveSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filterCount, setFilterCount] = useState(0);
  const [selectCount, setSelectCount] = useState(0);

  const [filterDropdown, setFilterDropdown] = useState([
    { id: 3, type: "INTEGER", checkVal: false },
    { id: 6, type: "FLOAT", checkVal: false },
    { id: 4, type: "LONG", checkVal: false },
    { id: 10, type: "STRING", checkVal: false },
    { id: 8, type: "DATE", checkVal: false },
  ]);

  const [showFiltersMain, setShowFiltersMain] = useState(false);
  const [filterCountMain, setFilterCountMain] = useState(0);
  const [selectCountMain, setSelectCountMain] = useState(0);

  const [filterDropdownMain, setFilterDropdownMain] = useState([
    { id: 3, type: "INTEGER", checkVal: false },
    { id: 6, type: "FLOAT", checkVal: false },
    { id: 4, type: "LONG", checkVal: false },
    { id: 10, type: "STRING", checkVal: false },
    { id: 8, type: "DATE", checkVal: false },
  ]);

  let readOnlyProcess =
    props.isReadOnly ||
    props.openProcessType === PROCESSTYPE_REGISTERED ||
    props.openProcessType === "RC" ||
    LatestVersionOfProcess(localLoadedProcessData?.Versions) !==
      +localLoadedProcessData?.VersionNo; // modified on 05/09/2023 for Bugid 136103;

  useEffect(() => {
    if (loadedVariables) {
      setVariableListInitially();
    }
  }, [loadedVariables]);

  const setVariableListInitially = () => {
    if (loadedVariables) {
      let variableWithConstants = [];
      // commented on 31/08/2023 for BugId 135408
      // localLoadedProcessData?.DynamicConstant?.forEach((element) => {
      //   let tempObj = {
      //     VariableName: element.ConstantName,
      //     VariableScope: "C",
      //     ExtObjectId: "0",
      //     VarFieldId: "0",
      //     VariableId: "0",
      //   };
      //   variableWithConstants.push(tempObj);
      // });

      loadedVariables?.forEach((element) => {
        // modified on 31/08/2023 for BugId 135408
        if (
          element.VariableScope === USER_DEFINED_VARIABLE ||
          element.VariableScope === COMPLEX_EXTENDED_VARIABLE
        ) {
          if (
            (hideComplexFromVariables &&
              element.VariableType !== COMPLEX_VARTYPE) ||
            !hideComplexFromVariables
          ) {
            variableWithConstants.push(element);
          }
        }
      });
      let tempVarList = [];
      variableWithConstants.forEach((_var) => {
        if (_var.VariableType === COMPLEX_VARTYPE) {
          let tempList = getComplex(_var);
          tempList?.forEach((el) => {
            tempVarList.push(el);
          });
        } else {
          tempVarList.push(_var);
        }
      });
      setVariableList(tempVarList);
      setVariableListTemp(tempVarList);
    }
  };

  useEffect(() => {
    props.setTriggerProperties([]);
  }, []);

  useEffect(() => {
    if (props.reload) {
      props.setTriggerProperties([]);
      setAddedVariableList([]);
      setAddedVariableListTemp([]);
      //setVariableList(loadedVariables);
      setVariableListInitially();
      //setVariableListTemp(loadedVariables);
      setEditView(true);
      // code added on 16 Dec 2022 for BugId 120240
      setExistingTrigger(false);
      props.setReload(false);
    }
  }, [props.reload]);

  useEffect(() => {
    if (props.initialValues) {
      setAddedVariableList(props.DataEntry);
      setAddedVariableListTemp(props.DataEntry);
      setVariableList((prev) => {
        let prevData = [...prev];
        return prevData?.filter((data) => {
          if (
            props.DataEntry &&
            props?.DataEntry?.findIndex(
              (deObj) => deObj?.VariableName === data.VariableName
            ) === -1
          ) {
            return data;
          }
        });
      });
      setVariableListTemp((prev) => {
        let prevData = [...prev];
        return prevData?.filter((data) => {
          if (
            props.DataEntry &&
            props?.DataEntry?.findIndex(
              (deObj) => deObj?.VariableName === data.VariableName
            ) === -1
          ) {
            return data;
          }
        });
      });
      setEditView(false);
      setExistingTrigger(true);
      props.setInitialValues(false);
    }
  }, [props.initialValues]);

  useEffect(() => {
    if (addedVariableList?.length > 0) {
      props.setTriggerProperties(addedVariableList);
    } else {
      props.setTriggerProperties([]);
    }
  }, [addedVariableList]);

  //code modified on 06-10-23 for bug id 135207
  const addAllVariable = () => {
    setFilterCountMain(0);
    if (existingTrigger) {
      props.setTriggerEdited(true);
    }
    setAddedVariableList((prev) => {
      let newData = [...prev];
      variableList.forEach((data) => {
        newData.push(data);
      });
      return newData;
    });
    setAddedVariableListTemp((prev) => {
      let newData = [...prev];
      variableList.forEach((data) => {
        newData.push(data);
      });
      return newData;
    });
    setVariableList([]);
    //setVariableListTemp([]);
    setVariableListTemp((prev) => {
      let prevData = [...prev];
      return prevData?.filter((data) => {
        if (
          variableList &&
          variableList?.findIndex(
            (deObj) => deObj?.VariableName === data.VariableName
          ) === -1
        ) {
          return data;
        }
      });
    });
  };

  let filteredRows = variableList?.filter(
    (row) =>
      searchTerm?.trim() === "" ||
      row?.VariableName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  let filteredRowsRemove = addedVariableList?.filter(
    (row) =>
      removeSearchTerm?.trim() === "" ||
      row?.VariableName?.toLowerCase().includes(removeSearchTerm.toLowerCase())
  );

  const addOneVariable = (variable) => {
    if (existingTrigger) {
      props.setTriggerEdited(true);
    }
    /* setAddedVariableList((prev) => {
      return [...prev, variable];
    });*/
    let filterList = filterDropdown.filter((d) => d.checkVal === true);
    let filterData = [...filterDropdown];
    let myArrayFiltered = [];
    if (filterList.length > 0) {
      let varList = [...addedVariableListTemp, variable];

      myArrayFiltered = varList.filter((el) => {
        return filterList.some((f) => {
          return +f.id === +el.VariableType;
        });
      });

      setAddedVariableList(myArrayFiltered);
      setFilterCount(myArrayFiltered.length);
    } else {
      setAddedVariableList([...addedVariableListTemp, variable]);
    }
    setAddedVariableListTemp((prev) => {
      return [...prev, variable];
    });
    setVariableList((prev) => {
      let prevData = [...prev];
      return prevData?.filter((data) => {
        if (
          data.VariableId !== variable.VariableId ||
          (data.VariableId === variable.VariableId &&
            data.VarFieldId !== variable.VarFieldId)
        ) {
          return data;
        }
      });
    });
    setVariableListTemp((prev) => {
      let prevData = [...prev];
      return prevData?.filter((data) => {
        if (
          data.VariableId !== variable.VariableId ||
          (data.VariableId === variable.VariableId &&
            data.VarFieldId !== variable.VarFieldId)
        ) {
          return data;
        }
      });
    });
  };

  const removeAllVariable = () => {
    setFilterCount(0);
    if (existingTrigger) {
      props.setTriggerEdited(true);
    }
    let filterList = filterDropdownMain.filter((d) => d.checkVal === true);
    let filterData = [...filterDropdownMain];
    let myArrayFiltered = [];
    if (filterList.length > 0) {
      let varList = [...variableListTemp, ...addedVariableList];

      myArrayFiltered = varList.filter((el) => {
        return filterList.some((f) => {
          return +f.id === +el.VariableType;
        });
      });
      setVariableList([...myArrayFiltered]);
    } else {
      setVariableList([...variableListTemp, ...addedVariableList]);
    }
    /* setVariableList((prev) => {
      let newData = [...prev];
      addedVariableList.forEach((data) => {
        if (data) {
          newData.push(data);
        }
      });
      return newData;
    });*/
    setVariableListTemp((prev) => {
      let newData = [...prev];
      addedVariableList.forEach((data) => {
        newData.push(data);
      });
      return newData;
    });
    setAddedVariableList([]);
    // setAddedVariableListTemp([]);
    setAddedVariableListTemp((prev) => {
      let prevData = [...prev];
      return prevData?.filter((data) => {
        if (
          addedVariableList &&
          addedVariableList?.findIndex(
            (deObj) => deObj?.VariableName === data.VariableName
          ) === -1
        ) {
          return data;
        }
      });
    });
  };

  const removeOneVariable = (variable) => {
    if (existingTrigger) {
      props.setTriggerEdited(true);
    }
    let filterList = filterDropdownMain.filter((d) => d.checkVal === true);

    let myArrayFiltered = [];
    if (filterList.length > 0) {
      let varList = [...variableListTemp, variable];

      myArrayFiltered = varList.filter((el) => {
        return filterList.some((f) => {
          return +f.id === +el.VariableType;
        });
      });
      setVariableList([...myArrayFiltered]);
      setFilterCountMain(myArrayFiltered.length);
    } else {
      setVariableList([...variableListTemp, variable]);
    }
    /* setVariableList((prev) => {
      return [...prev, variable];
    });*/
    setVariableListTemp((prev) => {
      return [...prev, variable];
    });
    setAddedVariableList((prevContent) => {
      let prevData = [...prevContent];
      return prevData?.filter((dataContent) => {
        if (
          dataContent.VariableId !== variable.VariableId ||
          (dataContent.VariableId === variable.VariableId &&
            dataContent.VarFieldId !== variable.VarFieldId)
        ) {
          return dataContent;
        }
      });
    });
    setAddedVariableListTemp((prevContent) => {
      let prevData = [...prevContent];
      return prevData?.filter((dataContent) => {
        if (
          dataContent.VariableId !== variable.VariableId ||
          (dataContent.VariableId === variable.VariableId &&
            dataContent.VarFieldId !== variable.VarFieldId)
        ) {
          return dataContent;
        }
      });
    });
  };

  //filter function for added variables
  const filterFunc = (e, index) => {
    let tempData = [...filterDropdown];
    tempData[index].checkVal = e.target.checked;
    setFilterDropdown(tempData);
    setSelectCount(tempData.filter((d) => d.checkVal === true).length);
  };

  //apply filter for added variables
  const applyFilterFunc = () => {
    let filterList = filterDropdown.filter((d) => d.checkVal === true);
    let filterData = [...filterDropdown];
    let myArrayFiltered = [];
    if (filterList.length > 0) {
      let varList = [...addedVariableListTemp];

      myArrayFiltered = varList.filter((el) => {
        return filterList.some((f) => {
          return +f.id === +el.VariableType;
        });
      });

      setAddedVariableList(myArrayFiltered);
    } else {
      filterData.forEach((data) => {
        data.checkVal = false;
      });
      setFilterDropdown(filterData);
      setAddedVariableList(addedVariableListTemp);
    }

    setFilterCount(myArrayFiltered?.length);

    setShowFilters(false);
  };

  //clear filter for added variables

  const clearFilter = () => {
    let filterData = [...filterDropdown];
    filterData.forEach((data) => {
      data.checkVal = false;
    });
    setFilterDropdown(filterData);
  };

  //filter function for main variables
  const filterFuncMainList = (e, index) => {
    let tempData = [...filterDropdownMain];
    tempData[index].checkVal = e.target.checked;
    setFilterDropdownMain(tempData);
    setSelectCountMain(tempData.filter((d) => d.checkVal === true).length);
  };

  //apply filter for main variables
  const applyFilterFuncMainList = () => {
    let filterList = filterDropdownMain.filter((d) => d.checkVal === true);
    let filterData = [...filterDropdownMain];
    let myArrayFiltered = [];
    if (filterList.length > 0) {
      let varList = [...variableListTemp];

      myArrayFiltered = varList.filter((el) => {
        return filterList.some((f) => {
          return +f.id === +el.VariableType;
        });
      });
      setVariableList((prev) => {
        let prevData = [...myArrayFiltered];
        return prevData?.filter((data) => {
          if (
            addedVariableListTemp &&
            addedVariableListTemp?.findIndex(
              (deObj) => deObj?.VariableName === data.VariableName
            ) === -1
          ) {
            return data;
          }
        });
      });
      // setVariableList(myArrayFiltered);
    } else {
      filterData.forEach((data) => {
        data.checkVal = false;
      });
      setFilterDropdownMain(filterData);

      //setVariableList(variableListTemp);
      setVariableList((prev) => {
        let prevData = [...variableListTemp];
        return prevData?.filter((data) => {
          if (
            addedVariableListTemp &&
            addedVariableListTemp?.findIndex(
              (deObj) => deObj?.VariableName === data.VariableName
            ) === -1
          ) {
            return data;
          }
        });
      });
    }

    setFilterCountMain(myArrayFiltered?.length);

    setShowFiltersMain(false);
  };

  //clear filter for main variables

  const clearFilterMainList = () => {
    let filterData = [...filterDropdownMain];
    filterData.forEach((data) => {
      data.checkVal = false;
    });
    setFilterDropdownMain(filterData);
  };

  return (
    <div className={styles.propertiesMainView}>
      <div
        className={
          direction === RTL_DIRECTION
            ? `${arabicStyles.triggerNameTypeDiv} flex1`
            : `${styles.triggerNameTypeDiv} flex1`
        }
      >
        <div className={`${styles.mb025} flex`}>
          <div className="flex flex2">
            <p
              className={
                editView
                  ? `${styles.dataEntryHeading} ${styles.mr05} flex4`
                  : `${styles.dataEntryHeading} ${styles.mr05} flex3`
              }
            >
              {t("allowedDataEntryFields")}
            </p>
            <div className="flex2">
              <SearchBox
                width="100%"
                title={"pmweb_trigger_de_removeDivSearch"}
                setSearchTerm={setRemoveSearchTerm}
                ariaDescription={`${t("allowedDataEntryFields")}`}
              />
            </div>

            <div className="relative">
              <button
                className={`${styles.filterTriggerButton} flex05`}
                onClick={() => {
                  setShowFilters(true);
                }}
              >
                <img src={filter} alt="Filter Count" />
                {filterCount > 0 && (
                  <span
                    className={
                      direction === RTL_DIRECTION
                        ? arabicStyles.filterCount
                        : styles.filterCount
                    }
                  >
                    {filterCount}
                  </span>
                )}
              </button>
              {showFilters ? (
                <div
                  className={
                    direction === RTL_DIRECTION
                      ? arabicStyles.filterDiv
                      : styles.filterDiv
                  }
                >
                  <div className={styles.filterDivHeader}>
                    <span className={styles.filterHeading}>{t("Filters")}</span>
                    {selectCount > 0 ? (
                      <span
                        className={styles.filterClearBtn}
                        onClick={() => {
                          clearFilter();
                        }}
                        tabIndex={0}
                        onKeyUp={(e) => {
                          if (e.key === "Enter") {
                            clearFilter();
                          }
                        }}
                      >
                        {t("clear")}
                      </span>
                    ) : null}
                  </div>
                  <div className={styles.filterMainBody}>
                    <label>{t("definitionType")}</label>

                    {filterDropdown?.map((el, i) => {
                      return (
                        <FormControlLabel
                          key={el?.id}
                          control={
                            <Checkbox
                              checked={el?.checkVal}
                              onChange={(e) => {
                                filterFunc(e, i);
                              }}
                              id={`filter_${el.id}`}
                              tabIndex={-1}
                            />
                          }
                          className={styles.properties_radioButton}
                          label={el.type}
                          style={{ marginTop: "0.5rem" }}
                          onKeyUp={(e) => {
                            if (e.key === "Enter") {
                              filterFunc(
                                {
                                  ...e,
                                  target: {
                                    ...e.target,
                                    checked: !el.checkVal,
                                  },
                                },
                                i
                              );
                            }
                          }}
                          tabIndex={0}
                        />
                      );
                    })}
                  </div>
                  <div className={styles.filterDivFooter}>
                    <button
                      className={styles.filterCancelBtn}
                      onClick={() => {
                        setShowFilters(false);
                      }}
                    >
                      {t("cancel")}
                    </button>
                    <button
                      className={styles.filterApplyBtn}
                      onClick={() => applyFilterFunc()}
                    >
                      {t("apply")}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {!editView && (
            <div className="right flex1">
              {!readOnlyProcess ? (
                <button
                  className={styles.addVariablesBtn}
                  onClick={() => {
                    setEditView(true);
                    if (existingTrigger) {
                      props.setTriggerEdited(true);
                    }
                  }}
                  id="trigger_de_addVarBtn"
                >
                  {"+ "} {t("add")} {t("variables")}
                </button>
              ) : null}
            </div>
          )}
        </div>
        <DataTable
          tableType="remove"
          tableContent={
            removeSearchTerm?.trim() === ""
              ? addedVariableList
              : filteredRowsRemove
          }
          // tableContent={addedVariableList}
          singleEntityClickFunc={removeOneVariable}
          headerEntityClickFunc={removeAllVariable}
          id="trigger_de_removeDiv"
          isReadOnly={readOnlyProcess}
        />
      </div>
      {editView && (
        <div className="flex1">
          <div className={`flex ${styles.dataEntrySelectDiv}`}>
            <p className={`${styles.dataEntryHeading} ${styles.mr05} flex4`}>
              {t("selectDataEntryFields")}
            </p>
            <div className="flex2">
              <SearchBox
                width="100%"
                title={"pmweb_trigger_de_addDivSearch"}
                setSearchTerm={setSearchTerm}
                ariaDescription={`${t("selectDataEntryFields")}`}
              />
            </div>
            {/*  <button
              className={
                `${styles.filterTriggerButton} flex05`
              }
            >
              <img src={filter} alt="" />
            </button> */}
            <div className="relative">
              <button
                className={`${styles.filterTriggerButton} flex05`}
                onClick={() => {
                  setShowFiltersMain(true);
                }}
              >
                <img src={filter} alt="Filter Count" />
                {filterCountMain > 0 && (
                  <span
                    className={
                      direction === RTL_DIRECTION
                        ? arabicStyles.filterCount
                        : styles.filterCount
                    }
                  >
                    {filterCountMain}
                  </span>
                )}
              </button>
              {showFiltersMain ? (
                <div
                  className={
                    direction === RTL_DIRECTION
                      ? arabicStyles.filterDiv
                      : styles.filterDiv
                  }
                >
                  <div className={styles.filterDivHeader}>
                    <span className={styles.filterHeading}>{t("Filters")}</span>
                    {selectCountMain > 0 ? (
                      <span
                        className={styles.filterClearBtn}
                        onClick={() => {
                          clearFilterMainList();
                        }}
                        tabIndex={0}
                        onKeyUp={(e) => {
                          if (e.key === "Enter") {
                            clearFilterMainList();
                          }
                        }}
                      >
                        {t("clear")}
                      </span>
                    ) : null}
                  </div>
                  <div className={styles.filterMainBody}>
                    <label>{t("definitionType")}</label>

                    {filterDropdownMain?.map((el, i) => {
                      return (
                        <FormControlLabel
                          key={el?.id}
                          control={
                            <Checkbox
                              checked={el?.checkVal}
                              onChange={(e) => {
                                filterFuncMainList(e, i);
                              }}
                              id={`filter_${el.id}`}
                              tabIndex={-1}
                            />
                          }
                          className={styles.properties_radioButton}
                          label={el.type}
                          style={{ marginTop: "0.5rem" }}
                          tabIndex={0}
                          onKeyUp={(e) => {
                            if (e.key === "Enter") {
                              filterFuncMainList(
                                {
                                  ...e,
                                  target: {
                                    ...e.target,
                                    checked: !el.checkVal,
                                  },
                                },
                                i
                              );
                            }
                          }}
                        />
                      );
                    })}
                  </div>
                  <div className={styles.filterDivFooter}>
                    <button
                      className={styles.filterCancelBtn}
                      onClick={() => {
                        setShowFiltersMain(false);
                      }}
                    >
                      {t("cancel")}
                    </button>
                    <button
                      className={styles.filterApplyBtn}
                      onClick={() => applyFilterFuncMainList()}
                    >
                      {t("apply")}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
          <DataTable
            tableType="add"
            tableContent={
              searchTerm?.trim() === "" ? variableList : filteredRows
            }
            singleEntityClickFunc={addOneVariable}
            headerEntityClickFunc={addAllVariable}
            id="trigger_de_addDiv"
            isReadOnly={readOnlyProcess}
          />
        </div>
      )}
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    initialValues: state.triggerReducer.setDefaultValues,
    DataEntry: state.triggerReducer.DataEntry,
    reload: state.triggerReducer.trigger_reload,
    openProcessType: state.openProcessClick.selectedType,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setReload: (reload) =>
      dispatch(actionCreators.reload_trigger_fields(reload)),
    setTriggerProperties: (list) =>
      dispatch(actionCreators.dataEntryTrigger_properties(list)),
    setInitialValues: (value) =>
      dispatch(actionCreators.set_trigger_fields(value)),
    setTriggerEdited: (value) =>
      dispatch(actionCreators.is_trigger_definition_edited(value)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DataEntryProperties);
