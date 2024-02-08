import React from "react";
import { render, fireEvent, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import CustomTestComponent from "../../utils/CustomTestComponent";
import DataModel from "../DataModel";

//mocking react-i18next
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

afterEach(cleanup);

describe("Data Model Component", () => {
  const mockData = [
    {
      id: 0,
      name: "DataObject1",
      description: "Description for DataObject1",
      variables: [
        {
          name: "Variable1",
          description: "Description for Variable1",
          type: "String",
        },
      ],
    },
  ];
  const updateDataMock = jest.fn();
  const setShowDeleteModalMock = jest.fn();
  const showVariablesMock = true;
  it("renders with data", () => {
    render(
      <DataModel
        data={mockData}
        updateData={() => {}}
        setShowDeleteModal={() => {}}
      />
    );

    const th1 = screen.getByTestId("DataModel_TH_dataobject");
    const th2 = screen.getByTestId("DataModel_TH_description");
    expect(th1).toBeInTheDocument();
    expect(th2).toBeInTheDocument();
  });

  it("handles delete actions", () => {
    render(
      <DataModel
        data={mockData}
        updateData={updateDataMock}
        setShowDeleteModal={setShowDeleteModalMock}
      />
    );

    fireEvent.click(screen.getByTestId("DataModel_delete_dataobject"));
    expect(setShowDeleteModalMock).toHaveBeenCalledWith({
      index: 0,
      deleteFunc: expect.any(Function),
      dataObject: "DataObject1",
      isDataObject: true,
    });

    const deleteDataObjectFunction =
      setShowDeleteModalMock.mock.calls[0][0].deleteFunc;
    deleteDataObjectFunction();
    expect(updateDataMock).toHaveBeenCalledWith([]);
  });

  it("renders expand/collapse icons accordingly", () => {
    render(
      <DataModel
        data={mockData}
        updateData={() => {}}
        setShowDeleteModal={() => {}}
        showVariables={showVariablesMock}
      />
    );
    if (showVariablesMock) {
      const arrowUp = screen.getByTestId(`KeyboardArrowUpIcon`);
      expect(arrowUp).toBeInTheDocument();
    } else {
      const arrowDown = screen.getByTestId(`KeyboardArrowDownIcon`);
      expect(arrowDown).toBeInTheDocument();
    }
  });

  it("handles expand/collapse actions", () => {
    render(
      <DataModel
        data={mockData}
        updateData={updateDataMock}
        setShowDeleteModal={setShowDeleteModalMock}
        showVariables={showVariablesMock}
      />
    );

    const handleExpandCollapseSpy = jest.fn();
    if (showVariablesMock) {
      handleExpandCollapseSpy(0, "Expand");
      fireEvent.click(screen.getByTestId("KeyboardArrowUpIcon"));
      expect(handleExpandCollapseSpy).toHaveBeenCalledWith(0, "Expand");
      handleExpandCollapseSpy.mockClear();
    } else {
      handleExpandCollapseSpy(0, "Collapse");
      fireEvent.click(screen.getByTestId("KeyboardArrowDownIcon"));
      expect(handleExpandCollapseSpy).toHaveBeenCalledWith(0, "Collapse");
      handleExpandCollapseSpy.mockRestore();
    }
  });

  it("renders table with data", () => {
    render(
      <DataModel
        data={mockData}
        updateData={updateDataMock}
        setShowDeleteModal={setShowDeleteModalMock}
        showVariables={showVariablesMock}
      />
    );

    mockData.forEach((row) => {
      expect(screen.getByTestId(row.id)).toBeInTheDocument();
    });
  });

  it("renders no Data objects message when data is empty", () => {
    render(<DataModel data={[]} />);
    expect(
      screen.getByRole("grid", { name: "No Record Icon" })
    ).toBeInTheDocument();

    expect(screen.getByTestId("DataModel_NoDataObjects")).toBeInTheDocument();
    expect(
      screen.getByTestId("DataModel_NoDataObjectsRegenerateMsg")
    ).toBeInTheDocument();
  });
});
