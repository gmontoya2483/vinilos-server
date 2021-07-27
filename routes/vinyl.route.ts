import {Request, Response, Router} from "express";
import {validateNewVinyl} from "../middlewares/body_request_validation/vinyl.body.validations.middleware";
import {VinylService} from "../services/vinyl.service";
import {IPagination} from "../interfaces/pagination.interfaces";
import {DEFAULT_PAGE_SIZE} from "../globals/environment.global";

const router = Router();

router.get('/:id', [], async (req:Request, res: Response)=>{
    const returnedResponse = await VinylService.getSingleVinyl(req.params.id);
    return res.status(returnedResponse.status).json(returnedResponse.response);
});

router.get('/', [], async (req: Request, res: Response) => {
    const search = req.query.search || null;
    const showDeleted  = req.query.showDeleted === 'true';
    const pagination: IPagination = {
        pageNumber: Number(req.query.page) || 1,
        pageSize : Number(req.query.pageSize) || DEFAULT_PAGE_SIZE
    }

    const returnedResponse = await VinylService.getAllVinyls(search, pagination, showDeleted);
    return res.status(returnedResponse.status).json(returnedResponse.response);
});

router.post('/', [validateNewVinyl], async (req:Request, res: Response)=>{
    const returnedResponse = await VinylService.newVinyl(req.body);
    return res.status(returnedResponse.status).json(returnedResponse.response);
});



export default router;
