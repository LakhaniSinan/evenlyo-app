import {Image, Text, TouchableOpacity, View} from 'react-native';
import {width} from 'react-native-dimension';
import {ICONS} from '../../assets';
import {COLORS, fontFamly} from '../../constants';
import GradientText from '../gradiantText';

const HeadingComponent = ({rightArrow, heading, gradientText, onPress}) => {
  return (
    <View
      style={{
        height: width(10),
        alignItems: 'center',
        justifyContent: rightArrow ? 'space-between' : 'center',
        paddingHorizontal: 10,
        flexDirection: 'row',
      }}>
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
        }}>
        <Text
          style={{
            fontFamily: fontFamly.PlusJakartaSansBold,
            color: COLORS.textDark,
            fontSize: 16,
            marginRight: 5,
          }}>
          {heading}
        </Text>
        {gradientText && <GradientText text={gradientText} />}
      </View>
      {rightArrow && (
        <TouchableOpacity onPress={onPress}>
          <Image
            source={ICONS.rightIcon}
            resizeMode="contain"
            style={{height: 15, width: 15}}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default HeadingComponent;
