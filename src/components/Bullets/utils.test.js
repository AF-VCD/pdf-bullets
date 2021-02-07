import {hashCode, getRandomInt, optimize, tokenize, renderBulletText} from './utils'


test('should return big number', () => {
    expect(hashCode('123')).toBe(48690)
})

test('should return 0', () => {
    expect(hashCode('')).toBe(0)
})

test('should test random', () => {
    expect(getRandomInt('123', 10)).toBe(3)
})

test('should split sentence into several pieces', ()=>{
    const text = 'hello world hello world'
    const results = ['hello', 'world', 'hello', 'world']
    expect(tokenize(text)).toEqual(results)
})

test('should split sentence into several pieces even if there are several spaces', ()=>{
    const text = 'hello   world      hello  world'
    const results = ['hello', 'world', 'hello', 'world']
    expect(tokenize(text)).toEqual(results)
})

test('should split sentence into several pieces even if there unicode type spaces', ()=>{
    const text = 'hello\u2004world\u2006hello\u2009world'
    const results = ['hello', 'world', 'hello', 'world']
    expect(tokenize(text)).toEqual(results)
})

test('should split sentence into several pieces even if there mixed unicode type spaces', ()=>{
    const text = 'hello\u2004\u2009 world \u2006\u2009hello \u2009world'
    const results = ['hello', 'world', 'hello', 'world']
    expect(tokenize(text)).toEqual(results)
})

test('should return overflow of zero', () => {

    const overflow = {overflow: 0}
    const mockfn = jest.fn(() => (overflow))

    expect(optimize("hello world", mockfn)).toBe(overflow)
})

test('should return a failed_opt status', () => {

    const overflow = {overflow: 10}
    const mockfn = jest.fn(() => (overflow))

    const optimizeResults = {rendering: {...overflow}, status: 1}

    expect(optimize("hello world", mockfn)).toEqual(optimizeResults)
})

test('should return a not optimize status', () => {

    const sentence = "hello world"
    const overflow = {overflow: -1}

    const mockfn = jest.fn()
    .mockImplementationOnce(() => ({overflow: -1}))
    .mockImplementationOnce(() => ({overflow: 0}))

    const optimizeResults = {rendering: {...overflow}, status: -1}

    expect(optimize(sentence, mockfn)).toEqual(optimizeResults)
})

test('should return an optimized status with overflow of last mock fn', () => {

    const sentence = "hello world"

    const mockfn = jest.fn()
    .mockImplementationOnce(() => ({overflow: 1}))
    .mockImplementationOnce(() => ({overflow: 0}))
    .mockImplementationOnce(() => ({overflow: -3}))

    const optimizeResults = {rendering: {overflow: -3}, status: 0}

    expect(optimize(sentence, mockfn)).toEqual(optimizeResults)
})

test('should return an optimized status with overflow of first mock fn', () => {

    const sentence = "- This tool can optimize spacing; output will be red if the optimizer could not fix spacing with 2004 or 2006 Unicode spaces"
    
    const mockfn = jest.fn()
    .mockImplementationOnce(() => ({overflow: -10}))
    .mockImplementationOnce(() => ({overflow: -1}))
    .mockImplementationOnce(() => ({overflow: 5}))

    const optimizeResults = {rendering: {overflow: -10}, status: 0}

    expect(optimize(sentence, mockfn)).toEqual(optimizeResults)
})

// renderBulletText tests
test('should not return much', () => {
    const sentence = ''
    // mocking getWidth to treat every character as one pixel wide
    const getWidth = jest.fn((str)=>str.length);
    const width = 10;
    const renderResults = {
        fullWidth: getWidth(sentence), 
        lines: 0,
        overflow: -10, 
        textLines: []
    }
    expect(renderBulletText(sentence, getWidth, width)).toEqual(renderResults)
})
test('should return short line without changes', () => {
    const sentence = 'asdf'
    // mocking getWidth to treat every character as one pixel wide
    const getWidth = jest.fn((str)=>str.length);
    const width = 10;
    const renderResults = {
        fullWidth: getWidth(sentence), 
        lines: 1,
        overflow: getWidth(sentence) - width,
        textLines: ["asdf"]
    }
    expect(renderBulletText(sentence, getWidth, width)).toEqual(renderResults)
})

test('should break this one long word into three separate lines', () => {
    const sentence = 'aaaaaaaaaabbbbbbbbbbcccccccccc'
    // mocking getWidth to treat every character as one pixel wide
    const getWidth = jest.fn((str)=>str.length);
    const width = 10;

    const renderResults = {
        fullWidth: getWidth(sentence), 
        lines: 3,
        overflow: getWidth(sentence) - width, 
        textLines: ["aaaaaaaaaa", "bbbbbbbbbb", "cccccccccc"]
    }
    expect(renderBulletText(sentence, getWidth, width)).toEqual(renderResults)
})

test('should break on spaces whenever feasible', () => {
    const sentence = 'aaaaaaa bbbbbbbb ccccccccc'
    // mocking getWidth to treat every character as one pixel wide
    const getWidth = jest.fn((str)=>str.length);
    const width = 10;

    const renderResults = {
        fullWidth: getWidth(sentence), 
        lines: 3,
        overflow:getWidth(sentence) - width,
        textLines: ["aaaaaaa ", "bbbbbbbb ", "ccccccccc"]
    }
    expect(renderBulletText(sentence, getWidth, width)).toEqual(renderResults)
})

test('should break on spaces whenever feasible, but break up really long words', () => {
    const sentence = 'aaaaaaa bbbbbbbbbbbbbbbbb ccccccccc'
    // mocking getWidth to treat every character as one pixel wide
    const getWidth = jest.fn((str)=>str.length);
    const width = 10;

    const renderResults = {
        fullWidth: getWidth(sentence), 
        lines: 4,
        overflow: getWidth(sentence) - width,
        textLines: ["aaaaaaa ", "bbbbbbbbbb", "bbbbbbb ", "ccccccccc"]
    }
    expect(renderBulletText(sentence, getWidth, width)).toEqual(renderResults)
})

test('should not break on consecutive spaces, should instead treat them as one', () => {
    const sentence = 'aaaaaaa   bbbbbbbb   ccccccccc'
    // mocking getWidth to treat every character as one pixel wide
    const getWidth = jest.fn((str)=>str.length);
    const width = 10;

    const renderResults = {
        fullWidth: getWidth(sentence), 
        lines: 3,
        overflow: getWidth(sentence) - width,
        textLines: ["aaaaaaa   ", "bbbbbbbb   ", "ccccccccc"]
    }
    expect(renderBulletText(sentence, getWidth, width)).toEqual(renderResults)
})

test('should break on unicode 2009, 2004, and 2006', () => {
    const sentence = 'aaaaaaa\u2004bbbbbbbb\u2006ccccccccc\u2009dddddddd'
    // mocking getWidth to treat every character as one pixel wide
    const getWidth = jest.fn((str)=>str.length);
    const width = 10;

    const renderResults = {
        fullWidth: getWidth(sentence), 
        lines: 4,
        overflow: getWidth(sentence) - width,
        textLines: ["aaaaaaa\u2004", "bbbbbbbb\u2006", "ccccccccc\u2009", "dddddddd"]
    }
    expect(renderBulletText(sentence, getWidth, width)).toEqual(renderResults)
})

test('should break on ? / | - % !', () => {
    const sentence = 'aaaaaaa?bbbbbbbb/ccccccccc|dddddddd-eeeeeeee%ffffffff!gggggggg'
    // mocking getWidth to treat every character as one pixel wide
    const getWidth = jest.fn((str)=>str.length);
    const width = 10;

    const renderResults = {
        fullWidth: getWidth(sentence), 
        lines: 7,
        overflow: getWidth(sentence) - width,
        textLines: ["aaaaaaa?", "bbbbbbbb/", "ccccccccc|", "dddddddd-", "eeeeeeee%","ffffffff!", "gggggggg"]
    }
    expect(renderBulletText(sentence, getWidth, width)).toEqual(renderResults)
})
