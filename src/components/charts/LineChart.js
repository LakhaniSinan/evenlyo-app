import moment from 'moment';
import React, {useMemo, useRef, useState} from 'react';
import {ScrollView, Text, View} from 'react-native';
import {LineChart} from 'react-native-chart-kit';
import {width} from 'react-native-dimension';
import {COLORS, fontFamly} from '../../constants';
import CustomPicker from '../customPicker';

const LineChartComponent = ({labelll = 'Overview', data = []}) => {
  const selectSizeRef = useRef();
  const [filterType, setFilterType] = useState('Monthly');

  const monthLabels = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  // 🧠 Detect data type dynamically
  const isEarnings = data?.some(item => item.totalEarnings !== undefined);
  const valueKey = isEarnings ? 'totalEarnings' : 'totalOrders';
  const chartLabel = isEarnings ? 'Earnings Overview' : 'Orders Overview';

  const filteredData = useMemo(() => {
    let labels = [];
    let dataset = [];

    if (filterType === 'Monthly') {
      // 🗓 Daily breakdown for current month
      const daysInMonth = moment().daysInMonth();
      labels = Array.from({length: daysInMonth}, (_, i) => (i + 1).toString());

      dataset = labels.map(day => {
        const dateStr = moment().date(day).format('YYYY-MM-DD');
        const found = data.find(
          item => moment(item.date).format('YYYY-MM-DD') === dateStr,
        );
        return found ? found[valueKey] || 0 : 0;
      });
    } else if (filterType === '6 Months') {
      // 🗓 Last 6 months data
      const last6 = data?.slice(-6) || [];
      labels = monthLabels.slice(-6);
      dataset = last6.map(item => item[valueKey] || 0);
    } else if (filterType === 'Yearly') {
      // 🗓 Full 12-month overview
      labels = monthLabels;
      dataset = data?.map(item => item[valueKey] || 0);
    }

    return {
      labels,
      datasets: [
        {
          data: dataset,
          color: (opacity = 1) => `rgba(255, 41, 93, ${opacity})`,
          strokeWidth: 3,
        },
      ],
    };
  }, [filterType, data]);

  const chartConfig = {
    backgroundGradientFrom: COLORS.backgroundLight,
    backgroundGradientTo: COLORS.backgroundLight,
    decimalPlaces: isEarnings ? 2 : 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    propsForDots: {
      r: '5',
      strokeWidth: '2',
      stroke: '#FF295D',
    },
    fillShadowGradient: '#FF295D',
    fillShadowGradientOpacity: 0.2,
  };

  const handleSelectValue = (_, value) => {
    setFilterType(value?.name || value);
  };

  const chartWidth =
    filterType === 'Monthly'
      ? Math.max(width(89), 40 * moment().daysInMonth())
      : width(100);

  return (
    <View style={{paddingHorizontal: width(2.5)}}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <Text
          style={{
            color: COLORS.black,
            fontSize: 14,
            fontFamily: fontFamly.PlusJakartaSansBold,
          }}>
          {chartLabel}
        </Text>

        <View style={{width: width(40)}}>
          <CustomPicker
            ref={selectSizeRef}
            labelll={'Orders Overview'}
            value={filterType}
            listData={[{name: 'Monthly'}, {name: '6 Months'}, {name: 'Yearly'}]}
            name="filterType"
            handleSelectValue={handleSelectValue}
            dropdownContainerStyle={{backgroundColor: COLORS.white}}
          />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          marginLeft: isEarnings ? -width(1) : -width(10),
          paddingBottom: width(2),
        }}>
        <LineChart
          data={filteredData}
          width={chartWidth}
          height={250}
          chartConfig={chartConfig}
          bezier
          style={{
            borderRadius: 16,
            marginHorizontal: width(1.5),
          }}
        />
      </ScrollView>
    </View>
  );
};

export default LineChartComponent;
