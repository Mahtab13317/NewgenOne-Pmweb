// Changes made to solve Bug 113657 - Process Report: Not able to download archived reports in Process report
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./ProjectReport.css";
import { connect, useDispatch } from "react-redux";
import downloadIcon from "../../../../assets/Download.svg";
import arabicStyles from "./ArabicStyles.module.css";
import { RTL_DIRECTION } from "../../../../Constants/appConstants";
import axios from "axios";
import {
  SERVER_URL,
  ENDPOINT_GET_ARCHIEVE_PROCESS_REPORTLIST,
  ENDPOINT_DOWNLOAD_ARCHIEVE_REPORT,
} from "../../../../Constants/appConstants";
import { LightTooltip } from "../../../../UI/StyledTooltip";
import { shortenRuleStatement } from "../../../../utility/CommonFunctionCall/CommonFunctionCall";
import DOMPurify from "dompurify";
import { convertToArabicDateTime } from "../../../../UI/DatePicker/DateInternalization";

function ArchivedReport(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const [reportList, setReportList] = useState([]);
  const dispatch = useDispatch();
  {
    //code updated on 28 Nov 2022 for BugId 117449
  }
  useEffect(() => {
    axios
      .get(SERVER_URL + ENDPOINT_GET_ARCHIEVE_PROCESS_REPORTLIST)
      .then((res) => {
        if (res.status == 204) {
          setReportList([]);
          return false;
        } else {
          setReportList(res.data);
        }
      });
  }, []);

  const handleArchieveDownLoad = (report) => {
    console.log("REPORT", report);
    axios({
      url:
        "/pmweb" +
        ENDPOINT_DOWNLOAD_ARCHIEVE_REPORT +
        `?sIndex=${btoa(report.iSINdex)}&fileName=${props.openProcessName}`, //your url
      method: "GET",
      responseType: "blob", // important
    }).then((res) => {
      const url = window.URL.createObjectURL(
        new Blob([res.data], {
          type: res.headers["content-type"],
        })
      );
      var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
      var matches = filenameRegex.exec(res.headers["content-disposition"]);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", matches[1].replace(/['"]/g, "")); //or any other extension
      // document.body.appendChild(link);
      // link.click();
      const sanitizedHref = DOMPurify.sanitize(link.href);
      link.href = sanitizedHref;
      link.click();
    });
  };

  /*Bug 124513 Process Report>> unnecessary scroll icon appearing for Process report screen
  [10-02-2023] Corrected the screen*/
  return (
    <div
      style={{
        margin: "10px 20px",
        backgroundColor: "#F8F8F8",
        height: "253px",
        //overflow: "scroll",
        overflow: "hidden hidden",
      }}
    >
      {reportList?.length > 0 ? (
        <div
          // className="row"
          style={{
            height: "40px",
            margin: "5px 10px",
            padding: "0px 6px",
            display: "flex",
            justifyContent: "space-between",
            gap: "12px",
            alignItems: "center",
          }}
        >
          <p
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.reportName
                : "reportName"
            }
            style={{
              flex: "0.75",
              whiteSpace: "nowrap",
              fontWeight: "600",
            }}
            id="pmweb_archivedreport_reportname_p"
          >
            {t("reportName")}
          </p>
          <p
            className={
              direction === RTL_DIRECTION ? arabicStyles.createdOn : "createdOn"
            }
            style={{
              flex: "0.75",
              whiteSpace: "nowrap",
              fontWeight: "600",
            }}
            id="pmweb_archivedreport_createdon_p"
          >
            {t("createdOn")}
          </p>
          <p
            style={{
              width: "20px",
            }}
          ></p>
        </div>
      ) : (
        // Changes made to solve Bug 135309
        <p
          style={{
            position: "absolute",
            top: "50%",
            left: "35%",
          }}
        >
          {t("noReportsToShow")}
        </p>
        // till here dated 11thSept
      )}
      <div
        style={{
          height: "200px",
          overflow: "hidden auto",
        }}
      >
        {reportList?.map((el) => {
          return (
            <div
              style={{
                height: "40px",
                backgroundColor: "white",
                margin: "5px 10px",
                padding: "0px 6px",
                display: "flex",
                justifyContent: "space-between",
                gap: "12px",
                alignItems: "center",
              }}
            >
              <LightTooltip
                arrow={true}
                enterDelay={500}
                placement="bottom-start"
                title={el.docName}
              >
                <span
                  style={{
                    flex: "0.75",
                    whiteSpace: "nowrap",
                  }}
                >
                  {shortenRuleStatement(el?.docName, 20)}
                </span>
              </LightTooltip>
              <LightTooltip
                arrow={true}
                enterDelay={500}
                placement="bottom-start"
                // modified on 27/09/23 for BugId 136677
                // title={el.addedTime}
                title={convertToArabicDateTime(el.addedTime)}
              >
                <span
                  style={{
                    flex: "0.75",
                    whiteSpace: "nowrap",
                  }}
                >
                  {/* modified on 27/09/23 for BugId 136677 */}
                  {/* {shortenRuleStatement(el?.addedTime, 20)} */}
                  {shortenRuleStatement(
                    convertToArabicDateTime(el?.addedTime),
                    20
                  )}
                </span>
              </LightTooltip>
              <img
                style={{ height: "16px", width: "16px", cursor: "pointer" }}
                src={downloadIcon}
                alt="Download Archieve"
                onClick={() => handleArchieveDownLoad(el)}
                id="pmweb_archivedreport_downloadarchieve_image"
              />
            </div>
          );
        })}
      </div>
      <div className="footerProjectReport">
        <button
          className="cancel"
          // onClick={createHandler}
          onClick={() => {
            props.setShowModal(false);
          }}
          id="createBtn_projectReport"
          style={{ background: "#0072c6", color: "white", borderRadius: "2px" }}
        >
          {t("ok")}
        </button>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    openProcessName: state.openProcessClick.selectedProcessName,
  };
};
export default connect(mapStateToProps, null)(ArchivedReport);
