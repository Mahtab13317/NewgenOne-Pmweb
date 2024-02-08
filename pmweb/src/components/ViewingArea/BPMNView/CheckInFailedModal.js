import React from "react";
import CloseIcon from "@material-ui/icons/Close";
import { useTranslation } from "react-i18next";
import { SPACE } from "../../../Constants/appConstants";

function CheckInFailedModal(props) {
  let { t } = useTranslation();
  const { laneName, closeThisAndShowValidationPopUp, closeThisPopUp } = props;

  return (
    <div style={{ position: "relative", height: "100%" }}>
      <div
        style={{
          width: "100%",
          padding: "1rem 1vw",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <p
          style={{
            fontSize: "var(--subtitle_text_font_size)",
            fontWeight: "600",
          }}
        >
          {t("checkInSwimlane")} {`: ${laneName}`}
        </p>
        <CloseIcon
          onClick={closeThisPopUp}
          style={{
            height: "1.25rem",
            width: "1.25rem",
            cursor: "pointer",
          }}
        />
      </div>
      <hr />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "1.5rem 1vw",
        }}
      >
        <p
          style={{
            fontSize: "var(--base_text_font_size)",
            color: "red",
            marginBottom: "2px",
          }}
        >
          {t("checkInFailed")}
        </p>
        <p style={{ fontSize: "var(--base_text_font_size)", color: "#606060" }}>
          {t("errorsAndWarningsPresent")}
          {SPACE}
          <span
            style={{
              color: "var(--link_color)",
              fontSize: "var(--base_text_font_size)",
              cursor: "pointer",
              marginLeft: "2vw",
              fontWeight: "600",
            }}
            onClick={closeThisAndShowValidationPopUp}
          >
            {t("viewDetails")}
          </span>
        </p>
      </div>
      <div
        style={{
          width: "100%",
          backgroundColor: "#F5F5F5",
          position: "absolute",
          bottom: "0",
          display: "flex",
          alignItems: "center",
          flexDirection: "row-reverse",
        }}
      >
        <button
          style={{
            width: "54px",
            backgroundColor: "var(--button_color)",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
          onClick={closeThisPopUp}
        >
          {t("ok")}
        </button>
      </div>
    </div>
  );
}

export default CheckInFailedModal;
