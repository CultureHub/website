import { PortableText } from "@/components/PortableText";
import type { GetArticleBySlugQueryResult } from "@/sanity/types";

type Content = NonNullable<NonNullable<GetArticleBySlugQueryResult>["content"]>;
export type TextBlockType = Extract<Content[number], { _type: "articleText" }>;

// "align" positions the column (text is always left-aligned within it).
const ALIGN_CLASSES: Record<NonNullable<TextBlockType["align"]>, string> = {
  left: "pl-16 pr-16 md:pr-[418px]",
  right: "pl-16 pr-16 md:pl-[418px]",
  center: "mx-auto w-[892px] max-w-full px-4 md:px-0",
};

const STYLE_CLASSES: Record<NonNullable<TextBlockType["style"]>, string> = {
  body: "font-miller text-[32px] leading-10 tracking-[-0.02em]",
  lead: "font-miller text-[32px] leading-10 tracking-[-0.02em]",
  small: "font-miller text-2xl leading-10 tracking-[-0.02em]",
};

export default function TextBlock({ block }: { block: TextBlockType }) {
  if (!block.text || block.text.length === 0) return null;

  const alignClass = ALIGN_CLASSES[block.align ?? "left"];
  const styleClass = STYLE_CLASSES[block.style ?? "body"];

  return (
    <div className={`${alignClass} ${styleClass} space-y-4`}>
      <PortableText value={block.text} />
    </div>
  );
}
