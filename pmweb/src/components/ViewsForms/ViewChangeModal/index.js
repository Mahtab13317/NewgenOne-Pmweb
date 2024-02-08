import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { CloseIcon } from "../../../utility/AllImages/AllImages";

function ViewChangeModal(props) {
  let { t } = useTranslation();
  const viewMap = {
    single: "multiple",
    multiple: "single",
  };

  const formViewChangeHandler = () => {
    let temp = global.structuredClone(props.formAssociationData);
    temp.forEach((assocData) => {
      assocData.formId = "-1";
    });
    props.setformAssociationData(temp);
    props.setformAssociationType((prev) => viewMap[prev]);

    cancelHandler();
  };

  const cancelHandler = () => {
    props.setviewChangeConfirmationBoolean(false);
  };

  const handleKeyDown = (e) => {
    if (
      e.keyCode === 13 &&
      (e.target.name === "yes_primary_btn" || e.target.localName === "body")
    ) {
      e.stopPropagation();
    } else if (e.keyCode === 27) {
      cancelHandler();

      e.stopPropagation();
    }
  };

  useEffect(() => {
    //listening for 'Enter key' so that on press of enter we can login

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
  return (
    <div
      style={{
        width: "100%",
        height: "180px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "28%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingInline: "1rem",
          fontSize: "var(--title_text_font_size)",
          borderBottom: "1px solid rgb(0,0,0,0.4)",
          fontWeight: "600",
        }}
      >
        {t("formSelection")}
        <CloseIcon
          onClick={() => cancelHandler()}
          id="pmweb_viewChangeModal_Close"
          tabindex={0}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              cancelHandler();
            }
          }}
        />
      </div>
      <div
        style={{
          width: "100%",
          height: "47%",
          display: "flex",
          flexDirection: "row",

          padding: "1rem",
          fontSize: "var(--base_text_font_size)",
        }}
      >
        {t("unsavedChangesLost")}
      </div>
      <div
        style={{
          width: "100%",
          height: "25%",
          display: "flex",
          flexDirection: "row-reverse",
          alignItems: "center",

          fontSize: "var(--base_text_font_size)",
        }}
      >
        <button
          style={{
            background: "var(--button_color)",
            color: "white",
            border: "none",
          }}
          onClick={() => formViewChangeHandler()}
          id="pmweb_viewChangeModal_Yes"
          name="yes_primary_btn"
        >
          {t("yes,continue")}
        </button>
        <button
          style={{
            background: "white",
            color: "#606060",
            border: "1px solid #C4C4C4",
          }}
          onClick={() => cancelHandler()}
          id="pmweb_viewChangeModal_CloseBtn"
        >
          {t("cancel")}
        </button>
      </div>
    </div>
  );
}

export default ViewChangeModal;
