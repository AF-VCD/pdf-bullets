import SynonymViewer, { Synonym, SynonymList } from "./Thesaurus";
import React from "react";

import { render, screen, act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const abbrData = [
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

it("renders without crashing", () => {
  const { debug } = render(
    <SynonymViewer
      word={"test"}
      onSelReplace={jest.fn()}
      abbrDict={abbrData}
      abbrReplacer={jest.fn((word) => word)}
      onHide={jest.fn()}
    />
  );
});

test("renders Synonym correctly", () => {
  const parenthesesAbbrs = {
    enabled: ["parens", "pars", "p"],
    disabled: ["parts", "()"],
  };

  const { debug } = render(
    <Synonym
      word={"parentheses"}
      abbr={"parens"}
      otherAbbrs={parenthesesAbbrs}
    />
  );
  // main abbreviation should be bold
  expect(screen.getByText("(parens)").style["font-weight"]).toEqual("bold");
  // other enabled but overwritten abbreviations should be italic
  expect(screen.getByText("(pars,p)").style["font-style"]).toEqual("italic");
  // disabled abbreviations should also be italic
  expect(screen.getByText("(parts,())").style["font-style"]).toEqual("italic");
});

test("renders Synonym correctly if there are no disabled abbrs", () => {
  const parenthesesAbbrs = {
    enabled: ["parens", "pars", "p"],
    disabled: [],
  };

  const { debug } = render(
    <Synonym
      word={"parentheses"}
      abbr={"parens"}
      otherAbbrs={parenthesesAbbrs}
    />
  );
  // main abbreviation should be bold
  expect(screen.getByText("(parens)").style["font-weight"]).toEqual("bold");
  // other enabled but overwritten abbreviations should be italic
  expect(screen.getByText("(pars,p)").style["font-style"]).toEqual("italic");
  // no disabled abbrs
  expect(screen.queryByText("parts")).toBeNull();
});

test("renders Synonym correctly if there are no enabled abbrs", () => {
  const parenthesesAbbrs = {
    disabled: ["parts", "()"],
    enabled: [],
  };

  const { debug } = render(
    <Synonym
      word={"parentheses"}
      abbr={"parens"}
      otherAbbrs={parenthesesAbbrs}
    />
  );
  // main abbreviation should be bold
  expect(screen.getByText("(parens)").style["font-weight"]).toEqual("bold");
  // no other enabled abbrs
  expect(screen.queryByText("pars")).toBeNull();
  // disabled abbreviations should also be italic
  expect(screen.getByText("(parts,())").style["font-style"]).toEqual("italic");
});

test("renders Synonym correctly if there are no other abbrs", () => {
  const { debug } = render(<Synonym word={"parentheses"} abbr={"parens"} />);

  // main abbreviation should be bold
  expect(screen.getByText("(parens)").style["font-weight"]).toEqual("bold");
  expect(screen.queryByText("pars")).toBeNull();
  expect(screen.queryByText("parts")).toBeNull();
});

test("renders Synonym correctly if there are no abbrs at all", () => {
  const { debug } = render(<Synonym word={"parentheses"} />);

  // main abbreviation should be bold
  expect(screen.queryByText("(parens)")).toBeNull();
  expect(screen.queryByText("pars")).toBeNull();
  expect(screen.queryByText("parts")).toBeNull();
});

test("renders Synonym correctly if there is no main abbr but there are others", () => {
  const parenthesesAbbrs = {
    enabled: ["parens", "pars", "p"],
    disabled: ["parts", "()"],
  };

  const { debug } = render(
    <Synonym word={"parentheses"} otherAbbrs={parenthesesAbbrs} />
  );
  // no main abbr
  expect(screen.queryByText("(parens)")).toBeNull();
  // other enabled but overwritten abbreviations should be italic
  expect(screen.getByText("(parens,pars,p)").style["font-style"]).toEqual(
    "italic"
  );
  // disabled abbreviations should also be italic
  expect(screen.getByText("(parts,())").style["font-style"]).toEqual("italic");
});

test("synonymlist renders properly", () => {
  const abbrDict = {
    parentheses: {
      enabled: ["parens", "paras"],
      disabled: [],
    },
    brackets: {
      enabled: ["braks", "bracs"],
      disabled: ["[]", "brks"],
    },
  };

  const { debug } = render(
    <SynonymList
      synonyms={["brackets", "edges", "spaces", "parentheses"]}
      abbrReplacer={jest.fn((word) => word + "_abbr")}
      abbrDict={abbrDict}
    />
  );

  expect(screen.queryByText("(brackets_abbr)")).not.toBeNull();
  expect(screen.queryByText("(parentheses_abbr)")).not.toBeNull();
  expect(screen.queryByText("(parens,paras)")).not.toBeNull();
  expect(screen.queryByText("([],brks)")).not.toBeNull();
  expect(screen.queryByText("brackets")).not.toBeNull();
  expect(screen.queryByText("edges")).not.toBeNull();
  expect(screen.queryByText("spaces")).not.toBeNull();
  expect(screen.queryByText("parentheses")).not.toBeNull();
});
