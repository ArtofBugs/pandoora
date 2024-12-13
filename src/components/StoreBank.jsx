import { useState } from "react";

import { doc, updateDoc, increment } from "firebase/firestore";

import getDb from "../firebase/initialize";

async function useReward(id, amount) {
  try {
    await updateDoc(doc(getDb(), "store", id), {
      claimed: increment(-amount),
    });
  } catch (e) {
    console.error("Error using reward:", e);
  }
}

function StoreBankCard(props) {
  if (!props.data.claimed) {
    return;
  }
  const [toUse, setToUse] = useState(0);
  return (
    <div className="card bg-primary-content w-30 m-5">
      <div className="card-body">
        <h3 className="card-title">{props.data.name}</h3>
        <p>Available: {props.data.claimed}</p>

        <div className="card-actions justify-end">
          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <button
              className="card-actions flex flex-col btn p-2 w-fit"
              onClick={() => {
                toUse >= 0 &&
                  toUse <= props.data.claimed &&
                  useReward(props.id, toUse);
              }}
            >
              <p>Use</p>
              <div className="w-full">
                <input
                  className="input input-bordered"
                  type="number"
                  id={props.id}
                  step={1}
                  min={0}
                  max={props.data.claimed}
                  value={toUse}
                  onClick={(e) => {
                    // Prevent clicking in the input box from submitting the button
                    e.stopPropagation();
                    // stopImmediatePropagation only works this way:
                    // https://stackoverflow.com/questions/24415631/reactjs-syntheticevent-stoppropagation-only-works-with-react-events
                    e.nativeEvent.stopImmediatePropagation();
                  }}
                  onChange={(e) => {
                    setToUse(e.target.value);
                  }}
                ></input>
              </div>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function StoreBank(props) {
  return (
    <div className="rounded-lg bg-neutral-content m-2 p-4 container w-full">
      <h1 className="font-bold text-xl m-2 w-full">Bank</h1>
      <h2 className="w-full">Available to claim:</h2>
      <div className="w-full inline-flex flex-wrap">
        {props.error && <p>Error: {JSON.stringify(props.error)}</p>}
        {props.loading && <p>Loading...</p>}
        {props.value &&
          props.value.docs.map((doc) => (
            <StoreBankCard key={doc.id} id={doc.id} data={doc.data()} />
          ))}
      </div>
    </div>
  );
}
