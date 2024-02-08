import React from 'react'
import CloseIcon from "@material-ui/icons/Close";
import "./Properties.css";
import Button from "@material-ui/core/Button";
import { useTranslation } from "react-i18next";

function SaveFormModal(props) {
    let { t } = useTranslation();
    return (
      <div>
        <div className="prop_modalHeaderForm">
          <CloseIcon
            fontSize="small"
            style={{ cursor: "pointer" }}
            onClick={() => props.setShowFormEnableAlert(false)}
          />
        </div>
        <div className="prop_modalContent">{t("unsavedChangesFormStatement")}</div>
        <div className="prop_modalFooter">
        <Button
          id="close_AddVariableModal_CallActivity"
          className="properties_cancelButton"
          onClick={() => props.setShowFormEnableAlert(false)}
        >
          {t("cancel")}
        </Button>
          <Button
            id="add_AddVariableModal_CallActivity"
            className="properties_saveButton"
            onClick={()=>{props.saveChangesFunc("form")}}
          >
            {t("saveContinue")}
          </Button>
        </div>
      </div>
    );
}

export default SaveFormModal