// #BugID - 121151
// #BugDescription - Added cancel button working issue.
// #BugID - 121153
// #BugDescription - After import success/failure message added.
// #BugID - 126340
// #BugDescription - Changes made for linux>>imported global task templated is not listed.

import React, { useState, useEffect } from "react";
import "./index.css";
import axios from "axios";
import {
  SERVER_URL,
  ENDPOINT_GET_GLOBALTASKTEMPLATES,
  PMWEB_CONTEXT,
  ENDPOINT_IMPORT_TASK_TEMPLATE,
} from "../../../../../Constants/appConstants";
import { useDispatch } from "react-redux";
import { setToastDataFunc } from "../../../../../redux-store/slices/ToastDataHandlerSlice";
import { useTranslation } from "react-i18next";
import { setGlobalTaskTemplates } from "../../../../../redux-store/actions/Properties/globalTaskTemplateAction";

function Import(props) {
  let { t } = useTranslation();
  const dispatch = useDispatch();
  const [selectedFile, setselectedFile] = useState();
  const [templateName, setTemplateName] = useState([]);

  useEffect(() => {
    axios.get(SERVER_URL + ENDPOINT_GET_GLOBALTASKTEMPLATES).then((res) => {
      res.data?.GlobalTemplates?.map((template) => {
        setTemplateName((prev) => {
          return [...prev, template];
        });
      });
    });
  }, []);

  const uploadFile = (e) => {
    setselectedFile(e.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    let payload = {
      importedName: selectedFile?.name?.split(".").slice(0, -1).join("."),
      overwrite: false,
    };
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append(
      "taskTemplateInfo",
      new Blob([JSON.stringify(payload)], {
        type: "application/json",
      })
    );

    const response = await axios({
      method: "POST",
      url: `${PMWEB_CONTEXT}${ENDPOINT_IMPORT_TASK_TEMPLATE}`,
      data: formData,
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (+response.status === 200) {
      if (+response?.data?.Status === 0) {
        dispatch(setGlobalTaskTemplates(response.data.GlobalTemplates));
        dispatch(
          setToastDataFunc({
            message: t("fileImportSuccess"),
            severity: "success",
            open: true,
          })
        );
      } else {
        dispatch(
          setToastDataFunc({
            message: response?.data?.Message,
            severity: "error",
            open: true,
          })
        );
      }
      props.closeModal();
    } else {
      dispatch(
        setToastDataFunc({
          message: response?.data?.Message,
          severity: "error",
          open: true,
        })
      );
      props.closeModal();
    }
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "0 1vw",
        }}
      >
        <p
          style={{
            color: "#606060",
            fontSize: "var(--base_text_font_size)",
            fontFamily: "var(--font_family)",
          }}
        >
          {/* modified on 12/09/2023 for BugId 136862 */}
          {t("fileName")}
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              // width:"75%" code modified on 09-10-23 for bugId:139110
              width: "71%",
              height: "var(--line_height)",
              border: "1px solid #CECECE",
              borderRadius: "2px",
              padding: "0 0.5vw",
            }}
          >
            <p
              id="add_sectionName"
              style={{
                textAlign: "start",
                fontSize: "var(--base_text_font_size)",
                fontWeight: "400",
                height: "100%",
                display: "flex",
                alignItems: "center",
              }}
            >
              {selectedFile !== undefined ? selectedFile.name : ""}
            </p>
          </div>
          <label
            style={{
              fontSize: "var(--base_text_font_size)",
              border: "1px solid var(--button_color)",
              height: "var(--line_height)",
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              color: "var(--button_color)",
              fontWeight: "600",
              cursor: "pointer",
              padding: "0 var(--spacing_h)",
              borderRadius: "2px",
            }}
            tabIndex={0}
          >
            <input
              type="file"
              style={{ display: "none" }}
              onChange={(e) => uploadFile(e)}
            />
            {/* modified on 12/09/2023 for BugId 136862 */}
            {t("chooseFile")}
          </label>
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
          onClick={(e) => handleSubmit(e, false, false, false)}
          id="pmweb_globalImportExportokButton"
        >
          {/* modified on 12/09/2023 for BugId 136862 */}
          {templateName.count > 0 ? t("MergeData") : t("import")}
        </button>
      </div>
    </div>
  );
}

export default Import;
