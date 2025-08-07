import React from 'react'
import { Text, View } from 'react-native'
import GradientButton from '../../../components/button'
import { ICONS } from '../../../assets'
import { useDispatch } from 'react-redux'
import { setUserData } from '../../../store/slice/auth'

const Home = () => {
    const dispatch = useDispatch()
    return (
        <View>
            <View style={{ marginTop: 100 }}>
                <GradientButton
                    text="LOG OUT"
                    onPress={() => {
                        dispatch(setUserData(null))
                    }}
                    type="outline"
                    gradientColors={['#F6F6F6', '#F6F6F6']}
                    styleProps={{ backgroundColor: '#F6F6F6' }}
                />
            </View>
        </View>
    )
}

export default Home
