// 🐨 you'll need to import React and ReactDOM up here
import React from 'react'
import ReactDOM from 'react-dom'
import Dialog from '@reach/dialog'
import VisuallyHidden from '@reach/visually-hidden'
import '@reach/dialog/styles.css'

// 🐨 you'll also need to import the Logo component from './components/logo'
import {Logo} from './components/logo'

// 🐨 create an App component here and render the logo, the title ("Bookshelf"), a login button, and a register button.
// 🐨 for fun, you can add event handlers for both buttons to alert that the button was clicked
const Form = ({onSubmit, buttonText}) => {
  function handleSubmit(event) {
    event.preventDefault()
    const {
      fUsername: {value: username},
      fPassword: {value: password},
    } = event.target.elements
    onSubmit({
      username,
      password,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label for="fUserName">Username:</label>
        <input type="text" id="fUserName" name="fUsername" />
      </div>
      <div>
        <label for="Password">Password:</label>
        <input type="password" id="fPassword" name="fPassword" />
      </div>
      <div>
        <button type="submit">{buttonText}</button>
      </div>
    </form>
  )
}

const LoginModal = ({isOpen, onClose}) => {
  return (
    <Dialog aria-label="Login form" isOpen={isOpen} onDismiss={onClose}>
      <button className="close-button" onClick={onClose}>
        <VisuallyHidden>Close</VisuallyHidden>
        <span aria-hidden>×</span>
      </button>
      <h3>Login</h3>
      <Form
        onSubmit={formData =>
          console.log('Login form data submitted', formData)
        }
        buttonText="Login"
      />
    </Dialog>
  )
}

const RegisterModal = ({isOpen, onClose}) => {
  return (
    <Dialog aria-label="Register form" isOpen={isOpen} onDismiss={onClose}>
      <button className="close-button" onClick={onClose}>
        <VisuallyHidden>Close</VisuallyHidden>
        <span aria-hidden>×</span>
      </button>
      <h3>Register</h3>
      <Form
        onSubmit={formData =>
          console.log('Register form data submitted', formData)
        }
        buttonText="Register"
      />
    </Dialog>
  )
}

const App = () => {
  const [openModal, setOpenModal] = React.useState('none')

  function handleLogin() {
    setOpenModal('login')
  }

  function handleRegister() {
    setOpenModal('register')
  }

  return (
    <div>
      <Logo />
      <h1>Bookshelf</h1>
      <LoginModal
        isOpen={openModal === 'login'}
        onClose={() => setOpenModal('none')}
      />
      <RegisterModal
        isOpen={openModal === 'register'}
        onClose={() => setOpenModal('none')}
      />
      <div>
        <button onClick={handleLogin}>Login</button>
      </div>
      <div>
        <button onClick={handleRegister}>Register</button>
      </div>
    </div>
  )
}

// 🐨 use ReactDOM to render the <App /> to the root element
// 💰 find the root element with: document.getElementById('root')
ReactDOM.render(<App />, document.getElementById('root'))
