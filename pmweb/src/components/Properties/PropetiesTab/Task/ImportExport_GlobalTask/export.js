// #BugID - 120177
// #BugDescription - Handled the validation for empty template list.
// #BugID - 124506
// #BugDescription - Scrollbar issue fixed.
// #BugID - 124507
// #BugDescription - Hnadled the function for check and uncheck all template checkboxes
//Bug 124903 - Handeld the function on selecting any template name, all templates are getting selected

import { Checkbox, makeStyles } from "@material-ui/core";
import React, { useState, useEffect } from "react";
import "./index.css";
import axios from "axios";
import {
  SERVER_URL,
  ENDPOINT_GET_GLOBALTASKTEMPLATES,
  ENDPOINT_GET_EXPORTTEMPLATES,
  PMWEB_CONTEXT,
} from "../../../../../Constants/appConstants";
import { LightTooltip } from "../../../../../UI/StyledTooltip";
import DOMPurify from "dompurify";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles({
  templateList: {
    textOverflow: "ellipsis",
    overflow: "hidden",
    whiteSpace: "nowrap",
    width: "100%",
    display: "flex",
    wordBreak: "break-all",
    alignItems: "center",
  },
  // Changes on 06-09-2023 to resolve the bug Id 135587
  scrollableDiv: {
    height: "12rem",
    width: "100%",
    overflowY: "auto",
    overflowX: "hidden",
  },
});

function Export(props) {
  const styles = useStyles();
  let { t } = useTranslation();
  const [templateName, setTemplateName] = useState([]);
  const [btnDisable, setBtnDisable] = useState(true);
  const [isCheckAll, setIsCheckAll] = useState(false);
  const [isCheck, setIsCheck] = useState([]);
  const [list, setList] = useState([]);

  useEffect(() => {
    axios.get(SERVER_URL + ENDPOINT_GET_GLOBALTASKTEMPLATES).then((res) => {
      res.data?.GlobalTemplates?.map((template) => {
        setTemplateName((prev) => {
          return [...prev, template];
        });
      });
      setBtnDisable(false);
    });
  }, []);

  useEffect(() => {
    setList(templateName);
  }, [templateName]);

  const getSelectedGlobalTemplateList = () => {
    var value = "";
    isCheck?.forEach((item) => (value += item + ","));
    return value;
  };

  const exportTemplateHandler = () => {
    const selectedGlobalTemplate = getSelectedGlobalTemplateList();
    axios({
      url: `${PMWEB_CONTEXT}${ENDPOINT_GET_EXPORTTEMPLATES}/${selectedGlobalTemplate.slice(
        0,
        -1
      )}`, //your url
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

    // axios
    //   .get(
    //     SERVER_URL +
    //       `${ENDPOINT_GET_EXPORTTEMPLATES}/${selectedGlobalTemplate.slice(
    //         0,
    //         -1
    //       )}`
    //   )
    //   .then((res) => {
    //     console.log("RRRESPONSE", res);
    //   });
  };

  const handleCheckAll = (e) => {
    setIsCheckAll(!isCheckAll);
    setIsCheck(list.map((li) => li.m_iTemplateId));
    if (isCheckAll) {
      setIsCheck([]);
    }
  };
  const handleCheck = (e) => {
    const { id, checked } = e.target;

    //Modified on 03/10/2023, bug_id:138699
    if (!isCheck.includes(id) && checked) {
      setIsCheck([...isCheck, id]);
    }
    //till her for bug_id:138699

    /* if (!isCheck.includes(id) && checked) {
      setIsCheck([...isCheck, id]);
    } */
    // Changes made to solve Bug 121249
    if (!checked) {
      setIsCheckAll(false);
      setIsCheck(isCheck.filter((item) => item !== id));
    }

    if (checked && list.length === isCheck.length + 1) {
      setIsCheckAll(true);
    }
  };

  const shortenRuleStatement = (str, num) => {
    if (str?.length <= num) {
      return str;
    }
    return str?.slice(0, num) + "...";
  };

  return (
    <div
    // Bug 121156 [24-02-2023] Updated the screen and added the selectAll functionality
    //style={{ height: "300px" }}
    >
      <p
        style={{
          fontSize: "var(--base_text_font_size)",
          color: "#606060",
          padding: "0 1vw",
        }}
      >
        {/* modified on 12/09/2023 for BugId 136862 */}
        {t("SelectTemplatesToExport")}
      </p>
      <div style={{ padding: "0.5rem 1vw" }}>
        <p>
          <Checkbox
            onChange={handleCheckAll}
            checked={isCheckAll}
            id="exportAllCheckbox"
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                handleCheckAll({
                  ...e,
                  target: {
                    ...e.target,
                    checked: !isCheckAll,
                  },
                });
              }
            }}
          ></Checkbox>
          <label
            htmlFor="exportAllCheckbox"
            style={{
              fontSize: "var(--base_text_font_size)",
              color: "#111111",
              fontWeight: "600",
            }}
          >
            {/* modified on 12/09/2023 for BugId 136862 */}
            {t("templateName")}
          </label>
        </p>
        <div className={`${styles.scrollableDiv}`}>
          {templateName?.map((temp, i) => {
            return (
              <p className={styles.templateList} key={temp.m_iTemplateId}>
                <Checkbox
                  id={`pmweb_export_check_single_${temp.m_iTemplateId}`}
                  //Modified on 03/10/2023, bug_id:138699
                  onChange={(e) => {
                    handleCheck({
                      ...e,
                      target: {
                        ...e.target,
                        checked: !isCheck.includes(temp.m_iTemplateId),
                        id: temp.m_iTemplateId,
                      },
                    });
                  }}
                  //till here for bug id:138699
                  // onChange={handleCheck}
                  checked={isCheck.includes(temp.m_iTemplateId)}
                  onKeyUp={(e) => {
                    if (e.key === "Enter") {
                      handleCheck({
                        ...e,
                        target: {
                          ...e.target,
                          checked: !isCheck.includes(temp.m_iTemplateId),
                          id: temp.m_iTemplateId,
                        },
                      });
                    }
                  }}
                ></Checkbox>
                <LightTooltip
                  id="doc_Tooltip"
                  arrow={true}
                  enterDelay={500}
                  placement="bottom-start"
                  title={temp.m_strTemplateName}
                >
                  <label
                    htmlFor={temp.m_iTemplateId}
                    style={{
                      flex: "0.75",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {shortenRuleStatement(temp?.m_strTemplateName, 50)}
                  </label>
                </LightTooltip>
              </p>
            );
          })}
        </div>
      </div>
      <div className="buttons_add">
        <button
          onClick={props.closeModal}
          id="pmweb_globalImportExportcancelButton"
          className="globalImportExportcancelButton"
        >
          {/* modified on 12/09/2023 for BugId 136862 */}
          {t("cancel")}
        </button>
        <button
          className="globalImportExportokButton"
          onClick={exportTemplateHandler}
          id="pmweb_globalImportExportokButton"
          disabled={btnDisable || isCheck.length === 0}
        >
          {/* modified on 12/09/2023 for BugId 136862 */}
          {t("export")}
        </button>
      </div>
    </div>
  );
}

export default Export;
