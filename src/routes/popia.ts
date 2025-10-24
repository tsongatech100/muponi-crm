import express from 'express';
import { supabase } from '../config/supabase';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

router.get('/consent/contact/:contactId', authenticateToken, requireRole('ADMIN', 'QA', 'MANAGER'), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('consents')
      .select('*')
      .eq('contact_id', req.params.contactId);

    if (error) throw error;
    res.json({ consents: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/consent', authenticateToken, requireRole('ADMIN', 'QA', 'MANAGER'), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('consents')
      .insert([req.body])
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/dsr', authenticateToken, requireRole('ADMIN', 'QA', 'MANAGER'), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('dsr_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ requests: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/dsr', authenticateToken, requireRole('ADMIN', 'QA', 'MANAGER'), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('dsr_requests')
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
