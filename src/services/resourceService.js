import { supabase } from '../lib/supabaseClient';

export const resourceService = {
  async getAll() {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) { console.error(error); return []; }
    return data;
  },

  async create(data, currentUser) {
    const { data: newResource, error } = await supabase
      .from('resources')
      .insert([{
        title: data.title,
        description: data.description,
        file_name: data.fileName,
        file_size: data.fileSize,
        file_type: data.fileType,
        file_url: data.fileDataUrl,
        uploader_name: currentUser.name,
        uploader_role: currentUser.role,
        department: currentUser.department,
      }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return newResource;
  },

  async deleteById(id) {
    const { error } = await supabase.from('resources').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }
};
