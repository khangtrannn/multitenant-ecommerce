## tRPC
#### Query
```ts
const { data } = trpc.user.getAll.useQuery()
```
👉 internally =
```ts
useQuery({
  queryKey: ['user.getAll'],
  queryFn: () => trpc.user.getAll.query()
})
```

#### Mutation
```ts
const mutation = trpc.user.create.useMutation()
```

👉 internally =
```ts
useMutation({
  mutationFn: trpc.user.create.mutate
})
```