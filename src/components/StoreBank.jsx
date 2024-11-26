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
  const [valid, setValid] = useState(false);
  return (
    <div className="card">
      <h3 className="card-title">{props.data.name}</h3>
      <div className="card-body">
        <p>Available: {props.data.claimed}</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <button
          className="card-actions justify-end btn"
          onClick={() => {
            valid && useReward(props.id, toUse);
          }}
        >
          Use
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
              setValid(e.target.checkValidity());
            }}
          ></input>
        </button>
      </form>
    </div>
  );
}

export default function StoreBank(props) {
  return (
    <div className="border">
      <h1 className="">Bank</h1>
      <h2>Available to claim:</h2>
      {props.error && <p>Error: {JSON.stringify(props.error)}</p>}
      {props.loading && <p>Loading...</p>}
      {props.value &&
        props.value.docs.map((doc) => (
          <StoreBankCard key={doc.id} id={doc.id} data={doc.data()} />
        ))}
    </div>
  );
}
