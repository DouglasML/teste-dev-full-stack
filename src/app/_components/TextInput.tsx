import type { ChangeEvent } from "react";

type TextInputProps = {
  id: string;
  type?: "text" | "password" | "number";
  placeholder: string;
  autoComplete?: string;
  value?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  className?: string;
};

export default function TextInput({
  id,
  type = "text",
  placeholder,
  autoComplete,
  value,
  onChange,
  className,
}: TextInputProps) {
  return (
    <input
      id={id}
      name={id}
      type={type}
      placeholder={placeholder}
      autoComplete={autoComplete}
      value={value}
      onChange={onChange}
      className={`w-full rounded-full border px-4 py-2 text-sm outline-none focus:ring-2 ${className ?? ""}`}
    />
  );
}
