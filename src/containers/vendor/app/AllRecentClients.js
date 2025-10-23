import {FlatList, View} from 'react-native';
import {ICONS} from '../../../assets';
import AppHeader from '../../../components/appHeader';
import RecentClientsCard from '../../../components/recentClientsCard';
import {COLORS} from '../../../constants';

const AllRecentClients = ({route, navigation}) => {
  const data = route.params;
  const renderItem = ({item, index}) => {
    return (
      <RecentClientsCard item={item} index={index} dataLength={data.length} />
    );
  };
  return (
    <View style={{flex: 1, backgroundColor: COLORS.white}}>
      <AppHeader
        headingText={'All Recent clients'}
        leftIcon={ICONS.leftArrowIcon}
        rightIcon={ICONS.notificationIcon}
        onLeftIconPress={() => {
          navigation.goBack();
        }}
        onRightIconPress={() => {
          navigation.navigate('Notifications');
        }}
      />
      <FlatList data={data} renderItem={renderItem} />
    </View>
  );
};

export default AllRecentClients;
