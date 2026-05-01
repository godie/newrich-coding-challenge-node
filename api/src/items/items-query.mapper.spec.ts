import { normalizeQuery, ListItemsQuery } from './items-query.mapper';
import { BadRequestException } from '@nestjs/common';

describe('normalizeQuery', () => {
  // --- Defaults ---

  it('defaults sortBy to "order" and sortDirection to "asc" when omitted', () => {
    const result = normalizeQuery({});

    expect(result.sortBy).toBe('order');
    expect(result.sortDirection).toBe('asc');
  });

  it('defaults sortBy to "order" when empty string', () => {
    const result = normalizeQuery({ sortBy: '' });

    expect(result.sortBy).toBe('order');
  });

  it('defaults sortDirection to "asc" when empty string', () => {
    const result = normalizeQuery({ sortDirection: '' });

    expect(result.sortDirection).toBe('asc');
  });

  // --- active filter ---

  it('accepts "true" as active filter', () => {
    expect(normalizeQuery({ active: 'true' }).active).toBe('true');
  });

  it('accepts "false" as active filter', () => {
    expect(normalizeQuery({ active: 'false' }).active).toBe('false');
  });

  it('accepts "all" as active filter', () => {
    expect(normalizeQuery({ active: 'all' }).active).toBe('all');
  });

  it('returns undefined active when omitted', () => {
    expect(normalizeQuery({}).active).toBeUndefined();
  });

  it('trims active filter value', () => {
    expect(normalizeQuery({ active: '  true  ' }).active).toBe('true');
  });

  it('rejects invalid active filter', () => {
    expect(() => normalizeQuery({ active: 'yes' })).toThrow(BadRequestException);
    expect(() => normalizeQuery({ active: 'yes' })).toThrow(
      'active must be one of: true, false, all',
    );
  });

  // --- search ---

  it('trims and lowercases search term', () => {
    expect(normalizeQuery({ search: '  GAM  ' }).search).toBe('gam');
  });

  it('returns undefined search when omitted', () => {
    expect(normalizeQuery({}).search).toBeUndefined();
  });

  it('returns undefined search when only whitespace', () => {
    expect(normalizeQuery({ search: '   ' }).search).toBeUndefined();
  });

  // --- category ---

  it('trims category value', () => {
    expect(normalizeQuery({ category: '  growth  ' }).category).toBe('growth');
  });

  it('returns undefined category when omitted', () => {
    expect(normalizeQuery({}).category).toBeUndefined();
  });

  it('returns undefined category when only whitespace', () => {
    expect(normalizeQuery({ category: '   ' }).category).toBeUndefined();
  });

  // --- sortBy ---

  it.each(['id', 'name', 'active', 'category', 'score', 'order'] as const)(
    'accepts "%s" as sortBy',
    (field) => {
      expect(normalizeQuery({ sortBy: field }).sortBy).toBe(field);
    },
  );

  it('trims sortBy value', () => {
    expect(normalizeQuery({ sortBy: '  score  ' }).sortBy).toBe('score');
  });

  it('rejects invalid sortBy', () => {
    expect(() => normalizeQuery({ sortBy: 'createdAt' })).toThrow(BadRequestException);
    expect(() => normalizeQuery({ sortBy: 'createdAt' })).toThrow(
      'sortBy must be one of: id, name, active, category, score, order',
    );
  });

  // --- sortDirection ---

  it('accepts "asc" as sortDirection', () => {
    expect(normalizeQuery({ sortDirection: 'asc' }).sortDirection).toBe('asc');
  });

  it('accepts "desc" as sortDirection', () => {
    expect(normalizeQuery({ sortDirection: 'desc' }).sortDirection).toBe('desc');
  });

  it('trims sortDirection value', () => {
    expect(normalizeQuery({ sortDirection: '  desc  ' }).sortDirection).toBe('desc');
  });

  it('rejects invalid sortDirection', () => {
    expect(() => normalizeQuery({ sortDirection: 'sideways' })).toThrow(BadRequestException);
    expect(() => normalizeQuery({ sortDirection: 'sideways' })).toThrow(
      'sortDirection must be one of: asc, desc',
    );
  });

  // --- Compatibility aliases (resolveAliases) ---

  it('resolves "sort" alias to "sortBy"', () => {
    expect(normalizeQuery({ sort: 'name' } as ListItemsQuery).sortBy).toBe('name');
  });

  it('resolves "sortby" alias to "sortBy" (case-insensitive key)', () => {
    expect(normalizeQuery({ sortby: 'score' } as ListItemsQuery).sortBy).toBe('score');
  });

  it('resolves "dir" alias to "sortDirection"', () => {
    expect(normalizeQuery({ dir: 'desc' } as ListItemsQuery).sortDirection).toBe('desc');
  });

  it('resolves "sortdir" alias to "sortDirection"', () => {
    expect(normalizeQuery({ sortdir: 'asc' } as ListItemsQuery).sortDirection).toBe('asc');
  });

  it('resolves "direction" alias to "sortDirection"', () => {
    expect(normalizeQuery({ direction: 'desc' } as ListItemsQuery).sortDirection).toBe('desc');
  });

  it('resolves "orderdir" alias to "sortDirection"', () => {
    expect(normalizeQuery({ orderdir: 'asc' } as ListItemsQuery).sortDirection).toBe('asc');
  });

  it('does not override explicit sortBy when alias is also present', () => {
    // Canonical param takes priority over alias
    expect(normalizeQuery({ sortBy: 'score', sort: 'name' } as ListItemsQuery).sortBy).toBe('score');
  });

  it('does not override explicit sortDirection when alias is also present', () => {
    expect(
      normalizeQuery({ sortDirection: 'asc', dir: 'desc' } as ListItemsQuery).sortDirection,
    ).toBe('asc');
  });

  it('resolves multiple aliases at once', () => {
    const result = normalizeQuery({ sort: 'name', dir: 'desc' } as ListItemsQuery);

    expect(result.sortBy).toBe('name');
    expect(result.sortDirection).toBe('desc');
  });

  // --- Combined normalization ---

  it('normalizes all fields together', () => {
    const result = normalizeQuery({
      active: '  true  ',
      search: '  ALP  ',
      category: '  core  ',
      sortBy: '  score  ',
      sortDirection: '  desc  ',
    });

    expect(result).toEqual({
      active: 'true',
      search: 'alp',
      category: 'core',
      sortBy: 'score',
      sortDirection: 'desc',
    });
  });

  it('preserves undefined fields when only some are provided', () => {
    const result = normalizeQuery({ active: 'false' });

    expect(result.active).toBe('false');
    expect(result.search).toBeUndefined();
    expect(result.category).toBeUndefined();
    expect(result.sortBy).toBe('order');
    expect(result.sortDirection).toBe('asc');
  });

  // --- Alias validation still applies ---

  it('validates sortBy value even when resolved from alias', () => {
    expect(() => normalizeQuery({ sort: 'invalid' } as ListItemsQuery)).toThrow(
      'sortBy must be one of: id, name, active, category, score, order',
    );
  });

  it('validates sortDirection value even when resolved from alias', () => {
    expect(() => normalizeQuery({ dir: 'up' } as ListItemsQuery)).toThrow(
      'sortDirection must be one of: asc, desc',
    );
  });

  it('defaults sortBy to "order" when alias resolves to empty string', () => {
    expect(normalizeQuery({ sort: '' } as ListItemsQuery).sortBy).toBe('order');
  });
});
