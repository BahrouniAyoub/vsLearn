import { useState } from "react";
import type { BottomPanelTab } from "./types";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

type LessonLayoutProps = {
  instructions: React.ReactNode;
  workspace: React.ReactNode;
  bottomTabs?: BottomPanelTab[];
  defaultBottomTab?: string;
  defaultInstructionsRatio?: number;
};

export function LessonLayout({
  instructions,
  workspace,
  bottomTabs,
  defaultBottomTab,
  defaultInstructionsRatio = 35,
}: LessonLayoutProps) {
  const [bottomPanelTab, setBottomPanelTab] = useState(defaultBottomTab ?? bottomTabs?.[0]?.id ?? "");

  const activeBottomPanel = bottomTabs?.find((t) => t.id === bottomPanelTab);

  return (
    <ResizablePanelGroup orientation="horizontal">
      <ResizablePanel defaultSize={defaultInstructionsRatio} minSize={18} maxSize={50}>
        <div className="h-full border-r border-border">
          {instructions}
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={100 - defaultInstructionsRatio} minSize={30}>
        <ResizablePanelGroup orientation="vertical">
          <ResizablePanel defaultSize={65} minSize={20}>
            <div className="h-full">
              {workspace}
            </div>
          </ResizablePanel>
          {bottomTabs && bottomTabs.length > 0 && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={35} minSize={15} maxSize={60}>
                <div className="h-full border-t border-border bg-terminal flex flex-col">
                  <div className="h-8 flex items-center px-3 border-b border-border text-xs flex-shrink-0 bg-sidebar-bg">
                    <div className="flex gap-1">
                      {bottomTabs.map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setBottomPanelTab(tab.id)}
                          className={`px-2.5 py-1 rounded text-[10px] font-mono transition-colors ${
                            bottomPanelTab === tab.id
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    {activeBottomPanel?.content}
                  </div>
                </div>
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
