import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/pages/Dashboard';
import Temperature from '@/components/pages/Temperature';
import Checklists from '@/components/pages/Checklists';
import Incidents from '@/components/pages/Incidents';
import Deliveries from '@/components/pages/Deliveries';
import AllergyChecks from '@/components/pages/AllergyChecks';
import Reports from '@/components/pages/Reports';
import HACCP from '@/components/pages/HACCP';
import Settings from '@/components/pages/Settings';
import AllergenManagement from '@/components/pages/AllergenManagement';
import RestaurantManagement from '@/components/pages/RestaurantManagement';
import UserManagement from '@/components/pages/UserManagement';
import HACCPManager from '@/components/pages/HACCPManager';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { ActivityIndicator } from 'react-native';

export type PageType = 'dashboard' | 'temperature' | 'checklists' | 'incidents' | 'deliveries' | 'allergyChecks' | 'reports' | 'haccpGenerator' | 'settings' | 'allergenManagement' | 'restaurantManagement' | 'userManagement' | 'haccpManager';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  // Handle redirect
  if (!isLoading && !isAuthenticated) {
    router.replace('/login');
    return null;
  }

  // Loading state
  if (isLoading) {
    return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  }

  const renderPage = () => {
    // Super Admin - only show Restaurant Management, User Management, and HACCP Manager
    if (user?.role === 'superadmin') {
      switch (currentPage) {
        case 'restaurantManagement':
          return <RestaurantManagement />;
        case 'userManagement':
          return <UserManagement />;
        case 'haccpManager':
          return <HACCPManager />;
        default:
          return <RestaurantManagement />;
      }
    }

    // Admin and User pages
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'temperature':
        return user?.subscriptionType === 'sensor-based' ? <Temperature /> : <Dashboard />;
      case 'checklists':
        return <Checklists />;
      case 'incidents':
        return <Incidents />;
      case 'deliveries':
        return <Deliveries />;
      case 'allergyChecks':
        return <AllergyChecks />;
      case 'reports':
        return <Reports />;
      case 'haccpGenerator':
        return <HACCP />;
      case 'allergenManagement':
        return user?.role === 'admin' ? <AllergenManagement /> : <Dashboard />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <View style={styles.container}>
      <Sidebar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <View style={[styles.content, { marginLeft: sidebarCollapsed ? 65 : 220 }]}>
        {renderPage()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
  },
});