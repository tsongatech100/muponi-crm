import express from 'express';
import { supabase } from '../config/supabase';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.get('/contacts', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const contacts = req.user.role === 'VIEWER'
      ? data.map(c => ({ ...c, email: c.email.replace(/(.{2})(.*)(@.*)/, '$1***$3') }))
      : data;

    res.json({ contacts });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/contacts/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/contacts', authenticateToken, requireRole('ADMIN', 'MANAGER', 'AGENT'), async (req: AuthRequest, res) => {
  try {
    const { data, error } = await supabase
      .from('contacts')
      .insert([{ ...req.body, created_by: req.user.id }])
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/contacts/:id', authenticateToken, requireRole('ADMIN', 'MANAGER', 'AGENT'), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('contacts')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/contacts/:id', authenticateToken, requireRole('ADMIN', 'MANAGER'), async (req, res) => {
  try {
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'Contact deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/opportunities', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ opportunities: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/opportunities', authenticateToken, requireRole('ADMIN', 'MANAGER', 'AGENT'), async (req: AuthRequest, res) => {
  try {
    const { data, error } = await supabase
      .from('opportunities')
      .insert([{ ...req.body, created_by: req.user.id }])
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/activities', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ activities: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/activities', authenticateToken, requireRole('ADMIN', 'MANAGER', 'AGENT'), async (req: AuthRequest, res) => {
  try {
    const { data, error } = await supabase
      .from('activities')
      .insert([{ ...req.body, created_by: req.user.id }])
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
