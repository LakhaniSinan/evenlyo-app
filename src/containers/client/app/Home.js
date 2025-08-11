import React from 'react'
import { FlatList, Image, ScrollView, Text, View } from 'react-native'
import GradientButton from '../../../components/button'
import { ICONS, IMAGES } from '../../../assets'
import { useDispatch } from 'react-redux'
import { setUserData } from '../../../redux/slice/auth'
import AppHeader from '../../../components/appHeader'
import { SafeAreaView } from 'react-native-safe-area-context'
import Categories from '../../../components/categories'
import SubCategories from '../../../components/subCategories'

const data = ["", ""]

const Home = () => {
    const dispatch = useDispatch()
    return (
        <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1 }}>
            <ScrollView style={{}}>
                <AppHeader />
                <View style={{
                    marginTop: 10
                }}>
                    <Categories />
                </View>
                <View style={{
                    marginTop: 10
                }}>
                    <SubCategories />
                </View>
                <FlatList
                    data={data}
                    horizontal
                    keyExtractor={(item, index) => index.toString()}
                    contentContainerStyle={{ paddingHorizontal: 10 }}
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item, index }) => {
                        return (
                            <View style={{ marginTop: 10 }}>
                                <View style={{ position: 'relative' }}>
                                    <Image
                                        resizeMode='contain'
                                        style={{
                                            width: 318,
                                            height: 214,
                                            marginHorizontal: 5,
                                        }}
                                        source={IMAGES.backgroundImage}
                                    />
                                    <Text
                                        style={{
                                            position: 'absolute',
                                            bottom: 20, // adjust where you want it
                                            left: 20,
                                            color: 'white', // make sure it's visible
                                            zIndex: 10,
                                        }}
                                    >
                                        TEXT GOES HERE
                                    </Text>
                                </View>
                            </View>
                        );
                    }}
                />


            </ScrollView>
        </SafeAreaView >

    )
}

export default Home
