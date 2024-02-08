import React, { useState, useEffect } from "react";
import styles from "./RulesDataTable.module.css";
import arabicStyles from "./RulesDataTableArabic.module.css";
import { useTranslation } from "react-i18next";
import { RTL_DIRECTION } from "../../../../Constants/appConstants";
import { isProcessReadOnly } from "../../../../utility/CommonFunctionCall/CommonFunctionCall";
import { LightTooltip } from "../../../../UI/StyledTooltip";
import { Grid } from "@material-ui/core";

function RuleDataTable(props) {
  let { t } = useTranslation();
  const [isDisable, setIsDisable] = useState(false);
  const { calledFrom } = props;
  const direction = `${t("HTML_DIR")}`;

  useEffect(() => {
    if (isProcessReadOnly(props.openProcessType)) {
      setIsDisable(true);
    } else {
      setIsDisable(false);
    }
  }, [props.openProcessType]);

  const shortenString = (str, num) => {
    if (str?.length <= num) {
      return str;
    }
    return str?.slice(0, num) + "...";
  };

  return (
    <React.Fragment>
      <table
        className={styles.dataTable}
        style={{
          height: calledFrom === "variable" ? "12rem" : "23rem",
          minHeight: calledFrom === "variable" ? "12rem" : "10rem",
        }}
      >
        <thead className={styles.dataTableHead}>
          <tr>
            {/* Added Grid for bug_id: 134046 */}
            <Grid container justifyContent="space-between" spacing={1}>
              <Grid item xs={3} md={4}>
                <th
                // className={styles.dataTableHeadCell}
                >
                  <p
                    className={
                      direction === RTL_DIRECTION
                        ? arabicStyles.dataTableHeadCellContent
                        : styles.dataTableHeadCellContent
                    }
                    style={{
                      padding: "0.5rem",
                    }}
                  >
                    {t("name")}
                  </p>
                </th>
              </Grid>
              {props.hideGroup ? null : (
                <Grid item xs={4} md={4}>
                  <th
                  // className={styles.dataTableHeadCell}
                  >
                    <p
                      className={
                        direction === RTL_DIRECTION
                          ? arabicStyles.dataTableHeadCellContent
                          : styles.dataTableHeadCellContent
                      }
                      style={{
                        padding: "0.5rem",
                      }}
                    >
                      {t("group")}
                    </p>
                  </th>
                </Grid>
              )}
              {isDisable && calledFrom !== "variable" ? (
                <Grid item>
                  <th
                  // className={styles.dataTableHeadCell}
                  >
                    {props.tableContent.length > 0 ? (
                      <p
                        className={
                          direction === RTL_DIRECTION
                            ? arabicStyles.dataEntryAddRemoveBtnHeader
                            : styles.dataEntryAddRemoveBtnHeader
                        }
                        style={{
                          //WCAG Color Contrast Issue: updated the color from red to rgb(181,42,42)
                          color:
                            props.tableType == "remove"
                              ? "rgb(181,42,42)"
                              : "#0072C6",
                          fontWeight: "600",
                          padding: "0.5rem",
                        }}
                        onClick={props.headerEntityClickFunc}
                        onKeyUp={props.onKeyheaderEntityClickFunc}
                        tabIndex={0}
                        id={`pmweb_RuleDataTable_headerEntity_rulesDataTable_${props.tableType}`}
                      >
                        {props.tableType == "remove"
                          ? "- " + t("removeAll")
                          : "+ " + t("addAll")}
                      </p>
                    ) : (
                      <span
                        className={styles.visuallyHidden}
                        aria-hidden={true}
                        display="none"
                      >
                        Hidden span
                      </span>
                    )}
                  </th>
                </Grid>
              ) : null}
            </Grid>
          </tr>
        </thead>
        <tbody
          className={
            props.tableContent.length > 0
              ? styles.dataTableBody
              : `relative ${styles.dataTableBody} ${styles.dataTableBodyWithNoData}`
          }
          style={{
            height: calledFrom === "variable" ? "12rem" : "19rem",
            minHeight: calledFrom === "variable" ? "10rem" : "17rem",
          }}
        >
          {props.tableContent && props.tableContent.length > 0 ? (
            props.tableContent.map((option, index) => {
              return (
                <tr className={styles.dataTableRow}>
                  {/* Added Grid for bug_id: 134046 */}
                  <Grid container justifyContent="space-between" spacing={1}>
                    <Grid item xs={3} md={4}>
                      <td
                      // className={
                      //   direction === RTL_DIRECTION
                      //     ? arabicStyles.dataTableBodyCell
                      //     : styles.dataTableBodyCell
                      // }
                      >
                        <div
                          className={
                            direction === RTL_DIRECTION
                              ? arabicStyles.dropdownVariable
                              : styles.dropdownVariable
                          }
                        >
                          <LightTooltip
                            id="pmweb_ruleData_tooltip"
                            arrow={true}
                            placement="bottom-start"
                            title={option?.Name}
                          >
                            <p style={{ cursor: "default", padding: "0.5rem" }}>
                              {shortenString(option?.Name, 10)}
                            </p>
                          </LightTooltip>
                        </div>
                      </td>
                    </Grid>
                    {props.hideGroup ? null : (
                      <Grid item xs={4} md={4}>
                        <td
                        // className={
                        //   direction === RTL_DIRECTION
                        //     ? arabicStyles.dataTableBodyCell
                        //     : styles.dataTableBodyCell
                        // }
                        // Changes on 07-09-2023 to resolve the bug Id 135572
                        // style={{ width: "12rem" }}
                        >
                          <LightTooltip
                            id="pmweb_ruleData_tooltip"
                            arrow={true}
                            placement="bottom-start"
                            title={option?.Group}
                          >
                            <span
                              className={styles.dropdownVariableType}
                              style={{ padding: "0.5rem" }}
                            >
                              {shortenString(option?.Group, 10)}
                              {/* {option.Group} */}
                            </span>
                          </LightTooltip>
                        </td>
                      </Grid>
                    )}
                    {isDisable && calledFrom !== "variable" ? (
                      <Grid item>
                        <td 
                        // className={styles.dataTableBodyCell}
                        >
                          <p
                            className={
                              direction === RTL_DIRECTION
                                ? `${arabicStyles.dataEntryAddRemoveBtnHeader} ${styles.mt025}`
                                : `${styles.dataEntryAddRemoveBtnHeader} ${styles.mt025}`
                            }
                            style={{
                              //WCAG Color Contrast Issue: updated the color from red to rgb(181,42,42)
                              color:
                                props.tableType == "remove"
                                  ? "rgb(181,42,42)"
                                  : "#0072C6",
                              padding: "0.5rem",
                            }}
                            onClick={() => props.singleEntityClickFunc(option)}
                            onKeyUp={(e) => {
                              if (e.key === "Enter") {
                                props.singleEntityClickFunc(option);
                                e.stopPropagation();
                              }
                            }}
                            tabIndex={0}
                            id={`pmweb_RuleDataTable_singleEntity_${props.tableType}_${index}`}
                            aria-description={`Name: ${option.Name} ${
                              !props.hideGroup ? "Group" : ""
                            } ${!props.hideGroup ? option.Group : ""}`}
                          >
                            {props.tableType == "remove"
                              ? "- " + t("remove")
                              : "+ " + t("add")}
                          </p>
                        </td>
                      </Grid>
                    ) : null}
                  </Grid>
                </tr>
              );
            })
          ) : (
            // Changes made to solve Bug 116649
            <div className={styles.noDataEntryRecords}>
              {/* {props.ruleDataTableStatement} */}
              {/* Changes on 12-09-2023 to resolve the bug Id 136573 */}
              {props.searchTerm
                ? t("noResultsFound")
                : props.ruleDataTableStatement}
            </div>
          )}
        </tbody>
      </table>
    </React.Fragment>
  );
}

export default RuleDataTable;
