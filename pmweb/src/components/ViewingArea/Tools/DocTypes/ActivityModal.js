import React, { useEffect, useRef, useState } from "react";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { useTranslation } from "react-i18next";
import "../Interfaces.css";
import AddCircleOutline from "@material-ui/icons/AddCircleOutlineOutlined";
import AddCircleFilled from "@material-ui/icons/AddCircleOutlined";
import { v4 as uuidv4 } from "uuid";
import { RTL_DIRECTION } from "../../../../Constants/appConstants";

function ActivityModal(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
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

  const changeChecks = (check_type) => {
    checks[check_type] = !checks[check_type];
    props.updateActivitySetAllChecks(
      check_type,
      props.activityId,
      checks[check_type],
      checks,
      setChecks,
      props.activityIndex
    );
  };

  const isAllDocCaseDoc = () => {
    let totalDocsLength = props.docTypeList?.DocumentTypeList?.length;
    let caseDocsLength = props.docTypeList?.DocumentTypeList?.filter(
      (type) => type.DocType === "C"
    )?.length;
    return totalDocsLength === caseDocsLength;
  };

  useEffect(() => {
    const temp = ["Add", "View", "Modify", "Delete", "Download", "Print"];
    const caseDocTemp = ["View"];
    if (props.fullRightCheckOneActivity) {
      if (isAllDocCaseDoc()) {
        setChecks({
          Add: false,
          View: true,
          Modify: false,
          Delete: false,
          Download: false,
          Print: false,
        });
      } else {
        setChecks({
          Add: true,
          View: true,
          Modify: true,
          Delete: true,
          Download: true,
          Print: true,
        });
      }
    } else if (!props.fullRightCheckOneActivity) {
      (isAllDocCaseDoc() ? caseDocTemp : temp)?.forEach((value) => {
        let defaultArray = [];
        // modified on 29/10/23 for BugId 138883
        /*props.docTypeList &&
          props.docTypeList.DocumentTypeList.map((type) => {
            type.Activities.map((activity) => {
              if (activity.ActivityId == props.activityId) {
                defaultArray.push(activity[value]);
              }
            });
          }); */
        props.docTypeList?.DocumentTypeList?.forEach((type) => {
          type.Activities.forEach((activity) => {
            if (+activity.ActivityId === +props.activityId) {
              if (
                (type.DocType === "C" && value === "View") ||
                type.DocType !== "C"
              ) {
                defaultArray.push(activity[value]);
              }
            }
          });
        });
        // till here BugId 138883
        if (defaultArray.includes(false)) {
          setChecks((prevData) => {
            let newData = { ...prevData };
            newData[value] = false;
            return newData;
          });
        } else {
          setChecks((prevData) => {
            let newData = { ...prevData };
            newData[value] = true;
            return newData;
          });
        }
      });
    }
  }, []);

  if (props.compact) {
    return (
      <div
        style={{
          width: "220px",
          border: "1px solid green",
          zIndex: "1000",
          position: "absolute",
          backgroundColor: "white",
          padding: "0px 3px",
          height: "36px",
        }}
      >
        <div style={{ display: "flex" }}>
          <FormControlLabel
            control={
              <Checkbox
                name="checkedF"
                id={`pmweb_oneActivity_modalAdd_docTypes_checkbox_${uuidv4()}`}
                icon={<AddCircleOutline />}
                checkedIcon={<AddCircleFilled />}
                tabIndex={0}
              />
            }
            checked={checks["Add"]}
            onChange={() => changeChecks("Add")}
            ref={addRef}
            // tabIndex={-1}
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                addRef.current.click();
              }
            }}
            id="pmweb_oneActivity_modalAdd_docTypes"
          />
          <FormControlLabel
            checked={checks["View"]}
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
                id={`pmweb_oneActivity_modalView_docTypes_checkbox__${uuidv4()}`}
                name="checkedF"
                icon={<AddCircleOutline />}
                checkedIcon={<AddCircleFilled />}
                tabIndex={0}
              />
            }
            id={`pmweb_oneActivity_modalView_docTypes_${uuidv4()}`}
          />
          <FormControlLabel
            control={
              <Checkbox
                name="checkedF"
                id={`pmweb_oneActivity_modalModify_docTypes_checkbox_${uuidv4()}`}
                icon={<AddCircleOutline />}
                checkedIcon={<AddCircleFilled />}
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
            id={`pmweb_oneActivity_modalModify_docTypes_${uuidv4()}`}
            checked={checks["Modify"]}
          />
          <FormControlLabel
            control={
              <Checkbox
                id={`pmweb_oneActivity_modalDelete_docTypes_checkbox_${uuidv4()}`}
                name="checkedF"
                icon={<AddCircleOutline />}
                checkedIcon={<AddCircleFilled />}
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
            id={`pmweb_oneActivity_modalDelete_docTypes_${uuidv4()}`}
            checked={checks["Delete"]}
          />
          <FormControlLabel
            control={
              <Checkbox
                name="checkedF"
                id={`pmweb_oneActivity_modalDownload_docTypes_checkbox_${uuidv4()}`}
                icon={<AddCircleOutline />}
                checkedIcon={<AddCircleFilled />}
                tabIndex={0}
              />
            }
            onChange={() => changeChecks("Download")}
            id={`pmweb_oneActivity_modalDownload_docTypes_${uuidv4()}`}
            checked={checks["Download"]}
            ref={downloadRef}
            tabIndex={-1}
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                downloadRef.current.click();
              }
            }}
          />
          <FormControlLabel
            control={
              <Checkbox
                id={`pmweb_oneActivity_modalPrint_docTypes_checkbox_${uuidv4()}`}
                name="checkedF"
                icon={<AddCircleOutline />}
                checkedIcon={<AddCircleFilled />}
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
            id={`pmweb_oneActivity_modalPrint_docTypes_${uuidv4()}`}
            checked={checks["Print"]}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className="modalPaperDocType"
      // Changes on 10-10-2023 to resolve the bug Id 138881
      style={{
        width: "16rem",
        position: "absolute",
        left: direction === RTL_DIRECTION ? "-2.5rem" : "unset",
        right: direction === RTL_DIRECTION ? "unset" : "-2.5rem",
        top: "1rem",
      }}
      //onKeyDown :- For Closing the ActivityModal on Escape, as we are using FocusTrap
      onKeyDown={(e) => e.key === "Escape" && props.handleClose()}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "left",
        }}
      >
        <FormControlLabel
          control={
            <Checkbox
              name="checkedF"
              tabIndex={0}
              disabled={
                +props.activityType === 2 ||
                +props.activityType === 3 ||
                isAllDocCaseDoc()
              }
            />
          }
          label={t("add")}
          checked={
            +props.activityType === 2 ||
            +props.activityType === 3 ||
            isAllDocCaseDoc()
              ? false
              : checks["Add"]
          }
          onChange={() => changeChecks("Add")}
          ref={addActRef}
          tabIndex={-1}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              addActRef.current.click();
              e.stopPropagation();
            }
          }}
          id={`pmweb_docTypes_activityModal_${t("add")}_${uuidv4()}`}
        />
        <FormControlLabel
          checked={checks["View"]}
          onChange={() => changeChecks("View")}
          ref={viewActRef}
          tabIndex={-1}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              viewActRef.current.click();
              e.stopPropagation();
            }
          }}
          control={<Checkbox name="checkedF" tabIndex={0} />}
          label={t("view")}
          id={`pmweb_docTypes_activityModal_${t("view")}_${uuidv4()}`}
        />
        <FormControlLabel
          control={
            <Checkbox
              name="checkedF"
              tabIndex={0}
              disabled={
                +props.activityType === 2 ||
                +props.activityType === 3 ||
                isAllDocCaseDoc()
              }
            />
          }
          onChange={() => changeChecks("Modify")}
          ref={modifyActRef}
          tabIndex={-1}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              modifyActRef.current.click();
              e.stopPropagation();
            }
          }}
          label={t("modify")}
          checked={
            +props.activityType === 2 ||
            +props.activityType === 3 ||
            isAllDocCaseDoc()
              ? false
              : checks["Modify"]
          }
          id={`pmweb_docTypes_activityModal_${t("modify")}_${uuidv4()}`}
        />
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "left",
        }}
      >
        <FormControlLabel
          control={
            <Checkbox
              name="checkedF"
              tabIndex={0}
              disabled={
                +props.activityType === 2 ||
                +props.activityType === 3 ||
                isAllDocCaseDoc()
              }
            />
          }
          label={t("delete")}
          onChange={() => changeChecks("Delete")}
          ref={deleteActRef}
          tabIndex={-1}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              deleteActRef.current.click();
              e.stopPropagation();
            }
          }}
          checked={
            +props.activityType === 2 ||
            +props.activityType === 3 ||
            isAllDocCaseDoc()
              ? false
              : checks["Delete"]
          }
          id={`pmweb_docTypes_activityModal_${t("delete")}_${uuidv4()}`}
        />
        <FormControlLabel
          control={
            <Checkbox
              name="checkedF"
              tabIndex={0}
              disabled={
                +props.activityType === 2 ||
                +props.activityType === 3 ||
                isAllDocCaseDoc()
              }
            />
          }
          label={t("download")}
          onChange={() => changeChecks("Download")}
          ref={downloadActRef}
          tabIndex={-1}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              downloadActRef.current.click();
              e.stopPropagation();
            }
          }}
          checked={
            +props.activityType === 2 ||
            +props.activityType === 3 ||
            isAllDocCaseDoc()
              ? false
              : checks["Download"]
          }
          id={`pmweb_docTypes_activityModal_${t("download")}_${uuidv4()}`}
        />
        <FormControlLabel
          control={
            <Checkbox
              name="checkedF"
              tabIndex={0}
              disabled={
                +props.activityType === 2 ||
                +props.activityType === 3 ||
                isAllDocCaseDoc()
              }
            />
          }
          label={t("print")}
          onChange={() => changeChecks("Print")}
          ref={printActRef}
          tabIndex={-1}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              printActRef.current.click();
              e.stopPropagation();
            }
          }}
          checked={
            +props.activityType === 2 ||
            +props.activityType === 3 ||
            isAllDocCaseDoc()
              ? false
              : checks["Print"]
          }
          id={`pmweb_docTypes_activityModal_${t("print")}_${uuidv4()}`}
        />
      </div>
    </div>
  );
}

export default ActivityModal;
