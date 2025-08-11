import React, { useState } from 'react';
import { Text, View, FlatList, StyleSheet, Image, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, fontFamly } from '../../constants';
import { ICONS } from '../../assets';

const data = ["All", "Entertainment", "Foods & Drinks", "Decoration", "4"];

const Categories = () => {
    const [selected, setSelected] = useState(null);

    return (
        <FlatList
            data={data}
            horizontal
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={{ paddingHorizontal: 10 }}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item, index }) => {
                const isSelected = selected === index;

                const CardContent = () => (
                    <View style={styles.card}>
                        <View style={styles.iconWrapper}>
                            <Image style={styles.icon} source={ICONS.four} />
                        </View>
                        <Text style={styles.cardText}>{item}</Text>
                    </View>
                );

                return (
                    <TouchableOpacity onPress={() => setSelected(index)}>
                        {isSelected ? (
                            <LinearGradient
                                colors={['#FF295D', '#E31B95', '#C817AE']}
                                style={styles.gradientBorder}
                            >
                                <CardContent />
                            </LinearGradient>
                        ) : (
                            <CardContent />
                        )}
                    </TouchableOpacity>
                );
            }}
        />
    );
};

const styles = StyleSheet.create({
    gradientBorder: {
        padding: 0.8,
        borderRadius: 12,
    },
    card: {
        marginHorizontal: 5,
        paddingHorizontal: 10,
        height: 76,
        width: 91,
        backgroundColor: COLORS.backgroundLight,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
    },
    iconWrapper: {
        height: 25,
        width: 25,
        backgroundColor: 'white',
        borderRadius: 200,
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        height: 12,
        width: 12,
    },
    cardText: {
        textAlign: 'center',
        fontSize: 10,
        fontFamily: fontFamly.PlusJakartaSansSemiMedium,
        marginTop: 4,
    },
});

export default Categories;
