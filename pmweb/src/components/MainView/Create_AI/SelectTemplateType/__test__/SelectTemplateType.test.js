import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import userEvent from "@testing-library/user-event";
import SelectTemplateType from "../SelectTemplateType";
import CustomTestComponent from "../../utils/CustomTestComponent";
import secureLocalStorage from "react-secure-storage";

//mocking react-secure-storage
jest.mock("react-secure-storage", () => ({
  set: jest.fn(),
  get: jest.fn(),
  remove: jest.fn(),
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

describe("renders SelectTemplateType component correctly", () => {
  const mockData = {
    processName: "Test Process",
    category: "Test Category",
    geography: "Test Geography",
    additional: "Test Additional",
  };

  const mockCategoryList = [
    {
      CategoryName: "Category1",
      Templates: [
        { Id: 1, Name: "Template1" },
        { Id: 2, Name: "Template2" },
      ],
    },
    {
      CategoryName: "Category2",
      Templates: [
        { Id: 3, Name: "Template3" },
        { Id: 4, Name: "Template4" },
      ],
    },
  ];
  it("renders without crashing", () => {
    render(
      <CustomTestComponent>
        <SelectTemplateType />
      </CustomTestComponent>
    );
  });

  it("renders CreateProcessByAI component correctly", () => {
    render(
      <CustomTestComponent>
        <SelectTemplateType
          data={mockData}
          handleClickProcess={jest.fn()}
          categoryList={mockCategoryList}
          handleViewAllClick={jest.fn()}
          setModalClicked={jest.fn()}
          setSelectedTemplate={jest.fn()}
        />
      </CustomTestComponent>
    );
    expect(
      screen.getByRole("grid", { name: "Create Process By AI" })
    ).toBeInTheDocument();
  });
  it("render CreateProcessByPMWebTemplate component correctly", () => {
    render(
      <CustomTestComponent>
        <SelectTemplateType
          data={mockData}
          handleClickProcess={jest.fn()}
          categoryList={mockCategoryList}
          handleViewAllClick={jest.fn()}
          setModalClicked={jest.fn()}
          setSelectedTemplate={jest.fn()}
        />
      </CustomTestComponent>
    );
    expect(
      screen.getByRole("grid", { name: "Create Process By PMWeb Templates" })
    ).toBeInTheDocument();
  });
  it("render Divider and OR component correctly", () => {
    render(
      <CustomTestComponent>
        <SelectTemplateType
          data={mockData}
          handleClickProcess={jest.fn()}
          categoryList={mockCategoryList}
          handleViewAllClick={jest.fn()}
          setModalClicked={jest.fn()}
          setSelectedTemplate={jest.fn()}
        />
      </CustomTestComponent>
    );
    expect(screen.getByRole("banner", { name: "OR" })).toBeInTheDocument();
    expect(screen.getByTestId("divider")).toBeInTheDocument();
  });
});
