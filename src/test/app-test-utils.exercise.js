import {
  render as defaultRender,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import {buildUser} from 'test/generate'
import * as auth from 'auth-provider'
import {AppProviders} from 'context'
import '@testing-library/jest-dom'
import * as usersDB from 'test/data/users'
import userEvent from '@testing-library/user-event'

function waitForLoadingToFinish() {
  return waitForElementToBeRemoved(() => [
    ...screen.queryAllByLabelText(/loading/i),
    ...screen.queryAllByText(/loading/i),
  ])
}

async function render(
  component,
  {route = '/list', user, ...renderOptions} = {},
) {
  user = typeof user === 'undefined' ? await loginAsUser() : user

  window.history.pushState({}, 'test book page', route)

  const renderResult = defaultRender(component, {
    wrapper: AppProviders,
    ...renderOptions,
  })

  await waitForLoadingToFinish()

  return {...renderResult, user}
}

async function loginAsUser(overrides) {
  const user = buildUser(overrides)
  await usersDB.create(user)
  const authUser = await usersDB.authenticate(user)
  window.localStorage.setItem(auth.localStorageKey, authUser.token)
  return authUser
}

export * from '@testing-library/react'
export {render, defaultRender, waitForLoadingToFinish, loginAsUser, userEvent}
