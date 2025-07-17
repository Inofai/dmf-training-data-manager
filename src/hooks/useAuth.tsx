
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

const ADMIN_CACHE_KEY = 'admin_status_cache';
const DEVELOPER_CACHE_KEY = 'developer_status_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

interface RoleCache {
  isRole: boolean;
  timestamp: number;
  userId: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDeveloper, setIsDeveloper] = useState(false);
  const [adminCheckComplete, setAdminCheckComplete] = useState(false);

  const getCachedRoleStatus = (userId: string, cacheKey: string): boolean | null => {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (!cached) return null;

      const roleCache: RoleCache = JSON.parse(cached);
      const now = Date.now();

      // Check if cache is valid (within 24 hours and for the same user)
      if (
        roleCache.userId === userId &&
        (now - roleCache.timestamp) < CACHE_DURATION
      ) {
        console.log(`✅ Using cached role status for ${cacheKey}:`, roleCache.isRole);
        return roleCache.isRole;
      }

      // Cache expired or different user
      localStorage.removeItem(cacheKey);
      return null;
    } catch (error) {
      console.error(`Error reading ${cacheKey} cache:`, error);
      localStorage.removeItem(cacheKey);
      return null;
    }
  };

  const setCachedRoleStatus = (userId: string, isRoleStatus: boolean, cacheKey: string) => {
    try {
      const roleCache: RoleCache = {
        isRole: isRoleStatus,
        timestamp: Date.now(),
        userId: userId
      };
      localStorage.setItem(cacheKey, JSON.stringify(roleCache));
      console.log(`💾 Cached role status for ${cacheKey} for 24 hours:`, isRoleStatus);
    } catch (error) {
      console.error(`Error caching ${cacheKey} status:`, error);
    }
  };

  const checkRoles = async (userId: string) => {
    console.log('🔍 Starting role check for user:', userId);
    setAdminCheckComplete(false);

    // Check cached statuses
    const cachedAdminStatus = getCachedRoleStatus(userId, ADMIN_CACHE_KEY);
    const cachedDeveloperStatus = getCachedRoleStatus(userId, DEVELOPER_CACHE_KEY);
    
    if (cachedAdminStatus !== null && cachedDeveloperStatus !== null) {
      setIsAdmin(cachedAdminStatus);
      setIsDeveloper(cachedDeveloperStatus);
      setAdminCheckComplete(true);
      console.log('🏁 Role check completed (cached)');
      return;
    }

    // Cache miss or expired, fetch from database
    console.log('🌐 Fetching role status from database (cache miss/expired)');
    
    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Role check timeout')), 10000)
      );
      
      const adminCheckPromise = supabase.rpc('has_role', {
        _user_id: userId,
        _role: 'admin'
      });
      
      const developerCheckPromise = supabase.rpc('has_role', {
        _user_id: userId,
        _role: 'developer'
      });
      
      const [adminResult, developerResult] = await Promise.race([
        Promise.all([adminCheckPromise, developerCheckPromise]),
        timeoutPromise
      ]) as any[];
      
      if (adminResult.error || developerResult.error) {
        console.error('❌ Error checking roles:', adminResult.error || developerResult.error);
        setIsAdmin(false);
        setIsDeveloper(false);
      } else {
        const adminStatus = adminResult.data || false;
        const developerStatus = developerResult.data || false;
        
        console.log('✅ Role check results - Admin:', adminStatus, 'Developer:', developerStatus);
        setIsAdmin(adminStatus);
        setIsDeveloper(developerStatus);
        
        // Cache the results for 24 hours
        setCachedRoleStatus(userId, adminStatus, ADMIN_CACHE_KEY);
        setCachedRoleStatus(userId, developerStatus, DEVELOPER_CACHE_KEY);
      }
    } catch (error) {
      console.error('❌ Exception during role check:', error);
      // If there's any error or timeout, default to non-admin/non-developer
      setIsAdmin(false);
      setIsDeveloper(false);
    } finally {
      setAdminCheckComplete(true);
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
            await checkRoles(session.user.id);
          }, 0);
        } else {
          setIsAdmin(false);
          setIsDeveloper(false);
          setAdminCheckComplete(true);
          // Clear cache when user logs out
          localStorage.removeItem(ADMIN_CACHE_KEY);
          localStorage.removeItem(DEVELOPER_CACHE_KEY);
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
          setAdminCheckComplete(true);
          return;
        }

        // Only process if not already handled by onAuthStateChange
        if (!isInitialized) {
          console.log('📋 Processing existing session:', session?.user?.id);
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            setTimeout(async () => {
              await checkRoles(session.user.id);
            }, 0);
          } else {
            setIsAdmin(false);
            setIsDeveloper(false);
            setAdminCheckComplete(true);
          }
          
          setLoading(false);
          isInitialized = true;
        }
      } catch (error) {
        console.error('❌ Exception during auth initialization:', error);
        setLoading(false);
        setAdminCheckComplete(true);
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
      isAdmin,
      isDeveloper,
      adminCheckComplete,
      sessionExpiry: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : 'N/A'
    });
  }, [user, session, loading, isAdmin, isDeveloper, adminCheckComplete]);

  // Create a combined isAdminOrDeveloper flag for convenience
  const isAdminOrDeveloper = isAdmin || isDeveloper;

  return {
    user,
    session,
    loading,
    isAdmin,
    isDeveloper,
    isAdminOrDeveloper,
    adminCheckComplete
  };
};
