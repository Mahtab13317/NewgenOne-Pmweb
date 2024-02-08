// Changes made to solve Bug 116651 - Process Task: add variable button is not working and
// Bug 116650 - Process Task: cancel button is not working or it should not be available if not required
import { Checkbox, Grid } from "@material-ui/core";
import React, { useState, useEffect } from "react";
import SearchComponent from "../../../../../UI/Search Component/index.js";
import Button from "@material-ui/core/Button";
import {
  headerHeight,
  propertiesLabel,
} from "../../../../../Constants/appConstants";
import { connect, useSelector, useDispatch } from "react-redux";
import { store, useGlobalState } from "state-pool";
import { setActivityPropertyChange } from "../../../../../redux-store/slices/ActivityPropertyChangeSlice";
import NoResultFound from "../../../../../assets/NoSearchResult.svg";
import "../MappingFiles/index.css";
import { useTranslation } from "react-i18next";
import { v4 as uuidv4 } from "uuid";

function VariableList(props) {
  const { t } = useTranslation();
  let [processDocsList, setProcessDocsList] = useState([]);
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const loadedActivityPropertyData = store.getState("activityPropertyData");
  const [localLoadedActivityPropertyData, setlocalLoadedActivityPropertyData] =
    useGlobalState(loadedActivityPropertyData);
  const dispatch = useDispatch();
  const [selectAllValue, setSelectAllValue] = useState(false);
  let [searchTerm, setSearchTerm] = useState("");
  // changes added for bug_id: 134226
  const windowInnerHeight = useSelector(
    (state) => state.setWindowInnerHeight.windowInnerHeight
  );
  const { isReadOnly } = props;

  useEffect(() => {
    let tempExternalVars = [];
    localLoadedProcessData?.DocumentTypeList?.forEach((document) => {
      var isPresent = false;
      props?.selectedVariableList?.map((el) => {
        if (el.importedFieldName == document.DocName) {
          isPresent = true;
        }
      });
      if (!isPresent) {
        tempExternalVars.push({ ...document, isChecked: false });
      }
    });
    setProcessDocsList(tempExternalVars);
  }, [localLoadedProcessData, props.selectedVariableList]);

  const handleCheckChange = (selectedVariable) => {
    let temp = [...processDocsList];
    // temp.map((el) => {
    temp?.forEach((el) => {
      if (el.DocName == selectedVariable.DocName) {
        el.isChecked = !el.isChecked;
      }
    });
    let flag = true;
    for (let vary in processDocsList) {
      if (processDocsList[vary].isChecked === false) {
        flag = false;
        break;
      }
    }
    setSelectAllValue(flag);
    setProcessDocsList(temp);
  };

  // const handleCheckChange = (selectedVariable) => {
  //   let temp = [...varDefinition];
  //   temp &&
  //     temp.map((v) => {
  //       if (v.DocName === selectedVariable.DocName) {
  //         v.isChecked = !v.isChecked;
  //       }
  //     });
  //   setVarDefinition(temp);
  //   if (selectedVariable.isChecked) {
  //     setSelectedDocuments((prev) => {
  //       return [...prev, selectedVariable];
  //     });
  //   } else {
  //     setSelectedDocuments((prev) => {
  //       let teList = [...prev];
  //       teList.map((el, idx) => {
  //         if (el.DocName === selectedVariable.DocName) {
  //           teList.splice(idx, 1);
  //         }
  //       });
  //       return teList;
  //     });
  //   }
  //   let allCheck = temp?.every((doc) => {
  //     return doc.isChecked === true;
  //   });
  //   setSelectAllValue(allCheck);
  // };

  const addVariablesToList = () => {
    setSelectAllValue(false);
    let tempList = [...processDocsList];
    let varToBeAdded = tempList.filter((el) => el.isChecked);
    let varToBeAddedWithKeys = varToBeAdded.map((el) => {
      return {
        importedFieldName: el.DocName,
        m_arrCurrentDocList: null,
        m_bEnableFlag: false,
        m_bSelected: false,
        m_strAttr: "",
        m_strImporteddocId: el.DocTypeId,
        m_strMappedTransVar: "",
        mappedFieldName: el.DocName,
        transVarInfoList: [],
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
      temp.m_objPMSubProcess?.revDocMapping.push({
        importedFieldName: el.DocName,
        m_arrCurrentDocList: null,
        m_bEnableFlag: false,
        m_bSelected: false,
        m_strAttr: "",
        m_strImporteddocId: el.DocTypeId,
        m_strMappedTransVar: "",
        mappedFieldName: el.DocName,
        transVarInfoList: [],
      });
    });
    setlocalLoadedActivityPropertyData(temp);
    props.setShowVariablesModal(false);
  };

  let filteredRows = processDocsList?.filter((row) => {
    if (searchTerm == "") {
      return row;
    } else if (row.DocName.toLowerCase().includes(searchTerm.toLowerCase())) {
      return row;
    }
  });

  const selectAllHandler = (e) => {
    setSelectAllValue(e.target.checked);
    let tempData = [...processDocsList];
    tempData?.forEach((item) => {
      item.isChecked = e.target.checked;
    });
    setProcessDocsList(tempData);
  };

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
          //       ? direction == RTL_DIRECTION
          //         ? "noSearchResultImageExpandedArabic"
          //         : "noSearchResultImageExpanded"
          //       : "noSearchResultImage"     //Changes made to solve Bug 137263
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
          //       ? t("noDocumentFound")
          //       : t("noDocumentsPresent")}
          //   </span>
          // </>
          <Grid
            container
            direction="column"
            justifyContent="center"
            alignItems="center"
            spacing={3}
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
                  ? t("noDocumentFound")
                  : t("noDocumentsPresent")}
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
                  id={`pmweb_DocListReverse_SelectAll_${uuidv4()}`}
                  checked={selectAllValue}
                  onChange={selectAllHandler}
                  style={{
                    borderRadius: "1px",
                    padding: "0",
                  }}
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
              {filteredRows?.map((document) => {
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
                        id={`pmweb_DocListReverse_IndividualVarCheckbox_${uuidv4()}`}
                        onChange={() => handleCheckChange(document)}
                        checked={document.isChecked}
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
                          {document.DocName}
                        </p>
                      </div>
                    </div>
                    {/*<p
                style={{
                  fontSize: "var(--sub_text_font_size)",
                  color: "black",
                }}
              >
                STRING
              </p>*/}
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
            // padding: "5px 10px",
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
              className="primary"
              //variant="contained"
              //</div></div>color="primary"
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
