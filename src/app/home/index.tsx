import { useState, useEffect, useId, useRef } from 'react';
import { Alert, View, SectionList, Text } from 'react-native';

import { Feather } from '@expo/vector-icons';
import * as Contacts from 'expo-contacts';
import BottomSheet from '@gorhom/bottom-sheet/';

import { styles } from './styles';
import { theme } from '@/theme';

import { Input } from '@/app/components/input';
import { Contact, ContactProps } from '@/app/components/contact';

import { Avatar } from '@/app/components/avatar';
import { Button } from '../components/button';

import { TouchableOpacity } from 'react-native-gesture-handler';


type SectionListDataProps = {
    title: string
    data: ContactProps[]
}



export function Home() {
    const [contacts, setContacts] = useState<SectionListDataProps[]>([]);
    const [name, setName] = useState("");
    const [contact, setContact] = useState<Contacts.Contact>()

    const bottomSheetRef = useRef<BottomSheet>(null);

    const handleBottomSheetOpen = () => bottomSheetRef.current?.expand();
    const handleBottomSheetClose = () => bottomSheetRef.current?.snapToIndex(0);

    async function handleOpenDetails (id: string) {
        const response = await Contacts.getContactByIdAsync(id);
        setContact(response)
        handleBottomSheetOpen();
    }

    useEffect(() => {
        fetchContacts()
    },[name])


    async function fetchContacts() {
    
        try {
            const { status } = await Contacts.requestPermissionsAsync();
            if (status === Contacts.PermissionStatus.GRANTED){
                const { data } = await Contacts.getContactsAsync({
                    name,
                    sort: "firstName",
                });
                const list = data.map((contact) => ({
                    id: contact.id ?? useId(),
                    name: contact.name,
                    image: contact.image,
                })).reduce<SectionListDataProps[]>((acc: any, item) => {
                    const firstLetter = item.name[0].toUpperCase();
                    const existingEntry = acc.find((entry: SectionListDataProps) =>
                    (entry.title === firstLetter))
    
                    if(existingEntry){
                        existingEntry.data.push(item)
                    }
                    else {
                        acc.push({title: firstLetter, data: [item]})
                    }
    
                    return acc
    
                }, [])
                setContacts(list)
                setContact(data[0])
            }
        }
        catch(error) {
            console.log(error);
            Alert.alert("Contatos", "Não foi possível carregar os contatos...");
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Input style={styles.input}>
                <Feather name="search" size={16} color={theme.colors.gray_300}></Feather>
                    <Input.Field placeholder='Pesquisar pelo nome...' onChangeText={setName} value={name}/>
                <Feather name="x" size={16} color={theme.colors.gray_300} onPress={() => setName("")}></Feather>
                </Input>
            </View>
            <SectionList 
                sections={contacts}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => {
                            handleOpenDetails(item.id)
                        }}>
                    <Contact contact ={item}/>
                    </TouchableOpacity>
                )}
                renderSectionHeader={({ section }) => 
                    (<Text style={styles.section}>{section.title}</Text>)}
                contentContainerStyle = {styles.contentList}
                showsVerticalScrollIndicator={false}
                SectionSeparatorComponent={() => <View style={styles.separator}/>}
            />
            {
                contact &&
            <BottomSheet 
            ref={bottomSheetRef} 
            snapPoints={[1, 284]}
            handleComponent={() => null}
            backgroundStyle={styles.bottomSheet}
            >
                <Avatar name={contact.name} image={contact.image} variant='large' containerStyle={styles.image}/>
                <View style={styles.bottomSheetContent}>
                    <Text style={styles.contactName}>{contact.name}</Text>
                    {
                        contact.phoneNumbers && (
                            <View style={styles.phone}>
                                <Feather name="phone" size={18} color={theme.colors.gray_400}></Feather>
                                <Text style={styles.phoneNumber}>{contact.phoneNumbers[0].number}</Text>
                            </View>
                        )
                    }
                    <Button title="Fechar" onPress={handleBottomSheetClose}></Button>
                    </View>
            </BottomSheet>
            }
        </View>
    )
}