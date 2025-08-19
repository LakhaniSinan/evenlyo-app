import React from 'react'
import { Image, SafeAreaView, ScrollView, Text, Touchable, TouchableOpacity, View } from 'react-native'
import AppHeader from '../../../components/appHeader'
import { ICONS, IMAGES } from '../../../assets'
import { COLORS, fontFamly } from '../../../constants'
import CarouselComponent from '../../../components/carousel'
import EventAndPriceDetails from '../../../components/eventDetailAndPrice'
import { width } from 'react-native-dimension';
import GradientText from '../../../components/gradiantText'

const data = [1, 2, 3, 4, 5];

const renderCards = (type) => {
    return (
        <View style={{
            borderRadius: 10,
            height: 79
            , width: 140,
            backgroundColor: "white",
            elevation: 10,
            paddingLeft: 10,

        }}>
            <GradientText
                customStyles={{
                    textAlign: "left",
                }}
                text={type}
            />
            <Text style={{
                fontSize: 16,
                fontFamily: fontFamly.PlusJakartaSansBold
            }}>12 May, 2025</Text>
            <Text style={{ color: COLORS.textLight, fontSize: 12 }}>12: 00 pm</Text>
        </View>
    )
}

const BookingDetails = () => {
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
            <ScrollView>
                <AppHeader
                    leftIcon={ICONS.leftArrowIcon}
                    headingText={'Booking'}
                    rightIcon={ICONS.chatIcon}
                    onRightIconPress={() => navigation.navigate('Messages')}
                    onLeftIconPress={() => navigation.goBack()}
                />
                <CarouselComponent data={data} />
                <View style={{ marginHorizontal: 10 }}>
                    <EventAndPriceDetails />
                </View>
                <View style={{
                    marginTop: 20,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center"
                }}>
                    <View style={{
                        marginHorizontal: 20,
                    }}>
                        {renderCards("Check In")}
                    </View>
                    <View style={{
                        backgroundColor: "white",
                        width: 32,
                        height: 32,
                        elevation: 1,
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: 200
                        // flex: 1,
                        // justifyContent: "center"
                    }}>
                        <Image
                            style={{ height: 7, width: 12 }}
                            source={ICONS.arrowIcon} />
                    </View>
                    <View
                        style={{
                            marginHorizontal: 20
                        }}
                    // style={{
                    //     flex: 1,
                    //     justifyContent: "flex-end",
                    //     alignItems: "flex-end",
                    //     marginRight: 20
                    // }}
                    >
                        {renderCards("Check Out")}
                    </View>
                </View>
                <View style={{
                    backgroundColor: COLORS.backgroundLight,
                    marginHorizontal: 20,
                    marginTop: 10,
                    padding: 10,
                    borderRadius: 10,
                    flexDirection: "row"
                }}>
                    <Image
                        style={{ width: 55, height: 55 }}
                        source={IMAGES.profilePhoto}
                    />
                    <View style={{ marginLeft: 10, justifyContent: "center" }}>
                        <Text
                            style={{
                                fontSize: 15,
                                fontFamily: fontFamly.PlusJakartaSansSemiBold
                            }}
                        >Asima Khan</Text>
                        <Text style={{
                            fontSize: 10,
                            fontFamily: fontFamly.PlusJakartaSansSemiRegular
                        }}>Coach Organization Name</Text>
                    </View>
                    <TouchableOpacity style={{ flex: 1, justifyContent: "center", alignItems: "flex-end" }}>
                        <Image
                            style={{ width: 32, height: 32 }}
                            source={ICONS.chatIcon} />
                    </TouchableOpacity>
                </View>
                <View
                    style={{
                        paddingVertical: width(3),
                        marginHorizontal: 20
                    }}>
                    <Text
                        style={{
                            fontFamily: fontFamly.PlusJakartaSansBold,
                            fontSize: 12,
                        }}>
                        Description:
                    </Text>
                    <Text
                        numberOfLines={4}
                        style={{
                            fontFamily: fontFamly.PlusJakartaSansMedium,
                            fontSize: 10,
                            color: COLORS.textLight,
                        }}>
                        With over 7 years of event experience, DJ RayBeatz is known for
                        high-energy dance floors, seamless transitions, and crowd-pleasing
                        remixes. From desi weddings to corporate raves, he brings the perfect
                        vibe for every crow With over 7...
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default BookingDetails
