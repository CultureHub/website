import Button, { ButtonProps } from "@/components/Button";

export default function MenuButton({ className, ...props }: ButtonProps) {
  return (
    <Button
      {...props}
      className={`${className} min-w-[180px] h-10 p-[10px] `}
    />
  );
}
