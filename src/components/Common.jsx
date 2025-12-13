import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faPencil,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";

export default function AddEntryButton({ onClick }) {
  return (
    <div className="divider w-0.8">
      <button>
        <FontAwesomeIcon icon={faPlus} onClick={onClick} />
      </button>
    </div>
  );
}

export function SaveButton({ onSave }) {
  return (
    <button className="btn" onClick={onSave}>
      Save
    </button>
  );
}

export function CancelButton({ onCancel }) {
  return (
    <button className="btn" onClick={onCancel}>
      Cancel
    </button>
  );
}

export function EditButton({ onEdit }) {
  return (
    <button>
      <FontAwesomeIcon
        icon={faPencil}
        className="text-gray-300 p-2 active:text-gray-600 focus-within:text-gray-600 hover:text-gray-600 rounded-full"
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
      />
    </button>
  );
}

export function DeleteButton({ onDelete }) {
  return (
    <button onClick={onDelete}>
      <FontAwesomeIcon
        icon={faTrashCan}
        className="text-gray-300 active:text-red-500 hover:text-red-500 p-1"
      />
    </button>
  );
}
