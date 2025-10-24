import express from 'express';
import { supabase } from '../config/supabase';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.get('/ncr', authenticateToken, requireRole('ADMIN', 'QA', 'MANAGER'), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('ncrs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ ncrs: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/ncr', authenticateToken, requireRole('ADMIN', 'QA', 'MANAGER'), async (req: AuthRequest, res) => {
  try {
    const { data, error } = await supabase
      .from('ncrs')
      .insert([{ ...req.body, raised_by: req.user.id }])
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/documents', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ documents: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/documents', authenticateToken, requireRole('ADMIN', 'QA', 'MANAGER'), async (req: AuthRequest, res) => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .insert([{ ...req.body, owner: req.user.id }])
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/suppliers', authenticateToken, requireRole('ADMIN', 'QA', 'MANAGER'), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ suppliers: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/suppliers', authenticateToken, requireRole('ADMIN', 'QA', 'MANAGER'), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .insert([req.body])
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
