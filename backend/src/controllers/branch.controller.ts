import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export const getBranches = async (req: Request, res: Response) => {
  try {
    const { data: branches, error } = await supabase.from('branches').select('*, rooms(id)');
    if (error) throw error;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mappedBranches = branches.map((b: any) => ({
      id: b.id,
      name: b.name,
      address: b.address,
      description: b.description,
      heroImage: b.hero_image_url || 'assets/pictures/Homepage Tô Hiến Thành.png',
      roomCount: b.rooms ? b.rooms.length : 0
    }));

    res.status(200).json(mappedBranches);
  } catch (error) {
    const err = error as Error;
    console.error('Lỗi khi lấy danh sách:', err.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getBranchById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data: branch, error } = await supabase
      .from('branches')
      .select('*, rooms(id)')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
         return res.status(404).json({ message: 'Branch not found' });
      }
      throw error;
    }

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
    // Fix Log Injection: Tách biến id ra khỏi chuỗi log
    console.error('Lỗi khi lấy chi nhánh bằng ID:', { branchId: req.params.id, error: err.message });
    res.status(500).json({ message: 'Internal Server Error' });
  }
};