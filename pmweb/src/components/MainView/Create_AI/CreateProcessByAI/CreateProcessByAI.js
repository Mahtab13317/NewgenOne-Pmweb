import {
  Button,
  Grid,
  TextField,
  Typography,
  makeStyles,
} from "@material-ui/core";
import React, { useEffect, useRef, useState } from "react";
import {
  HelpIcon,
  DisabledHistoryIcon,
  EnabledHistoryIcon,
  WarningIcon,
  InformationIcon,
} from "../../../../utility/AllImages/AllImages";
import newgenOneMarvinLogo from "../../../../assets/genAI_Icons/NewgenONEMarvin_logo.svg";
import { RTL_DIRECTION } from "../../../../Constants/appConstants";
import { LightTooltip } from "../../../../UI/StyledTooltip";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { REGEX, validateRegex } from "../../../../validators/validator";
import classes from "../index.module.css";
import Modal from "../../../../UI/Modal/Modal";
import ConfirmationModal from "../ConfirmationModal";
import {
  deleteMarvinGeneratedProcesses,
  getMarvinGeneratedProcesses,
} from "../CommonMarvinApiCalls/CommonMarvinApiCalls";
import { useDispatch, useSelector } from "react-redux";
import {
  promptHistoryValue,
  setIsMovedToPromptHistory,
  setIsPromptHistoryOpen,
  setSelectedGeneratedPreview,
} from "../../../../redux-store/slices/MarvinPromtHistorySlice";
import Drawer from "@mui/material/Drawer";
import { IconButton } from "@mui/material";

const useStyles = makeStyles((theme) => ({
  inputHeading: {
    fontSize: "14px",
    fontWeight: 600,
    fontFamily: "var(--font_family)",
  },
  inputSubHeading: {
    fontSize: "var(--base_text_font_size)",
    fontWeight: 600,
    marginTop: "0.75rem",
    marginBottom: "2px",
    fontFamily: "var(--font_family)",
    textAlign: (props) =>
      props.direction === RTL_DIRECTION ? "right" : "left",
    alignItems: "center",
  },
  optional: {
    color: "#70787E",
    marginInlineStart: "0.5vw",
    marginInlineEnd: "0",
    textAlign: (props) =>
      props.direction === RTL_DIRECTION ? "right" : "left",
    fontSize: "var(--base_text_font_size)",
    fontWeight: "600",
    fontFamily: "var(--font_family)",
  },
  helpIcon: {
    marginInlineStart: "0.5vw",
    marginInlineEnd: "0px",
  },
  hr: { marginTop: "15px", marginBottom: "15px" },
  item: {
    width: "100%",
  },
  container: {
    borderRadius: "4px",
    background: "#FFF",
    boxShadow: "0px 0px 4px 0px rgba(0, 0, 0, 0.25)",
    height: "100%",
    flexDirection: "column",
    flexWrap: "nowrap",
  },
  innerContainer: {
    display: "flex",
    overflow: "auto",
    alignItems: "flex-start",
    flexGrow: 1,
  },
  itemContainer: {
    padding: "0px 1vw",
    margin: "0.25rem 0",
  },
  textField: {
    "&.MuiInputBase-input": {
      background: "white",
    },
    "&  .MuiFormHelperText-root.Mui-error": {
      backgroundColor: "red",
      margin: "unset",
      //paddingLeft: 10,
    },
    "& .MuiFormHelperText-contained": {
      margin: "unset",
    },
    borderRadius: "4px",
  },
  multilineTextField: {
    borderRadius: "2px !important",
  },
  inputField: {
    borderRadius: "4px !important",
    background: "#FFF",
    boxShadow: "0px 0px 4px 0px rgba(0, 0, 0, 0.25)",
    border: "0 !important",
    direction: (props) => props.direction,
  },
  inputErrorField: {
    border: "1px solid #D53D3D !important",
  },
  flex: {
    display: "flex",
  },
  footer: {
    background: "#fff",
    borderRadius: "4px",
    boxShadow: "0px 0px 4px 0px rgba(0, 0, 0, 0.25)",
    padding: "1.25rem 1vw",
    gap: "1vw",
  },
  rowFlex: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  columnFlex: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  rowFlexJustify: {
    justifyContent: "space-between",
  },
  regenerateBtn: {
    marginLeft: "10px !important",
  },
  helperText: {
    margin: "unset",
    textAlign: (props) =>
      props.direction === RTL_DIRECTION ? "right" : "left",
    color: "#D95353 !important",
    fontFamily: "var(--font_family)",
    fontSize: "10px",
    fontStyle: "normal",
    fontWeight: "400",
    lineHeight: "14px",
    marginTop: "2px",
  },
  iconContainer: {
    width: "2.25rem",
    height: "2.25rem !important",
    background: "#c4c4c4",
    margin: "0 !important",
    padding: "0 !important",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    // boxShadow: "0px 0px 6px 0px rgba(0, 0, 0, 0.25)",
    borderRadius: "4px",
  },
}));

const CreateProcessByAI = (props) => {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const styles = useStyles({ direction });
  const dispatch = useDispatch();
  const {
    isPromptHistoryOpen,
    allAIGeneratedProcesses,
    isMovedToPromptHistory,
  } = useSelector(promptHistoryValue);
  const {
    data = {},
    processData,
    ClickProcess,

    showHistoryBtn,
    cancelHandler = () => {
      console.log("provide cancel handler fn.");
    },
    setShowAIProcessCreation = () => {
      console.log("provide setShowAIProcessCreation fn");
    },
  } = props;

  const currData = useRef({
    currProcessName: data?.processName,
    currCategory: data?.category || "",
    currGeography: data?.geography || "",
    currAdditional: data?.additional || "",
  });

  useEffect(() => {
    if (currData.current) {
      currData.current.currProcessName = data?.processName || "";
      currData.current.currCategory = data?.category || "";
      currData.current.currGeography = data?.geography || "";
      currData.current.currAdditional = data?.additional || "";
    }
  }, [JSON.stringify(data)]);
  const [error, setError] = useState({
    errProcessName: "",
    errCategory: "",
    errGeography: "",
    errAdditionalComments: "",
  });

  const isBtnDisabled = () => {
    return (
      currData.current.currProcessName?.trim() === "" ||
      //added on 2/2/2024 for bug_id:143148
      //needs to replicated in migration branch as well.
      currData.current.currProcessName?.trim() === undefined ||
      //till here for bug_id:143148
      error.errProcessName !== "" ||
      error.errCategory !== "" ||
      error.errGeography !== "" ||
      error.errAdditionalComments !== ""
    );
  };

  const handleChange = (e, name) => {
    switch (name) {
      case "ProcessName":
        if (e.target.value.length > 64) {
          setError({
            ...error,
            errProcessName: t("messages.minMaxChar", {
              maxChar: 64,
              //modified on 1/2/2024 for bug_id:143094
              //need to replicated in migration branch as well.
              // entityName: t("ProcessName"),
              entityName: `${t("ProcessName")}/${t("Title")}`,
              //till here for bug_id:143094
            }),
          });
        } else if (e.target.value?.trim() === "") {
          setError({ ...error, errProcessName: t("kindlyEnterProcessName") });
        } else if (
          !validateRegex(e.target.value, REGEX.StartWithAlphaThenAlphaNumUsDash)
        ) {
          setError({
            ...error,
            errProcessName: t("processnameValidation"),
          });
        } else {
          setError({
            ...error,
            errProcessName: "",
          });
        }
        currData.current.currProcessName = e.target.value;
        break;
      case "Category":
        if (e.target.value.length > 25) {
          setError({
            ...error,
            errCategory: t("messages.minMaxChar", {
              maxChar: 25,
              entityName: t("Category"),
            }),
          });
        } else if (e.target.value?.trim() === "") {
          setError({ ...error, errCategory: "" });
        } else if (
          !validateRegex(
            e.target.value,
            REGEX.StartWithAlphaThenAlphaNumAndOnlyUs
          )
        ) {
          setError({
            ...error,
            errCategory: t("validations", {
              entityName: t("Category"),
            }),
          });
        } else {
          setError({ ...error, errCategory: "" });
        }
        currData.current.currCategory = e.target.value;
        break;
      case "Geography":
        if (e.target.value.length > 40) {
          setError({
            ...error,
            errGeography: t("messages.minMaxChar", {
              maxChar: 40,
              entityName: t("geography"),
            }),
          });
        } else if (e.target.value?.trim() === "") {
          setError({ ...error, errGeography: "" });
        } else if (
          !validateRegex(
            e.target.value,
            REGEX.StartWithAlphaThenAlphaNumAndOnlyUs
          )
        ) {
          setError({
            ...error,
            errGeography: t("validations", {
              entityName: t("geography"),
            }),
          });
        } else {
          setError({ ...error, errGeography: "" });
        }
        currData.current.currGeography = e.target.value;
        break;
      case "Additional":
        if (e.target.value.length > 1000) {
          setError({
            ...error,
            errAdditionalComments: t("messages.minMaxChar", {
              maxChar: 1000,
              entityName: t("additionalComments"),
            }),
          });
        } else if (e.target.value?.trim() === "") {
          setError({ ...error, errAdditionalComments: "" });
        } else if (
          !validateRegex(
            e.target.value,
            REGEX.StartWithAlphaThenAlphaNumWithUsDashCommaFullStop
          )
        ) {
          setError({
            ...error,
            errAdditionalComments: t("validations2", {
              entityName: t("additionalComments"),
            }),
          });
        } else {
          setError({ ...error, errAdditionalComments: "" });
        }
        currData.current.currAdditional = e.target.value;
        break;
      default:
    }
  };

  const HelperDescription = ({ type }) => {
    let contentMsg = "",
      example = "";
    switch (type) {
      case 0: // processName
        contentMsg =
          "Enter a descriptive name for your process. Use a concise and clear title that reflects the purpose of the process.";
        example =
          "Invoice Approval, IT Ticket Resolution, Sales Order Processing, etc.";
        break;
      case 1: // categoryName
        contentMsg =
          "Enter the relevant category name that aligns with the nature of the process for comprehensive workflow details.";
        example = "Finance, Human Resources, Banking, IT, etc.";
        break;
      case 2: // geography
        contentMsg =
          "Enter the name of the geography. Providing an accurate geography ensures the creation of a workflow tailored to the specific region, making the process more relevant and effective.";
        example = "Europe, North America, APAC, etc.";
        break;
      case 3: // enabled prompt history
        contentMsg =
          "Your generated content history for this session will appear in the ‘Marvin History’ section";

        break;
      default:
    }

    return (
      <Grid container style={{ flexDirection: "column" }}>
        <Grid item>
          <Typography className={classes.tooltipTitle}>
            {t("description")}:
          </Typography>
        </Grid>
        <Grid item>
          <Typography className={classes.tooltipContent}>
            {contentMsg}
          </Typography>
        </Grid>
        {example && (
          <Grid
            item
            container
            style={{ display: "flex", flexDirection: "row", gap: "0.25vw" }}
          >
            <Grid item>
              <Typography className={classes.tooltipContent}>
                {t("Example")}:{" "}
              </Typography>
            </Grid>
            <Grid item style={{ flex: "1" }}>
              <Typography className={classes.tooltipContent}>
                {example}
              </Typography>
            </Grid>
          </Grid>
        )}
      </Grid>
    );
  };

  const handleStartNewSession = () => {
    deleteMarvinGeneratedProcesses({ dispatch });
  };

  const handleYesContinue = () => {
    if (
      allAIGeneratedProcesses.length > 0 &&
      allAIGeneratedProcesses[0]?.templates &&
      allAIGeneratedProcesses[0]?.templates?.length > 0
    ) {
      dispatch(
        setSelectedGeneratedPreview(allAIGeneratedProcesses[0]?.templates[0])
      );
      dispatch(setIsMovedToPromptHistory(true));
      setShowAIProcessCreation(true);
      dispatch(setIsPromptHistoryOpen(true));
    }
  };
  const openPromptHistoryPanel = () => {
    dispatch(setIsPromptHistoryOpen(true));
    dispatch(setIsMovedToPromptHistory(true));
  };
  const handleCancelHandler = (e) => {
    dispatch(setIsMovedToPromptHistory(false));
    cancelHandler(e);
  };
  return (
    <>
      <Grid className={styles.container} container xs={12}>
        <Grid
          className={styles.item}
          container
          style={{
            padding: "0.75rem 1vw 0px",
            marginBottom: "unset",
            alignItems: "center",
            gap: "0.25vw",
          }}
          justifyContent={showHistoryBtn ? "space-between" : "flex-start"}
        >
          {!props.IsRegenerate && (
            <Typography
              className={styles.inputHeading}
              data-testid="pmweb_CPAI_generateusingtext"
            >
              {t("generateUsing")}
            </Typography>
          )}
          <img src={newgenOneMarvinLogo} alt="NewgenONE Marvin" />
          {showHistoryBtn && (
            <IconButton
              id="pmweb_createProcessByAIGenAI_promtHistoryBtn"
              data-testid="pmweb_createProcessByAIGenAI_promtHistoryBtn"
              role="button"
              aria-label="Promt History"
              onClick={openPromptHistoryPanel}
              disabled={allAIGeneratedProcesses.length === 0}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  dispatch(getMarvinGeneratedProcesses({ dispatch }));
                  openPromptHistoryPanel();
                }
              }}
              className={styles.iconContainer}
              disableFocusRipple
              disableTouchRipple
              disableRipple
            >
              {allAIGeneratedProcesses.length > 0 && !props.disableBtn ? (
                <LightTooltip
                  arrow={true}
                  enterDelay={500}
                  placement="top-start"
                  title={<HelperDescription type={3} />}
                >
                  <EnabledHistoryIcon />
                </LightTooltip>
              ) : (
                <DisabledHistoryIcon />
              )}
            </IconButton>
          )}
        </Grid>
        <Grid item container className={styles.innerContainer}>
          <Grid item container className={styles.itemContainer}>
            <Grid item className={styles.item}>
              <Typography
                className={styles.inputSubHeading + " " + styles.flex}
                id="pmweb_CreateProcessByAI_processName"
              >
                {/* modified on 1/2/2024 for bug_id:143094 */}
                {/* need to be replicated in migration branch as well */}
                {/* {t("ProcessName")} */}
                {t("ProcessName")}/{t("Title")}
                {/* till here for bug_id:143094 */}
                <LightTooltip
                  arrow={true}
                  enterDelay={500}
                  placement="top-start"
                  title={<HelperDescription type={0} />}
                >
                  <HelpIcon className={styles.helpIcon} />
                </LightTooltip>
              </Typography>
              <TextField
                InputProps={{
                  className:
                    styles.inputField +
                    " " +
                    (error.errProcessName.trim() !== ""
                      ? styles.inputErrorField
                      : ""),
                }}
                name="processName"
                data-testid="pmweb_CreateProcessByAI_processName_test"
                inputProps={{
                  "aria-labelledby": "pmweb_CreateProcessByAI_processName",
                  role: "textbox",
                  "aria-label": "Process Name Input Field",
                }}
                hiddenLabel
                variant="outlined"
                fullWidth
                className={styles.textField}
                FormHelperTextProps={{
                  className: styles.helperText,
                }}
                value={currData.current.currProcessName}
                error={error.errProcessName.trim() !== ""}
                helperText={error.errProcessName}
                onChange={(e) => handleChange(e, "ProcessName")}
              />
            </Grid>
            <Grid item className={styles.item}>
              <Typography
                className={styles.inputSubHeading + " " + styles.flex}
                id="pmweb_CreateProcessByAI_category"
              >
                {t("Category")}{" "}
                <span className={styles.optional}>({t("optional")})</span>{" "}
                <LightTooltip
                  arrow={true}
                  enterDelay={500}
                  placement="top-start"
                  title={<HelperDescription type={1} />}
                >
                  <HelpIcon className={styles.helpIcon} />
                </LightTooltip>
              </Typography>
              <TextField
                id="outlined-basic"
                name="category"
                data-testid="pmweb_CreateProcessByAI_category_test"
                inputProps={{
                  "aria-labelledby": "pmweb_CreateProcessByAI_category",
                  role: "textbox",
                  "aria-label": "Category Input Field",
                }}
                hiddenLabel
                variant="outlined"
                fullWidth
                className={styles.textField}
                InputProps={{ className: styles.inputField }}
                value={currData.current.currCategory}
                FormHelperTextProps={{ className: styles.helperText }}
                error={error.errCategory.trim() !== ""}
                helperText={error.errCategory}
                onChange={(e) => handleChange(e, "Category")}
              />
            </Grid>
            <Grid item className={styles.item}>
              <Typography
                className={styles.inputSubHeading + " " + styles.flex}
                id="pmweb_CreateProcessByAI_geography"
              >
                {t("geography")}{" "}
                <span className={styles.optional}>({t("optional")})</span>{" "}
                <LightTooltip
                  arrow={true}
                  enterDelay={500}
                  placement="top-start"
                  title={<HelperDescription type={2} />}
                >
                  <HelpIcon className={styles.helpIcon} />
                </LightTooltip>
              </Typography>
              <TextField
                id="outlined-basic"
                name="geography"
                data-testid="pmweb_CreateProcessByAI_geography_test"
                inputProps={{
                  "aria-labelledby": "pmweb_CreateProcessByAI_geography",
                  role: "textbox",
                  "aria-label": "Geography Input Field",
                }}
                hiddenLabel
                variant="outlined"
                fullWidth
                className={styles.textField}
                InputProps={{ className: styles.inputField }}
                FormHelperTextProps={{ className: styles.helperText }}
                error={error.errGeography.trim() !== ""}
                helperText={error.errGeography}
                value={currData.current.currGeography}
                onChange={(e) => handleChange(e, "Geography")}
              />
            </Grid>
            <Grid item className={styles.item}>
              <Typography
                className={styles.inputSubHeading + " " + styles.flex}
                id="pmweb_CreateProcessByAI_additionalComments"
              >
                {t("anyAdditionalComments")}{" "}
                <span className={styles.optional}>({t("optional")})</span>{" "}
              </Typography>

              <TextField
                id="outlined-multiline-static"
                name="additional"
                data-testid="pmweb_CreateProcessByAI_additionalComments_test"
                inputProps={{
                  "aria-labelledby":
                    "pmweb_CreateProcessByAI_additionalComments",
                  role: "textbox",
                  "aria-label": "Additional Input Field",
                }}
                hiddenLabel
                multiline
                rows={6}
                fullWidth
                className={styles.multilineTextField}
                InputProps={{
                  className: styles.inputField,
                }}
                FormHelperTextProps={{ className: styles.helperText }}
                error={error.errAdditionalComments.trim() !== ""}
                helperText={error.errAdditionalComments}
                value={currData.current.currAdditional}
                onChange={(e) => handleChange(e, "Additional")}
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid item container style={{ alignItems: "flex-end" }}>
          {props.IsRegenerate ? (
            <Grid
              container
              item
              xs={12}
              className={clsx(
                styles.footer,
                styles.columnFlex,
                styles.rowFlexJustify
              )}
            >
              <Button
                className={classes.regenerateBtn}
                onClick={() => {
                  if (Object.keys(processData)?.length > 0 && processData) {
                    props.setShowRegenerateModal({
                      data: currData.current,
                    });
                    ClickProcess(currData.current, true);
                  } else {
                    ClickProcess(currData.current, true);
                  }
                }}
                disabled={props.disableBtn || isBtnDisabled()}
                id="pmweb_cpbyAI_regenerateBtn"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (Object.keys(processData)?.length > 0 && processData) {
                      props.setShowRegenerateModal({
                        data: currData.current,
                      });
                      ClickProcess(currData.current, true);
                    } else {
                      ClickProcess(currData.current, true);
                    }
                  }
                }}
              >
                <div
                  className={classes.regenerateTextDiv}
                  style={{
                    width: `calc(100% - 4px)`,
                    height: `calc(100% - 4px)`,
                  }}
                >
                  <div className={classes.regenerateText}>
                    {t("regenerate")}
                  </div>
                </div>
              </Button>
              <Button
                className={
                  props.disableBtn || isBtnDisabled()
                    ? classes.disabledCreateProcessBtn
                    : classes.createProcessBtn
                }
                onClick={props.createHandler}
                disabled={props.disableBtn || isBtnDisabled()}
                id="pmweb_cpbyAI_createBtn"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    props.createHandler();
                  }
                }}
              >
                {t("CreateProcess")}
              </Button>
            </Grid>
          ) : (
            <Grid
              container
              xs={12}
              className={styles.columnFlex + " " + styles.footer}
            >
              <Button
                className={classes.generateProcessBtn}
                onClick={() => props.ClickProcess(currData.current, false)}
                role="button"
                aria-label="Generate Process"
                disabled={isBtnDisabled()}
                id="pmweb_cpbyAI_generateBtn"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    props.ClickProcess(currData.current, false);
                  }
                }}
              >
                {t("GenerateProcess")}
              </Button>
            </Grid>
          )}
        </Grid>
      </Grid>
      {allAIGeneratedProcesses.length > 0 && !isMovedToPromptHistory && (
        <Modal
          show={allAIGeneratedProcesses.length > 0 && !isMovedToPromptHistory}
          style={{
            width: "27%",
            position: "absolute",
            top: "32%",
            left: "36.5%",
            padding: "0",
            boxShadow: "none",
            border: "0",
          }}
          backDropStyle={{
            position: "absolute",
          }}
          children={
            <ConfirmationModal
              modalHeading={t("resumeSession")}
              isWarning={true}
              cancelButtonText={t("cancel")}
              confirmButtonText={t("Yes,Continue")}
              confirmationMessage={t(
                "ConfirmationMsgToRestartFromPromptHistory"
              )}
              noteMsg={t("NoteForDeletePromptHistory")}
              showNoteIcon={true}
              confirmFunc={handleYesContinue}
              modalCloseHandler={handleCancelHandler}
              secondaryActionButton={true}
              secondaryActionButtonOnClick={handleStartNewSession}
              secondaryActionButtonText={t("startNewSession")}
              headingIcon={<InformationIcon style={{ marginTop: "2px" }} />}
              noteIcon={<WarningIcon style={{ marginTop: "2px" }} />}
            />
          }
        />
      )}
    </>
  );
};

export default CreateProcessByAI;
