import { useCallback, useEffect, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { appNavigatorRoutesProps } from "@routes/app.routes";

import { api } from "@services/api";
import { AppError } from "@utils/AppError";
import { ExerciseDTO } from "@dtos/ExerciseDTO";

import { VStack, Text, HStack, FlatList, Heading, useToast } from "native-base";
import { ExerciseCard } from "@components/ExerciseCard";
import { HomeHeader } from "@components/HomeHeader";
import { Group } from "@components/Group";
import { Loading } from "@components/Loading";
import { string } from "yup";

export function Home(){

    const [group, setGroup] = useState<string[]>([]);
    const [exercise, setExercise] = useState<ExerciseDTO[]>([]);
    const [groupSelected, setGroupSelected] = useState('costa');
    const [isLoading, setIsloading] = useState(true);
    const toast = useToast();

    const navigation = useNavigation<appNavigatorRoutesProps>();

    function handleOpenExerciseDetaius( exerciseId: string){
        navigation.navigate('exercise', { exerciseId })
    }

    async function fetchGroups() {
        try {
            const response = await api.get('/groups')
            setGroup(response.data)
        } catch (error) {
            const isAppError =  error instanceof AppError;
            const title = isAppError ? error.message : 'não foi possivel carregar historico!';
            toast.show({
                title,
                placement:'top',
                bgColor:'red.500'
            })
        }
        
    }

    async function fetchExerciseByGroup() {
        try {
            setIsloading(true);
            const response = await api.get(`/exercises/bygroup/${groupSelected}`)
            setExercise(response.data)
        } catch (error) {
            const isAppError =  error instanceof AppError;
            const title = isAppError ? error.message : 'não foi possivel carregar os grupos musculares!';
            toast.show({
                title,
                placement:'top',
                bgColor:'red.500'
            })
        }finally{
            setIsloading(false);
        }
    }

    useEffect(() => {
        fetchGroups() 
    },[])

    useFocusEffect(useCallback(() =>{
        fetchExerciseByGroup()
    }, [groupSelected]));

    return(
        <VStack flex={1}>
            <HomeHeader/>
            <FlatList
                data={group}
                keyExtractor={item => item}
                renderItem={({ item }) =>(
                    <Group 
                        name={item}
                        isActive={groupSelected.toLocaleUpperCase() === item.toLocaleUpperCase()}
                        onPress={() => setGroupSelected(item) }
                    />
             )}

             horizontal
             showsHorizontalScrollIndicator={false}
             _contentContainerStyle={{px:8}}
             my={10}
             maxH={10}
             minH={10}
            />
            { isLoading ? <Loading/> :
                <VStack flex={1} px={8}>
                        <HStack justifyContent='space-between' mb={5}>
                            <Heading color='gray.200' fontSize='md' fontFamily='heading'>
                                Exercícios
                            </Heading>
                            <Text color='gray.200' fontSize='sm'>
                                {exercise.length}
                            </Text>
                        </HStack>
                        
                        <FlatList
                            data={exercise}
                            keyExtractor={ item => item.id}
                            renderItem={( {item} ) =>(
                                <ExerciseCard
                                    onPress={() => handleOpenExerciseDetaius(item.id)}
                                    data={item}
                                />
                            )}
                            showsVerticalScrollIndicator={false}
                            _contentContainerStyle={{paddingBottom:20}}
                        />
                </VStack>
            }
        </VStack>
    )
}