import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import { RolePermission, AppRole } from "@/types/role-permissions";

const RolePermissionsManager = () => {
  const [permissions, setPermissions] = useState<RolePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newRoute, setNewRoute] = useState('');
  const { toast } = useToast();

  const roles: AppRole[] = ['admin', 'user', 'developer'];

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      const { data, error } = await supabase
        .from('role_permissions')
        .select('*')
        .order('page_route', { ascending: true });

      if (error) throw error;
      setPermissions((data || []) as RolePermission[]);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch role permissions.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePermission = async (id: string, canAccess: boolean) => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('role_permissions')
        .update({ can_access: canAccess })
        .eq('id', id);

      if (error) throw error;

      setPermissions(prev => 
        prev.map(p => p.id === id ? { ...p, can_access: canAccess } : p)
      );

      toast({
        title: "Success",
        description: "Permission updated successfully.",
      });
    } catch (error) {
      console.error('Error updating permission:', error);
      toast({
        title: "Error",
        description: "Failed to update permission.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const addNewRoute = async () => {
    if (!newRoute.trim() || !newRoute.startsWith('/')) {
      toast({
        title: "Error",
        description: "Please enter a valid route starting with '/'",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      
      // Add permissions for all roles for the new route
      const newPermissions = roles.map(role => ({
        role,
        page_route: newRoute.trim().toLowerCase(),
        can_access: role === 'developer' // Default to developer access only
      }));

      const { error } = await supabase
        .from('role_permissions')
        .insert(newPermissions);

      if (error) throw error;

      setNewRoute('');
      await fetchPermissions();

      toast({
        title: "Success",
        description: "New route permissions added successfully.",
      });
    } catch (error) {
      console.error('Error adding new route:', error);
      toast({
        title: "Error",
        description: "Failed to add new route permissions.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteRoute = async (route: string) => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('role_permissions')
        .delete()
        .eq('page_route', route);

      if (error) throw error;

      setPermissions(prev => prev.filter(p => p.page_route !== route));

      toast({
        title: "Success",
        description: "Route permissions deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting route:', error);
      toast({
        title: "Error",
        description: "Failed to delete route permissions.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'developer': return 'bg-blue-100 text-blue-800';
      case 'user': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.page_route]) {
      acc[permission.page_route] = [];
    }
    acc[permission.page_route].push(permission);
    return acc;
  }, {} as Record<string, RolePermission[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Control which user roles can access specific pages. Changes take effect immediately.
        </AlertDescription>
      </Alert>

      {/* Add New Route */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add New Route</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="newRoute">Route Path</Label>
              <Input
                id="newRoute"
                placeholder="/new-page"
                value={newRoute}
                onChange={(e) => setNewRoute(e.target.value)}
                disabled={saving}
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={addNewRoute}
                disabled={saving || !newRoute.trim()}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Route
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Permissions Table */}
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
                  return (
                    <TableCell key={role}>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={permission?.can_access || false}
                          onCheckedChange={(checked) => 
                            permission && updatePermission(permission.id, checked)
                          }
                          disabled={saving}
                        />
                        <Badge className={getRoleBadgeColor(role)}>
                          {permission?.can_access ? 'Allow' : 'Deny'}
                        </Badge>
                      </div>
                    </TableCell>
                  );
                })}
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteRoute(route)}
                    disabled={saving}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {Object.keys(groupedPermissions).length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No route permissions configured yet. Add a new route to get started.
        </div>
      )}
    </div>
  );
};

export default RolePermissionsManager;
