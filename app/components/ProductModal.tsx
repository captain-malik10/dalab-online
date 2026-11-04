import React, { useState, useEffect, useCallback } from 'react';
import { X, UploadCloud, Loader2 } from 'lucide-react';
import useApi from '~/hooks/useApi';
import type { Product, Category } from '~/types';

interface ProductModalProps {
  mode: 'new' | 'edit';
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  onSave: (formData: FormData, productId?: number) => Promise<void>;
}

export default function ProductModal({
  mode,
  isOpen,
  onClose,
  product,
  onSave,
}: ProductModalProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [stock, setStock] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [discount, setDiscount] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [pastedImageUrls, setPastedImageUrls] = useState('');

  const { data: categories, error: categoriesError } = useApi<Category[]>('/categories');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && product) {
        setName(product.name || '');
        setPrice(product.price ? String(product.price) : '');
        setDescription(product.description || '');
        setCategoryId(product.category_id ? String(product.category_id) : '');
        setStock(product.stock ? String(product.stock) : '');
        setIsFeatured(product.isFeatured || false);
        setDiscount(product.discount ? String(product.discount) : '');
        let urls: string[] = [];
        if (typeof product.image_urls === 'string') {
          try {
            urls = JSON.parse(product.image_urls);
          } catch (error) {
            console.error('Error parsing image_urls:', error);
          }
        } else if (Array.isArray(product.image_urls)) {
          urls = product.image_urls;
        }
        setExistingImageUrls(urls);
        setImages([]);
        setImagePreviews([]);
      } else {
        setName('');
        setPrice('');
        setDescription('');
        setCategoryId('');
        setStock('');
        setIsFeatured(false);
        setDiscount('');
        setImages([]);
        setImagePreviews([]);
        setExistingImageUrls([]);
      }
      setPastedImageUrls('');
      setError(null);
    }
  }, [mode, product, isOpen]);

  useEffect(() => {
    if (categoriesError) {
      console.error('Failed to fetch categories:', categoriesError);
      setError('Failed to load categories. Please try again.');
    }
  }, [categoriesError]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files).filter((file) =>
        file.type.startsWith('image/'),
      );
      setImages((prev) => [...prev, ...newFiles]);

      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setImagePreviews((prev) => {
      const newPreviews = [...prev];
      URL.revokeObjectURL(newPreviews[index]);
      newPreviews.splice(index, 1);
      return newPreviews;
    });
    setImages((prev) => {
      const newImages = [...prev];
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const removeExistingImage = (url: string) => {
    setExistingImageUrls((prev) => prev.filter((u) => u !== url));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', price);
    formData.append('description', description);
    formData.append('category_id', categoryId);
    formData.append('stock', stock);
    formData.append('isFeatured', isFeatured ? '1' : '0');
    if (isFeatured) {
      formData.append('discount', discount);
    }
    images.forEach((image) => {
      formData.append('images', image);
    });
    if (pastedImageUrls.trim()) {
      formData.append('imageUrls', pastedImageUrls);
    }

    if (mode === 'edit') {
      formData.append('existingImageUrls', JSON.stringify(existingImageUrls));
    }

    try {
      await onSave(formData, product?.id);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Cleanup object URLs
    return () => {
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [imagePreviews]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded shadow-xl w-full max-w-2xl max-h-[95vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg text-gray-900">
            {mode === 'new' ? 'Add New Product' : 'Edit Product'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded text-sm p-1.5 ml-auto inline-flex items-center"
          >
            <X size={20} />
            <span className="sr-only">Close modal</span>
          </button>
        </div>

        <form
          id="product-form"
          onSubmit={handleSubmit}
          className="p-6 flex-grow overflow-y-auto hide-scrollbar"
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block mb-2 text-sm text-gray-900">
                Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              />
            </div>

            <div>
              <label htmlFor="category" className="block mb-2 text-sm text-gray-900">
                Category
              </label>
              <select
                id="category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              >
                <option value="">Select a category</option>
                {categories &&
                  categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label htmlFor="description" className="block mb-2 text-sm text-gray-900">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              ></textarea>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="price" className="block mb-2 text-sm text-gray-900">
                  Price
                </label>
                <input
                  type="number"
                  id="price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  min="0"
                  step="0.01"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                />
              </div>
              <div>
                <label htmlFor="stock" className="block mb-2 text-sm text-gray-900">
                  Stock
                </label>
                <input
                  type="number"
                  id="stock"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  required
                  min="0"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label htmlFor="isFeatured" className="block mb-2 text-sm text-gray-900">
                  Featured
                </label>
                <select
                  id="isFeatured"
                  value={isFeatured.toString()}
                  onChange={(e) => setIsFeatured(e.target.value === 'true')}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm text-gray-900">Product Images</label>
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="dropzone-file"
                  className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded cursor-pointer bg-gray-50 hover:bg-gray-100"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className="w-8 h-8 mb-4 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                  <input
                    id="dropzone-file"
                    type="file"
                    className="hidden"
                    multiple
                    onChange={handleFileChange}
                    accept="image/*"
                  />
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="imageUrls" className="block mb-2 text-sm text-gray-900">
                Or paste image URLs (one per line)
              </label>
              <textarea
                id="imageUrls"
                value={pastedImageUrls}
                onChange={(e) => setPastedImageUrls(e.target.value)}
                rows={2}
                placeholder="https://example.com/photo.jpg"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              ></textarea>
            </div>

            {(existingImageUrls.length > 0 || imagePreviews.length > 0) && (
              <div className="flex flex-wrap gap-2">
                {existingImageUrls.map((url) => (
                  <div key={url} className="relative w-10 h-10 group">
                    <img
                      src={url}
                      alt="existing product"
                      className="w-10 h-10 object-cover rounded"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => removeExistingImage(url)}
                        className="text-white rounded-full p-1"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                ))}

                {imagePreviews.map((preview, index) => (
                  <div key={preview} className="relative w-10 h-10 group">
                    <img
                      src={preview}
                      alt={`preview ${index}`}
                      className="w-10 h-10 object-cover rounded"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="text-white rounded-full p-1"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>

        <div className="flex items-center justify-end p-4 border-t border-gray-200 rounded-b">
          {error && <div className="text-red-500 text-sm mr-auto">{error}</div>}
          <button
            onClick={onClose}
            type="button"
            className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded border border-gray-200 text-sm px-5 py-2.5 hover:text-gray-900 focus:z-10"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="product-form"
            disabled={loading}
            className="ml-3 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded text-sm px-5 py-2.5 text-center disabled:opacity-50 flex items-center"
          >
            {loading && <Loader2 className="animate-spin mr-2" size={16} />}
            {loading ? 'Saving' : mode === 'new' ? 'Add product' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
