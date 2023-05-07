import AsyncStorage from "@react-native-async-storage/async-storage";

import { USER_STORAGE } from '@storage/StorageConfig';

import { UserDTO } from '@dtos/UserDTO';

export async function StorageUserSave(user:UserDTO){
    await AsyncStorage.setItem(USER_STORAGE, JSON.stringify(user));
}

export async function StorageUserGet(){
    const storage = await AsyncStorage.getItem(USER_STORAGE);

    const user: UserDTO = storage ? JSON.parse(storage) : {};

    return user;

}

export async function StorageUserRemove(){
    await AsyncStorage.removeItem(USER_STORAGE);
}