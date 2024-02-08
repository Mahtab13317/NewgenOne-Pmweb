// Changes made to solve 110715 (Global Requirement section: Buttons not visible while Adding section)
// #BugID - 117364
// #BugDescription - Handled the checks for template id.
//Date - 25 October 2022

import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Typography from "@material-ui/core/Typography";
import ArrowRightIcon from "@material-ui/icons/ArrowRight";
import "./index.css";
import axios from "axios";
import {
  APP_HEADER_HEIGHT,
  SERVER_URL,
} from "../../../../Constants/appConstants";
import RightSection from "./requirementsRightSection";
import { connect, useSelector } from "react-redux";
import TabsHeading from "../../../../UI/TabsHeading";
import { store, useGlobalState } from "state-pool";
import { CircularProgress } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { encode_utf8 } from "../../../../utility/UTF8EncodeDecoder";
import { LightTooltip } from "../../../../UI/StyledTooltip";
import { shortenRuleStatement } from "../../../../utility/CommonFunctionCall/CommonFunctionCall";

const useStyles = makeStyles((theme) => ({
  root: {
    width: (props) => (props.fromArea === "activityLevel" ? "20%" : "16%"),
    borderRight: "1px solid #CECECE",
    height: "100%",
    marginTop: "4px",
    backgroundColor: "white",
  },
  heading: {
    fontSize: "var(--subtitle_text_font_size)",
    fontWeight: theme.typography.fontWeightRegular,
    color: "#606060",
  },
}));

function ProcessRequirements(props) {
  const { fromArea, isReadOnly } = props;
  const classes = useStyles({ fromArea });
  let { t } = useTranslation();
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const localActivityPropertyData = store.getState("activityPropertyData");
  const [localLoadedActivityPropertyData, setlocalLoadedActivityPropertyData] =
    useGlobalState(localActivityPropertyData);
  const [sections, setSections] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState({});
  const [originalSelOrder, setOriginalSelOrder] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const handleAccordionClick = () => {
    props.setIsActive(true);
  };
  const [width, setWidth] = React.useState(window.innerWidth);
  const breakpoint = 729;
  // changes added for bug_id: 134226
  const windowInnerHeight = useSelector(
    (state) => state.setWindowInnerHeight.windowInnerHeight
  );

  useEffect(() => {
    async function getSections() {
      const res = await axios.get(
        SERVER_URL +
          "/requirement/" +
          `${localLoadedProcessData.ProcessDefId}/${localLoadedProcessData.ProcessType}`
      );
      if (res?.status === 200) {
        if (fromArea === "activityLevel") {
          if (
            localLoadedActivityPropertyData?.ActivityProperty
              ?.m_objPMRequirementDetails?.reqList?.length === 0
          ) {
            setSections(
              res?.data?.Requirement.map((req) => {
                req.ReqDesc = "";
                req.ReqImpl = "";
                return req;
              })
            );
            handleSectionsForActivity(res?.data?.Requirement);
          } else {
            // code edited on 11 Jan 2023 for BugId 117908
            let reqSectionData = res?.data?.Requirement;
            let localReqList = [
              ...localLoadedActivityPropertyData?.ActivityProperty
                ?.m_objPMRequirementDetails?.reqList,
            ];

            const localReqFunc = (req, innerKey) => {
              let outerReq = { ...req };
              localReqList?.forEach((req) => {
                if (+req.reqId === +outerReq.RequirementId) {
                  outerReq.ReqDesc = req.reqDesc;
                  outerReq.ReqImpl = req.reqImpl;
                }
              });
              if (outerReq[innerKey]) {
                outerReq[innerKey] = outerReq[innerKey]?.map((innerReq) => {
                  return localReqFunc(innerReq, "InnerRequirement2");
                });
              }
              return outerReq;
            };

            reqSectionData = reqSectionData?.map((outerReq) => {
              return localReqFunc(outerReq, "InnerRequirement");
            });
            setSections(reqSectionData);

            setSelectedOrder({
              Attachment:
                localLoadedActivityPropertyData?.ActivityProperty
                  ?.m_objPMRequirementDetails?.reqList[0].attachmentList || [],
              ReqDesc:
                localLoadedActivityPropertyData?.ActivityProperty
                  ?.m_objPMRequirementDetails?.reqList[0].reqDesc,
              ReqImpl:
                localLoadedActivityPropertyData?.ActivityProperty
                  ?.m_objPMRequirementDetails?.reqList[0].reqImpl,
              RequirementId:
                localLoadedActivityPropertyData?.ActivityProperty
                  ?.m_objPMRequirementDetails?.reqList[0].reqId,
              RequirementName:
                localLoadedActivityPropertyData?.ActivityProperty
                  ?.m_objPMRequirementDetails?.reqList[0].reqName,
              SectionLevel: "0",
            });
            // added on 20/10/23 for BugId 139684
            setOriginalSelOrder({
              Attachment:
                localLoadedActivityPropertyData?.ActivityProperty
                  ?.m_objPMRequirementDetails?.reqList[0].attachmentList || [],
              ReqDesc:
                localLoadedActivityPropertyData?.ActivityProperty
                  ?.m_objPMRequirementDetails?.reqList[0].reqDesc,
              ReqImpl:
                localLoadedActivityPropertyData?.ActivityProperty
                  ?.m_objPMRequirementDetails?.reqList[0].reqImpl,
              RequirementId:
                localLoadedActivityPropertyData?.ActivityProperty
                  ?.m_objPMRequirementDetails?.reqList[0].reqId,
              RequirementName:
                localLoadedActivityPropertyData?.ActivityProperty
                  ?.m_objPMRequirementDetails?.reqList[0].reqName,
              SectionLevel: "0",
            });
          }
        } else {
          setSections(res?.data?.Requirement);
          setSelectedOrder({
            Attachment: res?.data?.Requirement
              ? res?.data?.Requirement[0]?.Attachment || []
              : [],
            ReqDesc: res?.data?.Requirement
              ? res?.data?.Requirement[0]?.ReqDesc
              : null,
            ReqImpl: res?.data?.Requirement
              ? res?.data?.Requirement[0]?.ReqImpl
              : null,
            RequirementId: res?.data?.Requirement
              ? res?.data?.Requirement[0]?.RequirementId
              : null,
            RequirementName: res?.data?.Requirement
              ? res?.data?.Requirement[0]?.RequirementName
              : null,
            SectionLevel: "0",
          });
          // added on 20/10/23 for BugId 139684
          setOriginalSelOrder({
            Attachment: res?.data?.Requirement
              ? res?.data?.Requirement[0]?.Attachment || []
              : [],
            ReqDesc: res?.data?.Requirement
              ? res?.data?.Requirement[0]?.ReqDesc
              : null,
            ReqImpl: res?.data?.Requirement
              ? res?.data?.Requirement[0]?.ReqImpl
              : null,
            RequirementId: res?.data?.Requirement
              ? res?.data?.Requirement[0]?.RequirementId
              : null,
            RequirementName: res?.data?.Requirement
              ? res?.data?.Requirement[0]?.RequirementName
              : null,
            SectionLevel: "0",
          });
        }
        setIsLoading(false);
      }
    }

    if (localLoadedProcessData?.ProcessDefId) {
      getSections();
    }
  }, [localLoadedProcessData?.ProcessDefId]); // code edited on 5 Dec 2022 for BugId 120080

  React.useEffect(() => {
    const handleWindowResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleWindowResize);

    // Return a function from the effect that removes the event listener
    return () => window.removeEventListener("resize", handleWindowResize);
  }, []);

  const handleSectionsForActivity = (data) => {
    let temp = global.structuredClone(localLoadedActivityPropertyData);

    let arrRequirements = [];
    data?.forEach((req) => {
      arrRequirements.push({
        reqName: req.RequirementName,
        reqId: req.RequirementId,
        ReqDesc: "",
        reqImpl: "",
        priority: req.ReqPriority || 1,
        attachmentList: req.Attachment || [],
      });
    });
    temp.ActivityProperty.m_objPMRequirementDetails.reqList = arrRequirements;
    if (
      temp?.ActivityProperty?.m_objPMRequirementDetails?.reqList &&
      temp?.ActivityProperty?.m_objPMRequirementDetails?.reqList?.length > 0
    ) {
      setSelectedOrder({
        Attachment:
          temp?.ActivityProperty?.m_objPMRequirementDetails?.reqList[0]
            .attachmentList || [],
        ReqDesc:
          temp?.ActivityProperty?.m_objPMRequirementDetails?.reqList[0].reqDesc,
        ReqImpl:
          temp?.ActivityProperty?.m_objPMRequirementDetails?.reqList[0].reqImpl,
        RequirementId:
          temp?.ActivityProperty?.m_objPMRequirementDetails?.reqList[0].reqId,
        RequirementName:
          temp?.ActivityProperty?.m_objPMRequirementDetails?.reqList[0].reqName,
        SectionLevel: "0",
      });
      // added on 20/10/23 for BugId 139684
      setOriginalSelOrder({
        Attachment:
          temp?.ActivityProperty?.m_objPMRequirementDetails?.reqList[0]
            .attachmentList || [],
        ReqDesc:
          temp?.ActivityProperty?.m_objPMRequirementDetails?.reqList[0].reqDesc,
        ReqImpl:
          temp?.ActivityProperty?.m_objPMRequirementDetails?.reqList[0].reqImpl,
        RequirementId:
          temp?.ActivityProperty?.m_objPMRequirementDetails?.reqList[0].reqId,
        RequirementName:
          temp?.ActivityProperty?.m_objPMRequirementDetails?.reqList[0].reqName,
        SectionLevel: "0",
      });
    }
    setlocalLoadedActivityPropertyData(temp);
  };

  // code edited on 11 Jan 2023 for BugId 117908
  useEffect(() => {
    let temp3 = global.structuredClone(sections);
    temp3?.forEach((section, idx) => {
      if (+section.RequirementId === +selectedOrder.RequirementId) {
        temp3[idx].ReqDesc = selectedOrder.ReqDesc;
        temp3[idx].ReqImpl = selectedOrder.ReqImpl;
      }
    });
    setSections(temp3);
    if (fromArea === "activityLevel") {
      let temp2 = global.structuredClone(localLoadedActivityPropertyData);
      if (
        temp2?.ActivityProperty?.m_objPMRequirementDetails?.reqList?.length > 0
      ) {
        let isPresent = false;
        temp2?.ActivityProperty?.m_objPMRequirementDetails?.reqList?.forEach(
          (req, idx) => {
            if (+req.reqId === +selectedOrder.RequirementId) {
              isPresent = true;
              temp2.ActivityProperty.m_objPMRequirementDetails.reqList[
                idx
              ].reqDesc = encode_utf8(selectedOrder.ReqDesc);
              temp2.ActivityProperty.m_objPMRequirementDetails.reqList[
                idx
              ].reqImpl = encode_utf8(selectedOrder.ReqImpl);
            }
          }
        );
        if (!isPresent && selectedOrder.RequirementId) {
          temp2?.ActivityProperty?.m_objPMRequirementDetails?.reqList.push({
            priority: +selectedOrder.SectionLevel + 1,
            reqDesc: encode_utf8(selectedOrder.ReqDesc),
            reqId: selectedOrder.RequirementId,
            reqImpl: encode_utf8(selectedOrder.ReqImpl),
            reqName: selectedOrder.RequirementName,
            reqToolTip: "",
          });
        }
      } else if (selectedOrder.RequirementId) {
        temp2?.ActivityProperty?.m_objPMRequirementDetails?.reqList.push({
          priority: +selectedOrder.SectionLevel + 1,
          reqDesc: encode_utf8(selectedOrder.ReqDesc),
          reqId: selectedOrder.RequirementId,
          reqImpl: encode_utf8(selectedOrder.ReqImpl),
          reqName: selectedOrder.RequirementName,
          reqToolTip: "",
        });
      }
      setlocalLoadedActivityPropertyData(temp2);
    }
  }, [selectedOrder]);

  if (isLoading) {
    return <CircularProgress className="circular-progress" />;
  } else {
    if (sections?.length === 0)
      return (
        <div
          style={{
            height: "75vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {t("addRequirementFirst")}
        </div>
      );
    return (
      <>
        <TabsHeading heading={props.heading} />
        <div
          style={{
            display: "flex",
            height: fromArea === "activityLevel" ? "60vh" : "100%",
          }}
        >
          {props.isDrawerExpanded || fromArea === "ProcessLevel" ? (
            <div className={classes.root}>
              <p
                style={{
                  fontSize: "var(--subtitle_text_font_size)",
                  fontWeight: "700",
                  backgroundColor: "white",
                  padding:
                    fromArea === "activityLevel"
                      ? "1rem 0.5vw 0.5rem"
                      : "0 0 0 8px",
                }}
              >
                {t("sections")}
              </p>
              <div
                className={fromArea === "activityLevel" ? "activitySecDiv" : ""}
                // changes added for bug_id: 134226
                style={{
                  height:
                    fromArea === "activityLevel"
                      ? null
                      : `calc(${windowInnerHeight}px - ${APP_HEADER_HEIGHT} - 14rem)`,
                  overflowY: fromArea === "activityLevel" ? null : "auto",
                }}
              >
                {sections?.map((sec) => {
                  return (
                    <Accordion
                      onClick={() => {
                        setSelectedOrder({
                          Attachment: sec.Attachment,
                          ReqDesc: sec.ReqDesc,
                          ReqImpl: sec.ReqImpl,
                          RequirementId: sec.RequirementId,
                          RequirementName: sec.RequirementName,
                          SectionLevel: "0",
                        });
                        // added on 20/10/23 for BugId 139684
                        setOriginalSelOrder({
                          Attachment: sec.Attachment,
                          ReqDesc: sec.ReqDesc,
                          ReqImpl: sec.ReqImpl,
                          RequirementId: sec.RequirementId,
                          RequirementName: sec.RequirementName,
                          SectionLevel: "0",
                        });
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          setSelectedOrder({
                            Attachment: sec.Attachment,
                            ReqDesc: sec.ReqDesc,
                            ReqImpl: sec.ReqImpl,
                            RequirementId: sec.RequirementId,
                            RequirementName: sec.RequirementName,
                            SectionLevel: "0",
                          });
                          // added on 20/10/23 for BugId 139684
                          setOriginalSelOrder({
                            Attachment: sec.Attachment,
                            ReqDesc: sec.ReqDesc,
                            ReqImpl: sec.ReqImpl,
                            RequirementId: sec.RequirementId,
                            RequirementName: sec.RequirementName,
                            SectionLevel: "0",
                          });
                          e.stopPropagation();
                        }
                      }}
                    >
                      <AccordionSummary
                        style={{
                          flexDirection: "row-reverse",
                          backgroundColor:
                            sec.RequirementId == selectedOrder?.RequirementId
                              ? "#0072C626"
                              : "white",
                          fontWeight:
                            sec.RequirementId == selectedOrder?.RequirementId
                              ? "600"
                              : "400",
                        }}
                        expandIcon={
                          <ArrowRightIcon
                            style={{
                              width: "1.5rem",
                              height: "1.5rem",
                              transform: "rotate(90deg)",
                            }}
                          />
                        }
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                      >
                        <Typography className={classes.heading}>
                          {
                            //sec.RequirementName
                          }

                          <LightTooltip
                            id="section_Tooltip"
                            arrow={true}
                            enterDelay={500}
                            placement="bottom-start"
                            title={sec.RequirementName}
                          >
                            <span className="tooltipText">
                              {width < breakpoint
                                ? shortenRuleStatement(sec.RequirementName, 9)
                                : shortenRuleStatement(sec.RequirementName, 12)}
                            </span>
                          </LightTooltip>
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails
                        onClick={() => handleAccordionClick()}
                        style={{
                          backgroundColor: props.isActive ? "#0072C626" : "",
                        }}
                      >
                        {sec?.InnerRequirement?.length > 0 && (
                          <Typography>
                            {sec?.InnerRequirement?.map((secInner) => {
                              return (
                                <Accordion
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedOrder({
                                      Attachment: secInner.Attachment,
                                      ReqDesc: secInner.ReqDesc,
                                      ReqImpl: secInner.ReqImpl,
                                      RequirementId: secInner.RequirementId,
                                      RequirementName: secInner.RequirementName,
                                      SectionLevel: "1",
                                    });
                                    // added on 20/10/23 for BugId 139684
                                    setOriginalSelOrder({
                                      Attachment: secInner.Attachment,
                                      ReqDesc: secInner.ReqDesc,
                                      ReqImpl: secInner.ReqImpl,
                                      RequirementId: secInner.RequirementId,
                                      RequirementName: secInner.RequirementName,
                                      SectionLevel: "1",
                                    });
                                  }}
                                  style={{ width: "15rem" }}
                                >
                                  <AccordionSummary
                                    style={{
                                      flexDirection: "row-reverse",
                                      backgroundColor:
                                        secInner.RequirementId ==
                                        selectedOrder?.RequirementId
                                          ? "#0072C626"
                                          : "white",
                                      fontWeight:
                                        sec.RequirementId ==
                                        selectedOrder?.RequirementId
                                          ? "600"
                                          : "400",
                                      width: "15rem",
                                    }}
                                    expandIcon={
                                      <ArrowRightIcon
                                        style={{
                                          width: "1.5rem",
                                          height: "1.5rem",
                                          transform: "rotate(90deg)",
                                        }}
                                      />
                                    }
                                    aria-controls="panel1a-content"
                                    id="panel1a-header"
                                  >
                                    {/* Changes on 07-09-2023 to resolve the bug Id 136203 */}
                                    {/* <Typography className={classes.heading}>
                                      {secInner.RequirementName}
                                    </Typography> */}
                                    <Typography className={classes.heading}>
                                      {
                                        //sec.RequirementName
                                      }

                                      <LightTooltip
                                        id="section_Tooltip"
                                        arrow={true}
                                        enterDelay={500}
                                        placement="bottom-start"
                                        title={secInner.RequirementName}
                                      >
                                        <span className="tooltipText">
                                          {width < breakpoint
                                            ? shortenRuleStatement(
                                                secInner.RequirementName,
                                                9
                                              )
                                            : shortenRuleStatement(
                                                secInner.RequirementName,
                                                12
                                              )}
                                        </span>
                                      </LightTooltip>
                                    </Typography>
                                  </AccordionSummary>
                                  <AccordionDetails
                                    onClick={() => handleAccordionClick()}
                                    style={{
                                      backgroundColor: props.isActive
                                        ? "#0072C626"
                                        : "",
                                    }}
                                  >
                                    <Typography>
                                      {secInner?.InnerRequirement2?.map(
                                        (el) => {
                                          return (
                                            <Accordion
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedOrder({
                                                  SectionLevel: "2",
                                                  Attachment: el.Attachment,
                                                  ReqDesc: el.ReqDesc,
                                                  ReqImpl: el.ReqImpl,
                                                  RequirementId:
                                                    el.RequirementId,
                                                  RequirementName:
                                                    el.RequirementName,
                                                });
                                                // added on 20/10/23 for BugId 139684
                                                setOriginalSelOrder({
                                                  SectionLevel: "2",
                                                  Attachment: el.Attachment,
                                                  ReqDesc: el.ReqDesc,
                                                  ReqImpl: el.ReqImpl,
                                                  RequirementId:
                                                    el.RequirementId,
                                                  RequirementName:
                                                    el.RequirementName,
                                                });
                                              }}
                                              style={{ width: "13rem" }}
                                            >
                                              <AccordionSummary
                                                style={{
                                                  flexDirection: "row-reverse",
                                                  backgroundColor:
                                                    el.RequirementId ==
                                                    selectedOrder?.RequirementId
                                                      ? "#0072C626"
                                                      : "white",
                                                  fontWeight:
                                                    sec.RequirementId ==
                                                    selectedOrder?.RequirementId
                                                      ? "600"
                                                      : "400",
                                                  width: "14rem",
                                                }}
                                                expandIcon={
                                                  <ArrowRightIcon
                                                    style={{
                                                      width: "1.5rem",
                                                      height: "1.5rem",
                                                      transform:
                                                        "rotate(90deg)",
                                                    }}
                                                  />
                                                }
                                                aria-controls="panel1a-content"
                                                id="panel1a-header"
                                              >
                                                {/* Changes on 07-09-2023 to resolve the bug Id 136203 */}
                                                {/* <Typography
                                                  className={classes.heading}
                                                >
                                                  {el.RequirementName ||
                                                    "Inner2"}
                                                </Typography> */}
                                                <Typography
                                                  className={classes.heading}
                                                >
                                                  {
                                                    //sec.RequirementName
                                                  }

                                                  <LightTooltip
                                                    id="section_Tooltip"
                                                    arrow={true}
                                                    enterDelay={500}
                                                    placement="bottom-start"
                                                    title={el.RequirementName}
                                                  >
                                                    <span className="tooltipText">
                                                      {width < breakpoint
                                                        ? shortenRuleStatement(
                                                            el.RequirementName,
                                                            9
                                                          )
                                                        : shortenRuleStatement(
                                                            el.RequirementName,
                                                            12
                                                          )}
                                                    </span>
                                                  </LightTooltip>
                                                </Typography>
                                              </AccordionSummary>
                                              <AccordionDetails
                                                onClick={() =>
                                                  handleAccordionClick()
                                                }
                                                style={{
                                                  backgroundColor:
                                                    props.isActive
                                                      ? "#0072C626"
                                                      : "",
                                                }}
                                              ></AccordionDetails>
                                            </Accordion>
                                          );
                                        }
                                      )}
                                    </Typography>
                                  </AccordionDetails>
                                </Accordion>
                              );
                            })}
                          </Typography>
                        )}
                      </AccordionDetails>
                    </Accordion>
                  );
                })}
              </div>
            </div>
          ) : null}
          <div
            style={{
              padding: props.isDrawerExpanded ? "0.5rem 1vw" : "0px",
              backgroundColor: "white",
              width: props.isDrawerExpanded ? "80%" : "100%",
              marginTop: "4px",
              overflowY: fromArea === "activityLevel" ? "auto" : "scroll",
              // height: fromArea === "activityLevel" ? "60vh" : "74vh",
              height:
                fromArea === "activityLevel"
                  ? "60vh"
                  : `calc(${windowInnerHeight}px - ${APP_HEADER_HEIGHT} - 12rem)`,
              scrollbarColor: "#dadada #fafafa",
              scrollbarWidth: "thin",
            }}
          >
            <RightSection
              completeSections={sections}
              setSections={setSections}
              selectedOrder={selectedOrder}
              originalSelOrder={originalSelOrder} // added on 20/10/23 for BugId 139684
              setSelectedOrder={setSelectedOrder}
              fromArea={fromArea}
              isReadOnly={isReadOnly}
            />
          </div>
        </div>
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    isDrawerExpanded: state.isDrawerExpanded.isDrawerExpanded,
  };
};

export default connect(mapStateToProps)(ProcessRequirements);
