import { useState, useCallback } from "react";
import { runChallengeTests } from "@/lib/challenges/engine";
import type { TestSuite, ChallengeTestConfig } from "@/lib/challenges";
import { TestOutputPanel } from "./TestOutputPanel";

type ChallengeRunnerProps = {
  files: { path: string; content: string }[];
  config: ChallengeTestConfig;
  onSuiteComplete?: (suite: TestSuite) => void;
};

export function ChallengeRunner({ files, config, onSuiteComplete }: ChallengeRunnerProps) {
  const [suite, setSuite] = useState<TestSuite | null>(null);
  const [running, setRunning] = useState(false);

  const handleRun = useCallback(() => {
    setRunning(true);
    setSuite(null);

    setTimeout(() => {
      try {
        const result = runChallengeTests({ files, config });
        setSuite(result);
        onSuiteComplete?.(result);
      } catch (e) {
        setSuite({
          id: `suite-err-${Date.now()}`,
          startedAt: Date.now(),
          finishedAt: Date.now(),
          groups: [],
          summary: { total: 0, passed: 0, failed: 0, errors: 1, skipped: 0 },
        });
      } finally {
        setRunning(false);
      }
    }, 100);
  }, [files, config, onSuiteComplete]);

  const handleReset = useCallback(() => {
    setSuite(null);
  }, []);

  return (
    <TestOutputPanel
      suite={suite}
      running={running}
      onRun={handleRun}
      onReset={handleReset}
    />
  );
}
