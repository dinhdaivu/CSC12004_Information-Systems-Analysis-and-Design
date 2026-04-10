import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export const getBranches = async (req: Request, res: Response) => {
  try {
    // Gọi Supabase lấy danh sách branches và đếm số phòng (rooms)
    const { data: branches, error } = await supabase
      .from('branches')
      .select('*, rooms(id)');

    if (error) throw error;

    // Map dữ liệu từ Database (snake_case) sang Frontend Model (camelCase)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mappedBranches = branches.map((b: any) => ({
      id: b.id,
      name: b.name,
      address: b.address,
      description: b.description,
      heroImage: b.hero_image_url || 'assets/pictures/Homepage Tô Hiến Thành.png',
      // Supabase trả về mảng rooms, ta lấy chiều dài làm số lượng phòng
      roomCount: b.rooms ? b.rooms.length : 0 
    }));

    res.status(200).json(mappedBranches);
  } catch (error) {
    const err = error as Error;
    console.error('Lỗi khi lấy dữ liệu:', err.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getBranchById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Cập nhật: Kiểm tra trước xem ID có đúng định dạng UUID không
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id as string)) {
      return res.status(404).json({ message: 'Branch not found (Invalid ID format)' });
    }

    const { data: branch, error } = await supabase
      .from('branches')
      .select('*, rooms(id)')
      .eq('id', id)
      .single(); // Lấy 1 bản ghi duy nhất

    if (error) {
      if (error.code === 'PGRST116') {
         return res.status(404).json({ message: 'Branch not found' });
      }
      throw error;
    }

    // Map sang Frontend Model
    const mappedBranch = {
      id: branch.id,
      name: branch.name,
      address: branch.address,
      description: branch.description,
      heroImage: branch.hero_image_url || 'assets/pictures/Homepage Tô Hiến Thành.png',
      roomCount: branch.rooms ? branch.rooms.length : 0
    };

    res.status(200).json(mappedBranch);
  } catch (error) {
    const err = error as Error;
    console.error('Lỗi khi lấy dữ liệu:', err.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}