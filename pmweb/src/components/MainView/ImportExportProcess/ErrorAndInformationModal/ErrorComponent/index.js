import React from "react";
import { SPACE } from "../../../../../Constants/appConstants";

function ErrorComponent(props) {
  const { errorMessages } = props;

  return (
    <div style={{ padding: "10px", height: " 62vh", overflow: "auto" }}>
      {errorMessages?.map((element, index) => {
        return (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              marginTop: "5px",
              font: "normal normal normal var(--base_text_font_size) / 17px var(--font_family)",
            }}
          >
            {index + 1}.{SPACE}
            {element}
          </div>
        );
      })}
    </div>
  );
}
export default ErrorComponent;
