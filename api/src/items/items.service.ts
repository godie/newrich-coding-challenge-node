import { Injectable } from '@nestjs/common';
import { ITEMS_DATA, ItemRecord } from './data';

export type ListItemsQuery = {
  active?: string;
  search?: string;
  category?: string;
  sortBy?: string;
  sortDirection?: string;
};

@Injectable()
export class ItemsService {
  private readonly items: ItemRecord[] = [...ITEMS_DATA];

  listItems(query: ListItemsQuery): ItemRecord[] {
    let results = [...this.items];

    // Intentionally permissive parsing to leave room for candidate improvements.
    if (query.active !== undefined && query.active !== 'all') {
      const activeValue = query.active === 'true';
      results = results.filter((item) => item.active === activeValue);
    }

    if (query.search) {
      const term = query.search.toLowerCase();
      results = results.filter((item) => item.name.toLowerCase().includes(term));
    }

    if (query.category) {
      results = results.filter((item) => item.category === query.category);
    }

    const sortBy = query.sortBy || 'order';
    const sortDirection = query.sortDirection === 'desc' ? -1 : 1;

    results.sort((a, b) => {
      const left = this.getSortableValue(a, sortBy);
      const right = this.getSortableValue(b, sortBy);

      if (left < right) {
        return -1 * sortDirection;
      }
      if (left > right) {
        return 1 * sortDirection;
      }
      return 0;
    });

    return results;
  }

  private getSortableValue(item: ItemRecord, sortBy: string): string | number | boolean {
    const value = (item as unknown as Record<string, string | number | boolean>)[sortBy];
    if (value === undefined) {
      return item.order;
    }

    return value;
  }
}
