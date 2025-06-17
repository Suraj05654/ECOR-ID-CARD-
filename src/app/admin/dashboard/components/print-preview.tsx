'use client';

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Printer, X } from "lucide-react";
import { useEffect, useRef } from "react";

interface PrintPreviewProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}

export function PrintPreview({ open, onClose, children, title }: PrintPreviewProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    if (open) {
      const originalTitle = document.title;
      document.title = `Print - ${title}`;
      return () => {
        document.title = originalTitle;
      };
    }
  }, [open, title]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>Print Preview: {title}</DialogTitle>
            <div className="flex gap-2 no-print">
              <Button variant="outline" size="sm" onClick={onClose}>
                <X className="w-4 h-4 mr-2" /> Close
              </Button>
              <Button size="sm" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-2" /> Print
              </Button>
            </div>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-auto p-4">
          <div ref={contentRef} className="print-visible">
            {children}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
