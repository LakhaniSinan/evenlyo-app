import {useCallback, useState} from 'react';
import {getCategories, getSubCategories} from '../services/Categories';

const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔹 Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getCategories();
      if (res.status === 200 || res.status === 201) {
        setCategories(res.data?.data || []);
        return {success: true, data: res.data?.data};
      } else {
        return {success: false, message: res.data?.message};
      }
    } catch (error) {
      console.log('fetchCategories error:', error);
      return {success: false, message: 'Something went wrong'};
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔹 Fetch subcategories
  const fetchSubCategories = useCallback(async categoryId => {
    if (!categoryId) {
      setSubCategories([]);
      return {success: false, message: 'Category is required'};
    }

    try {
      const res = await getSubCategories(categoryId);
      if (res.status === 200 || res.status === 201) {
        const subCategoriesData = res.data?.data || [];
        setSubCategories(subCategoriesData);
        return {success: true, data: subCategoriesData};
      }

      setSubCategories([]);
      return {success: false, message: res.data?.message};
    } catch (error) {
      console.log('fetchSubCategories error:', error);
      setSubCategories([]);
      return {success: false, message: 'Something went wrong'};
    }
  }, []);

  return {
    categories,
    subCategories,
    loading,
    setLoading,
    fetchCategories,
    fetchSubCategories,
    setCategories,
    setSubCategories,
  };
};

export default useCategories;
