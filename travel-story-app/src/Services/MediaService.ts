import axios from "axios";
import config from "../Utils/Config";

export async function fetchFirstPhoto(fileName: string, defaultImg: string): Promise<string> {
  try {
    const response = await axios.get(config.getPhotoByImgNameUrl + fileName, {
      responseType: "blob", 
    });

    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = () => {
        reject(new Error("Error reading the image file."));
      };
      reader.readAsDataURL(response.data);
    });
  } catch (error) {
    console.error("Error fetching the image:", error);
    return defaultImg; 
  }
}
