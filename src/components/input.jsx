import React from "react";

// eslint-disable-next-line react/prop-types
const Input = ({error,name, style,label, type, value, onChange, placeholder,multiple }) => {
  return (
    <>
      <div style={style}>
      <label htmlFor={label} className="m-2">
        {label}
      </label>
      {error && (
        <span className="text-red-600">{error}</span>
      )}
      <input
        id={label}
        type={type}
        name={name}
        multiple={multiple}
        value={value}
        className="bg-gray-50 focus:outline-none border-2
                focus:border-indigo-600 text-gray-900 text-sm rounded-lg block w-full p-2.5
              border-grey-300 placeholder-gray-400 dark:text-white mb-2"
        onChange={onChange}
        placeholder={placeholder}
      />
      </div>
    </>
  );
};

export default React.memo(Input);