import AbbreviationViewer, { AbbreviationToolbar } from "./AbbreviationViewer";

import React from "react";

import {
  render,
  screen,
  act,
  waitFor,
  fireEvent,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
//const utils = jest.createMockFromModule("./utils");
import * as Utils from "./utils";
jest.mock("./utils");

const defaultData = [
  {
    enabled: true,
    value: "abbreviations",
    abbr: "abbrs",
  },
  {
    enabled: false,
    value: "table",
    abbr: "tbl",
  },
  {
    enabled: true,
    value: "optimize",
    abbr: "optim",
  },
  {
    enabled: false,
    value: "with ",
    abbr: "w/",
  },
  {
    enabled: true,
    value: "parentheses",
    abbr: "parens",
  },
];

jest.mock("@handsontable/react", () => {
  const { Component } = jest.requireActual("react");
  class MockHotTable extends Component {
    constructor(props) {
      super(props);
      this.hotInstance = {
        getData: () =>
          this.props.data.map((row) => [row.enabled, row.value, row.abbr]),
      };
    }
    componentDidMount() {
      this.props.afterChange(null, "loadData");
    }
    componentDidUpdate() {
      this.props.afterChange(null, "loadData");
    }
    render() {
      return (
        <div data-testid="parent" onClick={this.props.afterChange}>
          HELLO WORLD
        </div>
      );
    }
  }
  return {
    HotTable: MockHotTable,
  };
});

it("renders without crashing", () => {
  render(<AbbreviationViewer data={defaultData} setData={jest.fn()} />);
});

test("AbbreviationToolbar renders without crashing", () => {
  render(<AbbreviationToolbar data={defaultData} setData={jest.fn()} />);
});

test("AbbreviationToolbar File upload button click", () => {
  const setData = jest.fn((data) => {
    console.log(data);
  });

  render(<AbbreviationToolbar data={defaultData} setData={setData} />);
  const button = screen.getByRole("button", { name: /import abbrs/i });

  userEvent.click(button);

  // can't figure out how to test this properly yet, so for now I'm just simulating the click.
  // I think the below test does a good enough job of testing the upload logic
});

test("AbbreviationToolbar file upload", () => {
  const setData = jest.fn();
  Utils.getDataFromXLS.mockReturnValue(new Promise((res) => res(defaultData)));
  render(<AbbreviationToolbar data={defaultData} setData={setData} />);

  const uploader = screen.getByTestId("uploader");
  var file = new File(["foo"], "foo.txt", {
    type: "text/plain",
  });
  var file2 = new File(["foo"], "foo2.txt", {
    type: "text/plain",
  });
  //upload file. should trigger getDataFromXLS
  userEvent.upload(uploader, file);
  expect(uploader.files[0]).toStrictEqual(file);
  // upload same file again. should not trigger getDataFromXLS
  userEvent.upload(uploader, file);
  // upload undefined. should not trigger getDataFromXLS
  userEvent.upload(uploader, undefined);
  expect(uploader.files[0]).toStrictEqual(undefined);
  //upload a different file. should trigger getDataFromXLS
  userEvent.upload(uploader, file2);
  expect(uploader.files[0]).toStrictEqual(file2);

  // expect two callbacks.
  expect(Utils.getDataFromXLS).toHaveBeenCalledTimes(2);
});

test("AbbreviationToolbar file export button click", () => {
  const setData = jest.fn((data) => {
    console.log(data);
  });
  render(<AbbreviationToolbar data={defaultData} setData={setData} />);
  const button = screen.getByRole("button", { name: /export abbrs/i });
  userEvent.click(button);
  expect(Utils.exportToXLS).toHaveBeenCalled();
});
test("AbbreviationToolbar example file button click - confirmed", (done) => {
  const setData = jest.fn((data) => {
    expect(data).toEqual(defaultData);
    done();
  });

  window.confirm = jest.fn(() => true);
  Utils.importSampleAbbrs = jest.fn(() => new Promise((res) => res()));
  Utils.getDataFromXLS.mockReturnValue(new Promise((res) => res(defaultData)));

  render(<AbbreviationToolbar data={defaultData} setData={setData} />);
  const button = screen.getByRole("button", { name: /load common abbrs/i });
  userEvent.click(button);
  expect(window.confirm).toHaveBeenCalled();
  expect(Utils.importSampleAbbrs).toHaveBeenCalled();
});

test("AbbreviationToolbar example file button click - cancelled", () => {
  const setData = jest.fn((data) => {
    console.log(data);
  });
  window.confirm = jest.fn(() => false);
  render(<AbbreviationToolbar data={defaultData} setData={setData} />);
  const button = screen.getByRole("button", { name: /load common abbrs/i });
  userEvent.click(button);
  expect(window.confirm).toHaveBeenCalled();
  expect(Utils.getDataFromXLS).not.toHaveBeenCalled();
  expect(setData).not.toHaveBeenCalled();
});
