import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import useCategories from './getCategories';
import {getStoredToken} from '../utils/authToken';
import {
  getHomeData,
  getVendorsBySubCategory,
  listingAddToCart,
} from '../services/ListingsItem';

const SUB_CATEGORY_DEBOUNCE_MS = 450;

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
      platformFeePercentage: payload?.saleItems?.platformFeePercentage || 0,
    };
  }

  return {
    bookingItems: payload.bookingItems || [],
    saleItems: payload.saleItems || [],
    otherSaleItemms: payload.otherSaleItemms || [],
    platformFeePercentage: payload?.saleItems?.platformFeePercentage || 0,
  };
};

const useHomeScreen = ({modalRef, navigation, openLogin}) => {
  const subCategoryRequestRef = useRef(0);
  const homeDataRequestRef = useRef(0);

  const {categories, subCategories, fetchCategories, fetchSubCategories} =
    useCategories();

  const [homeData, setHomeData] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [platformFeePercentage, setPlatformFeePercentage] = useState(0);
  const [isFilterVisible, setFilterVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isWishlistLoading, setWishlistLoading] = useState(false);
  const [isSubCategoriesLoading, setSubCategoriesLoading] = useState(false);

  const selectedCategoryId = selectedCategory?._id;
  const selectedSubCategoryId = selectedSubCategory?._id;
  const hasSubCategories =
    Array.isArray(subCategories) && subCategories.length > 0;

  const showError = useCallback(
    message => modalRef.current?.show({status: 'error', message}),
    [modalRef],
  );

  const showAlert = useCallback(
    (status, message) => modalRef.current?.show({status, message}),
    [modalRef],
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
        homeDataRequestRef.current += 1;

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

  const applyHomeResponse = useCallback((homeRes, vendorsRes) => {
    const normalized = normalizeHomePayload(homeRes?.data?.data);
    setHomeData({
      bookingItems: normalized.bookingItems,
      releventVendors: vendorsRes?.data?.data || [],
    });
    setPlatformFeePercentage(normalized.platformFeePercentage);
  }, []);

  const fetchHomeData = useCallback(async () => {
    if (!selectedCategoryId || !selectedSubCategoryId) {
      return;
    }

    const requestId = ++homeDataRequestRef.current;

    try {
      const [homeRes, vendorsRes] = await Promise.all([
        getHomeData({subCategoryId: selectedSubCategoryId}),
        getVendorsBySubCategory(selectedCategoryId),
      ]);

      if (requestId !== homeDataRequestRef.current) {
        return;
      }

      if (homeRes.status === 200 || homeRes.status === 201) {
        applyHomeResponse(homeRes, vendorsRes);
      } else {
        showError(homeRes?.data?.message);
      }
    } catch (err) {
      if (requestId === homeDataRequestRef.current) {
        console.log(err, 'fetchHomeData error');
      }
    }
  }, [selectedCategoryId, selectedSubCategoryId, applyHomeResponse, showError]);

  useEffect(() => {
    if (selectedCategoryId && selectedSubCategoryId) {
      fetchHomeData();
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
    setSelectedSubCategory(null);
    homeDataRequestRef.current += 1;
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCategories();
    setRefreshing(false);
  }, [loadCategories]);

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
        await fetchHomeData();

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
    [fetchHomeData, openLogin, showAlert, showError],
  );

  const onApplyFilters = useCallback(
    async filters => {
      try {
        setFilterVisible(false);

        if (filters?.subCategory) {
          setSelectedSubCategory({_id: filters.subCategory});
        }

        const params = {
          ...(filters?.subCategory && {subCategoryId: filters.subCategory}),
          ...(filters?.lat && {latitude: filters.lat}),
          ...(filters?.lng && {longitude: filters.lng}),
          ...(filters?.startDate && {date: filters.startDate}),
          ...(filters?.radius && {radius: Number(filters.radius)}),
        };

        setRefreshing(true);
        const [homeRes, vendorsRes] = await Promise.all([
          getHomeData(params),
          getVendorsBySubCategory(selectedCategory?._id),
        ]);

        console.log(
          homeRes,
          vendorsRes,
          'homeRes, vendorsReshomeRes, vendorsRes',
        );

        if (homeRes.status === 200 || homeRes.status === 201) {
          const normalized = normalizeHomePayload(homeRes?.data?.data);
          setHomeData({
            bookingItems: normalized.bookingItems,
            saleItems: normalized.saleItems,
            otherSaleItemms: normalized.otherSaleItemms,
            releventVendors: vendorsRes?.data?.data || [],
          });
          setPlatformFeePercentage(normalized.platformFeePercentage);
        } else {
          showError(homeRes?.data?.message);
        }
      } catch (error) {
        console.log(error, 'onApplyFilters error');
      } finally {
        setRefreshing(false);
      }
    },
    [selectedCategory?._id, showError],
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

  return {
    categories,
    subCategories,
    homeData,
    selectedCategory,
    selectedSubCategory,
    setSelectedSubCategory,
    platformFeePercentage,
    hasSubCategories,
    isFilterVisible,
    setFilterVisible,
    refreshing,
    isWishlistLoading,
    isSubCategoriesLoading,
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
