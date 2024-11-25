import { create } from 'zustand'
import StoryModel from '../Models/StoryModel'
import axios from 'axios';
import config from '../Utils/Config';

type State = {
    stories?: StoryModel[];
}

type Actions = {
    getStories: () => void;
}

const useStories = create<State & Actions>((set, get) => ({
    getStories: async () => {
        if(get().stories?.length) return;
    
        const response: StoryModel[] = (await axios.get(config.getTopStories))?.data || [];
        set({ stories: response });
    }
    
}))

export default useStories;
