import React from "react";
import { render, fireEvent, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import CustomTestComponent from "../../utils/CustomTestComponent";
import Exceptions from "../Exceptions";

//mocking react-i18next
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

afterEach(cleanup);

describe("Exceptions Component", () => {
  const mockData = [
    { id: 1, name: "Exception 1", description: "Description 1" },
    { id: 2, name: "Exception 2", description: "Description 2" },
  ];
  it("renders without crashing", () => {
    render(<Exceptions />);
  });

  it("renders table with data", () => {
    render(<Exceptions data={mockData} />);

    mockData.forEach((row) => {
      expect(screen.getByTestId(row.id)).toBeInTheDocument();
    });
  });

  it("calls updateData when delete button is clicked", () => {
    const updateDataMock = jest.fn();

    render(<Exceptions data={mockData} updateData={updateDataMock} />);

    const deleteButton = screen.getByTestId(`Exceptions_deleteIcon_1`);
    fireEvent.click(deleteButton);
    expect(updateDataMock).toHaveBeenCalledWith([
      { id: 2, name: "Exception 2", description: "Description 2" },
    ]);
  });

  it("renders NoDocuments message when data is empty", () => {
    render(<Exceptions data={[]} />);
    expect(
      screen.getByTestId("pmweb_CreateAI_Exceptions_NoExceptions")
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("pmweb_CreateAI_Exceptions_NoExceptionsRegenrateMsg")
    ).toBeInTheDocument();
  });
});
