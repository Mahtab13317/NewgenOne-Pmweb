import React from "react";
import styles from "../properties.module.css";
import { useTranslation } from "react-i18next";
import { getVariableType } from "../../../../../utility/ProcessSettings/Triggers/getVariableType";
import { PROCESSTYPE_REGISTERED } from "../../../../../Constants/appConstants";
import { connect } from "react-redux";
import { LatestVersionOfProcess } from "../../../../../utility/abstarctView/checkLatestVersion";
import { store, useGlobalState } from "state-pool";
import { shortenRuleStatement } from "../../../../../utility/CommonFunctionCall/CommonFunctionCall";
import { LightTooltip } from "../../../../../UI/StyledTooltip";

function DataTable(props) {
  let { t } = useTranslation();
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  let readOnlyProcess =
    props.isReadOnly ||
    props.openProcessType === PROCESSTYPE_REGISTERED ||
    props.openProcessType === "RC" ||
    LatestVersionOfProcess(localLoadedProcessData?.Versions) !==
      +localLoadedProcessData?.VersionNo; // modified on 05/09/2023 for Bugid 136103;

  return (
    <React.Fragment>
      <table className={styles.dataTable}>
        <thead className={styles.dataTableHead}>
          <tr>
            <th className={styles.dataTableHeadCell}>
              <p className={styles.dataTableHeadCellContent}>{t("name")}</p>
            </th>
            <th className={styles.dataTableHeadCell}>
              <p className={styles.dataTableHeadCellContent}>{t("type")}</p>
            </th>
            {!readOnlyProcess ? (
              props.tableContent?.length > 0 ? (
                <th className={styles.dataTableHeadCell}>
                  <p
                    className={styles.dataEntryAddRemoveBtnHeader}
                    style={{
                      color:
                        props.tableType == "remove"
                          ? "rgb(181,42,42)"
                          : "var(--link_color)",
                    }}
                    onClick={props.headerEntityClickFunc}
                    id={`${props.id}_all`}
                    tabIndex={0}
                    onKeyUp={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        props.headerEntityClickFunc(e);
                      }
                    }}
                  >
                    {props.tableType == "remove"
                      ? "- " + t("removeAll")
                      : "+ " + t("addAll")}
                  </p>
                </th>
              ) : null
            ) : null}
          </tr>
        </thead>
        <tbody
          className={
            props.tableContent?.length > 0
              ? styles.dataTableBody
              : `relative ${styles.dataTableBody} ${styles.dataTableBodyWithNoData}`
          }
        >
          {props.tableContent?.length > 0 ? (
            props.tableContent.map((option, index) => {
              return (
                <tr className={styles.dataTableRow}>
                  <td className={styles.dataTableBodyCell}>
                    <div className={styles.dropdownVariable}>
                      {/* Changes made to solve Bug 134099 */}
                      <LightTooltip
                        id="pmweb_projectname_Tooltip"
                        arrow={true}
                        enterDelay={500}
                        placement="bottom-start"
                        title={option?.VariableName}
                      >
                        <span>
                          {shortenRuleStatement(option?.VariableName, 13)}
                        </span>
                      </LightTooltip>
                      <span>{option?.SystemDefinedName}</span>
                    </div>
                  </td>
                  <td
                    className={`${styles.dataTableBodyCell} ${styles.tabelBodyCellSecondColumn}`} // till here dated 5thSept
                  >
                    <span className={styles.dropdownVariableType}>
                      {t(getVariableType(option?.VariableType))}
                    </span>
                  </td>
                  {!readOnlyProcess ? (
                    <td className={styles.dataTableBodyCell}>
                      <p
                        className={`${styles.dataEntryAddRemoveBtnHeader} ${styles.mt025}`}
                        style={{
                          color:
                            props.tableType == "remove"
                              ? "rgb(181,42,42)"
                              : "var(--link_color)",
                        }}
                        onClick={() => props.singleEntityClickFunc(option)}
                        id={`${props.id}_item${index}`}
                        tabIndex={0}
                        onKeyUp={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            props.singleEntityClickFunc(option);
                          }
                        }}
                        aria-description={`${t("name")} : ${
                          option?.VariableName
                        } ${t("type")} : ${t(
                          getVariableType(option?.VariableType)
                        )} `}
                      >
                        {props.tableType == "remove"
                          ? "- " + t("remove")
                          : "+ " + t("add")}
                      </p>
                    </td>
                  ) : null}
                </tr>
              );
            })
          ) : (
            <div className={styles.noDataEntryRecords}>
              {t("dataEntryNoRecords")}
            </div>
          )}
        </tbody>
      </table>
    </React.Fragment>
  );
}

const mapStateToProps = (state) => {
  return {
    openProcessType: state.openProcessClick.selectedType,
  };
};

export default connect(mapStateToProps, null)(DataTable);
