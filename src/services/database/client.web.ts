// =============================================================================
// client.web.ts — Mock database client for web/server targets
// Prevents loading expo-sqlite and WebAssembly modules on web/SSR
// =============================================================================

export const expoDb = null as any;

export const db = {
  insert: () => ({
    values: async () => ({})
  }),
  select: () => ({
    from: () => ({
      where: () => ({
        orderBy: () => ({
          limit: () => ({
            offset: () => []
          }),
        }),
      }),
    }),
  }),
  update: () => ({
    set: () => ({
      where: async () => ({})
    })
  }),
  delete: () => ({
    where: async () => ({})
  })
} as any;
