class LocationModel {
    public _id: string;
    public country: string;
    public city: string;
    public startDate: Date;
    public endDate: Date;
    public story: string;
    public cost: number;
    public currency: string;
    public photos: (File | string)[];
    public videos: (File | string)[];
}

export default LocationModel;