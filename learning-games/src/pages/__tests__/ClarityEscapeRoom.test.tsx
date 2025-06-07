import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ClarityEscapeRoom from '../ClarityEscapeRoom'
import { UserProvider } from '../../context/UserProvider'

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
  it('increments openPercent and reveals next segment on valid prompt', () => {
    const { getByLabelText, getByText } = setup()
    const input = getByLabelText(/your prompt/i)
    fireEvent.change(input, { target: { value: 'rewrite formal' } })
    fireEvent.submit(input.closest('form')!)
    expect(getByText(/door 2/i)).toBeTruthy()
    expect(getByText(/The door unlocks with a click/i)).toBeTruthy()
  })

  it('limits input to 100 characters', () => {
    const { getAllByLabelText } = setup()
    const input = getAllByLabelText(/your prompt/i)[0] as HTMLInputElement
    const longText = 'a'.repeat(150)
    fireEvent.change(input, { target: { value: longText } })
    expect(input.value.length).toBeLessThanOrEqual(100)
  })
})
