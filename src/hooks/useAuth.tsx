
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

const ROLE_CACHE_KEY = 'user_role_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

type UserRole = 'admin' | 'user' | 'developer';

interface RoleCache {
  role: UserRole;
  timestamp: number;
  userId: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole>('user');
  const [roleCheckComplete, setRoleCheckComplete] = useState(false);

  const getCachedRole = (userId: string): UserRole | null => {
    try {
      const cached = localStorage.getItem(ROLE_CACHE_KEY);
      if (!cached) return null;

      const roleCache: RoleCache = JSON.parse(cached);
      const now = Date.now();

      // Check if cache is valid (within 24 hours and for the same user)
      if (
        roleCache.userId === userId &&
        (now - roleCache.timestamp) < CACHE_DURATION
      ) {
        console.log(`✅ Using cached role:`, roleCache.role);
        return roleCache.role;
      }

      // Cache expired or different user
      localStorage.removeItem(ROLE_CACHE_KEY);
      return null;
    } catch (error) {
      console.error(`Error reading role cache:`, error);
      localStorage.removeItem(ROLE_CACHE_KEY);
      return null;
    }
  };

  const setCachedRole = (userId: string, role: UserRole) => {
    try {
      const roleCache: RoleCache = {
        role: role,
        timestamp: Date.now(),
        userId: userId
      };
      localStorage.setItem(ROLE_CACHE_KEY, JSON.stringify(roleCache));
      console.log(`💾 Cached role for 24 hours:`, role);
    } catch (error) {
      console.error(`Error caching role:`, error);
    }
  };

  const checkRole = async (userId: string) => {
    console.log('🔍 Starting role check for user:', userId);
    setRoleCheckComplete(false);

    // Check cached role
    const cachedRole = getCachedRole(userId);
    
    if (cachedRole !== null) {
      setUserRole(cachedRole);
      setRoleCheckComplete(true);
      console.log('🏁 Role check completed (cached)');
      return;
    }

    // Cache miss or expired, fetch from database
    console.log('🌐 Fetching role from database (cache miss/expired)');
    
    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Role check timeout')), 10000)
      );
      
      const roleCheckPromise = supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();
      
      const result = await Promise.race([
        roleCheckPromise,
        timeoutPromise
      ]) as any;
      
      if (result.error) {
        console.error('❌ Error checking role:', result.error);
        setUserRole('user'); // Default to user role
      } else {
        const role = result.data?.role || 'user';
        console.log('✅ Role check result:', role);
        setUserRole(role);
        
        // Cache the result for 24 hours
        setCachedRole(userId, role);
      }
    } catch (error) {
      console.error('❌ Exception during role check:', error);
      // If there's any error or timeout, default to user
      setUserRole('user');
    } finally {
      setRoleCheckComplete(true);
      console.log('🏁 Role check completed');
    }
  };

  useEffect(() => {
    console.log('🚀 Initializing auth state management');
    let isInitialized = false;
    
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event, 'User ID:', session?.user?.id);
        
        // Prevent duplicate initial session processing
        if (event === 'INITIAL_SESSION' && isInitialized) {
          console.log('⏭️ Skipping duplicate INITIAL_SESSION event');
          return;
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Use setTimeout to prevent blocking the auth state change
          setTimeout(async () => {
            await checkRole(session.user.id);
          }, 0);
        } else {
          setUserRole('user');
          setRoleCheckComplete(true);
          // Clear cache when user logs out
          localStorage.removeItem(ROLE_CACHE_KEY);
        }
        
        // Set loading to false after processing
        if (!isInitialized) {
          setLoading(false);
          isInitialized = true;
        }
      }
    );

    // Get existing session
    const initializeAuth = async () => {
      try {
        console.log('🔍 Checking for existing session on initialization');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error getting session:', error);
          setLoading(false);
          setRoleCheckComplete(true);
          return;
        }

        // Only process if not already handled by onAuthStateChange
        if (!isInitialized) {
          console.log('📋 Processing existing session:', session?.user?.id);
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            setTimeout(async () => {
              await checkRole(session.user.id);
            }, 0);
          } else {
            setUserRole('user');
            setRoleCheckComplete(true);
          }
          
          setLoading(false);
          isInitialized = true;
        }
      } catch (error) {
        console.error('❌ Exception during auth initialization:', error);
        setLoading(false);
        setRoleCheckComplete(true);
      }
    };

    initializeAuth();

    return () => {
      console.log('🧹 Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  // Enhanced logging for debugging
  useEffect(() => {
    console.log('📊 Auth state update:', {
      userId: user?.id,
      userEmail: user?.email,
      hasSession: !!session,
      loading,
      userRole,
      roleCheckComplete,
      sessionExpiry: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : 'N/A'
    });
  }, [user, session, loading, userRole, roleCheckComplete]);

  // Derived role flags for convenience
  const isAdmin = userRole === 'admin';
  const isDeveloper = userRole === 'developer';
  const isAdminOrDeveloper = isAdmin || isDeveloper;

  return {
    user,
    session,
    loading,
    userRole,
    isAdmin,
    isDeveloper,
    isAdminOrDeveloper,
    roleCheckComplete: roleCheckComplete // Renamed for clarity
  };
};
