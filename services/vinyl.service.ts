import {INewVinyl, IServiceResponse, IUpdateVinyl} from "../interfaces/vinyl.interfaces";
import {Vinyl} from "../models/vinyl.model";
import {AuthorService} from "./author.service";
import {GenreService} from "./genre.service";
import {DEFAULT_PAGE_SIZE} from "../globals/environment.global";
import {IPagination} from "../interfaces/pagination.interfaces";
import {Pagination} from "../classes/pagination.class";
import {IDeleteAuthor} from "../interfaces/author.interfaces";
import {CopyService} from "./copy.service";

export abstract class VinylService {

    public static async newVinyl ({title, description, authorId, genreId }: INewVinyl): Promise<IServiceResponse>{

        title = title.trim().toUpperCase();
        description = description.trim();

        // Verifica si el libro ya existe
        const duplicateVinyl = await Vinyl.findOne({
            'title': {$regex:  `${title}`, $options:'i'}
        });
        if (duplicateVinyl) return this.BadRequestVinylMessage(`El vinilo ${ title } ya existe`);

        // Verifica y Obtiene la información del autor
        const author: any = await AuthorService.findAuthor(authorId);
        if (!author) return this.BadRequestVinylMessage(`Autor no encontrado`);

        // Verifica y Obtiene el Género
        const genre: any = await GenreService.findGenre(genreId);
        if ( !genre ) return this.BadRequestVinylMessage(`Genero no encontrado`)

        // Guardar el vinilo
        const vinyl = new Vinyl({title, description, author, genre});
        await vinyl.save();

        return {
            status: 201,
            response: {
                ok: true,
                mensaje: `El vinilo ${ title } ha sido agregado`,
                vinyl
            }
        }
    }

    public static async getAllVinyls(search: any = null, {pageNumber = 1, pageSize = DEFAULT_PAGE_SIZE}: IPagination
        , showDeleted: boolean = false): Promise<IServiceResponse> {

        // Generat criterio de búsqueda
        let criteria = {};
        if(search){
            criteria = {
                ...criteria,
                $or: [
                    {title: {$regex:  `.*${search}.*`, $options:'i'}},
                    {'author.name': {$regex: `.*${search}.*`, $options:'i'}},
                    {'author.lastName': {$regex: `.*${search}.*`, $options:'i'}},
                    {'genre.name': {$regex: `.*${search}.*`, $options:'i'}}
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

        const totalVinyls = await Vinyl.countDocuments(criteria);
        const pagination = await new Pagination(totalVinyls,pageNumber, pageSize).getPagination();
        // Actualiza page number de acuerdo a la paginación
        const currentPageNumber = pagination.currentPage;

        const vinyls = await Vinyl.find(criteria)
            .skip((currentPageNumber - 1) * pageSize)
            .limit(pageSize)
            .sort({title: 1});


        return {
            status: 200,
            response: {
                ok: true,
                vinyls: {
                    pagination: pagination,
                    vinyls
                }
            }
        };
    }

    public static async findVinyl( vinylId: string) {
        const vinyl = await Vinyl.findById(vinylId);
        return vinyl;
    }

    public static async getSingleVinyl( vinylId: string): Promise<IServiceResponse> {
        const vinyl = await Vinyl.findById(vinylId);
        if(!vinyl) return this.notFoundVinylMessage();

        return {
            status: 200,
            response: {
                ok: true,
                vinyl
            }
        }
    }

    public static async updateVinyl (vinylId: string, { title, description, authorId, genreId }: IUpdateVinyl): Promise<IServiceResponse> {
        //TODO: TRSCL-154 - Agregar transaccion para modificar los  ejemplares

        title = title.trim().toUpperCase();
        description = description.trim();

        // Verifica si el nuevo titulo ya existe
        const duplicateVinyl = await Vinyl.findOne({
            'title': {$regex:  `${title}`, $options:'i'},
            '_id': { $ne: vinylId}
        });
        if (duplicateVinyl) return this.BadRequestVinylMessage(`El vinilo ${ title } ya existe`);

        // Verifica y Obtiene la información del autor
        const author: any = await AuthorService.findAuthor(authorId);
        if (!author) return this.BadRequestVinylMessage(`Autor no encontrado`);

        // Verifica y Obtiene el Género
        const genre: any = await GenreService.findGenre(genreId);
        if ( !genre ) return this.BadRequestVinylMessage(`Genero no encontrado`)

        const vinyl = await Vinyl.findByIdAndUpdate(
            vinylId,
            {
                title,
                description,
                author,
                genre,
                dateTimeUpdated: Date.now()
            }, {new: true});

        if(!vinyl) return this.notFoundVinylMessage();

        return {
            status: 200,
            response: {
                ok: true,
                mensaje: `El vinilo ha sido modificado`,
                vinyl
            }
        }

    }


    public static async deleteVinyl( vinylId: string): Promise<IServiceResponse> {
        if( await this.hasCopies(vinylId)) return this.BadRequestVinylMessage();

        const vinyl: any = await Vinyl.findByIdAndDelete(vinylId);
        if(!vinyl) return this.notFoundVinylMessage();

        return {
            status: 200,
            response: {
                ok: true,
                mensaje: `El vinilo ${ vinyl.title } ha sido eliminado`,
                vinyl
            }
        };
    }

    public static async setDeleted (vinylId: string, {isDeleted}: IDeleteAuthor): Promise<IServiceResponse>{

        const deleted = (isDeleted) ? {value: true, deletedDateTime: Date.now()}
            : {value: false, deletedDateTime: null};

        const vinyl = await Vinyl.findByIdAndUpdate(vinylId, {
            $set: {
                isDeleted: deleted,
                dateTimeUpdated: Date.now()
            }
        }, {new: true});

        if (!vinyl) return this.notFoundVinylMessage();

        const message = (isDeleted) ? `El vinilo ha sido marcado como eliminado`
            : `El vinilo ha sido desmarcado como eliminado`

        return {
            status: 200,
            response: {
                ok: true,
                mensaje: message,
                vinyl
            }

        };

    }


    private static async hasCopies(vinylId: string): Promise<boolean> {
        return await CopyService.ExistsCopiesByVinyl(vinylId);
    }

    public static notFoundVinylMessage(mensaje: string = "Vinilo no encontrado"): IServiceResponse {
        return {
            status: 404,
            response: {
                ok: false,
                mensaje
            }
        };
    }

    public static BadRequestVinylMessage(mensaje: string = `El vinilo tiene Ejemplares asociados`): IServiceResponse {
        return {
            status: 400,
            response: {
                ok: false,
                mensaje
            }
        };
    }

    public static async ExistsVinylsByAuthor(authorId: string): Promise<boolean>{
        const vinyl = await Vinyl.findOne({'author._id': authorId});
        if(!vinyl) return false;

        return true;
    }

    public static async ExistsVinylsByGenre(genreId: string): Promise<boolean>{
        const vinyl = await Vinyl.findOne({'genre._id': genreId});
        if(!vinyl) return false;

        return true;
    }


    public static async getVinylsByAuthor(authorId: string, showDeleted = false): Promise<any[]>{
        // Generar criterio de búsqueda
        let criteria: {} = {
            'author._id': authorId
        };

        if (!showDeleted){
            criteria = {
                ... criteria,
                'isDeleted.value': false
            }
        }
        return Vinyl.find(criteria).sort({'title': 1});
    }
}
