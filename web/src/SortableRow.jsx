import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export function SortableRow({ row }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: row.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr ref={setNodeRef} style={style}>
      <td className="drag-handle-col">
        <span className="drag-handle" {...attributes} {...listeners}>
          ⋮⋮
        </span>
      </td>
      <td data-label="Name">{row.name}</td>
      <td data-label="Active">{row.active ? 'Yes' : 'No'}</td>
      <td data-label="Category">{row.category}</td>
      <td data-label="Score">{row.score}</td>
    </tr>
  );
}
