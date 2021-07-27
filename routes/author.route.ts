import {Request, Response, Router} from "express";
import {
    validateNewAuthor
} from "../middlewares/body_request_validation/author.body.validations.middleware"
import {AuthorService} from "../services/author.service";
import {DEFAULT_PAGE_SIZE} from "../globals/environment.global";
import {IPagination} from "../interfaces/pagination.interfaces";

const router = Router();

router.get('/', [], async (req:Request, res: Response)=>{
    const search = req.query.search || null;
    const showDeleted  = req.query.showDeleted === 'true';
    const pagination: IPagination = {
        pageNumber: Number(req.query.page) || 1,
        pageSize : Number(req.query.pageSize) || DEFAULT_PAGE_SIZE
    }

    const returnedResponse = await AuthorService.getAllAuthors(search, pagination, showDeleted);
    return res.status(returnedResponse.status).json(returnedResponse.response);
});

router.get('/:id', [], async (req:Request, res: Response)=>{
    const returnedResponse = await AuthorService.getSingleAuthor(req.params.id);
    return res.status(returnedResponse.status).json(returnedResponse.response);
});

router.get('/:id/vinyls', [], async (req:Request, res: Response)=>{
    const showDeleted  = req.query.showDeleted === 'true';
    const returnedResponse = await AuthorService.getVinyls(req.params.id, showDeleted);
    return res.status(returnedResponse.status).json(returnedResponse.response);
});

router.post('/', [validateNewAuthor], async (req:Request, res: Response)=>{
    const returnedResponse = await AuthorService.newAuthor(req.body);
    return res.status(returnedResponse.status).json(returnedResponse.response);
});

export default router;
