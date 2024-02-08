import React from "react";
import styles from "./index.module.css";
import { LightTooltip } from "../../../../../UI/StyledTooltip";

function InformationComponent(props) {
  const { errorMessageObj } = props;
  const shortenRuleStatement = (str, num) => {
    if (str?.length <= num) {
      return str;
    }
    return str?.slice(0, num) + "...";
  };

  return (
    <div>
      <div
        id="body"
        style={{
          width: "100%",
          height: "80%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {errorMessageObj
          ?.filter(
            (element) =>
              !(
                element["key"] === "missingDataObjects" ||
                element["key"] === "failedDataObjects"
              )
          )
          ?.map((errorTab) => (
            <div style={{ marginBlock: "1rem" }}>
              <div
                style={{
                  width: "100%",
                  padding: "1rem",
                  display: "flex",
                  flexDirection: "row",
                  fontSize: "var(--base_text_font_size)",
                  fontWeight: "600",
                }}
              >
                {errorTab?.header}
              </div>
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    width: "100%",

                    display: "flex",
                    flexDirection: "row",
                  }}
                >
                  {errorTab?.subHeaders?.map((subHead, index) => (
                    <div
                      style={{
                        width:
                          errorTab?.subHeaders?.length > 1 ? "50%" : "100%",
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "flex-start",
                        paddingInline: index === 0 ? "1.5rem" : "",
                        overflowWrap: "anywhere",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "var(--base_text_font_size)",
                          fontWeight: "500",
                          color: "#606060",
                        }}
                      >
                        {subHead}
                      </p>
                    </div>
                  ))}
                </div>
                <div className={styles.mainDiv}>
                  {errorTab.errorData.map((data, index) => {
                    if (typeof data === "string") {
                      return (
                        <div
                          style={{
                            fontSize: "var(--base_text_font_size)",
                            fontWeight: "600",
                            color: "#000000",
                            display: "flex",
                            flexDirection: "row",
                            height: "2.6rem",
                            paddingInline: "1.5rem",
                            alignItems: "center",
                            justifyContent: "flex-start",
                            paddingBlock: "10px",
                          }}
                        >
                          {index + 1}. {data}
                        </div>
                      );
                    } else if (errorTab.key === "renamedDataObjects") {
                      return (
                        <div
                          style={{
                            fontSize: "var(--base_text_font_size)",
                            fontWeight: "600",
                            color: "#000000",
                            display: "flex",
                            flexDirection: "row",
                            height: "2.6rem",
                            width: "100%",
                            paddingInline: "1.5rem",
                            alignItems: "center",
                            justifyContent: "flex-start",
                            paddingBlock: "10px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              height: "100%",
                              width: "50%",

                              alignItems: "center",
                              justifyContent: "flex-start",
                            }}
                          >
                            {/* Changes on 25-09-2023 to resolve the bug Id 135818 */}
                            <LightTooltip arrow={true}
                              enterDelay={500}
                              placement="bottom-start"
                              title={data.oldName}>
                              <span
                                style={{
                                  flex: "0.75",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {index + 1}. {shortenRuleStatement(data.oldName, 30)}
                              </span>
                            </LightTooltip>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              height: "100%",
                              width: "50%",

                              alignItems: "center",
                              justifyContent: "flex-start",
                            }}
                          >
                             {/* Changes on 25-09-2023 to resolve the bug Id 135818 */}
                            <LightTooltip arrow={true}
                              enterDelay={500}
                              placement="bottom-start"
                              //title={data.oldName}
                              title={data.name} //modified on 03/01/2024 for bug_id:140921
                              >
                              <span
                                style={{
                                  flex: "0.75",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {shortenRuleStatement(data.name, 30)}
                              </span>
                            </LightTooltip>

                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div
                          style={{
                            fontSize: "var(--base_text_font_size)",
                            fontWeight: "600",
                            color: "#000000",
                            display: "flex",
                            flexDirection: "row",
                            height: "2.6rem",
                            paddingInline: "1.5rem",
                            alignItems: "center",
                            justifyContent: "flex-start",
                            paddingBlock: "10px",
                          }}
                        >
                          {index + 1}. {data.name}
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default InformationComponent;
