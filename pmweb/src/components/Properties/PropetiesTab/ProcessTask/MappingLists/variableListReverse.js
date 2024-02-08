// Changes made to solve Bug 116651 - Process Task: add variable button is not working and
// Bug 116650 - Process Task: cancel button is not working or it should not be available if not required
// Changes made to solve Bug 126210 - call activity/process task>>add button is enabled without selecting any fields and also after adding the field
import React, { useState, useEffect } from "react";
import { Checkbox, Grid, Button } from "@material-ui/core";

import SearchComponent from "../../../../../UI/Search Component/index.js";
import {
  headerHeight,
  propertiesLabel,
} from "../../../../../Constants/appConstants";
import { connect, useSelector, useDispatch } from "react-redux";
import { store, useGlobalState } from "state-pool";
import { setActivityPropertyChange } from "../../../../../redux-store/slices/ActivityPropertyChangeSlice";
import { getVariableType } from "../../../../../utility/ProcessSettings/Triggers/getVariableType.js";
import NoResultFound from "../../../../../assets/NoSearchResult.svg";
import { useTranslation } from "react-i18next";
import { v4 as uuidv4 } from "uuid";
import "../MappingFiles/index.css";

function VariableList(props) {
  const { t } = useTranslation();

  let [processVarsList, setProcessVarsList] = useState([]);
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  let [searchTerm, setSearchTerm] = useState("");
  const loadedActivityPropertyData = store.getState("activityPropertyData");
  const [localLoadedActivityPropertyData, setlocalLoadedActivityPropertyData] =
    useGlobalState(loadedActivityPropertyData);
  const dispatch = useDispatch();
  const [isAllSelect, setIsAllSelect] = useState(false);
  const [addBtnDisable, setAddBtnDisable] = useState(false);
  // changes added for bug_id: 134226
  const windowInnerHeight = useSelector(
    (state) => state.setWindowInnerHeight.windowInnerHeight
  );
  const { isReadOnly } = props;

  //Modified on 23/05/2023, bug_id:127645
  useEffect(() => {
    let tempExternalVars = [];
    // localLoadedProcessData.Variable.forEach((variable) => {
    localLoadedProcessData.Variable.filter(
      (d) => +d.VariableType !== 11
    ).forEach((variable) => {
      var isPresent = false;
      props.selectedVariableList?.map((el) => {
        if (el.importedFieldName == variable.VariableName) {
          isPresent = true;
        }
      });
      if (!isPresent) {
        tempExternalVars.push({ ...variable, isChecked: false });
      }
    });
    setProcessVarsList(tempExternalVars);
  }, [localLoadedProcessData, props.selectedVariableList]);

  const handleCheckChange = (selectedVariable) => {
    let temp = [...processVarsList];
    // temp.map((el) => {
    temp?.forEach((el) => {
      if (el.VariableName == selectedVariable.VariableName) {
        el.isChecked = !el.isChecked;
      }
    });
    let flag = true;
    for (let vary in processVarsList) {
      if (processVarsList[vary].isChecked === false) {
        flag = false;
        break;
      }
    }
    setIsAllSelect(flag);
    setProcessVarsList(temp);
  };

  let filteredRows = processVarsList?.filter((row) => {
    if (searchTerm == "") {
      return row;
    } else if (
      row.VariableName.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return row;
    }
  });

  const selectAllData = (e) => {
    setIsAllSelect(!isAllSelect);
    let temp = [...processVarsList];
    temp.forEach((item) => {
      item.isChecked = e.target.checked;
    });
    setProcessVarsList(temp);
  };

  const addVariablesToList = () => {
    setIsAllSelect(false);
    let tempList = [...processVarsList];
    let varToBeAdded = tempList.filter((el) => el.isChecked);
    let varToBeAddedWithKeys = varToBeAdded.map((el) => {
      return {
        displayName: el.VariableName,
        fieldType: "V",
        importedFieldDataType: el.VariableType,
        importedFieldName: el.VariableName,
        importedVarFieldId: el.VariableId,
        //  importedVarId: "11",
        importedVarId: el.VariableId,
        m_arrCurrentPrcVar: [],
        m_bEnableFlag: false,
        m_bSelected: false,
        m_strActVar: "",
        m_strEntityType: "A",
        m_strQualifiedName: "",
        mapType: "R",
        mappedFieldName: null,
        mappedVarFieldId: "0",
        mappedVarId: "10028",
      };
    });
    props.setSelectedVariableList((prev) => {
      return [...prev, ...varToBeAddedWithKeys];
    });
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.fwdVarMappingProcessTask]: {
          isModified: true,
          hasError: false,
        },
      })
    );
    let temp = { ...localLoadedActivityPropertyData };
    // varToBeAdded.map((el) => {
    varToBeAdded?.forEach((el) => {
      temp.m_objPMSubProcess?.revVarMapping.push({
        displayName: el.VariableName,
        fieldType: "V",
        importedFieldDataType: el.VariableType,
        importedFieldName: el.VariableName,
        importedVarFieldId: el.VariableId,
        // importedVarId: "11",
        importedVarId: el.VariableId,
        m_arrCurrentPrcVar: [],
        m_bEnableFlag: false,
        m_bSelected: false,
        m_strActVar: "",
        m_strEntityType: "A",
        m_strQualifiedName: "",
        mapType: "R",
        mappedFieldName: null,
        mappedVarFieldId: "0",
        mappedVarId: "10028",
      });
    });
    setlocalLoadedActivityPropertyData(temp);
    props.setShowVariablesModal(false);
  };

  useEffect(() => {
    const varList = filteredRows.filter((d) => d.isChecked === true);
    if (varList?.length > 0) {
      setAddBtnDisable(false);
    } else {
      setAddBtnDisable(true);
    }
  }, [filteredRows]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        // height: props.isDrawerExpanded
        //   ? `calc(${windowInnerHeight}px - ${headerHeight} - 11.5rem)`
        //   : "100%",
        backgroundColor: props.isDrawerExpanded ? "white" : "",
        justifyContent: "space-between",
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
            // changes on 21-09-23 to resolve the bug Id 135429
            width={"342px"}
            setSearchTerm={setSearchTerm}
          />
        )}
        {filteredRows?.length === 0 ? (
          // <>
          //   <img
          //     src={NoResultFound}
          //     alt={t("noResultsFound")}
          //     className={
          //       props.isDrawerExpanded
          //         ? direction == RTL_DIRECTION
          //           ? "noSearchResultImageExpandedArabic"
          //           : "noSearchResultImageExpanded"
          //         : "noSearchResultImage"  //Changes made to solve Bug 137263
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
          //       : t("noVariablesPresent")}
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
                style={{ paddingTop: "20vh" }}
              >
                <Grid item>
                  <img
                    src={NoResultFound}
                    alt={t("noResultsFound")}
                    // className={
                    //   props.isDrawerExpanded
                    //     ? direction == RTL_DIRECTION
                    //       ? "noSearchResultImageExpandedArabic"
                    //       : "noSearchResultImageExpanded"
                    //     : "noSearchResultImage"  //Changes made to solve Bug 137263
                    // }
                    style={{
                      height: window.innerWidth < 1000 ? "16vh" : "23vh",
                      // width: "60vw",
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
              <span
              // className={
              //   props.isDrawerExpanded
              //     ? direction === RTL_DIRECTION
              //       ? "noVariablesPresentExpandedArabic"
              //       : "noVariablesPresentExpanded"
              //     : "noVariablesPresent"
              // }
              >
                {searchTerm?.trim() !== ""
                  ? t("noVariablesFound")
                  : t("noVariablesPresent")}
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
                padding: window.innerWidth < 1000 ? "0.7vh" : "1.2vh",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Checkbox
                  id={`pmweb_VariableListReverse_SelectAll_${uuidv4()}`}
                  style={{
                    borderRadius: "1px",
                    padding: "0",
                  }}
                  onChange={selectAllData}
                  checked={isAllSelect ? true : false}
                  disabled={isReadOnly}
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
                      fontSize: "var(--base_text_font_size)",
                      color: "black",
                      marginLeft: "15px",
                    }}
                  >
                    {t("selectAll")}
                  </p>
                </div>
              </div>
            </div>
            <div
              style={{
                overflowY: "scroll",
                // height: `calc(${windowInnerHeight}px - ${headerHeight} - ${
                //   filteredRows?.length === 0 && searchTerm?.trim() !== ""
                //     ? props.isDrawerExpanded
                //       ? "19rem"
                //       : "7.5rem"
                //     : props.isDrawerExpanded
                //     ? "23.5rem"
                //     : "14.5rem"
                // })`,
                height:
                  window.innerWidth < 1200
                    ? `calc(${windowInnerHeight}px - ${headerHeight} - ${
                        filteredRows?.length === 0 && searchTerm?.trim() !== ""
                          ? props.isDrawerExpanded
                            ? "19rem"
                            : "7.5rem"
                          : props.isDrawerExpanded
                          ? "23.5rem"
                          : "14.5rem"
                      })`
                    : "35vh",
                scrollbarColor: "#dadada #fafafa",
                scrollbarWidth: "thin",
              }}
            >
              {filteredRows?.map((vary) => {
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
                      <Checkbox
                        id={`pmweb_VariableListReverse_IndividualVarCheckbox_${uuidv4()}`}
                        onChange={() => handleCheckChange(vary)}
                        checked={vary.isChecked}
                        style={{
                          borderRadius: "1px",
                          height: "11px",
                          width: "11px",
                        }}
                        disabled={isReadOnly}
                      />
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          marginLeft: "15px",
                        }}
                      >
                        <p
                          style={{
                            fontSize: "var(--base_text_font_size)",
                            color: "black",
                          }}
                          disabled={isReadOnly}
                        >
                          {vary.VariableName}
                        </p>
                        {/*code edited on 06 Apr 2023  for BugId 126005  */}
                        <span
                          style={{
                            fontSize: "var(--base_text_font_size)",
                            color: "#B2B1B9",
                          }}
                        >
                          {vary.SystemDefinedName}
                        </span>
                      </div>
                    </div>
                    <p
                      style={{
                        fontSize: "var(--base_text_font_size)",
                        color: "black",
                      }}
                      disabled={isReadOnly}
                    >
                      {getVariableType(vary.VariableType).toUpperCase()}
                    </p>
                  </div>
                );
              })}
            </div>
          </>
        ) : null}
      </div>
      {filteredRows?.length === 0 ? null : (
        <div
          style={{
            display: "flex",
            //padding: "5px 10px",
            justifyContent: "end",
            backgroundColor: "rgb(248, 248, 248)",
          }}
        >
          {props.isDrawerExpanded ? null : (
            <Button
              //variant="outlined"
              className="tertiary"
              onClick={() => props.setShowVariablesModal(false)}
              id="close_AddVariableModal_CallActivity"
            >
              {t("cancel")}
            </Button>
          )}
          {!isReadOnly && (
            <Button
              id="add_AddVariableModal_CallActivity"
              onClick={() => addVariablesToList()}
              // variant="contained"
              //color="primary"
              className="primary"
              disabled={addBtnDisable}
            >
              {t("add")}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    isDrawerExpanded: state.isDrawerExpanded.isDrawerExpanded,
    openProcessID: state.openProcessClick.selectedId,
  };
};

export default connect(mapStateToProps, null)(VariableList);
