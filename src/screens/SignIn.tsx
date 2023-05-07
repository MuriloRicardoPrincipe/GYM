import {useNavigation} from '@react-navigation/native'
import { VStack, Image, Center, Text, Heading, ScrollView, useToast } from 'native-base'

import LogoSvg from '@assets/logo.svg'
import BackgroudImg from '@assets/background.png'
import { Input } from '@components/Input'
import { Button } from '@components/Button'
import { AuthNavigationRoutesProps } from '@routes/auth.routes'
import { Controller, useForm } from 'react-hook-form'
import { useAuth } from '@hooks/userAuth'
import { AppError } from '@utils/AppError'
import { useState } from 'react'

type FormData = {
    email: string;
    password: string;
  }

export function SignIn(){

    const { signIn } = useAuth();
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const navigation = useNavigation<AuthNavigationRoutesProps>();

    const { control, handleSubmit, formState: { errors } } = useForm<FormData>()

    async function handleSignIn({ email, password }: FormData){
      try {
        setIsLoading(true);
        await  signIn(email, password);
        
    } catch (error) {
        const isAppError = error instanceof AppError;
        const title = isAppError ? error.message : 'Não foi possivel entrar na conta tente novamente mais tarde';

        setIsLoading(false);
        toast.show({
            title,
            placement:'top',
            bgColor:'red.500'
        });

    }
  }

    function handleNewAccount(){
        navigation.navigate('SignUp');
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
                        acesse sua conta
                    </Heading>
                    <Controller 
            control={control}
            name="email"
            rules={{ required: 'Informe o e-mail' }}
            render={({ field: { onChange } }) => (
              <Input 
                placeholder="E-mail" 
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={onChange}
                errorMessage={errors.email?.message}
              />
            )}
          />

          <Controller 
            control={control}
            name="password"
            rules={{ required: 'Informe a senha' }}
            render={({ field: { onChange } }) => (
              <Input 
                placeholder="Senha" 
                secureTextEntry
                onChangeText={onChange}
                errorMessage={errors.password?.message}
              />
            )}
          />

          <Button 
            title="Acessar" 
            onPress={handleSubmit(handleSignIn)} 
            isLoading={isLoading}
          />
                </Center>
                <Center mt={24}>
                    <Text 
                        color='gray.300'
                        fontSize='sm'
                        fontFamily='body'
                        mb={3}
                    >
                        Ainda não tem acesso?
                    </Text>
                    <Button
                        title='Criar conta'
                        variant={'outline'}
                        onPress={handleNewAccount}
                    />
                </Center>
            </VStack>
        </ScrollView>
    )
}