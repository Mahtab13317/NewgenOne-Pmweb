// Changes made to solve Bug 118216 - Register Template: while modifying the templates the selected values in the field are getting removed
import React, { useEffect, useState } from "react";
import styles from "./index.module.css";
import clsx from "clsx";
import axios from "axios";
import {
  SERVER_URL,
  ENDPOINT_GET_REGISTER_TEMPLATE,
  // CONFIG,
  RTL_DIRECTION,
  ENDPOINT_DOWNLOAD,
} from "../../../Constants/appConstants";
import Modal from "../../../UI/Modal/Modal";
import { useTranslation } from "react-i18next";
import TemplateModal from "./TemplateModal/index";
import EditLogo from "../../../assets/bpmnViewIcons/EditIcon.svg";
import cancelIcon from "../../../assets/abstractView/RedDelete.svg";
import DownloadIcon from "../../../assets/abstractView/Icons/Download.svg";
import { LightTooltip } from "../../../UI/StyledTooltip";
import arabicStyles from "./ArabicStyles.module.css";
import { isProcessDeployedFunc } from "../../../utility/CommonFunctionCall/CommonFunctionCall";
import { store, useGlobalState } from "state-pool";
import DOMPurify from "dompurify";

function Templates(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const [templateData, setTemplateData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // const [selectedTool, setSelectedTool] = useState("");
  // const [configData, setConfigData] = useState([]);
  // const [toolsList, setToolsList] = useState([]);
  const [selected, setselected] = useState(null);
  const [calledPlace, setCalledPlace] = useState(null);
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  let { isReadOnly } = props;
  isReadOnly = isReadOnly || isProcessDeployedFunc(localLoadedProcessData);
  // code added on 06-10-2023 for bugID:134141
  const [widthValue, setWidthValue] = useState(
    window?.innerWidth > 1200 ? "fit-content" : "auto"
  );

  useEffect(() => {
    const handleResize = () => {
      setWidthValue(window?.innerWidth > 1200 ? "fit-content" : "auto");
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  //till here for bugID:134141

  useEffect(() => {
    axios.get(SERVER_URL + ENDPOINT_GET_REGISTER_TEMPLATE).then((res) => {
      setTemplateData(res.data);
      if (res.data.Status === 0) {
        setTemplateData(res.data);
      }
    });
  }, []);

  // useEffect(() => {
  //   if (configData) {
  //     let listOfTools = [];
  //     configData &&
  //       configData.forEach((element) => {
  //         listOfTools.push(element.Tool);
  //       });
  //     setToolsList(listOfTools);
  //   }
  // }, [configData]);

  const downloadHandler = (id, docName, templateInputFormat, index) => {
    let postBody = {
      templateId: id,
      docName: docName,
      templateInputFormat: templateInputFormat,
    };

    try {
      const response = axios({
        method: "POST",
        url:
          SERVER_URL + ENDPOINT_GET_REGISTER_TEMPLATE + `${ENDPOINT_DOWNLOAD}`,
        data: postBody,
        responseType: "blob",
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
        const sanitizedHref = DOMPurify.sanitize(link.href);
        link.href = sanitizedHref;
        link.click();
      });
    } catch (error) {
      console.log(error);
    }
  };

  const deleteHandler = (id, index) => {
    let postBody = {
      templateId: id,
    };
    axios
      .delete(SERVER_URL + ENDPOINT_GET_REGISTER_TEMPLATE, {
        data: postBody,
        headers: { "Content-Type": "application/json" },
      })

      .then((res) => {
        let temp = [...templateData];

        temp.splice(index, 1);

        setTemplateData(temp);
      });
  };

  const editHandler = (el) => {
    setselected(el);
    setIsModalOpen(true);
    setCalledPlace("editPencil");
  };

  const shortenRuleStatement = (str, num) => {
    if (str?.length <= num) {
      return str;
    }
    return str?.slice(0, num) + "...";
  };
  return (
    /*Bug 112336 : [10-02-2023] Editted the screen as per the design wireframe */
    <div>
      <div className={styles.mainDiv}>
        <div className={styles.flexRow}>
          <div className={styles.flexColumn}>
            <p
              className={
                direction === RTL_DIRECTION
                  ? arabicStyles.mainHeading
                  : styles.mainHeading
              }
            >
              {t("templates")}
            </p>
            {/* Added on: 22-05-2023 for Bug-ID: 127665 */}
            {/* <p className={styles.description}>{t("listOfTrigger")}</p> */}
            <p className={styles.description}>{t("listOfTemplate")}</p>
          </div>
          {!isReadOnly && (
            <button
              tabIndex={0}
              id="pmweb_Templates_CloseModalIcon"
              onClick={() => {
                setIsModalOpen(true);
                setCalledPlace("createNew");
              }}
              className={styles.registerTemplateButton}
            >
              <span>{t("registerTemplate")}</span>
            </button>
          )}
        </div>
        {isModalOpen ? (
          <Modal
            show={isModalOpen}
            style={{
              top: "6%",
              padding: "0",
            }}
          >
            <TemplateModal
              setTemplateData={setTemplateData}
              setIsModalOpen={setIsModalOpen}
              selected={selected}
              calledPlace={calledPlace}
              templateData={templateData}
            />
          </Modal>
        ) : null}
        <div
          className={styles.tableHeadingBar}
          style={{
            overflowX: "auto",
            minHeight: "14rem",
            maxHeight: "50vh",
            width: widthValue,
          }}
        >
          <div
            className={styles.gridContainer}
            style={{ position: "sticky", top: "0", backgroundColor: "white" }}
          >
            <p className={clsx(styles.tableHeaders)}>{t("templateName")}</p>
            <p className={clsx(styles.tableHeaders)}>{t("Tool")}</p>
            <p className={clsx(styles.tableHeaders)}>{t("inputFormat")}</p>
            <p className={clsx(styles.tableHeaders)}>{t("outputFormat")}</p>
            <p className={clsx(styles.tableHeaders)}>{t("dateFormat")}</p>
            <p className={clsx(styles.tableHeaders)}>{t("multilinguals")}</p>
            {/* Added intentionally for a column in the grid */}
            <p className={styles.tableHeaders}></p>
          </div>
          {templateData?.map((element, index) => {
            return (
              <div className={styles.dataDiv}>
                <div className={styles.gridContainer}>
                  <p className={clsx(styles.tableData, styles.tooltip)}>
                    {/* {element.docName === null ? "-" : element.docName} */}
                    <LightTooltip
                      id={`pmweb_Templates_DocToolip${index}`}
                      arrow={true}
                      enterDelay={500}
                      placement="bottom-start"
                      title={element.docName}
                    >
                      <span
                        style={{
                          flex: "0.75",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {shortenRuleStatement(element?.docName, 20)}
                      </span>
                    </LightTooltip>
                  </p>
                  <p className={clsx(styles.tableData)}>
                    {element.templateTool}
                  </p>
                  <p className={clsx(styles.tableData)}>
                    {element.templateType}
                  </p>
                  <p className={clsx(styles.tableData)}>
                    {element.templateFormat}
                  </p>
                  <p className={clsx(styles.tableData)}>
                    {element.templateDateFormat}
                  </p>
                  <p className={clsx(styles.tableData)}>
                    {element.locale === null || element.locale.length === 0 ? (
                      "-"
                    ) : (
                      <LightTooltip
                        id={`pmweb_Templates_DocToolip${index}`}
                        arrow={true}
                        enterDelay={500}
                        placement="bottom-start"
                        title={element.locale}
                      >
                        <span
                          style={{
                            flex: "0.75",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {shortenRuleStatement(element?.locale, 20)}
                        </span>
                      </LightTooltip>
                    )}
                  </p>
                  <div className={styles.flexRow}>
                    {!isReadOnly && (
                      <>
                        <img
                          tabIndex={0}
                          id="pmweb_Templates_EditIcon"
                          src={EditLogo}
                          onClick={() => editHandler(element)}
                          className={styles.icon}
                          alt={t("edit")}
                        />
                        <img
                          tabIndex={0}
                          id="pmweb_Templates_CancelIcon"
                          src={cancelIcon}
                          onClick={() =>
                            deleteHandler(element.templateId, index)
                          }
                          className={styles.icon}
                          alt={t("cancel")}
                        />
                      </>
                    )}

                    <img
                      tabIndex={0}
                      id="pmweb_Templates_DownloadIcon"
                      src={DownloadIcon}
                      onClick={() =>
                        downloadHandler(
                          element.templateId,
                          element.docName,
                          element.templateInputFormat,
                          index
                        )
                      }
                      className={styles.icon}
                      alt={t("download")}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Templates;
