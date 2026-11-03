import React from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useUIStore } from '@/stores/uiStore';

interface AppShellProps {
  children: React.ReactNode;
  title: string;
  breadcrumb?: string;
}

export function AppShell({ children, title, breadcrumb }: AppShellProps) {
  const { sidebarCollapsed } = useUIStore();

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div
        className={`page-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}
        style={{ flex: 1 }}
      >
        <Topbar title={title} breadcrumb={breadcrumb} />
        <main className="page-inner">
          {children}
        </main>
      </div>
    </div>
  );
}
