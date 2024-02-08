import React, { useState, useEffect } from "react";
import styles from "../ServiceCatalog/Webservice/index.module.css";
import arabicStyles from "../ServiceCatalog/Webservice/arabicStyles.module.css";
import SearchComponent from "../../../../../UI/Search Component/index";
import { useTranslation } from "react-i18next";
import "../ServiceCatalog/index.css";
import { Grid } from "@material-ui/core";
import {
  STATE_CREATED,
  RTL_DIRECTION,
  BASE_URL,
  APP_HEADER_HEIGHT,
} from "../../../../../Constants/appConstants";
import axios from "axios";
import { connect, useSelector } from "react-redux";
import { CircularProgress } from "@material-ui/core";
import { containsText } from "../../../../../utility/CommonFunctionCall/CommonFunctionCall";
import CommonListItem from "../ServiceCatalog/Common Components/CommonListItem";
import NoBusinessFuncScreen from "./NoBusinessFuncScreen";

function BusinessFunction(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const [businessFunction, setBusinessFunction] = useState([]);
  const [spinner, setspinner] = useState(true);
  const [selected, setSelected] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [inputDataObjects, setInputDataObjects] = useState([]);
  const [outputDataObjects, setOutputDataObjects] = useState([]);
  const [loader, setLoader] = useState(false);
  const windowInnerHeight = useSelector(
    (state) => state.setWindowInnerHeight.windowInnerHeight
  );

  useEffect(() => {
    axios
      .get(BASE_URL + `/customRestApi/getRestEndPoints/A`)
      .then((res) => {
        if (res.data) {
          setspinner(false);
          let businessFunctions = [...res.data];
          setBusinessFunction(businessFunctions);
          if (businessFunctions?.length > 0 && !selected) {
            selectionFunc(businessFunctions[0]);
          }
        }
      })
      .catch((err) => {
        console.log(err);
        setspinner(false);
      });
  }, []);

  const selectionFunc = (item) => {
    setSelected(item);
    // modified on 20/10/23 for BugId 139682
    /*
    const SavedData = {
      current: [
        {
          id: item.serialNo,
          name: item.restEndPoint,
          url: item.url,
          type: item.type,
          // modified on 05/10/23 for BugId 138638
          // input: [...item.input],
          // output: [...item.output],
          input: item?.input && item?.input?.length > 0 ? [...item.input] : [],
          output:
            item?.output && item?.output?.length > 0 ? [...item.output] : [],
        },
      ],
    };
    let passedData = {
      isMF: true,
      functionName: { current: item?.restEndPoint },
      endpointURL: { current: item?.url },
      // modified on 05/10/23 for BugId 138638
      // inputDataObjects: [...item.input],
      inputDataObjects:
        item?.input && item?.input?.length > 0 ? [...item.input] : [],
      setInputDataObjects: setInputDataObjects,
      // modified on 05/10/23 for BugId 138638
      // outputDataObjects: [...item.output],
      outputDataObjects:
        item?.output && item?.output?.length > 0 ? [...item.output] : [],
      setOutputDataObjects: setOutputDataObjects,
      isDefineParameters: true,
      setIsDefineParameters: () => {},
      savedCustomCode: SavedData,
      prevValue: [],
      parentId: item?.parentId,
      parentType: item?.parentType,
      formId: item?.formId,
      formType: item?.formType,
      processStatus: item?.processStatus,
      readOnlyFields: true,
    };
    window.loadFormBusinessFuncPMWEB("mf_businessFunctions_pmweb", passedData);
    */
    setLoader(true);
    let inputData = [],
      outputData = [],
      stateType = undefined,
      parentId = item?.parentId,
      processStatus = item?.processStatus,
      serialNo = item?.serialNo,
      restEndPoint = item?.restEndPoint,
      url = item?.url,
      type = item?.type,
      parentType = item?.parentType,
      formId = item?.formId,
      formType = item?.formType;
    axios
      .get(
        BASE_URL +
          `/customRestApi/getRestEndPoint/${item?.restEndPoint}/${item?.parentId}/${item?.formId}`
      )
      .then((res) => {
        inputData =
          res?.data?.input && res?.data?.input?.length > 0
            ? [...res.data.input]
            : [];
        outputData =
          res?.data?.output && res?.data?.output?.length > 0
            ? [...res.data.output]
            : [];
        // added on 03/11/23 for BugId 138638
        if (res?.data?.stateType) {
          stateType = res?.data?.stateType;
        }
        parentId = res?.data?.parentId;
        processStatus = res?.data?.processStatus;
        serialNo = res?.data?.serialNo;
        restEndPoint = res?.data?.restEndPoint;
        url = res?.data?.url;
        type = res?.data?.type;
        parentType = res?.data?.parentType;
        formId = res?.data?.formId;
        formType = res?.data?.formType;
        setLoader(false);

        const SavedData = {
          current: [
            {
              id: serialNo,
              name: restEndPoint,
              url: url,
              type: type,
              // modified on 05/10/23 for BugId 138638
              // input: [...item.input],
              // output: [...item.output],
              input: inputData,
              output: outputData,
              stateType: stateType,
            },
          ],
        };
        let passedData = {
          isMF: true,
          functionName: { current: restEndPoint },
          endpointURL: { current: url },
          // modified on 05/10/23 for BugId 138638
          // inputDataObjects: [...item.input],
          inputDataObjects: inputData,
          setInputDataObjects: setInputDataObjects,
          // modified on 05/10/23 for BugId 138638
          // outputDataObjects: [...item.output],
          outputDataObjects: outputData,
          setOutputDataObjects: setOutputDataObjects,
          isDefineParameters: true,
          setIsDefineParameters: () => {},
          savedCustomCode: SavedData,
          prevValue: [],
          parentId: parentId,
          parentType: parentType,
          formId: formId,
          formType: formType,
          processStatus: processStatus,
          readOnlyFields: true,
          // added on 03/11/23 for BugId 138638
          stateType: stateType,
        };
        window.loadFormBusinessFuncPMWEB(
          "mf_businessFunctions_pmweb",
          passedData
        );
      })
      .catch((err) => {
        console.log(err);
        setLoader(false);
      });
    // till here BugId 139682
  };

  const filteredRows = businessFunction?.filter(
    (el) =>
      containsText(el.restEndPoint, searchTerm) || el.status === STATE_CREATED
  );

  return (
    <div className={styles.mainWrappingDiv}>
      {spinner ? (
        <CircularProgress
          style={{ marginTop: "30vh", marginInlineStart: "50%" }}
        />
      ) : (
        <React.Fragment>
          {businessFunction?.length > 0 ? (
            <React.Fragment>
              <div
                className={styles.mainDiv}
                // added on 20/10/23 for BugId 139682
                style={{
                  height: `calc(${windowInnerHeight}px - ${APP_HEADER_HEIGHT} - 5rem)`,
                }}
              >
                <Grid
                  container
                  xs={12}
                  spacing={1}
                  justifyContent="space-between"
                >
                  <Grid item xs={6} md={4}>
                    <div className={styles.listDiv} style={{ height: "100%" }}>
                      <div className={styles.listHeader}>
                        <p
                          className={
                            direction === RTL_DIRECTION
                              ? arabicStyles.listHeading
                              : styles.listHeading
                          }
                        >
                          {t("businessFunctions")}
                        </p>
                      </div>
                      <div className={styles.searchHeader}>
                        <div style={{ flex: "1" }}>
                          <SearchComponent
                            width="90%"
                            height="var(--line_height)"
                            onSearchChange={(val) => setSearchTerm(val)}
                            clearSearchResult={() => setSearchTerm("")}
                          />
                        </div>
                      </div>
                      {filteredRows?.length > 0 ? (
                        <div
                          className={styles.webS_ListDiv}
                          style={{
                            height: "65vh",
                          }}
                        >
                          {filteredRows?.map((item, index) => {
                            return (
                              <CommonListItem
                                itemName={item.restEndPoint}
                                id={`pmweb_businessFunc_listItem${index}`}
                                onClickFunc={() => selectionFunc(item)}
                                isSelected={
                                  selected?.serialNo === item.serialNo
                                }
                                fontWeight="600"
                              />
                            );
                          })}
                        </div>
                      ) : businessFunction?.length > 0 ? (
                        "No search result"
                      ) : null}
                    </div>
                  </Grid>
                  <Grid item xs={6} md={8}>
                    <div
                      className={styles.formDiv}
                      // added on 20/10/23 for BugId 139682
                      style={{ height: "100%" }}
                      id="mf_businessFunctions_pmweb"
                    >
                      {/* modified on 20/10/23 for BugId 139682 */}
                      {loader ? (
                        <div
                          style={{
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <CircularProgress />
                        </div>
                      ) : null}
                    </div>
                  </Grid>
                </Grid>
              </div>
            </React.Fragment>
          ) : (
            <NoBusinessFuncScreen />
          )}
        </React.Fragment>
      )}
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    openProcessID: state.openProcessClick.selectedId,
    openProcessType: state.openProcessClick.selectedType,
  };
};

export default connect(mapStateToProps)(BusinessFunction);
