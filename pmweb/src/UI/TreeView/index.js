import React from "react";
import { getVariableType } from "../../utility/ProcessSettings/Triggers/getVariableType";
import { useTranslation } from "react-i18next";
import styles from "./index.module.css";
import arabicStyles from "./arabicStyle.module.css";
import { RTL_DIRECTION } from "../../Constants/appConstants";

function TreeViewComponent(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;

  const renderTreeItem = (nodes) => {
    return (
      <div
        key={nodes.TypeFieldId}
        nodeId={nodes.TypeFieldId}
        className={styles.mainDiv}
      >
        <span
          className={
            direction === RTL_DIRECTION ? arabicStyles.dash : styles.dash
          }
        >
          <hr />
        </span>
        <p
          className={
            nodes.NestedComplex && nodes.NestedComplex.length > 0
              ? styles.nestedGroupItem
              : styles.groupItem
          }
          style={{
            background: nodes.inherited
              ? "rgba(0,0,0,0.05)"
              : nodes.NestedComplex && nodes.NestedComplex.length > 0
              ? "#e8f3fa"
              : "white",
            color: nodes.inherited ? "rgba(0,0,0,0.6)" : "black",
            border: nodes.inherited
              ? "1px solid rgba(0,0,0,0.2)"
              : "1px solid black",
          }}
        >
          {nodes.FieldName}
          <span
            className={styles.typeString}
            style={{ color: nodes.inherited ? "rgba(0,0,0,0.7)" : "black" }}
          >
            {" "}
            {t(getVariableType(nodes.WFType))
              ? `(${t(getVariableType(nodes.WFType))})`
              : null}
          </span>
        </p>
        {Array.isArray(nodes.NestedComplex) &&
        nodes.NestedComplex.length > 0 ? (
          <div
            className={
              direction === RTL_DIRECTION ? arabicStyles.group : styles.group
            }
          >
            {nodes.NestedComplex.map((node) => renderTreeItem(node))}
          </div>
        ) : null}
      </div>
    );
  };

  const renderTree = (nodes) => {
    return (
      <div key={nodes.TypeId} nodeId={nodes.TypeId} className={styles.mainDiv}>
        <p
          className={
            nodes.VarField && nodes.VarField.length > 0
              ? styles.nestedGroupItem
              : styles.groupItem
          }
          style={{
            background:
              nodes.VarField && nodes.VarField.length > 0 ? "#e8f3fa" : "white",
          }}
        >
          {nodes.TypeName}
        </p>
        {Array.isArray(nodes.VarField) && nodes.VarField.length > 0 ? (
          <div
            className={
              direction === RTL_DIRECTION ? arabicStyles.group : styles.group
            }
          >
            {nodes.VarField.map((node) => renderTreeItem(node))}
          </div>
        ) : null}
      </div>
    );
  };

  return renderTree(props.item);
}

export default TreeViewComponent;
