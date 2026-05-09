import {
  Award,
  BookOpen,
  Bug,
  Files,
  GitBranch,
  LayoutDashboard,
  Search,
  Settings,
  User,
} from "lucide-react";
import { Link } from "@tanstack/react-router";

type SidebarView = "explorer" | "search" | "courses" | "profile";

export function Sidebar({
  activeView,
  onViewChange,
  authenticated,
}: {
  activeView: SidebarView;
  onViewChange: (view: SidebarView) => void;
  authenticated: boolean;
}) {
  return (
    <aside className="w-12 bg-activity-bar flex flex-col items-center py-2 gap-1 flex-shrink-0 border-r border-border">
      <ActivityButton
        icon={<Files className="size-5" />}
        label="Explorer"
        active={activeView === "explorer"}
        onClick={() => onViewChange("explorer")}
      />
      <ActivityButton
        icon={<Search className="size-5" />}
        label="Search"
        active={activeView === "search"}
        onClick={() => onViewChange("search")}
      />
      <ActivityButton
        icon={<BookOpen className="size-5" />}
        label="Learn"
        active={activeView === "courses"}
        link="/learn"
      />
      <ActivityButton
        icon={<LayoutDashboard className="size-5" />}
        label="Dashboard"
        link="/dashboard"
      />
      <ActivityButton icon={<GitBranch className="size-5" />} label="Source Control" />
      <ActivityButton icon={<Bug className="size-5" />} label="Run & Debug" />
      <ActivityButton icon={<Award className="size-5" />} label="Achievements" />
      <div className="mt-auto flex flex-col gap-1">
        <ActivityButton
          icon={<User className="size-5" />}
          label="Profile"
          link={authenticated ? "/settings/profile" : "/login"}
        />
        <ActivityButton
          icon={<Settings className="size-5" />}
          label="Settings"
          link="/settings/account"
        />
      </div>
    </aside>
  );
}

function ActivityButton({
  icon,
  label,
  active,
  onClick,
  link,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
  link?: string;
}) {
  const button = (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={`size-12 flex items-center justify-center text-muted-foreground hover:text-foreground relative ${active ? "text-foreground" : ""}`}
    >
      {active && <span className="absolute left-0 top-2 bottom-2 w-0.5 bg-foreground" />}
      {icon}
    </button>
  );

  if (link) return <Link to={link as never}>{button}</Link>;
  return button;
}
