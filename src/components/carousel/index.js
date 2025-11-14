import React, {useState} from 'react';
import {Image, StyleSheet, View} from 'react-native';
import {width} from 'react-native-dimension';
import Carousel from 'react-native-snap-carousel';
import {COLORS} from '../../constants';

const CarouselComponent = ({data}) => {
  const [activeSlide, setActiveSlide] = useState(0);

  const renderIndicators = () => {
    return (
      <View style={styles.indicatorContainer}>
        {data?.map((_, index) => {
          const isActive = index === activeSlide;
          return (
            <View
              key={index}
              style={{
                padding: isActive ? width(1) : 0,
                paddingVertical: isActive ? width(2) : 0,
                borderWidth: isActive ? 1 : 0,
                borderRadius: 100,
                borderColor: COLORS.black,
              }}>
              <View
                style={{
                  height: 7,
                  width: 7,
                  backgroundColor: COLORS.black,
                  borderRadius: 10,
                  marginHorizontal: width(1),
                }}
              />
            </View>
          );
        })}
      </View>
    );
  };

  const renderItem = ({item}) => {
    return (
      <View style={styles.card}>
        <Image source={{uri: item}} resizeMode="cover" style={styles.image} />
        <View style={styles.indicatorWrapper}>{renderIndicators()}</View>
      </View>
    );
  };

  return (
    <View>
      <Carousel
        data={data || []}
        renderItem={renderItem}
        sliderWidth={width(100)}
        itemWidth={width(100)}
        containerCustomStyle={{
          margin: width(5),
        }}
        onSnapToItem={index => setActiveSlide(index)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    height: width(80),
    backgroundColor: COLORS.white,
    width: width(85),
    margin: width(2),
    borderRadius: width(5),
    overflow: 'hidden',
  },
  image: {
    height: '100%',
    width: '100%',
  },
  indicatorWrapper: {
    zIndex: 999,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: width(5),
    marginBottom: width(5),
  },
});

export default CarouselComponent;
