export interface INewCopy {
    vinylId: string;
}


export interface ICriteria {
    userId?: string | null,
    communityId?: string | null
}


export interface IServiceResponse {
    status: number;
    response : {
        ok: boolean;
        mensaje?: string;
        copy?: {};
        total?: number;
        copies?: {
            pagination?: {},
            copies?: {}[]
        };
    }
}
