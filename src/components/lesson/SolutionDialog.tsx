import { useState } from "react";
import { Lightbulb, Code, AlertTriangle, Eye } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";

type SolutionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  solutionFiles: { path: string; content: string; language: string }[];
};

export function SolutionDialog({ open, onOpenChange, solutionFiles }: SolutionDialogProps) {
  const [confirmed, setConfirmed] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] border border-border bg-background shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg max-h-[85vh] flex flex-col">
          {!confirmed ? (
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-4">
                <div className="size-10 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="size-5 text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <Dialog.Title className="text-lg font-semibold text-foreground">
                    Reveal solution?
                  </Dialog.Title>
                  <Dialog.Description className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    Looking at the solution before attempting the challenge yourself
                    can limit your learning. We recommend trying to solve it on your
                    own first.
                  </Dialog.Description>
                </div>
              </div>

              <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3 flex items-start gap-2.5">
                <Lightbulb className="size-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-300/90 leading-relaxed">
                  Try using the hints and running your code before revealing the solution.
                  You'll learn more by debugging and iterating.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="flex-1 px-4 py-2 rounded-md border border-border bg-secondary text-sm text-foreground hover:bg-accent"
                  >
                    Keep trying
                  </button>
                </Dialog.Close>
                <button
                  type="button"
                  onClick={() => setConfirmed(true)}
                  className="flex-1 px-4 py-2 rounded-md bg-amber-500/20 border border-amber-500/40 text-sm text-amber-300 hover:bg-amber-500/30 flex items-center justify-center gap-2"
                >
                  <Eye className="size-4" /> Show solution
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col max-h-[85vh]">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <Code className="size-4 text-syntax-keyword" />
                  <Dialog.Title className="font-semibold text-sm">
                    Solution
                  </Dialog.Title>
                </div>
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded border border-border bg-secondary"
                  >
                    Close
                  </button>
                </Dialog.Close>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {solutionFiles.map((sf) => (
                  <div key={sf.path}>
                    <div className="text-[10px] font-mono text-muted-foreground mb-1.5 flex items-center gap-2">
                      <Code className="size-3" />
                      {sf.path}
                    </div>
                    <pre className="text-xs font-mono bg-editor border border-border rounded-lg p-4 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                      {sf.content}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
