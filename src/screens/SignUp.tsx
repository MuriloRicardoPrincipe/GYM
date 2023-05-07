import { VStack, Image, Center, Text, Heading, ScrollView, useToast } from 'native-base'
import { useNavigation } from '@react-navigation/native'
import { useForm, Controller } from 'react-hook-form'
import {yupResolver} from '@hookform/resolvers/yup'
import * as yup from 'yup'

import LogoSvg from '@assets/logo.svg'
import BackgroudImg from '@assets/background.png'

import { Input } from '@components/Input'
import { Button } from '@components/Button'
import { api } from '@services/api'
import { AppError } from '@utils/AppError'
import { useState } from 'react'
import { useAuth } from '@hooks/userAuth'

type DataFormProps ={
    name:string;
    email:string;
    password:string;
    password_confirm:string;
}

const SignUpSchema = yup.object({
    name: yup.string().required('informe o nome'),
    email: yup.string().required('informe o e-mail').email('e-mail invalido'),
    password: yup.string().required('informe a senha').min(6,'informe a senha.'),
    password_confirm:yup.string().required('confirme a senha').oneOf([yup.ref('password')],'A confirmação da senha não confere.')
})

export function SignUp(){

    const[isLoading, setIsLoading] = useState(false);

    const { signIn } = useAuth();

    const toast = useToast();

    const navigation = useNavigation();

    function handleGoBack(){
        navigation.goBack();
    }

    const{control, handleSubmit, formState:{errors}} = useForm<DataFormProps>({
        resolver: yupResolver(SignUpSchema)
    });

    async function handleSingUp({name, email, password}:DataFormProps){
        try {
            setIsLoading(true);
            await api.post('/users', {name, email, password} );
            await signIn(email, password);
        } catch (error) {
            setIsLoading(false);
            const isAppError = error instanceof AppError;
            const title = isAppError ? error.message : 'Não foi possivel criar a conta tente novamente mais tarde';
            toast.show({
                title,
                placement:'top',
                bgColor:'red.500'
            });
        }finally{
            setIsLoading(false);
        }



       /* await fetch('http://172.28.224.1:3333/users',{
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body:JSON.stringify({name, email, password})
        })*/
    }

    return(
        <ScrollView contentContainerStyle={{flexGrow:1}}>
            <VStack flex={1} px={10} pb={16}>
                <Image
                    source={BackgroudImg}
                    defaultSource={BackgroudImg}
                    alt='Pessoas treinando'
                    resizeMode='contain'
                    position='absolute'
                />
                <Center my={24}>
                    <LogoSvg/>
                    <Text color={'gray.100'} fontSize='sm'>
                        Treine sua mente e seu corpo
                    </Text>
                </Center>
                <Center>
                    <Heading color={'gray.100'} mb={6} fontSize='xl' fontFamily='heading'>
                        Criar sua conta
                    </Heading>

                    <Controller
                        control={control}
                        name='name'
                        render={({field:{onChange, value}}) =>(
                            <Input 
                                placeholder='Nome'
                                onChangeText={onChange}
                                value={value}
                                errorMessage={errors.name?.message}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name='email'
                        render={({field:{onChange, value}}) =>(
                        <Input 
                            placeholder='E-mail'
                            keyboardType='email-address'
                            autoCapitalize='none'
                            onChangeText={onChange}
                            value={value}
                            errorMessage={errors.email?.message}
                        />
                        )}
                    />

                    <Controller
                        control={control}
                        name='password'
                        render={({field:{onChange, value}})=>(
                        <Input 
                            placeholder='Senha'
                            secureTextEntry
                            onChangeText={onChange}
                            value={value}
                            errorMessage={errors.password?.message}
                        />
                        )}
                    />

                    <Controller
                        control={control}
                        name='password_confirm'
                        render={({field:{onChange, value}})=>(
                            <Input 
                                placeholder='Confirme sua senha'
                                secureTextEntry
                                onChangeText={onChange}
                                value={value}
                                onSubmitEditing={handleSubmit(handleSingUp)}
                                returnKeyType='send'
                                errorMessage={errors.password_confirm?.message}
                            />
                        )}
                    />

                    <Button
                        title='Acessar'
                        onPress={handleSubmit(handleSingUp)}
                        isLoading={isLoading}
                    />
                </Center>

                <Button
                    title='Voltar para o login'
                    variant={'outline'}
                    mt={16}
                    onPress={handleGoBack}
                />
            </VStack>
        </ScrollView>
    )
}