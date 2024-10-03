import LocationModel from "./LocationModel";
import RouteModel from "./RouteModel";
import UserModel from "./UserModel";

class StoryModel {
    _id: string;
    user: UserModel;
    countries: string[];
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    budget: number;
    currency: string;
    locations: LocationModel[];
    routes:RouteModel[];
}

export default StoryModel;