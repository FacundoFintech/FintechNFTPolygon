import { useContext } from "react";
import { context as AuthContext } from "../providers/AuthProvider";

const useAuth = () => {
    const auth = useContext(AuthContext);
    return auth;
   
}

export default useAuth