import { useCallback, useState } from "react";

import { api } from "@services/api";

import { HistoryByDayDTO } from "@dtos/HystoryByDayDTO";

import { Text, VStack, SectionList, Heading, useToast } from "native-base";
import { HistoryCard } from "@components/HistoryCard";
import { ScreenHeader } from "@components/ScreenHeader";
import { useFocusEffect } from "@react-navigation/native";
import { AppError } from "@utils/AppError";

export function History(){

    const [isLoading, setIsloading] = useState(true);
    const toast = useToast();
    const [exercises, setExercises] = useState<HistoryByDayDTO[]>([]);

    async function fetchHistory() {
        try {
            setIsloading(true);
            const response = await api.get('/history');
            setExercises(response.data);
        } catch (error) {
            const isAppError =  error instanceof AppError;
            const title = isAppError ? error.message : 'não foi possivel carregar os grupos musculares!';
            toast.show({
                title,
                placement:'top',
                bgColor:'red.500'
            })
        }finally{
            setIsloading(true);
        }
    }
    useFocusEffect(useCallback(() =>{
        fetchHistory()
    }, []));

    return(
        <VStack flex={1}>
            <ScreenHeader title='Histórico de Exercícios'/>
            <SectionList
                sections={exercises}
                keyExtractor={ item => item.id}
                renderItem={({item}) =>(
                    <HistoryCard data={item}/>
                )}

                renderSectionHeader={({section}) =>(
                    <Heading color='gray.200' mt={16} mb={3} fontSize='md'>
                        {section.title}
                    </Heading>
                )}
                px={8}
                contentContainerStyle={exercises.length === 0 && {flex:1, justifyContent:'center' }}
                ListEmptyComponent={()=>(
                    <Text color='gray.200' textAlign='center'>
                        Não há exercicios registrado hoje.{'\n'}
                        Vamos treinar!
                    </Text>
                )}
            />
        </VStack>
    )
}