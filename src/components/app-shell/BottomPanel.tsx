import { useState } from "react";
import { X } from "lucide-react";

type PanelTab = {
  id: string;
  label: string;
  content: React.ReactNode;
};

export function BottomPanel({
  open,
  onClose,
  children,
  tabs,
  defaultTab,
}: {
  open: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  tabs?: PanelTab[];
  defaultTab?: string;
}) {
  const [activeTab, setActiveTab] = useState<string>(defaultTab ?? tabs?.[0]?.id ?? "terminal");

  if (!open) return null;

  const panels: PanelTab[] = tabs ?? [
    { id: "terminal", label: "TERMINAL", content: children },
  ];

  const activePanel = panels.find((p) => p.id === activeTab);

  return (
    <section className="h-56 max-h-[35vh] border-t border-border bg-terminal flex flex-col flex-shrink-0">
      <div className="h-8 flex items-center px-3 border-b border-border text-xs">
        <div className="flex gap-4">
          {panels.map((panel) => (
            <button
              key={panel.id}
              type="button"
              onClick={() => setActiveTab(panel.id)}
              className={`pb-1.5 -mb-px ${
                activeTab === panel.id
                  ? "text-foreground border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {panel.label}
            </button>
          ))}
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
        {activePanel?.content ?? (
          <div className="text-muted-foreground">
            <span className="text-syntax-function">vslearn</span>
            <span className="text-syntax-keyword"> $ </span>Ready.
          </div>
        )}
      </div>
    </section>
  );
}
