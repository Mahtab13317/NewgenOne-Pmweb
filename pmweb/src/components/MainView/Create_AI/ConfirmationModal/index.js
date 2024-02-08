import { Button, Grid, Typography, makeStyles } from "@material-ui/core";
import React from "react";
import { useTranslation } from "react-i18next";
import classes from "../index.module.css";

const useStyles = makeStyles(() => ({
  footer: {
    background: "#f8f8f8",
    justifyContent: "flex-end",
    borderTop: "1px solid #d3d3d3",
    padding: "1rem 1vw",
    gap: "1vw",
  },
  body: { padding: "1.25rem 1vw", flexDirection: "column" },
  header: {
    padding: "1rem 1vw",
    borderBottom: "1px solid #d3d3d3",
    gap: "8px",
  },
  titleHeading: {
    font: "normal normal 600 var(--subtitle_text_font_size)/19px var(--font_family) !important",
  },

  noteMsg: {
    marginTop: "8px",
    font: "normal normal 600 var(--base_text_font_size)/17px var(--font_family) !important",
    marginBottom: "0.25rem",
    color: "#606060",
  },
}));

const ConfirmationModal = (props) => {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const styles = useStyles({ direction });

  return (
    <Grid container>
      {/* header */}
      <Grid item container className={styles.header}>
        {props.headingIcon && <Grid item>{props.headingIcon}</Grid>}
        <Grid item>
          <Typography
            className={styles.titleHeading}
            data-testid="confirmation-modal-title-heading"
          >
            {props.modalHeading}
          </Typography>
        </Grid>
      </Grid>
      {/* //Body */}
      <Grid item className={styles.body}>
        <Grid container direction="column" spacing={1}>
          <Grid item>
            <Typography
              className={styles.bodyHeading}
              data-testid="confirmation-modal-body-heading"
            >
              {props.confirmationMessage}
            </Typography>
          </Grid>
          <Grid item container direction="row" spacing={1}>
            {props.noteMsg && (
              <Grid item>
                <Typography
                  className={styles.noteMsg}
                  data-testid="confirmation-modal-body-heading"
                >
                  {props.noteIcon && props.noteIcon}{" "}
                  {`${t("Note")} : ${props.noteMsg}`}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Grid>
      {/* //footer */}
      <Grid item container className={styles.footer}>
        <Grid item>
          <Button
            variant="outlined"
            aria-label="cancel button"
            onClick={props.modalCloseHandler}
            id="pmweb_deleteVarAI_cancelBtn"
            className={classes.cancelBtn}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                props.modalCloseHandler();
              }
            }}
          >
            {props.cancelButtonText}
          </Button>
        </Grid>
        {props.secondaryActionButton && (
          <Grid item>
            <Button
              variant="outlined"
              aria-label={`${props.secondaryActionButtonText} button`}
              onClick={props.secondaryActionButtonOnClick}
              id="pmweb_deleteVarAI_secondaryBtn"
              className={classes.secondaryBtn}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  props.secondaryActionButtonOnClick();
                }
              }}
            >
              {props.secondaryActionButtonText}
            </Button>
          </Grid>
        )}
        <Grid item>
          <Button
            aria-label="confirm button"
            onClick={props.confirmFunc}
            className={
              props.isWarning ? classes.okBtn : classes.deleteVariableBtn
            }
            id="pmweb_deleteVarAI_deleteBtn"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                props.confirmFunc();
              }
            }}
          >
            {props.confirmButtonText}
          </Button>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default ConfirmationModal;
