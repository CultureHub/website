import Link from "next/link";
import { PropsWithChildren } from "react";
type ButtonVariant =
  | "pill"
  | "half"
  | "rounded"
  | "square"
  | "square-dashed"
  | "square-inverted";

export type ButtonProps = PropsWithChildren<{
  variant: ButtonVariant;
  className?: string;
  href?: string;
  openNewTab?: boolean;
  onClick?: () => void;
}>;

export default function Button({
  variant,
  children,
  className = "",
  href,
  openNewTab,
  onClick,
}: ButtonProps) {
  let containerClasses = "outline outline-1 outline-offset-[-1px] ";
  let textClasses =
    "text-ch-midnite text-base font-normal font-milling leading-4";
  let stateContainerClasses =
    "group hover:bg-ch-bb active:bg-ch-midnite active:outline-ch-bb";
  let stateTextClasses = "group-active:text-ch-bb";

  switch (variant) {
    case "pill":
      containerClasses += "bg-ch-lite rounded-[20px] outline-ch-midnite ";
      break;
    case "square-inverted":
      containerClasses += "bg-ch-midnite outline-ch-lite";
      textClasses =
        "text-ch-lite text-base font-normal font-brook uppercase leading-4";
      stateContainerClasses =
        "group hover:bg-ch-bb hover:outline-ch-midnite active:bg-ch-lite active:outline-ch-midnite";
      stateTextClasses =
        "group-hover:text-ch-midnite group-active:text-ch-midnite";
      break;
    case "half":
      containerClasses +=
        "bg-ch-lite rounded-tr-[10px] rounded-bl-[10px] outline-ch-midnite";
      break;
    case "square-dashed":
      containerClasses += "bg-ch-lite outline-dashed outline-ch-midnite";
      break;
    case "square":
      containerClasses += "bg-ch-lite outline-ch-midnite";
      break;
    case "rounded":
      containerClasses +=
        "bg-ch-lite rounded-[5px] outline-ch-midnite px-[10px] py-[10px]";
      textClasses = "text-ch-midnite font-milling font-bold text-2xl leading-6";
      break;
  }

  const content = (
    <div
      className={`${containerClasses} ${stateContainerClasses} ${className} inline-flex flex-col justify-center items-center`}
    >
      <div className={`${textClasses} ${stateTextClasses} justify-start`}>
        {children}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        onClick={onClick}
        {...(openNewTab
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
      >
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} type="button">
      {content}
    </button>
  );
}
