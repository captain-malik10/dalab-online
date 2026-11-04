import useApi from './useApi';

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string;
}

const useStoreProducts = () => {
  return useApi<Product[]>('/vendors/products');
};

export default useStoreProducts;
