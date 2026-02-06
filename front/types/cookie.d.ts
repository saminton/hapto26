export type Cookie = {
	value?: any;
	maxAge?: number;
	expires?: Date;
	httpOnly?: boolean;
	domain?: string;
	path?: string;
	sameSite?: boolean;
	encode?: Function;
	decode?: Function;
};
