import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const PasswordInput = ({
  id = "password",
  name = "password",
  value = "",
  onChange,
  placeholder = "Password",
  label = "Password",
  containerClassName = "",
  inputClassName = "",
  labelClassName = "",
}) => {
  const [show, setShow] = useState(false);

  return (
    <div className={`relative ${containerClassName}`}>
      {label && (
        <label
          htmlFor={id}
          className={`absolute left-3 px-1 bg-white transition-all duration-200 z-10 ${
            value ? "text-[10px] -top-2 text-green-700" : "text-sm top-[14px] text-gray-400"
          } ${labelClassName}`}
        >
          {label}
        </label>
      )}

      <div className="flex items-center border-2 rounded-lg px-3 pt-4 pb-2 gap-2 transition-all duration-200 border-green-600">
        <input
          id={id}
          name={name}
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full outline-none text-gray-800 placeholder-transparent ${inputClassName}`}
        />
        <button
          type="button"
          aria-label={show ? "Hide password" : "Show password"}
          onClick={() => setShow((s) => !s)}
          className="text-gray-500 hover:text-gray-700 p-1"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
};

export default PasswordInput;

