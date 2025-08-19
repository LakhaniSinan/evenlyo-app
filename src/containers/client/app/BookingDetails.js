import React from 'react'
import { SafeAreaView, Text, View } from 'react-native'
import AppHeader from '../../../components/appHeader'
import { ICONS } from '../../../assets'
import { COLORS } from '../../../constants'
import CarouselComponent from '../../../components/carousel'

const data = [1, 2, 3, 4, 5];

const BookingDetails = () => {
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
            <AppHeader
                leftIcon={ICONS.leftArrowIcon}
                headingText={'Booking'}
                rightIcon={ICONS.chatIcon}
                onRightIconPress={() => navigation.navigate('Messages')}
                onLeftIconPress={() => navigation.goBack()}
            />
            <CarouselComponent data={data} />
        </SafeAreaView>
    )
}

export default BookingDetails
