"use client";

import { useState } from "react";
import Image from "next/image";

import Button from "@/components/Button";

import chMenuLogo from "../../public/ch_menu_logo.svg";
import chMenuArrow from "../../public/ch_menu_arrow.svg";

function VerticalLine() {
  return (
    <div className="w-0 h-[calc(100%_-_1px)] absolute left-[50%] outline outline-1 outline-offset-[-0.50px] outline-ch-midnite z-[-1]"></div>
  );
}

function LeftTopBorderMask() {
  return (
    <div className="w-[calc(50%_-_1px)] h-0 absolute left-0 top-[-2px] border border-t-[1px] border-[var(--background)]"></div>
  );
}

function RightTopBorderMask() {
  return (
    <div className="w-[calc(50%_-_1px)] h-0 absolute left-[calc(50%_+_1px)] top-[-2px] border border-t-[1px] border-[var(--background)]"></div>
  );
}

export default function Menu() {
  const [isOpen, setIsOpen] = useState(false);

  const onToggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div>
      <div className="flex justify-center">
        <button onClick={onToggleMenu}>
          <div className="flex justify-center p-4 gap-4">
            <Image src={chMenuLogo} alt="CultureHub logo" />
            <Image
              className={isOpen ? "rotate-180" : ""}
              src={chMenuArrow}
              alt="arrow"
            />
          </div>
        </button>
      </div>
      {isOpen && (
        <div className="flex justify-center">
          <div className="inline-flex flex-row items-start justify-center border-t-2 gap-1">
            <div className="inline-flex flex-col gap-[10px] relative">
              <LeftTopBorderMask />
              <VerticalLine />
              <Button variant="square-inverted" className="mt-5">
                Art & Technology
              </Button>
              <Button variant="pill">Project Index</Button>
              <Button variant="pill">
                Experiments in
                <br />
                Digital Story Telling
              </Button>
              <Button variant="pill">Residency</Button>
              <Button variant="pill">Re-Fest</Button>
            </div>
            <div className="flex flex-col gap-[10px] relative">
              <VerticalLine />
              <Button variant="square-inverted" className="mt-5">
                Community
              </Button>
              <Button variant="half">Artist</Button>
              <Button variant="half">Opportunities</Button>
              <Button variant="half">Support</Button>
            </div>
            <div className="flex flex-col gap-[10px] relative">
              <VerticalLine />
              <Button variant="square-inverted" className="mt-5">
                Events
              </Button>
              <Button variant="square-dotted">Upcoming</Button>
            </div>
            <div className="flex flex-col gap-[10px] relative">
              <VerticalLine />
              <Button variant="square-inverted" className="mt-5">
                Editorial
              </Button>
              <Button variant="square">Read</Button>
              <Button variant="square">Watch</Button>
            </div>
            <div className="flex flex-col gap-[10px] relative">
              <RightTopBorderMask />
              <VerticalLine />
              <Button variant="square-inverted" className="mt-5">
                Education
              </Button>
              <Button variant="rounded">CoLab</Button>
              <Button variant="rounded">Opportunities</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
