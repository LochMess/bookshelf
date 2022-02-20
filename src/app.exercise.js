import * as React from 'react'
import {useAuth} from './context/auth-context'
// 🐨 you'll want to render the FullPageSpinner as the fallback
import {FullPageSpinner} from './components/lib'

// 🐨 exchange these for React.lazy calls
const AuthenticatedApp = React.lazy(() =>
  import(/* webpackPrefetch: true */ './authenticated-app'),
  // import('./authenticated-app'),
)
const UnauthenticatedApp = React.lazy(() => import('./unauthenticated-app'))
// import AuthenticatedApp from './authenticated-app'
// import UnauthenticatedApp from './unauthenticated-app'

function App() {
  const {user} = useAuth()
  // 🐨 wrap this in a <React.Suspense /> component
  return (
    <React.Suspense fallback={<FullPageSpinner />}>
      {user ? <AuthenticatedApp /> : <UnauthenticatedApp />}
    </React.Suspense>
  )
}

export {App}
