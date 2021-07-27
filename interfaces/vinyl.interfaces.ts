import {IShortGenre} from "./genre.interfaces";
import {IShortAuthor} from "./author.interfaces";

export interface INewVinyl {
    title: string;
    description: string;
    authorId: string;
    genreId: string
}

export interface IUpdateVinyl {
    title: string;
    description: string;
    authorId: string;
    genreId: string
}



export interface IServiceResponse {
    status: number;
    response : {
        ok: boolean;
        mensaje?: string;
        vinyl?: {};
        total?: number;
        vinyls?: {
            pagination?: {},
            vinyls?: {}[]
        };
        copies?: {}[];
    }
}
