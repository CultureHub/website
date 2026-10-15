import { PortableText as NextPortableText } from "@portabletext/react";
import type {
  PortableTextProps,
  PortableTextComponents,
} from "@portabletext/react";

const components: PortableTextComponents = {
  types: {
    qa: ({ value }) => {
      const question = value?.question as string | undefined;
      const answer = value?.answer as PortableTextProps["value"] | undefined;
      return (
        <div className="flex flex-col gap-9">
          {question ? (
            <div className="font-milling font-bold text-[28px] leading-10 tracking-[-0.02em]">
              {question}
            </div>
          ) : null}
          {answer ? (
            <div className="font-miller text-[28px] leading-10 tracking-[-0.02em]">
              <NextPortableText value={answer} />
            </div>
          ) : null}
        </div>
      );
    },
  },
  marks: {
    link: ({ value, children }) => {
      const href = value?.href as string | undefined;
      if (!href) return <>{children}</>;
      return (
        <a href={href} className="portable-text-link">
          {children}
        </a>
      );
    },
  },
};

export function PortableText(props: PortableTextProps) {
  return <NextPortableText {...props} components={components} />;
}
