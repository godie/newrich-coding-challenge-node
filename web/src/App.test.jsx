import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from './App';

function mockFetchWith(payload, ok = true, status = 200) {
  global.fetch = vi.fn().mockResolvedValue({
    ok,
    status,
    json: vi.fn().mockResolvedValue(payload),
  });
}

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders header and loads items from API', async () => {
    mockFetchWith({
      data: [{ id: 1, name: 'Alpha', active: true, category: 'core', score: 30, order: 1 }],
      total: 1
    });

    render(<App />);

    expect(await screen.findByText('Items Listing')).toBeInTheDocument();
    expect(await screen.findByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('1 item(s)')).toBeInTheDocument();
  });

  it('filters by active status', async () => {
    mockFetchWith({ data: [], total: 0 });

    render(<App />);

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());

    const statusSelect = screen.getByLabelText('Status');
    fireEvent.change(statusSelect, { target: { value: 'true' } });

    await waitFor(() => {
      const lastCall = global.fetch.mock.calls.at(-1)[0];
      expect(lastCall).toContain('active=true');
    });
  });

  it('filters by category', async () => {
    mockFetchWith({ data: [], total: 0 });

    render(<App />);

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());

    const categorySelect = screen.getByLabelText('Category');
    fireEvent.change(categorySelect, { target: { value: 'growth' } });

    await waitFor(() => {
      const lastCall = global.fetch.mock.calls.at(-1)[0];
      expect(lastCall).toContain('category=growth');
    });
  });

  it('toggles sort direction when clicking sorted column twice', async () => {
    mockFetchWith({ data: [], total: 0 });

    render(<App />);

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());

    const nameButton = screen.getByRole('button', { name: /name/i });

    fireEvent.click(nameButton);
    await waitFor(() => {
      const lastCall = global.fetch.mock.calls.at(-1)[0];
      expect(lastCall).toContain('sortBy=name');
      expect(lastCall).toContain('sortDirection=asc');
    });

    fireEvent.click(nameButton);
    await waitFor(() => {
      const lastCall = global.fetch.mock.calls.at(-1)[0];
      expect(lastCall).toContain('sortBy=name');
      expect(lastCall).toContain('sortDirection=desc');
    });
  });

  it('sorts by different columns', async () => {
    mockFetchWith({ data: [], total: 0 });

    render(<App />);

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: /score/i }));

    await waitFor(() => {
      const lastCall = global.fetch.mock.calls.at(-1)[0];
      expect(lastCall).toContain('sortBy=score');
    });
  });

  it('debounces search and avoids one request per keystroke', async () => {
    mockFetchWith({ data: [], total: 0 });

    render(<App />);

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));

    const input = screen.getByPlaceholderText('Type a name');
    fireEvent.change(input, { target: { value: 'a' } });
    fireEvent.change(input, { target: { value: 'al' } });
    fireEvent.change(input, { target: { value: 'alp' } });

    expect(global.fetch).toHaveBeenCalledTimes(1);

    await new Promise(resolve => setTimeout(resolve, 350));

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));
    const lastCallUrl = global.fetch.mock.calls.at(-1)[0];
    expect(lastCallUrl).toContain('search=alp');
  });

  it('shows error when API responds with non-OK status', async () => {
    mockFetchWith({ data: [] }, false, 500);

    render(<App />);

    expect(await screen.findByText('Request failed (500)')).toBeInTheDocument();
  });

  it('handles non-array API payload as empty list', async () => {
    mockFetchWith({ unexpected: true });

    render(<App />);

    await screen.findByText('Items Listing');
    expect(screen.getByText('0 item(s)')).toBeInTheDocument();
  });

  it('displays all item columns correctly in table', async () => {
    mockFetchWith({
      data: [{ id: 1, name: 'Alpha', active: true, category: 'core', score: 30, order: 1 }],
      total: 1
    });

    render(<App />);

    expect(await screen.findByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Yes')).toBeInTheDocument();
    const table = screen.getByRole('table');
    expect(table).toHaveTextContent('core');
    expect(table).toHaveTextContent('30');
  });

  it('has drag handles for reordering rows', async () => {
    mockFetchWith({
      data: [
        { id: 1, name: 'First', active: true, category: 'core', score: 10, order: 1 },
        { id: 2, name: 'Second', active: true, category: 'ops', score: 20, order: 2 }
      ],
      total: 2
    });

    render(<App />);

    await waitFor(() => expect(screen.getByText('First')).toBeInTheDocument());

    const handles = document.querySelectorAll('.drag-handle');
    expect(handles).toHaveLength(2);

    const firstRow = screen.getByText('First').closest('tr');
    expect(firstRow.querySelector('.drag-handle')).toBeTruthy();
  });

  it('shows drag hint text', async () => {
    mockFetchWith({ data: [], total: 0 });

    render(<App />);

    expect(screen.getByText('Drag rows to reorder')).toBeInTheDocument();
  });

  it('renders loading indicator during fetch', async () => {
    let resolveFetch;
    mockFetchWith(
      new Promise(resolve => { resolveFetch = resolve; }),
      true,
      200
    );

    render(<App />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    resolveFetch({ data: [], total: 0 });

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
  });

  it('shows empty state when no items returned', async () => {
    mockFetchWith({ data: [], total: 0 });

    render(<App />);

    await waitFor(() => expect(screen.getByText('0 item(s)')).toBeInTheDocument());
  });

  it('combines multiple filters in single request', async () => {
    mockFetchWith({ data: [], total: 0 });

    render(<App />);
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());

    const statusSelect = screen.getByLabelText('Status');
    const categorySelect = screen.getByLabelText('Category');
    const input = screen.getByPlaceholderText('Type a name');

    fireEvent.change(statusSelect, { target: { value: 'true' } });
    fireEvent.change(categorySelect, { target: { value: 'core' } });
    fireEvent.change(input, { target: { value: 'test' } });

    await waitFor(() => {
      const lastCall = global.fetch.mock.calls.at(-1)[0];
      expect(lastCall).toContain('active=true');
      expect(lastCall).toContain('category=core');
      expect(lastCall).toContain('search=test');
    });
  });

  it('clears category filter when reset to default', async () => {
    mockFetchWith({ data: [], total: 0 });

    render(<App />);
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());

    const categorySelect = screen.getByLabelText('Category');
    fireEvent.change(categorySelect, { target: { value: 'growth' } });

    await waitFor(() => {
      expect(global.fetch.mock.calls.at(-1)[0]).toContain('category=growth');
    });

    fireEvent.change(categorySelect, { target: { value: '' } });

    await waitFor(() => {
      const lastCall = global.fetch.mock.calls.at(-1)[0];
      expect(lastCall).not.toContain('category=');
    });
  });

  it('sorts with asc direction when changing to new column', async () => {
    mockFetchWith({ data: [], total: 0 });

    render(<App />);
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());

    const scoreButton = screen.getByRole('button', { name: /score/i });
    fireEvent.click(scoreButton);

    await waitFor(() => {
      const lastCall = global.fetch.mock.calls.at(-1)[0];
      expect(lastCall).toContain('sortBy=score');
      expect(lastCall).toContain('sortDirection=asc');
    });

    const nameButton = screen.getByRole('button', { name: /name/i });
    fireEvent.click(nameButton);

    await waitFor(() => {
      const lastCall = global.fetch.mock.calls.at(-1)[0];
      expect(lastCall).toContain('sortBy=name');
      expect(lastCall).toContain('sortDirection=asc');
    });
  });

  it('displays all categories in category dropdown', async () => {
    mockFetchWith({ data: [], total: 0 });

    render(<App />);

    const categorySelect = screen.getByLabelText('Category');
    const options = categorySelect.querySelectorAll('option');

    expect(options).toHaveLength(4);
    expect(options[0]).toHaveValue('');
    expect(options[1]).toHaveValue('core');
    expect(options[2]).toHaveValue('ops');
    expect(options[3]).toHaveValue('growth');
  });

  it('updates item count when rows change after filter', async () => {
    mockFetchWith({ data: [], total: 0 });

    render(<App />);
    await waitFor(() => expect(screen.getByText('0 item(s)')).toBeInTheDocument());

    mockFetchWith({
      data: [
        { id: 1, name: 'Alpha', active: true, category: 'core', score: 10, order: 1 },
        { id: 2, name: 'Beta', active: true, category: 'ops', score: 20, order: 2 }
      ],
      total: 2
    });

    const statusSelect = screen.getByLabelText('Status');
    fireEvent.change(statusSelect, { target: { value: 'false' } });

    await waitFor(() => expect(screen.getByText('2 item(s)')).toBeInTheDocument());
  });

  it('displays correct active status text for each item', async () => {
    mockFetchWith({
      data: [
        { id: 1, name: 'ActiveItem', active: true, category: 'core', score: 10, order: 1 },
        { id: 2, name: 'InactiveItem', active: false, category: 'ops', score: 20, order: 2 }
      ],
      total: 2
    });

    render(<App />);

    expect(await screen.findByText('ActiveItem')).toBeInTheDocument();
    expect(screen.getByText('InactiveItem')).toBeInTheDocument();
    expect(screen.getAllByText('Yes')).toHaveLength(1);
    expect(screen.getAllByText('No')).toHaveLength(1);
  });

  it('sorts by category column', async () => {
    mockFetchWith({ data: [], total: 0 });

    render(<App />);
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());

    const categoryHeader = screen.getByRole('button', { name: /category/i });
    fireEvent.click(categoryHeader);

    await waitFor(() => {
      const lastCall = global.fetch.mock.calls.at(-1)[0];
      expect(lastCall).toContain('sortBy=category');
      expect(lastCall).toContain('sortDirection=asc');
    });
  });

  it('shows sort indicator on sorted column', async () => {
    mockFetchWith({
      data: [{ id: 1, name: 'Test', active: true, category: 'core', score: 10, order: 1 }],
      total: 1
    });

    render(<App />);

    await screen.findByText('Test');
    expect(document.querySelector('.indicator')).toBeTruthy();
  });

  it('renders all rows with drag handles for drag-and-drop', async () => {
    mockFetchWith({
      data: [
        { id: 1, name: 'First', active: true, category: 'core', score: 10, order: 1 },
        { id: 2, name: 'Second', active: true, category: 'ops', score: 20, order: 2 },
        { id: 3, name: 'Third', active: true, category: 'growth', score: 30, order: 3 }
      ],
      total: 3
    });

    render(<App />);

    await waitFor(() => expect(screen.getByText('First')).toBeInTheDocument());

    const handles = document.querySelectorAll('.drag-handle');
    expect(handles).toHaveLength(3);

    const sortableContext = screen.getByRole('table').querySelector('tbody');
    const rows = sortableContext.querySelectorAll('tr');

    expect(rows[0]).toHaveTextContent('First');
    expect(rows[1]).toHaveTextContent('Second');
    expect(rows[2]).toHaveTextContent('Third');
  });

  it('preserves row order after filter interaction', async () => {
    mockFetchWith({
      data: [
        { id: 1, name: 'ItemOne', active: true, category: 'core', score: 10, order: 1 },
        { id: 2, name: 'ItemTwo', active: true, category: 'ops', score: 20, order: 2 }
      ],
      total: 2
    });

    render(<App />);
    await waitFor(() => expect(screen.getByText('ItemOne')).toBeInTheDocument());

    const statusSelect = screen.getByLabelText('Status');
    fireEvent.change(statusSelect, { target: { value: 'true' } });

    await waitFor(() => {
      const table = screen.getByRole('table');
      expect(table).toHaveTextContent('ItemOne');
      expect(table).toHaveTextContent('ItemTwo');
    });
  });
});

describe('SortableRow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders row data with correct cell values', async () => {
    mockFetchWith({
      data: [{ id: 1, name: 'TestItem', active: true, category: 'core', score: 42, order: 1 }],
      total: 1
    });

    render(<App />);

    expect(await screen.findByText('TestItem')).toBeInTheDocument();
    const table = screen.getByRole('table');
    expect(table).toHaveTextContent('core');
    expect(table).toHaveTextContent('42');
  });

  it('renders drag handle icon in first column', async () => {
    mockFetchWith({
      data: [{ id: 1, name: 'DragTest', active: false, category: 'ops', score: 15, order: 1 }],
      total: 1
    });

    render(<App />);

    await waitFor(() => expect(screen.getByText('DragTest')).toBeInTheDocument());

    const handle = document.querySelector('.drag-handle');
    expect(handle).toBeTruthy();
    expect(handle.textContent).toBe('⋮⋮');
  });

  it('renders all category types in table rows', async () => {
    mockFetchWith({
      data: [
        { id: 1, name: 'CoreItem', active: true, category: 'core', score: 10, order: 1 },
        { id: 2, name: 'OpsItem', active: true, category: 'ops', score: 20, order: 2 },
        { id: 3, name: 'GrowthItem', active: true, category: 'growth', score: 30, order: 3 }
      ],
      total: 3
    });

    render(<App />);

    await waitFor(() => expect(screen.getByText('CoreItem')).toBeInTheDocument());

    const table = screen.getByRole('table');
    expect(table).toHaveTextContent('core');
    expect(table).toHaveTextContent('ops');
    expect(table).toHaveTextContent('growth');
  });
});
