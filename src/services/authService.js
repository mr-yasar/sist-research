import { supabase } from '../lib/supabaseClient';

export const authService = {
  async login(email, password) {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (authError) throw new Error(authError.message);

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) throw new Error('Could not fetch user profile.');

    const user = { ...authData.user, ...profile };
    return { user };
  },

  async register(userData) {
    const { email, password, name, role, department } = userData;
    
    // 1. Sign up in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });
    if (authError) throw new Error(authError.message);
    if (!authData.user) throw new Error('Sign up failed');

    // 2. Create profile in the database
    const avatarColor = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899'][Math.floor(Math.random() * 5)];
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: authData.user.id,
          name,
          email,
          role,
          department,
          avatar_color: avatarColor
        }
      ])
      .select()
      .single();

    if (profileError) throw new Error('Could not create user profile.');

    const user = { ...authData.user, ...profile };
    return { user };
  },

  async logout() {
    await supabase.auth.signOut();
  },

  async getCurrentUser() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (!profile) return null;
    return { ...session.user, ...profile };
  },

  // For Admin Dashboard
  async getAllUsers() {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) throw new Error(error.message);
    return data;
  }
};
