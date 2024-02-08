import React from "react";
import { render, fireEvent, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import ErrorInfoModal from "../index";
import { Typography } from "@material-ui/core";

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

//mocking react-i18next
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key) => key }),
}));


afterEach(cleanup);

describe("Error Info Modal", () => {
  const mockErrors = [
    { name: "Error 1", description: "Description 1", variables: [] },
    { name: "Error 2", description: "Description 2", variables: [] },
  ];

  const mockInformation = [
    { name: "Info 1", oldName: "Old Info 1" },
    { name: "Info 2", oldName: "Old Info 2" },
  ];

  const mockOkHandler = jest.fn();

  it("renders without crashing", () => {
    render(
      <ErrorInfoModal
        errors={mockErrors}
        information={mockInformation}
        okHandler={mockOkHandler}
      />
    );
    const typographyElement = screen.getByTestId("pmweb_EIM_Important_Alert");
    expect(typographyElement).toBeInTheDocument();
  });

  it("render bodyNote correctly", () => {
    render(
      <ErrorInfoModal
        errors={mockErrors}
        information={mockInformation}
        okHandler={mockOkHandler}
      />
    );
    const typographyElement = screen.getByTestId("pmweb_EIM_bodyNote");
    expect(typographyElement).toBeInTheDocument();
  });

  it("renders errors tab by default if there are errors", () => {
    render(
      <ErrorInfoModal
        errors={mockErrors}
        information={[]}
        okHandler={mockOkHandler}
      />
    );

    const tabElement = screen.getByTestId("pmweb_EIM_errors_tab");
    expect(tabElement).toBeInTheDocument();
  });

  it("renders information tab by default if there are no errors", () => {
    render(
      <ErrorInfoModal
        errors={[]}
        information={mockInformation}
        okHandler={mockOkHandler}
      />
    );
    const tabElement = screen.getByTestId("pmweb_EIM_information_tab");
    expect(tabElement).toBeInTheDocument();
  });

  // it("calls copyToClipboard when the button is clicked", async () => {
  //   const writeTextMock = jest.fn();
  //   Object.assign(navigator, {
  //     clipboard: {
  //       writeText: writeTextMock,
  //     },
  //   });
  
  //   // Mock window.URL.createObjectURL
  //   const createObjectURLMock = jest.fn();
  //   window.URL.createObjectURL = createObjectURLMock;
  //   render(
  //     <ErrorInfoModal
  //       errors={[]}
  //       information={mockInformation}
  //       okHandler={mockOkHandler}
  //       copyToClipboard = {writeTextMock}
  //     />
  //   );

  //   const copyButton = screen.getByTestId("pmweb_EIMGenAI_CopyToClipboardBtn");

  //   fireEvent.click(copyButton);
  //   await screen.findByTestId("pmweb_EIMGenAI_CopyToClipboardBtn");

  //   expect(writeTextMock).toHaveBeenCalledWith(mockInformation);
  //   expect(createObjectURLMock).toHaveBeenCalled();
  // });

  it("calls okHandler function when OK button is clicked", () => {
    render(
      <ErrorInfoModal
        errors={mockErrors}
        information={[]}
        okHandler={mockOkHandler}
      />
    );

    const okButton = screen.getByTestId("pmweb_EIMGenAI_OkBtn");

    fireEvent.click(okButton);

    expect(mockOkHandler).toHaveBeenCalled();
  });
});
