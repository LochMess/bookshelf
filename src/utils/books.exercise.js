import {useQuery, queryCache} from 'react-query'
import {client} from './api-client'
import bookPlaceholderSvg from 'assets/book-placeholder.svg'

const loadingBook = {
  title: 'Loading...',
  author: 'loading...',
  coverImageUrl: bookPlaceholderSvg,
  publisher: 'Loading Publishing',
  synopsis: 'Loading...',
  loadingBook: true,
}

const loadingBooks = Array.from({length: 10}, (v, index) => ({
  id: `loading-book-${index}`,
  ...loadingBook,
}))

const bookQueryConfig = (query, user) => ({
  queryKey: ['bookSearch', {query}],
  queryFn: () =>
    client(`books?query=${encodeURIComponent(query)}`, {
      token: user.token,
    }).then(data => data.books),
  config: {
    onSuccess(result) {
      return result.forEach(book => setQueryDataForBook(book))
    },
  },
})

function useBookSearch(query, user) {
  const {data, error, isLoading, isError, isSuccess} = useQuery(
    bookQueryConfig(query, user),
  )

  return {books: data ?? loadingBooks, error, isLoading, isError, isSuccess}
}

function useBook(bookId, user) {
  const {data: book} = useQuery({
    queryKey: ['book', {bookId}],
    queryFn: () =>
      client(`books/${bookId}`, {token: user.token}).then(data => data.book),
  })

  return book ?? loadingBook
}

function refetchBookSearchQuery(user) {
  queryCache.removeQueries('bookSearch')
  queryCache.prefetchQuery(bookQueryConfig('', user))
}

function setQueryDataForBook(book) {
  queryCache.setQueryData(['book', {bookId: book.id}], book)
}

export {useBook, useBookSearch, refetchBookSearchQuery, setQueryDataForBook}
