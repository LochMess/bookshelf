// 🐨 here are the things you're going to need for this test:
import * as React from 'react'
import {buildUser, buildBook, buildListItem} from 'test/generate'
import * as auth from 'auth-provider'
import {AppProviders} from 'context'
import {App} from 'app'
import '@testing-library/jest-dom'
import faker from 'faker'
import * as booksDB from 'test/data/books'
import * as listItemsDB from 'test/data/list-items'
// Setup done in src/setupTests.exercise.js
import {server, rest} from 'test/server'
import {
  render,
  screen,
  waitForElementToBeRemoved,
  defaultRender,
  waitForLoadingToFinish,
  loginAsUser,
  within,
  userEvent,
} from 'test/app-test-utils'
import {formatDate} from 'utils/misc'

jest.mock('components/profiler')

test('Exercise: renders all the book information', async () => {
  // 🐨 "authenticate" the client by setting the auth.localStorageKey in localStorage to some string value (can be anything for now)
  window.localStorage.setItem(auth.localStorageKey, 'user.token')

  // 🐨 create a user using `buildUser`
  const user = buildUser()
  // 🐨 create a book use `buildBook`
  const book = buildBook()
  // 🐨 update the URL to `/book/${book.id}`
  //   📜 https://developer.mozilla.org/en-US/docs/Web/API/History/pushState
  window.history.pushState({}, 'test book page', `/book/${book.id}`)

  // 🐨 reassign window.fetch to another function and handle the following requests:
  // - url ends with `/bootstrap`: respond with {user, listItems: []}
  // - url ends with `/list-items`: respond with {listItems: []}
  // - url ends with `/books/${book.id}`: respond with {book}
  // 💰 window.fetch = async (url, config) => { /* handle stuff here*/ }
  // 💰 return Promise.resolve({ok: true, json: async () => ({ /* response data here */ })})
  window.fetch = async (url, config) => {
    if (url.endsWith('/bootstrap')) {
      return Promise.resolve({
        ok: true,
        json: async () => ({
          user: {...user, token: 'user.token'},
          listItems: [],
        }),
      })
    } else if (url.endsWith(`/books/${book.id}`)) {
      return {ok: true, json: async () => ({book})}
    }
    console.warn(url, config)
    return Promise.reject(new Error(`NEED TO HANDLE: ${url}`))
  }

  // 🐨 render the App component and set the wrapper to the AppProviders
  // (that way, all the same providers we have in the app will be available in our tests)
  defaultRender(<App />, {wrapper: AppProviders})

  // 🐨 use waitFor to wait for the queryCache to stop fetching and the loading
  // indicators to go away
  // 📜 https://testing-library.com/docs/dom-testing-library/api-async#waitfor
  // 💰 if (queryCache.isFetching or there are loading indicators) then throw an error...

  await waitForElementToBeRemoved(() => screen.getByLabelText(/loading/i))

  // 🐨 assert the book's info is in the document
  expect(screen.getByRole('heading', book.title)).toBeInTheDocument()
  expect(screen.getByText(book.author)).toBeInTheDocument()
  expect(screen.getByText(book.publisher)).toBeInTheDocument()
  expect(screen.getByText(book.synopsis)).toBeInTheDocument()
  expect(screen.getByRole('img', {name: /book cover/i})).toBeInTheDocument()
  expect(screen.queryByLabelText(/start date/i)).not.toBeInTheDocument()

  // check buttons
  expect(screen.getByRole('button', {name: /add to list/i})).toBeInTheDocument()
  // Note use queryBy to avoid throwing of error when the element isn't found
  expect(
    screen.queryByRole('button', {name: /mark as read/i}),
  ).not.toBeInTheDocument()
  expect(
    screen.queryByRole('button', {name: /mark as unread/i}),
  ).not.toBeInTheDocument()
  expect(
    screen.queryByRole('button', {name: /remove from list/i}),
  ).not.toBeInTheDocument()

  // check rating not visible
  expect(screen.queryByRole('radio', {name: /star/i})).not.toBeInTheDocument()
  // check notes box
  expect(
    screen.queryByRole('textbox', {name: /notes/i}),
  ).not.toBeInTheDocument()
})

test('Extra Credit 1: renders all the book information', async () => {
  const book = await booksDB.create(buildBook())
  const route = `/book/${book.id}`

  await render(<App />, {route})

  // 🐨 assert the book's info is in the document
  expect(screen.getByRole('heading', book.title)).toBeInTheDocument()
  expect(screen.getByText(book.author)).toBeInTheDocument()
  expect(screen.getByText(book.publisher)).toBeInTheDocument()
  expect(screen.getByRole('img', {name: /book cover/i})).toBeInTheDocument()
  expect(screen.queryByLabelText(/start date/i)).not.toBeInTheDocument()

  // check buttons
  expect(screen.getByRole('button', {name: /add to list/i})).toBeInTheDocument()
  // Note use queryBy to avoid throwing of error when the element isn't found
  expect(
    screen.queryByRole('button', {name: /mark as read/i}),
  ).not.toBeInTheDocument()
  expect(
    screen.queryByRole('button', {name: /mark as unread/i}),
  ).not.toBeInTheDocument()
  expect(
    screen.queryByRole('button', {name: /remove from list/i}),
  ).not.toBeInTheDocument()

  // check rating not visible
  expect(screen.queryByRole('radio', {name: /star/i})).not.toBeInTheDocument()
  // check notes box
  expect(
    screen.queryByRole('textbox', {name: /notes/i}),
  ).not.toBeInTheDocument()
})

test('Extra Credit 2: can create a list item for the book', async () => {
  await renderBookScreen({listItem: null})

  const buttonAddToList = screen.getByRole('button', {name: /add to list/i})
  userEvent.click(buttonAddToList)
  expect(screen.queryByLabelText(/loading/i)).toBeInTheDocument()
  expect(screen.getByRole('button', {name: /add to list/i})).toBeDisabled()
  await waitForLoadingToFinish()

  expect(
    screen.getByRole('button', {name: /mark as read/i}),
  ).toBeInTheDocument()
  expect(
    screen.queryByRole('button', {name: /mark as unread/i}),
  ).not.toBeInTheDocument()
  expect(
    screen.getByRole('button', {name: /remove from list/i}),
  ).toBeInTheDocument()

  // check rating not visible
  expect(screen.queryByRole('radio', {name: /star/i})).not.toBeInTheDocument()
  // check notes box
  expect(screen.queryByRole('textbox', {name: /notes/i})).toBeInTheDocument()
  expect(screen.queryByRole('radio', {name: /star/i})).not.toBeInTheDocument()
})

test('EC5: can remove a list item for the book', async () => {
  await renderBookScreen()

  const buttonRemoveFromList = screen.getByRole('button', {
    name: /remove from list/i,
  })

  expect(buttonRemoveFromList).toBeInTheDocument()
  expect(screen.queryByLabelText(/start date/i)).toBeInTheDocument()
  userEvent.click(buttonRemoveFromList)

  await waitForLoadingToFinish()

  expect(
    screen.queryByRole('button', {
      name: /remove from list/i,
    }),
  ).not.toBeInTheDocument()
  expect(screen.getByRole('button', {name: /add to list/i})).toBeInTheDocument()
  expect(
    screen.queryByRole('textbox', {name: /notes/i}),
  ).not.toBeInTheDocument()
  expect(screen.queryByLabelText(/start date/i)).not.toBeInTheDocument()
})

test('EC5: can mark a list item as read', async () => {
  const user = await loginAsUser()
  const book = await booksDB.create(buildBook())
  const listItem = await listItemsDB.create(
    buildListItem({owner: user, book, finishDate: null}),
  )
  await renderBookScreen({user, book, listItem})

  // Kent's solution
  // const {listItem} = await renderBookScreen()
  // listItemsDB.update(listItem.id, {finishDate: null})

  const buttonMarkAsRead = screen.getByRole('button', {
    name: /mark as read/i,
  })

  expect(buttonMarkAsRead).toBeInTheDocument()
  expect(screen.queryByLabelText(/start date/i)).toBeInTheDocument()
  userEvent.click(buttonMarkAsRead)

  await waitForLoadingToFinish()

  expect(
    screen.queryByRole('button', {
      name: /mark as read/i,
    }),
  ).not.toBeInTheDocument()
  expect(
    screen.getByRole('button', {name: /mark as unread/i}),
  ).toBeInTheDocument()
  expect(screen.queryAllByRole('radio', {name: /star/i})).toHaveLength(5)
  expect(screen.queryByRole('textbox', {name: /notes/i})).toBeInTheDocument()

  const startAndFinishDate = screen.getByLabelText(/start and finish date/i)
  expect(startAndFinishDate).toHaveTextContent(
    `${formatDate(listItem.startDate)} — ${formatDate(Date.now())}`,
  )
})

test('EC5: can edit a note', async () => {
  jest.useFakeTimers()
  const {listItem} = await renderBookScreen()

  const textboxNotes = screen.getByRole('textbox', {name: /notes/i})
  const textNotes = 'Edited note here.'
  // const fakeNotes = faker.lorem.words() // Kent's approach for getting text data for testing
  userEvent.clear(textboxNotes)
  userEvent.type(textboxNotes, textNotes)

  // Wait for the loading label to appear, it then gets removed very quickly
  await screen.findByLabelText(/loading/i)
  // wait for the loading spinner to go away
  await waitForLoadingToFinish()

  expect(textboxNotes).toHaveTextContent(textNotes)

  expect(await listItemsDB.read(listItem.id)).toMatchObject({
    notes: textNotes,
  })
})

async function renderBookScreen({user, book, listItem} = {}) {
  user = typeof user === 'undefined' ? await loginAsUser() : user
  book = typeof book === 'undefined' ? await booksDB.create(buildBook()) : book
  listItem =
    typeof listItem === 'undefined'
      ? await listItemsDB.create(buildListItem({owner: user, book}))
      : listItem
  const route = `/book/${book.id}`

  return {...(await render(<App />, {user, route})), user, book, listItem}
}

test('EC7: shows an error message when the book fails to load', async () => {
  jest.spyOn(console, 'error').mockImplementation(() => {})
  // console.error = jest.fn(() => {})
  const book = buildBook()
  await renderBookScreen({book, listItem: null})

  const alert = await screen.findByRole('alert')
  expect(within(alert).getByText('There was an error:')).toBeInTheDocument()
  expect(within(alert).getByText('Book not found')).toBeInTheDocument()
  // Kent's solution
  expect(alert.textContent).toMatchInlineSnapshot(
    `"There was an error: Book not found"`,
  )
  expect(console.error).toHaveBeenCalledTimes(3)
})

test('EC7: note update failures are displayed', async () => {
  // use fake timers to skip debounce time on editing a note
  jest.useFakeTimers()
  jest.spyOn(console, 'error').mockImplementation(() => {})

  const {listItem} = await renderBookScreen()
  const apiURL = process.env.REACT_APP_API_URL

  const testErrorMessage = '__test_error_message__'
  server.use(
    rest.put(`${apiURL}/list-items/:listItemId`, async (req, res, ctx) => {
      return res(
        ctx.status(400),
        ctx.json({status: 400, message: testErrorMessage}),
      )
    }),
  )

  const textboxNotes = screen.getByRole('textbox', {name: /notes/i})
  const fakeNotes = 'fake notes here' //faker.lorem.words()
  userEvent.clear(textboxNotes)
  userEvent.type(textboxNotes, fakeNotes)
  // Wait for the loading label to appear, it then gets removed very quickly
  await screen.findByLabelText(/loading/i)
  // wait for the loading spinner to go away
  await waitForLoadingToFinish()

  expect(screen.getByRole('alert').textContent).toMatchInlineSnapshot(
    `"There was an error: __test_error_message__"`,
  )
  expect(console.error).toHaveBeenCalledTimes(1)
  expect(await listItemsDB.read(listItem.id)).not.toMatchObject({
    notes: fakeNotes,
  })
})
