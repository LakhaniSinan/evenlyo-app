import { View, Image, TouchableOpacity, Text } from "react-native"
import { ICONS, IMAGES } from "../../assets"
import { COLORS } from "../../constants"
import { width } from 'react-native-dimension';

const Header = () => {
    return (
        <View
            style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: width(90),
                alignSelf: 'center',
            }}>
            <Image
                source={IMAGES.logo}
                resizeMode="contain"
                style={{ height: 120, width: 114 }}
            />
            <TouchableOpacity
                style={{
                    borderWidth: 1,
                    borderColor: COLORS.black,
                    borderRadius: 10,
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 5,
                    flexDirection: 'row',
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                }}>
                <Image
                    source={ICONS.languageIcon}
                    resizeMode="contain"
                    style={{ width: 15, height: 15, tintColor: COLORS.black }}
                />
                <Text style={{ fontSize: 12, fontWeight: '600' }}>English</Text>
            </TouchableOpacity>
        </View>
    )
}

export default Header