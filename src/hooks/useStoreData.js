import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { categories, products } from '../data/mockData';

const useStoreData = () => {
  const [categoriesData, setCategoriesData] = useState(categories);
  const [productsData, setProductsData] = useState(products);

  useEffect(() => {
    const unsubscribeCategories = onSnapshot(
      collection(db, 'categories'),
      (snapshot) => {
        const categoriesList = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
        setCategoriesData(categoriesList.length ? categoriesList : categories);
      },
      (error) => {
        console.error('Error listening to categories from Firestore:', error);
      }
    );

    const unsubscribeProducts = onSnapshot(
      collection(db, 'products'),
      (snapshot) => {
        const productsList = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
        setProductsData(productsList.length ? productsList : products);
      },
      (error) => {
        console.error('Error listening to products from Firestore:', error);
      }
    );

    return () => {
      unsubscribeCategories();
      unsubscribeProducts();
    };
  }, []);

  return { categories: categoriesData, products: productsData };
};

export default useStoreData;
