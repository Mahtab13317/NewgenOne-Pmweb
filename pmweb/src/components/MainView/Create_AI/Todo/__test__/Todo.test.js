import React from "react";
import { render, fireEvent, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import CustomTestComponent from "../../utils/CustomTestComponent";
import Todos from "../Todo";

//mocking react-i18next
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

afterEach(cleanup);

describe("Todos Component", () => {
  const mockData = [
    { id: 1, name: "Todo 1", description: "Description 1" },
    { id: 2, name: "Todo 2", description: "Description 2" },
  ];
  it("renders without crashing", () => {
    render(<Todos />);
  });

  it("renders table with data", () => {
    render(<Todos data={mockData} />);

    mockData.forEach((row) => {
      expect(screen.getByTestId(row.id)).toBeInTheDocument();
    });
  });

  it("calls updateData when delete button is clicked", () => {
    const updateDataMock = jest.fn();

    render(<Todos data={mockData} updateData={updateDataMock} />);

    const deleteButton = screen.getByTestId(`Todo_deleteIcon_1`);
    fireEvent.click(deleteButton);
    expect(updateDataMock).toHaveBeenCalledWith([
      { id: 2, name: "Todo 2", description: "Description 2" },
    ]);
  });

  it("renders NoDocuments message when data is empty", () => {
    render(<Todos data={[]} />);
    expect(
      screen.getByTestId("pmweb_CreateAI_Todo_NoTodos")
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("pmweb_CreateAI_Todo_NoTodosRegenrateMsg")
    ).toBeInTheDocument();
  });
});
