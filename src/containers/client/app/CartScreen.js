import {useState} from 'react';
import {
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {width} from 'react-native-dimension';
import LinearGradient from 'react-native-linear-gradient';
import {ICONS} from '../../../assets';
import AppHeader from '../../../components/appHeader';
import GradientButton from '../../../components/button';
import CartCard from '../../../components/cartCard';
import {COLORS, fontFamly} from '../../../constants';
import {useTranslation} from '../../../hooks';

function CartScreen({navigation}) {
  const {t} = useTranslation();
  const [activeTab, setActiveTab] = useState('addToCart');

  const handleBookNow = item => {
    console.log('Book now pressed for:', item.name);
    // Add booking logic here
  };

  const handleCancelBooking = item => {
    console.log('Cancel booking pressed for:', item.name);
    // Add cancel booking logic here
  };

  const variant = activeTab === 'addToCart' ? 'requested' : 'accepted';
  const renderCartItem = ({item}) => {
    return (
      <CartCard
        variant={variant}
        item={item}
        onBookNow={handleBookNow}
        onCancelBooking={handleCancelBooking}
      />
    );
  };

  const getCurrentData = () => {
    return activeTab === 'addToCart' ? requested : accepted;
  };
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: COLORS.white}}>
      <AppHeader
        leftIcon={ICONS.leftArrowIcon}
        headingText={t('Add To Cart')}
        rightIcon={ICONS.chatIcon}
        onLeftIconPress={() => navigation.goBack()}
        setModalVisible={() => {}}
        onRightIconPress={() => {}}
        containerStyle={{
          marginVertical: 10,
        }}
      />
      <ScrollView style={{flex: 1, backgroundColor: COLORS.white}}>
        <View style={styles.tabContainer}>
          <LinearGradient
            colors={
              activeTab == 'addToCart'
                ? ['#FF295D', '#E31B95', '#C817AE']
                : ['#fff', '#fff', '#fff']
            }
            style={styles.tabGradient}
            start={{x: 0, y: 0}}
            end={{x: 0, y: 1}}>
            <TouchableOpacity
              style={styles.tab}
              onPress={() => setActiveTab('addToCart')}>
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'addToCart' && styles.activeTabText,
                ]}>
                {t('Request Add To Cart')}
              </Text>
            </TouchableOpacity>
          </LinearGradient>

          <LinearGradient
            colors={
              activeTab == 'accepted'
                ? ['#FF295D', '#E31B95', '#C817AE']
                : ['#fff', '#fff', '#fff']
            }
            style={styles.tabGradient}
            start={{x: 0, y: 0}}
            end={{x: 0, y: 1}}>
            <TouchableOpacity
              style={styles.tab}
              onPress={() => setActiveTab('accepted')}>
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'accepted' && styles.activeTabText,
                ]}>
                {t('Accepted')}
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
        {/* Cart Items List */}
        <FlatList
          data={getCurrentData()}
          keyExtractor={item => item.id}
          renderItem={renderCartItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
        {activeTab === 'addToCart' && (
          <View
            style={{
              marginHorizontal: width(3),
            }}>
            <GradientButton
              text={t('Add New Request')}
              onPress={() => navigation.navigate('Login')}
              type="filled"
              gradientColors={['#FF295D', '#E31B95', '#C817AE']}
            />
          </View>
        )}
        {variant === 'accepted' && (
          <>
            <View
              style={{
                marginHorizontal: width(3),
              }}>
              <View style={styles.progressNotesCard}>
                <View style={styles.itemsList}>
                  <View style={styles.itemRow}>
                    <Text style={styles.itemName}>DJ Ray Vib...</Text>
                    <Text style={styles.itemPrice}>$300</Text>
                  </View>
                  <View style={styles.itemRow}>
                    <Text style={styles.itemName}>DJ Ray Vib...</Text>
                    <Text style={styles.itemPrice}>$300</Text>
                  </View>
                  <View style={styles.itemRow}>
                    <Text style={styles.itemName}>Security Fee</Text>
                    <Text style={styles.itemPrice}>$25</Text>
                  </View>
                  <View style={styles.itemRow}>
                    <Text style={styles.itemName}>Kilometer</Text>
                    <Text style={styles.itemPrice}>$5</Text>
                  </View>
                  <View style={[styles.itemRow, styles.subtotalRow]}>
                    <Text style={styles.subtotalText}>Subtotal</Text>
                    <Text style={styles.subtotalPrice}>$630</Text>
                  </View>
                  <View style={styles.itemRow}>
                    <Text style={styles.totalText}>Total</Text>
                    <Text style={styles.totalAmount}>$630</Text>
                  </View>
                  <Text style={styles.serviceCharges}>+ service charges</Text>
                </View>
              </View>
            </View>
            <View style={{margin: width(4)}}>
              <GradientButton
                text={t('Checkout')}
                type="filled"
                gradientColors={['#FF295D', '#E31B95', '#C817AE']}
              />
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
export default CartScreen;

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    borderRadius: width(5),
    padding: width(),
    margin: width(3),
    backgroundColor: COLORS.white,
    gap: width(1),
  },
  tabGradient: {
    flex: 1,
    borderRadius: width(3),
  },
  tab: {
    paddingHorizontal: width(3),
    paddingVertical: width(3.5),
    borderRadius: width(3),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: width(12),
  },
  tabText: {
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansMedium,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  activeTabText: {
    color: COLORS.white,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: width(10),
    gap: 10,
    justifyContent: 'flex-end',
  },
  listContainer: {
    paddingBottom: width(5),
  },
  progressNotesCard: {
    backgroundColor: COLORS.white,
    borderRadius: width(3),
    padding: width(4),
    marginTop: width(4),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  progressNotesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: width(3),
  },
  progressNotesIcon: {
    fontSize: 16,
    marginRight: width(2),
  },
  progressNotesTitle: {
    fontSize: 16,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textDark,
  },
  progressNotesSubtext: {
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: COLORS.textLight,
    marginBottom: width(4),
    lineHeight: 18,
  },
  itemsList: {
    gap: width(3),
    paddingBottom: width(3),
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  itemName: {
    fontSize: 14,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: COLORS.textLight,
    flex: 1,
  },
  itemPrice: {
    fontSize: 14,
    fontFamily: fontFamly.PlusJakartaSansMedium,
    color: COLORS.textDark,
  },
  subtotalRow: {
    borderBottomWidth: 0,
  },
  subtotalText: {
    fontSize: 14,
    fontFamily: fontFamly.PlusJakartaSansMedium,
    color: COLORS.textDark,
  },
  subtotalPrice: {
    fontSize: 14,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textDark,
  },
  totalText: {
    fontSize: 18,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textDark,
  },
  serviceCharges: {
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: COLORS.textLight,
  },
  totalAmount: {
    fontSize: 18,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textDark,
  },
});

export const requested = [
  {
    id: 'dj_01',
    name: 'DJ Ray Vibes',
    status: 'In stock',
    verified: true,
    artistName: 'Jaydeep',
    price: 300,
    priceUnit: 'Per Event',
    image:
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
    isBookmarked: true,
    isSelected: false,
  },
  {
    id: 'dj_02',
    name: 'DJ Ray Vibes',
    status: 'In stock',
    verified: true,
    artistName: 'Jaydeep',
    price: 300,
    priceUnit: 'Per Event',
    image:
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
    isBookmarked: true,
    isSelected: true,
  },
];
export const accepted = [
  {
    id: 'dj_03',
    name: 'DJ Ray Vibes',
    status: 'In stock',
    verified: true,
    artistName: 'Jaydeep',
    artistAvatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    price: 300,
    priceUnit: 'Per Event',
    image:
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
    isBookmarked: true,
    isSelected: true,
    actionButton: {
      label: 'Cancel Booking',
      variant: 'outlined',
    },
  },
  {
    id: 'dj_04',
    name: 'DJ Ray Vibes',
    status: 'In stock',
    verified: true,
    artistName: 'Jaydeep',
    artistAvatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    price: 300,
    priceUnit: 'Per Event',
    image:
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
    isBookmarked: true,
    isSelected: false,
    actionButton: {
      label: 'Cancel Booking',
      variant: 'filled',
    },
  },
];
