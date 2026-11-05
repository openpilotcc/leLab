import i18n from "@/i18n";
import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApi } from "@/contexts/ApiContext";
import { useToast } from "@/hooks/use-toast";

interface DeleteDatasetDialogProps {
  repoId: string;
  onHub: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}

/** Confirms and performs the removal of a local dataset, optionally from the Hub too. */
const DeleteDatasetDialog: React.FC<DeleteDatasetDialogProps> = ({
  repoId,
  onHub,
  open,
  onOpenChange,
  onDeleted,
}) => {
  const { baseUrl, fetchWithHeaders } = useApi();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteFromHub, setDeleteFromHub] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const reset = () => {
    setDeleteFromHub(false);
    setConfirmText("");
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetchWithHeaders(`${baseUrl}/delete-dataset`, {
        method: "POST",
        body: JSON.stringify({ dataset_repo_id: repoId, delete_from_hub: deleteFromHub }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        toast({
          title: i18n.t("Dataset Deleted"),
          description: deleteFromHub
            ? `${repoId} has been removed from disk and the Hub.`
            : `${repoId} has been removed from disk.`,
        });
        onDeleted();
      } else {
        toast({
          title: i18n.t("Delete Failed"),
          description: data.message || i18n.t("Could not delete the dataset."),
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: i18n.t("Connection Error"),
        description: i18n.t("Could not connect to the backend server."),
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      onOpenChange(false);
      reset();
    }
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) reset();
      }}
    >
      <AlertDialogContent className="bg-gray-900 border-gray-700 text-white">
        <AlertDialogHeader>
          <AlertDialogTitle>{i18n.t("Delete dataset from disk?")}</AlertDialogTitle>
          <AlertDialogDescription className="text-gray-400">
            {i18n.t("This permanently removes")} <span className="font-mono text-white">{repoId}</span> {i18n.t("from your local cache. This action cannot be undone.")}</AlertDialogDescription>
        </AlertDialogHeader>
        {onHub && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id="delete-from-hub"
                checked={deleteFromHub}
                onCheckedChange={(checked) => setDeleteFromHub(checked === true)}
              />
              <Label htmlFor="delete-from-hub" className="text-sm text-gray-300">
                {i18n.t("Also delete this dataset from the HuggingFace Hub")}</Label>
            </div>
            {deleteFromHub && (
              <div className="space-y-1">
                <Label className="text-xs text-gray-400">
                  Type <span className="font-mono text-white">{repoId}</span> {i18n.t("to confirm")}</Label>
                <Input
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
            )}
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700">
            {i18n.t("Keep dataset")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting || (deleteFromHub && confirmText !== repoId)}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            {isDeleting ? "Deleting…" : i18n.t("Delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteDatasetDialog;
