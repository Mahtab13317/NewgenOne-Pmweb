import React, { useEffect, useState } from "react";
import CategoryDetailedView from "./CategoryDetailedView";
import CategoryListView from "./CategoryListView";
import NoCategorySelectedScreen from "./NoCategorySelectedScreen";
import styles from "./template.module.css";
import axios from "axios";
import {
  ENDPOINT_FETCH_ALL_TEMPLATES,
  RTL_DIRECTION,
  SERVER_URL,
} from "../../../Constants/appConstants";
import { connect } from "react-redux";
import CircularProgress from "@material-ui/core/CircularProgress";
import { useTranslation } from "react-i18next";

function Template(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const [categoryList, setCategoryList] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCategoryDetails, setSelectedCategoryDetails] = useState();
  const [spinner, setSpinner] = useState(false);

  useEffect(() => {
    setSpinner(true);
    axios.get(SERVER_URL + ENDPOINT_FETCH_ALL_TEMPLATES).then((res) => {
      if (res.data.Status === 0) {
        setCategoryList(res.data.Category);
        setSelectedCategory(
          res.data.Category.length > 0 ? res.data.Category[0].CategoryId : null
        );
        if (props.templateCategory) {
          setSelectedCategory(props.templateCategory.CategoryId);
        }
        setSpinner(false);
      }
    });
  }, []);

  useEffect(() => {
    let localCategory = categoryList?.filter((category) => {
      if (category.CategoryId === selectedCategory) {
        return category;
      }
    });
    if (localCategory) {
      setSelectedCategoryDetails(localCategory[0]);
    }
  }, [selectedCategory]);

  return spinner ? (
    <CircularProgress
      style={
        direction === RTL_DIRECTION
          ? { marginTop: "40vh", marginRight: "50%" }
          : { marginTop: "40vh", marginLeft: "50%" }
      }
    />
  ) : (
    <div className={`${styles.templateMainScreen} w100`}>
      <div className={styles.categoryListViewArea}>
        <CategoryListView
          categoryList={categoryList}
          setSelectedCategory={setSelectedCategory}
          setCategoryList={setCategoryList}
          selectedCategory={selectedCategory}
        />
      </div>
      {selectedCategory ? (
        <div className={styles.categoryDetailedViewArea}>
          <CategoryDetailedView
            selectedCategoryDetails={selectedCategoryDetails}
            categoryList={categoryList}
            setCategoryList={setCategoryList}
          />
        </div>
      ) : (
        <NoCategorySelectedScreen />
      )}
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    templateCategory: state.templateReducer.template_category,
  };
};

export default connect(mapStateToProps, null)(Template);
