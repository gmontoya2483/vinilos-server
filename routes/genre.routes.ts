import {Request, Response, Router} from "express";
import {isAdmin} from "../middlewares/admin.middleware"
import {
    validateDeleteGenre,
    validateNewGenre,
    validateUpdateGenre
} from "../middlewares/body_request_validation/genre.body.validations.middleware"
import {GenreService} from "../services/genre.service";

const router = Router();

router.get('/', [], async (req:Request, res: Response)=>{
    const search = req.query.search || null;
    const showDeleted  = req.query.showDeleted === 'true';
    const returnedResponse = await GenreService.getAllGenres(search, showDeleted);
    return res.status(returnedResponse.status).json(returnedResponse.response);
});

router.get('/:id', [], async (req:Request, res: Response)=>{
    const returnedResponse = await GenreService.getSingleGenre(req.params.id);
    return res.status(returnedResponse.status).json(returnedResponse.response);
});

export default router;
