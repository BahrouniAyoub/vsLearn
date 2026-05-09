import { X } from "lucide-react";

export function BottomPanel({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children?: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <section className="h-56 max-h-[35vh] border-t border-border bg-terminal flex flex-col flex-shrink-0">
      <div className="h-8 flex items-center px-3 border-b border-border text-xs">
        <div className="flex gap-4">
          <span className="text-foreground border-b-2 border-primary pb-1.5 -mb-px">TERMINAL</span>
          <span className="text-muted-foreground">PROBLEMS</span>
          <span className="text-muted-foreground">OUTPUT</span>
          <span className="text-muted-foreground">DEBUG</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="ml-auto text-muted-foreground hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 font-mono text-xs">
        {children ?? (
          <div className="text-muted-foreground">
            <span className="text-syntax-function">vslearn</span>
            <span className="text-syntax-keyword"> $ </span>Ready.
          </div>
        )}
      </div>
    </section>
  );
}
