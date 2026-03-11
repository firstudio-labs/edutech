import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import AdminSidebar from '../Components/AdminSidebar';

export default function AdminLayout({ children }) {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    return (
        <div className={`admin-layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
            <AdminSidebar 
                isCollapsed={isSidebarCollapsed} 
                toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
            />
            <div 
                className="admin-content" 
                style={{ 
                    marginLeft: isSidebarCollapsed ? 80 : 'var(--sidebar-width)', 
                    transition: 'margin-left 0.4s cubic-bezier(0.16, 1, 0.3, 1)' 
                }}
            >
                {children}
            </div>
        </div>
    );
}
