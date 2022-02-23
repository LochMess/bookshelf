import {formatDate} from '../misc'

test('formatDate formats the date to look nice', () => {
  const date = new Date(2020, 2, 1)
  expect(formatDate(date)).toBe('Mar 20')
})

test('formatDate formats the date for years before 2000', () => {
  const date = new Date(1971, 0, 19)
  expect(formatDate(date)).toBe('Jan 71')
})
