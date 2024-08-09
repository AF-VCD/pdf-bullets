import AbbreviationTable from "./AbbreviationTable.js";
import React from "react";

import { render, screen, act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

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
let changes = []
for (const [i,item] of defaultData.entries()) {
  for (const property in item){
    changes.push([i, property, "", item[property]])
  }
}
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
      this.props.beforeChange(changes);
    }
    componentDidUpdate() {
      this.props.beforeChange(changes);
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
  render(<AbbreviationTable data={defaultData} setData={jest.fn()} />);
});

test("Table data changes correctly ", () => {
  const changedData = [
    {
      enabled: false,
      value: "abbreviations",
      abbr: "abbrs",
    },
    {
      enabled: false,
      value: "zebra",
      abbr: "zbr",
    },
    {
      enabled: true,
      value: "optimize",
      abbr: "optam",
    },
    {
      enabled: false,
      value: "with ",
      abbr: "w/",
    },
    {
      enabled: true,
      value: "parentheses",
      abbr: "()",
    },
  ];

  const setData = jest.fn((data) =>
    data.filter(
      (row) => row.enabled !== null && row.value !== null && row.abbr !== null
    )
  );

  const { rerender } = render(
    <AbbreviationTable data={defaultData} setData={setData} />
  );

  rerender(<AbbreviationTable data={changedData} setData={setData} />);
  userEvent.dblClick(screen.getByTestId(/parent/));
  expect(setData).toReturnWith(changedData);
});
