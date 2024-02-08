// Changes made to solve Bug Id - 112252 (Not being able to export requirements)
// Changes made to solve Bug Id - 121787  (Setting Page: Global Section requirements-Export section issues)

import React, { useState, useEffect, useRef } from "react";
import { Button, withStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import MuiAccordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { makeStyles } from "@material-ui/styles";
import { Checkbox } from "@material-ui/core";
import InfoOutlinedIcon from "@material-ui/icons/InfoOutlined";
import Tooltip from "@material-ui/core/Tooltip";
import { LightTooltip } from "../../../../../UI/StyledTooltip";
import { shortenRuleStatement } from "../../../../../utility/CommonFunctionCall/CommonFunctionCall";
import axios from "axios";
import FileUpload from "../../../../../UI/FileUpload";
import {
  ENDPOINT_IMPORT_SECTION,
  FILETYPE_ZIP,
  FILETYPE_ZIP1,
  RTL_DIRECTION,
} from "../../../../../Constants/appConstants";
import { SERVER_URL } from "../../../../../Constants/appConstants";
import { base64toBlob } from "../../../../../utility/Base64Operations/base64Operations";
import { setToastDataFunc } from "../../../../../redux-store/slices/ToastDataHandlerSlice";
import { useDispatch } from "react-redux";
import { CloseIcon } from "../../../../../utility/AllImages/AllImages";
import "./index.css";
import DOMPurify from "dompurify";
import { v4 as uuidv4 } from "uuid";
//import FocusTrap from "focus-trap-react";
import { FocusTrap } from "@mui/base";

function ExportImport(props) {
  const Accordion = withStyles({
    root: {
      "&$expanded": {
        margin: "auto",
      },
    },
    expanded: {},
  })(MuiAccordion);
  const useStyles = makeStyles({
    mainDiv: {
      width: "100vw",
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    exportMainDiv: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      borderBottom: "1px solid #c4c4c4",
      background: "#fff",
    },
    columnFlex: {
      display: "flex",
      flexDirection: "column",
    },
    rowFlex: {
      display: "flex",
      flexDirection: "row",
    },
    exportHeaderInnerDiv: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      paddingBottom: "1.25rem",
      borderBottom: "1px solid #c4c4c4",
      //padding: "0.8rem 1rem",
      padding: "1rem",
      alignItems: "center",
      //height: "5.167rem",
      //width: "inherit"
    },
    exportFooterDiv: {
      padding: "5px",
      marginTop: "10px",
      display: "flex",
      flexDirection: "row-reverse",
      height: "4.083rem",
      background: "#f8f8f8",
    },
    exportSubSect2OrderId: {
      padding: "0px 0 0 2px",
      color: "black",
      marginRight: "1.5rem",
      width: "2.5rem",
      height: "1.5rem",
      marginTop: "0px",
      borderRight: "none",
      fontSize: "var(--base_text_font_size)",
    },
    exportSubSectOrderId: {
      padding: "0px 0 0 2px",
      color: "black",
      marginRight: "1.5rem",
      width: "1.7rem",
      height: "1.5rem",
      marginTop: "0px",
      borderRight: "none",
      marginLeft: "0.25rem",
      fontSize: "var(--base_text_font_size)",
    },
    exportSectOrderId: {
      marginRight: "1.5rem",
      marginLeft: "3rem",
      paddingTop: "7px",
      fontSize: "var(--base_text_font_size)",
    },
    exportSectionName: {
      fontWeight: "500",
      marginLeft: "0px",
      borderLeft: "none",
      fontSize: "var(--base_text_font_size)",
    },
    tableCell: {
      padding: "0",
      height: "20px",
      borderBottom: "none",
    },
    AccordionSummary: {
      padding: "0",
      width: "100%",
      marginRight: "0",
      height: "3rem",
      minHeight: "1rem !important",
      border: "1px solid #f8f8f8",
      borderTop: "0px",
      backgroundColor: "#fffff",
      borderCollapse: "collapse",
    },
    InnerAccordionSummary: {
      padding: "0",
      width: "100%",
      marginRight: "0",
      height: "3rem",
      minHeight: "1rem !important",
      border: "1px solid #f8f8f8",
      borderTop: "0px",
      backgroundColor: "#FCFCFC",
      paddingLeft: "6rem",
      borderCollapse: "collapse",
    },
    InnerAccordionSummary2: {
      padding: "0",
      width: "100%",
      marginRight: "0",
      height: "3rem",
      minHeight: "1rem !important",
      border: "1px solid #f8f8f8",
      borderTop: "0px",
      backgroundColor: "#FCFCFC",
      paddingLeft: "9.5rem",
      borderCollapse: "collapse",
    },
    TableContainer: {
      overflowY: "scroll",
      overFlowX: "hidden",
      margin: direction === "rtl" ? "0 0.6rem 0 0" : "0 0 0 0.6rem",
      width: "95%",
      height: "22vh",
      "&::-webkit-scrollbar": {
        backgroundColor: "transparent",
        width: "0.3rem",
        height: "2rem",
      },

      "&:hover": {
        overflowY: "scroll",
        overFlowX: "hidden",
        "&::-webkit-scrollbar": {
          width: "0.3rem",
          height: "2rem",
        },
        "&::-webkit-scrollbar-thumb": {
          background: "#8c8c8c 0% 0% no-repeat padding-box",
          borderRadius: "0.313rem",
        },
      },
      margin: "1rem !important",
    },
    Buttons: {
      width: " 4.8125rem",
      height: " 1.75rem ",
      backgroundColor: "var(--button_color) !important",
      // border: "1px solid #C4C4C4 ",
      borderRadius: "2px ",
      fontFamily: "Open Sans",
      fontSize: "0.625rem",
      marginTop: "0.5rem",
      marginRight: "0.4375rem",
      textTransform: "none",
      whiteSpace: "nowrap",
      color: "white",
    },
    cancelButton: {
      backgroundColor: "white !important",
      border: "1px solid #C4C4C4 ",
      borderRadius: "2px ",
      fontFamily: "Open Sans",
      fontSize: "0.625rem",
      marginTop: "0.5rem",
      marginRight: "0.4375rem",
      textTransform: "none",
      whiteSpace: "nowrap",
      color: "#606060",
    },
    Accordion: {
      "&.MuiAccordion-root:before": {
        display: "none",
      },
    },
    Expanded: {
      "&.MuiAccordion-expanded": {
        margin: "0px",
      },
    },
    FileUpload: {
      height: "7rem",
    },
    importButtons: {
      backgroundColor: "var(--button_color)",
      textTransform: "none",
      whiteSpace: "nowrap",
      color: "white",
    },
    infoIconStyle: {
      color: "#606060",
      marginTop: "5px",
      // padding: "4px",
      marginLeft: "1.5rem",
      opacity: "0.6",
      height: "1.25rem",
      width: "1.25rem",
    },
    expandMoreIconStyle: {
      height: "1.25rem",
      width: "1.25rem",
      color: "#C5CCD1",
    },
  });
  const styles = useStyles();
  let { t } = useTranslation();
  const dispatch = useDispatch();
  const direction = `${t("HTML_DIR")}`;
  const [sectionsData, setsectionsData] = React.useState([]);
  const [files, setFiles] = useState([]);
  const [allSectionChecked, setallSectionChecked] = useState(false);
  const [newStyle, setnewStyle] = useState(false);
  const ref = useRef(null);
  const inputFile = useRef(null);
  const VarNameRef = useRef([]);
  const allSectionRef = useRef();
  useEffect(() => {
    let modData = [];
    props.sections.map((x) => {
      return modData.push({ ...x, isChecked: false });
    });

    setsectionsData(modData);
  }, [props]);

  const closeModalHandler = () => {
    props.closeExportImportModal();
  };

  const handleAllSectionChecked = (event) => {
    setallSectionChecked(event.target.checked);
    if (event.target.checked) {
      let temp = [...sectionsData];
      temp.forEach((elem) => {
        elem.isChecked = true;
      });
      setsectionsData(temp);
    } else {
      let temp = [...sectionsData];
      temp.forEach((elem) => {
        elem.isChecked = false;
      });
      setsectionsData(temp);
    }
  };

  const handleEachSectionChange = (event, secData) => {
    event.stopPropagation();
    let temp = [...sectionsData];
    let a = [];
    temp.forEach((data) => {
      if (data.OrderId === secData.OrderId) {
        data.isChecked = event.target.checked;
      }
      a.push(data.isChecked);
      if (a.includes(false)) setallSectionChecked(false);
      else if (!a.includes(false)) setallSectionChecked(true);
    });
    setsectionsData(temp);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        closeModalHandler();
      }
    }

    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);

  const exportRequirementHandler = () => {
    let temp = [];
    sectionsData?.map((el) => {
      if (el.isChecked) {
        temp.push({
          sectionName: el.SectionName,
          sectionOrderId: el.OrderId,
          sectionId: el.SectionId,
        });
      }
    });
    let postBody = {
      objInnerSections: [...temp],
      sectionName: temp[0].sectionName,
    };
    axios.post(SERVER_URL + `/exportSection`, postBody).then((res) => {
      if (res?.status === 200) {
        // let tempp ="UEsDBBQACAgIAEeJBVUAAAAAAAAAAAAAAAARAAAAU0VDVElPTlNUQUJMRS54bWyzCU5NLsnMzysOSUzKSbXj4rQJyi93SSxJBDI5bfyLUlKLPFPsDG30YUwbqAa/xNxUOygbKI0sauOSWpxclFkAErDLyrLRR+bbBCQWpeaVeLrYGdjow9lAe/XhFsNNgzoKAFBLBwg3V2t6YgAAAKQAAABQSwECFAAUAAgICABHiQVVN1dremIAAACkAAAAEQAAAAAAAAAAAAAAAAAAAAAAU0VDVElPTlNUQUJMRS54bWxQSwUGAAAAAAEAAQA/AAAAoQAAAAAA"
        const url = window.URL.createObjectURL(
          base64toBlob(res.data.ZipData, res.headers["Content-Type"])
        );
        // var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        // var matches = filenameRegex.exec(res.headers["content-disposition"]);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", res.data.ZipFileName); //or any other extension
        const sanitizedHref = DOMPurify.sanitize(link.href);
        link.href = sanitizedHref;
        link.click();
        // document.body.appendChild(link);
        // link.click();
      }
    });
  };

  /*****************************************************************************************
   * @author asloob_ali BUG ID: 114893 Description-: global requirement section: not able to import requirements
   * Reason:api was not integrated.
   * Resolution :integrated the api for import.
   * Date : 21/09/2022
   ****************/
  const handleImportRequirements = async (importType) => {
    const sectionInfo = {
      importedName: files[0]?.name.split(".").slice(0, -1).join("."),
    };

    sectionInfo["overwrite"] = importType === "override" ? true : false;

    const bodyFormData = new FormData();
    const selFile = files[0];
    bodyFormData.append("file", selFile);
    bodyFormData.append(
      "sectionInfo",
      new Blob([JSON.stringify(sectionInfo)], {
        type: "application/json",
      })
    );
    console.log(bodyFormData);
    const config = {
      headers: {
        "content-type": "multipart/form-data",
      },
    };
    try {
      const res = await axios.post(
        `${SERVER_URL}${ENDPOINT_IMPORT_SECTION}`,
        bodyFormData,
        config
      );

      if (res?.data?.Status === 0) {
        closeModalHandler();
        if (props.updateSections) {
          props.updateSections({ sections: res?.data?.Section });
        }
        dispatch(
          setToastDataFunc({
            message: t("requirementImportedSuccessfully"),
            severity: "success",
            open: true,
          })
        );
      } else if (res?.data?.Status === -2) {
        dispatch(
          setToastDataFunc({
            message: res?.data?.Message,
            severity: "error",
            open: true,
          })
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const setDropzonewithFileStyle = (data) => {
    setnewStyle(data);
  };

  const handleChangeFile = () => {
    setnewStyle(false);
    setFiles([]);
  };

  useEffect(() => {
    const close = (e) => {
      if (e.keyCode === 27) {
        closeModalHandler();
        e.stopPropagation();
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  function InfoIcon(data) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
        }}
      >
        <Tooltip
          disableFocusListener
          title={data.Description}
          placement="right"
        >
          <InfoOutlinedIcon className={styles.infoIconStyle} />
        </Tooltip>
      </div>
    );
  }

  return (
    <>
      <FocusTrap open>
        <div
          style={{
            width: "40%",
            height: "40vh",
            //height: "11.5rem",
            left: "30%",
            top: "25%",
            padding: "0",
            position: "relative",
            direction: direction,
          }}
        >
          {props.exportOrImportToShow === "export" ? (
            <div
              ref={ref}
              style={{ direction: direction == RTL_DIRECTION ? "rtl" : "ltr" }}
              className={styles.exportMainDiv}
            >
              <div className={styles.columnFlex}>
                <div className={styles.exportHeaderInnerDiv}>
                  <div className={styles.columnFlex}>
                    <p
                      style={{
                        font: "bold var(--title_text_font_size) Open Sans",
                        display: "flex",
                      }}
                    >
                      {t("exportSection")}
                    </p>
                    <div style={{ display: "flex" }}>
                      <p
                        style={{
                          font: "var(--base_text_font_size) Open Sans",
                          color: "#727272",
                          display: "flex",
                        }}
                      >
                        {t("selectSectionsExport")}
                      </p>
                    </div>
                  </div>
                  <button
                    style={{ border: "none", background: "transparent" }}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        closeModalHandler();
                        e.stopPropagation();
                      }
                    }}
                  >
                    <span style={{ display: "none" }}>CloseIcon</span>
                    <CloseIcon
                      style={{
                        height: "1rem",
                        width: "1rem",
                        cursor: "pointer",
                        color: "#606060 ",
                      }}
                      onClick={closeModalHandler}
                      id={`pmweb_GlobalReq_ExportImport_Close_${uuidv4()}`}
                    />
                  </button>
                </div>
              </div>
              {/* <div
            style={{
              width: "95%",
              height: "3rem",
              margin: "0.7rem 0 0.7rem 0.7rem",
            }}
          >
            <p
              style={{
                font: "var(--title_text_font_size) Open Sans",
                fontWeight: "bold",
                width: "3.4375rem",
              }}
            >
              {t("export")}
            </p>
            <div style={{ textAlign: "justify", whiteSpace: "nowrap" }}>
              <p
                style={{
                  font: "var(--subtitle_text_font_size) Open Sans",
                  color: "#727272",
                }}
              >
                {t("selectSectionsExport")}
              </p>
            </div>
          </div> */}
              <div style={{ display: "flex" }}>
                <TableContainer
                  className={styles.TableContainer}
                  component={Paper}
                  style={{ overflowX: "hidden" }}
                >
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow
                        style={{
                          height: "2.667rem",
                          border: "1px solid #f8f8f8",
                        }}
                      >
                        <TableCell className={styles.tableCell}>
                          <div
                            className={styles.rowFlex}
                            style={{
                              marginInlineStart: "2.55rem",
                            }}
                          >
                            <Checkbox
                              size="medium"
                              checked={allSectionChecked}
                              onChange={handleAllSectionChecked}
                              id="pmweb_GlobalReq_ExportImport_All"
                              inputRef={allSectionRef}
                              onKeyUp={(e) => {
                                if (e.key === "Enter") {
                                  allSectionRef.current.click();
                                  e.stopPropagation();
                                }
                              }}
                            />
                            <label
                              style={{
                                marginLeft: "3rem",
                                marginTop: "0.4rem",
                                fontWeight: "bold",
                                fontSize: "var(--subtitle_text_font_size)",
                              }}
                              htmlFor="pmweb_GlobalReq_ExportImport_All"
                            >
                              {t("sections")}
                            </label>
                          </div>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sectionsData.map((data, index) => {
                        return (
                          <TableRow
                            style={{
                              height: "2.667rem",
                              border: "10px solid #f8f8f8",
                            }}
                          >
                            <TableCell className={styles.tableCell}>
                              <Accordion
                                classes={{
                                  root: styles.Accordion,
                                  expanded: styles.Expanded,
                                }}
                              >
                                <AccordionSummary
                                  className={styles.AccordionSummary}
                                  style={{
                                    flexDirection: "row-reverse",
                                  }}
                                  expandIcon={
                                    <ExpandMoreIcon
                                      className={styles.expandMoreIconStyle}
                                    />
                                  }
                                  aria-controls="panel1a-content"
                                  id="pmweb_GlobalReq_ExportImport_panel1a-header"
                                >
                                  <div className={styles.rowFlex}>
                                    <Checkbox
                                      size="medium"
                                      checked={data.isChecked}
                                      onChange={(e) =>
                                        handleEachSectionChange(e, data)
                                      }
                                      className="checkBox"
                                      inputRef={(item) =>
                                        (VarNameRef.current[index] = item)
                                      }
                                      onKeyUp={(e) => {
                                        if (e.key === "Enter") {
                                          VarNameRef.current[index].click();
                                          e.stopPropagation();
                                        }
                                      }}
                                      id={`pmweb_checkbox_${index}`}
                                    />
                                    <p className={styles.exportSectOrderId}>
                                      {/* Code added to solve Bug 126819 dated 24thMay */}
                                      {index + 1}
                                      {/* till here */}
                                    </p>
                                    <LightTooltip
                                      id="pmweb_projectname_Tooltip"
                                      arrow={true}
                                      enterDelay={500}
                                      placement="bottom-start"
                                      title={data.SectionName}
                                    >
                                      <label
                                        style={{
                                          paddingTop: "7px",
                                          fontSize:
                                            "var(--base_text_font_size)",
                                        }}
                                        htmlFor={`pmweb_checkbox_${index}`}
                                      >
                                        {/* Changes made to solve Bug 134177  */}
                                        {/* {data.SectionName} */}
                                        {shortenRuleStatement(
                                          data.SectionName,
                                          80
                                        )}
                                      </label>
                                    </LightTooltip>
                                    {/* Changes made to solve Bug 126818 */}
                                    {/* {data.Description !== "" ? (
                                      <InfoIcon data={data}></InfoIcon>
                                    ) : null} */}
                                  </div>
                                </AccordionSummary>
                                {data.hasOwnProperty("SectionInner") &&
                                  data.SectionInner.map((subsection, index) => (
                                    <Accordion
                                      // className={`${styles.Accordion}`}
                                      classes={{
                                        root: styles.Accordion,
                                        expanded: styles.Expanded,
                                      }}
                                      defaultExpanded={false}
                                    >
                                      <AccordionSummary
                                        className={`${styles.InnerAccordionSummary} `}
                                        style={{
                                          flexDirection: "row-reverse",
                                        }}
                                        expandIcon={
                                          <ExpandMoreIcon
                                            className={
                                              styles.expandMoreIconStyle
                                            }
                                          />
                                        }
                                        aria-controls="panel1a-content"
                                        id="pmweb_GlobalReq_ExportImport_panel1a-header"
                                      >
                                        <div>
                                          <div className={styles.rowFlex}>
                                            <p
                                              className={
                                                styles.exportSubSectOrderId
                                              }
                                            >
                                              {subsection.OrderId + "."}
                                            </p>
                                            <LightTooltip
                                              id="pmweb_projectname_Tooltip"
                                              arrow={true}
                                              enterDelay={500}
                                              placement="bottom-start"
                                              title={subsection.SectionName}
                                            >
                                              <p
                                                className={
                                                  styles.exportSectionName
                                                }
                                              >
                                                {/* {subsection.SectionName} */}
                                                {shortenRuleStatement(
                                                  subsection.SectionName,
                                                  40
                                                )}
                                              </p>
                                            </LightTooltip>
                                            {subsection.Description !== "" ? (
                                              <InfoIcon
                                                data={subsection}
                                              ></InfoIcon>
                                            ) : null}
                                          </div>
                                        </div>
                                      </AccordionSummary>

                                      {subsection.hasOwnProperty(
                                        "SectionInner2"
                                      ) &&
                                        subsection.SectionInner2.length !== 0 &&
                                        subsection.SectionInner2.map(
                                          (subsections2) => (
                                            <Accordion
                                              classes={{
                                                root: styles.Accordion,
                                                expanded: styles.Expanded,
                                              }}
                                              defaultExpanded={false}
                                            >
                                              <AccordionSummary
                                                className={
                                                  styles.InnerAccordionSummary2
                                                }
                                                style={{
                                                  flexDirection: "row-reverse",
                                                }}
                                                aria-controls="panel1a-content"
                                                id="pmweb_GlobalReq_ExportImport_panel1a-header"
                                              >
                                                <div
                                                  className={styles.columnFlex}
                                                >
                                                  <div
                                                    className={styles.rowFlex}
                                                  >
                                                    <p
                                                      className={
                                                        styles.exportSubSect2OrderId
                                                      }
                                                    >
                                                      {subsections2.OrderId +
                                                        "."}
                                                    </p>
                                                    <LightTooltip
                                                      id="pmweb_projectname_Tooltip"
                                                      arrow={true}
                                                      enterDelay={500}
                                                      placement="bottom-start"
                                                      title={
                                                        subsections2.SectionName
                                                      }
                                                    >
                                                      <p
                                                        onClick={(e) =>
                                                          e.stopPropagation()
                                                        }
                                                        id="pmweb_GlobalReq_ExportImport_SectionName"
                                                        className={
                                                          styles.exportSectionName
                                                        }
                                                      >
                                                        {/* {subsections2.SectionName} */}
                                                        {shortenRuleStatement(
                                                          subsections2.SectionName,
                                                          50
                                                        )}
                                                      </p>
                                                    </LightTooltip>
                                                    {subsections2.Description !==
                                                    "" ? (
                                                      <InfoIcon
                                                        data={subsections2}
                                                      ></InfoIcon>
                                                    ) : null}
                                                  </div>
                                                </div>
                                              </AccordionSummary>
                                            </Accordion>
                                          )
                                        )}
                                    </Accordion>
                                  ))}
                              </Accordion>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>
              <div className={styles.exportFooterDiv}>
                <Button
                  className={styles.Buttons}
                  style={{
                    color: "white",
                    background: "var(--button_color) !important",
                  }}
                  variant="contained"
                  size="medium"
                  onClick={() => exportRequirementHandler()}
                  id="pmweb_GlobalReq_ExportImport_OK"
                  // changes on 20-09-23 to resolve the bug Id 135989
                  disabled={sectionsData.every((item) => !item.isChecked)}
                >
                  {t("export")}
                </Button>
                <Button
                  className={styles.cancelButton}
                  style={{
                    color: "#606060",
                    backgroundColor: "white",
                    border: "1px solid #C4C4C4",
                  }}
                  variant="contained"
                  onClick={closeModalHandler}
                  size="medium"
                  id={`pmweb_GlobalReq_ExportImport_Close_${uuidv4()}`}
                >
                  {t("cancel")}
                </Button>
              </div>
            </div>
          ) : (
            //Bug 123670 [21-02-2023] Changed the screen as per new wireframe
            <div
              ref={ref}
              style={{
                // width: "36vw",
                height: "23rem", //Changes made to solve Bug 134167
                position: "relative",
                display: "flex",
                flexDirection: "column",
                background: " #FFFFFF 0% 0% no-repeat padding-box",
                direction: direction == RTL_DIRECTION ? "rtl" : "ltr",
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: "1px solid #c4c4c4",
                    padding: "1rem 1vw",
                  }}
                >
                  <p
                    style={{
                      fontWeight: "600",
                      fontFamily: "var(--font_family)",
                      fontSize: "var(--subtitle_text_font_size)",
                    }}
                  >
                    {t("importSection")}
                  </p>
                  <button
                    style={{ border: "none", background: "transparent" }}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        closeModalHandler();
                        e.stopPropagation();
                      }
                    }}
                  >
                    <CloseIcon
                      style={{
                        width: "1rem",
                        cursor: "pointer",
                        color: "#606060 ",
                      }}
                      onClick={closeModalHandler}
                      id={`pmweb_GlobalReq_ExportImport_Close_${uuidv4()}`}
                    />
                    <span style={{ display: "none" }}>hgh</span>
                  </button>
                </div>
                <p
                  style={{
                    color: "#000",
                    font: "normal normal normal var(--base_text_font_size)/17px var(--font_family)",
                    margin: "1.25rem 1vw",
                  }}
                >
                  {t("uploadAZipFile")}
                </p>
              </div>
              {!newStyle ? (
                <div
                  style={{
                    width: "34vw",
                    height: "10rem",
                    marginLeft: "auto",
                    marginRight: "auto",
                    padding: "1.83rem auto",
                  }}
                >
                  <FileUpload
                    setStyle={(data) => setDropzonewithFileStyle(data)}
                    typesOfFilesToAccept={[FILETYPE_ZIP, FILETYPE_ZIP1]}
                    containerStyle={{ width: "auto", height: "10rem" }}
                    setFiles={setFiles}
                    callLocation="UploadFile"
                    dropString={t("dropFileHere")}
                    returnFileAsItIs={true}
                  />
                </div>
              ) : null}
              {newStyle ? (
                <div>
                  <div
                    style={{
                      margin: "0rem 1vw 2.5rem",
                    }}
                  >
                    <p
                      style={{
                        fontFamily: "var(--font_family)",
                        fontSize: "1rem",
                        color: "#606060",
                      }}
                    >
                      {t("fileName")}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        width: "28vw",
                        gap: "1rem",
                      }}
                    >
                      <input
                        value={files[0].name}
                        style={{
                          width: "21vw",
                          height: "var(--line_height)",
                          border: "1px solid #cecece",
                          backgroundColor: "#f8f8f8",
                          fontWeight: "400",
                          fontFamily: "var(--font_family)",
                        }}
                        id={`pmweb_GlobalReq_ExportImport_${files[0].name}`}
                      />
                      <Button
                        variant="contained"
                        className={styles.importButtons}
                        size="medium"
                        style={{
                          backgroundColor: "white",
                          border: "1px solid var(--button_color)",
                          color: "var(--button_color)",
                          width: "8.33rem",
                        }}
                        onClick={handleChangeFile}
                        id="pmweb_GlobalReq_ExportImport_ChangeFile"
                      >
                        {t("changeFile")}
                      </Button>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      width: "100%",
                      position: "absolute",
                      bottom: "0",
                      padding: "0.5rem 0",
                      background: "#f5f5f5",
                      alignItems: "center",
                      justifyContent: "right",
                    }}
                  >
                    <Button
                      onClick={closeModalHandler}
                      variant="contained"
                      size="medium"
                      className={styles.cancelButton}
                      id={`pmweb_GlobalReq_ExportImport_Close_${uuidv4()}`}
                    >
                      {t("cancel")}
                    </Button>
                    <Button
                      variant="contained"
                      size="medium"
                      color="primary"
                      className={styles.importButtons}
                      style={{
                        backgroundColor: "white",
                        border: "1px solid var(--button_color)",
                        color: "var(--button_color)",
                      }}
                      onClick={() => handleImportRequirements("merge")}
                      id="pmweb_GlobalReq_ExportImport_Import&Merge"
                    >
                      {t("importAndMergeSections")}
                    </Button>
                    <Button
                      variant="contained"
                      size="medium"
                      color="primary"
                      className={styles.importButtons}
                      onClick={() => handleImportRequirements("override")}
                      id="pmweb_GlobalReq_ExportImport_ImportOverride"
                    >
                      {t("importAndOverrideSections")}
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </FocusTrap>
    </>
  );
}

export default ExportImport;
