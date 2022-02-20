/** @jsx jsx */
import {jsx} from '@emotion/core'
import * as auth from 'auth-provider'
import {FullPageErrorFallback, FullPageSpinner} from 'components/lib'
import * as React from 'react'
import {queryCache} from 'react-query'
import {client} from 'utils/api-client'
import {useAsync} from 'utils/hooks'
import {setQueryDataForBook} from 'utils/books'

async function getUser() {
  console.log('getUser')
  let user = null

  const token = await auth.getToken()
  if (token) {
    // const data = await client('me', {token})
    const data = await client('bootstrap', {token})
    console.log('data from /bootstrap', data)
    user = data.user
    queryCache.setQueryData('list-items', data.listItems, {
      staleTime: 5000,
    })
    for (const listItem of data.listItems) {
      setQueryDataForBook(listItem.book)
    }
  }

  return user
}

const AuthContext = React.createContext()
AuthContext.displayName = 'AuthContext'

const userPromise = getUser()

function AuthProvider(props) {
  const {
    data: user,
    error,
    isLoading,
    isIdle,
    isError,
    isSuccess,
    run,
    setData,
    status,
  } = useAsync()

  React.useEffect(() => {
    // we need to call getUser() sooner.
    // 🐨 move the next line to just outside the AuthProvider
    // 🦉 this means that as soon as this module is imported,
    // it will start requesting the user's data so we don't
    // have to wait until the app mounts before we kick off
    // the request.
    // We're moving from "Fetch on render" to "Render WHILE you fetch"!
    console.log('useEffect')
    // const userPromise = getUser()
    run(userPromise)
  }, [run])

  const login = React.useCallback(
    form => auth.login(form).then(user => setData(user)),
    [setData],
  )
  const register = React.useCallback(
    form => auth.register(form).then(user => setData(user)),
    [setData],
  )
  const logout = React.useCallback(() => {
    auth.logout()
    setData(null)
  }, [setData])

  const value = React.useMemo(
    () => ({user, login, logout, register}),
    [login, logout, register, user],
  )

  if (isLoading || isIdle) {
    return <FullPageSpinner />
  }

  if (isError) {
    return <FullPageErrorFallback error={error} />
  }

  if (isSuccess) {
    return <AuthContext.Provider value={value} {...props} />
  }

  throw new Error(`Unhandled status: ${status}`)
}

function useAuth() {
  const context = React.useContext(AuthContext)
  if (context === undefined) {
    throw new Error(`useAuth must be used within a AuthProvider`)
  }
  return context
}

function useClient() {
  const {
    user: {token},
  } = useAuth()
  return React.useCallback(
    (endpoint, config) => client(endpoint, {...config, token}),
    [token],
  )
}

export {AuthProvider, useAuth, useClient}
