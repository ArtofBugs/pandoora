import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAnglesLeft } from "@fortawesome/free-solid-svg-icons";

import StoreBank from "../components/StoreBank";
import StoreTable from "../components/StoreTable";

import { collection } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { useAuthState } from "react-firebase-hooks/auth";

import getDb, { auth } from "../firebase/initialize";
import { NavLink } from "react-router-dom";

export default function Store() {
  const [user, _, __] = useAuthState(auth);
  const [value, loading, error] = useCollection(
    collection(getDb(), "users", user?.uid, "store")
  );
  return (
    <>
      <BackButton />
      <StoreBank value={value} loading={loading} error={error} />
      <StoreTable value={value} loading={loading} error={error} />
    </>
  );
}

function BackButton() {
  return (
    <NavLink to="/tasks">
      <FontAwesomeIcon icon={faAnglesLeft} /> Back to Tasks
    </NavLink>
  );
}
