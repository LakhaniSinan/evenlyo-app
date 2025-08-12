import React, {useState} from 'react';
import {ScrollView, View} from 'react-native';
import {width} from 'react-native-dimension';
import {SafeAreaView} from 'react-native-safe-area-context';
import AppHeader from '../../../components/appHeader';
import Categories from '../../../components/categories';
import EventCard from '../../../components/eventCard';
import HeadingComponent from '../../../components/headingComponent';
import HomeCard from '../../../components/homeCard';
import FilterModal from '../../../components/modals/FilterModal';
import PopularCard from '../../../components/popularCard';
import SubCategories from '../../../components/subCategories';

const Home = () => {
  const [isModalVisible, setModalVisible] = useState(false);
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{flex: 1}}>
      <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false}>
        <AppHeader setModalVisible={setModalVisible} />
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
            heading={'Popular'}
            gradientText={'Near You'}
            rightArrow={true}
            onPress={() => {}}
          />
        </View>
        <View>
          <PopularCard />
        </View>
        <View>
          <HeadingComponent
            heading={'Relevant'}
            gradientText={'Vendors'}
            rightArrow={true}
            onPress={() => {}}
          />
        </View>
        <View>
          <EventCard />
        </View>
        <View style={{height: width(30)}} />
      </ScrollView>
      <FilterModal
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
};

export default Home;
