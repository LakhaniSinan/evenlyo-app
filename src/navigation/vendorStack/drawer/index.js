import {createDrawerNavigator} from '@react-navigation/drawer';
import VendorBottomTabStack from '../BottomTabStack';
import CustomerCustomDrawer from './CustomDrawer';
import AnalyticsReport from '../../../containers/vendor/app/AnalyticsScreen';

const Drawer = createDrawerNavigator();

function CustomerDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={props => <CustomerCustomDrawer {...props} />}
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
      }}>
      <Drawer.Screen name="Dashboard" component={VendorBottomTabStack} />
    </Drawer.Navigator>
  );
}

export default CustomerDrawer;
