import { useNavigation, useRoute } from "@react-navigation/native";
import { appNavigatorRoutesProps } from "@routes/app.routes";
import { TouchableOpacity } from "react-native";
import { Box, Heading, HStack, Icon, Image, Text, VStack, ScrollView, useToast} from "native-base";
import { Feather } from '@expo/vector-icons';

import BodySVG from '@assets/body.svg'
import SeriesSVG from '@assets/series.svg'
import RepetitionsSVG from '@assets/repetitions.svg'
import { Button } from "@components/Button";
import { AppError } from "@utils/AppError";
import { api } from "@services/api";
import { useEffect, useState } from "react";
import { ExerciseDTO } from "@dtos/ExerciseDTO";
import { Loading } from "@components/Loading";

type RouteParamsProp = {
    exerciseId: string; 
}

export function Exercise(){

    const [sendingRegister, setSendingRegister] = useState(false);
    const [isLoading, setIsloading] = useState(true);
    const [exercise, setExercise] = useState<ExerciseDTO>({} as ExerciseDTO);
    const routes = useRoute();
    const toast = useToast();

    const navigation = useNavigation<appNavigatorRoutesProps>();


    const { exerciseId } = routes.params as RouteParamsProp;

    function handleGoBack(){
        navigation.goBack();
    }

    async function fetchExerciseDetails() {
        try {
            setIsloading(true)
            const response = await api.get(`exercises/${exerciseId}`);
            setExercise(response.data)

        } catch (error) {
            const isAppError =  error instanceof AppError;
            const title = isAppError ? error.message : 'não foi possivel carregar os detalhes do exercícios!';
            toast.show({
                title,
                placement:'top',
                bgColor:'red.500'
            })
        }finally{
            setIsloading(false)
        }
    } 

    async function handleExerciseHistoryRegister() {
        try {
            setSendingRegister(true);
            
            await api.post('/history', { exercise_id: exerciseId });
            
            toast.show({
                title: 'Continue treinando isso e só o começo, ou vai desistir!',
                placement:'top',
                bgColor:'red.500'
            })

            navigation.navigate('history')

        } catch (error) {
            const isAppError =  error instanceof AppError;
            const title = isAppError ? error.message : 'não foi possivel carregar os detalhes do exercícios!';
            toast.show({
                title,
                placement:'top',
                bgColor:'red.500'
            })
        }finally{
            setSendingRegister(false);
        }
    }

    useEffect(() => {
        fetchExerciseDetails()
    }, [exerciseId])

    return(
        <VStack flex={1}>
            <ScrollView>
                <VStack px={8} bg='gray.600' pt={12}>
                    <TouchableOpacity onPress={handleGoBack}>
                        <Icon as={Feather} name='arrow-left' color='green.500' size={6} />
                    </TouchableOpacity>
                    <HStack justifyContent='space-between' mt={4} mb={8} alignItems='center' >
                        <Heading color='gray.100' fontSize='lg' flexShrink={1} fontFamily='heading'>
                            {exercise.name}
                        </Heading>
                        <HStack alignItems='center'>
                            <BodySVG/>
                            <Text color='gray.200' ml={1} textTransform='capitalize'>
                                {exercise.group}
                            </Text>
                        </HStack>
                    </HStack>
                </VStack>
                {isLoading? 
                    <Loading/>:
                    <VStack p={8}>
                        <Box rounded='lg'  mb={3} overflow='hidden'>
                            <Image
                                w='full'
                                h={80}
                                source={ { uri:`${api.defaults.baseURL}/exercise/demo/${exercise.demo}` } }
                                alt='Imagem do exercicio'
                                mb={3}
                                rounded='lg'
                                resizeMode='cover'
                            />
                        </Box>
                        <Box bg='gray.600' rounded='md' pb={4} px={4}>
                            <HStack alignItems='center' justifyContent='space-around' mb={6} mt={5}>
                                <HStack>
                                    <SeriesSVG/>
                                    <Text color='gray.200' ml={2}>
                                        {exercise.series} séries
                                    </Text>
                                </HStack>
                                <HStack>
                                    <RepetitionsSVG/>
                                    <Text color='gray.200' ml={2}>
                                        {exercise.repetitions} repetições
                                    </Text>
                                </HStack>
                            </HStack>
                            <Button
                                title='Marcar como realizado'
                                isLoading={sendingRegister}
                                onPress={handleExerciseHistoryRegister}
                            />
                        </Box>
                    </VStack>
                }
            </ScrollView>
        </VStack>
    )
}