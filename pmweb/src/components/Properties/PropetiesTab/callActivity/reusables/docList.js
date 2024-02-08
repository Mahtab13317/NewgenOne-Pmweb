// Changes made to solve Bug 126210 - call activity/process task>>add button is enabled without selecting any fields and also after adding the field

import { Checkbox, Grid } from "@material-ui/core";
import React, { useState, useEffect, useRef } from "react";
import SearchComponent from "../../../../../UI/Search Component/index.js";
import "../../callActivity/commonCallActivity.css";
import Button from "@material-ui/core/Button";
import NoResultFound from "../../../../../assets/NoSearchResult.svg";
import {
  VARDOC_LIST,
  SERVER_URL,
  propertiesLabel,
} from "../../../../../Constants/appConstants";
import axios from "axios";
import { store, useGlobalState } from "state-pool";
import { connect, useDispatch, useSelector } from "react-redux";
import { setActivityPropertyChange } from "../../../../../redux-store/slices/ActivityPropertyChangeSlice.js";
import { useTranslation } from "react-i18next";

/*code edited on 6 Sep 2022 for BugId 115378 */
function VariableList(props) {
  const { isReadOnly } = props;
  let { t } = useTranslation();
  const dispatch = useDispatch();
  let [documentsList, setDocumentsList] = useState([]);
  let [searchTerm, setSearchTerm] = useState("");
  const [varDefinition, setVarDefinition] = useState([]);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const loadedActivityPropertyData = store.getState("activityPropertyData");
  const [localLoadedActivityPropertyData, setlocalLoadedActivityPropertyData] =
    useGlobalState(loadedActivityPropertyData);
  const [completeDocList, setCompleteDocList] = useState([]);
  const [selectAllValue, setSelectAllValue] = useState(false);
  const [addBtnDisable, setAddBtnDisable] = useState(false);
  const selectAllRef = useRef();
  const VarNameRef = useRef([]);
  // changes added for bug_id: 134226
  const windowInnerHeight = useSelector(
    (state) => state.setWindowInnerHeight.windowInnerHeight
  );

  useEffect(() => {
    if (
      localLoadedActivityPropertyData?.ActivityProperty?.SubProcess?.importedProcessDefId?.trim() !==
      ""
    ) {
      let jsonBody = {
        processDefId:
          localLoadedActivityPropertyData?.ActivityProperty?.SubProcess
            ?.importedProcessDefId,
        extTableDataFlag: "Y",
        docReq: "Y",
        omniService: "Y",
      };
      axios.post(SERVER_URL + VARDOC_LIST, jsonBody).then((res) => {
        if (res.data.Status === 0) {
          let tempDocList = [...res.data.DocDefinition];
          setCompleteDocList(tempDocList);
          filterData(tempDocList);
        }
      });
    }
  }, [localLoadedActivityPropertyData]);

  const filterData = (docList) => {
    let tempDocList = [];
    docList?.forEach((list) => {
      let tempVariable = false;
      props.docList?.forEach((variable) => {
        if (variable.DocName === list.DocName) {
          tempVariable = true;
        }
      });
      if (!tempVariable) {
        tempDocList.push(list);
      }
    });
    setDocumentsList(tempDocList);
  };

  useEffect(() => {
    setVarDefinition(
      documentsList?.map((x) => {
        return { ...x, isChecked: false };
      })
    );
  }, [documentsList]);

  useEffect(() => {
    setSelectedDocuments(props.docList);
    filterData(completeDocList);
  }, [props.docList]);

  useEffect(() => {
    const varList = varDefinition.filter((d) => d.isChecked === true);
    if (varList?.length > 0) {
      setAddBtnDisable(false);
    } else {
      setAddBtnDisable(true);
    }
  }, [varDefinition]);

  const handleCheckChange = (e, selectedVariable) => {
    let temp = [...varDefinition];
    // temp?.map((v) => {
    temp?.forEach((v) => {
      if (v.DocName === selectedVariable?.DocName) {
        v.isChecked = !v.isChecked;
      }
    });
    setVarDefinition(temp);
    // ==================
    if (selectedVariable?.isChecked) {
      setSelectedDocuments((prev) => {
        return [...prev, selectedVariable];
      });
    } else {
      setSelectedDocuments((prev) => {
        let teList = [...prev];
        // teList?.map((el, idx) => {
        teList?.forEach((el, idx) => {
          if (el?.DocName === selectedVariable?.DocName) {
            teList.splice(idx, 1);
          }
        });
        return teList;
      });
    }
    let allCheck = temp?.every((doc) => {
      return doc.isChecked === true;
    });
    setSelectAllValue(allCheck);
  };

  const addDocsToList = () => {
    setSelectAllValue(false); //Code added to solve Bug 127714 dated 24thMay
    props.setShowDocsModal(false);
    //Adding document to right panel
    props.setDocList(selectedDocuments);

    //Removing document from left Modal panel
    let tempArr = [];
    selectedDocuments.map((v) => {
      tempArr.push(v.DocName);
    });
    let newJson = documentsList.filter((d) => !tempArr.includes(d.DocName));
    setDocumentsList(newJson);

    //Adding document to getActivityPropertyCall
    let tempToBeAddedDocsList = [];
    let tempLocalState = JSON.parse(
      JSON.stringify(localLoadedActivityPropertyData)
    );
    selectedDocuments?.map((document) => {
      tempToBeAddedDocsList.push({
        importedFieldName: document.DocName,
        mappedFieldName: document.mappedFieldName
          ? document.mappedFieldName
          : null,
        m_bSelected: true,
      });
    });

    if (tempLocalState?.ActivityProperty?.SubProcess?.fwdDocMapping) {
      tempLocalState.ActivityProperty.SubProcess.fwdDocMapping = [
        ...tempToBeAddedDocsList,
      ];
    } else {
      tempLocalState.ActivityProperty.SubProcess = {
        ...tempLocalState.ActivityProperty.SubProcess,
        fwdDocMapping: [...tempToBeAddedDocsList],
      };
    }
    setlocalLoadedActivityPropertyData(tempLocalState);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.fwdDocMapping]: {
          isModified: true,
          hasError: true,
        },
      })
    );
  };

  let filteredRows = varDefinition?.filter((row) => {
    if (searchTerm == "") {
      return row;
    } else if (row.DocName.toLowerCase().includes(searchTerm.toLowerCase())) {
      return row;
    }
  });

  // Changes made to solve 116391 Call Activity: Select all button in mapping is not working
  const selectAllHandler = (e) => {
    setSelectAllValue(!selectAllValue);
    if (e.target.checked) {
      setSelectedDocuments((prev) => {
        let temp = [...prev];
        varDefinition.map((el) => {
          let isPresent = false;
          temp.forEach((selectedDoc) => {
            if (selectedDoc.DocTypeId == el.DocID) {
              isPresent = true;
            }
          });
          if (!isPresent) {
            temp.push(el);
          }
        });
        return temp;
      });
    } else {
      setSelectedDocuments([]);
    }
    let temp = [...varDefinition];
    // temp.map((document) => {
    temp?.forEach((document) => {
      document.isChecked = !selectAllValue;
    });
    setVarDefinition(temp);
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
        justifyContent: "space-between", // Bug 123920 - - safari>>call activity>> add button is overlapping
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
            style={{
              fontSize: "12px",
              paddingBottom: "5px",
              borderBottom: "3px solid var(--selected_tab_color)",
            }}
          >
            {t("documents")}
          </p>
        </div>
        {filteredRows?.length === 0 ? (
          // <>
          //   <img
          //     src={NoResultFound}
          //     alt={t("noResultsFound")}
          //     className={
          //       // props.isDrawerExpanded
          //       //   ? "noSearchResultImageExpanded"
          //       //   : "noSearchResultImage"
          //       props.isDrawerExpanded
          //         ? direction === RTL_DIRECTION
          //           ? "noSearchResultImageExpandedArabic"
          //           : "noSearchResultImageExpanded"
          //         : "noSearchResultImage"  //Changes made to solve Bug 136850
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
                    // className={
                    //   props.isDrawerExpanded
                    //     ? direction == RTL_DIRECTION
                    //       ? "noSearchResultImageExpandedArabic"
                    //       : "noSearchResultImageExpanded"
                    //     : "noSearchResultImage"  //Changes made to solve Bug 137263
                    // }
                    style={{
                      height: window.innerWidth < 1000 ? "16vh" : "23vh",
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
                padding: window.innerWidth < 1000 ? "1vh" : "1.5vh",
              }}
            >
              <label
                style={{ display: "none" }}
                htmlFor={`pmweb_DocList_SelectAll_`}
              >
                Checkbox
              </label>
              <Checkbox
                id={`pmweb_DocList_SelectAll_`}
                style={{
                  borderRadius: "1px",
                  padding: "0",
                }}
                name="selectAllCheck"
                checked={selectAllValue}
                onChange={selectAllHandler}
                disabled={isReadOnly}
                inputRef={selectAllRef}
                onKeyUp={(e) => {
                  if (e.key === "Enter") {
                    selectAllRef.current.click();
                    e.stopPropagation();
                  }
                }}
                inputProps={{ "aria-label": "Select All" }}
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
              {filteredRows.map((document, index) => {
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
                        htmlFor={`pmweb_DocList_IndividualVarCheckbox_${index}`}
                      >
                        Checkbox
                      </label>
                      <Checkbox
                        id={`pmweb_DocList_IndividualVarCheckbox_${index}`}
                        style={{
                          borderRadius: "1px",
                          padding: "0",
                        }}
                        name="regularChecks"
                        onChange={(e) => handleCheckChange(e, document)}
                        checked={document.isChecked}
                        disabled={isReadOnly}
                        inputRef={(item) => (VarNameRef.current[index] = item)}
                        onKeyUp={(e) => {
                          if (e.key === "Enter") {
                            VarNameRef.current[index].click();
                            e.stopPropagation();
                          }
                        }}
                        inputProps={{ "aria-label": document.DocName }}
                      />
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          marginLeft: "15px",
                        }}
                      >
                        <p style={{ fontSize: "11px", color: "black" }}>
                          {document.DocName}
                        </p>
                      </div>
                    </div>
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
              id="close_AddVariableModal_CallActivity"
              disabled={isReadOnly}
              onClick={() => props.setShowDocsModal(false)}
            >
              {t("cancel")}
            </Button>
          )}
          <Button
            id="add_AddVariableModal_CallActivity"
            variant="contained"
            color="primary"
            onClick={() => addDocsToList()}
            disabled={filteredRows?.length == 0 || isReadOnly || addBtnDisable}
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

export default connect(mapStateToProps, null)(VariableList);
