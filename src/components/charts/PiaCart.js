import React, {useCallback, useMemo, useRef, useState} from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';
import {PieChart} from 'react-native-chart-kit';
import {width} from 'react-native-dimension';
import {COLORS, fontFamly} from '../../constants';
import {useTranslation} from '../../hooks';
import {formatEuro} from '../../utils';
import CustomPicker from '../customPicker';

const screenWidth = Dimensions.get('window').width;

const FILTER_MONTHLY = 'Monthly';
const FILTER_SIX_MONTHS = '6 Months';
const FILTER_YEARLY = 'Yearly';

const PIE_CHART_COLORS = [
  '#FF2D87',
  '#3B82F6',
  '#F59E0B',
  '#10B981',
  '#8B5CF6',
  '#F97316',
];

const PieChartComponent = ({
  labelll = 'Orders Overview',
  data = [],
  monthlyData = [],
  loading = false,
}) => {
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

  const selectedFilterLabel =
    filterOptions.find(option => option.name === filterType)?.label ||
    t('chartFilterMonthly');

  const getCategoryDisplayName = useCallback(
    categoryName => {
      if (!categoryName) {
        return t('Unknown');
      }
      if (typeof categoryName === 'string') {
        return categoryName;
      }
      return currentLanguage === 'nl'
        ? categoryName?.nl || categoryName?.en || t('Unknown')
        : categoryName?.en || categoryName?.nl || t('Unknown');
    },
    [currentLanguage, t],
  );

  const activeData = useMemo(() => {
    if (filterType === FILTER_MONTHLY) {
      return monthlyData || [];
    }
    return data;
  }, [data, filterType, monthlyData]);

  const chartData = useMemo(() => {
    if (!activeData?.length) {
      return [];
    }
    return activeData.map((item, index) => ({
      name: getCategoryDisplayName(item.categoryName),
      population: Number(item.totalEarnings) || 0,
      color: PIE_CHART_COLORS[index % PIE_CHART_COLORS.length],
      legendFontColor: '#000',
      legendFontSize: 10,
    }));
  }, [activeData, getCategoryDisplayName]);

  const handleSelectValue = (_, value) => {
    setFilterType(value?.name || value);
  };

  return (
    <View style={{paddingHorizontal: width(2.5)}}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.headerText}>{labelll}</Text>
        <View style={{width: width(40)}}>
          <CustomPicker
            ref={selectSizeRef}
            value={filterType}
            labelll={selectedFilterLabel}
            listData={filterOptions}
            name="filterType"
            handleSelectValue={handleSelectValue}
            dropdownContainerStyle={{backgroundColor: COLORS.white}}
          />
        </View>
      </View>

      {/* Wait for data */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary || '#FF2D87'} />
          <Text style={styles.loaderText}>{t('chartLoadingData')}</Text>
        </View>
      ) : !activeData?.length ? (
        <View style={styles.loaderContainer}>
          <Text style={styles.noDataText}>{t('chartNoDataAvailable')}</Text>
        </View>
      ) : (
        <View style={styles.chartContainer}>
          {/* Left side legend */}
          <View style={styles.legendContainer}>
            {chartData.map((item, index) => (
              <View key={index} style={styles.legendRow}>
                <View
                  style={[styles.legendDot, {backgroundColor: item.color}]}
                />
                <Text style={styles.legendText}>{item.name}</Text>
                <Text style={styles.legendValue}>
                  {formatEuro(item.population, {space: false})}
                </Text>
              </View>
            ))}
          </View>

          {/* Right side chart */}
          <PieChart
            data={chartData}
            width={screenWidth * 0.5}
            height={200}
            chartConfig={{
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="40"
            center={[0, 0]}
            hasLegend={false}
            style={{borderRadius: 16}}
          />
        </View>
      )}
    </View>
  );
};

export default PieChartComponent;

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: width(4),
  },
  headerText: {
    color: COLORS.black,
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  legendContainer: {flex: 1},
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: width(2),
    paddingRight: width(3),
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    flex: 1,
    fontSize: 10,
    color: '#333',
    fontFamily: fontFamly.PlusJakartaSansMedium,
  },
  legendValue: {
    fontSize: 12,
    color: '#000',
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  loaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
  },
  loaderText: {
    marginTop: 10,
    fontSize: 12,
    color: '#666',
    fontFamily: fontFamly.PlusJakartaSansMedium,
  },
  noDataText: {
    color: '#999',
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansMedium,
  },
});
