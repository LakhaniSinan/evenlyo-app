import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import BookingItems from '../../containers/vendor/app/BookingItems';
import ChatDetails from '../../containers/vendor/app/ChatDetails';
import CreateCustomOffer from '../../containers/vendor/app/CreateCustomOffre';
import OfferPreviewScreen from '../../containers/vendor/app/OfferPreviewScreen';

const Stack = createStackNavigator();

const ChatFlowStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="ChatDetails"
      screenOptions={{
        headerShown: false,
        cardStyle: {backgroundColor: '#FFFFFF'},
      }}>
      <Stack.Screen name="ChatDetails" component={ChatDetails} />
      <Stack.Screen name="CreateCustomOffer" component={CreateCustomOffer} />
      <Stack.Screen name="BookingItems" component={BookingItems} />
      <Stack.Screen name="OfferPreview" component={OfferPreviewScreen} />
    </Stack.Navigator>
  );
};

export default ChatFlowStack;
