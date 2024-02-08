import React, { useEffect, useState } from "react";
import { MenuItem } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import CustomizedDropdown from "../../../../UI/Components_With_ErrrorHandling/Dropdown";
import { RTL_DIRECTION } from "../../../../Constants/appConstants";
import { ReplaceSpaceToUnderScore } from "../../../../utility/ReplaceChar";

function ReusableOneMap(props) {
  const [selectedMappingField, setSelectedMappingField] = useState(null);
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const handleFieldMapping = (e) => {
    setSelectedMappingField(e.target.value);
    props.handleFieldMapping(e.target.value);
  };

  useEffect(() => {
    setSelectedMappingField(props.varField);
  }, [props.varField]);

  return (
    <div style={{ display: "flex", marginBottom: "8px", alignItems: "center" }}>
      <div
        style={{
          flex: "0.95",
          height: "var(--line_height)",
          border: "1px solid #F3F3F3",
          borderRadius: "2px",
          fontSize: "var(--base_text_font_size)",
          padding: "7px",
          textOverflow: "ellipsis",
          overflow: "hidden",
        }}
      >
        {props.mapField}
      </div>
      <span
        style={{
          width: "2vw",
          textAlign: "center",
        }}
      >
        =
      </span>
      <CustomizedDropdown
        variant="outlined"
        id={`pmweb_webService_reusableOneMap_${ReplaceSpaceToUnderScore(
          props.mapField
        )}`}
        isNotMandatory={true}
        ariaLabel="Select reusableOnemap"
        onChange={(e) => handleFieldMapping(e)}
        relativeStyle={{ flex: "1" }}
        style={{
          width: "100%",
          height: "var(--line_height)",
          border: "1px solid #F3F3F3",
          borderRadius: "2px",
          padding: "7px",
          fontSize: "var(--base_text_font_size)",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
        disabled={
          props.invocationType === "F" || props.isReadOnly ? true : false
        }
        value={selectedMappingField}
      >
        {/* <MenuItem
          className="InputPairDiv_CommonList"
          value={""}
          style={{
            fontSize: "var(--base_text_font_size)",
            width: "100%",
            padding: "4px 7px",
            height: "20px",
            justifyContent: direction === RTL_DIRECTION ? "end" : null
          }}
        >
          {" "}
        </MenuItem> */}
        {props.dropDownOptions.map((loadedVar) => {
          return (
            <MenuItem
              className="InputPairDiv_CommonList"
              value={loadedVar}
              style={{
                fontSize: "var(--base_text_font_size)",
                width: "100%",
                padding: "4px 7px",
                justifyContent: direction === RTL_DIRECTION ? "end" : null,
              }}
            >
              {loadedVar[props.dropDownKey]}
            </MenuItem>
          );
        })}
      </CustomizedDropdown>
    </div>
  );
}

export default ReusableOneMap;
