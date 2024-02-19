import React, { useCallback } from "react";

const Discount = ({ discount, onDelete, onUpdate }) => {
  const { id, start_date, end_date, type } = discount;

  const handleDelete = useCallback(() => {
    console.log('rendered :>> ');
    onDelete(id);
  }, [id, onDelete]);

  const handleUpdate = useCallback(() => {
    onUpdate(id);
  }, [id, onUpdate]);

  return (
    <div key={id} className="mb-4 p-4 border rounded-md bg-gray-100">
      <p className="font-bold">Discount ID: {id}</p>
      <p>Start Date: {start_date}</p>
      <p>End Date: {end_date}</p>
      <p>Type: {type}</p>
      <div className="flex mt-2">
        <button
          type="button"
          onClick={handleUpdate}
          className="bg-blue-500 text-white py-1 px-2 rounded mr-2 hover:bg-blue-600 focus:outline-none focus:ring focus:border-blue-300"
        >
          Update
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600 focus:outline-none focus:ring focus:border-red-300"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default Discount;
