import React from "react";
import styles from "./CommonList.module.css";
import arabicStyles from "./arabicList.module.css";
import {
  GLOBAL_SCOPE,
  LOCAL_SCOPE,
  RTL_DIRECTION,
} from "../../../../../../Constants/appConstants";
import { useTranslation } from "react-i18next";

function CommonListItem(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  let {
    itemName,
    itemDomain,
    itemScope,
    itemAppName,
    itemMethodName,
    onClickFunc,
    onkeyDownFunc,
    isSelected,
    id,
    fontWeight
  } = props;
  return (
    <div
      className={isSelected ? styles.selectedListItem : styles.listItem}
      onClick={onClickFunc}
      id={id}
      tabIndex={0}
      onKeyDown={onkeyDownFunc}
    >
      <div className={styles.webS_ItemHeader}>
        <span
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.webS_itemName
              : styles.webS_itemName
          }
          style={{fontWeight: props.fontWeight ? props.fontWeight : "700"}}
          title={itemName}
        >
          {itemName}
        </span>
        <span
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.webS_itemType
              : styles.webS_itemType
          }
        >
          {itemDomain} {itemDomain && itemScope ? "|" : null}{" "}
          {itemScope === GLOBAL_SCOPE
            ? t("global")
            : itemScope === LOCAL_SCOPE
            ? t("Local")
            : null}
        </span>
      </div>
      <div className={styles.webS_ItemSubHeader}>
        <div
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.webS_itemDesc
              : styles.webS_itemDesc
          }
        >
          <span className="block">{itemAppName}</span>
          <span className="block">{itemMethodName}</span>
        </div>
      </div>
    </div>
  );
}

export default CommonListItem;
