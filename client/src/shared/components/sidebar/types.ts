export interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export interface MenuItem {
  path: string;
  label: string;
  icon: string;
}
