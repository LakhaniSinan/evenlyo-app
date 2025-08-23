import {Image, Text, TouchableOpacity, View} from 'react-native';
import {width} from 'react-native-dimension';
import {COLORS, fontFamly} from '../../constants';
import useTranslation from '../../hooks/useTranslation';

const AppHeader = ({
  headingText,
  leftIcon,
  onLeftIconPress,
  onRightIconPress,
  rightIcon,
  chatHeaderData,
}) => {
  const {t} = useTranslation();
  return (
    <View
      style={{
        paddingTop: width(10),
      }}>
      <View
        style={{
          backgroundColor: COLORS.backgroundLight,
          height: 73,
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20,
        }}>
        {leftIcon && (
          <TouchableOpacity
            style={{position: 'absolute', left: width(3), top: width(4)}}
            onPress={() => onLeftIconPress()}>
            <Image
              resizeMode="contain"
              style={{width: 40, height: 40}}
              source={leftIcon}
            />
          </TouchableOpacity>
        )}
        <View style={{justifyContent: 'center', flex: 1, alignItems: 'center'}}>
          <Text style={{fontFamily: fontFamly.PlusJakartaSansBold}}>
            {headingText}
          </Text>
        </View>
        {rightIcon && (
          <TouchableOpacity
            style={{position: 'absolute', right: width(3), top: width(4)}}
            onPress={() => onRightIconPress()}>
            <Image
              resizeMode="contain"
              style={{width: 40, height: 40}}
              source={rightIcon}
            />
          </TouchableOpacity>
        )}
        {chatHeaderData && (
          <View
            style={{
              position: 'absolute',
              left: width(15),
              top: width(2),
              zIndex: 99,
              overflow: 'hidden',
              flexDirection: 'row',
              alignItems: 'center',
              width: '70%',
            }}>
            <Image
              resizeMode="cover"
              style={{
                width: 50,
                height: 50,
                borderRadius: 100,
                overflow: 'hidden',
              }}
              source={chatHeaderData.Icon}
            />
            <View style={{flex: 1, padding: 10}}>
              <Text
                style={{
                  fontFamily: fontFamly.PlusJakartaSansBold,
                  fontSize: 12,
                }}>
                {chatHeaderData.name}
              </Text>

              <Text
                style={{
                  fontFamily: fontFamly.PlusJakartaSansSemiRegular,
                  fontSize: 10,
                  color: COLORS.textLight,
                }}>
                {chatHeaderData.lastSeen}
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

export default AppHeader;
