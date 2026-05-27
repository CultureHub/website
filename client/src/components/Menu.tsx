"use client";

import { useState } from "react";
import Image from "next/image";

import MenuButton from "@/components/MenuButton";

function VerticalLine() {
  return (
    <div className="hidden md:block w-0 h-[calc(100%_-_1px)] absolute left-[50%] outline outline-1 outline-offset-[-0.50px] outline-ch-midnite z-[-1]"></div>
  );
}

function LeftTopBorderMask() {
  return (
    <div className="hidden md:block w-[calc(50%_-_1px)] h-0 absolute left-0 top-[-2px] border border-t-[1px] border-[var(--background)]"></div>
  );
}

function RightTopBorderMask() {
  return (
    <div className="hidden md:block w-[calc(50%_-_1px)] h-0 absolute left-[calc(50%_+_1px)] top-[-2px] border border-t-[1px] border-[var(--background)]"></div>
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
            <Image
              loading="eager"
              width="195"
              height="29"
              src="/ch_menu_logo.svg"
              alt="CultureHub logo"
            />
            <Image
              loading="eager"
              width="16"
              height="29"
              className={isOpen ? "rotate-180" : ""}
              src="/ch_menu_arrow.svg"
              alt="arrow"
            />
          </div>
        </button>
      </div>
      {isOpen && (
        <div className="flex justify-center mb-4">
          <div className="flex flex-col md:inline-flex md:flex-row items-start justify-center md:border-t-2 gap-1">
            <div className="inline-flex flex-col gap-[10px] relative">
              <LeftTopBorderMask />
              <VerticalLine />
              <MenuButton variant="square-inverted" className="mt-5">
                Art <span className="font-milling text-xs">&</span> Technology
              </MenuButton>
              <MenuButton variant="pill" href="/projects">
                Project Index
              </MenuButton>
              <MenuButton variant="pill">
                Experiments in
                <br />
                Digital Storytelling
              </MenuButton>
              <MenuButton variant="pill">Residency</MenuButton>
              <MenuButton variant="pill">Re-Fest</MenuButton>
            </div>
            <div className="flex flex-col gap-[10px] relative">
              <VerticalLine />
              <MenuButton variant="square-inverted" className="mt-5">
                Community
              </MenuButton>
              <MenuButton variant="half" href="/artists">
                Artists
              </MenuButton>
              <MenuButton variant="half">Opportunities</MenuButton>
              <MenuButton variant="half">Support</MenuButton>
            </div>
            <div className="flex flex-col gap-[10px] relative">
              <VerticalLine />
              <MenuButton variant="square-inverted" className="mt-5">
                Events
              </MenuButton>
              <MenuButton variant="square-dashed">Upcoming</MenuButton>
            </div>
            <div className="flex flex-col gap-[10px] relative">
              <VerticalLine />
              <MenuButton variant="square-inverted" className="mt-5">
                Editorial
              </MenuButton>
              <MenuButton variant="square">Read</MenuButton>
              <MenuButton variant="square">Watch</MenuButton>
            </div>
            <div className="flex flex-col gap-[10px] relative">
              <RightTopBorderMask />
              <VerticalLine />
              <MenuButton variant="square-inverted" className="mt-5">
                Education
              </MenuButton>
              <MenuButton variant="rounded">CoLab</MenuButton>
              <MenuButton variant="rounded">Opportunities</MenuButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
