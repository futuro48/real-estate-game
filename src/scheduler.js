export const DEFAULT_INTERVALS = [0, 1, 3, 7] // days for boxes 1-3

function load() {
  try {
    return JSON.parse(localStorage.getItem('schedule') || '{}')
  } catch {
    return {}
  }
}

function save(data) {
  localStorage.setItem('schedule', JSON.stringify(data))
}

export function getRecord(id) {
  const schedule = load()
  return schedule[id] || { box: 1, next: 0, correct: 0, total: 0 }
}

export function updateRecord(id, correct) {
  const schedule = load()
  const rec = schedule[id] || { box: 1, next: 0, correct: 0, total: 0 }
  if (correct) {
    rec.box = Math.min(rec.box + 1, 3)
    rec.correct += 1
  } else {
    rec.box = 1
  }
  rec.total += 1
  const days = DEFAULT_INTERVALS[rec.box]
  rec.next = Date.now() + days * 24 * 60 * 60 * 1000
  schedule[id] = rec
  save(schedule)
}

export function buildDueQuestions(topics, bank) {
  const schedule = load()
  const now = Date.now()
  const list = []
  Object.values(bank).forEach(section => {
    Object.entries(section).forEach(([topic, qs]) => {
      if (!topics.includes(topic)) return
      qs.forEach((q, i) => {
        const id = `${topic}-${i}`
        const rec = schedule[id]
        if (!rec || rec.next <= now) {
          list.push({ ...q, id })
        }
      })
    })
  })
  return list
}

export function aggregateTopicStats() {
  const schedule = load()
  const result = {}
  Object.entries(schedule).forEach(([id, rec]) => {
    const topic = id.split('-')[0]
    if (!result[topic]) result[topic] = { correct: 0, total: 0 }
    result[topic].correct += rec.correct
    result[topic].total += rec.total
  })
  return result
}
