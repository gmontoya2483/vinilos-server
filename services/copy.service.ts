import {ICriteria, INewCopy, IServiceResponse} from "../interfaces/copy.interfaces";
import {UserService} from "./user.service";
import {VinylService} from "./vinyl.service";
import {Copy} from "../models/copy.model";
import {DEFAULT_PAGE_SIZE} from "../globals/environment.global";
import {IPagination} from "../interfaces/pagination.interfaces";
import {Pagination} from "../classes/pagination.class";
import {FollowService} from "./follow.service";
import {Vinyl} from "../models/vinyl.model";



export abstract class CopyService {


    public static async newCopy (meId: string, {vinylId}: INewCopy): Promise<IServiceResponse>{

        const owner: any = await UserService.findUser(meId);
        if (!owner) return this.badRequestCopyMessage("Usario no encontrado");

        const vinyl: any = await VinylService.findVinyl(vinylId);
        if (!vinyl) return this.badRequestCopyMessage("Vinilo no encontrado");


        const copy: any = new Copy({vinyl, owner});
        await copy.save();

        return {
            status: 201,
            response: {
                ok: true,
                mensaje: `El vinilo ${ vinyl.title } fue agregado a la biblioteca`,
                copy
            }
        }
    }


    public static async getAllCopiesByCommunity(search: any = null, {pageNumber = 1, pageSize = DEFAULT_PAGE_SIZE}: IPagination
        , showDeleted: boolean = false, { communityId }: ICriteria, meId: string): Promise<IServiceResponse> {

        const result = await this.getAllCopies(search, {pageNumber, pageSize}, showDeleted, {userId: null, communityId});

        // Agregar informacion si el Owner esta siendo seguido por "me"
        const copiesWithFollowing: any [] = [];
        let i = 0;
        const totalCopies =  result.response.copies?.copies?.length || 0;

        while (i < totalCopies){
            const currentCopy = result.response.copies!.copies![i];
            // @ts-ignore
            const isOwnerFollowedByMe = await FollowService.getIfUserAFollowsUserB(meId, currentCopy.owner._id, true);
            // @ts-ignore
            copiesWithFollowing.push({...currentCopy._doc, isOwnerFollowedByMe: isOwnerFollowedByMe});

            i++;
        }
        result.response.copies!.copies = copiesWithFollowing;


        return result;

    }


    public static async getAllCopiesByUser(search: any = null, {pageNumber = 1, pageSize = DEFAULT_PAGE_SIZE}: IPagination
        , showDeleted: boolean = false, { userId }: ICriteria): Promise<IServiceResponse> {
        return await this.getAllCopies(search, {pageNumber, pageSize}, showDeleted, {userId, communityId: null});
    }





    private static async getAllCopies(search: any = null, {pageNumber = 1, pageSize = DEFAULT_PAGE_SIZE}: IPagination
    , showDeleted: boolean = false, {userId = null, communityId = null}: ICriteria): Promise<IServiceResponse> {

        // Generat criterio de búsqueda
        let criteria = {};

        // Agregar UserId
        if(userId){
            criteria = {
                ...criteria,
                'owner._id': userId
            }
        }

        // Agregar UserId
        if(communityId){
            criteria = {
                ...criteria,
                'owner.comunidad._id': communityId
            }
        }

        // Agregar search
        if(search){
            criteria = {
                ...criteria,
                $or: [
                    {'vinyl.title': {$regex:  `.*${search}.*`, $options:'i'}},
                    {'vinyl.author.name': {$regex: `.*${search}.*`, $options:'i'}},
                    {'vinyl.author.lastName': {$regex: `.*${search}.*`, $options:'i'}},
                    {'vinyl.genre.name': {$regex: `.*${search}.*`, $options:'i'}},
                    {'owner.nombre': {$regex: `.*${search}.*`, $options:'i'}},
                    {'owner.apellido': {$regex: `.*${search}.*`, $options:'i'}}
                ]
            }
        }

        // Verificar si se muestran los marcados como borrados
        if (!showDeleted){
            criteria = {
                ... criteria,
                'isDeleted.value': false
            }
        }

        const totalCopies = await Copy.countDocuments(criteria);
        const pagination = await new Pagination(totalCopies,pageNumber, pageSize).getPagination();
        // Actualiza page number de acuerdo a la paginación
        const currentPageNumber = pagination.currentPage;

        const copies = await Copy.find(criteria)
            .skip((currentPageNumber - 1) * pageSize)
            .limit(pageSize)
            .sort({'vinyl.title': 1});


        return {
            status: 200,
            response: {
                ok: true,
                copies: {
                    pagination: pagination,
                    copies
                }
            }
        };


    }


    public static async ExistsCopiesByVinyl(vinylId: string): Promise<boolean>{
        const copy = await Copy.findOne({'vinyl._id': vinylId});
        if(!copy) return false;

        return true;
    }




    public static badRequestCopyMessage(mensaje: string): IServiceResponse {
        return {
            status: 400,
            response: {
                ok: false,
                mensaje
            }
        };
    }



}
