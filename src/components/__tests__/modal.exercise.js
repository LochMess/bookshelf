// 🐨 you're gonna need this stuff:
import * as React from 'react'
import {Modal, ModalContents, ModalOpenButton} from '../modal'
import {render, screen, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {Button} from '../lib'

// 🐨 render the Modal, ModalOpenButton, and ModalContents
// 🐨 click the open button
// 🐨 verify the modal contains the modal contents, title, and label
// 🐨 click the close button
// 🐨 verify the modal is no longer rendered
// 💰 (use `query*` rather than `get*` or `find*` queries to verify it is not rendered)
test('can be opened and closed', () => {
  const contents = 'Welcome hello'
  render(
    <Modal>
      <ModalOpenButton>
        <Button variant="primary">Login</Button>
      </ModalOpenButton>
      <ModalContents aria-label="Login form" title="Login">
        <p>{contents}</p>
      </ModalContents>
    </Modal>,
  )
  userEvent.click(screen.getByRole('button', {name: /login/i}))
  const modal = screen.getByRole('dialog')

  // Same assertion
  expect(screen.getByLabelText(/Login form/i)).toBeInTheDocument()
  expect(modal).toHaveAttribute('aria-label', "Login form")

  expect(modal).toBeInTheDocument()
  const modalContents = within(modal)
  expect(
    modalContents.getByRole('heading', {name: /login/i}),
  ).toBeInTheDocument()
  expect(modalContents.getByText(contents)).toBeInTheDocument()

  userEvent.click(screen.getByRole('button', {name: /close/i}))
  expect(modal).not.toBeInTheDocument()
})
