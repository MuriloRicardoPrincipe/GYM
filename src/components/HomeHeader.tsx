import { Heading,VStack, HStack, Text, Icon } from "native-base";
import {MaterialIcons} from '@expo/vector-icons'
import { UserPhoto } from "./UserPhoto";
import { useAuth } from "@hooks/userAuth";
import photoDefault from '@assets/userPhotoDefault.png'
import { TouchableOpacity } from "react-native";


export function HomeHeader(){

    const { user, signOut} = useAuth();
    return(
        <HStack bg={'gray.600'} pt={16} pb={5} px={8} alignItems='center' >
            <UserPhoto
                size={16}
                source={user.avatar? {uri: user.avatar}: photoDefault}
                alt='Imagem do usuário'
                mr={4}
            />
            <VStack flex={1}>
                <Text color={'gray.100'} fontSize={'md'}>
                    Olá,
                </Text>
                <Heading color={'gray.100'} fontSize={'md'} fontFamily='heading' >
                    {user.name}
                </Heading>
            </VStack>
            <TouchableOpacity onPress={signOut}>
                <Icon
                    as={MaterialIcons}
                    name='logout'
                    color={'gray.200'}
                    size={7}
                />
            </TouchableOpacity>
        </HStack>
    )
}