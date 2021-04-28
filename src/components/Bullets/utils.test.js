import {
  hashCode,
  getRandomInt,
  optimize,
  tokenize,
  renderBulletText,
} from "./utils";

test("should return big number", () => {
  expect(hashCode("123")).toBe(48690);
});

test("should return 0", () => {
  expect(hashCode("")).toBe(0);
});

test("should test random", () => {
  expect(getRandomInt("123", 10)).toBe(3);
});

test("should split sentence into several pieces", () => {
  const text = "hello world hello world";
  const results = ["hello", "world", "hello", "world"];
  expect(tokenize(text)).toEqual(results);
});

test("should split sentence into several pieces even if there are several spaces", () => {
  const text = "hello   world      hello  world";
  const results = ["hello", "world", "hello", "world"];
  expect(tokenize(text)).toEqual(results);
});

test("should split sentence into several pieces even if there unicode type spaces", () => {
  const text = "hello\u2004world\u2006hello\u2009world";
  const results = ["hello", "world", "hello", "world"];
  expect(tokenize(text)).toEqual(results);
});

test("should split sentence into several pieces even if there mixed unicode type spaces", () => {
  const text = "hello\u2004\u2009 world \u2006\u2009hello \u2009world";
  const results = ["hello", "world", "hello", "world"];
  expect(tokenize(text)).toEqual(results);
});

let mockEvalFn;

beforeEach(() => {
  mockEvalFn = jest.fn((sentence) => {
    const MAX_WIDTH = 25;
    const CHAR_WIDTH = 2;
    const SMALL_SPACE_WIDTH = 1;
    const LARGE_SPACE_WIDTH = 3;
    const totalChars = sentence.length;
    const smallSpaces = sentence.match(/[\u2009\u2006]/g)?.length || 0;
    const largeSpaces = sentence.match(/[\u2004]/g)?.length || 0;
    const normalChars = totalChars - smallSpaces - largeSpaces;

    const width =
      normalChars * CHAR_WIDTH +
      largeSpaces * LARGE_SPACE_WIDTH +
      smallSpaces * SMALL_SPACE_WIDTH;
    return {
      overflow: width - MAX_WIDTH,
    };
  });
});

test("should return overflow of zero, and optimized (status 0)", () => {
  const optimizeResults = { rendering: { overflow: 0 }, status: 0 };

  expect(optimize("- hello\u2006world", mockEvalFn)).toEqual(optimizeResults);
});

test("should return a failed_opt status", () => {
  const sentence = "- hello world world";

  const optimizeResults = { rendering: { overflow: 11 }, status: 1 };

  expect(optimize(sentence, mockEvalFn)).toEqual(optimizeResults);
});

test("should return an optimized status with no overflow (smaller spaces inserted)", () => {
  const sentence = "- h llo world";

  const optimizeResults = { rendering: { overflow: 0 }, status: 0 };

  expect(optimize(sentence, mockEvalFn)).toEqual(optimizeResults);
});

test("should return an optimized status with no overflow (larger spaces inserted)", () => {
  const sentence = "- h l o w d";

  const optimizeResults = { rendering: { overflow: 0 }, status: 0 };

  expect(optimize(sentence, mockEvalFn)).toEqual(optimizeResults);
});

test("should return an optimized status with no overflow, no changes, without crashing ", () => {
  const sentence = "iiiiiiiiiiii";
  const optimizeResults = { rendering: { overflow: -1 }, status: 0 };
  expect(optimize(sentence, mockEvalFn)).toEqual(optimizeResults);
});

// renderBulletText tests
test("should not return much", () => {
  const sentence = "";
  // mocking getWidth to treat every character as one pixel wide
  const getWidth = jest.fn((str) => str.length);
  const width = 10;
  const renderResults = {
    fullWidth: getWidth(sentence),
    lines: 0,
    overflow: -10,
    textLines: [],
  };
  expect(renderBulletText(sentence, getWidth, width)).toEqual(renderResults);
});
test("should return short line without changes", () => {
  const sentence = "asdf";
  // mocking getWidth to treat every character as one pixel wide
  const getWidth = jest.fn((str) => str.length);
  const width = 10;
  const renderResults = {
    fullWidth: getWidth(sentence),
    lines: 1,
    overflow: getWidth(sentence) - width,
    textLines: ["asdf"],
  };
  expect(renderBulletText(sentence, getWidth, width)).toEqual(renderResults);
});

test("should break this one long word into three separate lines", () => {
  const sentence = "aaaaaaaaaabbbbbbbbbbcccccccccc";
  // mocking getWidth to treat every character as one pixel wide
  const getWidth = jest.fn((str) => str.length);
  const width = 10;

  const renderResults = {
    fullWidth: getWidth(sentence),
    lines: 3,
    overflow: getWidth(sentence) - width,
    textLines: ["aaaaaaaaaa", "bbbbbbbbbb", "cccccccccc"],
  };
  expect(renderBulletText(sentence, getWidth, width)).toEqual(renderResults);
});

test("should break on spaces whenever feasible", () => {
  const sentence = "aaaaaaa bbbbbbbb ccccccccc";
  // mocking getWidth to treat every character as one pixel wide
  const getWidth = jest.fn((str) => str.length);
  const width = 10;

  const renderResults = {
    fullWidth: getWidth(sentence),
    lines: 3,
    overflow: getWidth(sentence) - width,
    textLines: ["aaaaaaa ", "bbbbbbbb ", "ccccccccc"],
  };
  expect(renderBulletText(sentence, getWidth, width)).toEqual(renderResults);
});

test("should break on spaces whenever feasible, but break up really long words", () => {
  const sentence = "aaaaaaa bbbbbbbbbbbbbbbbb ccccccccc";
  // mocking getWidth to treat every character as one pixel wide
  const getWidth = jest.fn((str) => str.length);
  const width = 10;

  const renderResults = {
    fullWidth: getWidth(sentence),
    lines: 4,
    overflow: getWidth(sentence) - width,
    textLines: ["aaaaaaa ", "bbbbbbbbbb", "bbbbbbb ", "ccccccccc"],
  };
  expect(renderBulletText(sentence, getWidth, width)).toEqual(renderResults);
});

test("should not break on consecutive spaces, should instead treat them as one", () => {
  const sentence = "aaaaaaa   bbbbbbbb   ccccccccc";
  // mocking getWidth to treat every character as one pixel wide
  const getWidth = jest.fn((str) => str.length);
  const width = 10;

  const renderResults = {
    fullWidth: getWidth(sentence),
    lines: 3,
    overflow: getWidth(sentence) - width,
    textLines: ["aaaaaaa   ", "bbbbbbbb   ", "ccccccccc"],
  };
  expect(renderBulletText(sentence, getWidth, width)).toEqual(renderResults);
});

test("should break on unicode 2009, 2004, and 2006", () => {
  const sentence = "aaaaaaa\u2004bbbbbbbb\u2006ccccccccc\u2009dddddddd";
  // mocking getWidth to treat every character as one pixel wide
  const getWidth = jest.fn((str) => str.length);
  const width = 10;

  const renderResults = {
    fullWidth: getWidth(sentence),
    lines: 4,
    overflow: getWidth(sentence) - width,
    textLines: [
      "aaaaaaa\u2004",
      "bbbbbbbb\u2006",
      "ccccccccc\u2009",
      "dddddddd",
    ],
  };
  expect(renderBulletText(sentence, getWidth, width)).toEqual(renderResults);
});

test("should break on ? / | - % !", () => {
  const sentence =
    "aaaaaaa?bbbbbbbb/ccccccccc|dddddddd-eeeeeeee%ffffffff!gggggggg";
  // mocking getWidth to treat every character as one pixel wide
  const getWidth = jest.fn((str) => str.length);
  const width = 10;

  const renderResults = {
    fullWidth: getWidth(sentence),
    lines: 7,
    overflow: getWidth(sentence) - width,
    textLines: [
      "aaaaaaa?",
      "bbbbbbbb/",
      "ccccccccc|",
      "dddddddd-",
      "eeeeeeee%",
      "ffffffff!",
      "gggggggg",
    ],
  };
  expect(renderBulletText(sentence, getWidth, width)).toEqual(renderResults);
});
