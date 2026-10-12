import { cn } from "@/lib/utils";
import { frameClass } from "@/lib/ui";

export function PageFrame({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(frameClass, "py-16 sm:py-24", className)}>{children}</div>
  );
}
