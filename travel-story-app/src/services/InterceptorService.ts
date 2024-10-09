import axios from "axios";

class InterceptorsService {

    public createInterceptors(): void {

        axios.interceptors.request.use(request => {
            const token = localStorage.getItem("token");

            if (token && request.headers) {
                request.headers.set('authorization', `Bearer ${token}`);
            }

            return request;
        });

    }

}

const interceptorsService = new InterceptorsService();

export default interceptorsService;
