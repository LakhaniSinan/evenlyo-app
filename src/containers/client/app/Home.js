import React, { useState } from 'react';
import { ScrollView, Text, Touchable, TouchableOpacity, View } from 'react-native';
import { width } from 'react-native-dimension';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../../../components/appHeader';
import Categories from '../../../components/categories';
import EventCard from '../../../components/eventCard';
import HeadingComponent from '../../../components/headingComponent';
import HomeCard from '../../../components/homeCard';
import FilterModal from '../../../components/modals/FilterModal';
import PopularCard from '../../../components/popularCard';
import SubCategories from '../../../components/subCategories';
import { COLORS } from '../../../constants';
import useTranslation from '../../../hooks/useTranslation';

const Home = ({ navigation }) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const { t } = useTranslation();
  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={{ flex: 1, backgroundColor: COLORS.white }}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <AppHeader
          showSearch={true}
          setModalVisible={setModalVisible}
          showLocation={true}
          showNotifications={true}
        />

        <TouchableOpacity onPress={() => navigation.navigate("Notification")}>
          <Text>Notificaion</Text>
        </TouchableOpacity>
        <View
          style={{
            marginTop: 10,
          }}>
          <Categories />
        </View>
        <View
          style={{
            marginTop: 10,
          }}>
          <SubCategories />
        </View>
        <View>
          <HomeCard />
        </View>
        <View>
          <HeadingComponent
            heading={t('popular')}
            gradientText={t('nearYou')}
            rightArrow={true}
            onPress={() => { }}
          />
        </View>
        <View>
          <PopularCard />
        </View>
        <View>
          <HeadingComponent
            heading={t('relevant')}
            gradientText={t('vendors')}
            rightArrow={true}
            onPress={() => { }}
          />
        </View>
        <View>
          <EventCard navigation={navigation} />
        </View>
        <View style={{ height: width(10) }} />
      </ScrollView>
      <FilterModal
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
};

export default Home;
