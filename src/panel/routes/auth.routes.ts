import { Router } from 'express';

import { authRateLimit } from '../../middlewares/rateLimit';
import { panelFlash } from '../middlewares/flash';
import { panelAuth } from '../middlewares/panelAuth';
import { getLogin, getPanelHome, postLogin, postLogout } from '../controllers/auth.controller';

export const panelAuthRoutes = Router();

panelAuthRoutes.get('/', panelFlash, panelAuth, getPanelHome);
panelAuthRoutes.get('/login', panelFlash, getLogin);
panelAuthRoutes.post('/login', authRateLimit, panelFlash, postLogin);
panelAuthRoutes.post('/logout', panelFlash, postLogout);
