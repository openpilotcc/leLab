import i18n from "@/i18n";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInstallExtra } from "@/hooks/useInstallExtra";
import {
  InstallProgress,
  InstallTitleIcon,
  RestartInstructions,
  installTitle,
} from "./InstallProgress";

interface Props {
  installHint: string;
}

const TrainingExtraGate: React.FC<Props> = ({ installHint }) => {
  const install = useInstallExtra("system/training-extra");

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="bg-slate-800/50 border-slate-700 rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-white">
            <InstallTitleIcon state={install.state} />
            {installTitle(install.state, i18n.t("Training Extra Not Installed"))}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <InstallProgress
            state={install.state}
            error={install.error}
            logs={install.logs}
            logBoxRef={install.logBoxRef}
            onInstall={install.handleInstall}
            onRetry={install.handleRetry}
            installHint={installHint}
            packageName="accelerate"
            idleTitle={i18n.t("Training Extra Not Installed")}
            idleDescription={
              <>
                {i18n.t("Training requires the")}{" "}
                <code className="px-1 py-0.5 rounded bg-slate-900 text-sky-300">
                  accelerate
                </code>{" "}
                {i18n.t("package, which isn't installed in this environment. Install it to enable the Training page.")}</>
            }
            doneDescription={<RestartInstructions purpose="training" />}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default TrainingExtraGate;
