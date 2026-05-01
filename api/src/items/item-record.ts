export type ItemRecord = {
  id: number;
  name: string;
  active: boolean;
  category: string;
  score: number;
  order: number;
};

export const ACTIVE_FILTERS = ['true', 'false', 'all'] as const;
export const SORT_FIELDS = ['id', 'name', 'active', 'category', 'score', 'order'] as const;
export const SORT_DIRECTIONS = ['asc', 'desc'] as const;

export type ActiveFilter = (typeof ACTIVE_FILTERS)[number];
export type SortField = (typeof SORT_FIELDS)[number];
export type SortDirection = (typeof SORT_DIRECTIONS)[number];
