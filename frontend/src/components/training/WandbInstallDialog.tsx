import i18n from "@/i18n";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useInstallExtra } from "@/hooks/useInstallExtra";
import {
  InstallProgress,
  InstallTitleIcon,
  RestartInstructions,
  installTitle,
} from "./InstallProgress";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  installHint: string;
}

const WandbInstallDialog: React.FC<Props> = ({ open, onOpenChange, installHint }) => {
  const install = useInstallExtra("system/wandb-extra", open);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-white">
            <InstallTitleIcon state={install.state} />
            {installTitle(install.state, i18n.t("Weights & Biases Not Installed"))}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Install the wandb package to enable W&amp;B logging.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <InstallProgress
            state={install.state}
            error={install.error}
            logs={install.logs}
            logBoxRef={install.logBoxRef}
            onInstall={install.handleInstall}
            onRetry={install.handleRetry}
            installHint={installHint}
            packageName="wandb"
            idleTitle={i18n.t("Weights &amp; Biases Not Installed")}
            idleDescription={
              <>
                {i18n.t("Enabling W&amp;B logging requires the")}{" "}
                <code className="px-1 py-0.5 rounded bg-slate-900 text-sky-300">
                  wandb
                </code>{" "}
                {i18n.t("package, which isn't installed in this environment. Install it to log this run to W&amp;B.")}</>
            }
            doneDescription={<RestartInstructions purpose={i18n.t("W&amp;B logging")} />}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WandbInstallDialog;
