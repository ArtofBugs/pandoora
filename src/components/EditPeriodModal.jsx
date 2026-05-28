import React, { useState, useEffect } from "react";
import { updatePeriod, deletePeriod } from "./calendar-utils";
import { DeleteButton } from "./Common";

export function EditPeriodModal({
  isOpen,
  onClose,
  initialPeriod, // { id, type, title, start_time, end_time }
  onPeriodUpdated,
}) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("work");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && initialPeriod) {
      const formatDateTime = (date) => {
        if (!date) return "";
        const d = new Date(date);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); // Adjust for timezone
        return d.toISOString().slice(0, 16);
      };
      setTitle(initialPeriod.title || "");
      setType(initialPeriod.type || "work");
      setStartTime(formatDateTime(initialPeriod.start_time));
      setEndTime(formatDateTime(initialPeriod.end_time));
      setError(null);
    }
  }, [isOpen, initialPeriod]);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!initialPeriod || !initialPeriod.id) {
      setError("Cannot update a period without an ID.");
      setLoading(false);
      return;
    }

    const updatedStartTime = new Date(startTime).toISOString();
    const updatedEndTime = new Date(endTime).toISOString();

    const result = await updatePeriod(
      initialPeriod.id,
      updatedStartTime,
      updatedEndTime,
      title,
      type,
    );

    setLoading(false); // Set loading to false before checking for error

    if (result && result.error) {
      setError(result.error.message || "Error updating period.");
    } else {
      onPeriodUpdated();
      onClose();
    }
  };

  const handleDelete = async () => {
    if (!initialPeriod || !initialPeriod.id) {
      setError("Cannot delete a period without an ID.");
      return;
    }
    setLoading(true);
    const result = await deletePeriod(initialPeriod.id);
    setLoading(false);
    if (result && result.error) {
      setError(result.error.message || "Error deleting period.");
    } else {
      onPeriodUpdated();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Edit Period</h2>
        <form onSubmit={handleSave}>
          <div className="mb-4">
            <label
              htmlFor="title"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Title:
            </label>
            <input
              type="text"
              id="title"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="type"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Type:
            </label>
            <select
              id="type"
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="work">Work</option>
              <option value="break">Break</option>
            </select>
          </div>

          <div className="mb-4">
            <label
              htmlFor="start_time"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Start Time:
            </label>
            <input
              type="datetime-local"
              id="start_time"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="end_time"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              End Time:
            </label>
            <input
              type="datetime-local"
              id="end_time"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}

          <div className="flex items-center justify-between">
            <DeleteButton onDelete={handleDelete} />

            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-cyan-400 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>{" "}
              <button
                type="button"
                className="bg-gray-400 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
