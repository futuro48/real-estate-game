import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockQuestions = {
  Section: {
    Topic: [
      {
        topic: 'Topic',
        question: 'Sample question?',
        options: { A: 'Option A', B: 'Option B' },
        answer: 'A',
        explanation: 'Because A'
      }
    ]
  }
}

const mockUpdateRecord = vi.fn()

vi.mock('./data/questions.js', () => ({
  questionBank: mockQuestions
}))

vi.mock('./scheduler.js', () => ({
  buildDueQuestions: (topics, bank) => {
    const list = []
    Object.values(bank).forEach(section => {
      Object.entries(section).forEach(([topic, qs]) => {
        if (!topics.includes(topic)) return
        qs.forEach((q, i) => {
          list.push({ ...q, id: `${topic}-${i}` })
        })
      })
    })
    return list
  },
  updateRecord: mockUpdateRecord
}))

import Quiz from './Quiz.jsx'

describe('Quiz component', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('renders question and options', () => {
    render(
      <Quiz onComplete={() => {}} duration={60} topics={['Topic']} questionCount={1} />
    )

    expect(screen.getByText('Sample question?')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Option A/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Option B/i })).toBeInTheDocument()
  })

  it('handles correct answer and shows summary', () => {
    render(
      <Quiz onComplete={() => {}} duration={60} topics={['Topic']} questionCount={1} />
    )

    fireEvent.click(screen.getByRole('button', { name: /Option A/i }))

    expect(screen.getByText(/Correct!/i)).toBeInTheDocument()
    expect(mockUpdateRecord).toHaveBeenCalledWith('Topic-0', true)

    fireEvent.click(screen.getByRole('button', { name: /See Results/i }))

    expect(screen.getByText(/Quiz Complete!/i)).toBeInTheDocument()
    expect(screen.getByText(/1\/1/)).toBeInTheDocument()
  })

  it('handles incorrect answer and updates score', () => {
    render(
      <Quiz onComplete={() => {}} duration={60} topics={['Topic']} questionCount={1} />
    )

    fireEvent.click(screen.getByRole('button', { name: /Option B/i }))

    expect(screen.getByText(/Incorrect/i)).toBeInTheDocument()
    expect(mockUpdateRecord).toHaveBeenCalledWith('Topic-0', false)

    fireEvent.click(screen.getByRole('button', { name: /See Results/i }))

    expect(screen.getByText(/Quiz Complete!/i)).toBeInTheDocument()
    expect(screen.getByText(/0\/1/)).toBeInTheDocument()
  })
})

