// Changes made to solve Bug 116651 - Process Task: add variable button is not working and
// Bug 116650 - Process Task: cancel button is not working or it should not be available if not required
import React from "react";
import { store, useGlobalState } from "state-pool";
import { connect, useDispatch } from "react-redux";
import { setToastDataFunc } from "../../../../redux-store/slices/ToastDataHandlerSlice";
import { useTranslation } from "react-i18next";
import { RTL_DIRECTION } from "../../../../Constants/appConstants";
import { Grid } from "@material-ui/core";

function CommonHeader(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  // Process Data
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  // Activity Data
  const loadedActivityPropertyData = store.getState("activityPropertyData");
  const [localLoadedActivityPropertyData] = useGlobalState(
    loadedActivityPropertyData
  );
  const dispatch = useDispatch();
  const { isReadOnly } = props;

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "0.5rem 0.5vw 0.25rem",
        }}
      >
        <p style={{ color: "#606060", fontSize: "var(--base_text_font_size)" }}>
          {props.tabType === "ForwardForVariables" ||
          props.tabType === "ForwardForDocuments"
            ? t("frwdMapping")
            : t("reverseMapping").toUpperCase()}
        </p>
        {isReadOnly || props.isDrawerExpanded ? null : (
          <p
            style={{
              color: "var(--link_color)",
              fontSize: "var(--base_text_font_size)",
              //Bug 124393 Added the cursor-pointer
              cursor: "pointer",
            }}
            id="pmweb_CommonHeader_ShowVariablesModal"
            onClick={() =>
              localLoadedActivityPropertyData?.m_objPMSubProcess?.importedProcessName?.trim() !==
              ""
                ? props.setShowVariablesModal(true)
                : dispatch(
                    setToastDataFunc({
                      message: t("selectDeployedProcess"),
                      severity: "error",
                      open: true,
                    })
                  )
            }
          >
            {props.tabType === "ForwardForVariables" ||
            props.tabType === "ReverseForVariables"
              ? t("addVariables")
              : t("addDocumentsMultiple")}
          </p>
        )}

        <hr style={{ height: "1px", color: "#707070", margin: "5px 0px" }} />
      </div>
      {!props.hideTargetCurrentHeader && (
        <div
          style={{
            // display: "flex",
            // justifyContent: "space-between",
            width: props.isDrawerExpanded ? "100%" : "100%",
            padding: "0.5vw 0.5vw", //For Bug 134656 we have provided this resolution by giving padding of 0.5vw
          }}
        >
          <Grid container>
            <Grid item xs={5}>
              <div
                style={{
                  // flex: "1",
                  height: "38px",
                  borderRadius: "1px",
                  opacity: "1",
                  backgroundColor: "#F4F4F4",
                  // display: "flex",
                  // flexDirection: "column",
                  padding:
                    direction === RTL_DIRECTION
                      ? "0px 14px 0px 0px"
                      : "0px 0px 0px 14px", //For Bug 134656 we have provided this resolution by giving padding of 14px
                }}
              >
                <p
                  style={{
                    fontSize: "var(--base_text_font_size)",
                    color: "#000000",
                  }}
                >
                  {props.tabType == "ForwardForDocuments" ||
                  props.tabType == "ForwardForVariables"
                    ? t("targetProcess")
                    : t("currentProcess")}
                </p>
                <p
                  style={{
                    fontSize: "var(--base_text_font_size)",
                    color: "#000000",
                  }}
                >
                  {props.tabType == "ForwardForDocuments" ||
                  props.tabType == "ForwardForVariables"
                    ? localLoadedActivityPropertyData?.m_objPMSubProcess
                        ?.importedProcessName
                    : localLoadedProcessData?.ProcessName}
                </p>
              </div>
            </Grid>
            <Grid item xs={1}>
              <span style={{ display: "none" }}>xs=4</span>
            </Grid>
            <Grid item xs={5}>
              <div
                style={{
                  flex: "1",
                  height: "38px",
                  borderRadius: "1px",
                  opacity: "1",
                  backgroundColor: "#F4F4F4",
                  display: "flex",
                  flexDirection: "column",
                  // padding:
                  //   direction === RTL_DIRECTION
                  //     ? "0px 5px 0px 0px"
                  //     : "0px 0px 0px 5px",
                  padding:
                    direction === RTL_DIRECTION
                      ? "0px 14px 0px 0px"
                      : "0px 0px 0px 14px",
                }}
              >
                <p
                  style={{
                    fontSize: "var(--base_text_font_size)",
                    color: "#000000",
                  }}
                >
                  {props.tabType == "ForwardForDocuments" ||
                  props.tabType == "ForwardForVariables"
                    ? t("currentProcess")
                    : t("targetProcess")}
                </p>
                <p
                  style={{
                    fontSize: "var(--base_text_font_size)",
                    color: "#000000",
                  }}
                >
                  {props.tabType == "ForwardForDocuments" ||
                  props.tabType == "ForwardForVariables"
                    ? localLoadedProcessData?.ProcessName
                    : localLoadedActivityPropertyData?.m_objPMSubProcess
                        ?.importedProcessName}
                </p>
              </div>
            </Grid>
            <Grid item xs={1}>
              <span style={{ display: "none" }}>xs=4</span>
            </Grid>
          </Grid>
        </div>
      )}
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    isDrawerExpanded: state.isDrawerExpanded.isDrawerExpanded,
  };
};

export default connect(mapStateToProps, null)(CommonHeader);
