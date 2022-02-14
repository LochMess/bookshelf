// 🐨 create and export a React context variable for the AuthContext
// 💰 using React.createContext
import * as React from 'react'
import {useAsync} from 'utils/hooks'
import * as auth from 'auth-provider'
import {client} from 'utils/api-client'
import {FullPageSpinner, FullPageErrorFallback} from 'components/lib'

const AuthContext = React.createContext()
AuthContext.displayName = 'AuthContext'

const useAuth = () => {
  const authContext = React.useContext(AuthContext)
  if (authContext) return authContext
  throw new Error('useAuth can only be used within an AuthProvider')
}

async function getUser() {
  let user = null

  const token = await auth.getToken()
  if (token) {
    const data = await client('me', {token})
    user = data.user
  }

  return user
}

const AuthProvider = props => {
  const {
    data: user,
    error,
    isLoading,
    isIdle,
    isError,
    isSuccess,
    run,
    setData,
  } = useAsync()

  React.useEffect(() => {
    run(getUser())
  }, [run])

  const login = form => auth.login(form).then(user => setData(user))
  const register = form => auth.register(form).then(user => setData(user))
  const logout = () => {
    auth.logout()
    setData(null)
  }

  if (isLoading || isIdle) {
    return <FullPageSpinner />
  }

  if (isError) {
    return <FullPageErrorFallback error={error} />
  }

  if (isSuccess) {
    const value = {user, login, register, logout}
    return <AuthContext.Provider value={value} {...props} />
  }
}

function useClient() {
  const {
    user: {token},
  } = useAuth()
  return React.useCallback(
    function authenticatedClient(endpoint, config) {
      return client(endpoint, {...config, token})
    },
    [token],
  )
}

export {AuthProvider, useAuth, useClient}
