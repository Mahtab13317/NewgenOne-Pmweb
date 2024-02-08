import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { CloseIcon } from "../../utility/AllImages/AllImages";
import "./AppHeader.css";
import { IconButton } from "@material-ui/core";

function DialogBox(props) {
  let { t } = useTranslation();

  useEffect(() => {
    const close = (e) => {
      if (e.keyCode === 27) {
        {
          props.setIsLogout(false);
        }
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  return (
    <>
      <div className="modalHeader">
        {/* Changes on 15-09-2023 to resolve the bug Id 136607 */}
        <h3 className="modalHeading">{t("logout")}</h3>
        <IconButton
          onClick={props.closeAlert}
          id="pmweb_LogoutModal_CloseAlertIcon"
          aria-label="Close"
        >
          <CloseIcon
            style={{
              width: "8px",
              height: "8px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          />
        </IconButton>
      </div>
      <div>
        <p className="alreadyLoggedMsg_lpweb" role="alert">
          {t("logoutAlertMsg")}
          <br /> {t("confirmMsg")}
        </p>
      </div>
      <div className="modalFooter" style={{ paddingLeft: "0.6vw" }}>
        <button
          onClick={props.closeAlert}
          id="pmweb_LogoutModal_CloseAlert"
          style={{
            backgroundColor: "white",
            color: "grey",
            border: "1px solid #CFB997",
            cursor: "pointer",
          }}
        >
          {t("cancel")}
        </button>
        <button
          className="okButton"
          onClick={props.logoutHandler}
          id="pmweb_LogoutModal_Logout"
        >
          {t("logout")}
        </button>
      </div>
    </>
  );
}

export default DialogBox;
