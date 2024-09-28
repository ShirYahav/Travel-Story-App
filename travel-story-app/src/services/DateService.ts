import LocationModel from "../models/LocationModel";

export function calculateDaysDifference(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDifference = end.getTime() - start.getTime();    
    const daysDifference = timeDifference / (1000 * 3600 * 24);
    return Math.round(daysDifference); 
}

export const formatDate = (date: Date): string => {
    const day = date.getDate(); // Get day (1-31)
    const month = date.getMonth() + 1; // Get month (0-11), add 1 to make it 1-12
    const year = date.getFullYear(); // Get full year (e.g., 2023)
    return `${day}.${month}.${year}`;
};

export const getDateRangeFromLocations = (locations: LocationModel[]) => {
    if (locations.length === 0) return { earliestDate: null, latestDate: null };
  
    let earliestDate: Date | null = locations[0].startDate ? new Date(locations[0].startDate) : null;
    let latestDate: Date | null = locations[0].endDate ? new Date(locations[0].endDate) : null;
  
    locations.forEach((location) => {
      if (location.startDate && (!earliestDate || new Date(location.startDate) < earliestDate)) {
        earliestDate = new Date(location.startDate);
      }
      if (location.endDate && (!latestDate || new Date(location.endDate) > latestDate)) {
        latestDate = new Date(location.endDate);
      }
    });
    return { earliestDate, latestDate };
};