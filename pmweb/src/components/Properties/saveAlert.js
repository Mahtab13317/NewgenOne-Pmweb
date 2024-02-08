import React, { useEffect } from "react";
import CloseIcon from "@material-ui/icons/Close";
import "./Properties.css";
import Button from "@material-ui/core/Button";
import { useTranslation } from "react-i18next";
import { IconButton } from "@material-ui/core";
import { FocusTrap } from "@mui/base";

function SaveAlert(props) {
  let { t } = useTranslation();

  useEffect(() => {
    const close = (e) => {
      if (e.keyCode === 27) {
        props.setShowConfirmationAlert(false);
        e.stopPropagation();
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  return (
    <React.Fragment>
      <FocusTrap open>
        <div>
          <div className="prop_modalHeader">
            <p className="prop_modalHeading">{t("unsavedChangesHeading")}</p>
            <IconButton
              onClick={() => props.setShowConfirmationAlert(false)}
              className="saveAlert_Close"
              id="pmweb_saveAlert_Close"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  props.setShowConfirmationAlert(false);
                  e.stopPropagation();
                }
              }}
              aria-label="closeIcon"
              disableTouchRipple
              disableFocusRipple
            >
              <CloseIcon
                fontSize="small"
                style={{
                  opacity: "0.5",
                  cursor: "pointer",
                  width: "1.25rem",
                  height: "1.25rem",
                }}
              />
            </IconButton>
          </div>
          <hr></hr>
          <div className="prop_modalContent">
            {t("unsavedChangesStatement")}
          </div>
          <div className="prop_modalFooter">
            <Button
              id="pmweb_saveAlert_discardChanges"
              className="properties_cancelButton"
              onClick={props.discardChangesFunc}
            >
              {t("discard")}
            </Button>
            <Button
              id="pmweb_saveAlert_saveChanges"
              className="properties_saveButton"
              onClick={props.saveChangesFunc}
            >
              {t("saveChanges")}
            </Button>
          </div>
        </div>
      </FocusTrap>
    </React.Fragment>
  );
}

export default SaveAlert;
