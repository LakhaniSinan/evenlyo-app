import React, {useState} from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {width} from 'react-native-dimension';
import LinearGradient from 'react-native-linear-gradient';
import {IMAGES} from '../../../assets';
import {COLORS, fontFamly} from '../../../constants';

const GRADIENT_COLORS = ['#FF295D', '#E31B95', '#C817AE'];

const CustomDrawer = ({navigation}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const iconsToRender = [
    {
      label: 'Dashboard',
      onPress: () => {
        setActiveIndex(0);
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'Dashboard',
              params: {
                screen: 'Home',
                params: {screen: 'Dashboard'},
              },
            },
          ],
        });
      },
    },
    {
      label: 'Analytics',
      onPress: () => {
        setActiveIndex(1);
        navigation.navigate('Dashboard', {
          screen: 'Home',
          params: {screen: 'AnalyticsReport'},
        });
      },
    },

    {
      label: 'Messages',
      onPress: () => {
        setActiveIndex(2);
        navigation.navigate('Dashboard', {
          screen: 'Home',
          params: {screen: 'Messages'},
        });
      },
      badge: 6, // example notification
    },
  ];

  return (
    <View style={styles.drawerContent}>
      <View style={styles.profileSection}>
        <Image source={IMAGES.profilePhoto} style={styles.profileImage} />
        <Text style={styles.profileName}>Asima Khan</Text>
        <Text style={styles.profileEmail}>Webpixels</Text>
      </View>

      {/* Menu */}
      <View style={styles.menuItems}>
        {iconsToRender.map((item, index) => {
          const isActive = index === activeIndex;
          return (
            <TouchableOpacity
              key={index}
              style={styles.menuWrapper}
              onPress={item.onPress}>
              {isActive ? (
                <LinearGradient
                  colors={GRADIENT_COLORS}
                  style={styles.activeMenu}>
                  <Text style={styles.activeText}>{item.label}</Text>
                  {item.badge && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{item.badge}</Text>
                    </View>
                  )}
                </LinearGradient>
              ) : (
                <View style={styles.inactiveMenu}>
                  <Text style={styles.inactiveText}>{item.label}</Text>
                  {item.badge && (
                    <View style={styles.badgeInactive}>
                      <Text style={styles.badgeTextInactive}>{item.badge}</Text>
                    </View>
                  )}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default CustomDrawer;

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
  },
  profileSection: {
    borderBottomWidth: 1,
    justifyContent: 'flex-end',
    borderBottomColor: '#f0f0f0',
    height: width(60),
    paddingBottom: width(4),
    paddingHorizontal: width(5),
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e0e0e0',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  profileName: {
    fontSize: 18,
    marginTop: 10,
    color: '#000',
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  profileEmail: {
    fontSize: 14,
    color: COLORS.textLight,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    marginTop: 4,
  },
  menuItems: {
    flex: 1,
    marginTop: 20,
  },
  menuWrapper: {
    marginBottom: 15,
    marginHorizontal: 20,
    borderRadius: 14,
    overflow: 'hidden',
  },
  activeMenu: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
  },
  inactiveMenu: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  activeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  inactiveText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  badge: {
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeText: {
    color: '#E31B95',
    fontSize: 12,
    fontWeight: '600',
  },
  badgeInactive: {
    backgroundColor: '#eee',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeTextInactive: {
    color: '#555',
    fontSize: 12,
    fontWeight: '600',
  },
  logoutButton: {
    paddingVertical: 15,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 14,
    backgroundColor: '#FF295D',
  },
  logoutText: {
    fontSize: 16,
    color: '#FFF',
    textAlign: 'center',
    fontWeight: '600',
  },
});
