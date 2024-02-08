// #BugID - 109986
// #BugDescription - validation for Doctype duplicate name length has been added.
// #BugID - 121542
// #BugDescription - handled the id for add doc more than 10.
import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import styles from "./todo.module.css";
import { Checkbox, FormControlLabel, FormGroup } from "@material-ui/core";
import { store, useGlobalState } from "state-pool";
import SearchBox from "../../../../UI/Search Component";
import AddDoc from "../../../ViewingArea/Tools/DocTypes/AddDoc";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "react-redux";
import Modal from "@material-ui/core/Modal";
import {
  SERVER_URL,
  propertiesLabel,
  ENDPOINT_ADD_DOC,
  PROCESSTYPE_DEPLOYED,
  PROCESSTYPE_REGISTERED,
  RTL_DIRECTION,
} from "../../../../Constants/appConstants";
import axios from "axios";
import { setActivityPropertyChange } from "../../../../redux-store/slices/ActivityPropertyChangeSlice";
import { setToastDataFunc } from "../../../../redux-store/slices/ToastDataHandlerSlice";
import {
  OpenProcessSliceValue,
  setOpenProcess,
} from "../../../../redux-store/slices/OpenProcessSlice";
import {
  containsText,
  isReadOnlyFunc,
} from "../../../../utility/CommonFunctionCall/CommonFunctionCall";
import { encode_utf8 } from "../../../../utility/UTF8EncodeDecoder";

function Document(props) {
  let { t } = useTranslation();
  // Changes made to solve Bug 137280
  const direction = `${t("HTML_DIR")}`;
  const [checkDoc, setCheckDoc] = useState(false);
  const loadedActivityPropertyData = store.getState("activityPropertyData");
  const [localLoadedActivityPropertyData, setlocalLoadedActivityPropertyData] =
    useGlobalState(loadedActivityPropertyData);
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const [localState, setLocalState] = useState(null);
  const [docItemData, setDocItemData] = useState({});
  const [addDoc, setAddDoc] = useState(false);
  const [docData, setDocData] = useState({});
  const [checked, setChecked] = useState({});
  const [allChecked, setAllChecked] = useState({
    isAdd: false,
    isView: false,
    isDelete: false,
    isPrint: false,
    isDownlaod: false,
    isModify: false,
  });
  const [addAnotherDoc, setAddAnotherDoc] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dispatch = useDispatch();
  const openProcessData = useSelector(OpenProcessSliceValue);
  const documentRef = useRef();
  const viewRef = useRef();
  const deleteRef = useRef();
  const printRef = useRef();
  const downloadRef = useRef();
  const modifyRef = useRef();
  const ViewActRef = useRef([]);
  const deleteActRef = useRef([]);
  const printActRef = useRef([]);
  const downloadActRef = useRef([]);
  const modifyActRef = useRef([]);
  const isReadOnly =
    props.isReadOnly ||
    isReadOnlyFunc(
      localLoadedProcessData,
      props.cellCheckedOut,
      props.cellLaneId
    );

  useEffect(() => {
    let activityIdString = "";
    openProcessData.loadedData?.MileStones?.forEach((mileStone) => {
      mileStone?.Activities?.forEach((activity) => {
        activityIdString = activityIdString + activity.ActivityId + ",";
      });
    });
    setLocalState(openProcessData.loadedData);
    // code edited on 16 May 2023 for BugId 127715
    if (openProcessData.loadedData?.ProcessDefId) {
      axios
        .get(
          SERVER_URL +
            `/doctypes/${openProcessData.loadedData?.ProcessDefId}/${openProcessData.loadedData?.ProcessType}/${openProcessData.loadedData?.ProcessName}/${activityIdString}`
        )
        .then((res) => {
          if (res.status === 200) {
            let docList = { ...res.data };
            setDocData(docList);
            let localData = {};
            let tempCheck = {};
            openProcessData.loadedData?.DocumentTypeList?.forEach((el) => {
              let selectedDoc = null;
              docList?.DocumentTypeList?.forEach((doc) => {
                if (+el.DocTypeId === +doc.DocTypeId) {
                  doc?.Activities?.forEach((act) => {
                    if (
                      +act.ActivityId ===
                      +localLoadedActivityPropertyData?.ActivityProperty?.actId
                    ) {
                      selectedDoc = act;
                    }
                  });
                }
              });
              localData = {
                ...localData,
                [el.DocName]: {
                  docTypeName: el.DocName,
                  docTypeId: el.DocTypeId,
                },
              };
              tempCheck = {
                ...tempCheck,
                [el.DocName]: {
                  isDelete: selectedDoc?.Delete,
                  isDownlaod: selectedDoc?.Download,
                  isModify: selectedDoc?.Modify,
                  isPrint: selectedDoc?.Print,
                  isView: selectedDoc?.View,
                  isAdd: selectedDoc?.Add,
                },
              };
            });
            setDocItemData(localData);
            setChecked(tempCheck);
          }
        });
    }
  }, [openProcessData.loadedData]);

  useEffect(() => {
    let tempList = {
      ...localLoadedActivityPropertyData?.ActivityProperty?.wdeskInfo
        ?.objPMWdeskDocuments?.documentMap,
    };
    let tempCheck = { ...checked };
    Object.keys(docItemData)?.forEach((el) => {
      tempCheck = {
        ...tempCheck,
        [el]: {
          isDelete: tempList[el]?.isDelete ? tempList[el].isDelete : false,
          isDownlaod: tempList[el]?.isDownlaod
            ? tempList[el].isDownlaod
            : false,
          isModify: tempList[el]?.isModify ? tempList[el].isModify : false,
          isPrint: tempList[el]?.isPrint ? tempList[el].isPrint : false,
          isView: tempList[el]?.isView ? tempList[el].isView : false,
          isAdd: tempList[el]?.isAdd ? tempList[el].isAdd : false,
        },
      };
    });
    setChecked(tempCheck);
    let allCheck = {
      isAdd: false,
      isView: false,
      isDelete: false,
      isPrint: false,
      isDownlaod: false,
      isModify: false,
    };
    if (Object.keys(tempCheck)?.length > 0) {
      Object.keys(allCheck)?.forEach((el) => {
        allCheck = {
          ...allCheck,
          [el]: Object.keys(docItemData)?.every((elt) => {
            return tempCheck[elt][el] === true;
          }),
        };
      });
    }
    setAllChecked(allCheck);
    setCheckDoc(
      localLoadedActivityPropertyData?.ActivityProperty?.wdeskInfo
        ?.objPMWdeskDocuments?.m_bchkBoxChecked
    );
  }, [localLoadedActivityPropertyData, docItemData]);

  const CheckDocHandler = (e) => {
    /*  let val;
    setCheckDoc((prev) => {
      val = !prev;
      return !prev;
    }); */
    let temp = JSON.parse(JSON.stringify(localLoadedActivityPropertyData));
    if (temp?.ActivityProperty?.wdeskInfo) {
      if (temp?.ActivityProperty?.wdeskInfo?.objPMWdeskDocuments) {
        let valTemp =
          temp?.ActivityProperty?.wdeskInfo?.objPMWdeskDocuments
            ?.m_bchkBoxChecked;
        if (valTemp === false || valTemp === true) {
          temp.ActivityProperty.wdeskInfo.objPMWdeskDocuments.m_bchkBoxChecked =
            e.target.checked;
        } else {
          temp.ActivityProperty.wdeskInfo.objPMWdeskDocuments = {
            ...temp.ActivityProperty.wdeskInfo.objPMWdeskDocuments,
            m_bchkBoxChecked: e.target.checked,
          };
        }
      } else {
        temp.ActivityProperty.wdeskInfo = {
          ...temp.ActivityProperty.wdeskInfo,
          objPMWdeskDocuments: {
            m_bchkBoxChecked: e.target.checked,
          },
        };
      }
    } else {
      temp.ActivityProperty = {
        ...temp.ActivityProperty,
        wdeskInfo: {
          objPMWdeskDocuments: {
            m_bchkBoxChecked: e.target.checked,
          },
        },
      };
    }
    setCheckDoc(e.target.checked);
    setlocalLoadedActivityPropertyData(temp);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.workdesk]: { isModified: true, hasError: false },
      })
    );
  };

  const defineHandler = () => {
    setAddDoc(true);
  };

  const addDocToList = (docToAdd, docDesc, button_type) => {
    let exist = false;
    docData?.DocumentTypeList?.forEach((el) => {
      if (el.DocName.trim().toLowerCase() == docToAdd.trim().toLowerCase()) {
        exist = true;
      }
    });
    if (exist) {
      dispatch(
        setToastDataFunc({
          message: t("docAlreadyExists"),
          severity: "error",
          open: true,
        })
      );
    } else {
      if (docToAdd.trim() !== "") {
        /* let maxId = docData?.DocumentTypeList?.reduce(
          (acc, doc) => (acc = acc > doc.DocTypeId ? acc : doc.DocTypeId),
          0
        ); */
        let maxToDoId = 0;
        docData.DocumentTypeList?.map((doc) => {
          if (+doc.DocTypeId > +maxToDoId) {
            maxToDoId = doc.DocTypeId;
          }
        });
        axios
          .post(SERVER_URL + ENDPOINT_ADD_DOC, {
            processDefId: props.openProcessID,
            docTypeName: docToAdd,
            docTypeId: `${+maxToDoId + 1}`,
            docTypeDesc: encode_utf8(docDesc),
            sDocType: "D",
          })
          .then((res) => {
            if (res.data.Status === 0) {
              let temp = JSON.parse(JSON.stringify(localState));
              temp.DocumentTypeList.push({
                DocName: docToAdd,
                DocTypeId: `${+maxToDoId + 1}`,
              });
              dispatch(setOpenProcess({ loadedData: temp }));
              let tempData = { ...docData };
              tempData?.DocumentTypeList?.push({
                DocName: docToAdd,
                DocTypeId: `${+maxToDoId + 1}`,
                SetAllChecks: {
                  Add: false,
                  View: false,
                  Modify: false,
                  Delete: false,
                  Download: false,
                  Print: false,
                },
                Activities: [],
              });
              setDocData(tempData);
              // code added on 2 August 2022 for BugId 112251
              if (button_type !== "addAnother") {
                setAddDoc(false);
                setAddAnotherDoc(false);
              } else if (button_type === "addAnother") {
                setAddAnotherDoc(true);
              }
            }
          });
      } else if (docToAdd.trim() === "") {
        dispatch(
          setToastDataFunc({
            message: t("mandatoryErr"),
            severity: "error",
            open: true,
          })
        );
        document.getElementById("DocNameInput").focus();
      }
    }
  };

  const CheckHandler = (docName, type, e) => {
    let tempCheck = JSON.parse(JSON.stringify(checked));
    tempCheck[docName] = {
      ...tempCheck[docName],
      [type]: !tempCheck[docName][type],
    };
    if (type === "isView" && tempCheck[docName]["isView"] === false) {
      tempCheck[docName]["isModify"] = false;
    } else if (type === "isModify" && tempCheck[docName]["isModify"] === true) {
      tempCheck[docName]["isView"] = true;
    }
    let temp = JSON.parse(JSON.stringify(localLoadedActivityPropertyData));
    let tempVal = {
      ...temp?.ActivityProperty?.wdeskInfo?.objPMWdeskDocuments?.documentMap,
    };
    tempVal = {
      ...tempVal,
      [docName]: {
        documentType: {
          docTypeId: docItemData[docName].docTypeId,
          docTypeName: docItemData[docName].docTypeName,
          sDocType: "D",
        },
        isDelete: tempCheck[docName].isDelete,
        isDownlaod: tempCheck[docName].isDownlaod,
        isView: tempCheck[docName].isView,
        isAdd: tempCheck[docName].isAdd,
        isPrint: tempCheck[docName].isPrint,
        isModify: tempCheck[docName].isModify,
      },
    };
    let docMap = {},
      taskDocMap = [];
    Object.keys(tempVal)?.forEach((el) => {
      if (
        tempVal[el].isDelete ||
        tempVal[el].isDownlaod ||
        tempVal[el].isView ||
        tempVal[el].isPrint ||
        tempVal[el].isModify ||
        tempVal[el].isAdd
      ) {
        docMap = {
          ...docMap,
          [el]: tempVal[el],
        };
        // code added on 3 Aug 2023 for BugId 127487 - Regression :- form not showing in Task rights.
        taskDocMap = [
          ...taskDocMap,
          {
            m_bIsAddForTask: tempVal[el].isAdd,
            m_bIsViewForTask: tempVal[el].isView,
            m_bIsModifyForTask: tempVal[el].isModify,
            docTypeName: docItemData[el].docTypeName,
            docTypeId: docItemData[el].docTypeId,
          },
        ];
      }
    });
    if (temp?.ActivityProperty?.wdeskInfo?.objPMWdeskDocuments?.documentMap) {
      temp.ActivityProperty.wdeskInfo.objPMWdeskDocuments.documentMap = {
        ...docMap,
      };
    } else {
      temp.ActivityProperty.wdeskInfo.objPMWdeskDocuments = {
        ...temp.ActivityProperty.wdeskInfo.objPMWdeskDocuments,
        documentMap: { ...docMap },
      };
    }
    // code added on 3 Aug 2023 for BugId 127487 - Regression :- form not showing in Task rights.
    if (temp?.ActivityProperty?.wdeskInfo?.objPMWdeskTasks?.taskMap) {
      Object.values(
        temp?.ActivityProperty?.wdeskInfo?.objPMWdeskTasks?.taskMap
      )?.forEach((task) => {
        if (task.m_arrDocumentInfo) {
          temp.ActivityProperty.wdeskInfo.objPMWdeskTasks.taskMap[
            task.taskTypeInfo.taskName
          ].m_arrDocumentInfo = [...taskDocMap];
        } else {
          temp.ActivityProperty.wdeskInfo.objPMWdeskTasks.taskMap[
            task.taskTypeInfo.taskName
          ] = {
            ...task,
            m_arrDocumentInfo: [...taskDocMap],
          };
        }
      });
    }
    setlocalLoadedActivityPropertyData(temp);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.workdesk]: { isModified: true, hasError: false },
      })
    );
  };

  const allCheckHandler = (type, e) => {
    let tempCheck = { ...allChecked };
    let tempCh = { ...checked };
    tempCheck = { ...tempCheck, [type]: e.target.checked };
    if (type === "isView" && e.target.checked === false) {
      tempCheck["isModify"] = false;
    } else if (type === "isModify" && e.target.checked === true) {
      tempCheck["isView"] = true;
    }
    Object.keys(tempCh).forEach((el) => {
      tempCh[el] = {
        ...tempCh[el],
        [type]: e.target.checked,
      };
      if (type === "isView" && e.target.checked === false) {
        tempCh[el] = {
          ...tempCh[el],
          isModify: false,
        };
      } else if (type === "isModify" && e.target.checked === true) {
        tempCh[el] = {
          ...tempCh[el],
          isView: true,
        };
      }
    });
    let temp = JSON.parse(JSON.stringify(localLoadedActivityPropertyData));
    let docMap = {},
      taskDocMap = [];
    Object.keys(docItemData)?.forEach((el) => {
      if (
        tempCh[el].isDelete ||
        tempCh[el].isDownlaod ||
        tempCh[el].isView ||
        tempCh[el].isPrint ||
        tempCh[el].isModify ||
        tempCh[el].isAdd
      ) {
        docMap = {
          ...docMap,
          [el]: {
            documentType: {
              docTypeId: docItemData[el].docTypeId,
              docTypeName: docItemData[el].docTypeName,
              sDocType: "D",
            },
            isDelete: tempCh[el].isDelete,
            isDownlaod: tempCh[el].isDownlaod,
            isView: tempCh[el].isView,
            isAdd: tempCh[el].isAdd,
            isPrint: tempCh[el].isPrint,
            isModify: tempCh[el].isModify,
          },
        };
        // code added on 3 Aug 2023 for BugId 127487 - Regression :- form not showing in Task rights.
        taskDocMap = [
          ...taskDocMap,
          {
            m_bIsAddForTask: tempCh[el].isAdd,
            m_bIsViewForTask: tempCh[el].isView,
            m_bIsModifyForTask: tempCh[el].isModify,
            docTypeName: docItemData[el].docTypeName,
            docTypeId: docItemData[el].docTypeId,
          },
        ];
      }
    });
    if (temp?.ActivityProperty?.wdeskInfo?.objPMWdeskDocuments?.documentMap) {
      temp.ActivityProperty.wdeskInfo.objPMWdeskDocuments.documentMap = {
        ...docMap,
      };
    } else {
      temp.ActivityProperty.wdeskInfo.objPMWdeskDocuments = {
        ...temp.ActivityProperty.wdeskInfo.objPMWdeskDocuments,
        documentMap: { ...docMap },
      };
    }
    // code added on 3 Aug 2023 for BugId 127487 - Regression :- form not showing in Task rights.
    if (temp?.ActivityProperty?.wdeskInfo?.objPMWdeskTasks?.taskMap) {
      Object.values(
        temp?.ActivityProperty?.wdeskInfo?.objPMWdeskTasks?.taskMap
      )?.forEach((task) => {
        if (task.m_arrDocumentInfo) {
          temp.ActivityProperty.wdeskInfo.objPMWdeskTasks.taskMap[
            task.taskTypeInfo.taskName
          ].m_arrDocumentInfo = [...taskDocMap];
        } else {
          temp.ActivityProperty.wdeskInfo.objPMWdeskTasks.taskMap[
            task.taskTypeInfo.taskName
          ] = {
            ...task,
            m_arrDocumentInfo: [...taskDocMap],
          };
        }
      });
    }
    setlocalLoadedActivityPropertyData(temp);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.workdesk]: { isModified: true, hasError: false },
      })
    );
  };

  // code added on 19 Sep 2022 for BugId 111134
  const displayedOptions = Object.keys(docItemData)?.filter((option) =>
    containsText(docItemData[option].docTypeName, searchTerm)
  );

  return (
    <React.Fragment>
      <div className={styles.documentRow}>
        <div className={styles.checklist}>
          <FormGroup>
            <FormControlLabel
              label={<div>{t("document")}</div>}
              control={
                <Checkbox
                  checked={checkDoc}
                  onChange={CheckDocHandler}
                  className={styles.mainCheckbox}
                  disabled={isReadOnly}
                  data-testid="CheckDocId"
                  type="checkbox"
                  id="pmweb_workdesk_document_checkBox"
                  inputRef={documentRef}
                  onKeyUp={(e) => {
                    if (e.key === "Enter") {
                      documentRef.current.click();
                      e.stopPropagation();
                    }
                  }}
                />
              }
            />
          </FormGroup>
        </div>
        <div className="row" style={{ gap: "1vw" }}>
          <div className={styles.searchbox}>
            <SearchBox
              width="20vw"
              title={"Document"}
              name="search"
              placeholder={t("Search Here")}
              onSearchChange={(val) => setSearchTerm(val)} // code added on 19 Sep 2022 for BugId 111134
              clearSearchResult={() => setSearchTerm("")} // code added on 19 Sep 2022 for BugId 111134
            />
          </div>
          {!isReadOnly && (
            <button
              disabled={
                !checkDoc ||
                props.openProcessType === PROCESSTYPE_DEPLOYED ||
                props.openProcessType === PROCESSTYPE_REGISTERED
              }
              className={
                !checkDoc ||
                props.openProcessType === PROCESSTYPE_DEPLOYED ||
                props.openProcessType === PROCESSTYPE_REGISTERED
                  ? styles.disabledBtn
                  : styles.addBtn
              }
              onClick={defineHandler}
              id="pmweb_workdesk_document_defineBtn"
              data-testid="defineBtn_doc"
            >
              {t("Define")}
            </button>
          )}
        </div>
        <div
          className={styles.todoDocTextarea}
          style={{
            marginTop: "1rem",
            // width: props.isDrawerExpanded ? "90%" : "60rem",
            width: "100%",
          }}
        >
          {Object.keys(docItemData)?.length > 0 ? (
            <React.Fragment>
              <div
                className={`row ${styles.docTableHeader}`}
                style={{ minWidth: "58rem" }}
              >
                <div className={styles.docTypes} style={{ width: "25%" }}>
                  {t("docTypes")}
                </div>
                {/* <div className={styles.view}>
                  <Checkbox
                    className={styles.mainCheckbox}
                    checked={!checkDoc ? false : allChecked?.isAdd}
                    disabled={!checkDoc || isReadOnly}
                    onChange={(e) => allCheckHandler("isAdd", e)}
                  />
                  {t("add")}
                </div> */}
                <div className={styles.view}>
                  <FormGroup>
                    <FormControlLabel
                      label={<div>{t("view")}</div>}
                      control={
                        <Checkbox
                          className={
                            direction === RTL_DIRECTION
                              ? styles.mainCheckboxArabic
                              : styles.mainCheckbox
                          }
                          checked={!checkDoc ? false : allChecked?.isView}
                          disabled={!checkDoc || isReadOnly}
                          onChange={(e) => allCheckHandler("isView", e)}
                          id="pmweb_workdesk_document_view"
                          inputRef={viewRef}
                          onKeyUp={(e) => {
                            if (e.key === "Enter") {
                              viewRef.current.click();
                              e.stopPropagation();
                            }
                          }}
                        />
                      }
                    />
                  </FormGroup>
                </div>
                <div className={styles.checkboxHeader}>
                  <FormGroup>
                    <FormControlLabel
                      label={<div>{t("modify")}</div>}
                      control={
                        <Checkbox
                          className={
                            direction === RTL_DIRECTION
                              ? styles.mainCheckboxArabic
                              : styles.mainCheckbox
                          }
                          checked={!checkDoc ? false : allChecked?.isModify}
                          disabled={!checkDoc || isReadOnly}
                          onChange={(e) => allCheckHandler("isModify", e)}
                          id="pmweb_workdesk_document_modify"
                          inputRef={modifyRef}
                          onKeyUp={(e) => {
                            if (e.key === "Enter") {
                              modifyRef.current.click();
                              e.stopPropagation();
                            }
                          }}
                        />
                      }
                    />
                  </FormGroup>
                </div>
                <div className={styles.checkboxHeader}>
                  <FormGroup>
                    <FormControlLabel
                      label={<div>{t("delete")}</div>}
                      control={
                        <Checkbox
                          className={
                            direction === RTL_DIRECTION
                              ? styles.mainCheckboxArabic
                              : styles.mainCheckbox
                          }
                          checked={!checkDoc ? false : allChecked?.isDelete}
                          disabled={!checkDoc || isReadOnly}
                          onChange={(e) => allCheckHandler("isDelete", e)}
                          id="pmweb_workdesk_document_delete"
                          inputRef={deleteRef}
                          onKeyUp={(e) => {
                            if (e.key === "Enter") {
                              deleteRef.current.click();
                              e.stopPropagation();
                            }
                          }}
                        />
                      }
                    />
                  </FormGroup>
                </div>
                <div className={styles.checkboxDownload}>
                  <FormGroup>
                    <FormControlLabel
                      label={<div> {t("download")}</div>}
                      control={
                        <Checkbox
                          className={
                            direction === RTL_DIRECTION
                              ? styles.mainCheckboxArabic
                              : styles.mainCheckbox
                          }
                          checked={!checkDoc ? false : allChecked?.isDownlaod}
                          disabled={!checkDoc || isReadOnly}
                          onChange={(e) => allCheckHandler("isDownlaod", e)}
                          id="pmweb_workdesk_document_download"
                          inputRef={downloadRef}
                          onKeyUp={(e) => {
                            if (e.key === "Enter") {
                              downloadRef.current.click();
                              e.stopPropagation();
                            }
                          }}
                        />
                      }
                    />
                  </FormGroup>
                </div>
                <div className={styles.checkboxHeader}>
                  <FormGroup>
                    <FormControlLabel
                      label={<div>{t("print")}</div>}
                      control={
                        <Checkbox
                          className={
                            direction === RTL_DIRECTION
                              ? styles.mainCheckboxArabic
                              : styles.mainCheckbox
                          }
                          checked={!checkDoc ? false : allChecked?.isPrint}
                          disabled={!checkDoc || isReadOnly}
                          onChange={(e) => allCheckHandler("isPrint", e)}
                          id="pmweb_workdesk_document_print"
                          inputRef={printRef}
                          onKeyUp={(e) => {
                            if (e.key === "Enter") {
                              printRef.current.click();
                              e.stopPropagation();
                            }
                          }}
                        />
                      }
                    />
                  </FormGroup>
                </div>
              </div>
              <div className={styles.docTextarea} style={{ minWidth: "58rem" }}>
                {checkDoc &&
                  displayedOptions?.map((val, index) => {
                    return (
                      <div
                        className="row"
                        style={{ height: "var(--line_height)" }}
                      >
                        <React.Fragment>
                          <div
                            className={styles.docTypes}
                            style={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {docItemData[val].docTypeName}
                          </div>
                          {/* <div className={styles.view}>
                            <Checkbox
                              className={styles.mainCheckbox}
                              onChange={(e) => CheckHandler(val, "isAdd", e)}
                              checked={
                                checked[val]?.isAdd ? checked[val].isAdd : false
                              }
                              disabled={isReadOnly}
                              id="addBox"
                            />
                          </div> */}
                          <div className={styles.view}>
                            <Checkbox
                              className={
                                direction === RTL_DIRECTION
                                  ? styles.mainCheckboxArabic
                                  : styles.mainCheckbox
                              }
                              onChange={(e) => CheckHandler(val, "isView", e)}
                              checked={
                                checked[val]?.isView
                                  ? checked[val].isView
                                  : false
                              }
                              disabled={isReadOnly}
                              id={`pmweb_workdesk_document_viewBox_${index}`}
                              inputRef={(item) =>
                                (ViewActRef.current[index] = item)
                              }
                              onKeyUp={(e) => {
                                if (e.key === "Enter") {
                                  ViewActRef.current[index].click();
                                  e.stopPropagation();
                                }
                              }}
                            />
                          </div>
                          <div className={styles.checkboxHeader}>
                            <Checkbox
                              className={
                                direction === RTL_DIRECTION
                                  ? styles.mainCheckboxArabic
                                  : styles.mainCheckbox
                              }
                              onChange={(e) => CheckHandler(val, "isModify", e)}
                              id={`pmweb_workdesk_document_modifyBox_${index}`}
                              checked={
                                checked[val]?.isModify
                                  ? checked[val].isModify
                                  : false
                              }
                              disabled={isReadOnly}
                              inputRef={(item) =>
                                (modifyActRef.current[index] = item)
                              }
                              onKeyUp={(e) => {
                                if (e.key === "Enter") {
                                  modifyActRef.current[index].click();
                                  e.stopPropagation();
                                }
                              }}
                            />
                          </div>
                          <div className={styles.checkboxHeader}>
                            <Checkbox
                              className={
                                direction === RTL_DIRECTION
                                  ? styles.mainCheckboxArabic
                                  : styles.mainCheckbox
                              }
                              onChange={(e) => CheckHandler(val, "isDelete", e)}
                              id={`pmweb_workdesk_document_deleteBox_${index}`}
                              checked={
                                checked[val]?.isDelete
                                  ? checked[val].isDelete
                                  : false
                              }
                              disabled={isReadOnly}
                              inputRef={(item) =>
                                (deleteActRef.current[index] = item)
                              }
                              onKeyUp={(e) => {
                                if (e.key === "Enter") {
                                  deleteActRef.current[index].click();
                                  e.stopPropagation();
                                }
                              }}
                            />
                          </div>
                          <div className={styles.checkboxDownload}>
                            <Checkbox
                              className={
                                direction === RTL_DIRECTION
                                  ? styles.mainCheckboxArabic
                                  : styles.mainCheckbox
                              }
                              onChange={(e) =>
                                CheckHandler(val, "isDownlaod", e)
                              }
                              id={`pmweb_workdesk_document_downloadBox_${index}`}
                              checked={
                                checked[val]?.isDownlaod
                                  ? checked[val].isDownlaod
                                  : false
                              }
                              disabled={isReadOnly}
                              inputRef={(item) =>
                                (downloadActRef.current[index] = item)
                              }
                              onKeyUp={(e) => {
                                if (e.key === "Enter") {
                                  downloadActRef.current[index].click();
                                  e.stopPropagation();
                                }
                              }}
                            />
                          </div>
                          <div className={styles.checkboxHeader}>
                            <Checkbox
                              className={
                                direction === RTL_DIRECTION
                                  ? styles.mainCheckboxArabic
                                  : styles.mainCheckbox
                              }
                              onChange={(e) => CheckHandler(val, "isPrint", e)}
                              id={`pmweb_workdesk_document_printBox_${index}`}
                              checked={
                                checked[val]?.isPrint
                                  ? checked[val].isPrint
                                  : false
                              }
                              disabled={isReadOnly}
                              inputRef={(item) =>
                                (printActRef.current[index] = item)
                              }
                              onKeyUp={(e) => {
                                if (e.key === "Enter") {
                                  printActRef.current[index].click();
                                  e.stopPropagation();
                                }
                              }}
                            />
                          </div>
                        </React.Fragment>
                      </div>
                    );
                  })}
              </div>
            </React.Fragment>
          ) : null}
        </div>
      </div>
      <Modal open={addDoc} onClose={() => setAddDoc(false)}>
        <AddDoc
          handleClose={() => setAddDoc(false)}
          addDocToList={addDocToList}
          addAnotherDoc={addAnotherDoc}
          setAddAnotherDoc={setAddAnotherDoc}
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
    cellLaneId: state.selectedCellReducer.selectedActLaneId,
    isDrawerExpanded: state.isDrawerExpanded.isDrawerExpanded,
  };
};

export default connect(mapStateToProps, null)(Document);
