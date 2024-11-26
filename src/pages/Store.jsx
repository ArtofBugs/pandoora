import StoreBank from "../components/StoreBank";
import StoreTable from "../components/StoreTable";

import { collection } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";

import getDb from "../firebase/initialize";

// TODO: add links back to tasks, home, and settings
export default function Store() {
  const [value, loading, error] = useCollection(collection(getDb(), "store"));
  return (
    <>
      <StoreBank value={value} loading={loading} error={error} />
      <StoreTable value={value} loading={loading} error={error} />
    </>
  );
}
