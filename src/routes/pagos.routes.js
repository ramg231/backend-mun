import {Router}  from 'express'
import {getPago,getMeta  } from "../controllers/pagos.controllers.js";
const router = Router()

router.get('/pagos/:fechai/:fechaf',getPago)
router.get('/meta',getMeta)

export default router