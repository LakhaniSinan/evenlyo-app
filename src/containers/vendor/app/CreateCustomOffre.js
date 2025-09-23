// CreateCustomOffer.js
import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {
  Image,
  SafeAreaView,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {width} from 'react-native-dimension';
import {ICONS, IMAGES} from '../../../assets';
import AppHeader from '../../../components/appHeader';
import GradientButton from '../../../components/button';
import GradientText from '../../../components/gradiantText';
import AddNewItemModal from '../../../components/modals/AddNewItem';
import NewRequestModal from '../../../components/modals/RequestModal';
import {COLORS, fontFamly} from '../../../constants';
import {useTranslation} from '../../../hooks';

const CreateCustomOffer = ({route}) => {
  const data = route.params;
  const {t} = useTranslation();
  const navigation = useNavigation();
  const [showRequestModal, setShowRequestModal] = useState(false);

  const [showAddNew, setShowAddNew] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  const handleSelect = type => {
    setShowAddNew(false);
    navigation.navigate('BookingItems', type);
  };

  // 🔹 Dummy Data (grouped by section)
  const selectedData = [
    {
      title: 'Booking Items',
      data: [
        {
          type: 'DJ',
          title: 'DJ Abz Wine || DJ Ray Let the Bass Move You!',
          price: '$300',
          itemImage: IMAGES.backgroundImage2,
        },
        {
          type: 'DJ',
          title: 'DJ Abz Wine || DJ Beatz Let the Bass Move You!',
          price: '$300',
          itemImage: IMAGES.backgroundImage2,
        },
      ],
    },
    {
      title: 'Sale Items',
      data: [
        {
          type: 'DJ',
          title: 'Elegant Vase',
          price: '$300',
          itemImage: IMAGES.vase,
        },
        {
          type: 'DJ',
          title: 'Elegant Vase',
          price: '$300',
          itemImage: IMAGES.vase,
        },
      ],
    },
  ];

  // 🔹 Render each item
  const renderItem = ({item}) => (
    <View style={styles.card}>
      <View style={styles.imageWrapper}>
        <Image
          source={item?.itemImage}
          style={styles.image}
          resizeMode="cover"
        />
      </View>
      <View style={styles.textWrapper}>
        <Text style={styles.typeText}>• {item?.type}</Text>
        <Text style={styles.titleText} numberOfLines={2}>
          {item?.title}
        </Text>
      </View>
      <View style={styles.priceWrapper}>
        <Text style={styles.priceText}>{item?.price}</Text>
        <Text style={styles.dayText}>/Day</Text>
      </View>
    </View>
  );

  // 🔹 Render section headers
  const renderSectionHeader = ({section: {title}}) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  return (
    <SafeAreaView style={{flex: 1}}>
      <AppHeader
        headingText={t('Create Custom offer')}
        leftIcon={ICONS.leftArrowIcon}
        onLeftIconPress={() => navigation.goBack()}
      />

      <View style={styles.addBtnWrapper}>
        <GradientButton
          text={t('Add New Item')}
          onPress={() => setShowAddNew(true)}
          textStyle={styles.addBtnText}
          styleProps={styles.addBtn}
        />
      </View>

      <SectionList
        sections={data?.selected ? selectedData : []}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={{paddingBottom: 20}}
        showsVerticalScrollIndicator={false}
      />
      <View style={styles.buttonRow}>
        <View style={{width: width(46)}}>
          <TouchableOpacity
            onPress={() => setShowRequestModal(true)}
            style={styles.cancelButton}
            activeOpacity={0.7}>
            <GradientText text={'Offer Preview'} />
          </TouchableOpacity>
        </View>

        <View style={{width: width(46)}}>
          <GradientButton
            text={t('Send Offer')}
            onPress={() => navigation.navigate('ChatDetails', {offreShow: true})}
            type="filled"
            textStyle={styles.applyText}
          />
        </View>
      </View>
      <NewRequestModal
        type={'vendor'}
        isVisible={showRequestModal}
        onClose={() => setShowRequestModal(!showRequestModal)}
        navigation={navigation}
      />
      <AddNewItemModal
        isVisible={showAddNew}
        selectedOption={selectedOption}
        onClose={() => setShowAddNew(false)}
        handleSelect={handleSelect}
      />
    </SafeAreaView>
  );
};

export default CreateCustomOffer;

const styles = StyleSheet.create({
  addBtnWrapper: {
    paddingHorizontal: width(4),
    marginTop: width(3),
  },
  addBtn: {
    paddingVertical: width(3),
  },
  addBtnText: {
    fontSize: 13,
    fontFamily: fontFamly.PlusJakartaSansMedium,
    color: COLORS.white,
  },
  sectionHeader: {
    fontSize: 14,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textDark,
    marginTop: width(4),
    marginLeft: width(4),
  },
  buttonRow: {
    flexDirection: 'row',
    width: width(100),
    justifyContent: 'space-around',
    marginBottom: width(4),
  },
  applyText: {
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: COLORS.white,
  },
  cancelButton: {
    backgroundColor: COLORS.backgroundLight,
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: width(2.5),
    borderRadius: 12,
    backgroundColor: COLORS.white,
    marginVertical: width(2),
    marginHorizontal: width(3),
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  imageWrapper: {
    height: width(18),
    width: width(18),
    borderRadius: 10,
    overflow: 'hidden',
  },
  image: {
    height: '100%',
    width: '100%',
  },
  textWrapper: {
    marginLeft: width(3),
    width: width(55),
  },
  typeText: {
    fontSize: 9,
    color: COLORS.green,
    fontFamily: fontFamly.PlusJakartaSansMedium,
  },
  titleText: {
    fontSize: 12,
    color: COLORS.black,
    fontFamily: fontFamly.PlusJakartaSansBold,
    marginTop: 3,
  },
  priceWrapper: {
    marginLeft: width(2),
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 14,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textDark,
  },
  dayText: {
    fontSize: 10,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
  },
});
