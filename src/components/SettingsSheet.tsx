import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  CircleHelp,
  Crown,
  Fingerprint,
  Keyboard,
  Languages,
  Lock,
  Notebook,
  RotateCcw,
  Share,
  Star,
  Sun,
  Target,
  Trash2,
  UserRound,
  Vibrate,
} from "lucide-react";
import type { ReactNode } from "react";

export function SettingsSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[92vh] overflow-y-auto rounded-t-3xl border-border bg-surface p-0"
      >
        <SheetHeader className="px-6 pt-5 pb-2">
          <SheetTitle className="text-left text-xl text-muted-foreground">
            Settings
          </SheetTitle>
        </SheetHeader>

        <div className="px-6 pb-10">
          <h3 className="mt-2 mb-3 text-xl text-muted-foreground">Preferences</h3>
          <Group>
            <Item icon={<UserRound />} label="Profile" trailing={<ArrowRight className="h-4 w-4" />} />
            <Item icon={<Bell />} label="Notifications" trailing={<Switch defaultChecked />} />
            <Item icon={<Languages />} label="Language" trailing={<ArrowRight className="h-4 w-4" />} />
            <Item icon={<Sun />} label="Theme" trailing={<ArrowRight className="h-4 w-4" />} />
            <Item icon={<Keyboard />} label="Keyboard" pro trailing={<ArrowRight className="h-4 w-4" />} />
            <Item icon={<Fingerprint />} label="Siri" pro trailing={<ArrowRight className="h-4 w-4" />} />
            <Item icon={<Trash2 />} label="Clear History" />
            <Item icon={<Notebook />} label="Manage Memories" trailing={<ArrowRight className="h-4 w-4" />} />
            <Item icon={<Vibrate />} label="Haptics" trailing={<Switch defaultChecked />} />
          </Group>

          <h3 className="mt-7 mb-3 text-xl text-muted-foreground">Account</h3>
          <Group>
            <Item
              icon={<Crown />}
              label="Plan"
              trailing={
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  FREE <ArrowRight className="h-4 w-4" />
                </span>
              }
            />
            <Item icon={<Star />} label="Rate Us" trailing={<ArrowUpRight className="h-4 w-4" />} />
            <Item icon={<Share />} label="Share our App" trailing={<ArrowUpRight className="h-4 w-4" />} />
            <Item icon={<Notebook />} label="Terms of Use" trailing={<ArrowUpRight className="h-4 w-4" />} />
            <Item icon={<Lock />} label="Privacy Policy" trailing={<ArrowUpRight className="h-4 w-4" />} />
            <Item
              icon={<Target />}
              label="App version"
              trailing={<span className="text-sm text-muted-foreground">10.5.6 - 574</span>}
            />
            <Item icon={<CircleHelp />} label="Help" trailing={<ArrowRight className="h-4 w-4" />} />
            <Item icon={<RotateCcw />} label="Restore purchase" />
            <Item icon={<Target />} label="Request a feature" trailing={<ArrowUpRight className="h-4 w-4" />} />
          </Group>

          <p className="mt-8 text-center text-base text-muted-foreground">
            Powered by AppNation ↗
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Group({ children }: { children: ReactNode }) {
  return (
    <div className="divide-y divide-border overflow-hidden rounded-2xl bg-background">
      {children}
    </div>
  );
}

function Item({
  icon,
  label,
  trailing,
  pro,
}: {
  icon: ReactNode;
  label: string;
  trailing?: ReactNode;
  pro?: boolean;
}) {
  return (
    <div className="flex w-full items-center gap-3 px-4 py-4 text-left">
      <span className="shrink-0 text-foreground/70 [&_svg]:h-5 [&_svg]:w-5">{icon}</span>
      <span className="min-w-0 truncate text-base">{label}</span>
      {pro && (
        <span className="shrink-0 rounded-full bg-surface-2 px-2 py-0.5 text-xs font-medium text-brand">
          Pro
        </span>
      )}
      <span className="ml-auto shrink-0 text-muted-foreground">{trailing}</span>
    </div>
  );
}
