import React, {useEffect, useRef, useState} from 'react';
import {
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {width} from 'react-native-dimension';
import {ICONS} from '../../../assets';
import CommonAlert from '../../../components/commanAlert';
import ListingCard from '../../../components/listingCard';
import Loader from '../../../components/loder';
import FilterModal from '../../../components/modals/FilterModal';
import {COLORS, fontFamly} from '../../../constants';
import {useTranslation} from '../../../hooks';
import {getListingData} from '../../../services/ListingsItem';
import TextField from '../../../components/textInput';

const EventListingScreen = ({navigation}) => {
  const {t, currentLanguage} = useTranslation();
  const modalRef = useRef(null);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false); // ✅ new state
  const [allListings, setAllListings] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  const filteredListings = React.useMemo(() => {
    if (!search.trim()) {
      return allListings;
    }

    return allListings.filter(item => {
      const title = item?.title?.[currentLanguage]?.toLowerCase() || '';

      return title.includes(search.toLowerCase().trim());
    });
  }, [allListings, search, currentLanguage]);

  useEffect(() => {
    handleGetAllBooking();
  }, []);

  const handleGetAllBooking = async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setIsLoading(true);

      const response = await getListingData();

      let data = response.data?.data || [];

      if (response.status === 200 || response.status === 201) {
        setAllListings(data);
      } else {
        modalRef.current.show({
          status: 'error',
          message: response?.data?.message,
        });
      }
    } catch (error) {
      console.log(error, 'Error fetching listings');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // ✅ Pull to Refresh handler
  const onRefresh = () => {
    handleGetAllBooking(true);
  };

  const renderCartItem = ({item}) => {
    return <ListingCard item={item} navigation={navigation} />;
  };

  const renderEmptyComponent = () => (
    <View style={styles.emptyWrapper}>
      <Image
        source={ICONS.search}
        style={styles.emptyIcon}
        resizeMode="contain"
      />

      <Text style={styles.emptyTitle}>
        {currentLanguage === 'en'
          ? 'No Listings Found'
          : 'Geen vermeldingen gevonden'}
      </Text>

      <Text style={styles.emptyDescription}>
        {search.trim()
          ? currentLanguage === 'en'
            ? 'We could not find any listings matching your search.'
            : 'We konden geen vermeldingen vinden die overeenkomen met uw zoekopdracht.'
          : currentLanguage === 'en'
          ? 'There are no listings available at the moment.'
          : 'Er zijn momenteel geen vermeldingen beschikbaar.'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: COLORS.white}}>
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: COLORS.backgroundLight,
          borderBottomRightRadius: 20,
          borderBottomLeftRadius: 20,
          paddingVertical: width(2),
        }}>
        <View
          style={{
            width: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: width(2),
            paddingHorizontal: width(2),
          }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              style={{width: 40, height: 40}}
              source={ICONS.leftArrowIcon}
            />
          </TouchableOpacity>

          <Text
            style={{
              fontFamily: fontFamly.PlusJakartaSansBold,
              color: COLORS.black,
            }}>
            {t('All Booking Items')}
          </Text>

          <TouchableOpacity
            onPress={() => navigation.navigate('Notifications')}>
            <Image
              style={{width: 40, height: 40}}
              source={ICONS.notificationIcon}
            />
          </TouchableOpacity>
        </View>
        <View
          style={{
            paddingHorizontal: 16,
            paddingBottom: 15,
            width: '100%',
          }}>
          <TextField
            value={search}
            onChangeText={setSearch}
            placeholder={t('Search listings')}
            startIcon={ICONS.search}
            bgColor={COLORS.white}
          />
        </View>
      </View>
      <FlatList
        data={filteredListings}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderCartItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyComponent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      <Loader isLoading={isLoading} />
      <CommonAlert ref={modalRef} />
    </SafeAreaView>
  );
};

export default EventListingScreen;

const styles = StyleSheet.create({
  listContainer: {
    paddingBottom: width(5),
    flexGrow: 1,
    // alignItems: 'center',
    // justifyContent: 'center',
  },

  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },

  emptyWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  emptyIcon: {
    width: 30,
    height: 30,
    tintColor: COLORS.primary,
    marginBottom: 18,
  },

  emptyTitle: {
    fontSize: 18,
    color: COLORS.black,
    fontFamily: fontFamly.PlusJakartaSansBold,
    textAlign: 'center',
  },

  emptyDescription: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.textLight,
    fontFamily: fontFamly.regular,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
});
