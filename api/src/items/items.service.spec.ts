import { ItemsService } from './items.service';
import { ItemsRepository } from './items.repository';

describe('ItemsService', () => {
  let service: ItemsService;

  beforeEach(() => {
    service = new ItemsService(new ItemsRepository());
  });

  it('returns all items sorted by order ascending by default', () => {
    const result = service.listItems({});

    expect(result.map((item) => item.order)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('filters active items', () => {
    const result = service.listItems({ active: 'true' });

    expect(result.length).toBeGreaterThan(0);
    expect(result.every((item) => item.active)).toBe(true);
  });

  it('filters inactive items', () => {
    const result = service.listItems({ active: 'false' });

    expect(result.map((item) => item.name)).toEqual(['Bravo', 'Echo']);
  });

  it('does not filter by active status when active is all', () => {
    const result = service.listItems({ active: 'all' });

    expect(result).toHaveLength(6);
  });

  it('applies text search', () => {
    const result = service.listItems({ search: 'alp' });

    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe('Alpha');
  });

  it('applies case-insensitive trimmed text search', () => {
    const result = service.listItems({ search: '  GAM  ' });

    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe('Gamma');
  });

  it('filters by category', () => {
    const result = service.listItems({ category: 'growth' });

    expect(result.map((item) => item.name)).toEqual(['Delta', 'Foxtrot']);
  });

  it('combines active, category, and text filters', () => {
    const result = service.listItems({
      active: 'true',
      category: 'growth',
      search: 'fox',
    });

    expect(result.map((item) => item.name)).toEqual(['Foxtrot']);
  });

  it('returns an empty list for an unknown category filter', () => {
    const result = service.listItems({ category: 'unknown' });

    expect(result).toEqual([]);
  });

  it('sorts by score ascending', () => {
    const result = service.listItems({ sortBy: 'score', sortDirection: 'asc' });

    expect(result.map((item) => item.score)).toEqual([12, 15, 20, 30, 35, 45]);
  });

  it('sorts by score descending', () => {
    const result = service.listItems({ sortBy: 'score', sortDirection: 'desc' });

    expect(result.map((item) => item.score)).toEqual([45, 35, 30, 20, 15, 12]);
  });

  it('sorts by name descending', () => {
    const result = service.listItems({ sortBy: 'name', sortDirection: 'desc' });

    expect(result.map((item) => item.name)).toEqual([
      'Gamma',
      'Foxtrot',
      'Echo',
      'Delta',
      'Bravo',
      'Alpha',
    ]);
  });

  it('rejects invalid active filters', () => {
    expect(() => service.listItems({ active: 'yes' })).toThrow(
      'active must be one of: true, false, all',
    );
  });

  it('rejects unknown sort fields', () => {
    expect(() => service.listItems({ sortBy: 'createdAt' })).toThrow(
      'sortBy must be one of: id, name, active, category, score, order',
    );
  });

  it('rejects invalid sort directions', () => {
    expect(() => service.listItems({ sortDirection: 'sideways' })).toThrow(
      'sortDirection must be one of: asc, desc',
    );
  });
});
