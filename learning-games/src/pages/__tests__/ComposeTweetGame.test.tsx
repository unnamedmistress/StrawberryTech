
import { describe, it, expect, afterEach } from 'vitest'
import { render, fireEvent, cleanup } from '@testing-library/react'

import { MemoryRouter } from 'react-router-dom'
import ComposeTweetGame from '../ComposeTweetGame'
import { UserProvider } from '../../../../shared/UserProvider'

function setup() {
  return render(
    <MemoryRouter>
      <UserProvider>
        <ComposeTweetGame />
      </UserProvider>
    </MemoryRouter>
  )
}

afterEach(() => {
  cleanup()

})

describe('ComposeTweetGame', () => {
  it('unlocks door when prompt score is high enough', () => {
    const { getByLabelText, getByRole, getByText } = setup()
    const input = getByLabelText(/input your guess/i)

    fireEvent.change(input, { target: { value: 'Write a quick tweet about reading a new book' } })
    fireEvent.click(getByRole('button', { name: /submit your guess/i }))
    expect(getByText(/door is unlocked/i)).toBeTruthy()
  })

  it('shows tips when guess is not close enough', () => {
    const { getByLabelText, getByRole, getByText } = setup()
    const input = getByLabelText(/input your guess/i)
    fireEvent.change(input, { target: { value: 'hello world' } })
    fireEvent.click(getByRole('button', { name: /submit your guess/i }))
    expect(getByText(/include key words/i)).toBeTruthy()
  })
})
