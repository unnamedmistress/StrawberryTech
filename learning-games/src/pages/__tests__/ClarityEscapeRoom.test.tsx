import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ClarityEscapeRoom from '../ClarityEscapeRoom'
import { UserProvider } from '../../shared/UserProvider'

function setup() {
  return render(
    <MemoryRouter>
      <UserProvider>
        <ClarityEscapeRoom />
      </UserProvider>
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.spyOn(Math, 'random').mockReturnValue(0)
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('ClarityEscapeRoom', () => {
  it('unlocks the door when the guess matches', async () => {
    const { getByLabelText, findByText } = setup()
    const input = getByLabelText(/your prompt/i)
    fireEvent.change(input, { target: { value: 'Write a thank you note to a teacher' } })
    fireEvent.submit(input.closest('form')!)
    expect(await findByText(/Door unlocked/i)).toBeTruthy()
  })

  it('limits input to 100 characters', () => {
    const { getAllByLabelText } = setup()
    const input = getAllByLabelText(/your prompt/i)[0] as HTMLInputElement
    const longText = 'a'.repeat(150)
    fireEvent.change(input, { target: { value: longText } })
    expect(input.value.length).toBeLessThanOrEqual(100)
  })
})
