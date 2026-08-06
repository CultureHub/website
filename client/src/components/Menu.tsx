"use client";

import { useState } from "react";
import Image from "next/image";

import MenuButton from "@/components/MenuButton";

function VerticalLine() {
  return (
    <div className="hidden md:block w-0 h-[calc(100%_-_1px)] absolute left-[50%] border-r-1 border-ch-midnite -z-10"></div>
  );
}

function LeftTopBorderMask() {
  return (
    <div className="hidden md:block w-1/2 h-0 absolute left-0 top-[-2px] border border-t-[1px] border-[var(--background)]"></div>
  );
}

function RightTopBorderMask() {
  return (
    <div className="hidden md:block w-1/2 h-0 absolute left-[calc(50%_+_1px)] top-[-2px] border border-t-[1px] border-[var(--background)]"></div>
  );
}

export default function Menu() {
  const [isOpen, setIsOpen] = useState(false);

  const onToggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  const close = () => setIsOpen(false);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-[var(--background)] border-b-1 border-ch-midnite">
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
        <div className="flex justify-center pb-4">
          <div className="flex flex-col md:inline-flex md:flex-row items-start justify-center md:border-t-1 gap-1">
            <div className="inline-flex flex-col gap-[10px] relative">
              <LeftTopBorderMask />
              <VerticalLine />
              <MenuButton
                variant="square-inverted"
                className="mt-5"
                onClick={close}
                href="/art-and-technology"
              >
                Art <span className="font-milling text-xs">&</span> Technology
              </MenuButton>
              <MenuButton
                variant="pill"
                href="/art-and-technology"
                onClick={close}
              >
                Project Index
              </MenuButton>
              <MenuButton
                variant="pill"
                onClick={close}
                href="/experiments-in-digital-storytelling"
              >
                Experiments in
                <br />
                Digital Storytelling
              </MenuButton>
              <MenuButton variant="pill" onClick={close} href="/residency">
                Residency
              </MenuButton>
              <MenuButton variant="pill" onClick={close}>
                Re-Fest
              </MenuButton>
            </div>
            <div className="flex flex-col gap-[10px] relative">
              <VerticalLine />
              <MenuButton
                variant="square-inverted"
                className="mt-5"
                onClick={close}
              >
                Community
              </MenuButton>
              <MenuButton variant="half" href="/artists" onClick={close}>
                Artists
              </MenuButton>
              <MenuButton variant="half" onClick={close}>
                Opportunities
              </MenuButton>
              <MenuButton variant="half" onClick={close}>
                Support
              </MenuButton>
            </div>
            <div className="flex flex-col gap-[10px] relative">
              <VerticalLine />
              <MenuButton
                variant="square-inverted"
                className="mt-5"
                onClick={close}
              >
                Events
              </MenuButton>
              <MenuButton variant="square-dashed" onClick={close}>
                Upcoming
              </MenuButton>
            </div>
            <div className="flex flex-col gap-[10px] relative">
              <VerticalLine />
              <MenuButton
                variant="square-inverted"
                className="mt-5"
                onClick={close}
              >
                Editorial
              </MenuButton>
              <MenuButton variant="square" onClick={close}>
                Read
              </MenuButton>
              <MenuButton variant="square" onClick={close}>
                Watch
              </MenuButton>
            </div>
            <div className="flex flex-col gap-[10px] relative">
              <RightTopBorderMask />
              <VerticalLine />
              <MenuButton
                variant="square-inverted"
                className="mt-5"
                onClick={close}
              >
                Education
              </MenuButton>
              <MenuButton variant="rounded" onClick={close}>
                CoLab
              </MenuButton>
              <MenuButton variant="rounded" onClick={close}>
                Opportunities
              </MenuButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
