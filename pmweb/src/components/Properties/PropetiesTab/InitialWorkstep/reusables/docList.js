import React, { useState, useEffect } from "react";
import { Checkbox, Button } from "@material-ui/core";

import SearchComponent from "../../../../../UI/Search Component/index.js";
import "../../../PropetiesTab/callActivity/commonCallActivity.css";
import NoResultFound from "../../../../../assets/NoSearchResult.svg";
import {
  VARDOC_LIST,
  SERVER_URL,
  propertiesLabel,
  headerHeight,
} from "../../../../../Constants/appConstants";
import axios from "axios";
import { store, useGlobalState } from "state-pool";
import { connect, useDispatch, useSelector } from "react-redux";
import { setActivityPropertyChange } from "../../../../../redux-store/slices/ActivityPropertyChangeSlice.js";
import { useTranslation } from "react-i18next";
import styles from "../index.module.css";

/*code edited on 6 Sep 2022 for BugId 115378 */
function VariableList(props) {
  let { t } = useTranslation();
  const { isReadOnly } = props;
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
  // changes added for bug_id: 134226
  const windowInnerHeight = useSelector(
    (state) => state.setWindowInnerHeight.windowInnerHeight
  );

  useEffect(() => {
    if (
      localLoadedActivityPropertyData?.ActivityProperty?.pMMessageEnd?.processId?.trim() !==
      ""
    ) {
      let jsonBody = {
        processDefId:
          localLoadedActivityPropertyData?.ActivityProperty?.pMMessageEnd
            ?.processId,
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
  }, []);

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

  const handleCheckChange = (e, selectedVariable) => {
    let temp = [...varDefinition];
    temp?.forEach((v) => {
      if (v.DocName === selectedVariable?.DocName) {
        v.isChecked = e.target.checked;
      }
    });
    setVarDefinition(temp);

    if (e.target.checked) {
      setSelectedDocuments((prev) => {
        return [...prev, selectedVariable];
      });
    } else {
      setSelectedDocuments((prev) => {
        let teList = [...prev];
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
    //Adding document to right panel
    props.setDocList(selectedDocuments);
    let tempArr = [];
    //Adding document to getActivityPropertyCall
    let tempToBeAddedDocsList = [];
    let tempLocalState = JSON.parse(
      JSON.stringify(localLoadedActivityPropertyData)
    );
    selectedDocuments?.forEach((document) => {
      tempToBeAddedDocsList.push({
        importedFieldName: document.DocName,
        mappedFieldName: document.mappedFieldName
          ? document.mappedFieldName
          : null,
        m_bSelected: true,
      });
      tempArr.push(document.DocName);
    });

    if (tempLocalState?.ActivityProperty?.pMMessageEnd?.m_arrFwdDocMapping) {
      tempLocalState.ActivityProperty.pMMessageEnd.m_arrFwdDocMapping = [
        ...tempToBeAddedDocsList,
      ];
    } else {
      tempLocalState.ActivityProperty.pMMessageEnd = {
        ...tempLocalState.ActivityProperty.pMMessageEnd,
        m_arrFwdDocMapping: [...tempToBeAddedDocsList],
      };
    }
    setlocalLoadedActivityPropertyData(tempLocalState);

    //Removing document from left Modal panel
    let newJson = documentsList.filter((d) => !tempArr.includes(d.DocName));
    setDocumentsList(newJson);

    if (selectAllValue) {
      setSelectAllValue(false);
    }

    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.fwdDocMapping]: {
          isModified: true,
          hasError: true,
        },
      })
    );
  };

  let filteredRows = varDefinition?.filter(
    (row) =>
      searchTerm?.trim() === "" ||
      row.DocName?.toLowerCase()?.includes(searchTerm?.toLowerCase())
  );

  // Changes made to solve 116391 Call Activity: Select all button in mapping is not working
  const selectAllHandler = (e) => {
    setSelectAllValue(e.target.checked);
    setSelectedDocuments((prev) => {
      let temp = [...prev];
      varDefinition.forEach((el) => {
        let isPresent = false;
        temp.forEach((selectedDoc) => {
          // code edited on 1 March 2023 for BugId 124510 - Message End>> same document is getting added multiple times
          if (+selectedDoc.DocID === +el.DocID) {
            isPresent = true;
          }
        });
        if (!isPresent) {
          temp.push(el);
        }
      });
      return temp;
    });
    let temp = [...varDefinition];
    temp?.forEach((document) => {
      document.isChecked = e.target.checked;
    });
    setVarDefinition(temp);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: props.isDrawerExpanded ? "100%" : "auto",
        backgroundColor: props.isDrawerExpanded ? "white" : "",
      }}
    >
      {filteredRows?.length === 0 && searchTerm?.trim() === "" ? null : (
        <SearchComponent
          style={{ width: "auto", margin: "5px 10px 0" }}
          setSearchTerm={setSearchTerm}
        />
      )}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
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
        <>
          {/*   <img
            src={NoResultFound}
            alt={t("noResultsFound")}
            className={
              props.isDrawerExpanded
                  ? direction === RTL_DIRECTION
                    ? "noSearchResultImageExpandedArabic"
                    : "noSearchResultImageExpanded"
                  : "noSearchResultImage"    //Changes made to solve Bug 137005
            }
            // style={{
            //   width: props.isDrawerExpanded ? "12%" : "50%",
            //   height: "auto",
            // }}
          /> */}
          <div style={{ width: "100%" }}>
            <div>
              <img
                src={NoResultFound}
                alt={t("noResultsFound")}
                className={styles.noResultImg}
              />
            </div>
            <div className={styles.noResultText}>
              <span>
                {searchTerm?.trim() !== ""
                  ? t("noDocumentFound")
                  : t("noDocumentsPresent")}
              </span>
            </div>
          </div>
        </>
      ) : filteredRows?.length > 0 ? (
        <>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              borderBottom: "1px solid #D6D6D6",
              padding: "10px",
            }}
          >
            <Checkbox
              style={{
                borderRadius: "1px",
                padding: "0",
              }}
              name="selectAllCheck"
              checked={selectAllValue}
              onChange={selectAllHandler}
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
                style={{ fontSize: "11px", color: "black", marginLeft: "15px" }}
              >
                {t("selectAll")}
              </p>
            </div>
          </div>
          <div
            style={{
              overflowY: "scroll",
              height: `calc(${windowInnerHeight}px - ${headerHeight} - ${
                filteredRows?.length === 0 && searchTerm?.trim() !== ""
                  ? props.isDrawerExpanded
                    ? "19rem"
                    : "7.5rem"
                  : props.isDrawerExpanded
                  ? "26rem"
                  : "14.5rem"
              })`,
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
                      style={{
                        borderRadius: "1px",
                        padding: "0",
                      }}
                      name="regularChecks"
                      onChange={(e) => handleCheckChange(e, document)}
                      checked={document.isChecked}
                      disabled={isReadOnly}
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

      {filteredRows?.length === 0 ? null : (
        <div
          style={{
            display: "flex",
            padding: "5px 10px",
            width: "100%",
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
            disabled={filteredRows?.length === 0 || isReadOnly}
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
