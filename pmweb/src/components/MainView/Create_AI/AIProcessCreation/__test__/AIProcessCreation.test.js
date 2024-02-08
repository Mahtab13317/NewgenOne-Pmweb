import React from "react";
import {
  render,
  fireEvent,
  screen,
  cleanup,
  waitFor,
  act,
  getByRole,
} from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import CustomTestComponent from "../../utils/CustomTestComponent";
import AIProcessCreation from "../AIProcessCreation";

//mocking react-secure-storage
// jest.mock("react-secure-storage", () => ({
//   set: jest.fn(),
//   get: jest.fn(),
//   remove: jest.fn(),
// }));

// Mocking Sun Editor
// jest.mock("suneditor-react", () => ({
//   create: jest.fn(),
// }));

// Mock the entire "suneditor/src/plugins" module
// jest.mock("suneditor/src/plugins", () => ({
//   align: jest.fn(),
//   fontColor: jest.fn(),
//   hiliteColor: jest.fn(),
//   list: jest.fn(),
//   formatBlock: jest.fn(),
//   textStyle: jest.fn(),
//   image: jest.fn(),
//   table: jest.fn(),
//   fontSize: jest.fn(),
//   font: jest.fn(),
//   lineHeight: jest.fn(),
//   link: jest.fn(),
//   audio: jest.fn(),
//   video: jest.fn(),
//   math: jest.fn(),
//   paragraphStyle: jest.fn(),
// }));

// jest.mock("react-slick", () => ({
//   __esModule: true,
//   default: jest.fn(),
// }));

//mocking react-i18next
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

// jest.mock("axios");

afterEach(cleanup);

describe("AI Process Creation", () => {
  const mockData = {
    spinner: false,
    processData: {},
    updateProcessData: jest.fn(),
    NoOutput: false,
    setShowAIProcessCreation: jest.fn(),
    setSpinner: jest.fn(),
    cancelAPICall: jest.fn(),
    showDeleteModal: null,
    setShowDeleteModal: jest.fn(),
    tabValue: 1,
    setTabValue: jest.fn(),
  };

  const TabList = [
    {
      label: "Tab1",
      value: 1,
      id: "pmweb_AIProcessCreation_tablist_processFow",
    },
    {
      label: "Tab2",
      value: 2,
      id: "pmweb_AIProcessCreation_tablist_dataModel",
    },
    {
      label: "Tab3",
      value: 3,
      id: "pmweb_AIProcessCreation_tablist_documents",
    },
    {
      label: "Tab4",
      value: 4,
      id: "pmweb_AIProcessCreation_tablist_exceptions",
    },
    {
      label: "Tab5",
      value: 5,
      id: "pmweb_AIProcessCreation_tablist_toDos",
    },
  ];

  it("renders without crashing", () => {
    render(
      <CustomTestComponent>
        <AIProcessCreation />
      </CustomTestComponent>
    );
  });

  describe("Process Creation failure container", () => {
    it("renders failure container correctly", () => {
      render(
        <CustomTestComponent>
          <AIProcessCreation {...mockData} />
        </CustomTestComponent>
      );
      if (mockData.NoOutput) {
        const typographyElement1 = screen.getByTestId(
          "pmweb_AIPC_UnableToGenerateProcess"
        );
        const typographyElement2 = screen.getByTestId(
          "pmweb_AIPC_ProcessGenerationFailedMsg"
        );
        const typographyElement3 = screen.getByTestId(
          "pmweb_AIPC_PleaseRegenerate"
        );
        expect(typographyElement1).toBeInTheDocument();
        expect(typographyElement2).toBeInTheDocument();
        expect(typographyElement3).toBeInTheDocument();
      }
    });
  });

  describe("Process Creation success container", () => {
    it("renders success component", () => {
      render(
        <CustomTestComponent>
          <AIProcessCreation {...mockData} />
        </CustomTestComponent>
      );
      const backButton = screen.getByTestId("pmweb_processFlowGenAI_BackBtn");
      const nextButton = screen.getByTestId("pmweb_processFlowGenAI_NextBtn");
      expect(backButton).toBeInTheDocument();
      expect(nextButton).toBeInTheDocument();
    });

    it("handles back button click correctly", () => {
      render(
        <CustomTestComponent>
          <AIProcessCreation {...mockData} />
        </CustomTestComponent>
      );
      const backButton = screen.getByTestId("pmweb_processFlowGenAI_BackBtn");
      fireEvent.click(backButton);
      expect(mockData.setTabValue).not.toHaveBeenCalledWith(1);
    });

    it("disables back button if tabValue is 1", () => {
      render(
        <CustomTestComponent>
          <AIProcessCreation {...mockData} />
        </CustomTestComponent>
      );
      const backButton = screen.getByTestId("pmweb_processFlowGenAI_BackBtn");
      if (mockData.tabValue) {
        expect(backButton).toBeDisabled();
      }
    });

    it("handles next button click correctly", () => {
      render(
        <CustomTestComponent>
          <AIProcessCreation {...mockData} />
        </CustomTestComponent>
      );
      const nextButton = screen.getByTestId("pmweb_processFlowGenAI_NextBtn");
      fireEvent.click(nextButton);
      expect(mockData.setTabValue).toHaveBeenCalledWith(2);
    });

    it("disables next button when tabValue is 5", () => {
      render(
        <CustomTestComponent>
          <AIProcessCreation {...mockData} />
        </CustomTestComponent>
      );
      const nextButton = screen.getByTestId("pmweb_processFlowGenAI_NextBtn");
      fireEvent.click(nextButton);
      expect(mockData.setTabValue).not.toHaveBeenCalledWith(5);
    });

    it("renders correct tab onClicking particular tab", () => {
      render(
        <CustomTestComponent>
          <AIProcessCreation TabList={TabList} />
        </CustomTestComponent>
      );

      TabList.forEach((tab) => {
        expect(screen.getByTestId(tab.id)).toBeInTheDocument();
      });
    });

    // it("triggers onChange when a tab is clicked", () => {
    //   const mockHandleTabChange = jest.fn();
    //   render(
    //     <CustomTestComponent>
    //       <AIProcessCreation
    //         TabList={TabList}
    //         handleTabChange={mockHandleTabChange}
    //         {...mockData}
    //       />
    //     </CustomTestComponent>
    //   );

    //   fireEvent.click(screen.getByTestId(TabList[0].id));
    //   expect(mockHandleTabChange).toHaveBeenCalledWith(TabList[0].value);
    // });
  });
});
