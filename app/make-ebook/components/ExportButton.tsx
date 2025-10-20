import React from "react";
import { Button } from "@/components/ui/button";

interface ExportButtonProps {
  onExport: () => void;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ onExport }) => (
  <Button onClick={onExport}>Export ePub</Button>
);