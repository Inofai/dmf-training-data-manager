
import { RolePermission, AppRole } from "@/types/role-permissions";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";

interface RolePermissionsTableProps {
  groupedPermissions: Record<string, RolePermission[]>;
  roles: AppRole[];
  onUpdatePermission: (id: string, canAccess: boolean) => void;
  onDeleteRoute: (route: string) => void;
  saving: boolean;
}

const RolePermissionsTable = ({
  groupedPermissions,
  roles,
  onUpdatePermission,
  onDeleteRoute,
  saving
}: RolePermissionsTableProps) => {
  const { isDeveloper, isAdmin } = useAuth();

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'developer': return 'bg-blue-100 text-blue-800';
      case 'user': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canManageRole = (role: AppRole) => {
    // Developers can manage all roles
    if (isDeveloper) return true;
    // Admins can only manage non-developer roles
    if (isAdmin && role !== 'developer') return true;
    return false;
  };

  const canDeleteRoute = (routePermissions: RolePermission[]) => {
    // Only developers can delete routes, or admins if no developer permissions exist
    if (isDeveloper) return true;
    if (isAdmin) {
      return !routePermissions.some(p => p.role === 'developer');
    }
    return false;
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Route</TableHead>
            <TableHead>Admin</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Developer</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.entries(groupedPermissions).map(([route, routePermissions]) => (
            <TableRow key={route}>
              <TableCell className="font-medium">{route}</TableCell>
              {roles.map(role => {
                const permission = routePermissions.find(p => p.role === role);
                const canManage = canManageRole(role);
                
                return (
                  <TableCell key={role}>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={permission?.can_access || false}
                        onCheckedChange={(checked) => 
                          permission && canManage && onUpdatePermission(permission.id, checked)
                        }
                        disabled={saving || !canManage}
                      />
                      <Badge className={getRoleBadgeColor(role)}>
                        {permission?.can_access ? 'Allow' : 'Deny'}
                      </Badge>
                      {!canManage && (
                        <span className="text-xs text-gray-500">(Protected)</span>
                      )}
                    </div>
                  </TableCell>
                );
              })}
              <TableCell>
                {canDeleteRoute(routePermissions) ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDeleteRoute(route)}
                    disabled={saving}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                ) : (
                  <span className="text-xs text-gray-500">Protected</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default RolePermissionsTable;
