import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./FormAssociationType.css";
import MultipleFormIcon from "../../../assets/WIForms/MultipleFormIcon.svg";
import SingleFormIcon from "../../../assets/WIForms/SingleFormIcon.svg";

function FormAssociationType(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}​​​​​​​​`;
  const { formAssociationType } = props;
  const [selectedFormAssoc, setselectedFormAssoc] =
    useState(formAssociationType);
  useEffect(() => {
    props.getFormAssociationType(selectedFormAssoc);
  }, [selectedFormAssoc]);

  return (
    <div
      id="pmweb_formScreen"
      className="mainDiv"
      style={{ direction: direction }}
    >
      <div
        className="box"
        style={{
          border:
            selectedFormAssoc === "single"
              ? "2px solid var(--link_color)"
              : "1px solid #DBDBDB",
          direction: direction,
        }}
        onClick={() => setselectedFormAssoc("single")}
        id="pmweb_viewForm_formAsso_SingleForm"
        tabIndex={0}
        onKeyUp={(e) => {
          if (e.key === "Enter") {
            setselectedFormAssoc("single");
          }
        }}
      >
        <img
          src={SingleFormIcon}
          className="iconStyles"
          alt={t("SingleFormForCompleteProcess")}
        />
        <p className="formLabel">{t("SingleFormForCompleteProcess")}</p>
        <p className="desc">{t("singleFormDesc")}</p>
      </div>
      <div
        className="box"
        style={{
          border:
            selectedFormAssoc === "multiple"
              ? "2px solid var(--link_color)"
              : "1px solid #DBDBDB",
        }}
        onClick={() => setselectedFormAssoc("multiple")}
        id="pmweb_viewForm_formAsso_MultipleForm"
        tabIndex={0}
        onKeyUp={(e) => {
          if (e.key === "Enter") {
            setselectedFormAssoc("multiple");
          }
        }}
      >
        <img
          src={MultipleFormIcon}
          className="iconStyles"
          alt={t("Workstepwiseformassociation")}
        />
        <p className="formLabel">{t("Workstepwiseformassociation")}</p>
        <p className="desc">{t("multipleFormDesc")}</p>
      </div>
    </div>
  );
}

export default FormAssociationType;
