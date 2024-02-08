import React from "react";
import { Select, MenuItem } from "@material-ui/core";
import styles from "./index.module.css";
import { useTranslation } from "react-i18next";
import { RTL_DIRECTION } from "../../Constants/appConstants";

function MultiLineSelect(props) {
  const {
    selectedDataField,
    componentStyles,
    handleDropdownChange,
    dropdownOptions,
  } = props;
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;

  const menuProps = {
    anchorOrigin: {
      vertical: "bottom",
      horizontal: "left",
    },
    transformOrigin: {
      vertical: "top",
      horizontal: "left",
    },
    getContentAnchorEl: null,
  };
  return (
    <div>
      <Select
        id="multi_line_select_dropdown"
        MenuProps={menuProps}
        value={selectedDataField}
        className={
          direction === RTL_DIRECTION
            ? componentStyles.dataFieldDropdownRtl
            : componentStyles.dataFieldDropdownLtr
        }
        onChange={handleDropdownChange}
      >
        {dropdownOptions &&
          dropdownOptions.map((d) => {
            return (
              <MenuItem
                className={
                  direction === RTL_DIRECTION
                    ? componentStyles.menuItemStylesRtl
                    : componentStyles.menuItemStylesLtr
                }
                value={d.dataField}
              >
                <div className={styles.dropdownDataDiv}>
                  <p
                    className={
                      direction === RTL_DIRECTION
                        ? componentStyles.dropdownDataRtl
                        : componentStyles.dropdownDataLtr
                    }
                  >
                    {d.aliasName}
                  </p>
                  <p
                    className={
                      direction === RTL_DIRECTION
                        ? componentStyles.dropdownSubTextRtl
                        : componentStyles.dropdownSubTextLtr
                    }
                  >
                    {d.dataField}
                  </p>
                </div>
              </MenuItem>
            );
          })}
      </Select>
    </div>
  );
}

export default MultiLineSelect;
