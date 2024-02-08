import React from "react";
import { render, fireEvent, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import CustomTestComponent from "../../utils/CustomTestComponent";
import Documents from "../Documents";

//mocking react-i18next
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

afterEach(cleanup);

describe("Documents Component", () => {
  const mockData = [
    { id: 1, name: "Document 1", description: "Description 1" },
    { id: 2, name: "Document 2", description: "Description 2" },
  ];
  it("renders without crashing", () => {
    render(<Documents />);
  });

  it("renders table with data", () => {
    render(<Documents data={mockData} />);

    mockData.forEach((row) => {
      expect(screen.getByTestId(row.id)).toBeInTheDocument();
    });
  });

  it("calls updateData when delete button is clicked", () => {
    const updateDataMock = jest.fn();

    render(<Documents data={mockData} updateData={updateDataMock} />);

    const deleteButton = screen.getByTestId(`Documents_deleteIcon_1`);
    fireEvent.click(deleteButton);
    expect(updateDataMock).toHaveBeenCalledWith([
      { id: 2, name: "Document 2", description: "Description 2" },
    ]);
  });

  it("renders NoDocuments message when data is empty", () => {
    render(<Documents data={[]} />);
    expect(
      screen.getByTestId("pmweb_CreateAI_Documents_NoDocuments")
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("pmweb_CreateAI_Documents_NoDocumentsRegenrateMsg")
    ).toBeInTheDocument();
  });
});
