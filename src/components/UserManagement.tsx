
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Users, Trash2 } from "lucide-react";
import AddUserDialog from "./AddUserDialog";
import { useAuth } from "@/hooks/useAuth";

interface UserWithRole {
  id: string;
  email: string;
  created_at: string;
  roles: Array<{
    id: string;
    role: 'admin' | 'user' | 'developer';
  }>;
}

const UserManagement = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const { isDeveloper } = useAuth();

  useEffect(() => {
    getCurrentUser();
    fetchUsers();
  }, []);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

  const fetchUsers = async () => {
    try {
      // Get all users with their roles
      const { data: userRoles, error } = await supabase
        .from('user_roles')
        .select(`
          id,
          user_id,
          role,
          created_at
        `);

      if (error) throw error;

      // Group roles by user_id and filter out developer users if current user is not a developer
      const usersMap = new Map<string, UserWithRole>();
      
      userRoles?.forEach((userRole) => {
        // Skip developer users if current user is not a developer
        if (userRole.role === 'developer' && !isDeveloper) {
          return;
        }

        if (!usersMap.has(userRole.user_id)) {
          usersMap.set(userRole.user_id, {
            id: userRole.user_id,
            email: '', // We'll need to get this from auth metadata or another source
            created_at: userRole.created_at,
            roles: []
          });
        }
        
        const user = usersMap.get(userRole.user_id)!;
        user.roles.push({
          id: userRole.id,
          role: userRole.role as 'admin' | 'user' | 'developer'
        });
      });

      setUsers(Array.from(usersMap.values()));
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'admin' | 'user' | 'developer') => {
    try {
      // First, delete all existing roles for this user
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      // Then, insert the new role
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: newRole
        });

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: `User role updated to ${newRole}.`,
      });

      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role.",
        variant: "destructive",
      });
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('manage-users', {
        body: {
          action: 'delete',
          userId: userId
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Success",
          description: "User deleted successfully.",
        });
        fetchUsers(); // Refresh the list
      } else {
        throw new Error(data?.error || 'Failed to delete user');
      }
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete user.",
        variant: "destructive",
      });
    }
  };

  const getUserPrimaryRole = (roles: Array<{role: 'admin' | 'user' | 'developer'}>) => {
    // Priority: developer > admin > user
    if (roles.find(r => r.role === 'developer')) return 'developer';
    if (roles.find(r => r.role === 'admin')) return 'admin';
    return 'user';
  };

  const isCurrentUser = (userId: string) => {
    return userId === currentUserId;
  };

  const isUserProtected = (roles: Array<{role: 'admin' | 'user' | 'developer'}>) => {
    // Protect admin and developer users from role changes and deletion
    return roles.some(r => r.role === 'admin' || r.role === 'developer');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading users...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Users ({users.length})
          </CardTitle>
          <AddUserDialog onUserAdded={fetchUsers} />
        </div>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No users found.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Current Role</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const primaryRole = getUserPrimaryRole(user.roles);
                const isProtected = isUserProtected(user.roles);
                const isCurrent = isCurrentUser(user.id);
                
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-mono text-sm">{user.id}</span>
                        {isCurrent && (
                          <Badge variant="outline" className="text-xs w-fit mt-1">
                            You
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          primaryRole === 'developer' ? 'default' :
                          primaryRole === 'admin' ? 'default' : 'secondary'
                        }
                        className={
                          primaryRole === 'developer' ? 'bg-blue-600' :
                          primaryRole === 'admin' ? 'bg-purple-600' : ''
                        }
                      >
                        {primaryRole}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {/* Role selection - disabled for protected users and current user */}
                        <Select
                          value={primaryRole}
                          onValueChange={(value: 'admin' | 'user' | 'developer') => 
                            updateUserRole(user.id, value)
                          }
                          disabled={isProtected || isCurrent}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            {/* Only show developer option to developers */}
                            {isDeveloper && (
                              <SelectItem value="developer">Developer</SelectItem>
                            )}
                          </SelectContent>
                        </Select>

                        {/* Delete button - disabled for protected users and current user */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isProtected || isCurrent}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete User</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this user? This action cannot be undone.
                                All their training documents and data will also be deleted.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteUser(user.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete User
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default UserManagement;
