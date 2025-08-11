import React from 'react'
import { Image, StyleSheet, Text, TextInput, Touchable, TouchableOpacity, View } from 'react-native'
import { COLORS, fontFamly } from '../../constants'
import { ICONS, IMAGES } from '../../assets'
import { width } from 'react-native-dimension';

const AppHeader = ({ showSearch = true }) => {
    return (
        <View style={{ backgroundColor: COLORS.backgroundLight }}>
            <View style={{
                marginHorizontal: 10,
                marginTop: width(4),
                flexDirection: "row",
                alignItems: "center"
            }}>
                <View style={{}}>
                    <Image
                        resizeMode='contain'
                        style={{ width: 40, height: 40 }}
                        source={ICONS.locationIcon} />
                </View>
                <View style={{ marginLeft: 10 }}>
                    <Text style={{ fontSize: 12, fontFamily: fontFamly.PlusJakartaSansSemiMedium }}>San Francisco, CA</Text>
                </View>
                <View style={{ flexDirection: "row", marginRight: 10, justifyContent: "flex-end", flex: 1 }}>
                    <Image
                        resizeMode='contain'
                        style={{ width: 40, height: 40 }}
                        source={ICONS.notificationIcon} />
                </View>
            </View>
            {showSearch &&
                <View style={{ marginHorizontal: 10, flexDirection: 'row', alignItems: "center", flex: 1 }}>
                    <View style={styles.container}>
                        <Image source={ICONS.search} style={styles.icon} />
                        <TextInput
                            placeholder="Search Event"
                            placeholderTextColor="#aaa"
                            style={styles.input}
                        />
                    </View>
                    <TouchableOpacity style={{
                        flexDirection: "row",
                        flex: 1,
                        justifyContent: "flex-end",
                        marginRight: 10,
                    }}>
                        <Image
                            resizeMode='contain'
                            style={{ width: 40, height: 40 }}
                            source={ICONS.filters} />
                    </TouchableOpacity>
                </View>
            }
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 10,
        marginVertical: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 10,
        width: "80%",
        height: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    icon: {
        marginRight: 6,
        height: 20,
        width: 20,
    },
    input: {
        flex: 1,
        fontSize: 14,
        color: '#000',
    },
});

export default AppHeader
