// import styled from '@emotion/styled'
import styled from '@emotion/styled/macro'
import {Dialog as ReachDialog} from '@reach/dialog'
import * as colors from 'styles/colors'
import * as mediaQueries from 'styles/media-queries'
import {FaSpinner} from 'react-icons/fa'
import { keyframes } from '@emotion/core'

// 🐨 create a button styled component here called "Button"
// make it look nice and allow it to support a "variant" prop which can be
// either "primary" or "secondary".
// 💰 don't forget to export it at the bottom!
// 💰 In my final version, I style padding, border, lineHeight, and borderRadius
//    the same for both types, and then change the background and color based
//    on the given variant.
// 🦉 remember, you don't have to make things look perfect or just like they
// do in the final example. Just make sure you understand how to create the
// styled component and accept a prop to change which styles apply.

const Button = styled.button(({variant = 'primary'}) => ({
  padding: '10px 15px',
  border: '0',
  lineHeight: '1',
  borderRadius: '3px',
  ...(variant === 'primary' ? StyleButtonPrimary : StyleButtonSecondary),
}))

// 🐨 Feel free to create as many reusable styled components here as you'd like
// 💰 in my finished version I have: Button, Input, CircleButton, Dialog, FormGroup

// 🎨 here are a bunch of styles you can copy/paste if you want

// Button variant="primary" (in addition to the above styles)
const StyleButtonPrimary = {
  background: colors.indigo,
  color: colors.base,
}

// Button variant="secondary" (in addition to the above styles)
const StyleButtonSecondary = {
  background: colors.gray,
  color: colors.text,
}

const Input = styled.input({
  borderRadius: '3px',
  border: `1px solid ${colors.gray10}`, // TODO? style the color inline?
  background: colors.gray,
  padding: '8px 12px',
})

const FormGroup = styled.div({
  display: 'flex',
  flexDirection: 'column',
})

// 💰 I'm giving a few of these to you:
const CircleButton = styled.button({
  borderRadius: '30px',
  padding: '0',
  width: '40px',
  height: '40px',
  lineHeight: '1',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: colors.base,
  color: colors.text,
  border: `1px solid ${colors.gray10}`,
  cursor: 'pointer',
})

const Dialog = styled(ReachDialog)({
  maxWidth: '450px',
  borderRadius: '3px',
  paddingBottom: '3.5em',
  boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.2)',
  margin: '20vh auto',
  [mediaQueries.small]: {
    width: '100%',
    margin: '10vh auto',
  },
})

const spin = keyframes({
  'from': { transform: 'rotate(0deg)' },
  'to': { transform: 'rotate(360deg)' }
})

const Spinner = styled(FaSpinner)({
  animation: `${spin} 0.5s linear infinite`,
  margin: '5px'
})

export {CircleButton, Dialog, Button, Input, FormGroup, Spinner}
