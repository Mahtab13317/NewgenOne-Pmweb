import React from "react";

function Templates({ settemplateData }) {
  const getTemplateData = async (data) => {
    setTemplateData(data);
  };

  const setTemplateData = (data) => {
    settemplateData(data);
  };

  React.useEffect(() => {
    if (document.getElementById("mf_forms_int_des")) {
      window.addEventListener(
        "load",
        window.loadFormTemplates(getTemplateData),
        true
      );
    }
    return () => {
      window.removeEventListener(
        "load",
        window.loadFormTemplates(getTemplateData),
        true
      );
    };
  }, [document.getElementById("mf_forms_int_des")]);

  return (
    <div style={{ width: "100%", height: "75%", paddingTop: "0.6rem" }}>
      <div style={{ height: "inherit" }} id="mf_forms_int_des"></div>
    </div>
  );
}

export default Templates;
