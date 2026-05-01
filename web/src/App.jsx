import { useEffect, useState, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { SortableRow } from './SortableRow.jsx';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

const columns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'active', label: 'Active', sortable: true },
  { key: 'category', label: 'Category', sortable: true },
  { key: 'score', label: 'Score', sortable: true },
];

const CATEGORIES = ['core', 'ops', 'growth'];

function SortIndicator({ active, direction }) {
  if (!active) return <span className="indicator">-</span>;
  return <span className="indicator">{direction === 'asc' ? '↑' : '↓'}</span>;
}

export default function App() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('order');
  const [sortDir, setSortDir] = useState('asc');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchRows() {
      setLoading(true);
      setError('');

      try {
        const params = new URLSearchParams();
        if (activeFilter !== 'all') params.append('active', activeFilter);
        if (debouncedSearch) params.append('search', debouncedSearch);
        if (category) params.append('category', category);
        params.append('sortBy', sortBy);
        params.append('sortDirection', sortDir);

        const response = await fetch(`${API_BASE}/items?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!response.ok) throw new Error(`Request failed (${response.status})`);

        let payload;
        try {
          payload = await response.json();
        } catch {
          throw new Error('Invalid response from server');
        }
        setRows(payload.data || []);
      } catch (err) {
        if (err.name !== 'AbortError') setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchRows();
    return () => controller.abort();
  }, [activeFilter, debouncedSearch, category, sortBy, sortDir]);

  function onSort(column) {
    if (sortBy === column) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDir('asc');
    }
  }

  function handleDragStart(event) {
    setActiveId(event.active.id);
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      setRows(items => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  const activeItem = useMemo(() => {
    return activeId ? rows.find(r => r.id === activeId) : null;
  }, [activeId, rows]);

  return (
    <main className="app-shell">
      <section className="card">
        <header className="header">
          <h1>Items Listing</h1>
          <p>Filter, sort, and reorder items</p>
        </header>

        <div className="controls">
          <label>
            Status
            <select value={activeFilter} onChange={e => setActiveFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </label>

          <label>
            Search by name
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Type a name"
            />
          </label>

          <label>
            Category
            <select value={category} onChange={e => setCategory(e.target.value)}>
              <option value="">All Categories</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="meta">
          <span>{rows.length} item(s)</span>
          {loading && <span className="loading">Loading...</span>}
          {error && <span className="error">{error}</span>}
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th className="drag-handle-col"></th>
                  {columns.map(column => (
                    <th key={column.key}>
                      {column.sortable ? (
                        <button type="button" onClick={() => onSort(column.key)}>
                          {column.label}
                          <SortIndicator active={sortBy === column.key} direction={sortDir} />
                        </button>
                      ) : column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <SortableContext items={rows.map(r => r.id)} strategy={verticalListSortingStrategy}>
                  {rows.map(row => (
                    <SortableRow key={row.id} row={row} />
                  ))}
                </SortableContext>
              </tbody>
            </table>
          </div>

          <DragOverlay>
            {activeItem && (
              <table className="drag-overlay-table">
                <tbody>
                  <tr className="drag-overlay-row">
                    <td className="drag-handle-col">⋮⋮</td>
                    <td>{activeItem.name}</td>
                    <td>{activeItem.active ? 'Yes' : 'No'}</td>
                    <td>{activeItem.category}</td>
                    <td>{activeItem.score}</td>
                  </tr>
                </tbody>
              </table>
            )}
          </DragOverlay>
        </DndContext>

        <p className="drag-hint">Drag rows to reorder</p>
      </section>
    </main>
  );
}
