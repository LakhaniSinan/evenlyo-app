import React, {useRef} from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {width} from 'react-native-dimension';
import {useDispatch, useSelector} from 'react-redux';

const CustomerCustomDrawer = ({navigation}) => {
  const dispatch = useDispatch();
  const {user} = useSelector(state => state.LoginSlice);
  console.log(user, 'useruseruseruserF');

  const logoutRef = useRef();

  const iconsToRender = [
    {
      label: 'Dashboard',
      onPress: () => navigation.navigate('Dashboard'),
    },
    {
      label: 'Analytic & Report',
      onPress: () =>
        navigation.navigate('Dashboard', {
          screen: 'Home',
          params: {screen: 'AnalyticsReport'},
        }),
    },
    {
      label: 'Message',
      onPress: () => navigation.navigate('MessageScreen'),
    },
  ];

  return (
    <View style={styles.drawerContent}>
      <View style={styles.profileSection}>
        <Image
          source={{
            uri: user?.jobSeekerDetails?.image || user?.userDetails?.image,
          }}
          style={styles.profileImage}
        />
        {user?.userDetails?.fullname ||
          (user?.userDetails?.firstname && (
            <Text style={styles.profileName}>
              {user?.userDetails?.fullname || user?.userDetails?.firstname}
            </Text>
          ))}
        {user?.userDetails?.contact && (
          <Text
            style={{
              fontSize: 16,
            }}>
            +{user?.userDetails?.contact}
          </Text>
        )}
        <Text
          style={{
            fontSize: 16,
          }}>
          {user?.userDetails?.email}
        </Text>
      </View>

      <View style={styles.menuItems}>
        {iconsToRender.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}>
            <Text style={styles.menuText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={async () => {}}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CustomerCustomDrawer;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawerContent: {
    flex: 1,
  },
  profileSection: {
    borderBottomWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomColor: '#f0f0f0',
    paddingVertical: width(10),
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
    color: '#000000',
  },
  menuItems: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: width(2),
    paddingHorizontal: 35,
  },
  menuText: {
    marginTop: width(2),
    fontSize: 16,
    marginLeft: 15,
    color: '#000000',
  },
  logoutButton: {
    paddingVertical: 13,
  },
  logoutText: {
    fontSize: 16,
    marginLeft: 15,
    color: '#FFF',
    textAlign: 'center',
  },
});
