import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";

import ListsSidebar from "../components/ListsSidebar";
import ListsSpace from "../components/TaskList";

import { collection } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";

import getDb from "../firebase/initialize";

export default function TasksSpace() {
  // Only grab the whole collection once and handle hiding non-shown lists on the client side
  const [value, loading, error] = useCollection(collection(getDb(), "lists"));
  return (
    <div className="flex-grow h-20">
      <div className="bg-slate-100 w-screen">
        <label htmlFor="lists-sidebar" className="drawer-button absolute z-10">
          <FontAwesomeIcon icon={faBars} />
        </label>
      </div>
      <div className="drawer h-full">
        <input
          id="lists-sidebar"
          type="checkbox"
          className="drawer-toggle"
          defaultChecked="true"
        />
        <div className="drawer-content h-full">
          <ListsSpace value={value} loading={loading} error={error} />
        </div>
        <div className="drawer-side absolute h-full w-fit">
          <ListsSidebar value={value} loading={loading} error={error} />
        </div>
      </div>
    </div>
  );
}
