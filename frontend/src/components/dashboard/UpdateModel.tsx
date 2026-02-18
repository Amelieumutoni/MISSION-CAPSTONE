import React from "react";
import { Loader2, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface UniversalDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  onSubmit: (e: React.FormEvent) => void;
  loading?: boolean;
  children: React.ReactNode;
  submitLabel?: string;
}

export function UniversalDrawer({
  isOpen,
  onClose,
  title,
  description,
  onSubmit,
  loading,
  children,
  submitLabel = "Save Changes",
}: UniversalDrawerProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md dark:bg-zinc-950 border-l border-border rounded-none shadow-2xl flex flex-col p-0">
        <SheetHeader className="p-6 border-b border-border">
          <SheetTitle className="font-serif text-2xl text-foreground">
            {title}
          </SheetTitle>
          {description && (
            <SheetDescription className="text-[10px] uppercase tracking-widest text-muted-foreground">
              {description}
            </SheetDescription>
          )}
        </SheetHeader>

        <form
          onSubmit={onSubmit}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto p-6 space-y-6">{children}</div>

          <SheetFooter className="p-6 border-t border-border">
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground rounded-none h-12 uppercase text-[10px] tracking-widest font-bold hover:opacity-90"
            >
              {loading ? (
                <Loader2 className="animate-spin mr-2" size={14} />
              ) : null}
              {submitLabel}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
