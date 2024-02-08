import React from "react";
import { useTranslation } from "react-i18next";
import "./index.css";
import HelpOutlineOutlinedIcon from "@material-ui/icons/HelpOutlineOutlined";
import { LightTooltip } from "../StyledTooltip";

function FeatureListing(props) {
  let { t } = useTranslation();
  const {
    maxAvailableFeaturesId,
    menuName,
    interfaceId,
    description,
    icon,
    index,
    onClick,
  } = props;
  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      <img alt={`${menuName}`} style={{ padding: "4px" }} src={icon} />
      <p
        id={`pmweb_FeatureListing_MenuName${index}`}
        tabIndex={0}
        className="features-data"
        onClick={onClick}
      >
        {menuName}
      </p>
      {interfaceId <= maxAvailableFeaturesId ? (
        <div>
          <LightTooltip
            id={`pmweb_FeatureListing_MenuNameHelpTooltip${index}`}
            arrow={true}
            enterDelay={500}
            placement="bottom-start"
            title={description}
          >
            <HelpOutlineOutlinedIcon className="features-help-icon" />
          </LightTooltip>
        </div>
      ) : (
        <p className="custom-tag">{t("customTag")}</p>
      )}
    </div>
  );
}

export default FeatureListing;
