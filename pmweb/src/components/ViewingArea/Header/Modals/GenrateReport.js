// Changes made to solve Bug 113657 - Process Report: Not able to download archived reports in Process report
import React, { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import "./ProjectReport.css";
import { Checkbox, CircularProgress, makeStyles } from "@material-ui/core";
import axios from "axios";
import {
  ENDPOINT_PROCESS_REPORT,
  RTL_DIRECTION,
  SERVER_URL,
} from "../../../../Constants/appConstants";
import arabicStyles from "./ArabicStyles.module.css";
import DOMPurify from "dompurify";
import { decode_utf8 } from "../../../../utility/UTF8EncodeDecoder";
{
  /*code updated on 28 Nov 2022 for BugId 118753*/
}
const useStyles = makeStyles((theme) => ({
  btn: {
    border: "none",
    padding: "0! important",
    fontFamily: "arial, sans-serif",
    color: "#2274BC",
    cursor: "pointer",
    fontSize: "14px !important",
  },
}));

function GenrateReport(props) {
  let { t } = useTranslation();
  const classes = useStyles();
  const direction = `${t("HTML_DIR")}`;
  const [checkSingleProcess, setcheckSingleProcess] = useState(false);
  const [archiveInOmnidoc, setarchiveInOmnidoc] = useState(false);
  const [showText, setshowText] = useState(false);
  const [spinner, setSpinner] = useState(false);
  const [isGenerateAPICalled, setIsGenerateAPICalled] = useState(false);
  const checkSingleRef = useRef();
  const archiveInOmnidocRef = useRef();
  const CheckSingleProcessHandler = () => {
    setcheckSingleProcess(!checkSingleProcess);
  };

  const CheckArchiveDocsHandler = () => {
    setarchiveInOmnidoc(!archiveInOmnidoc);
  };

  const cancelHandler = () => {
    props.setShowModal(null);
  };

  /* const genrateHandler = async () => {
  setshowText(true);
    setSpinner(true);
    props?.setBtnDisable(true); //Modified on 26/10/2023, bug_id: 138512
    setIsGenerateAPICalled(true);
    try {
       // const config = { headers: { "Content-Type": "application/json" } };
       let responseType = {
            responseType: "blob",
          };
        const data = {
              processImageReqFlag: checkSingleProcess ? "Y" : "N",
              saveInOD: archiveInOmnidoc ? "Y" : "N",
              processVariantReport: props.openProcessType,
              reportFormat: "2",
              imageContent: "N",
              variantId: "",
            };
       
        const response = await axios.post(SERVER_URL + ENDPOINT_PROCESS_REPORT, data, responseType);
        console.log("###","SUCCESS",response);
      
    } catch (err) {
        // do something when error occurrs
        console.log("###","ERRR",err);
    }
}; */

  const genrateHandler = () => {
    setshowText(true);
    setSpinner(true);
    props?.setBtnDisable(true); //Modified on 26/10/2023, bug_id: 138512
    setIsGenerateAPICalled(true);
    let jsonBody = {
      processImageReqFlag: checkSingleProcess ? "Y" : "N",
      saveInOD: archiveInOmnidoc ? "Y" : "N",
      processVariantReport: props.openProcessType,
      reportFormat: "2",
      imageContent: "N",
      variantId: "",
    };

    /*  axios({
      url: "/pmweb" + ENDPOINT_PROCESS_REPORT, //your url
      method: "POST",
      responseType: "blob", // important
      data: jsonBody,
    }).then((res) => {
     console.log("###","Report",res)
     if(res?.status===200)
     {
      setSpinner(false);
      setIsGenerateAPICalled(false);
      props?.setBtnDisable(false); //Modified on 26/10/2023, bug_id: 138512
      const url = window.URL.createObjectURL(
        new Blob([res?.data], {
          type: res?.headers["content-type"],
        })
      );
      var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
      var matches = filenameRegex.exec(
        decode_utf8(res?.headers["content-disposition"])  //Changes made to solve Bug137361
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", matches[1].replace(/['"]/g, "")); //or any other extension
      // document.body.appendChild(link);
      // link.click();
      const sanitizedHref = DOMPurify.sanitize(link.href);
      link.href = sanitizedHref;
      link.click();
     }
     else{
      console.log("###",res)
     }
      
    }); */
    /* const res = await axios({
      url: "/pmweb" + ENDPOINT_PROCESS_REPORT, //your url
      method: "POST",
      responseType: "blob", // important
      data: jsonBody,
    });
    if(res?.status === 200)
    {
      setSpinner(false);
      setIsGenerateAPICalled(false);
      props?.setBtnDisable(false); //Modified on 26/10/2023, bug_id: 138512
      const url = window.URL.createObjectURL(
        new Blob([res?.data], {
          type: res?.headers["content-type"],
        })
      );
      var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
      var matches = filenameRegex.exec(
        decode_utf8(res?.headers["content-disposition"])  //Changes made to solve Bug137361
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", matches[1].replace(/['"]/g, "")); //or any other extension
      // document.body.appendChild(link);
      // link.click();
      const sanitizedHref = DOMPurify.sanitize(link.href);
      link.href = sanitizedHref;
      link.click();
    } */

    //Modified on 28/10/2023, bug_id:138512
    let responseType = {
      responseType: "blob",
    };

    axios
      .post(SERVER_URL + ENDPOINT_PROCESS_REPORT, jsonBody, responseType)
      .then((res) => {
        if (res?.status === 200) {
          setSpinner(false);
          setIsGenerateAPICalled(false);
          props?.setBtnDisable(false); //Modified on 26/10/2023, bug_id: 138512

          const url = window.URL.createObjectURL(
            new Blob([res?.data], {
              type: res?.headers["content-type"],
            })
          );
          var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
          var matches = filenameRegex.exec(
            decode_utf8(res?.headers["content-disposition"]) //Changes made to solve Bug137361
          );
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", matches[1].replace(/['"]/g, "")); //or any other extension
          // document.body.appendChild(link);
          // link.click();
          const sanitizedHref = DOMPurify.sanitize(link.href);
          link.href = sanitizedHref;
          link.click();
        } else {
          setSpinner(false);
          setIsGenerateAPICalled(false);
        }
      });
    //till here for bug_id:138512
  };

  return (
    <>
      {
        //Modified  on 18/08/2023, bug_id:134355
      }
      {/* <div style={{ height: "150px" }}> */}
      <div style={{ height: "30vh" }}>
        <p
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.formatProcess
              : "formatProcess"
          }
          style={{ color: "#606060" }}
        >
          {t("formatofProcess")}
        </p>

        <div
          className="checklist"
          style={{ marginTop: "1rem", marginLeft: "1rem" }}
        >
          <Checkbox
            checked={checkSingleProcess}
            onChange={() => CheckSingleProcessHandler()}
            inputProps={{ "aria-labelledby": "singleProcessImg_Checkbox" }}
            id="pmweb_generatereport_singleprocessimage_checkbox"
            style={{
              height: "16px",
              width: "16px",
              marginRight: "8px",
              marginLeft: direction == RTL_DIRECTION ? "20px" : "none",
            }}
            tabIndex={0}
            inputRef={checkSingleRef}
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                checkSingleRef.current.click();
              }
            }}
          />
          <span id="singleProcessImg_Checkbox">{t("singleProcessImg")}</span>
        </div>

        <div
          className="checklist"
          style={{ marginTop: "1rem", marginLeft: "1rem" }}
        >
          <Checkbox
            checked={archiveInOmnidoc}
            inputProps={{ "aria-labelledby": "archiveDoc_Checkbox" }}
            onChange={() => CheckArchiveDocsHandler()}
            id="pmweb_generatereport_archiveInOmnidocs_checkbox"
            style={{
              height: "16px",
              width: "16px",
              marginRight: "8px",
              marginLeft: direction == RTL_DIRECTION ? "20px" : "none",
            }}
            tabIndex={0}
            inputRef={archiveInOmnidocRef}
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                archiveInOmnidocRef.current.click();
              }
            }}
          />
          <span id="archiveDoc_Checkbox"> {t("archiveInOmniDocs")}</span>
        </div>
        {
          //code updated on 28 Nov 2022 for BugId 113658
          //Modified on 26/10/2023, bug_id: 138512
        }
        {showText && !isGenerateAPICalled ? (
          <p className="statementReport">
            {t("reportAddedInArchivedReports")},{" "}
            <a
              onClick={props.changeTab}
              className={classes.btn}
              id="pmweb_generatereport_statementreport_link"
              tabIndex={0}
              onKeyUp={props.onKeyChangeTab}
              disabled={isGenerateAPICalled} //Modified on 26/10/2023, bug_id: 138512
            >
              {/* Changes made to solve Bug 137361  */}
              {t("clickHere")}
            </a>{" "}
            {t("toView")}
            {/* till here dated 27thSept */}
          </p>
        ) : null}

        <div className="footerProjectReport">
          <button
            className={
              direction === RTL_DIRECTION ? arabicStyles.cancel : "cancel"
            }
            onClick={cancelHandler}
            id="cancelBtn_projectReport"
            disabled={isGenerateAPICalled}
          >
            {t("cancel")}
          </button>
          <button
            className="createProperties"
            onClick={genrateHandler}
            id="createBtn_projectReport"
            disabled={isGenerateAPICalled} //Modified on 26/10/2023, bug_id: 138512
            style={{ display: "flex" }}
          >
            {/*code updated on 28 Nov 2022 for BugId 118410*/}
            {/*code updated on 26 JUL 2023 for BugId 130953*/}
            {/* {spinner ? (
              <CircularProgress
                style={{
                  width: "2rem",
                  height: "2rem",
                }}
              />
            ) : (
              t("genrate")
            )} */}
            {
              //Modified on 26/10/2023, bug_id: 138512
            }
            <p>{t("generate")}</p>
            {spinner ? (
              <div>
                <CircularProgress
                  style={{
                    width: "1.5rem",
                    height: "1.5rem",
                    color: "#fff",
                    marginTop: "0.5rem",
                    marginLeft: "0.25rem",
                  }}
                />
              </div>
            ) : null}
            {
              //till here for bug_id:138512
            }
          </button>
        </div>
      </div>
    </>
  );
}
export default GenrateReport;
