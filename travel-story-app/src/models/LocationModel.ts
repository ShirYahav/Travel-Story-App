class LocationModel {
    public country: string;
    public city: string;
    public startDate: Date | null;
    public endDate: Date | null;
    public story: string;
    public cost: number;
    public currency: string;
    public photos: File[];
}

export default LocationModel;