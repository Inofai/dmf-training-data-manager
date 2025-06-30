
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminCheckComplete, setAdminCheckComplete] = useState(false);

  const checkAdminRole = async (userId: string) => {
    console.log('🔍 Starting admin role check for user:', userId);
    setAdminCheckComplete(false);
    
    try {
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: userId,
        _role: 'admin'
      });
      
      if (error) {
        console.error('❌ Error checking admin role:', error);
        setIsAdmin(false);
      } else {
        console.log('✅ Admin role check result:', data);
        setIsAdmin(data || false);
      }
    } catch (error) {
      console.error('❌ Exception during admin role check:', error);
      setIsAdmin(false);
    } finally {
      setAdminCheckComplete(true);
      console.log('🏁 Admin role check completed');
    }
  };

  useEffect(() => {
    console.log('🚀 Setting up auth state listener');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.id);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Check admin role immediately when user is authenticated
          await checkAdminRole(session.user.id);
        } else {
          setIsAdmin(false);
          setAdminCheckComplete(true);
        }
        
        // Only set loading to false after everything is complete
        setLoading(false);
      }
    );

    // Check for existing session
    const initializeAuth = async () => {
      console.log('🔍 Checking for existing session');
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error getting session:', error);
          setLoading(false);
          return;
        }
        
        console.log('📋 Existing session found:', session?.user?.id);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await checkAdminRole(session.user.id);
        } else {
          setIsAdmin(false);
          setAdminCheckComplete(true);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('❌ Exception during auth initialization:', error);
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      console.log('🧹 Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  // Log state changes for debugging
  useEffect(() => {
    console.log('📊 Auth state update:', {
      user: user?.id,
      loading,
      isAdmin,
      adminCheckComplete
    });
  }, [user, loading, isAdmin, adminCheckComplete]);

  return {
    user,
    session,
    loading,
    isAdmin,
    adminCheckComplete
  };
};
