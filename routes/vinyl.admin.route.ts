import {Request, Response, Router} from "express";
import {
    validateDeleteVinyl,
    validateUpdateVinyl
} from "../middlewares/body_request_validation/vinyl.body.validations.middleware";
import {VinylService} from "../services/vinyl.service";

const router = Router();

router.put( '/:id', [validateUpdateVinyl], async (req:Request, res: Response)=>{
    const returnedResponse = await VinylService.updateVinyl(req.params.id, req.body);
    return res.status(returnedResponse.status).json(returnedResponse.response);
});

router.put('/:id/delete', [validateDeleteVinyl], async (req:Request, res: Response)=>{
    const returnedResponse = await VinylService.setDeleted(req.params.id, req.body);
    return res.status(returnedResponse.status).json(returnedResponse.response);
});

router.delete('/:id', [], async (req:Request, res: Response)=>{
    const returnedResponse = await VinylService.deleteVinyl(req.params.id);
    return res.status(returnedResponse.status).json(returnedResponse.response);
});


export default router;
