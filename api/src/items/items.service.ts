import { Injectable } from '@nestjs/common';
import { ItemRecord, SortField } from './item-record';
import { ItemsRepository } from './items.repository';
import { ListItemsQuery, normalizeQuery } from './items-query.mapper';

@Injectable()
export class ItemsService {
  constructor(private readonly repository: ItemsRepository) {}

  listItems(query: ListItemsQuery): ItemRecord[] {
    const { active, search, category, sortBy, sortDirection } =
      normalizeQuery(query);
    const dir = sortDirection === 'desc' ? -1 : 1;

    const results = this.repository.findAll().filter((item) => {
      if (active !== undefined && active !== 'all') {
        if (item.active !== (active === 'true')) return false;
      }

      if (category && item.category !== category) {
        return false;
      }

      if (search && !item.name.toLowerCase().includes(search)) {
        return false;
      }

      return true;
    });

    return results.sort((a, b) => {
      const left = this.getSortableValue(a, sortBy);
      const right = this.getSortableValue(b, sortBy);

      if (left === right) return 0;
      return left < right ? -1 * dir : 1 * dir;
    });
  }

  private getSortableValue(
    item: ItemRecord,
    sortBy: SortField,
  ): string | number {
    const value = item[sortBy];
    // Convert boolean to number for explicit, predictable sorting:
    // active=true → 1, active=false → 0
    // Ascending puts inactive (0) first; descending puts active (1) first.
    if (typeof value === 'boolean') return value ? 1 : 0;
    return value;
  }
}
