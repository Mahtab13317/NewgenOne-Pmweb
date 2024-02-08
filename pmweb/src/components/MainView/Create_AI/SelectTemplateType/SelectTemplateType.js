import { Divider, Grid, makeStyles } from "@material-ui/core";
import React from "react";
import { useTranslation } from "react-i18next";
import CreateProcessByAI from "../CreateProcessByAI/CreateProcessByAI";
import CreateProcessByPMWebTemplate from "../CreateProcessByPMWebTemplate/CreateProcessByPMWebTemplate";

const useStyles = makeStyles((theme) => ({
  hr: {
    height: "100%",
    width: "1px",
    margin: "auto",
    backgroundColor: "#696969",
    position: "relative",
  },
  orDiv: {
    backgroundColor: "#FFF",
    boxShadow: "0px 0px 4px rgba(0, 0, 0, 0.25)",
    width: "2.75vw",
    height: "2.75vw",
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "#252525",
    fontFamily: "var(--font_family)",
    fontSize: "14px",
    fontStyle: "normal",
    fontWeight: "600",
    lineHeight: "normal",
  },
  orContainer: {
    border: "2px solid #F7F7F7",
    background: "#F7F7F7",
    position: "absolute",
    top: "50%",
    left: "48.25%",
    width: "3.5vw",
    height: "4.25vw",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  itemContainer: {
    height: "98%",
  },
}));

const SelectTemplateType = (props) => {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const styles = useStyles({ direction });

  const {
    data,
    handleClickProcess,
    categoryList,
    handleViewAllClick,
    setModalClicked,
    setSelectedTemplate,
    cancelHandler = () => {
      console.log("provide cancel handler fn");
    },
    setShowAIProcessCreation = () => {
      console.log("provide setShowAIProcessCreation fn");
    },
  } = props;

  return (
    <Grid container style={{ flexWrap: "nowrap" }}>
      {/* //Create Process By AI */}
      <Grid
        container
        item
        className={styles.itemContainer}
        style={{ flex: "3" }}
      >
        <Grid item xs={window.innerWidth > 820 ? 4 : 0}></Grid>
        <Grid
          item
          xs={window.innerWidth > 820 ? 8 : 12}
          style={{ height: "100%" }}
          role="grid"
          aria-label="Create Process By AI"
        >
          <CreateProcessByAI
            data={JSON.parse(JSON.stringify(data || {}))}
            ClickProcess={handleClickProcess}
            cancelHandler={cancelHandler}
            setShowAIProcessCreation={setShowAIProcessCreation}
          />
        </Grid>
      </Grid>
      {/* //OR */}
      <Grid
        container
        item
        className={styles.itemContainer}
        style={{ flex: "0.3" }}
      >
        <Divider className={styles.hr} data-testid="divider" />
        <div className={styles.orContainer}>
          <div className={styles.orDiv} aria-label="OR" role="banner">
            OR
          </div>
        </div>
      </Grid>
      {/* //Create Process By PMWeb Templates */}
      <Grid
        item
        container
        className={styles.itemContainer}
        style={{ flex: "3" }}
      >
        <Grid
          item
          xs={window.innerWidth > 820 ? 8 : 12}
          style={{ height: "100%" }}
          aria-label="Create Process By PMWeb Templates"
          role="grid"
        >
          <CreateProcessByPMWebTemplate
            categoryList={categoryList}
            handleViewAllClick={handleViewAllClick}
            setModalClicked={setModalClicked}
            setSelectedTemplate={setSelectedTemplate}
          />
        </Grid>
        <Grid item xs={window.innerWidth > 820 ? 4 : 0}></Grid>
      </Grid>
    </Grid>
  );
};

export default SelectTemplateType;
