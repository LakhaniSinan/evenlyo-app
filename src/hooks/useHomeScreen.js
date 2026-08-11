import {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {useSelector} from 'react-redux';

import {
  getHomeData,
  getVendorsBySubCategory,
  listingAddToCart,
} from '../services/ListingsItem';

import {useTranslation} from '../hooks';

import {getStoredToken} from '../utils/authToken';

import useCategories from './getCategories';
import useNotifications from './notifications';

const SUB_CATEGORY_DEBOUNCE_MS = 450;

const EMPTY_HOME_DATA = {
  bookingItems: [],
  saleItems: [],
  otherSaleItemms: [],
  releventVendors: [],
};

const normalizeHomePayload = payload => {
  if (!payload) {
    return {
      bookingItems: [],
      saleItems: [],
      otherSaleItemms: [],
      platformFeePercentage: 0,
    };
  }

  if (Array.isArray(payload)) {
    return {
      bookingItems: payload,
      saleItems: [],
      otherSaleItemms: [],
      platformFeePercentage: 0,
    };
  }

  return {
    bookingItems: payload.bookingItems || [],
    saleItems: payload.saleItems || [],
    otherSaleItemms: payload.otherSaleItemms || [],
    platformFeePercentage: payload?.platformFeePercentage || 0,
  };
};

const useHomeScreen = ({modalRef, navigation, openLogin}) => {
  const {currentLanguage} = useTranslation();
  const {fetchNotifications} = useNotifications();
  const subCategoryRequestRef = useRef(0);
  const homeDataRequestRef = useRef(0);
  const activeFiltersRef = useRef({});
  const currentLanguageRef = useRef(currentLanguage);
  currentLanguageRef.current = currentLanguage;

  const {categories, subCategories, fetchCategories, fetchSubCategories} =
    useCategories();

  const {user} = useSelector(state => state.LoginSlice);

  const [homeData, setHomeData] = useState(EMPTY_HOME_DATA);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [platformFeePercentage, setPlatformFeePercentage] = useState(0);
  const [isFilterVisible, setFilterVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isWishlistLoading, setWishlistLoading] = useState(false);
  const [isSubCategoriesLoading, setSubCategoriesLoading] = useState(false);
  const [isHomeDataLoading, setHomeDataLoading] = useState(false);
  const [homeDataVersion, setHomeDataVersion] = useState(0);

  const selectedCategoryId = selectedCategory?._id;
  const selectedSubCategoryId = selectedSubCategory?._id;

  const hasSubCategories =
    Array.isArray(subCategories) && subCategories.length > 0;

  // Keep localization helpers stable so language change does NOT recreate
  // fetchHomeData/loadCategories and re-trigger background Home refetches.
  const getLocalizedMessage = useCallback(message => {
    if (!message) {
      return '';
    }

    if (typeof message === 'string') {
      return message;
    }

    if (typeof message === 'object') {
      return currentLanguageRef.current === 'nl'
        ? message?.nl || message?.en || ''
        : message?.en || message?.nl || '';
    }

    return String(message);
  }, []);

  const showError = useCallback(
    message =>
      modalRef.current?.show({
        status: 'error',
        message: getLocalizedMessage(message),
      }),
    [modalRef, getLocalizedMessage],
  );

  const showAlert = useCallback(
    (status, message) =>
      modalRef.current?.show({
        status,
        message: getLocalizedMessage(message),
      }),
    [modalRef, getLocalizedMessage],
  );

  const applyHomeResponse = useCallback((homeRes, vendorsRes) => {
    console.log(
      homeRes,
      vendorsRes,
      'homeRes, vendorsReshomeRes, vendorsReshomeRes, vendorsRes',
    );

    const normalized = normalizeHomePayload(homeRes?.data?.data);

    setHomeData({
      bookingItems: normalized.bookingItems,
      releventVendors: vendorsRes?.data?.data || [],
    });
    setPlatformFeePercentage(normalized.platformFeePercentage);
    setHomeDataVersion(version => version + 1);
  }, []);

  const fetchHomeData = useCallback(
    async (categoryId, subCategoryId) => {
      if (!categoryId || !subCategoryId) {
        return;
      }

      const requestId = ++homeDataRequestRef.current;
      console.log(
        'START',
        requestId,
        homeDataRequestRef.current,
        subCategoryId,
      );

      console.log('hellooooooooooo');

      const params = {
        subCategoryId,
        ...activeFiltersRef.current,
      };

      try {
        setHomeDataLoading(true);
        const [homeRes, vendorsRes] = await Promise.all([
          getHomeData(params),
          getVendorsBySubCategory(categoryId, {userId: user?.id}),
        ]);

        console.log(
          homeRes,
          vendorsRes,
          'homeRes, vendorsReshomeRes, vendorsRes',
        );

        if (requestId !== homeDataRequestRef.current) {
          return;
        }

        if (homeRes?.status === 200 || homeRes?.status === 201) {
          console.log('applyHomeResponse');
          applyHomeResponse(homeRes, vendorsRes);
        } else {
          showError(homeRes?.data?.message);
        }
      } catch (err) {
        if (requestId === homeDataRequestRef.current) {
          console.log(err, 'fetchHomeData error');
        }
      } finally {
        if (requestId === homeDataRequestRef.current) {
          setHomeDataLoading(false);
        }
      }
    },
    [user?.id, applyHomeResponse, showError],
  );

  const loadCategories = useCallback(async () => {
    const res = await fetchCategories();

    if (res.success && res.data?.length > 0) {
      setSelectedCategory(res.data[0]);
    } else {
      showError(res.message);
    }
  }, [fetchCategories, showError]);

  useEffect(() => {
    loadCategories();
    fetchNotifications();
  }, [loadCategories]);

  useEffect(() => {
    if (!selectedCategoryId) {
      return undefined;
    }

    let isMounted = true;
    const requestId = ++subCategoryRequestRef.current;

    const loadSubCategories = async () => {
      try {
        setSubCategoriesLoading(true);
        setSelectedSubCategory(null);
        setHomeData(EMPTY_HOME_DATA);

        const subRes = await fetchSubCategories(selectedCategoryId);

        if (!isMounted || requestId !== subCategoryRequestRef.current) {
          return;
        }

        if (subRes?.success && subRes?.data?.length > 0) {
          setSelectedSubCategory(subRes.data[0]);
        } else {
          setSelectedSubCategory(null);
        }
      } catch {
        if (isMounted && requestId === subCategoryRequestRef.current) {
          setSelectedSubCategory(null);
        }
      } finally {
        if (isMounted && requestId === subCategoryRequestRef.current) {
          setSubCategoriesLoading(false);
        }
      }
    };

    const timer = setTimeout(loadSubCategories, SUB_CATEGORY_DEBOUNCE_MS);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [selectedCategoryId, fetchSubCategories]);

  useEffect(() => {
    if (selectedCategoryId && selectedSubCategoryId) {
      fetchHomeData(selectedCategoryId, selectedSubCategoryId);
    }
  }, [selectedCategoryId, selectedSubCategoryId, fetchHomeData]);

  const handleCategorySelect = useCallback(item => {
    const nextId = item?._id || item?.id;

    if (!nextId) {
      return;
    }

    setSelectedCategory(prev => {
      const prevId = prev?._id || prev?.id;
      return nextId === prevId ? prev : item;
    });

    activeFiltersRef.current = {};
    setSelectedSubCategory(null);
    setHomeData(EMPTY_HOME_DATA);
    setPlatformFeePercentage(0);
  }, []);

  const handleSubCategorySelect = useCallback(
    subCategory => {
      const nextId = subCategory?._id || subCategory?.id;
      const currentId = selectedSubCategory?._id || selectedSubCategory?.id;

      if (!nextId || nextId === currentId) {
        return;
      }

      setSelectedSubCategory(subCategory);
      setHomeData(EMPTY_HOME_DATA);
    },
    [selectedSubCategory],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCategories();
    if (selectedCategoryId && selectedSubCategoryId) {
      await fetchHomeData(selectedCategoryId, selectedSubCategoryId);
    }
    setRefreshing(false);
  }, [
    loadCategories,
    selectedCategoryId,
    selectedSubCategoryId,
    fetchHomeData,
  ]);

  const onBookingCardPress = useCallback(
    item => navigation.navigate('EventDetails', item),
    [navigation],
  );

  const onVendorCardPress = useCallback(
    async item => {
      const token = await getStoredToken();

      if (token) {
        navigation.navigate('VendorDetails', {...item, platformFeePercentage});
        return;
      }

      openLogin();
    },
    [navigation, openLogin, platformFeePercentage],
  );

  const handleAddToWishList = useCallback(
    async listingId => {
      const token = await getStoredToken();

      if (!token) {
        openLogin();
        return;
      }

      try {
        setWishlistLoading(true);

        const response = await listingAddToCart({listingId});

        if (selectedCategoryId && selectedSubCategoryId) {
          await fetchHomeData(selectedCategoryId, selectedSubCategoryId);
        }

        if (response.status === 200 || response.status === 201) {
          showAlert('ok', response?.data?.message);
        } else {
          showError(response?.data?.message);
        }
      } catch (error) {
        console.log(error, 'handleAddToWishList error');
      } finally {
        setWishlistLoading(false);
      }
    },
    [
      fetchHomeData,
      openLogin,
      selectedCategoryId,
      selectedSubCategoryId,
      showAlert,
      showError,
    ],
  );

  const onApplyFilters = useCallback(
    filters => {
      setFilterVisible(false);

      activeFiltersRef.current = {
        ...(filters?.lat && {latitude: filters.lat}),
        ...(filters?.lng && {longitude: filters.lng}),
        ...(filters?.startDate && {date: filters.startDate}),
        ...(filters?.radius && {radius: Number(filters.radius)}),
      };

      if (filters?.subCategory) {
        const matchedSubCategory = subCategories.find(
          item => item?._id === filters.subCategory,
        );

        setSelectedSubCategory(
          matchedSubCategory || {_id: filters.subCategory},
        );
        return;
      }

      if (selectedCategoryId && selectedSubCategoryId) {
        setHomeData(EMPTY_HOME_DATA);
        homeDataRequestRef.current += 1;
        fetchHomeData(selectedCategoryId, selectedSubCategoryId);
      }
    },
    [subCategories, selectedCategoryId, selectedSubCategoryId, fetchHomeData],
  );

  const listSections = useMemo(() => {
    const sections = ['header', 'categories'];

    if (hasSubCategories) {
      sections.push('subcategories');
    }

    sections.push(
      'bookingHeading',
      'bookingCards',
      'vendorsHeading',
      'vendors',
    );

    return sections;
  }, [hasSubCategories]);

  const onResetFilters = useCallback(() => {
    activeFiltersRef.current = {};
    if (categories.length > 0 && subCategories.length > 0) {
      const firstSubCategory = subCategories[0];
      setSelectedSubCategory(firstSubCategory);
      fetchHomeData(selectedCategoryId, firstSubCategory._id);
    }
    setFilterVisible(false);
  }, [categories, subCategories, selectedCategoryId, fetchHomeData]);

  return {
    categories,
    subCategories,
    homeData,
    homeDataVersion,
    selectedCategory,
    selectedSubCategory,
    onResetFilters,
    setSelectedSubCategory: handleSubCategorySelect,
    platformFeePercentage,
    hasSubCategories,
    isFilterVisible,
    setFilterVisible,
    refreshing,
    isWishlistLoading,
    isSubCategoriesLoading,
    isHomeDataLoading,
    listSections,
    handleCategorySelect,
    onRefresh,
    onBookingCardPress,
    onVendorCardPress,
    handleAddToWishList,
    onApplyFilters,
  };
};

export default useHomeScreen;
