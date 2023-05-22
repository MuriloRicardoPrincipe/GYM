import { ReactNode, createContext, useEffect, useState } from "react";
import { StorageUserSave, StorageUserGet, StorageUserRemove } from "@storage/StorageUser";
import { storageAuthTokenGet, storageAuthTokenRemove, storageAuthTokenSave } from "@storage/StorageAuthToken";

import { UserDTO } from "@dtos/UserDTO";
import { api } from "@services/api";

export type AuthContextDataProps = {
    user: UserDTO;
    isLoadingUserStorage:boolean;
    signOut: () => Promise<void>;
    signIn:(email:string, password:string) => void;  
    updateUserProfile: (userUpdated: UserDTO) => Promise<void>;
}

type AuthContextProviderProps ={
    children:ReactNode;
}

export const AuthContext = createContext<AuthContextDataProps>({} as AuthContextDataProps);

export function AuthContextProvider({children}:AuthContextProviderProps){

    const [user, setUser] = useState<UserDTO>({} as UserDTO );
    const [isLoadingUserStorage, setIsloadingUserStorage] = useState(true);

    async function UserAndTokenUpdate(userDATA:UserDTO, token:string){
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(userDATA);

    }

    async function storageUserAndTokenSave(userDATA:UserDTO, token:string, refresh_token:string){
        try {
            setIsloadingUserStorage(true);
            await StorageUserSave(userDATA);
            await storageAuthTokenSave({token, refresh_token});
            
        } catch (error) {
            throw error;
        }finally{
            setIsloadingUserStorage(false);

        }
    }

    async function signIn(email:string, password:string){
        try{
            const  {data} = await api.post('/sessions', {email, password})
            
            if(data.user && data.token && data.refresh_token){
                await storageUserAndTokenSave(data.user, data.token, data.refresh_token);
                UserAndTokenUpdate(data.user, data.token)
            }
        }catch(error){
            throw error;
        }finally{
            
            setIsloadingUserStorage(false);
        }
      }

    async function signOut() {
        try {
            setIsloadingUserStorage(true);
            setUser({} as UserDTO);
            await StorageUserRemove();
            await storageAuthTokenRemove();
        } catch (error) {
            throw error;
        }finally{
            setIsloadingUserStorage(false);
        }
    }

    async function updateUserProfile(userUpdated: UserDTO) {
        try {
          setUser(userUpdated);
          await StorageUserSave(userUpdated);
        } catch (error) {
          throw error;
        }
      }

    async function loadUserData() {

        try {
            setIsloadingUserStorage(true);

            const userLogged = await StorageUserGet();
            const {token} = await storageAuthTokenGet()

            if(token && userLogged){
                await UserAndTokenUpdate(userLogged, token);
            }
        } catch (error) {
            throw error;
        } finally{
            setIsloadingUserStorage(false);
        }
    }

    useEffect(() =>{
        loadUserData();
    },[])
    
    useEffect(() => {
        const subscribe = api.registerInterceptTokenManager(signOut);
    
        return () => {
          subscribe();
        }
      },[])
    return(
        <AuthContext.Provider 
            value={{ 
                user, 
                signIn,
                signOut,
                updateUserProfile,
                isLoadingUserStorage
            }}>
            {children}
          </AuthContext.Provider>
    )
}