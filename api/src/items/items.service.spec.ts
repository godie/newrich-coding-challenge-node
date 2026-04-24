import { ItemsService } from './items.service';

describe('ItemsService', () => {
  let service: ItemsService;

  beforeEach(() => {
    service = new ItemsService();
  });

  it('filters active items', () => {
    const result = service.listItems({ active: 'true' });

    expect(result.length).toBeGreaterThan(0);
    expect(result.every((item) => item.active)).toBe(true);
  });

  it('applies text search', () => {
    const result = service.listItems({ search: 'alp' });

    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe('Alpha');
  });

  it('sorts by score descending', () => {
    const result = service.listItems({ sortBy: 'score', sortDirection: 'desc' });

    expect(result[0]?.score).toBeGreaterThanOrEqual(result[1]?.score ?? 0);
  });
});
