import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import ModalForm from "./../../../../UI/ModalForm/modalForm";
import Field from "./../../../../UI/InputFields/TextField/Field";
import { useTranslation } from "react-i18next";
import { Grid } from "@material-ui/core";

const PreviewHtmlModal = (props) => {
  let { t } = useTranslation();

  const { taskVariablesList, isReadOnly } = props;
  const [open, setOpen] = useState(props.isOpen ? true : false);

  const handleClose = () => {
    setOpen(false);

    props.handleClose();
  };
  return (
    <ModalForm
      isOpen={open}
      title={`${t("html")} ${t("Form")} ${t("preview")}`}
      Content={
        <Content
          taskVariablesList={taskVariablesList}
          isReadOnly={isReadOnly}
        />
      }
      headerCloseBtn={true}
      onClickHeaderCloseBtn={handleClose}
      closeModal={handleClose}
      btn1Title={t("Close")}
      id="pmweb_previewhtmlmodal_close_button"
      onClick1={handleClose}
      containerWidth={638}
    />
  );
};
export default PreviewHtmlModal;

{
  /*Fields, content of the modal */
}
const Content = ({ taskVariablesList, isReadOnly }) => {
  return (
    <Grid
      container
      direction="column"
      spacing={1}
      style={{ pointerEvents: "none", opacity: "0.8" }}
    >
      {taskVariablesList.map((taskVar) => (
        <Grid item>
          <Field
            type={
              taskVar.m_strVariableType === 8
                ? "date"
                : taskVar.m_iControlType == "2"
                ? "textArea"
                : "text"
            }
            dropdown={taskVar.m_iControlType == "3"}
            multiline={taskVar.m_iControlType == "2"}
            name={taskVar.m_strVariableName}
            label={taskVar.m_strDisplayName}
            disabled={isReadOnly}
          />
        </Grid>
      ))}
    </Grid>
  );
};
