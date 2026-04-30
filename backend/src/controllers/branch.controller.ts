import { Request, Response } from 'express';
import { supabase } from '@config/supabase';

// Bổ sung thêm zones vào type để hứng dữ liệu từ DB mới
type BranchWithRooms = {
  id: string;
  name: string;
  address: string;
  description: string;
  hero_image_url?: string | null;
  rooms?: Array<{ id: string | number }> | null; 
  zones?: Array<{ rooms?: Array<{ id: string | number }> | null }> | null;
};

const DEFAULT_BRANCH_HERO_IMAGE = 'assets/pictures/Homepage Tô Hiến Thành.png';

const BRANCH_HERO_IMAGES: Array<{ keys: string[]; heroImage: string }> = [
  { keys: ['to hien thanh'], heroImage: 'assets/pictures/Homepage Tô Hiến Thành.png' },
  { keys: ['tran nao'], heroImage: 'assets/pictures/Homepage Trần Não.png' },
  { keys: ['nguyen cuu van'], heroImage: 'assets/pictures/Homepage Nguyễn Cửu Vân.png' },
];

function getSupabaseClient() {
  if (!supabase) {
    throw new Error('Supabase client is not configured');
  }

  return supabase;
}

function mapBranch(branch: BranchWithRooms) {
  // Tính tổng số lượng phòng thông qua bảng zones
  let totalRooms = 0;
  if (branch.zones) {
    totalRooms = branch.zones.reduce((sum, zone) => sum + (zone.rooms?.length || 0), 0);
  } else if (branch.rooms) {
    totalRooms = branch.rooms.length;
  }

  return {
    id: branch.id,
    name: branch.name,
    address: branch.address,
    description: branch.description,
    heroImage: branch.hero_image_url || resolveBranchHeroImage(branch),
    roomCount: branch.rooms?.length ?? 0,
  };
}

function resolveBranchHeroImage(branch: BranchWithRooms): string {
  const searchableText = normalizeText(`${branch.name} ${branch.address}`);
  const preset = BRANCH_HERO_IMAGES.find((item) => item.keys.some((key) => searchableText.includes(key)));
  return preset?.heroImage ?? DEFAULT_BRANCH_HERO_IMAGE;
}

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export const getBranches = async (req: Request, res: Response) => {
  void req;

  try {
    const client = getSupabaseClient();
    // Thay đổi query: truy vấn lồng qua zones để lấy danh sách rooms
    const { data: branches, error } = await client.from('branches').select('*, zones(rooms(id))');

    if (error) {
      throw error;
    }

    res.status(200).json((branches ?? []).map((branch) => mapBranch(branch as BranchWithRooms)));
  } catch (error) {
    const err = error as Error;
    console.error('Failed to fetch branches:', err.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getBranchById = async (req: Request, res: Response) => {
  try {
    const client = getSupabaseClient();
    const { id } = req.params;
    // Thay đổi query: truy vấn lồng qua zones để lấy danh sách rooms
    const { data: branch, error } = await client
      .from('branches')
      .select('*, zones(rooms(id))')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ message: 'Branch not found' });
      }

      throw error;
    }

    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    res.status(200).json(mapBranch(branch as BranchWithRooms));
  } catch (error) {
    const err = error as Error;
    console.error('Failed to fetch branch by id:', { branchId: req.params.id, error: err.message });
    res.status(500).json({ message: 'Internal Server Error' });
  }
};