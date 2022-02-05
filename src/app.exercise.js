/** @jsx jsx */
import {jsx} from '@emotion/core'

import * as React from 'react'
// 🐨 you're going to need this:
import * as auth from 'auth-provider'
import {AuthenticatedApp} from './authenticated-app'
import {UnauthenticatedApp} from './unauthenticated-app'
import {client} from './utils/api-client.exercise'

async function loadProfile() {
  let user = null

  const token = await auth.getToken()

  if (token) {
    // we're logged in! Let's go get the user's data:
    await client('me', {Authorization: `Bearer ${token}`}).then(data => {
      console.log(data.user)
      user = data.user
    })
  }

  return user
}

function App() {
  // 🐨 useState for the user
  const [user, setUser] = React.useState(null)
  // 🐨 create a login function that calls auth.login then sets the user
  // 💰 const login = form => auth.login(form).then(u => setUser(u))
  const login = form => auth.login(form).then(u => setUser(u))
  // 🐨 create a registration function that does the same as login except for register
  const register = form => auth.register(form).then(u => setUser(u))

  // 🐨 create a logout function that calls auth.logout() and sets the user to null
  const logout = () => {
    auth.logout()
    setUser(null)
  }
  // 🐨 if there's a user, then render the AuthenticatedApp with the user and logout
  // 🐨 if there's not a user, then render the UnauthenticatedApp with login and register

  React.useEffect(() => {
    loadProfile().then(user => {
      console.log('user result', user)
      setUser(user)
    })
  }, [])

  return user ? (
    <AuthenticatedApp user={user} logout={logout} />
  ) : (
    <UnauthenticatedApp login={login} register={register} />
  )
}

export {App}

/*
eslint
  no-unused-vars: "off",
*/
