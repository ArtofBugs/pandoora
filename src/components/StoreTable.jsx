import { useState } from "react";

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  increment,
} from "firebase/firestore";

import getDb from "../firebase/initialize";

async function addStore(name, price, quantity) {
  try {
    await addDoc(collection(getDb(), "store"), {
      name: name,
      price: Number(price),
      available: Number(quantity),
      claimed: 0,
    });
  } catch (e) {
    console.error("Error adding document:", e);
  }
}

async function updateStore(id, field, content, type) {
  if (type == "number") {
    content = Number(content);
  }
  try {
    await updateDoc(doc(getDb(), "store", id), {
      [field]: content,
    });
  } catch (e) {
    console.error("Error updating document:", e);
  }
}

async function deleteStore(id) {
  try {
    await deleteDoc(doc(getDb(), "store", id));
  } catch (e) {
    console.error("Error updating document:", e);
  }
}

async function claimStore(id, amount) {
  try {
    await updateDoc(doc(getDb(), "store", id), {
      claimed: increment(amount),
      available: increment(-amount),
    });
    console.log(`Claimed ${amount} of reward ${id}`);
  } catch (e) {
    console.error("Error claiming reward:", e);
  }
}

// TODO: most code repeats with TaskList's EditableField; can this be refactored into its own component?
// Maybe have this be just the content of the cell instead of cell itself
function EditableCell(props) {
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(
    props.content || props.default_value || (props.type == "number" ? 0 : "")
  );
  return (
    <td
      onDoubleClick={() => {
        setEditing(true);
        // Update to latest content
        setContent(props.content);
      }}
      onBlur={(e) => {
        if (e.target.checkValidity()) {
          setEditing(false);
          updateStore(props.id, props.field, content, props.type);
        }
      }}
    >
      {editing ? (
        <input
          autoFocus
          className="input input-bordered m-0"
          id={props.id}
          min={props.min}
          step={props.step}
          max={props.max}
          type={props.type}
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
          }}
        />
      ) : (
        <p className="text-left text-wrap">{props.content}</p>
      )}
    </td>
  );
}

function StoreRow(props) {
  const [toClaim, setToClaim] = useState(0);
  return (
    <tr className="table-row hover">
      <EditableCell
        id={props.id}
        field="name"
        type="text"
        content={props.data.name || `Untitled reward ${props.id}`}
      />
      <EditableCell
        id={props.id}
        min={0}
        step={1}
        field="price"
        type="number"
        content={props.data.price}
      />
      <EditableCell
        id={props.id}
        min={0}
        step={1}
        field="available"
        type="number"
        content={props.data.available}
      />
      <td>
        <form
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <button
            className="btn"
            htmlFor={props.id}
            onClick={() => {
              toClaim >= 0 &&
                toClaim <= props.data.available &&
                claimStore(props.id, toClaim);
            }}
          >
            Claim
            <input
              className="input input-bordered w-min"
              type="number"
              id={props.id}
              step={1}
              min={0}
              max={props.data.available}
              value={toClaim}
              onClick={(e) => {
                // Prevent clicking in the input box from submitting the button
                e.stopPropagation();
                // stopImmediatePropagation only works this way:
                // https://stackoverflow.com/questions/24415631/reactjs-syntheticevent-stoppropagation-only-works-with-react-events
                e.nativeEvent.stopImmediatePropagation();
              }}
              onChange={(e) => {
                setToClaim(e.target.value);
              }}
            />
          </button>
        </form>
      </td>
      <th>
        <button
          className="btn btn-ghost btn-xs text-red-700"
          onClick={() => deleteStore(props.id)}
        >
          delete
        </button>
      </th>
    </tr>
  );
}

export default function StoreTable(props) {
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState(0);
  const [newQuantity, setNewQuantity] = useState(0);

  console.log(props.value && props.value.docs);
  //   const [newDescription, setNewDescription] = useState("");
  return (
    // <div className="overflow-x-auto">
    <div className="w-screen p-2">
      <h1 className="font-bold text-xl w-full">Store</h1>
      <table className="table w-full">
        <thead>
          <tr>
            <th className="w-60">Name</th>
            <th className="w-10">Price</th>
            <th className="w-10">Quantity remaining</th>
            <th className="w-10" />
            <th className="w-10" />
          </tr>
        </thead>
        <tbody>
          {props.error && (
            <tr>
              <td>Error: {JSON.stringify(props.error)}</td>
            </tr>
          )}
          {props.loading && (
            <tr>
              <td>Loading...</td>
            </tr>
          )}
          {props.value &&
            props.value.docs.map((doc) => (
              <StoreRow key={doc.id} id={doc.id} data={doc.data()} />
            ))}
        </tbody>

        <tfoot>
          <tr>
            <td>
              <input
                className="input input-bordered"
                type="text"
                placeholder="Name"
                form="storeAddForm"
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value);
                }}
              ></input>
            </td>
            <td>
              <input
                className="input input-bordered"
                type="number"
                min={0}
                placeholder="Price"
                form="storeAddForm"
                value={newPrice}
                onChange={(e) => {
                  setNewPrice(e.target.value);
                }}
              ></input>
            </td>
            <td colSpan={3}>
              <form
                id="storeAddForm"
                onSubmit={(e) => {
                  e.preventDefault();
                }}
              >
                <button
                  className="btn"
                  htmlFor="storeAdd"
                  type="submit"
                  onClick={() => {
                    newPrice >= 0 &&
                      newQuantity >= 0 &&
                      addStore(newName, newPrice, newQuantity);
                  }}
                >
                  Add
                  <input
                    className="input input-bordered"
                    type="number"
                    min={0}
                    id="storeAdd"
                    form="storeAddForm"
                    value={newQuantity}
                    onClick={(e) => {
                      // Prevent clicking in the input box from submitting the button
                      e.stopPropagation();
                      // stopImmediatePropagation only works this way:
                      // https://stackoverflow.com/questions/24415631/reactjs-syntheticevent-stoppropagation-only-works-with-react-events
                      e.nativeEvent.stopImmediatePropagation();
                    }}
                    onChange={(e) => {
                      setNewQuantity(e.target.value);
                    }}
                  ></input>
                </button>
              </form>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
