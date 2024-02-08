import {
  Button,
  CircularProgress,
  Grid,
  Input,
  TextField,
  Typography,
  makeStyles,
} from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ENDPOINT_GETPROJECTLIST_DRAFTS,
  RTL_DIRECTION,
  SERVER_URL,
  userRightsMenuNames,
} from "../../../../Constants/appConstants";
import { useSelector, connect } from "react-redux";
import { UserRightsValue } from "../../../../redux-store/slices/UserRightsSlice";
import SelectWithInput from "../../../../UI/SelectWithInput";
import { getMenuNameFlag } from "../../../../utility/UserRightsFunctions";
import axios from "axios";
import { REGEX, validateRegex } from "../../../../validators/validator";
import classes from "../index.module.css";

const useStyles = makeStyles((theme) => ({
  inputHeading: {
    fontSize: "14px",
    fontWeight: 600,
    marginBottom: "4px",
    fontFamily: "var(--font_family)",
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
  inputField: {
    background: "white",
    direction: (props) => props.direction,
  },
  footer: {
    background: "#f8f8f8",
    justifyContent: "flex-end",
    borderTop: "1px solid #d3d3d3",
    padding: "1rem 1vw",
    gap: "1vw",
  },
  body: { padding: "1rem 1vw", flexDirection: "column" },
  header: {
    justifyContent: "space-between",
    padding: "1rem 1vw",
    borderBottom: "1px solid #d3d3d3",
  },
  titleHeading: {
    font: "normal normal 600 var(--subtitle_text_font_size)/19px var(--font_family) !important",
  },
  bodyHeading: {
    font: "normal normal 600 var(--base_text_font_size)/17px var(--font_family) !important",
    marginBottom: "0.25rem",
  },
  selectWithInputTextField: {
    //width: "30vw !important",
    background: "#ffffff 0% 0% no-repeat padding-box",
    //border: "1px solid #707070 !important",
    borderRadius: "4px",
  },
  multiSelectConstInput: {
    position: "absolute",
    // Added on 30-01-24 for Bug 142781
    left: "0% !important",
    width: "95% !important",
    // Till here for Bug 142781
    top: "1px",
    zIndex: "100",
    font: "normal normal normal var(--base_text_font_size)/17px var(--font_family) !important",
    border: "none",
    marginInlineStart: "1px",
  },
  selectWithInput: {
    //width: "30vw !important",
    marginBottom: "0",
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
  inputErrorField: {
    border: "1px solid #D53D3D !important",
  },
  CircularProgress: {
    height: "1rem !important",
    width: "1rem !important",
    color: "white",
    marginRight: "6px",
    marginLeft: "2px",
  },
}));

const CreateProcessModal = (props) => {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const styles = useStyles({ direction });
  const [processName, setProcessName] = useState(props.processName);
  const [defaultProject, setDefaultProject] = useState(null);
  const [projectList, setProjectList] = useState([]);
  const userRightsValue = useSelector(UserRightsValue);
  const [projectName, setProjectName] = useState();
  const [isProjectNameConstant, setProjectNameConstant] = useState(false);
  const { createSpinner } = props;
  const [projectId, setProjectId] = useState(0);
  const [error, setError] = useState({
    errProcessName:
      props.processName.length > 22 ? t("processNameLengthErrorMsg") : "",
    errProjectName:
      projectName === "" || projectName == null
        ? t("SelectProjectNameErr")
        : "",
  });

  // Boolean that decides whether create project button will be visible or not.
  const createProjectRightsFlag = getMenuNameFlag(
    userRightsValue?.menuRightsList,
    userRightsMenuNames.createProject
  );

  useEffect(() => {
    if (!!props.selectedProjectName) {
      setProjectName(props.selectedProjectName);
      setProjectId(props.selectedProjectId);
    }
  }, [props.selectedProjectName]);

  useEffect(() => {
    if (props.selectedProjectName && props.selectedProjectId) {
      setDefaultProject(props.selectedProjectName);
      setProjectId(props.selectedProjectId);
      setError({ ...error, errProjectName: "" });
    } else {
      axios
        .get(SERVER_URL + ENDPOINT_GETPROJECTLIST_DRAFTS)
        .then((res) => {
          if (res.status === 200) {
            let projectWithCreateRights = res.data.Projects?.filter(
              (el) => el?.RIGHTS?.CPRC === "Y"
            );
            setProjectList(projectWithCreateRights);
          }
        })
        .catch((err) => {});
    }
  }, []);

  const isBtnDisabled = () => {
    return (
      processName === "" ||
      error.errProcessName !== "" ||
      error.errProjectName !== ""
    );
  };

  const handleChange = (e, name) => {
    switch (name) {
      case "ProcessName":
        if (e.target.value?.length > 22) {
          setError({
            ...error,
            errProcessName: t("processNameLengthErrorMsg"),
          });
        } else if (e.target.value?.trim() === "") {
          setError({
            ...error,
            errProcessName: t("pleaseEnterAProcessName"),
          });
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
        setProcessName(e.target.value);
        break;
      default:
    }
  };

  return (
    <Grid container>
      {/* header */}
      <Grid item container className={styles.header}>
        <Grid item>
          <Typography
            className={styles.titleHeading}
            data-testid="create-process-modal-title-heading"
          >
            {t("basicDetails")}
          </Typography>
        </Grid>
      </Grid>
      {/* //Body */}
      <Grid item container className={styles.body}>
        <Grid item>
          <Typography
            className={styles.bodyHeading}
            id="pmweb_CreateProcessModal_ProjectNameInput"
            data-testid="create-process-modal-project-name-heading"
          >
            {t("nameOfProject")}
          </Typography>
          {defaultProject ? (
            <Input
              fullWidth
              type="text"
              className={styles.disabledField}
              value={defaultProject}
              disabled={true}
              inputProps={{
                "aria-labelledby": "pmweb_CreateProcessModal_ProjectNameInput",
                disabled: true,
              }}
              data-testid="pmweb_CreateProcessModal_ProjectNameInput"
              id="pmweb_CreateProcessModal_ProjectNameInput"
            />
          ) : (
            <SelectWithInput
              dropdownOptions={projectList}
              id="pmweb_CreateProcessModal_ProjectNameSelect"
              value={projectName}
              setValue={(val) => {
                if (val === "") {
                  setError({
                    ...error,
                    errProjectName: t("EntityCantBeBlank", {
                      entityName: t("ProjectName"),
                    }),
                  });
                } else if (val === null) {
                  setError({
                    ...error,
                    errProjectName: t("SelectProjectNameErr"),
                  });
                } else {
                  setError({ ...error, errProjectName: "" });
                }
                setProjectName(val);
              }}
              showEmptyString={false}
              showConstValue={createProjectRightsFlag ? true : false}
              inputClass={styles.selectWithInputTextField}
              constantInputClass={styles.multiSelectConstInput}
              setIsConstant={
                createProjectRightsFlag ? setProjectNameConstant : false
              }
              isConstant={
                createProjectRightsFlag ? isProjectNameConstant : false
              }
              constantStatement="project"
              constantOptionStatement="+addProject"
              optionStyles={{ color: "darkBlue" }}
              isConstantIcon={createProjectRightsFlag ? true : false}
              optionKey="ProjectName"
              selectWithInput={styles.selectWithInput}
              error={error.errProjectName !== ""}
              helperText={error.errProjectName}
            />
          )}
        </Grid>
        <Grid item style={{ padding: "1rem 0px" }}>
          <Typography
            className={styles.bodyHeading}
            id="pmweb_CreateProcessModal_ProcessName"
            data-testid="create-process-modal-process-name-heading"
          >
            {t("NameofProcess")}
          </Typography>
          <TextField
            id="outlined-basic"
            hiddenLabel
            variant="outlined"
            fullWidth
            inputProps={{
              "aria-labelledby": "pmweb_CreateProcessModal_ProcessName",
            }}
            className={styles.textField}
            InputProps={{
              className:
                styles.inputField +
                " " +
                (error.errProcessName?.trim() !== ""
                  ? styles.inputErrorField
                  : ""),
            }}
            FormHelperTextProps={{
              className: styles.helperText,
            }}
            error={processName === ""}
            helperText={error.errProcessName}
            value={processName}
            onChange={(e) => handleChange(e, "ProcessName")}
          />
        </Grid>
      </Grid>
      {/* //footer */}
      <Grid item container className={styles.footer}>
        <Grid item>
          <Button
            className={classes.cancelBtn}
            onClick={props.modalCloseHandler}
            style={{ background: "white", borderRadius: "2px" }}
            id="pmweb_cpmAI_cancelBtn"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                props.modalCloseHandler();
              }
            }}
            aria-label="cancel button"
            disabled={createSpinner}
          >
            {t("cancel")}
          </Button>
        </Grid>
        <Grid item>
          <Button
            disabled={isBtnDisabled()}
            aria-label="confirm button"
            onClick={() => {
              props.CreateProcessByAIHandler(
                processName,
                defaultProject
                  ? projectId
                  : typeof projectName === "object"
                  ? projectName.ProjectId
                  : null,
                defaultProject
                  ? defaultProject
                  : typeof projectName === "object"
                  ? projectName.ProjectName
                  : projectName,
                defaultProject ? true : typeof projectName === "object"
              );
            }}
            className={
              isBtnDisabled() ? classes.disabledCreateProcessBtn : classes.okBtn
            }
            id="pmweb_cpmAI_createBtn"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                props.CreateProcessByAIHandler(
                  processName,
                  defaultProject
                    ? projectId
                    : typeof projectName === "object"
                    ? projectName.ProjectId
                    : null,
                  defaultProject
                    ? defaultProject
                    : typeof projectName === "object"
                    ? projectName.ProjectName
                    : projectName,
                  defaultProject ? true : typeof projectName === "object"
                );
              }
            }}
          >
            {createSpinner ? (
              <CircularProgress className={styles.CircularProgress} />
            ) : null}
            {t("Create")}
          </Button>
        </Grid>
      </Grid>
    </Grid>
  );
};
const mapStateToProps = (state) => {
  return {
    selectedProjectId: state.selectedProjectReducer.selectedProjectId,
    selectedProjectName: state.selectedProjectReducer.selectedProjectName,
  };
};

export default connect(mapStateToProps, null)(CreateProcessModal);
