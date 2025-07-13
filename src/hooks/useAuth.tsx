
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

const ADMIN_CACHE_KEY = 'admin_status_cache';
const ADMIN_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

interface AdminCache {
  isAdmin: boolean;
  timestamp: number;
  userId: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminCheckComplete, setAdminCheckComplete] = useState(false);

  const getCachedAdminStatus = (userId: string): boolean | null => {
    try {
      const cached = localStorage.getItem(ADMIN_CACHE_KEY);
      if (!cached) return null;

      const adminCache: AdminCache = JSON.parse(cached);
      const now = Date.now();

      // Check if cache is valid (within 24 hours and for the same user)
      if (
        adminCache.userId === userId &&
        (now - adminCache.timestamp) < ADMIN_CACHE_DURATION
      ) {
        console.log('✅ Using cached admin status:', adminCache.isAdmin);
        return adminCache.isAdmin;
      }

      // Cache expired or different user
      localStorage.removeItem(ADMIN_CACHE_KEY);
      return null;
    } catch (error) {
      console.error('Error reading admin cache:', error);
      localStorage.removeItem(ADMIN_CACHE_KEY);
      return null;
    }
  };

  const setCachedAdminStatus = (userId: string, isAdminStatus: boolean) => {
    try {
      const adminCache: AdminCache = {
        isAdmin: isAdminStatus,
        timestamp: Date.now(),
        userId: userId
      };
      localStorage.setItem(ADMIN_CACHE_KEY, JSON.stringify(adminCache));
      console.log('💾 Cached admin status for 24 hours:', isAdminStatus);
    } catch (error) {
      console.error('Error caching admin status:', error);
    }
  };

  const checkAdminRole = async (userId: string) => {
    console.log('🔍 Starting admin role check for user:', userId);
    setAdminCheckComplete(false);

    // First check cache
    const cachedStatus = getCachedAdminStatus(userId);
    if (cachedStatus !== null) {
      setIsAdmin(cachedStatus);
      setAdminCheckComplete(true);
      console.log('🏁 Admin role check completed (cached)');
      return;
    }

    // Cache miss or expired, fetch from database
    console.log('🌐 Fetching admin status from database (cache miss/expired)');
    
    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Admin check timeout')), 10000)
      );
      
      const adminCheckPromise = supabase.rpc('has_role', {
        _user_id: userId,
        _role: 'admin'
      });
      
      const { data, error } = await Promise.race([adminCheckPromise, timeoutPromise]) as any;
      
      if (error) {
        console.error('❌ Error checking admin role:', error);
        setIsAdmin(false);
      } else {
        console.log('✅ Admin role check result:', data);
        const adminStatus = data || false;
        setIsAdmin(adminStatus);
        // Cache the result for 24 hours
        setCachedAdminStatus(userId, adminStatus);
      }
    } catch (error) {
      console.error('❌ Exception during admin role check:', error);
      // If there's any error or timeout, default to non-admin
      setIsAdmin(false);
    } finally {
      setAdminCheckComplete(true);
      console.log('🏁 Admin role check completed');
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
            await checkAdminRole(session.user.id);
          }, 0);
        } else {
          setIsAdmin(false);
          setAdminCheckComplete(true);
          // Clear cache when user logs out
          localStorage.removeItem(ADMIN_CACHE_KEY);
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
              await checkAdminRole(session.user.id);
            }, 0);
          } else {
            setIsAdmin(false);
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
      adminCheckComplete,
      sessionExpiry: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : 'N/A'
    });
  }, [user, session, loading, isAdmin, adminCheckComplete]);

  return {
    user,
    session,
    loading,
    isAdmin,
    adminCheckComplete
  };
};
