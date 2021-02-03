import {hashCode, getRandomInt, optimize} from './utils'

test('should return big number', () => {
    expect(hashCode('123')).toBe(48690)
})

test('should return 0', () => {
    expect(hashCode('')).toBe(0)
})

test('should test random', () => {
    expect(getRandomInt('123', 10)).toBe(3)
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