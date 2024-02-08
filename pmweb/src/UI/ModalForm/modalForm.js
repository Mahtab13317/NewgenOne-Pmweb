import React from "react";
import {
  Button,
  Grid,
  Typography,
  makeStyles,
  Modal,
  Fade,
  Backdrop,
  Divider,
  withStyles,
  IconButton,
} from "@material-ui/core";
import customStyle from "../../assets/css/customStyle";
import CircularProgress from "@material-ui/core/CircularProgress";
import { red } from "@material-ui/core/colors";
import { CloseIcon } from "../../utility/AllImages/AllImages";
import { useTranslation } from "react-i18next";
//import FocusTrap from "focus-trap-react";
import { FocusTrap } from "@mui/base";

const useStyles = makeStyles((theme) => ({
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    outline: 0,
  },
  container: {
    display: "flex",
    width: 540,
    backgroundColor: "white",
    flexDirection: "column",
    outline: 0,
  },
  title: {
    color: "#000000",
    opacity: 1,
    fontSize: "var(--title_text_font_size)",
    fontWeight: 600,
  },
  modalHeader: {
    paddingBottom: "1rem",
    paddingTop: "1rem",
    outline: 0,
  },
  modalFooter: {
    paddingTop: 8,
    paddingBottom: 8,
    outline: 0,
    backgroundColor: "#f7f9fc",
  },
  headerBtn: {
    color: `${theme.palette.primary.main}`,
  },
  addBtn: {
    backgroundColor: `${theme.palette.primary.main}`,
    color: "#FFFFFF",
  },
  deleteBtn: {
    backgroundColor: "#D53D3D",
    color: "#FFFFFF",
  },
  content: {
    overflowY: "auto",
    display: "flex",
    height: (props) => (props.contentNotScrollable ? null : "23rem"),
    flexDirection: "column",
    direction: (props) => props.direction,
    "&::-webkit-scrollbar": {
      backgroundColor: "transparent",
      width: "0.375rem",
      height: "1.125rem",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "transparent",
      borderRadius: "0.313rem",
    },

    "&:hover::-webkit-scrollbar": {
      overflowY: "visible",
      width: "0.375rem",
      height: "1.125rem",
    },
    "&:hover::-webkit-scrollbar-thumb": {
      background: "#8c8c8c 0% 0% no-repeat padding-box",
      borderRadius: "0.313rem",
    },
    scrollbarColor: "#8c8c8c #fafafa",
    scrollbarWidth: "thin",
  },
  padding: {
    paddingLeft: "1.5vw",
    paddingRight: "1.5vw",
  },
  paddingContent: {
    paddingLeft: (props) =>
      props.paddingLeftContent ? props.paddingLeftContent : "1.5vw",
    paddingRight: (props) =>
      props.paddingRightContent ? props.paddingRightContent : "1.5vw",
    paddingTop: (props) =>
      props.paddingTopContent ? props.paddingTopContent : "1rem",
    paddingBottom: (props) =>
      props.paddingBottomContent ? props.paddingBottomContent : "1rem",
  },
  text_12: {
    fontSize: "12px",
  },
  header: {},
  selectedTab: {
    fontWeight: 600,
    borderBottom: `2px solid ${theme.palette.primary.main}`,
    color: `${theme.palette.primary.main}`,
  },
}));

const DeleteButton = withStyles((theme) => ({
  root: {
    color: theme.palette.getContrastText(red[600]),
    backgroundColor: red[600],
    "&:hover": {
      backgroundColor: red[700],
    },
  },
}))(Button);

const ModalForm = (props) => {
  const {
    overflowHidden,
    paddingLeftContent,
    paddingRightContent,
    contentNotScrollable = false,
  } = props;

  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;

  const classes = useStyles({
    overflowHidden,
    paddingLeftContent,
    paddingRightContent,
    contentNotScrollable,
  });
  const closeModal = () => {
    props.closeModal();
  };
  /**code changes added for 134073  on 28/08/2023*/

  return (
    <FocusTrap open>
      <Modal
        className={classes.modal}
        open={props.isOpen}
        onClose={closeModal}
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 50,
        }}
        onKeyDown={(e) => {
          if (e.keyCode == 27) {
            props.closeModal();
          }
        }}
        disableScrollLock={true}
        id={props.id || "common_Modal"}
        style={{ direction: direction }}
        tabIndex={-1}
      >
        <Fade in={props.isOpen}>
          {/* modal container */}
          <div
            style={{
              height: props.containerHeight ? props.containerHeight : "auto",
              width: props.containerWidth ? props.containerWidth : 550,
            }}
            className={classes.container}
          >
            {/* modal header  */}
            {props.title && (
              <>
                <div className={classes.modalHeader} data-testid="modalForm">
                  <Grid
                    container
                    justify="space-between"
                    className={classes.padding}
                  >
                    <Grid item container spacing={2} alignItems="center">
                      <Grid item>
                        <Typography className={classes.title}>
                          {props.title}
                        </Typography>
                      </Grid>

                      {props.name && (
                        <Grid item style={{ marginTop: "5px" }}>
                          <Grid container alignItems="center">
                            <Grid item style={{ marginRight: "4px" }}>
                              {props.icon ? props.icon : null}
                            </Grid>
                            <Grid item>{props.name}</Grid>
                          </Grid>
                        </Grid>
                      )}
                      {(props.headerBtn1Title ||
                        props.headerBtn2Title ||
                        props.headerCloseBtn) && (
                        <Grid item style={{ marginInlineStart: "auto" }}>
                          <Grid container spacing={2}>
                            {props.headerBtn1Title && (
                              <Grid item>
                                <Button
                                  id="pmweb_ModalForm_Click1HeaderBtn"
                                  color="primary"
                                  variant="contained"
                                  onClick={props.onClick1Header}
                                >
                                  {props.headerBtn1Title}
                                </Button>
                              </Grid>
                            )}
                            {props.headerBtn2Title && (
                              <Grid item>
                                <Button
                                  id="pmweb_ModalForm_Click2HeaderBtn"
                                  variant="contained"
                                  color="primary"
                                  disabled={props.isDisabled}
                                  onClick={props.onClick2Header}
                                >
                                  {props.headerBtn2Title}
                                </Button>
                              </Grid>
                            )}
                            {props.headerCloseBtn && (
                              <Grid item>
                                <div
                                  style={{
                                    height: "24px",
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                >
                                  <IconButton
                                    id="pmweb_ModalForm_CloseHeaderBtn"
                                    onClick={() => {
                                      if (props.onClickHeaderCloseBtn) {
                                        props.onClickHeaderCloseBtn();
                                      }
                                    }}
                                    onKeyUp={(e) => {
                                      if (e.key === "Enter") {
                                        if (props.onClickHeaderCloseBtn) {
                                          props.onClickHeaderCloseBtn();
                                        }
                                      }
                                    }}
                                    aria-label={t("Close")}
                                  >
                                    <CloseIcon
                                      style={{
                                        width: "1rem",
                                        height: "1rem",
                                        cursor: "pointer",
                                      }}
                                    />
                                  </IconButton>
                                </div>
                              </Grid>
                            )}
                          </Grid>
                        </Grid>
                      )}
                    </Grid>
                  </Grid>
                </div>

                <Divider variant="fullWidth" />
              </>
            )}

            {/* modal content  */}
            <div className={classes.content + " " + classes.paddingContent}>
              {props.Content}
            </div>

            <Divider variant="fullWidth" />
            {/* modal footer  */}
            <div className={classes.modalFooter}>
              <div className={classes.padding}>
                <Grid container justify="space-between">
                  {props.footerText && (
                    <Grid item>
                      <Typography>{props.footerText}</Typography>
                    </Grid>
                  )}

                  <Grid item>
                    <Grid container justify="flex-start" alignItems="center">
                      {/* btn3  */}
                      {props.btn3Title && (
                        <Grid item style={{ paddingRight: 5 }}>
                          <Button
                            id="pmweb_ModalForm_Click3Btn"
                            style={customStyle.btn}
                            variant="outlined"
                            size="small"
                            onClick={props.onClick3}
                          >
                            {props.btn3Title}
                          </Button>
                        </Grid>
                      )}
                    </Grid>
                  </Grid>
                  <Grid item>
                    <Grid container justify="flex-end" spacing={1}>
                      {/* btn1  */}
                      {props.btn1Title && (
                        <Grid item style={{ padding: "0" }}>
                          <Button
                            style={customStyle.btn1}
                            className="tertiary"
                            onClick={props.onClick1}
                            id={props.btn1Id}
                          >
                            {props.btn1Title}
                          </Button>
                        </Grid>
                      )}
                      {/* btn2 */}
                      {props.btn2Title &&
                        (props.isProcessing ? (
                          <Grid item style={{ padding: "0" }}>
                            {props.btn2Title.indexOf("Delete") !== -1 ? (
                              <DeleteButton
                                style={{ fontSize: "12px" }}
                                variant="contained"
                                size="small"
                                id={props.btn2Id}
                              >
                                <CircularProgress
                                  color="#FFFFFF"
                                  style={{
                                    height: "15px",
                                    width: "15px",
                                    marginRight: "8px",
                                  }}
                                ></CircularProgress>

                                {props.btn2Title}
                              </DeleteButton>
                            ) : (
                              <Button
                                style={{ fontSize: "12px" }}
                                className="primary"
                                sx={{
                                  position: "relative",
                                  display: "inline-flex",
                                  height: "15px",
                                  width: "20px",
                                }}
                              >
                                <CircularProgress
                                  color="#FFFFFF"
                                  variant={
                                    props.withProgress
                                      ? "determinate"
                                      : "indeterminate"
                                  }
                                  style={{
                                    height: "20px",
                                    width: "20px",
                                    marginRight: "8px",
                                  }}
                                  value={
                                    props.withProgress ? props.percentage : null
                                  }
                                ></CircularProgress>
                                {props.withProgress && (
                                  <Typography
                                    variant="caption"
                                    component="div"
                                    style={{
                                      color: "#FFFFFF",
                                      fontSize: "8px",
                                      top: 0,
                                      left: -80,
                                      bottom: 0,
                                      right: 0,
                                      position: "absolute",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    {`${Math.round(props.percentage)}%`}
                                  </Typography>
                                )}

                                {props.btn2Title}
                              </Button>
                            )}
                          </Grid>
                        ) : (
                          <Grid item style={{ padding: "0" }}>
                            {props.btn2Title.indexOf("Delete") !== -1 ? (
                              <DeleteButton
                                id="pmweb_ModalForm_DeleteBtn2"
                                style={{ fontSize: "12px" }}
                                variant="contained"
                                size="small"
                                onClick={props.onClick2}
                              >
                                {props.btn2Title}
                              </DeleteButton>
                            ) : (
                              <Button
                                id="pmweb_ModalForm_Click2Btn"
                                style={{ fontSize: "12px" }}
                                className="primary"
                                onClick={props.onClick2}
                                disabled={
                                  props.btn2Disabled ||
                                  props.Content.props.errorMessage
                                } //Modified on 28/08/2023, bug_id:130692
                                // disabled={props.btn2Disabled || props.errorMsg}
                                //  id={props.btn2Id}
                              >
                                {props.btn2Title}
                              </Button>
                            )}
                          </Grid>
                        ))}
                    </Grid>
                  </Grid>
                </Grid>
              </div>
            </div>
          </div>
        </Fade>
      </Modal>
    </FocusTrap>
  );
};

export default ModalForm;
