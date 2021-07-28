import {
    IDeleteAuthor,
    INewAuthor,
    IServiceResponse,
    IUpdateAuthor
} from "../interfaces/author.interfaces";
import {Author} from "../models/author.model";
import {IPagination} from "../interfaces/pagination.interfaces";
import {Pagination} from "../classes/pagination.class";
import {DEFAULT_PAGE_SIZE} from "../globals/environment.global";

import {VinylService} from "./vinyl.service";

/**
 *  Esta clase abstracta se encarga de del manejo de los autores
 * */

export abstract class AuthorService {

    /**
     * Este método se utiliza para agregar un nuevo autor
     *  @returns el autor insertado
     *  @param datos del nuevo autor
     * */
    public static async newAuthor (newAuthor: INewAuthor): Promise<IServiceResponse>{

        const name = newAuthor.name.trim().toUpperCase();
        const lastName = newAuthor.lastName.trim().toUpperCase();

        const duplicateAuthor = await Author.findOne({
            'name': {$regex:  `${name}`, $options:'i'},
            'lastName': {$regex:  `${lastName}`, $options:'i'}
        });
        if (duplicateAuthor) return this.BadRequestAuthorMessage(`El autor ${ name } ${ lastName} ya existe`);

        const author = new Author({name, lastName});
        await author.save();

        return {
            status: 201,
            response: {
                ok: true,
                mensaje: `El autor ${name} ${lastName} ha sido agregado`,
                author
            }
        }
    }

    public static async getAllAuthors(search: any = null, {pageNumber = 1, pageSize = DEFAULT_PAGE_SIZE}: IPagination
                                      , showDeleted: boolean = false): Promise<IServiceResponse> {

        // Generat criterio de búsqueda
        let criteria = {};
        if(search){
            criteria = {
                ...criteria,
                $or: [
                    {name: {$regex:  `.*${search}.*`, $options:'i'}},
                    {lastName: {$regex: `.*${search}.*`, $options:'i'}}
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

        const totalAuthors = await Author.countDocuments(criteria);
        const pagination = await new Pagination(totalAuthors,pageNumber, pageSize).getPagination();
        // Actualiza page number de acuerdo a la paginación
        const currentPageNumber = pagination.currentPage;

        const authors = await Author.find(criteria)
            .skip((currentPageNumber - 1) * pageSize)
            .limit(pageSize)
            .sort({lastName: 1, name: 1}).select({ password: 0});


        return {
            status: 200,
            response: {
                ok: true,
                authors: {
                    pagination: pagination,
                    authors
                }
            }
        };
    }

    public static async getSingleAuthor(authorId: string): Promise<IServiceResponse> {
        const author = await Author.findById(authorId);
        if (!author) return this.notFoundAuthorMessage();

        return {
            status: 200,
            response: {
                ok: true,
                author
            }

        };
    }

    public static async findAuthor( authorId: string ) {
        return Author.findById(authorId).select({_v: 0});
    }


    public static async setDeleted (authorId: string, {isDeleted}: IDeleteAuthor): Promise<IServiceResponse>{

        const deleted = (isDeleted) ? {value: true, deletedDateTime: Date.now()}
            : {value: false, deletedDateTime: null};

        const author = await Author.findByIdAndUpdate(authorId, {
            $set: {
                isDeleted: deleted,
                dateTimeUpdated: Date.now()
            }
        }, {new: true});

        if (!author) return this.notFoundAuthorMessage();

        const message = (isDeleted) ? `El autor ha sido marcado como eliminado`
            : `El autor ha sido desmarcado como eliminado`

        return {
            status: 200,
            response: {
                ok: true,
                mensaje: message,
                author
            }

        };

    }


    public static async deleteAuthor(authorId: string): Promise<IServiceResponse> {

        if (await this.hasVinyls(authorId)) return  this.BadRequestAuthorMessage();

        const author: any = await Author.findByIdAndDelete(authorId);

        if (!author) return this.notFoundAuthorMessage();

        return {
            status: 200,
            response: {
                ok: true,
                mensaje: `El Autor ${ author.name } ${author.lastName} ha sido eliminado`,
                author
            }

        };

    }


    public static async updateAuthor (authorId: string, {name, lastName}: IUpdateAuthor): Promise<IServiceResponse> {

        //TODO: TRSCL-153 - Agregar transaccion para modificar los vinilos y los ejemplares

        name = name.trim().toUpperCase();
        lastName = lastName.trim().toUpperCase();

        const duplicateAuthor = await Author.findOne({
            'name': {$regex:  `${name}`, $options:'i'},
            'lastName': {$regex:  `${lastName}`, $options:'i'},
            '_id': { $ne: authorId }
        });
        if (duplicateAuthor) return this.BadRequestAuthorMessage(`El autor ${ name } ${ lastName} ya existe`);


        const author = await Author.findByIdAndUpdate(authorId, {
            $set: {
                name,
                lastName,
                dateTimeUpdated: Date.now()
            }
        }, {new: true});

        if (!author) return this.notFoundAuthorMessage();

        return {
            status: 200,
            response: {
                ok: true,
                mensaje: `El autor ha sido modificado`,
                author
            }

        };
    }

    public static async getVinyls(authorId: string,  showDeleted: boolean = false): Promise<IServiceResponse> {
        const author= await Author.findById(authorId);
        if (!author) return this.notFoundAuthorMessage();

        const vinyls: any [] =  await VinylService.getVinylsByAuthor(authorId, showDeleted);

        return {
            status: 200,
            response: {
                ok: true,
                vinyls
            }

        };

    }



    private static async hasVinyls(authorId: string): Promise<boolean> {
        return await VinylService.ExistsVinylsByAuthor(authorId);
    }



    private static notFoundAuthorMessage(mensaje: string = "Autor no encontrado"): IServiceResponse {
        return {
            status: 404,
            response: {
                ok: false,
                mensaje
            }
        };
    }

    public static BadRequestAuthorMessage(mensaje: string = `El author tiene vinilos asociados`): IServiceResponse {
        return {
            status: 400,
            response: {
                ok: false,
                mensaje
            }
        };
    }



}

