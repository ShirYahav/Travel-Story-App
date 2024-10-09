class UserModel {
    _id:string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role?: string; 
    likedStories: string[];
}

export default UserModel;