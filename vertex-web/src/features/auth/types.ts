export interface User{
    id : string;
    email : string;
    name : string;
    createdAt : string;
}

export interface AuthResponseDto{
    token : string;
    user : User;
}

export interface loginRequestDto{
    email : string;
    password : string;
}

export interface registerRequestDto extends loginRequestDto{
    name : string;
}