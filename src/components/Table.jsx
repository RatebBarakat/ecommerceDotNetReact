/* eslint-disable react/prop-types */
import { useContext } from "react";
import Loading from "./Loading";
import { AuthContext } from "../contexts/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Table({
  columns,
  data,
  selected,
  canEdit,
  canDelete,
  handleEdit,
  handleDelete,
  handleCheckboxChange,
  isSelected,
  handleSelectAll,
  isLoading,
  handleSort,
  onsearchChanged,
  additionalActions,
}) {
  const auth = useContext(AuthContext);

  const getNestedValue = (item, dataField) => {
    const properties = dataField.split(".");
    let value = item;
    for (const property of properties) {
      if (item[property]) {
        value = value[property];
      } else {
        return "";
      }
    }
    return value;
  };

  return (
    <div className="table-responsive mx-3 mb-2">
      <table className="w-full">
        <thead className="bg-indigo-600 text-white">
          <tr key="header">
            <th className="py-2 px-4">
              <input
                type="checkbox"
                className="accent-indigo-500"
                checked={selected.length === data.length}
                onChange={handleSelectAll}
              />
            </th>
            {Array.from(columns).map((column, index) => (
              <>
                <td
                  key={index}
                  className={`px-4 text-sm ${
                    column["sortable"] ? "cursor-pointer" : ""
                  }`}
                  onClick={() => {
                    if (column["sortable"]) {
                      handleSort(column.dataField);
                    }
                  }}
                >
                  {column["title"]}
                </td>
              </>
            ))}
            <th className="py-2 px-4">Actions</th>
          </tr>
        </thead>
        {isLoading ? (
          <tbody>
            <tr>
              <td colSpan={columns.length + 2}>
                <div className="flex items-center justify-center h-full">
                  <Loading centered={false} size="small" />
                </div>
              </td>
            </tr>
          </tbody>
        ) : (
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td className="p-2" colSpan={columns.length + 2}>
                  No data
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 border-b border-gray-200"
                >
                  <td className="px-3">
                    <input
                      type="checkbox"
                      className="accent-indigo-500"
                      value={item.id}
                      checked={isSelected(item.id)}
                      onChange={(event) => handleCheckboxChange(event)}
                    />
                  </td>
                  {Array.from(columns).map((column, index) => (
                    <td
                      key={index}
                      className="px-4 text-sm overflow-y-auto"
                      style={{ maxWidth: "200px" }}
                    >
                      {column.type === "image" ? (
                        item[column.dataField] ? (
                          <img
                            className="w-14 h-14"
                            src={item[column.dataField]}
                            alt="Product"
                          />
                        ) : (
                          <p>no image</p>
                        )
                      ) : column.type === "array" ? (
                        getNestedValue(item, column.dataField)
                      ) : (
                        item[column.dataField]
                      )}
                    </td>
                  ))}
                  <td className="px-1 gap-2 flex items-center">
                    {auth.permissions.includes(canEdit) && (
                      <button
                        onClick={() => handleEdit(item.id)}
                        className="
                        text-sm font-normal text-green-600 hover:text-white lg:mt-2
                         border border-green-600 hover:bg-green-700 
                         focus:outline-none focus:ring-green-300 
                         rounded-lg text-center px-2 py-1
                          dark:border-green-500 dark:text-green-500
                           dark:hover:text-white dark:hover:bg-green-500"
                      >
                        <FontAwesomeIcon icon={"fa-edit"} />
                      </button>
                    )}
                    {auth.permissions.includes(canDelete) && (
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="
                        text-sm font-normal text-red-600 hover:text-white lg:mt-2
                         border border-red-600 hover:bg-red-700 focus:ring-4 
                         focus:outline-none focus:ring-red-300 
                         rounded-lg text-center px-2 py-1
                          dark:border-red-500 dark:text-red-500
                           dark:hover:text-white dark:hover:bg-red-500
                            dark:focus:ring-red-700"
                      >
                        <FontAwesomeIcon icon={"fa-trash"} />
                      </button>
                    )}
                    {additionalActions &&
                      Array.from(additionalActions).map((action) => (
                        <button
                          key={action.icon}
                          onClick={() => action.onAction(item.id)}
                          className="
                    text-sm font-normal text-cyan-600 hover:text-white lg:mt-2
                     border border-cyan-600 hover:bg-cyan-700 focus:ring-4 
                     focus:outline-none focus:ring-cyan-300 
                     rounded-lg text-center px-2 py-1
                      dark:border-cyan-500 dark:text-cyan-500
                       dark:hover:text-white dark:hover:bg-cyan-500
                        dark:focus:ring-cyan-700"
                        >
                          <FontAwesomeIcon
                            kernelMatrix={action.icon}
                            icon={action.icon}
                          />
                        </button>
                      ))}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        )}
      </table>
    </div>
  );
}
