import {NextFunction, Request, Response } from "express";
import { schemas } from '../../dto_schemas/vinyl.dto.schemas';

export const validateNewVinyl = function  (req: Request, res: Response, next: NextFunction) {
    const { error, value } = schemas.new.validate(req.body);
    error ? res.status(422).json({
            ok: false,
            mensaje: error.details[0].message.replace(/['"]+/g, "")
        })
        : next();
}

export const  validateUpdateVinyl = function (req: Request, res: Response, next: NextFunction) {
    const { error, value } = schemas.update.validate(req.body);
    error ? res.status(422).json({
            ok: false,
            mensaje: error.details[0].message.replace(/['"]+/g, "")
        })
        : next();
}

export const  validateDeleteVinyl = function (req: Request, res: Response, next: NextFunction) {
    const { error, value } = schemas.delete.validate(req.body);
    error ? res.status(422).json({
            ok: false,
            mensaje: error.details[0].message.replace(/['"]+/g, "")
        })
        : next();
}
