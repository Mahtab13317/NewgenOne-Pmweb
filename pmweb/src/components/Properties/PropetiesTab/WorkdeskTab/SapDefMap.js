import React from "react";
import styles from "./Sap.module.css";
import { useTranslation } from "react-i18next";
import { Box } from "@material-ui/core";

function SapDefMap(props) {
  let { t } = useTranslation();
  let { mappedData } = props;
  return (
    <>
      <div className={styles.flexRow}>
        <div className={styles.tableContainer}>
          <div className={styles.defHeader}>
            <div className={styles.listHeading}>{t("definedMapping")}</div>
          </div>
          <Box>
            <table className={styles.sapMapTable}>
              <thead>
                <tr>
                  <th>{t("toolbox.workdeskSap.sapFieldName")}</th>
                  <th>{t("Name")}</th>
                </tr>
              </thead>
              <tbody>
                {mappedData?.map((data) => {
                  return (
                    <tr>
                      <td>{data.strSAPMappedField}</td>
                      <td>{data.strSAPFieldName}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Box>
        </div>
      </div>
    </>
  );
}

export default SapDefMap;
