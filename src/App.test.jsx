import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'

const mockBank = { Section: { A: [], B: [] } }

vi.mock('./data/questions.js', () => ({
  questionBank: mockBank
}))

vi.mock('./scheduler.js', () => ({
  aggregateTopicStats: () => ({
    A: { correct: 5, total: 10 },
    B: { correct: 9, total: 10 }
  })
}))

import App from './App.jsx'

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('renders header', () => {
    render(<App />)
    expect(screen.getByText(/Real Estate Quiz/i)).toBeInTheDocument()
  })

  it('filters to weak topics when enabled', () => {
    render(<App />)
    const weakToggle = screen.getByLabelText(/Focus on Weak Topics/i)
    fireEvent.click(weakToggle)
    const aBox = screen.getByLabelText('A')
    const bBox = screen.getByLabelText('B')
    expect(aBox.checked).toBe(true)
    expect(bBox.checked).toBe(false)
  })
})
