import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

export default function AddEntryButton({ onClick }) {
  return (
    <div className="divider w-0.8">
      <button>
        <FontAwesomeIcon icon={faPlus} onClick={onClick} />
      </button>
    </div>
  );
}
