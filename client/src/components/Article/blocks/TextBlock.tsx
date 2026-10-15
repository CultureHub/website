import { PortableText } from "@/components/PortableText";
import type { GetArticleBySlugQueryResult } from "@/sanity/types";

type Content = NonNullable<NonNullable<GetArticleBySlugQueryResult>["content"]>;
export type TextBlockType = Extract<Content[number], { _type: "articleText" }>;

const ALIGN_CLASSES: Record<NonNullable<TextBlockType["align"]>, string> = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
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
    <div className={`${alignClass} ${styleClass}`}>
      <PortableText value={block.text} />
    </div>
  );
}
