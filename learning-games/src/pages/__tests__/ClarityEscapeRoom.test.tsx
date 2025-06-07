import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, fireEvent, waitFor } from '@testing-library/react'
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
  vi.spyOn(global, 'fetch').mockResolvedValue({
    json: async () => ({ choices: [{ message: { content: 'yes' } }] }),
  } as unknown as Response)
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('ClarityEscapeRoom', () => {
  it('increments openPercent and reveals next segment on valid prompt', async () => {
    const { getByLabelText, getByText, findByText } = setup()
    const input = getByLabelText(/your prompt/i)
    fireEvent.change(input, { target: { value: 'any text' } })
    fireEvent.submit(input.closest('form')!)
    await waitFor(() => expect(getByText(/door 2/i)).toBeTruthy())
    expect(await findByText(/The door unlocks with a click/i)).toBeTruthy()
  })

  it('limits input to 100 characters', () => {
    const { getAllByLabelText } = setup()
    const input = getAllByLabelText(/your prompt/i)[0] as HTMLInputElement
    const longText = 'a'.repeat(150)
    fireEvent.change(input, { target: { value: longText } })
    expect(input.value.length).toBeLessThanOrEqual(100)
  })
})
