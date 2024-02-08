import React from 'react'
import CloseIcon from "@material-ui/icons/Close";
import "./Properties.css";
import Button from "@material-ui/core/Button";
import { useTranslation } from "react-i18next";

function GlobalTaskAlert(props) {
    let { t } = useTranslation();
  return (
    <div>
         <div className="prop_modalHeaderForm">
          <CloseIcon
            fontSize="small"
            style={{ cursor: "pointer" }}
            onClick={() => props.setShowGlobalAlert(false)}
          />
        </div>
        <div className="prop_modalContent">{t("globalTemplateAlertStatement")}</div>
        <div className="prop_modalFooter">
        <Button
          id="close_AddVariableModal_CallActivity"
          className="properties_cancelButton"
          onClick={() => props.setShowGlobalAlert(false)}
        >
          {t("cancel")}
        </Button>
          <Button
            id="add_AddVariableModal_CallActivity"
            className="properties_saveButton"
           onClick={()=>{  props.setIsSavingAsGlobalTemp(true); props.setShowGlobalAlert(false);}}
          >
            {t("saveContinue")}
          </Button>
        </div>
    </div>
  )
}

export default GlobalTaskAlert