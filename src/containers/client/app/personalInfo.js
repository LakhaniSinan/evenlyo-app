import React, { useState } from 'react'
import { Image, SafeAreaView, StyleSheet, Text, View } from 'react-native'
import AppHeader from '../../../components/appHeader'
import { IMAGES } from '../../../assets'
import { fontFamly, SIZES } from '../../../constants'
import { width } from 'react-native-dimension';
import TextField from '../../../components/textInput'
import ContactNumberInput from '../../../components/phoneInput'
import { useTranslation } from 'react-i18next'
import GradientButton from '../../../components/button'

const PersonalInfo = () => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        contact: '',
        password: '',
        confirmPassword: '',
    });

    return (
        <SafeAreaView style={{
            flex: 1,
            backgroundColor: "white"
        }}>
            <AppHeader
                headingText={"Personal Info"}
            />
            <View style={{ alignItems: "center", marginTop: width(4) }}>
                <Image
                    style={{
                        height: 100,
                        width: 100,
                        borderRadius: 200
                    }}
                    source={IMAGES.backgroundImage}
                />
            </View>

            <View style={styles.form}>
                <TextField
                    label={t('firstName')}
                    placeholder={t('firstNamePlaceholder')}
                    // value={email}
                    // onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                <View style={{ height: 10 }} />
                <TextField
                    label={t('lastName')}
                    placeholder={t('lastNamePlaceholder')}
                    // value={email}
                    // onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                <View style={{ height: 10 }} />
                <TextField
                    label={t('emailAddress')}
                    placeholder={t('emailPlaceholder')}
                    // value={email}
                    // onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                <View style={{ height: 10 }} />
                <ContactNumberInput
                    labelColor={'#000'}
                    phoneNumber={formData.contact}
                // onChange={value => handleInputChange('contact', value)}
                // ref={phoneInput}
                />
            </View>
            <View style={{
                marginHorizontal: 10,
                flex: 1,
                justifyContent: "flex-end",
                marginBottom: 10
            }}>
                <GradientButton
                    text={"Save & Change"}
                />
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    form: {
        marginBottom: SIZES.lg,
        marginTop: 20,
        marginHorizontal: 10
    },
});

export default PersonalInfo
