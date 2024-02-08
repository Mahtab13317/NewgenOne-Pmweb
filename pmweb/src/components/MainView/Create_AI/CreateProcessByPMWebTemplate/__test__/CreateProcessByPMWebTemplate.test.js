import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import CreateProcessByPMWebTemplate from "../CreateProcessByPMWebTemplate";
import { cleanup } from "@testing-library/react";
import secureLocalStorage from "react-secure-storage";
import { useTranslation } from "react-i18next";
import SunTextEditor from "../../../../../UI/SunEditor/SunTextEditor";
import Slider from "react-slick";
import CustomTestComponent from "../../utils/CustomTestComponent";
import { Typography, makeStyles } from "@material-ui/core";
import { RTL_DIRECTION } from "../../../../../Constants/appConstants";
import CustomizedDropdown from "../../../../../UI/Components_With_ErrrorHandling/Dropdown";
import userEvent from "@testing-library/user-event";

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
    fontFamily: "Open Sans",
    fontSize: "14px",
    fontStyle: "normal",
    fontWeight: "600",
    lineHeight: "normal",
    padding: "0 1vw",
  },
  viewAllTemplateField: {
    color: "var(--link_color)",
    cursor: "pointer",
    font: "normal normal 600 12px/17px Open Sans !important",
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
const TestComponent = ({ handleViewAllClick, categoryList, dropdownValue }) => {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const styles = useStyles();
  return (
    <CreateProcessByPMWebTemplate
      direction={direction}
      styles={styles}
      handleViewAllClick={handleViewAllClick}
      categoryList={categoryList}
      dropdownValue={"All Categories"}
    ></CreateProcessByPMWebTemplate>
  );
};

//mocking react-secure-storage
jest.mock("react-secure-storage", () => ({
  set: jest.fn(),
  get: jest.fn(),
  remove: jest.fn(),
}));

// Mocking Sun Editor
jest.mock("suneditor-react", () => ({
  create: jest.fn(),
}));

// Mock the entire "suneditor/src/plugins" module
jest.mock("suneditor/src/plugins", () => ({
  align: jest.fn(),
  fontColor: jest.fn(),
  hiliteColor: jest.fn(),
  list: jest.fn(),
  formatBlock: jest.fn(),
  textStyle: jest.fn(),
  image: jest.fn(),
  table: jest.fn(),
  fontSize: jest.fn(),
  font: jest.fn(),
  lineHeight: jest.fn(),
  link: jest.fn(),
  audio: jest.fn(),
  video: jest.fn(),
  math: jest.fn(),
  paragraphStyle: jest.fn(),
}));

jest.mock("react-slick", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

afterEach(cleanup);

describe("Create Process By PMWeb Template", () => {
  it("renders without crashing", () => {
    render(
      <CustomTestComponent>
        <TestComponent />
      </CustomTestComponent>
    );
  });

  describe("Choose Template", () => {
    it("renders the heading with the correct text", () => {
      const { getByText } = render(
        <CustomTestComponent>
          <TestComponent />
        </CustomTestComponent>
      );

      const headingElement = getByText("chooseTemplate");
      expect(headingElement).toBeInTheDocument();
      // expect(headingElement).toHaveClass("custom-test-class");
    });

    it("renders correct styles", () => {
      const { getByText } = render(
        <CustomTestComponent>
          <TestComponent />
        </CustomTestComponent>
      );

      const headingElement = getByText("chooseTemplate");
      const styles = getComputedStyle(headingElement);
      expect(styles.fontFamily).toBe("var(--font_family)");
      expect(styles.fontSize).toBe("14px");
      expect(styles.color).toBe("rgb(0, 0, 0)");
      expect(styles.fontStyle).toBe("normal");
      expect(styles.fontWeight).toBe("600");
    });
  });

  describe("CustomizedDropdown", () => {
    const categoryList = [
      { CategoryName: "All Categories" },
      { CategoryName: "Default" },
    ];

    it("renders the dropdown with default and custom options", () => {
      const onChangeMock = jest.fn();

      render(
        <CustomTestComponent>
          <CustomizedDropdown
            variant="outlined"
            defaultValue={"All Categories"}
            isNotMandatory={true}
            value="All Categories"
            onChange={onChangeMock}
            id="pmweb_CreateProcessByPMWebTemplate_selectCategory"
            hideDefaultSelect={true}
            categoryList={categoryList}
            ariaLabel="Choose Template"
          />
        </CustomTestComponent>
      );

      // Check if the default value is rendered
      expect(
        screen.getByLabelText("Choose Template selected All Categories")
      ).toBeInTheDocument();

      // Open the dropdown
      fireEvent.click(
        screen.getByLabelText("Choose Template selected All Categories")
      );
    });
  });

  describe("View All Template button", () => {
    it("renders correct typography element", () => {
      render(
        <CustomTestComponent>
          <TestComponent />
        </CustomTestComponent>
      );
      const typographyElement = screen.getByTestId("View-All-Templates");
      expect(typographyElement).toBeInTheDocument();
    });

    it("calls handleViewAllClick when clicked", () => {
      const handleViewAllClick = jest.fn();
      render(
        <CustomTestComponent>
          <TestComponent handleViewAllClick={handleViewAllClick} />
        </CustomTestComponent>
      );
      const typographyElement = screen.getByTestId("View-All-Templates");
      fireEvent.click(typographyElement);
      expect(handleViewAllClick).toHaveBeenCalled();
    });
  });

  describe("CategoryList", () => {
    // it("renders Category List", () => {
    //   const categoryList = [
    //     {
    //       CategoryName: "Category1",
    //       Templates: [
    //         { Id: 1, Name: "Template1" },
    //         { Id: 2, Name: "Template2" },
    //       ],
    //     },
    //     {
    //       CategoryName: "Category2",
    //       Templates: [
    //         { Id: 3, Name: "Template3" },
    //         { Id: 4, Name: "Template4" },
    //       ],
    //     },
    //   ];
    //   render(
    //     <CustomTestComponent>
    //       <TestComponent categoryList={categoryList} />
    //     </CustomTestComponent>
    //   );
    //   expect(screen.getByText("Category1")).toBeInTheDocument();
    //   expect(screen.getByText("Category2")).toBeInTheDocument();
    //   // Ensure that the template names are rendered
    //   expect(screen.getByText("Template1")).toBeInTheDocument();
    //   expect(screen.getByText("Template2")).toBeInTheDocument();
    //   expect(screen.getByText("Template3")).toBeInTheDocument();
    //   expect(screen.getByText("Template4")).toBeInTheDocument();
    // });
  });
});
