import {useRef} from 'react';
import {FlatList, View} from 'react-native';
import {ICONS} from '../../../assets';
import ActivityLogCard from '../../../components/activityLogCard';
import AppHeader from '../../../components/appHeader';
import CommonAlert from '../../../components/commanAlert';
import {COLORS} from '../../../constants';
import {width} from 'react-native-dimension';

const AllActivityLog = ({route, navigation}) => {
  const data = route.params;
  console.log(data, 'datadatadatadatadatadata');
  const modalRef = useRef(null);

  const renderActivityLog = ({item, index}) => (
    <ActivityLogCard item={item} index={index} dataLength={data?.length} />
  );

  return (
    <View style={{flex: 1, backgroundColor: COLORS.white}}>
      <AppHeader
        headingText={'All Activity Log'}
        leftIcon={ICONS.leftArrowIcon}
        rightIcon={ICONS.notificationIcon}
        onLeftIconPress={() => navigation.goBack()}
        onRightIconPress={() => navigation.navigate('Notifications')}
      />

      <View style={styles.sectionContainer}>
        <FlatList
          data={data}
          renderItem={renderActivityLog}
          keyExtractor={(item, index) => index.toString()}
          ListFooterComponent={<View style={{height: width(20)}} />}
        />
      </View>
      <CommonAlert ref={modalRef} />
    </View>
  );
};

export default AllActivityLog;

const styles = {
  sectionContainer: {
    borderRadius: 12,
  },
};
