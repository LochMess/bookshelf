// 🐨 instead of React Testing Library, you'll use React Hooks Testing Library
import {renderHook, act} from '@testing-library/react-hooks'
// 🐨 Here's the thing you'll be testing:
import {useAsync} from '../hooks'

beforeEach(() => {
  jest.spyOn(console, 'error')
})

afterEach(() => {
  console.error.mockRestore()
})

// 💰 I'm going to give this to you. It's a way for you to create a promise
// which you can imperatively resolve or reject whenever you want.
function deferred() {
  let resolve, reject
  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })
  return {promise, resolve, reject}
}

// Use it like this:
// const {promise, resolve} = deferred()
// promise.then(() => console.log('resolved'))
// do stuff/make assertions you want to before calling resolve
// resolve()
// await promise
// do stuff/make assertions you want to after the promise has resolved

function getAsyncState(overrides) {
  return {
    data: null,
    isIdle: true,
    isLoading: false,
    isError: false,
    isSuccess: false,

    error: null,
    status: 'idle',
    run: expect.any(Function),
    reset: expect.any(Function),
    setData: expect.any(Function),
    setError: expect.any(Function),
    ...overrides,
  }
}

const pendingAsyncState = getAsyncState({isLoading: true, isIdle: false, status: 'pending'})


// 🐨 flesh out these tests
test('calling run with a promise which resolves', async () => {
  // 🐨 get a promise and resolve function from the deferred utility
  // 🐨 use renderHook with useAsync to get the result
  // 🐨 assert the result.current is the correct default state

  // 🐨 call `run`, passing the promise
  //    (💰 this updates state so it needs to be done in an `act` callback)
  // 🐨 assert that result.current is the correct pending state

  // 🐨 call resolve and wait for the promise to be resolved
  //    (💰 this updates state too and you'll need it to be an async `act` call so you can await the promise)
  // 🐨 assert the resolved state

  // 🐨 call `reset` (💰 this will update state, so...)
  // 🐨 assert the result.current has actually been reset
  const {promise, resolve} = deferred()
  const {result} = renderHook(() => useAsync())
  const initialState = getAsyncState()

  expect(result.current).toEqual(initialState)

  let returnData
  act(() => {
    returnData = result.current.run(promise)
  })
  expect(result.current).toEqual(pendingAsyncState)

  await act(async () => {
    resolve('finished')
    await returnData
  })
  expect(result.current).toEqual({
    ...initialState,
    isIdle: false,
    isSuccess: true,
    status: 'resolved',
    data: 'finished',
  })

  act(() => result.current.reset())
  expect(result.current).toEqual(initialState)
})

test('calling run with a promise which rejects', async () => {
  // 🐨 this will be very similar to the previous test, except you'll reject the
  // promise instead and assert on the error state.
  // 💰 to avoid the promise actually failing your test, you can catch
  //    the promise returned from `run` with `.catch(() => {})`

  const {promise, reject} = deferred()
  const {result} = renderHook(() => useAsync())
  const initialState = getAsyncState()

  expect(result.current).toEqual(initialState)

  let returnData
  act(() => {
    returnData = result.current.run(promise)
  })
  expect(result.current).toEqual(pendingAsyncState)

  await act(async () => {
    reject('Error!')
    await returnData.catch(() => {})
  })
  expect(result.current).toEqual({
    ...initialState,
    isIdle: false,
    isError: true,
    error: 'Error!',
    status: 'rejected',
  })

  act(() => result.current.reset())
  expect(result.current).toEqual(initialState)
})

test('can specify an initial state', async () => {
  // 💰 useAsync(customInitialState)
  const customInitialState = {
    isIdle: false,
    isLoading: false,
    isError: false,
    isSuccess: true,

    error: null,
    status: 'resolved',
    data: Symbol({example: 'values'}),

    setData: expect.any(Function),
    setError: expect.any(Function),
    run: expect.any(Function),
    reset: expect.any(Function),
  }
  const {result} = renderHook(() => useAsync(customInitialState))

  expect(result.current).toEqual(customInitialState)
})

test('can set the data', async () => {
  // 💰 result.current.setData('whatever you want')

  const mockData = Symbol({example: 'values'})
  const {result} = renderHook(() => useAsync())
  expect(result.current.data).toEqual(null)

  act(() => result.current.setData(mockData))

  expect(result.current).toEqual({
    isIdle: false,
    isLoading: false,
    isError: false,
    isSuccess: true,

    error: null,
    status: 'resolved',
    data: mockData,

    setData: expect.any(Function),
    setError: expect.any(Function),
    run: expect.any(Function),
    reset: expect.any(Function),
  })
})

test('can set the error', async () => {
  // 💰 result.current.setError('whatever you want')

  const mockError = Symbol({example: 'values'})
  const {result} = renderHook(() => useAsync())
  expect(result.current.error).toEqual(null)

  act(() => result.current.setError(mockError))

  expect(result.current).toEqual({
    isIdle: false,
    isLoading: false,
    isError: true,
    isSuccess: false,

    error: mockError,
    status: 'rejected',
    data: null,

    setData: expect.any(Function),
    setError: expect.any(Function),
    run: expect.any(Function),
    reset: expect.any(Function),
  })
})

test('No state updates happen if the component is unmounted while pending', async () => {
  // 🐨 ensure that console.error is not called (React will call console.error if updates happen when unmounted)
  jest.spyOn(console, 'error')
  const {promise, resolve} = deferred()
  const pendingState = {
    isIdle: false,
    isLoading: true,
    isError: false,
    isSuccess: false,

    error: null,
    status: 'pending',
    data: null,

    setData: expect.any(Function),
    setError: expect.any(Function),
    run: expect.any(Function),
    reset: expect.any(Function),
  }
  const {result, unmount} = renderHook(() => useAsync())

  let returnData
  act(() => {
    returnData = result.current.run(promise)
  })
  expect(result.current).toEqual(pendingState)

  unmount()

  await act(async () => {
    resolve('finished')
    await returnData
  })

  expect(console.error).not.toHaveBeenCalled()
})

test('calling "run" without a promise results in an early error', async () => {
  const {result} = renderHook(() => useAsync())
  expect.assertions(1)
  try {
    result.current.run('Not a promise')
  } catch (e) {
    expect(e).toEqual(expect.any(Error))
  }
})

test('Kent solution, calling "run" without a promise results in an early error', async () => {
  const {result} = renderHook(() => useAsync())
  expect(() =>
    result.current.run('Not a promise'),
  ).toThrowErrorMatchingInlineSnapshot(
    `"The argument passed to useAsync().run must be a promise. Maybe a function that's passed isn't returning anything?"`,
  )
})
