import React, {useEffect} from 'react';
import {Image, ScrollView, StyleSheet, Text, View} from 'react-native';
import {width} from 'react-native-dimension';
import {ICONS} from '../../assets';
import Background from '../../components/background';
import Header from '../../components/header';
import {COLORS} from '../../constants';
import {useTranslation} from '../../hooks';
import {globalStyles} from '../../styles/globalStyle';

const AuthSuccess = ({route, navigation}) => {
  const {type, message} = route.params;
  const {t} = useTranslation();
  useEffect(() => {
    setTimeout(() => {
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'Login',
            params: {type: type},
          },
        ],
      });
    }, 3000);
  }, []);

  return (
    <Background>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <Header languageModal={false} />
          <View style={styles.card}>
            <Text
              style={[
                globalStyles.title,
                {fontSize: 20, textAlign: 'center', marginVertical: width(10)},
              ]}>
              {t(message)}
            </Text>
            <Image
              source={ICONS.checkIcon}
              resizeMode="contain"
              style={{height: 61, width: 61}}
            />
          </View>
        </View>
      </ScrollView>
    </Background>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    paddingVertical: width(20),
  },
  card: {
    width: width(90),
    backgroundColor: COLORS.backgroundLight,
    borderRadius: width(5),
    padding: width(4),
    marginTop: width(20),
    marginBottom: width(10),
    minHeight: width(90),
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
});

export default AuthSuccess;
