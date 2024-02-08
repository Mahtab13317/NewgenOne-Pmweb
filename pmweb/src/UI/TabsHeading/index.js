import React from "react";
import { useTranslation } from "react-i18next";

function TabsHeading(props) {
  let { t } = useTranslation();
  return (
    <>
      {
        //added by mahtab
        props?.heading ? (
          <div className="headingSectionTab"><h4>{t(props?.heading)}</h4></div>
        ) : null
      }
    </>
  );
}

export default TabsHeading;
