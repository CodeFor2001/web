import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import {
  LayoutDashboard,
  Thermometer,
  SquareCheck as CheckSquare,
  TriangleAlert as AlertTriangle,
  Truck,
  ShieldAlert,
  FileText,
  Shield,
  Settings,
  Menu,
  LogOut,
  Users,
  Building,
  Cog,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { PageType } from '@/app/index';
import { useIncidentCount } from '@/hooks/useIncidentCount';
import { useRouter} from 'expo-router';
import {useAuth} from '@/contexts/AuthContext';
import { Colors } from '@/constants/Colors';

interface SidebarProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

function IncidentBadge({ count }: { count: number }) {
  if (count === 0) return null;
  
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{count}</Text>
    </View>
  );
}

export default function Sidebar({
  currentPage,
  onPageChange,
  collapsed,
  onToggleCollapse,
}: SidebarProps) {
  const { t } = useTranslation();
  const openIncidentCount = useIncidentCount();
  const router = useRouter();
  const { logout, user } = useAuth();

  const isSensorBased = user?.subscriptionType === 'sensor-based';
  const isAdmin = user?.role === 'admin';
  const isSuperAdmin = user?.role === 'superadmin';

  const getMenuItems = () => {
    // Super Admin - only Restaurant Management, User Management, and HACCP Manager
    if (isSuperAdmin) {
      return [
        { id: 'restaurantManagement', icon: Building },
        { id: 'userManagement', icon: Users },
        { id: 'haccpManager', icon: Cog },
      ];
    }

    // Admin and User menu items
    const baseItems = [
      { id: 'dashboard', icon: LayoutDashboard },
    ];

    // Add temperature only for sensor-based subscriptions
    if (isSensorBased) {
      baseItems.push({ id: 'temperature', icon: Thermometer });
    }

    baseItems.push(
      { id: 'checklists', icon: CheckSquare },
      { id: 'incidents', icon: AlertTriangle },
      { id: 'deliveries', icon: Truck },
      { id: 'allergyChecks', icon: ShieldAlert },
      { id: 'reports', icon: FileText },
      { id: 'haccpGenerator', icon: Shield }
    );

    // Add admin-only items
    if (isAdmin) {
      baseItems.push({ id: 'allergenManagement', icon: ShieldAlert });
    }

    baseItems.push({ id: 'settings', icon: Settings });

    return baseItems;
  };

  const menuItems = getMenuItems();

   const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <View style={[styles.sidebar, { width: collapsed ? 64 : 220 }]}>
      <LinearGradient
        colors={[Colors.deepNavy, Colors.lightNavy]}
        style={styles.header}
      >
        <TouchableOpacity style={styles.toggleButton} onPress={onToggleCollapse}>
          <Menu size={20} color={Colors.textTertiary} />
        </TouchableOpacity>
        {!collapsed && (
          <View style={styles.titleContainer}>
            <LinearGradient
              colors={[Colors.gradientStart, Colors.gradientEnd]}
              style={styles.titleGradient}
            >
              <Text style={styles.title}>Vigilix</Text>
            </LinearGradient>
          </View>
        )}
      </LinearGradient>

      <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                collapsed && styles.collapsedMenuItem,
              ]}
              onPress={() => onPageChange(item.id as PageType)}
            >
              {isActive ? (
                <LinearGradient
                  colors={[Colors.gradientStart, Colors.gradientEnd]}
                  style={[styles.activeMenuItem, collapsed && styles.collapsedActiveMenuItem]}
                >
                  <View style={styles.iconContainer}>
                    <Icon 
                      size={20} 
                      color={Colors.textInverse} 
                      strokeWidth={2.5}
                    />
                    {item.id === 'incidents' && !isSuperAdmin && (
                      <IncidentBadge count={openIncidentCount} />
                    )}
                  </View>
                  {!collapsed && (
                    <Text style={styles.activeMenuLabel}>
                      {t(`sidebar.${item.id}`)}
                    </Text>
                  )}
                </LinearGradient>
              ) : (
                <View style={styles.inactiveMenuItem}>
                  <View style={styles.iconContainer}>
                    <Icon 
                      size={20} 
                      color={Colors.textSecondary} 
                      strokeWidth={2}
                    />
                    {item.id === 'incidents' && !isSuperAdmin && (
                      <IncidentBadge count={openIncidentCount} />
                    )}
                  </View>
                  {!collapsed && (
                    <Text style={styles.menuLabel}>
                      {t(`sidebar.${item.id}`)}
                    </Text>
                  )}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.logoutButton,
            collapsed && styles.collapsedLogoutButton,
          ]}
           onPress={handleLogout}
        >
          <LogOut size={20} color={Colors.error} />
          {!collapsed && (
            <Text style={styles.logoutText}>{t('sidebar.logout')}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    backgroundColor: Colors.backgroundPrimary,
    borderRightWidth: 1,
    borderRightColor: Colors.borderLight,
    position: 'fixed',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    transition: 'width 200ms ease',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: Colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.backgroundPrimary
  },
  badgeText: {
    color: Colors.textInverse,
    fontSize: 11,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    minHeight: 72,
  },
  toggleButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  titleContainer: {
    marginLeft: 12,
    flex: 1,
  },
  titleGradient: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: Colors.textInverse,
  },
  menuContainer: {
    flex: 1,
    paddingTop: 8,
  },
  menuItem: {
    marginHorizontal: 8,
    borderRadius: 8,
    marginBottom: 2,
    overflow: 'hidden',
  },
  collapsedMenuItem: {
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  activeMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: Colors.gradientStart,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  collapsedActiveMenuItem: {
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  inactiveMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconContainer: {
    position: 'relative',
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.textSecondary,
    marginLeft: 12,
  },
  activeMenuLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textInverse,
    marginLeft: 12,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
  },
  collapsedLogoutButton: {
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  logoutText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.error,
    marginLeft: 12,
  },
});