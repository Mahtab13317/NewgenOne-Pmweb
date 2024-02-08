// #BugID - 121151
// #BugDescription - Added cancel button working issue

import React, { useState } from "react";
import {
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  IconButton,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import Import from "./import.js";
import Export from "./export.js";
import "./index.css";
import { useTranslation } from "react-i18next";

function ImportExport(props) {
  let { t } = useTranslation();
  const [toDoType, setToDoType] = useState("I");
  const handleChange = (event) => {
    setToDoType(event.target.value);
  };

  const closeModal = () => {
    props.setShowModal(false);
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0.75rem 1vw",
        }}
      >
        <p
          style={{
            fontSize: "var(--subtitle_text_font_size)",
            color: "#000000",
            fontWeight: "700",
          }}
        >
          {/* modified on 12/09/2023 for BugId 136862 */}
          {t("Import/Export")} {t("globalTaskTemplate")}
        </p>
        <IconButton
          onClick={() => props.setShowModal(false)}
          className="importExportCloseButton"
          tabindex={0}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              props.setShowModal(false);
            }
          }}
          aria-label="Close"
        >
          <CloseIcon style={{ fontSize: "1.25rem", cursor: "pointer" }} />
        </IconButton>
      </div>
      <hr />
      <div style={{ padding: "1rem 1vw" }}>
        <FormControl component="fieldset">
          <RadioGroup
            defaultValue="I"
            onChange={handleChange}
            row={true}
            name="row-radio-buttons-group"
          >
            <FormControlLabel
              value="I"
              control={
                <Radio size="small" checked={toDoType === "I" ? true : false} />
              }
              label={<p style={{ fontSize: "12px" }}>{t("import")}</p>} //modified on 12/09/2023 for BugId 136862
            />
            <div>
              <FormControlLabel
                value="E"
                control={
                  <Radio
                    size="small"
                    checked={toDoType === "E" ? true : false}
                  />
                }
                label={<p style={{ fontSize: "12px" }}>{t("export")}</p>} //modified on 12/09/2023 for BugId 136862
              />
            </div>
          </RadioGroup>
        </FormControl>
      </div>
      <div>
        {toDoType === "I" ? <Import closeModal={closeModal} /> : null}
        {toDoType === "E" ? <Export closeModal={closeModal} /> : null}
      </div>
    </div>
  );
}

export default ImportExport;
