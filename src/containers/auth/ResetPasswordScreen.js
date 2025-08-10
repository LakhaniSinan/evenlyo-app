import React from 'react'
import { ScrollView, Text, View } from 'react-native'
import Background from '../../components/background'
import Header from '../../components/header'
import { COLORS, fontFamly } from '../../constants'
import { width } from 'react-native-dimension';
import { useTranslation } from '../../hooks';
import { globalStyles } from '../../styles/globalStyle'
import OTPInputScreen from '../../components/otpScreen'
import GradientButton from '../../components/button'
import TextField from '../../components/textInput'

const ResetPasswordScreen = () => {
    const { t } = useTranslation();
    return (
        <Background>
            <ScrollView style={{ flex: 1, width: width(90) }}>
                <View style={{ flex: 1, paddingVertical: width(20) }}>
                    <Header languageModal={false} />
                    <View
                        style={{
                            width: width(90),
                            backgroundColor: COLORS.backgroundLight,
                            borderRadius: width(5),
                            padding: width(4),
                            marginTop: width(20),
                            marginBottom: width(10),
                            height: width(90),
                        }}>
                        <Text style={[globalStyles.title, { fontSize: 20, textAlign: 'center' }]}>
                            {t('resetPass')}
                        </Text>
                        <View style={{ marginTop: 10 }}>
                            <TextField
                                label={t('enterPasswrod')}
                                placeholder={t('passwordPlaceholder')}
                                keyboardType="default"
                                autoCapitalize="none"
                            />
                            <TextField
                                label={t('reEnterPassword')}
                                placeholder={t('passwordPlaceholder')}
                                keyboardType="default"
                                autoCapitalize="none"
                            />
                        </View>
                        <View style={{ marginTop: width(4) }}>
                            <GradientButton
                                text={"Continue"}
                                textStyle={{
                                    fontSize: 12,
                                    fontFamly: fontFamly.PlusJakartaSansSemiRegular,
                                    color: "white"
                                }}
                            />
                        </View>
                    </View>
                </View>
            </ScrollView>
        </Background>
    )
}

export default ResetPasswordScreen
