// 🐨 you'll need the test server
// 💰 the way that our tests are set up, you'll find this in `src/test/server/test-server.js`
// 🐨 grab the client
import {client} from '../api-client'
import * as auth from 'auth-provider'
import {queryCache} from 'react-query'
import {server, rest} from 'test/server'

const apiURL = process.env.REACT_APP_API_URL

jest.mock('auth-provider')
jest.mock('react-query')

// 🐨 add a beforeAll to start the server with `server.listen()`
// 🐨 add an afterAll to stop the server when `server.close()`
// 🐨 afterEach test, reset the server handlers to their original handlers
// via `server.resetHandlers()`

// 🐨 flesh these out:

test('calls fetch at the endpoint with the arguments for GET requests', async () => {
  // 🐨 add a server handler to handle a test request you'll be making
  // 💰 because this is the first one, I'll give you the code for how to do that.
  // 🐨 call the client (don't forget that it's asynchronous)
  // 🐨 assert that the resolved value from the client call is correct
  const endpoint = 'test-endpoint'
  const mockResult = {mockValue: 'VALUE'}
  server.use(
    rest.get(`${apiURL}/${endpoint}`, async (req, res, ctx) => {
      return res(ctx.json(mockResult))
    }),
  )

  const response = await client(endpoint)

  expect(response).toStrictEqual(mockResult)
})

test('adds auth token when a token is provided', async () => {
  // 🐨 create a fake token (it can be set to any string you want)
  // 🐨 create a "request" variable with let
  // 🐨 create a server handler to handle a test request you'll be making
  // 🐨 inside the server handler, assign "request" to "req" so we can use that
  //     to assert things later.
  //     💰 so, something like...
  //       async (req, res, ctx) => {
  //         request = req
  //         ... etc...
  //
  // 🐨 call the client with the token (note that it's async)
  // 🐨 verify that `request.headers.get('Authorization')` is correct (it should include the token)
  const endpoint = 'test-authenticated-endpoint'
  const token = 'super secure I promise'
  let request
  server.use(
    rest.get(`${apiURL}/${endpoint}`, async (req, res, ctx) => {
      request = req
      return res(ctx.json(''))
    }),
  )
  await client(endpoint, {token})

  expect(request.headers.get('authorization')).toBe(`Bearer ${token}`)
})

test('allows for config overrides', async () => {
  // 🐨 do a very similar setup to the previous test
  // 🐨 create a custom config that specifies properties like "mode" of "cors" and a custom header
  // 🐨 call the client with the endpoint and the custom config
  // 🐨 verify the request had the correct properties
  const endpoint = 'test-configured-endpoint'
  let request
  server.use(
    rest.delete(`${apiURL}/${endpoint}`, async (req, res, ctx) => {
      request = req
      return res(ctx.json(''))
    }),
  )
  const customConfig = {
    method: 'DELETE',
    headers: {'X-a-custom-header': 'custom behaviour'},
  }
  await client(endpoint, customConfig)

  expect(request.method).toBe(customConfig.method)
  expect(request.headers.get('X-a-custom-header')).toBe(
    customConfig.headers['X-a-custom-header'],
  )
})

test('when data is provided, it is stringified and the method defaults to POST', async () => {
  // 🐨 create a mock data object
  // 🐨 create a server handler very similar to the previous ones to handle the post request
  //    💰 Use rest.post instead of rest.get like we've been doing so far
  // 🐨 call client with an endpoint and an object with the data
  //    💰 client(endpoint, {data})
  // 🐨 verify the request.body is equal to the mock data object you passed
  const endpoint = 'test-posting-payload-endpoint'
  const mockRequest = {
    books: {id: 123, title: 'reading is downloading'},
    bookie: {id: 3, title: 'cool story'},
  }
  let request
  server.use(
    rest.post(`${apiURL}/${endpoint}`, async (req, res, ctx) => {
      request = req
      return res(ctx.json(''))
    }),
  )
  await client(endpoint, {data: mockRequest})

  expect(request.body).toStrictEqual(mockRequest)
})

test('extra credit 1 rejects on bad request', async () => {
  const endpoint = 'test-bad-request-endpoint'
  server.use(
    rest.get(`${apiURL}/${endpoint}`, async (req, res, ctx) => {
      return res(ctx.status(400), ctx.json({message: 'this is the response!'}))
    }),
  )

  expect.assertions(1)
  await expect(client(endpoint)).rejects.toEqual({
    message: 'this is the response!',
  })
})

test('extra credit 1 on unauthorized request logouts', async () => {
  const endpoint = 'test-bad-request-endpoint'
  server.use(
    rest.get(`${apiURL}/${endpoint}`, async (req, res, ctx) => {
      return res(ctx.status(401), ctx.json({message: 'Unauthorized response!'}))
    }),
  )

  expect.assertions(3)
  // await expect(client(endpoint)).rejects.toEqual({
  //   message: 'Please re-authenticate.',
  // })
  await expect(client(endpoint)).rejects.toMatchInlineSnapshot(`
          Object {
            "message": "Please re-authenticate.",
          }
        `)
  expect(auth.logout).toHaveBeenCalledTimes(1)
  expect(queryCache.clear).toHaveBeenCalledTimes(1)
})
