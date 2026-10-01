"use client";

import { useEffect, useRef, type ReactNode } from "react";

export type FilterCategory<Key extends string = string> = {
  key: Key;
  label: string;
};

type TabState = {
  isFirst: boolean;
  isLast: boolean;
  isActive: boolean;
};

type FilterMenuProps<Key extends string = string> = {
  title: string;
  categories: FilterCategory<Key>[];
  activeCategory: Key | null;
  onToggleCategory: (key: Key) => void;
  onClose: () => void;
  showingLabel: string;
  hideBottomBorder?: boolean;
  showBottomBorderWhenClosed?: boolean;
  renderTags?: (variant: "desktop" | "mobile") => ReactNode;
  renderDesktopItems?: (
    activeCategory: Key,
    hideBottomBorder: boolean,
  ) => ReactNode;
  renderMobileItems?: (
    activeCategory: Key,
    hideBottomBorder: boolean,
  ) => ReactNode;
  getTabClassName?: (category: FilterCategory<Key>, state: TabState) => string;
  getMobileTabClassName?: (
    category: FilterCategory<Key>,
    state: TabState,
  ) => string;
};

function defaultTabClassName(
  _category: FilterCategory,
  state: TabState,
): string {
  const rightPad = state.isFirst
    ? "pr-[50px]"
    : state.isLast
      ? "pr-[87px]"
      : "pr-[81px]";
  const leftPad = state.isFirst ? "pl-[10px]" : "pl-3";
  return `font-sans font-thin text-xl ${leftPad} ${rightPad} py-[10px] border-t border-ch-midnite border-l ${
    state.isLast ? "border-r" : ""
  } ${
    state.isActive
      ? "bg-ch-midnite text-ch-lite"
      : "bg-transparent text-ch-midnite"
  } cursor-pointer`;
}

function defaultMobileTabClassName(
  _category: FilterCategory,
  state: TabState,
): string {
  return `w-[105px] py-[10px] font-sans font-thin text-base cursor-pointer border-t border-l border-ch-midnite ${
    state.isLast ? "border-r" : ""
  } ${
    state.isActive ? "bg-ch-midnite text-ch-lite" : "bg-ch-lite text-ch-midnite"
  }`;
}

export default function FilterMenu<Key extends string = string>({
  title,
  categories,
  activeCategory,
  onToggleCategory,
  onClose,
  showingLabel,
  hideBottomBorder = false,
  showBottomBorderWhenClosed,
  renderTags,
  renderDesktopItems,
  renderMobileItems,
  getTabClassName = defaultTabClassName,
  getMobileTabClassName = defaultMobileTabClassName,
}: FilterMenuProps<Key>) {
  const filterBarRef = useRef<HTMLDivElement>(null);

  const showClosedBorder = showBottomBorderWhenClosed ?? !hideBottomBorder;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        filterBarRef.current &&
        !filterBarRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    }
    function handleScroll() {
      if (window.innerWidth < 768) {
        onClose();
      }
    }
    if (activeCategory) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("scroll", handleScroll, { passive: true });
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [activeCategory, onClose]);

  return (
    <div ref={filterBarRef}>
      {/* Desktop filter bar */}
      <div className="hidden md:flex flex-row justify-between px-3 md:px-8">
        <div className="flex flex-col gap-4 w-[210px]">
          <span className="font-sans font-thin text-xl text-ch-midnite">
            {title}
          </span>
          <span className="font-sans font-thin text-base text-neutral-400">
            Filter by
          </span>
          {renderTags?.("desktop")}
        </div>

        <div className="flex flex-col pt-[42px] flex-1">
          <div
            className={`flex flex-row justify-between items-center ${
              !activeCategory && showClosedBorder
                ? "border-b border-ch-midnite"
                : ""
            }`}
          >
            <div className="flex flex-row items-center">
              {categories.map((category, idx) => {
                const state: TabState = {
                  isFirst: idx === 0,
                  isLast: idx === categories.length - 1,
                  isActive: activeCategory === category.key,
                };
                return (
                  <button
                    key={category.key}
                    onClick={() => onToggleCategory(category.key)}
                    className={getTabClassName(category, state)}
                  >
                    {category.label}
                  </button>
                );
              })}
            </div>
            <span className="font-sans font-thin text-base text-neutral-400">
              {showingLabel}
            </span>
          </div>

          {activeCategory &&
            renderDesktopItems?.(activeCategory, hideBottomBorder)}
        </div>
      </div>

      {/* Mobile filter menu */}
      <div className="md:hidden flex flex-col gap-4">
        <div className="flex flex-row justify-between items-center h-[56px] px-6">
          <span className="font-sans font-thin text-base text-ch-midnite">
            {title}
          </span>
          <span className="font-sans font-thin text-sm text-[#989898]">
            {showingLabel}
          </span>
        </div>

        <div className="flex flex-row items-center gap-3 px-6">
          <span className="font-sans font-thin text-base text-[#989898]">
            Filter by
          </span>
          {renderTags?.("mobile")}
        </div>

        <div className="flex flex-col">
          <div
            className={`flex flex-row px-6 ${
              hideBottomBorder ? "" : "border-b border-black"
            }`}
          >
            {categories.map((category, idx) => {
              const state: TabState = {
                isFirst: idx === 0,
                isLast: idx === categories.length - 1,
                isActive: activeCategory === category.key,
              };
              return (
                <button
                  key={category.key}
                  onClick={() => onToggleCategory(category.key)}
                  className={getMobileTabClassName(category, state)}
                >
                  {category.label}
                </button>
              );
            })}
          </div>

          {activeCategory &&
            renderMobileItems?.(activeCategory, hideBottomBorder)}
        </div>
      </div>
    </div>
  );
}
