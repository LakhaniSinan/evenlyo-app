import {useState} from 'react';
import {
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {width} from 'react-native-dimension';
import {ICONS, IMAGES} from '../../../assets';
import GradientButton from '../../../components/button';
import BookingFilterPopUp from '../../../components/modals/BookingFilterPopup';
import SelectedRequestModal from '../../../components/modals/SelectedRequestModal';
import TextField from '../../../components/textInput';
import {COLORS, fontFamly} from '../../../constants';
import {useTranslation} from '../../../hooks';

const BookingItems = ({route, navigation}) => {
  const item = route.params;
  console.log(item, 'itemitemitemitemitem123131');

  const {t} = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);
  const [slectedIndex, setSlectedIndex] = useState('');
  const [selectItem, setSelectItem] = useState(null);
  const [selectModal, setSelectModal] = useState(false);
  const bookingData = [
    {
      type: 'DJ',
      title: 'DJ Abz Wine || DJ Ray Beatz Let the Move You!',
      price: '$300',
      itemImage: IMAGES.backgroundImage2,
    },
    {
      type: 'DJ',
      title: 'DJ Abz Wine || DJ Ray Beatz Let the Bass Move!',
      price: '$300',
      itemImage: IMAGES.backgroundImage2,
    },
    {
      type: 'DJ',
      title: 'DJ Abz Wine || DJ Ray Beatz Let the Bass You!',
      price: '$300',
      itemImage: IMAGES.backgroundImage2,
    },
    {
      type: 'DJ',
      title: 'DJ Abz Wine || DJ Ray Beatz Let he Move You!',
      price: '$300',
      itemImage: IMAGES.backgroundImage2,
    },
    {
      type: 'DJ',
      title: 'DJ Abz Wine || DJ Ray Beatz Let Bass Move You!',
      price: '$300',
      itemImage: IMAGES.backgroundImage2,
    },
    {
      type: 'DJ',
      title: 'DJ Abz Wine || DJ Ray Beatz the Bass Move You!',
      price: '$300',
      itemImage: IMAGES.backgroundImage2,
    },
    {
      type: 'DJ',
      title: 'DJ Abz Wine || DJ Ray Beatz Let the Bass Move You!',
      price: '$300',
      itemImage: IMAGES.backgroundImage2,
    },
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
  ];
  const saleData = [
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
    {
      type: 'DJ',
      title: 'Elegant Vase',
      price: '$300',
      itemImage: IMAGES.vase,
    },
  ];

  const handleSelectItem = (item, index) => {
    console.log(index, 'indexindexindex');
    setSlectedIndex(index);
    setSelectItem(item);
    setSelectModal(true);
  };

  const handleSave = () => {
    setSelectModal(false);
  };

  const renderItem = ({item, index}) => {
    return (
      <TouchableOpacity
        onPress={() => handleSelectItem(item, index)}
        style={{
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
        }}>
        <View
          style={{
            height: width(18),
            width: width(18),
            borderRadius: 10,
            overflow: 'hidden',
          }}>
          <Image
            source={item?.itemImage}
            style={{height: '100%', width: '100%'}}
            resizeMode="cover"
          />
        </View>

        <View
          style={{
            marginLeft: width(3),
            width: width(55),
          }}>
          <Text
            style={{
              fontSize: 9,
              color: COLORS.green,
              fontFamily: fontFamly.PlusJakartaSansMedium,
            }}>
            • {item?.type}
          </Text>
          <Text
            numberOfLines={2}
            style={{
              fontSize: 12,
              color: '#000',
              fontFamily: fontFamly.PlusJakartaSansBold,
              marginTop: 3,
            }}>
            {item?.title}
          </Text>
        </View>

        <View style={{marginLeft: width(2)}}>
          {index == slectedIndex && (
            <View
              style={{
                marginLeft: width(2),
                height: width(4),
                width: width(4),
                borderRadius: 100,
                marginBottom: width(3),
              }}>
              <Image
                source={ICONS.checkIcon}
                resizeMode="contain"
                style={{height: '100%', width: '100%'}}
              />
            </View>
          )}
          <Text
            style={{
              fontSize: 14,
              fontFamily: fontFamly.PlusJakartaSansBold,
              color: COLORS.textDark,
            }}>
            {item?.price}
          </Text>
          {item == 1 && (
            <Text
              style={{
                fontSize: 10,
                fontFamily: fontFamly.PlusJakartaSansSemiRegular,
              }}>
              /Day
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: COLORS.backgroundLight}}>
      <FlatList
        ListHeaderComponent={
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: COLORS.backgroundLight,
              borderBottomRightRadius: 20,
              borderBottomLeftRadius: 20,
            }}>
            {/* Top Header */}
            <View
              style={{
                paddingVertical: width(2),
                paddingHorizontal: width(2),
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Image
                  resizeMode="contain"
                  style={{width: 40, height: 40}}
                  source={ICONS.leftArrowIcon}
                />
              </TouchableOpacity>
              <Text style={{fontFamily: fontFamly.PlusJakartaSansBold}}>
                {item == 1 ? t('Booking Items') : t('Sale Items')}
              </Text>
              <View style={{width: 40}} />
            </View>

            {/* Search + Filter */}
            <View
              style={{
                flex: 1,
                width: '100%',
                flexDirection: 'row',
                paddingHorizontal: width(3),
                alignItems: 'center',
                marginVertical: width(3),
                justifyContent: 'space-between',
              }}>
              <View style={{width: 350}}>
                <TextField
                  placeholder={t('searchEvent')}
                  placeholderTextColor="#aaa"
                  bgColor={COLORS.white}
                  startIcon={ICONS.search}
                  inputContainer={{
                    paddingVertical: 0,
                    paddingHorizontal: 10,
                    height: 45,
                    width: '95%',
                    marginTop: 0,
                  }}
                  styleProps={{
                    fontSize: 14,
                    color: '#000',
                  }}
                />
              </View>
              <TouchableOpacity
                onPress={() => setModalVisible(true)}
                style={{
                  height: width(10),
                  width: width(10),
                  borderRadius: 10,
                }}>
                <Image
                  style={{height: '100%', width: '100%'}}
                  resizeMode="contain"
                  source={ICONS.filters}
                />
              </TouchableOpacity>
            </View>
          </View>
        }
        data={item == 1 ? bookingData : saleData}
        renderItem={renderItem}
        contentContainerStyle={{paddingBottom: 10}}
      />
      {selectItem && (
        <View
          style={{
            width: width(90),
            alignSelf: 'center',
            marginVertical: width(3),
          }}>
          <GradientButton
            text={t('Save & Continue')}
            onPress={() =>
              navigation.navigate('CreateCustomOffer', {selected: true})
            }
            type="filled"
            textStyle={styles.applyText}
          />
        </View>
      )}
      <BookingFilterPopUp
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
      <SelectedRequestModal
        onSave={handleSave}
        isVisible={selectModal}
        onClose={() => setSelectModal(false)}
        type={item}
      />
    </SafeAreaView>
  );
};

export default BookingItems;

const styles = StyleSheet.create({
  applyText: {
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: COLORS.white,
  },
});
