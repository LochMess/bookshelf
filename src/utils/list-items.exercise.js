import {useQuery, useMutation, queryCache} from 'react-query'
import {client} from './api-client'
import {setQueryDataForBook} from './books'

function useListItems(user) {
  const {data: listItems} = useQuery({
    queryKey: 'list-items',
    queryFn: () =>
      client(`list-items`, {token: user.token}).then(data => {
        return data.listItems
      }),
    config: {
      onSuccess: listItems =>
        listItems.forEach(item => setQueryDataForBook(item.book)),
    },
  })

  return listItems ?? []
}

function useListItem(user, bookId) {
  return (
    useListItems(user).find(currentBook => currentBook.bookId === bookId) ??
    null
  )
}

const defaultMutationOptions = {
  onError(error, paramUpdateWasCalledWith, recover) {
    if (typeof recover === 'function') {
      recover()
    }
  },
  onSettled() {
    queryCache.invalidateQueries('list-items')
  },
}

function useUpdateListItem(user, mutationOptions = {}) {
  return useMutation(
    updates =>
      client(`list-items/${updates.id}`, {
        method: 'PUT',
        token: user.token,
        data: updates,
      }),
    {
      ...defaultMutationOptions,
      onMutate(updates) {
        const originalListItems = queryCache.getQueryData('list-items')
        queryCache.setQueryData('list-items', oldListItems =>
          oldListItems.map(item =>
            item.id === updates.id ? {...item, ...updates} : item,
          ),
        )
        return () => queryCache.setQueryData('list-items', originalListItems)
      },
      ...mutationOptions,
    },
  )
}

function useRemoveListItem(user, mutationOptions = {}) {
  return useMutation(
    id => client(`list-items/${id}`, {method: 'DELETE', token: user.token}),
    {
      ...defaultMutationOptions,
      onMutate(removeId) {
        const originalListItems = queryCache.getQueryData('list-items')
        queryCache.setQueryData('list-items', oldListItems =>
          oldListItems.filter(item => item.id !== removeId),
        )
        return () => queryCache.setQueryData('list-items', originalListItems)
      },
      ...mutationOptions,
    },
  )
}

function useCreateListItem(user, mutationOptions = {}) {
  const [create] = useMutation(
    id => client(`list-items`, {data: {bookId: id}, token: user.token}),
    {...defaultMutationOptions, ...mutationOptions},
  )
  return create
}

export {
  useListItem,
  useListItems,
  useUpdateListItem,
  useRemoveListItem,
  useCreateListItem,
}
