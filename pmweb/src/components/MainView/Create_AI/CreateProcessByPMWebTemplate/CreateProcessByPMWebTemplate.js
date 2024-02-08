import { Grid, makeStyles, MenuItem, Typography } from "@material-ui/core";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { RTL_DIRECTION } from "../../../../Constants/appConstants";
import CustomizedDropdown from "../../../../UI/Components_With_ErrrorHandling/Dropdown";
import SingleTemplateCard from "../../../../UI/SingleTemplateCard";
import "../../Create/CreateProcessByTemplateArabic.css";
import "../../Create/CreateProcessbyTemplate.css";
import * as actionCreators_template from "../../../../redux-store/actions/Template";
import { connect, useSelector } from "react-redux";
import clsx from "clsx";

const useStyles = makeStyles(() => ({
  PMWebTemplateOuterContainer: {
    borderRadius: "4px",
    height: "100%",
    background: "#FFF",
    boxShadow: "0px 0px 4px 0px rgba(0, 0, 0, 0.25)",
  },
  PMWebTemplateInnerContainer: {
    direction: (props) => props.direction,
    flexDirection: "column",
    flexWrap: "nowrap",
    padding: "0.75rem 0 0",
  },
  chooseTemplateHeading: {
    color: "#000",
    fontFamily: "var(--font_family)",
    fontSize: "14px",
    fontStyle: "normal",
    fontWeight: "600",
    lineHeight: "normal",
    padding: "0 1vw",
  },
  viewAllTemplateField: {
    color: "var(--link_color)",
    cursor: "pointer",
    font: "normal normal 600 12px/17px var(--font_family) !important",
    textAlign: (props) =>
      props.direction === RTL_DIRECTION ? "right" : "left",
  },
  processCreationRightPanel: {
    overflowY: "auto",
    overflowX: "hidden",
    width: "100%",
  },
  row: {
    display: "flex",
    flexDirection: "row",
    margin: 0,
  },
  Overflow: {
    overflow: "auto",
    height: (props) => `calc(${props.windowInnerHeight}px - 17rem)`,
    paddingInlineStart: "1vw",
    boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)",
    borderRadius: "2px",
  },
  menuItem: {
    font: "normal normal normal var(--base_text_font_size) / 17px var(--font_family) !important",
    color: "#000000",
    width: "100%",
    padding: "0.5rem 0.5vw",
    margin: "0",
    height: "var(--line_height)",
  },
}));

const CreateProcessByPMWebTemplate = (props) => {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const windowInnerHeight = useSelector(
    (state) => state.setWindowInnerHeight.windowInnerHeight
  );
  const styles = useStyles({ direction, windowInnerHeight });
  const {
    categoryList,
    handleViewAllClick,
    setModalClicked,
    setSelectedTemplate,
  } = props;

  const [dropdownValue, setDropdownValue] = useState("All Categories");
  const onChange = (e) => {
    setDropdownValue(e.target.value);
  };

  return (
    <Grid container className={styles.PMWebTemplateOuterContainer}>
      <Grid container className={styles.PMWebTemplateInnerContainer}>
        <Grid item>
          <p
            className={`custom-test-class ${styles.chooseTemplateHeading}`}
            style={{ direction: direction }}
            
          >
            {t("chooseTemplate")}
          </p>
        </Grid>
        <Grid
          item
          container
          justifyContent="space-between"
          alignItems="center"
          style={{ padding: "0.75rem 1vw" }}
        >
          {/* //Dropdown */}
          <Grid item>
            <CustomizedDropdown
              variant="outlined"
              defaultValue={"All Categories"}
              isNotMandatory={true}
              value={dropdownValue}
              onChange={onChange}
              style={{
                //border: "none",
                minWidth: "15vw",
                borderRadius: "2px",
              }}
              id="pmweb_CreateProcessByPMWebTemplate_selectCategory"
              hideDefaultSelect={true}
              ariaLabel="Choose Template"
            >
              <MenuItem
                value={"All Categories"}
                className={styles.menuItem}
                style={{
                  justifyContent:
                    direction === RTL_DIRECTION ? "right" : "left",
                }}
              >
                {t("allCategories")}
              </MenuItem>
              {categoryList?.map((category, index) => {
                return (
                  <MenuItem
                    key={index}
                    value={category.CategoryName}
                    className={styles.menuItem}
                    style={{
                      justifyContent:
                        direction === RTL_DIRECTION ? "right" : "left",
                    }}
                  >
                    {category.CategoryName}
                  </MenuItem>
                );
              })}
            </CustomizedDropdown>
          </Grid>
          {/* //View All the templates */}
          <Grid item>
            <Typography
              className={styles.viewAllTemplateField}
              onClick={handleViewAllClick}
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && handleViewAllClick()}
              data-testid= "View-All-Templates"
            >
              {t("viewall")} {t("")}
              {t("templates")}
            </Typography>
          </Grid>
        </Grid>
        {/**Templates List */}
        <Grid item container className={clsx(styles.row, styles.Overflow)}>
          <Grid container className={styles.processCreationRightPanel}>
            {categoryList?.map((category, i) => {
              return (
                <>
                  {dropdownValue === "All Categories" ||
                  category.CategoryName === dropdownValue ? (
                    <>
                      {category.Templates?.map((template) => {
                        return (
                          <SingleTemplateCard
                            item={template}
                            showCategory={true}
                            categoryName={category.CategoryName}
                            style={{
                              width: "29vw",
                              height: "fit-content",
                              marginRight: "0",
                            }}
                            cardDescStyle={{
                              margin: "0.75rem 0 1.5rem",
                              minHeight: "0",
                            }}
                            mileStoneTempStyle={{
                              minHeight: "0",
                              padding: "0 1vw 1.75rem",
                            }}
                            cardFooter={{
                              background: "#fff",
                              boxShadow: "0px 0px 4px 0px rgba(0, 0, 0, 0.25)",
                              position: "unset",
                              height: "3rem",
                            }}
                            templateName={template.Name}
                            templateId={template.Id}
                            bUseTemplateBtn={true}
                            useTemplateFunc={() => {
                              props.setTemplateDetails(
                                null,
                                null,
                                false,
                                null,
                                null,
                                false,
                                "",
                                []
                              );
                              setSelectedTemplate(template);
                              setModalClicked(true);
                            }}
                          />
                        );
                      })}
                    </>
                  ) : null}
                </>
              );
            })}
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

const mapDispatchToProps = (dispatch) => {
  return {
    setTemplateDetails: (
      category,
      view,
      createBtnClick,
      template,
      projectName,
      isProjectNameConstant,
      processName,
      files
    ) =>
      dispatch(
        actionCreators_template.setTemplateDetails(
          category,
          view,
          createBtnClick,
          template,
          projectName,
          isProjectNameConstant,
          processName,
          files
        )
      ),
    setTemplatePage: (value) =>
      dispatch(actionCreators_template.storeTemplatePage(value)),
  };
};

const mapStateToProps = (state) => {
  return {
    getTemplatePage: state.templateReducer.template_page,
    CreateProcessFlag: state.createProcessFlag.clickedCreateProcess,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CreateProcessByPMWebTemplate);
