import React from "react";
import CategoryHeader from "./CategoryHeader";
import CategoryTemplatesList from "./CategoryTemplatesList";

function CategoryDetailedView(props) {
  return (
    <div>
      <CategoryHeader
        selectedCategoryDetails={props.selectedCategoryDetails}
        categoryList={props.categoryList}
        setCategoryList={props.setCategoryList}
      />
      <CategoryTemplatesList
        selectedCategoryDetails={props.selectedCategoryDetails}
        categoryList={props.categoryList}
        setCategoryList={props.setCategoryList}
      />
    </div>
  );
}
export default CategoryDetailedView;
