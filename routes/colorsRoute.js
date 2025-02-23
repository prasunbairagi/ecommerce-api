import express from 'express';
import { createColorCtrl,
    getAllColorsCtrl,
    getSingleColorCtrl,
    updateColorCtrl,
    deleteColorCtrl,
    deleteAllColorsCtrl } from "../controllers/colorsCtrl.js";
import { isLoggedIn } from '../middlewares/isLoggedIn.js'
import isAdmin from '../middlewares/isAdmin.js';
const colorsRouter = express.Router();

colorsRouter.post('/',isLoggedIn, isAdmin, createColorCtrl);
colorsRouter.get('/', getAllColorsCtrl);
colorsRouter.get('/:id', getSingleColorCtrl);
colorsRouter.put('/:id',isLoggedIn, isAdmin, updateColorCtrl);
colorsRouter.delete('/delete/all', isLoggedIn, isAdmin,deleteAllColorsCtrl);
colorsRouter.delete('/:id',isLoggedIn, isAdmin, deleteColorCtrl);
export default colorsRouter; 