import { Image, IImageProps } from "native-base";


type Prop = IImageProps &{
    size:number
}

export function UserPhoto({size, ...rest}:Prop){
    return(
        <Image
            w={size}
            h={size}
            rounded='full'
            borderWidth={2}
            borderColor='gray.400'
            {...rest}
        />
    )
}