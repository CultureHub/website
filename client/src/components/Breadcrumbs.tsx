import React from "react";
import Button, { ButtonProps } from "@/components/Button";

type BreadcrumbButton = Partial<ButtonProps> & {
  text: string;
};

type BreadcrumbsProps = {
  buttons: BreadcrumbButton[];
};

export default function Breadcrumbs({ buttons }: BreadcrumbsProps) {
  return (
    <div className="flex flex-row items-center gap-3">
      {buttons.map((button, index) => (
        <React.Fragment key={button.text}>
          {index > 0 && <span className="font-normal">&gt;</span>}
          <Button variant="pill" className="px-[10px] py-[5px]" {...button}>
            {button.text}
          </Button>
        </React.Fragment>
      ))}
    </div>
  );
}
