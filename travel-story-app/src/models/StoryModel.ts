import LocationModel from "./LocationModel";
import RouteModel from "./RouteModel";

class StoryModel {
    user: string;
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