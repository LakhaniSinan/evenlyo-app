import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {width} from 'react-native-dimension';
import {ICONS, IMAGES} from '../../../assets';
import AppHeader from '../../../components/appHeader';
import GradientButton from '../../../components/button';
import RejectRequestModal from '../../../components/modals/RejectRequest';
import {COLORS, fontFamly} from '../../../constants';

function BookingDetails({route}) {
  const data = route.params;
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  console.log(data, 'datadatadatadata1231232');
  const getStatusColor = status => {
    switch (status) {
      case 'Completed':
        return '#E8F5E8';
      case 'New Requests':
        return '#FFE8F0';
      case 'In Progress':
        return '#FFF3E0';
      default:
        return '#F5F5F5';
    }
  };

  const getStatusTextColor = status => {
    switch (status) {
      case 'Completed':
        return '#2E7D32';
      case 'New Requests':
        return '#E91E63';
      case 'In Progress':
        return '#FF9800';
      default:
        return '#666666';
    }
  };
  const handleConfirmCancel = () => {
    setTimeout(() => {
      setModalVisible(false);
    }, 500);
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: COLORS.white}}>
      <AppHeader
        headingText={'Booking Details'}
        leftIcon={ICONS.leftArrowIcon}
        rightIcon={ICONS.chatIcon}
        onLeftIconPress={() => {
          navigation.goBack();
        }}
        onRightIconPress={() => {
          navigation.navigate('Messages');
        }}
      />
      <View
        style={{
          backgroundColor: COLORS.backgroundLight,
          borderRadius: width(4),
          margin: width(4),
          padding: width(5),
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <Text
            style={{
              fontFamily: fontFamly.PlusJakartaSansMedium,
              fontSize: 12,
              color: COLORS.textDark,
            }}>
            Booking #TRK001
          </Text>
          <View
            style={[
              styles.statusBadge,
              {backgroundColor: getStatusColor(data.status)},
            ]}>
            <Text
              style={[
                styles.statusText,
                {color: getStatusTextColor(data.status)},
              ]}>
              {data.status}
            </Text>
          </View>
        </View>
        <View
          style={{
            paddingVertical: width(3),
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <Image
            source={ICONS.clockIcon}
            resizeMode="contain"
            style={{height: width(5), width: width(5)}}
          />
          <View style={{marginLeft: width(3)}}>
            <Text
              style={{
                fontFamily: fontFamly.PlusJakartaSansMedium,
                fontSize: 12,
                color: COLORS.textDark,
              }}>
              2024-06-27
            </Text>
            <Text
              style={{
                fontFamily: fontFamly.PlusJakartaSansMedium,
                fontSize: 10,
                color: COLORS.textLight,
              }}>
              10:00
            </Text>
          </View>
        </View>
        <View
          style={{
            paddingVertical: width(3),
            flexDirection: 'row',
            alignItems: 'center',
            borderBottomWidth: 1,
            borderBottomColor: COLORS.border,
          }}>
          <Image
            source={ICONS.ticketIcon}
            resizeMode="contain"
            style={{height: width(5), width: width(5)}}
          />
          <View style={{marginLeft: width(3)}}>
            <Text
              style={{
                fontFamily: fontFamly.PlusJakartaSansMedium,
                fontSize: 12,
                color: COLORS.textDark,
              }}>
              Tracking ID
            </Text>
            <Text
              style={{
                fontFamily: fontFamly.PlusJakartaSansMedium,
                fontSize: 10,
                color: COLORS.textLight,
              }}>
              TRK001
            </Text>
          </View>
        </View>
        <Text
          style={{
            fontSize: 12,
            marginTop: width(3),
            color: COLORS.textDark,
            fontFamily: fontFamly.PlusJakartaSansMedium,
          }}>
          Buyer Details
        </Text>
        <View
          style={{
            paddingVertical: width(3),
            flexDirection: 'row',
            alignItems: 'center',
            borderBottomWidth: 1,
            borderBottomColor: COLORS.border,
          }}>
          <Image
            source={IMAGES.profilePhoto}
            resizeMode="contain"
            style={{height: width(10), width: width(10)}}
          />
          <View style={{marginLeft: width(3)}}>
            <Text
              style={{
                fontFamily: fontFamly.PlusJakartaSansMedium,
                fontSize: 12,
                color: COLORS.textDark,
              }}>
              John Smith
            </Text>
            <Text
              style={{
                fontFamily: fontFamly.PlusJakartaSansMedium,
                fontSize: 10,
                color: COLORS.textLight,
              }}>
              ID: USR001
            </Text>
          </View>
        </View>
        <Text
          style={{
            fontSize: 12,
            marginTop: width(3),
            color: COLORS.textDark,
            fontFamily: fontFamly.PlusJakartaSansMedium,
          }}>
          Seller Details
        </Text>
        <View
          style={{
            paddingVertical: width(3),
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <Image
            source={IMAGES.profilePhoto}
            resizeMode="contain"
            style={{height: width(10), width: width(10)}}
          />
          <View style={{marginLeft: width(3)}}>
            <Text
              style={{
                fontFamily: fontFamly.PlusJakartaSansMedium,
                fontSize: 12,
                color: COLORS.textDark,
              }}>
              Tech Solutions Ltd
            </Text>
            <Text
              style={{
                fontFamily: fontFamly.PlusJakartaSansMedium,
                fontSize: 10,
                color: COLORS.textLight,
              }}>
              New York, NY
            </Text>
          </View>
        </View>
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingLeft: width(4),
          paddingRight: width(1),
        }}>
        <View style={{width: width(44), marginRight: width(2)}}>
          <GradientButton
            text={'Accept'}
            // onPress={onClose}
            type="outline"
            useGradient={true}
          />
        </View>
        <View style={{width: width(44), marginRight: width(2)}}>
          <GradientButton
            textStyle={{
              fontSize: 13,
              fontFamly: fontFamly.PlusJakartaSansMedium,
              color: COLORS.white,
            }}
            text={'Reject'}
            onPress={() => setModalVisible(true)}
            styleProps={{
              paddingVertical: width(3),
            }}
          />
        </View>
      </View>
      <TouchableOpacity
        onPress={() => navigation.navigate('TrackingBookingDetails')}
        style={{
          marginHorizontal: width(4),
          paddingVertical: width(3),
          marginTop: width(3),
          borderRadius: width(4),
          borderWidth: 1,
          borderColor: COLORS.border,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text
          style={{
            fontSize: 13,
            fontFamily: fontFamly.PlusJakartaSansBold,
            color: COLORS.black,
          }}>
          Track Now
        </Text>
      </TouchableOpacity>
      <RejectRequestModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onConfirm={() => handleConfirmCancel()}
      />
    </SafeAreaView>
  );
}

export default BookingDetails;

const styles = StyleSheet.create({
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
  },
});
