import React, { useState, useEffect, useRef } from "react";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import "../Interfaces.css";
import { useTranslation } from "react-i18next";
import AddCircleOutline from "@material-ui/icons/AddCircleOutlineOutlined";
import AddCircleFilled from "@material-ui/icons/AddCircleOutlined";
import { DisableCheckBox } from "../../../../utility/Tools/DisableFunc";
import { store, useGlobalState } from "state-pool";
import {
  PROCESSTYPE_LOCAL,
  PROCESSTYPE_LOCAL_CHECKED,
} from "../../../../Constants/appConstants";
import { LatestVersionOfProcess } from "../../../../utility/abstarctView/checkLatestVersion";
import { v4 as uuidv4 } from "uuid";

function CheckBoxes(props) {
  let { t } = useTranslation();
  const { processType, disabled } = props;
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const [checks, setChecks] = useState({
    Add: false,
    View: false,
    Modify: false,
    Delete: false,
    Download: false,
    Print: false,
  });
  const addRef = useRef();
  const viewRef = useRef();
  const modifyRef = useRef();
  const deleteRef = useRef();
  const downloadRef = useRef();
  const printRef = useRef();
  const addActRef = useRef();
  const viewActRef = useRef();
  const modifyActRef = useRef();
  const deleteActRef = useRef();
  const downloadActRef = useRef();
  const printActRef = useRef();

  const TempAdd = [
    { activityType: 2, subActivity: 1 },
    { activityType: 3, subActivity: 1 },
    { activityType: 2, subActivity: 2 },
  ];

  const TempModify = [
    { activityType: 2, subActivity: 1 },
    { activityType: 3, subActivity: 1 },
    { activityType: 2, subActivity: 2 },
  ];

  const TempDelete = [
    { activityType: 2, subActivity: 1 },
    { activityType: 3, subActivity: 1 },
    { activityType: 2, subActivity: 2 },
  ];
  const TempDownload = [
    { activityType: 2, subActivity: 1 },
    { activityType: 3, subActivity: 1 },
    { activityType: 2, subActivity: 2 },
  ];
  const TempPrint = [
    { activityType: 2, subActivity: 1 },
    { activityType: 3, subActivity: 1 },
    { activityType: 2, subActivity: 2 },
  ];
  const [isProcessReadOnly, setIsProcessReadOnly] = useState(false);
  // Function that runs when the component mounts.
  useEffect(() => {
    if (
      (processType !== PROCESSTYPE_LOCAL &&
        processType !== PROCESSTYPE_LOCAL_CHECKED) ||
      LatestVersionOfProcess(localLoadedProcessData?.Versions) !==
        +localLoadedProcessData?.VersionNo // modified on 05/09/2023 for BugId 136103
    ) {
      setIsProcessReadOnly(true);
    } else {
      setIsProcessReadOnly(false);
    }
  }, [processType]);

  const changeChecks = (check_type) => {
    if (props.type === "set-all") {
      props.updateSetAllChecks(check_type, props.docIdx, checks[check_type]);
    } else {
      props.toggleSingleChecks(
        check_type,
        props.activityIndex,
        props.activityId,
        checks[check_type]
      );
    }
  };

  useEffect(() => {
    // For each activity checkboxes
    let activityInDocType = false;
    if (props.docTypeList && props.activityIndex != undefined) {
      let activities = props.docTypeList.DocumentTypeList[props.activityIndex];
      activities.Activities.map((activity) => {
        if (activity.ActivityId == props.activityId) {
          activityInDocType = true;
          setChecks(() => {
            return {
              Add: activity.Add,
              View: activity.View,
              Modify: activity.Modify,
              Delete: activity.Delete,
              Download: activity.Download,
              Print: activity.Print,
            };
          });
        }
      });
      if (!activityInDocType) {
        setChecks(() => {
          return {
            Add: false,
            View: false,
            Modify: false,
            Delete: false,
            Download: false,
            Print: false,
          };
        });
      }
    }

    //For setAll checkBoxes
    if (props.type === "set-all" && props.docData) {
      let doc =
        props.docData &&
        props.docData.DocumentTypeList[props.docIdx].SetAllChecks;
      setChecks(() => {
        return {
          Add: doc.Add,
          View: doc.View,
          Modify: doc.Modify,
          Delete: doc.Delete,
          Download: doc.Download,
          Print: doc.Print,
        };
      });
    }
  }, [props.docTypeList, props.docData, props.compact]);

  if (props.compact) {
    return (
      <div>
        <FormControlLabel
          control={
            <Checkbox
              name="checkedF"
              icon={<AddCircleOutline />}
              checkedIcon={<AddCircleFilled />}
              // id="addCompact_docTypes"
              id={`pmweb_docTypes_addCompact_${
                props.title
              }_checkbox_${uuidv4()}`}
              tabIndex={0}
            />
          }
          disabled={
            disabled || DisableCheckBox(TempAdd, props) || isProcessReadOnly
              ? true
              : false
          }
          checked={DisableCheckBox(TempAdd, props) ? false : checks.Add}
          onChange={() => changeChecks("Add")}
          ref={addRef}
          tabIndex={-1}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              addRef.current.click();
            }
          }}
          id={`pmweb_docTypes_addCompact_${props.title}_${uuidv4()}`}
          aria-description={props.ariaDescription ? props.ariaDescription : ""}
        />
        <FormControlLabel
          checked={checks.View}
          disabled={disabled || isProcessReadOnly ? true : false}
          onChange={() => changeChecks("View")}
          ref={viewRef}
          tabIndex={-1}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              viewRef.current.click();
            }
          }}
          control={
            <Checkbox
              icon={<AddCircleOutline />}
              checkedIcon={<AddCircleFilled />}
              tabIndex={0}
              name="checkedF"
              // id="viewCompact_docTypes"
              id={`pmweb_docTypes_viewCompact_${
                props.title
              }_checkBox_${uuidv4()}`}
            />
          }
          id={`pmweb_docTypes_viewCompact_${props.title}_${uuidv4()}`}
          aria-description={props.ariaDescription ? props.ariaDescription : ""}
        />
        <FormControlLabel
          control={
            <Checkbox
              icon={<AddCircleOutline />}
              checkedIcon={<AddCircleFilled />}
              name="checkedF"
              // id="modifyCompact_docTypes"
              id={`pmweb_docTypes_modifyCompact_${
                props.title
              }_checkBox_${uuidv4()}`}
              tabIndex={0}
            />
          }
          onChange={() => changeChecks("Modify")}
          ref={modifyRef}
          tabIndex={-1}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              modifyRef.current.click();
            }
          }}
          disabled={
            disabled || DisableCheckBox(TempModify, props) || isProcessReadOnly
              ? true
              : false
          }
          checked={DisableCheckBox(TempModify, props) ? false : checks.Modify}
          id={`pmweb_docTypes_modifyCompact_${props.title}_${uuidv4()}`}
          aria-description={props.ariaDescription ? props.ariaDescription : ""}
        />
        <FormControlLabel
          control={
            <Checkbox
              icon={<AddCircleOutline />}
              checkedIcon={<AddCircleFilled />}
              name="checkedF"
              // id="deleteCompact_docTypes"
              id={`pmweb_docTypes_deleteCompact_${
                props.title
              }_checkBox_${uuidv4()}`}
              tabIndex={0}
            />
          }
          onChange={() => changeChecks("Delete")}
          ref={deleteRef}
          tabIndex={-1}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              deleteRef.current.click();
            }
          }}
          disabled={
            disabled || DisableCheckBox(TempDelete, props) || isProcessReadOnly
              ? true
              : false
          }
          checked={DisableCheckBox(TempDelete, props) ? false : checks.Delete}
          id={`pmweb_docTypes_deleteCompact_${props.title}_${uuidv4()}`}
          aria-description={props.ariaDescription ? props.ariaDescription : ""}
        />
        <FormControlLabel
          control={
            <Checkbox
              icon={<AddCircleOutline />}
              checkedIcon={<AddCircleFilled />}
              name="checkedF"
              // id="downloadCompact_docTypes"
              id={`pmweb_docTypes_downloadCompact_${
                props.title
              }_checkBox_${uuidv4()}`}
              tabIndex={0}
            />
          }
          onChange={() => changeChecks("Download")}
          ref={downloadRef}
          tabIndex={-1}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              downloadRef.current.click();
            }
          }}
          disabled={
            disabled ||
            DisableCheckBox(TempDownload, props) ||
            isProcessReadOnly
              ? true
              : false
          }
          id={`pmweb_docTypes_downloadCompact_${props.title}_${uuidv4()}`}
          checked={
            DisableCheckBox(TempDownload, props) ? false : checks.Download
          }
          aria-description={props.ariaDescription ? props.ariaDescription : ""}
        />
        <FormControlLabel
          control={
            <Checkbox
              icon={<AddCircleOutline />}
              checkedIcon={<AddCircleFilled />}
              name="checkedF"
              // id="printCompact_docTypes"
              id={`pmweb_docTypes_printCompact_${
                props.title
              }_checkBox_${uuidv4()}`}
              tabIndex={0}
            />
          }
          onChange={() => changeChecks("Print")}
          ref={printRef}
          tabIndex={-1}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              printRef.current.click();
            }
          }}
          disabled={
            disabled || DisableCheckBox(TempPrint, props) || isProcessReadOnly
              ? true
              : false
          }
          id={`pmweb_docTypes_printCompact_${props.title}_${uuidv4()}`}
          checked={DisableCheckBox(TempPrint, props) ? false : checks.Print}
          aria-description={props.ariaDescription ? props.ariaDescription : ""}
        />
      </div>
    );
  }
  return (
    <div className="checkBoxes" style={{ display: "flex", marginTop: "-1px" }}>
      <div className="checkBoxesThree" style={{ marginRight: "15px" }}>
        <FormControlLabel
          control={
            <Checkbox
              name="checkedF"
              id={`pmweb_docTypes_addRight_${props.title}_checkBox_${uuidv4()}`}
              tabIndex={0}
            />
          }
          label={t("add")}
          disabled={
            disabled ||
            DisableCheckBox(TempAdd, props) ||
            isProcessReadOnly ||
            props.DocType === "C"
              ? true
              : false
          }
          // modified on 29/10/23 for BugId 138883
          // checked={DisableCheckBox(TempAdd, props) ? false : checks.Add}
          checked={
            DisableCheckBox(TempAdd, props) || props.DocType === "C"
              ? false
              : checks.Add
          }
          // till here BugId 138883
          onChange={() => changeChecks("Add")}
          ref={addActRef}
          tabIndex={-1}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              addActRef.current.click();
            }
          }}
          id={`pmweb_docTypes_addRight_${props.title}_${uuidv4()}`}
          aria-description={props.ariaDescription ? props.ariaDescription : ""}
        />
        <FormControlLabel
          checked={checks.View}
          disabled={disabled || isProcessReadOnly ? true : false}
          onChange={() => changeChecks("View")}
          ref={viewActRef}
          tabIndex={-1}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              viewActRef.current.click();
            }
          }}
          control={
            <Checkbox
              name="checkedF"
              //
              id={`pmweb_docTypes_viewRight_${
                props.title
              }_checkBox_${uuidv4()}`}
              tabIndex={0}
            />
          }
          label={t("view")}
          id={`pmweb_docTypes_viewRight_${props.title}_${uuidv4()}`}
          aria-description={props.ariaDescription ? props.ariaDescription : ""}
        />
        <FormControlLabel
          control={
            <Checkbox
              name="checkedF"
              // id="modifyRight_docTypes"
              id={`pmweb_docTypes_modifyRight_${
                props.title
              }_checkBox_${uuidv4()}`}
              tabIndex={0}
            />
          }
          onChange={() => changeChecks("Modify")}
          ref={modifyActRef}
          tabIndex={-1}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              modifyActRef.current.click();
            }
          }}
          label={t("modify")}
          disabled={
            disabled ||
            DisableCheckBox(TempModify, props) ||
            isProcessReadOnly ||
            props.DocType === "C"
              ? true
              : false
          }
          // modified on 29/10/23 for BugId 138883
          // checked={DisableCheckBox(TempModify, props) ? false : checks.Modify}
          checked={
            DisableCheckBox(TempModify, props) || props.DocType === "C"
              ? false
              : checks.Modify
          }
          // till here BugId 138883
          id={`pmweb_docTypes_modifyRight_${props.title}_${uuidv4()}`}
          aria-description={props.ariaDescription ? props.ariaDescription : ""}
        />
      </div>
      <div className="checkBoxesThree">
        <FormControlLabel
          control={
            <Checkbox
              name="checkedF"
              // id="deleteRight_docTypes"
              id={`pmweb_docTypes_deleteRight_${
                props.title
              }_checkBox_${uuidv4()}`}
              tabIndex={0}
            />
          }
          label={t("delete")}
          onChange={() => changeChecks("Delete")}
          ref={deleteActRef}
          tabIndex={-1}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              deleteActRef.current.click();
            }
          }}
          disabled={
            disabled ||
            DisableCheckBox(TempDelete, props) ||
            isProcessReadOnly ||
            props.DocType === "C"
              ? true
              : false
          }
          // modified on 29/10/23 for BugId 138883
          // checked={DisableCheckBox(TempDelete, props) ? false : checks.Delete}
          checked={
            DisableCheckBox(TempDelete, props) || props.DocType === "C"
              ? false
              : checks.Delete
          }
          // till here BugId 138883
          id={`pmweb_docTypes_deleteRight_${props.title}_${uuidv4()}`}
          aria-description={props.ariaDescription ? props.ariaDescription : ""}
        />
        <FormControlLabel
          control={
            <Checkbox
              name="checkedF"
              // id="downloadRight_docTypes"
              id={`pmweb_docTypes_downloadRight_${
                props.title
              }_checkBox_${uuidv4()}`}
              tabIndex={0}
            />
          }
          label={t("download")}
          onChange={() => changeChecks("Download")}
          ref={downloadActRef}
          tabIndex={-1}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              downloadActRef.current.click();
            }
          }}
          disabled={
            disabled ||
            DisableCheckBox(TempDownload, props) ||
            isProcessReadOnly ||
            props.DocType === "C"
              ? true
              : false
          }
          // modified on 29/10/23 for BugId 138883
          // checked={DisableCheckBox(TempDownload, props) ? false : checks.Download}
          checked={
            DisableCheckBox(TempDownload, props) || props.DocType === "C"
              ? false
              : checks.Download
          }
          // till here BugId 138883
          id={`pmweb_docTypes_downloadRight_${props.title}_${uuidv4()}`}
          aria-description={props.ariaDescription ? props.ariaDescription : ""}
        />
        <FormControlLabel
          control={
            <Checkbox
              name="checkedF"
              // id="printRight_docTypes"
              id={`pmweb_docTypes_printRight_${
                props.title
              }_checkBox_${uuidv4()}`}
              tabIndex={0}
            />
          }
          label={t("print")}
          onChange={() => changeChecks("Print")}
          ref={printActRef}
          tabIndex={-1}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              printActRef.current.click();
            }
          }}
          id={`pmweb_docTypes_printRight_${props.title}_${uuidv4()}`}
          disabled={
            disabled ||
            DisableCheckBox(TempPrint, props) ||
            isProcessReadOnly ||
            props.DocType === "C"
              ? true
              : false
          }
          // modified on 29/10/23 for BugId 138883
          // checked={DisableCheckBox(TempPrint, props) ? false : checks.Print}
          checked={
            DisableCheckBox(TempPrint, props) || props.DocType === "C"
              ? false
              : checks.Print
          }
          // till here BugId 138883
          aria-description={props.ariaDescription ? props.ariaDescription : ""}
        />
      </div>
    </div>
  );
}

export default CheckBoxes;
