import React, { useEffect, useState } from "react";
import styles from "./index.module.css";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { RTL_DIRECTION, SPACE } from "../../../../../Constants/appConstants";
import DeleteOutlinedIcon from "@material-ui/icons/DeleteOutlined";

function OperationStrip(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const {
    index,
    isNested,
    handleSelectedOp,
    selectedOp,
    getOperationLabel,
    opType,
    deleteOpHandler,
    tableDetails,
    isReadOnly,
  } = props;
  const [operationName, setOperationName] = useState("");
  const [selectedTableString, setSelectedTableString] =
    useState("No table selected");

  // Function that runs when the component loads.
  useEffect(() => {
    setOperationName(getOperationLabel(opType));
  }, []);

  // Function that runs when the values of tableDetails and isNested changes.
  useEffect(() => {
    if (isNested) {
      const tempArr = tableDetails[index].selectedTableNames;
      let tableNameStr = "";
      tempArr?.forEach((element, ind) => {
        if (ind < 2) {
          tableNameStr = tableNameStr.concat(
            ind === 0 ? element.TableName : `,${element.TableName}`
          );
        }
      });
      if (tempArr?.length > 2) {
        tableNameStr = tableNameStr.concat(
          `,`,
          SPACE,
          "+",
          `${tempArr?.length - 2}`,
          SPACE,
          `${t("More")}`
        );
      }
      if (tableNameStr?.length !== 0) {
        setSelectedTableString(tableNameStr);
      } else {
        setSelectedTableString("No table selected");
      }
    } else {
      if (tableDetails[index]?.selectedTableName?.length !== 0) {
        setSelectedTableString(tableDetails[index].selectedTableName);
      } else {
        setSelectedTableString("No table selected");
      }
    }
  }, [tableDetails, isNested]);

  return (
    <div className={styles.flexRow}>
      <div
        id={`pmweb_OperationStrip_OperationDiv_${index}`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSelectedOp(index);
            e.stopPropagation();
          }
        }}
        onClick={() => handleSelectedOp(index)}
        className={clsx(
          selectedOp === index
            ? direction === RTL_DIRECTION
              ? styles.opListDivSelectedRTL
              : styles.opListDivSelected
            : direction === RTL_DIRECTION
            ? styles.opListDivRTL
            : styles.opListDiv,
          styles.flexRow
        )}
      >
        {operationName !== "" ? (
          <div className={clsx(styles.flexColumn, styles.opDetailsDiv)}>
            <p className={styles.opName}>
              {operationName}
              {SPACE}
              {index + 1}
            </p>
            <p className={styles.selectedTable}>{selectedTableString}</p>
          </div>
        ) : null}
        {!isReadOnly && (
          <DeleteOutlinedIcon
            id={`pmweb_OperationStrip_DeleteOperationBtn_${index}`}
            tabIndex={0}
            className={styles.deleteOpIcon}
            onClick={(event) => deleteOpHandler(index, event)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                deleteOpHandler(index, e);
                e.stopPropagation();
              }
            }}
          />
        )}
      </div>
    </div>
  );
}

export default OperationStrip;
