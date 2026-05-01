import { BadRequestException } from '@nestjs/common';
import {
  ACTIVE_FILTERS,
  SORT_FIELDS,
  SORT_DIRECTIONS,
  ActiveFilter,
  SortField,
  SortDirection,
} from './item-record';

export type ListItemsQuery = {
  active?: string;
  search?: string;
  category?: string;
  sortBy?: string;
  sortDirection?: string;
};

type NormalizedListItemsQuery = {
  active?: ActiveFilter;
  search?: string;
  category?: string;
  sortBy: SortField;
  sortDirection: SortDirection;
};

/** Compatibility aliases — accept common alternative query param names */
const SORT_BY_ALIASES: Record<string, string> = {
  sort: 'sortBy',
  sortby: 'sortBy',
};

const SORT_DIR_ALIASES: Record<string, string> = {
  dir: 'sortDirection',
  sortdir: 'sortDirection',
  direction: 'sortDirection',
  orderdir: 'sortDirection',
};

export function normalizeQuery(query: ListItemsQuery): NormalizedListItemsQuery {
  // Resolve compatibility aliases
  const resolved = resolveAliases(query);

  const active = parseActiveFilter(resolved.active);
  const sortBy = parseSortField(resolved.sortBy);
  const sortDirection = parseSortDirection(resolved.sortDirection);
  const search = resolved.search?.trim().toLowerCase() || undefined;
  const category = resolved.category?.trim().toLowerCase() || undefined;

  return { active, search, category, sortBy, sortDirection };
}

function resolveAliases(query: ListItemsQuery): ListItemsQuery {
  const resolved = { ...query } as Record<string, string | undefined>;

  const applyAliases = (aliases: Record<string, string>) => {
    for (const [alias, canonical] of Object.entries(aliases)) {
      if (resolved[alias] !== undefined && resolved[canonical] === undefined) {
        resolved[canonical] = resolved[alias];
      }
      delete resolved[alias];
    }
  };

  applyAliases(SORT_BY_ALIASES);
  applyAliases(SORT_DIR_ALIASES);

  return resolved as ListItemsQuery;
}

function parseActiveFilter(active?: string): ActiveFilter | undefined {
  if (active === undefined) return undefined;
  const normalizedActive = active.trim();

  if (!includesValue(ACTIVE_FILTERS, normalizedActive)) {
    throw new BadRequestException(
      `active must be one of: ${ACTIVE_FILTERS.join(', ')}`,
    );
  }

  return normalizedActive;
}

function parseSortField(sortBy?: string): SortField {
  const normalizedSortBy = sortBy?.trim();
  if (normalizedSortBy === undefined || normalizedSortBy === '') return 'order';

  if (!includesValue(SORT_FIELDS, normalizedSortBy)) {
    throw new BadRequestException(
      `sortBy must be one of: ${SORT_FIELDS.join(', ')}`,
    );
  }

  return normalizedSortBy;
}

function parseSortDirection(sortDirection?: string): SortDirection {
  const normalizedSortDirection = sortDirection?.trim();
  if (normalizedSortDirection === undefined || normalizedSortDirection === '') {
    return 'asc';
  }

  if (!includesValue(SORT_DIRECTIONS, normalizedSortDirection)) {
    throw new BadRequestException(
      `sortDirection must be one of: ${SORT_DIRECTIONS.join(', ')}`,
    );
  }

  return normalizedSortDirection;
}

function includesValue<T extends readonly string[]>(
  values: T,
  value: string,
): value is T[number] {
  return values.includes(value);
}
