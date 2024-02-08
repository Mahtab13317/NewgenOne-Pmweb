import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Checkbox, FormControlLabel, FormGroup } from "@material-ui/core";
import { store, useGlobalState } from "state-pool";
import Modal from "../../../../UI/Modal/Modal";
import ScanDefination from "./ScanDefination";
import { setActivityPropertyChange } from "../../../../redux-store/slices/ActivityPropertyChangeSlice";
import {
  RTL_DIRECTION,
  propertiesLabel,
} from "../../../../Constants/appConstants";
import { connect, useDispatch, useSelector } from "react-redux";
import styles from "./todo.module.css";
import { OpenProcessSliceValue } from "../../../../redux-store/slices/OpenProcessSlice";
import { isProcessDeployedFunc } from "../../../../utility/CommonFunctionCall/CommonFunctionCall";
import arabicStyles from "./ArabicStyles.module.css";
import { LightTooltip } from "../../../../UI/StyledTooltip";

function Scan(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const dispatch = useDispatch();
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const loadedActivityPropertyData = store.getState("activityPropertyData");
  const [localLoadedActivityPropertyData, setlocalLoadedActivityPropertyData] =
    useGlobalState(loadedActivityPropertyData);
  const [checkScan, setCheckScan] = useState(false);
  const [openModal, setopenModal] = useState(null);
  const [allDocType, setAllDocType] = useState([]);
  const [allChecked, setAllChecked] = useState(false);
  const openProcessData = useSelector(OpenProcessSliceValue);
  const scanRef = useRef();
  const allCheckRef = useRef();
  const scanActionRef = useRef([]);
  /*code updated on 21 September 2022 for BugId 115467*/
  const isReadOnly =
    props.isReadOnly || isProcessDeployedFunc(localLoadedProcessData);

  useEffect(() => {
    let scan = {
      ...localLoadedActivityPropertyData?.ActivityProperty?.wdeskInfo
        ?.objPMWdeskScanTool?.scanToolMap,
    };
    let temp = JSON.parse(JSON.stringify(openProcessData.loadedData));
    let docList = [];
    temp?.DocumentTypeList?.forEach((doc) => {
      docList.push(doc);
    });
    setAllDocType(docList);
    Object.keys(scan).forEach((el) => {
      docList?.forEach((doc, index) => {
        // modified on 21/10/23 for BugId 139457
        // if (+doc.DocTypeId === +el) {
        if (doc.DocName === el) {
          let scanInputStr = "";
          scan[el].scanActionList?.forEach((val) => {
            // modified on 21/10/23 for BugId 139457
            // scanInputStr = scanInputStr + val.ScanActionLabel + ", ";
            scanInputStr = scanInputStr + val.scanActionLabel + ", ";
          });
          docList[index] = {
            ...doc,
            scanActionList: scan[el].scanActionList,
            checked: true,
            scanInputStr: scanInputStr,
          };
        }
      });
    });
    let allCheck = docList?.every((el) => {
      return el.checked === true;
    });
    setAllChecked(allCheck);
    setCheckScan(
      localLoadedActivityPropertyData?.ActivityProperty?.wdeskInfo
        ?.objPMWdeskScanTool?.scanRendered
    );
  }, [localLoadedActivityPropertyData]);

  const CheckScanHandler = (e) => {
    /* let val;
    setCheckScan((prev) => {
      val = !prev;
      return !prev;
    }); */
    let temp = JSON.parse(JSON.stringify(localLoadedActivityPropertyData));
    if (temp?.ActivityProperty?.wdeskInfo) {
      if (temp?.ActivityProperty?.wdeskInfo?.objPMWdeskScanTool) {
        let valTemp =
          temp?.ActivityProperty?.wdeskInfo?.objPMWdeskScanTool?.scanRendered;
        if (valTemp === false || valTemp === true) {
          temp.ActivityProperty.wdeskInfo.objPMWdeskScanTool.scanRendered =
            e.target.checked;
        } else {
          temp.ActivityProperty.wdeskInfo.objPMWdeskScanTool = {
            ...temp.ActivityProperty.wdeskInfo.objPMWdeskScanTool,
            scanRendered: e.target.checked,
          };
        }
      } else {
        temp.ActivityProperty.wdeskInfo = {
          ...temp.ActivityProperty.wdeskInfo,
          objPMWdeskScanTool: {
            scanRendered: e.target.checked,
          },
        };
      }
    } else {
      temp.ActivityProperty = {
        ...temp?.ActivityProperty,
        wdeskInfo: {
          objPMWdeskScanTool: {
            scanRendered: e.target.checked,
          },
        },
      };
    }
    setCheckScan(e.target.checked);
    setlocalLoadedActivityPropertyData(temp);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.workdesk]: { isModified: true, hasError: false },
      })
    );
  };

  // code edited on 21 Sep 2022 for BugId 114226
  const selectedCheck = (val, index) => {
    let tempDoc = [...allDocType];
    tempDoc[index].checked = val;
    setAllDocType(tempDoc);
    let allCheck = allDocType?.every((el) => {
      return el.checked === true;
    });
    setAllChecked(allCheck);
    let temp = JSON.parse(JSON.stringify(localLoadedActivityPropertyData));
    let tempVal = {
      ...temp?.ActivityProperty?.wdeskInfo?.objPMWdeskScanTool?.scanToolMap,
    };
    let tempDocProp = {
      ...temp?.ActivityProperty?.wdeskInfo?.objPMWdeskDocuments?.documentMap,
    };
    let docMap = {};
    if (val) {
      docMap = {
        ...tempVal,
        // modified on 21/10/23 for BugId 139457
        // [tempDoc[index].DocTypeId]: {
        [tempDoc[index].DocName]: {
          isAdd: true,
          scanActionList: [],
          scanToolInfo: {
            docTypeId: tempDoc[index].DocTypeId,
            docTypeName: tempDoc[index].DocName,
          },
        },
      };
    } else {
      Object.keys(tempVal)?.forEach((el) => {
        // modified on 21/10/23 for BugId 139457
        // if (el !== tempDoc[index].DocTypeId) {
        if (el !== tempDoc[index].DocName) {
          docMap = { ...docMap, [el]: tempVal[el] };
        }
      });
    }

    if (tempDocProp[tempDoc[index].DocName]) {
      tempDocProp[tempDoc[index].DocName] = {
        ...tempDocProp[tempDoc[index].DocName],
        isAdd: val,
      };
    } else {
      tempDocProp = {
        ...tempDocProp,
        [tempDoc[index].DocName]: {
          documentType: {
            docTypeId: tempDoc[index].DocTypeId,
            docTypeName: tempDoc[index].DocName,
            sDocType: "D",
          },
          isDelete: false,
          isDownlaod: false,
          isView: false,
          isAdd: val,
          isPrint: false,
          isModify: false,
        },
      };
    }

    let docFinalMap = {},
      taskDocMap = [];
    Object.keys(tempDocProp)?.forEach((el) => {
      if (
        tempDocProp[el].isDelete ||
        tempDocProp[el].isDownlaod ||
        tempDocProp[el].isView ||
        tempDocProp[el].isPrint ||
        tempDocProp[el].isModify ||
        tempDocProp[el].isAdd
      ) {
        docFinalMap = {
          ...docFinalMap,
          [el]: tempDocProp[el],
        };
        // added on 05/01/24 for BugId 142324
        taskDocMap = [
          ...taskDocMap,
          {
            m_bIsAddForTask: tempDocProp[el].isAdd,
            m_bIsViewForTask: tempDocProp[el].isView,
            m_bIsModifyForTask: tempDocProp[el].isModify,
            docTypeName: tempDocProp[el]?.documentType?.docTypeName,
            docTypeId: tempDocProp[el]?.documentType?.docTypeId,
          },
        ];
        // till here BugId 142324
      }
    });

    if (temp?.ActivityProperty?.wdeskInfo?.objPMWdeskScanTool?.scanToolMap) {
      temp.ActivityProperty.wdeskInfo.objPMWdeskScanTool.scanToolMap = {
        ...docMap,
      };
    } else {
      temp.ActivityProperty.wdeskInfo.objPMWdeskScanTool = {
        ...temp.ActivityProperty.wdeskInfo.objPMWdeskScanTool,
        scanToolMap: { ...docMap },
      };
    }
    if (temp?.ActivityProperty?.wdeskInfo?.objPMWdeskDocuments?.documentMap) {
      temp.ActivityProperty.wdeskInfo.objPMWdeskDocuments.documentMap = {
        ...docFinalMap,
      };
    } else {
      temp.ActivityProperty.wdeskInfo.objPMWdeskDocuments = {
        ...temp.ActivityProperty.wdeskInfo.objPMWdeskDocuments,
        documentMap: { ...docFinalMap },
      };
    }

    // added on 05/01/24 for BugId 142324
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
    // till here BugId 142324

    setlocalLoadedActivityPropertyData(temp);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.workdesk]: { isModified: true, hasError: false },
      })
    );
  };

  // code edited on 21 Sep 2022 for BugId 114226
  const allCheckHandler = () => {
    let allCheck = !allChecked;
    setAllChecked(allCheck);

    let tempDoc = [...allDocType];
    tempDoc?.forEach((val, index) => {
      tempDoc[index] = { ...val, checked: allCheck };
    });
    setAllDocType(tempDoc);

    let temp = JSON.parse(JSON.stringify(localLoadedActivityPropertyData));
    let tempDocProp = {
      ...temp?.ActivityProperty?.wdeskInfo?.objPMWdeskDocuments?.documentMap,
    };
    if (allCheck) {
      let tempList = {};
      tempDoc?.forEach((val) => {
        tempList = {
          ...tempList,
          // modified on 21/10/23 for BugId 139457
          // [val.DocTypeId]: {
          [val.DocName]: {
            isAdd: true,
            scanActionList: [],
            scanToolInfo: {
              docTypeId: val.DocTypeId,
              docTypeName: val.DocName,
            },
          },
        };
      });
      temp.ActivityProperty.wdeskInfo.objPMWdeskScanTool.scanToolMap = tempList;
      tempDoc?.forEach((el) => {
        if (tempDocProp[el.DocName]) {
          tempDocProp[el.DocName] = {
            ...tempDocProp[el.DocName],
            isAdd: allCheck,
          };
        } else {
          tempDocProp = {
            ...tempDocProp,
            [el.DocName]: {
              documentType: {
                docTypeId: el.DocTypeId,
                docTypeName: el.DocName,
                sDocType: "D",
              },
              isDelete: false,
              isDownlaod: false,
              isView: false,
              isAdd: allCheck,
              isPrint: false,
              isModify: false,
            },
          };
        }
      });
    } else {
      temp.ActivityProperty.wdeskInfo.objPMWdeskScanTool.scanToolMap = {};
      Object.keys(tempDocProp)?.forEach((el) => {
        tempDocProp[el] = { ...tempDocProp[el], isAdd: false };
      });
    }
    let docFinalMap = {},
      taskDocMap = [];
    Object.keys(tempDocProp)?.forEach((el) => {
      if (
        tempDocProp[el].isDelete ||
        tempDocProp[el].isDownlaod ||
        tempDocProp[el].isView ||
        tempDocProp[el].isPrint ||
        tempDocProp[el].isModify ||
        tempDocProp[el].isAdd
      ) {
        docFinalMap = {
          ...docFinalMap,
          [el]: tempDocProp[el],
        };
        // added on 05/01/24 for BugId 142324
        taskDocMap = [
          ...taskDocMap,
          {
            m_bIsAddForTask: tempDocProp[el].isAdd,
            m_bIsViewForTask: tempDocProp[el].isView,
            m_bIsModifyForTask: tempDocProp[el].isModify,
            docTypeName: tempDocProp[el]?.documentType?.docTypeName,
            docTypeId: tempDocProp[el]?.documentType?.docTypeId,
          },
        ];
        // till here BugId 142324
      }
    });
    if (temp?.ActivityProperty?.wdeskInfo?.objPMWdeskDocuments?.documentMap) {
      temp.ActivityProperty.wdeskInfo.objPMWdeskDocuments.documentMap = {
        ...docFinalMap,
      };
    } else {
      temp.ActivityProperty.wdeskInfo.objPMWdeskDocuments = {
        ...temp.ActivityProperty.wdeskInfo.objPMWdeskDocuments,
        documentMap: { ...docFinalMap },
      };
    }

    // added on 05/01/24 for BugId 142324
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
    // till here BugId 142324

    setlocalLoadedActivityPropertyData(temp);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.workdesk]: { isModified: true, hasError: false },
      })
    );
  };

  const scanHandler = (index) => {
    setopenModal(index);
  };

  const selectedScanActionHandler = (data, isEdited) => {
    let selectedArr = [];
    var selectedvalue;
    data?.forEach((val) => {
      selectedvalue =
        " " + val.field.VariableName + " = " + val.value.VariableName;
      selectedArr.push(selectedvalue);
    });

    let scanInputStr = "";
    selectedArr?.forEach((val) => {
      scanInputStr = scanInputStr + val + ",";
    });
    let tempDoc = [...allDocType];
    tempDoc[openModal].scanInputStr = scanInputStr;
    setAllDocType(tempDoc);

    setopenModal(null);
    let temp = JSON.parse(JSON.stringify(localLoadedActivityPropertyData));
    let tempVal = {
      ...temp?.ActivityProperty?.wdeskInfo?.objPMWdeskScanTool?.scanToolMap,
    };
    // code edited on 15 Sep 2022 for BugId 115561
    let newList = [];
    data?.forEach((val) => {
      newList.push({
        ScanActionLabel:
          val.field.VariableName + " = " + val.value.VariableName,
        // added on 21/10/23 for BugId 139457
        scanActionLabel:
          val.field.VariableName + " = " + val.value.VariableName,
        extObjID1: val.field.ExtObjectId,
        extObjID2: val.value.ExtObjectId,
        param1: val.field.VariableName,
        param2: val.value.VariableName,
        type1: val.field.VariableType,
        type2:
          val.value.VariableScope === "C"
            ? val.field.VariableType
            : val.value.VariableType,
        varFieldId_1: val.field.VarFieldId,
        varFieldId_2:
          val.value.VariableScope === "C" ? "0" : val.value.VarFieldId,
        varScope1: val.field.VariableScope,
        varScope2: val.value.VariableScope,
        variableId_1: val.field.VariableId,
        variableId_2: val.value.VariableId,
      });
    });
    // modified on 21/10/23 for BugId 139457
    /*tempVal[tempDoc[openModal].DocTypeId].scanActionList = [...newList];
    tempVal[tempDoc[openModal].DocTypeId] = {
      ...tempVal[tempDoc[openModal].DocTypeId],*/
    tempVal[tempDoc[openModal].DocName].scanActionList = [...newList];
    tempVal[tempDoc[openModal].DocName] = {
      ...tempVal[tempDoc[openModal].DocName],
      isAdd: true,
    };
    temp.ActivityProperty.wdeskInfo.objPMWdeskScanTool.scanToolMap = {
      ...tempVal,
    };
    setlocalLoadedActivityPropertyData(temp);
    if (isEdited) {
      dispatch(
        setActivityPropertyChange({
          [propertiesLabel.workdesk]: { isModified: true, hasError: false },
        })
      );
    }
  };

  return (
    <React.Fragment>
      <div className={styles.documentRow}>
        <div className={styles.checklist}>
          <FormGroup>
            <FormControlLabel
              label={
                <div>
                  {t("scan")} {t("Tool")}
                </div>
              }
              control={
                <Checkbox
                  checked={checkScan}
                  onChange={CheckScanHandler}
                  className={
                    direction === RTL_DIRECTION
                      ? arabicStyles.mainCheckbox
                      : styles.mainCheckbox
                  } //Changes made to solve Bug 137281
                  data-testid="CheckScanId"
                  type="checkbox"
                  disabled={isReadOnly}
                  id="pmweb_workdesk_scan_checkBox"
                  inputRef={scanRef}
                  onKeyUp={(e) => {
                    if (e.key === "Enter") {
                      scanRef.current.click();
                      e.stopPropagation();
                    }
                  }}
                />
              }
            />
          </FormGroup>
        </div>
        {
          // code updated on 14 Mar 2023 for BugId 120015
        }
        <div
          className={
            props.isDrawerExpanded ? styles.todoDocTextarea : styles.scanTable
          }
          style={{ marginTop: "1rem", width: "100%" }}
        >
          {allDocType?.length > 0 ? (
            <React.Fragment>
              <div
                className={`row ${styles.docTableHeader}`}
                style={{ minWidth: "45rem" }}
              >
                <div className={styles.docTypes}>{t("docTypes")}</div>
                <div className={styles.checkboxScan}>
                  <FormGroup>
                    <FormControlLabel
                      label={
                        <div style={{ display: "none" }}>{`allowAddition`}</div>
                      }
                      control={
                        <Checkbox
                          aria-label="allowAddition"
                          className={styles.mainCheckbox}
                          checked={allChecked}
                          disabled={!checkScan || isReadOnly}
                          onChange={(e) => allCheckHandler()}
                          id="pmweb_workdesk_scan_docTypes"
                          inputRef={allCheckRef}
                          onKeyUp={(e) => {
                            if (e.key === "Enter") {
                              allCheckRef.current.click();
                              e.stopPropagation();
                            }
                          }}
                        />
                      }
                    />
                  </FormGroup>
                </div>
                <div className={styles.allowAddition}>{t("allowAddition")}</div>
                <div className={styles.docTypes} style={{ marginLeft: "1rem" }}>
                  {t("scanActions")}
                </div>
              </div>
              <div className={styles.docTextarea} style={{ minWidth: "45rem" }}>
                {checkScan &&
                  allDocType?.map((el, index) => {
                    return (
                      <div
                        className="row"
                        style={{
                          minHeight: "var(--line_height)",
                          margin: "0.25rem 0",
                        }}
                      >
                        <React.Fragment>
                          {/* code modified on 07-10-2023 added tooltip for overlap issue for bugId:138099  */}
                          <LightTooltip
                            id="pmweb_workdesk_scan_allowAdditionTooltip"
                            arrow={true}
                            placement="bottom-start"
                            title={el.DocName}
                          >
                            <div className={styles.docTypes} key={index}>
                              {props.isDrawerExpanded ||
                              window.innerWidth <= 830
                                ? el.DocName
                                : `${el.DocName.slice(0, 30)}`}
                            </div>
                          </LightTooltip>
                          <div className={styles.checkboxScan}>
                            <FormGroup>
                              <FormControlLabel
                                label={
                                  <div
                                    style={{ display: "none" }}
                                  >{`allowAddition`}</div>
                                }
                                control={
                                  <Checkbox
                                    className={styles.mainCheckbox}
                                    onChange={(e) =>
                                      selectedCheck(e.target.checked, index)
                                    }
                                    checked={el.checked ? true : false}
                                    id="pmweb_workdesk_scan_checkBox_docName"
                                    disabled={isReadOnly}
                                    inputRef={(item) =>
                                      (scanActionRef.current[index] = item)
                                    }
                                    onKeyUp={(e) => {
                                      if (e.key === "Enter") {
                                        scanActionRef.current[index].click();
                                        e.stopPropagation();
                                      }
                                    }}
                                  />
                                }
                              />
                            </FormGroup>
                          </div>
                          <div className={styles.allowAddition}>
                            {el.checked && !isReadOnly ? (
                              <button
                                className={styles.allowAddBtn}
                                onClick={() => scanHandler(index)}
                                id="pmweb_workdesk_scan_scanAction"
                                data-testid="scanBtn"
                              >
                                {t("scanAction")}
                              </button>
                            ) : null}
                          </div>
                          <div
                            className={styles.docTypes}
                            style={{ marginLeft: "1rem" }}
                          >
                            {el.checked ? (
                              <input
                                aria-label="ScanAction"
                                value={el.scanInputStr}
                                className={styles.scanInputField}
                                disabled={true}
                              />
                            ) : null}
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
      {openModal != null ? (
        <Modal
          show={openModal != null}
          style={{
            padding: "0",
            // width: "60vw",
            top: "20%",
            // left: "20%",
            width: "60%",
            left: "20%",
          }}
          children={
            <ScanDefination
              selectedDoc={allDocType[openModal]}
              setopenModal={setopenModal}
              selectedScanActionHandler={selectedScanActionHandler}
              modalClosed={() => setopenModal(null)}
              isReadOnly={isReadOnly}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setopenModal(null);
                  e.stopPropagation();
                }
              }}
            />
          }
        />
      ) : null}
    </React.Fragment>
  );
}

//export default Scan;

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

export default connect(mapStateToProps, null)(Scan);
