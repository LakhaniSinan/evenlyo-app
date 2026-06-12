import moment from 'moment';
import 'moment/locale/nl';
import React, {useMemo, useRef, useState} from 'react';
import {ScrollView, Text, View} from 'react-native';
import {LineChart} from 'react-native-chart-kit';
import {width} from 'react-native-dimension';
import {COLORS, fontFamly} from '../../constants';
import {useTranslation} from '../../hooks';
import CustomPicker from '../customPicker';

const FILTER_MONTHLY = 'Monthly';
const FILTER_SIX_MONTHS = '6 Months';
const FILTER_YEARLY = 'Yearly';

const toChartNumber = value => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const alignChartSeries = (labels, values) => {
  const length = Math.max(labels.length, values.length, 2);
  const alignedLabels = Array.from({length}, (_, index) => labels[index] ?? '');
  const alignedValues = Array.from({length}, (_, index) =>
    toChartNumber(values[index]),
  );

  return {labels: alignedLabels, values: alignedValues};
};

const getMonthSeries = (count, locale) =>
  Array.from({length: count}, (_, index) => {
    const monthMoment = moment().subtract(count - 1 - index, 'months');
    return {
      month: monthMoment.month() + 1,
      label: monthMoment.locale(locale).format('MMM'),
    };
  });

const LineChartComponent = ({data = []}) => {
  const {t, currentLanguage} = useTranslation();
  const selectSizeRef = useRef();
  const [filterType, setFilterType] = useState(FILTER_MONTHLY);

  const filterOptions = useMemo(
    () => [
      {name: FILTER_MONTHLY, label: t('chartFilterMonthly')},
      {name: FILTER_SIX_MONTHS, label: t('chartFilterSixMonths')},
      {name: FILTER_YEARLY, label: t('chartFilterYearly')},
    ],
    [t, currentLanguage],
  );

  const monthLabels = useMemo(() => {
    const locale = currentLanguage === 'nl' ? 'nl' : 'en';
    return Array.from({length: 12}, (_, i) =>
      moment().month(i).locale(locale).format('MMM'),
    );
  }, [currentLanguage]);

  const isEarnings = data?.some(item => item.totalEarnings !== undefined);
  const valueKey = isEarnings ? 'totalEarnings' : 'totalOrders';
  const chartLabel = isEarnings
    ? t('Earnings Overview')
    : t('Orders Overview');

  const filteredData = useMemo(() => {
    const locale = currentLanguage === 'nl' ? 'nl' : 'en';
    let labels = [];
    let dataset = [];
    const dailySource = (data || []).filter(item => item?.date);
    const monthlySource = (data || []).filter(item => item?.month != null);
    const hasMonthField = monthlySource.length > 0;
    const currentMonthStart = moment().startOf('month');
    const currentMonthEnd = moment().endOf('month');

    if (filterType === FILTER_MONTHLY) {
      const daysInMonth = moment().daysInMonth();
      labels = Array.from({length: daysInMonth}, (_, i) => (i + 1).toString());

      dataset = labels.map(day => {
        const dateStr = moment()
          .startOf('month')
          .date(day)
          .format('YYYY-MM-DD');
        const found = dailySource.find(
          item =>
            item?.date &&
            moment(item.date).format('YYYY-MM-DD') === dateStr &&
            moment(item.date).isBetween(
              currentMonthStart,
              currentMonthEnd,
              'day',
              '[]',
            ),
        );
        return toChartNumber(found?.[valueKey]);
      });
    } else if (filterType === FILTER_SIX_MONTHS) {
      const lastSixMonths = getMonthSeries(6, locale);
      labels = lastSixMonths.map(item => item.label);
      dataset = lastSixMonths.map(({month}, index) => {
        const found = hasMonthField
          ? monthlySource.find(item => item.month === month)
          : data?.[Math.max(0, data.length - 6) + index];
        return toChartNumber(found?.[valueKey]);
      });
    } else if (filterType === FILTER_YEARLY) {
      labels = monthLabels;
      dataset = monthLabels.map((_, index) => {
        const month = index + 1;
        const found = hasMonthField
          ? monthlySource.find(item => item.month === month)
          : data[index];
        return toChartNumber(found?.[valueKey]);
      });
    }

    const {labels: safeLabels, values: safeValues} = alignChartSeries(
      labels,
      dataset,
    );

    return {
      labels: safeLabels,
      datasets: [
        {
          data: safeValues,
          color: (opacity = 1) => `rgba(255, 41, 93, ${opacity})`,
          strokeWidth: 3,
        },
      ],
    };
  }, [filterType, data, monthLabels, valueKey, currentLanguage]);

  const chartValues = filteredData.datasets[0]?.data || [];
  const canUseBezier =
    chartValues.length >= 2 &&
    Math.max(...chartValues) !== Math.min(...chartValues);

  const chartAxisConfig = useMemo(() => {
    const maxValue = Math.max(...chartValues, 0);
    const seenLabels = new Set();

    const formatYLabel = label => {
      const normalized = isEarnings
        ? label
        : String(Math.round(Number(label)));
      if (seenLabels.has(normalized)) {
        return '';
      }
      seenLabels.add(normalized);
      return normalized;
    };

    if (isEarnings) {
      return {segments: 4, formatYLabel};
    }

    if (maxValue <= 0) {
      return {segments: 1, formatYLabel};
    }

    if (maxValue <= 6) {
      return {segments: Math.ceil(maxValue), formatYLabel};
    }

    return {segments: 4, formatYLabel};
  }, [chartValues, isEarnings]);

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

  const selectedFilterLabel =
    filterOptions.find(option => option.name === filterType)?.label ||
    t('chartFilterMonthly');

  const chartWidth =
    filterType === FILTER_MONTHLY
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
            labelll={selectedFilterLabel}
            value={filterType}
            listData={filterOptions}
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
          segments={chartAxisConfig.segments}
          formatYLabel={chartAxisConfig.formatYLabel}
          fromZero
          bezier={canUseBezier}
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
