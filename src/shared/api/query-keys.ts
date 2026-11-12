// One factory per domain, from general to specific, so invalidation can target a whole domain.
export const healthKeys = {
  all: ['health'] as const,
};
