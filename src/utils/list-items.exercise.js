import {useQuery, useMutation, queryCache} from 'react-query'
import {client} from './api-client'

function useListItems(user) {
  const {data: listItems} = useQuery({
    queryKey: 'list-items',
    queryFn: () =>
      client(`list-items`, {token: user.token}).then(data => data.listItems),
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
  onSettled: () => queryCache.invalidateQueries('list-items'),
}

function useUpdateListItem(user) {
  const [update] = useMutation(
    updates =>
      client(`list-items/${updates.id}`, {
        method: 'PUT',
        token: user.token,
        data: updates,
      }),
    defaultMutationOptions,
  )
  return update
}

function useRemoveListItem(user) {
  const [remove] = useMutation(
    id => client(`list-items/${id}`, {method: 'DELETE', token: user.token}),
    defaultMutationOptions,
  )
  return remove
}

function useCreateListItem(user) {
  const [create] = useMutation(
    id => client(`list-items`, {data: {bookId: id}, token: user.token}),
    defaultMutationOptions,
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
