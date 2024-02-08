import React, { useEffect, useState } from "react";
import { MenuItem } from "@material-ui/core";
import CustomizedDropdown from "../../../../UI/Components_With_ErrrorHandling/Dropdown";
import { useTranslation } from "react-i18next";
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
    <div style={{ display: "flex", marginBottom: "8px" }}>
      <div
        style={{
          flex: "1",
          height: "var(--line_height)",
          border: "1px solid #F3F3F3",
          borderRadius: "2px",
          // marginRight: "10px",
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
          // marginRight: "10px",
          marginInline: "5px",
        }}
      >
        =
      </span>
      {/* <Select
        onChange={(e) => handleFieldMapping(e)}
        style={{
          flex: "1",
          height: "var(--line_height)",
          border: "1px solid #F3F3F3",
          borderRadius: "2px",
          padding: "7px",
          fontSize: "var(--base_text_font_size)",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
        disabled={props.isReadOnly}
        value={selectedMappingField}
        MenuProps={{
          anchorOrigin: {
            vertical: "bottom",
            horizontal: "left",
          },
          transformOrigin: {
            vertical: "top",
            horizontal: "left",
          },
          getContentAnchorEl: null,
          PaperProps: {
            style: {
              maxHeight: "10rem",
            },
          },
        }}
      >
        {props.dropDownOptions.map((loadedVar) => {
          return (
            <MenuItem
              className="InputPairDiv_CommonList"
              value={loadedVar}
              style={{
                fontSize: "var(--base_text_font_size)",
                width: "100%",
                padding: "4px 7px",
              }}
            >
              {loadedVar[props.dropDownKey]}
            </MenuItem>
          );
        })}
      </Select> */}
      <CustomizedDropdown
        variant="outlined"
        isNotMandatory={true}
        onChange={(e) => handleFieldMapping(e)}
        id={`pmweb_restful_reusableOneMap_${ReplaceSpaceToUnderScore(
          props.mapField
        )}`}
        ariaLabel="select restful"
        style={{
          flex: "1",
          height: "var(--line_height)",
          border: "1px solid #F3F3F3",
          borderRadius: "2px",
          padding: "7px",
          fontSize: "var(--base_text_font_size)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          width: "100%",
        }}
        relativeStyle={{ flex: "1 1 0%" }}
        disabled={props.isReadOnly}
        value={selectedMappingField}
      >
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
