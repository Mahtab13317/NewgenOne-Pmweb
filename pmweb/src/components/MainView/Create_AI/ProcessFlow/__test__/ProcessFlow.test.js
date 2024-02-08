import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import ProcessFlow from "../ProcessFlow";

// Mock data for testing
const mockData = [
  {
    id: 1,
    name: "Process 1",
    activities: [
      {
        id: 1,
        sequenceNo: 1,
        name: "Activity 1",
        description: "Description 1",
      },
      {
        id: 2,
        sequenceNo: 2,
        name: "Activity 2",
        description: "Description 2",
      },
    ],
  },
  {
    id: 2,
    name: "Process 2",
    activities: [
      {
        id: 3,
        sequenceNo: 1,
        name: "Activity 3",
        description: "Description 3",
      },
    ],
  },
];

describe("ProcessFlow component", () => {
  it("renders the component with data", async () => {
    render(<ProcessFlow data={mockData} />);
    expect(screen.getByTestId(`ProcessFlow_id_0`)).toBeInTheDocument();
    expect(screen.getByTestId(`ProcessFlow_name_0`)).toBeInTheDocument();
    const sequenceNoElements = await screen.findAllByTestId(
      `ProcessFlow_sequenceNo_0`
    );

    sequenceNoElements.forEach((element, index) => {
      expect(element).toBeInTheDocument();
    });

    const elmntNameElements = await screen.findAllByTestId(
      `ProcessFlow_elmntName_0`
    );
    elmntNameElements.forEach((element, index) => {
      expect(element).toBeInTheDocument();
    });

    const elmntDescElements = await screen.findAllByTestId(
      `ProcessFlow_elmntDesc_0`
    );
    elmntDescElements.forEach((element, index) => {
      expect(element).toBeInTheDocument();
    });
  });

  it("displays 'noDataIsAvailable' when no data is provided", () => {
    render(<ProcessFlow data={[]} />);
    expect(
      screen.getByRole("grid", { name: "No data is available" })
    ).toBeInTheDocument();
  });

//   it("renders the component with data", async () => {
//     render(<ProcessFlow data={mockData} />);

//     expect(screen.getByTestId(`ProcessFlow_id_0`)).toBeInTheDocument();
//     expect(screen.getByTestId(`ProcessFlow_name_0`)).toBeInTheDocument();

//     mockData.forEach((row) => {
//       if (row.id === 1) {
//         fireEvent.dragStart(screen.getByTestId(`ProcessFlow_sequenceNo_0`));
//         fireEvent.dragEnter(screen.getByTestId(`ProcessFlow_sequenceNo_1`));
//         fireEvent.drop(screen.getByTestId(`ProcessFlow_sequenceNo_1`));

//         expect(screen.getByTestId(`ProcessFlow_sequenceNo_1`).textContent).toBe(
//           "1.1"
//         );
//         expect(screen.getByTestId(`ProcessFlow_sequenceNo_1`).textContent).toBe(
//           "1.2"
//         );
//       }
//     });
//   });
});
