

export type AllUsersParams = [];


export interface IAllUsersResult {
    centralizedCompanyCompanyName: string;
	firstName: string;
};


export interface IAllUsersQuery {
    params: AllUsersParams;
    result: IAllUsersResult;
};

