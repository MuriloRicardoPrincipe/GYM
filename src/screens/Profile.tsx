import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from 'expo-file-system'; 
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';

import { TouchableOpacity } from "react-native";
import photoDefault from '@assets/userPhotoDefault.png'

import { Center, Heading, ScrollView, Skeleton, Text, VStack, useToast } from "native-base";

import { Button } from "@components/Button";
import { Input } from "@components/Input";
import { ScreenHeader } from "@components/ScreenHeader";
import { UserPhoto } from "@components/UserPhoto";
import { useAuth } from "@hooks/userAuth";
import * as yup from 'yup';
import { api } from "@services/api";
import { AppError } from "@utils/AppError";

type FormDataProps = { 
    name: string;
    email: string;
    password: string;
    old_password: string;
    confirm_password: string;
  }
  const profileSchema = yup.object({
    name: yup
        .string()
        .required('Informe o nome'),
    password:yup
        .string()
        .min(6, 'A senha deve ter pelo menos 6 dígitos.')
        .nullable()
        .transform((value) => !!value ? value : null),
        confirm_password: yup
        .string()
        .nullable()
        .transform((value) => !!value ? value : null)
        .oneOf([yup.ref('password'), null], 'A confirmação de senha não confere.')
        .when('password', {
          is: (Field: any) => Field, 
          then: (schema) =>
            schema
                .nullable()
                .required('Informe a confirmação da senha.')
                .transform((value) => !!value ? value : null),
        }),
        /*correção no campo de validação antes era igual o campo abaixo
        then: yup.string().nullable().required('Informe a confirmação da senha.')
        */
  })
export function Profile(){

    const [isUpdating, setIsUpdating] = useState(false)

    const [photoIsLoading, setPhotoIsLoading] = useState(false);

    const toast = useToast();
    const { user, updateUserProfile } = useAuth();
    const {control, handleSubmit, formState:{errors}} = useForm<FormDataProps>({
        defaultValues:{
            name: user.name,
            email:user.email
        },
        resolver: yupResolver(profileSchema)
    });
    const PHOTO_SIZE = 33;

    async function handleUserPhotoSelected() {
        try {
            setPhotoIsLoading(true);
            const PhotoSelected = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 1,
                aspect: [4,4],
                allowsEditing: true
            });

    
            if (PhotoSelected.canceled) return;

            //if (PhotoSelected.assets[0].uri) 
            //setUserPhoto(PhotoSelected.assets[0].uri);
            const fileExtension = PhotoSelected.assets[0].uri.split('.').pop();

            const photoFile = {
              name: `${user.name}.${fileExtension}`.toLowerCase(),
              uri: PhotoSelected.assets[0].uri,
              type: `${PhotoSelected.assets[0].type}/${fileExtension}`
            } as any;
            const userPhotoUploadForm = new FormData();

            userPhotoUploadForm.append('avatar', photoFile);
    
            const avatarUpdtedResponse = await api.patch('/users/avatar', userPhotoUploadForm, {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            });

            const userUpdated = user;

            userUpdated.avatar = avatarUpdtedResponse.data.avatar;
    
            await updateUserProfile(userUpdated);
    
            toast.show({
              title: 'Foto atualizada!',
              placement: 'top',
              bgColor: 'green.500'
            })
        } catch (error) {
            console.log(error)
        } finally{
            setPhotoIsLoading(false);
        }
    }
    
    async function handleProfileUpdate(data: FormDataProps) {
        try {
            setIsUpdating(true);
            const userUpdated = user;
            userUpdated.name = data.name;

            await api.put('/user', data);
            await updateUserProfile(userUpdated);

            toast.show({
                title: 'Perfil atualizado com sucesso!',
                placement: 'top',
                bgColor: 'green.500'
              });
            } catch (error) {
              const isAppError = error instanceof AppError;
              const title = isAppError ? error.message : 'Não foi possível atualizar os dados. Tente novamente mais tarde.';
              toast.show({
                title,
                placement: 'top',
                bgColor: 'red.500'
              })
            } finally {
              setIsUpdating(false);
            }
          }

    return(
        <VStack flex={1}>
            <ScreenHeader title='Perfil'/>
            <ScrollView contentContainerStyle={{paddingBottom:36}}>
                <Center mt={6} px={10}>
                    {photoIsLoading ?
                        <Skeleton
                            w={PHOTO_SIZE}
                            h={PHOTO_SIZE}
                            rounded='full'
                            startColor='gray.500'
                            endColor='gray.400'
                        />
                        :
                        <UserPhoto
                            size={PHOTO_SIZE}
                            source={
                                user.avatar  
                                ? { uri: `${api.defaults.baseURL}/avatar/${user.avatar}` } 
                                : photoDefault
                              }
                            alt='Imagem do usuário'
                        />
                    }
                    <TouchableOpacity 
                        onPress={handleUserPhotoSelected}
                    >
                        <Text color='green.500' fontWeight='bold' fontSize='md' mt={2} mb={8}>
                            alterar foto
                        </Text>
                    </TouchableOpacity>

                    <Controller
                        control={control}
                        name="name"
                        render={({field:{onChange, value}})=>
                            <Input
                                bg='gray.600'
                                placeholder="Nome"
                                onChangeText={onChange}
                                errorMessage={errors.name?.message}
                                value={value}
                            />
                        }
                    />
                    <Controller
                        control={control}
                        name="email"
                        render={({field:{onChange, value}})=>
                            <Input
                                bg='gray.600'
                                placeholder="E-mail"
                                onChangeText={onChange}                
                                isDisabled
                                errorMessage={errors.email?.message}
                                value={value}
                            />
                        }
                    />

                </Center>
                <VStack px={10} mt={12} mb={9}>
                    <Heading color='gray.200' fontSize='md' mb={2} mt={12} fontFamily='heading'>
                        Alterar senha
                    </Heading>
                    <Controller 
                        control={control}
                        name="old_password"
                        render={({ field: { onChange } }) => (
                        <Input 
                            bg="gray.600"
                            placeholder="Senha antiga"
                            secureTextEntry
                            onChangeText={onChange}
                        />
                        )}
                    />
                    <Controller 
                        control={control}
                        name="password"
                        render={({ field: { onChange } }) => (
                        <Input 
                            bg="gray.600"
                            placeholder="Nova senha"
                            secureTextEntry
                            onChangeText={onChange}
                            errorMessage={errors.password?.message}
                        />
                        )}
                    />
                    <Controller 
                        control={control}
                        name="confirm_password"
                        render={({ field: { onChange } }) => (
                        <Input 
                            bg="gray.600"
                            placeholder="Confirme a nova senha"
                            secureTextEntry
                            onChangeText={onChange}
                            errorMessage={errors.confirm_password?.message}
                        />
                        )}
                    />
                    <Button
                        title="Atualizar"
                        mt={4}            
                        onPress={handleSubmit(handleProfileUpdate)}
                    />
                </VStack>
            </ScrollView>
        </VStack>
    )
}