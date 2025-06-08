import { describe, it, expect } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ComposeTweetGame from '../ComposeTweetGame'
import { UserProvider } from '../../context/UserProvider'

function setup() {
  return render(
    <MemoryRouter>
      <UserProvider>
        <ComposeTweetGame />
      </UserProvider>
    </MemoryRouter>
  )
}

describe('ComposeTweetGame', () => {
  it('unlocks door when prompt guessed correctly', () => {
    const { getByLabelText, getByRole, getByText } = setup()
    const input = getByLabelText(/input your guess/i)
    fireEvent.change(input, { target: { value: 'Compose a tweet about reading a new book' } })
    fireEvent.click(getByRole('button', { name: /submit your guess/i }))
    expect(getByText(/door is unlocked/i)).toBeTruthy()
  })
})
