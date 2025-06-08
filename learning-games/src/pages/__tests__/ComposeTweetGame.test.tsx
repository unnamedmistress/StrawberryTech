import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ComposeTweetGame from '../ComposeTweetGame'

function setup() {
  return render(
    <MemoryRouter>
      <ComposeTweetGame />
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.spyOn(Math, 'random').mockReturnValue(0)
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('ComposeTweetGame', () => {
  it('unlocks door when prompt guessed correctly', () => {
    const { getByLabelText, getByRole, getByText } = setup()
    const input = getByLabelText(/input your guess/i)
    fireEvent.change(input, { target: { value: 'Write a tweet announcing our summer sale starting June 1st' } })
    fireEvent.click(getByRole('button', { name: /submit your guess/i }))
    expect(getByText(/door is unlocked/i)).toBeTruthy()
  })
})
