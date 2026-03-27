import { PropsWithChildren } from "react";
type ButtonVariant =
  | "pill"
  | "half"
  | "rounded"
  | "square"
  | "square-dotted"
  | "square-inverted";

type ButtonProps = {
  variant: ButtonVariant;
  className?: string;
};

export default function Button({
  variant,
  children,
  className = "",
}: PropsWithChildren<ButtonProps>) {
  let containerClasses;
  let textClasses;

  switch (variant) {
    case "pill":
    case "half":
    case "square":
    case "square-dotted":
    case "rounded":
      containerClasses =
        "bg-ch-lite rounded-[20px] outline outline-1 outline-offset-[-1px] outline-ch-midnite ";
      textClasses =
        "text-ch-midnite text-base font-normal font-milling leading-4";
      break;
    case "square-inverted":
      containerClasses =
        "bg-ch-midnite outline outline-1 outline-offset-[-1px] outline-ch-lite";
      // TODO: handle the & in Art & Technology
      textClasses =
        "text-ch-lite text-base font-normal font-brook uppercase leading-4";
      break;
  }
  return (
    <div
      className={`${containerClasses} ${className} p-2.5 inline-flex flex-col justify-between items-center`}
    >
      <div className={`${textClasses} justify-start`}>{children}</div>
    </div>
  );
}
