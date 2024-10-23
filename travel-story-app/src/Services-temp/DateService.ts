import LocationModel from "../Models-temp/LocationModel";
import StoryModel from "../Models-temp/StoryModel";

export function calculateDaysDifference(startDate: Date | string, endDate: Date | string): number {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  const timeDifference = end.getTime() - start.getTime();    
  const daysDifference = timeDifference / (1000 * 3600 * 24);
  return Math.round(daysDifference); 
}


export const formatDate = (date: Date): string => {
    const day = date.getDate(); // Get day (1-31)
    const month = date.getMonth() + 1; // Get month (0-11), add 1 to make it 1-12
    const year = date.getFullYear(); // Get full year (e.g., 2023)
    return `${day}/${month}/${year}`;
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

export const convertStoryData = (stories: any[]): StoryModel[] => {
  return stories.map((story) => ({
    ...story,
    startDate: new Date(story.startDate),  // Convert startDate string to Date
    endDate: new Date(story.endDate),      // Convert endDate string to Date
    locations: story.locations.map((location:LocationModel) => ({
      ...location,
      startDate: new Date(location.startDate),  // Convert location startDate
      endDate: new Date(location.endDate),      // Convert location endDate
    })),
  }));
};