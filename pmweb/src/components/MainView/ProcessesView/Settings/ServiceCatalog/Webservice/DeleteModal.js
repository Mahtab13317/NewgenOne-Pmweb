// #BugID - 110835
// #BugDescription - Delete category functionality issue resolved
import React from "react";
import Button from "@material-ui/core/Button";
import { useTranslation } from "react-i18next";
import styles from "../../../../Templates/template.module.css";
import arabicStyles from "../../../../Templates/templateArabicStyles.module.css";
import { RTL_DIRECTION } from "../../../../../../Constants/appConstants";

function DeleteWebserviceModal(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;

  return (
    <div>
      <p className={styles.deleteModalHeading}>
        {t("AreYouSureThatYouWantToDeleteThis")} {t("webservice")} ?
      </p>
      <p className={styles.deleteModalSubHeading}>
        {t("webService")} :{" "}
        <span className={styles.deleteModalName}>{props.elemToBeDeleted}</span>
      </p>
      <div
        className={
          direction === RTL_DIRECTION
            ? arabicStyles.noteDiv
            : styles.noteDiv
        }
      >
        {t("NOTE")} :{" "}
        {t("webService") + " " + t("onceDeletedCannotBeRecovered")}
      </div>
      <div className={styles.deleteModalButtonDiv}>
        <Button
          className={styles.cancelCategoryButton}
          onClick={props.setModalClosed}
          id="pmweb_webS_Cancel"
        >
          {t("cancel")}
        </Button>
        <Button className={styles.addCategoryButton} onClick={props.deleteFunc} id="pmweb_webS_Delete">
          {t("delete")}
        </Button>
      </div>
    </div>
  );
}

export default DeleteWebserviceModal;
