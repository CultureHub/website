import { PortableText as NextPortableText } from "next-sanity";
import type { PortableTextProps, PortableTextComponents } from "next-sanity";

const components: PortableTextComponents = {
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
