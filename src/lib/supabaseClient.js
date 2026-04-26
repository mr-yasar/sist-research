import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lxqmwezqaalplbcmwkcc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4cW13ZXpxYWFscGxiY213a2NjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxODg3ODIsImV4cCI6MjA5Mjc2NDc4Mn0.61e89sEKwZ1G_ihIAnrBId6yE4Hpc3m7SsvwmXuLvTU';

export const supabase = createClient(supabaseUrl, supabaseKey);
