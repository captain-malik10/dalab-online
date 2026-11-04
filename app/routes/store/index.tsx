import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useVendorAuth } from '../../hooks/useVendorAuth';
import AuthMessage from '../../components/AuthMessage';
import { apiClient } from '~/api';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, X } from 'lucide-react';

export default function StoreAuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  useEffect(() => {
    const token = localStorage.getItem('vendor_token');
    if (token) {
      apiClient('/vendors/me')
        .then((vendor) => {
          if (vendor && vendor.store_name && typeof vendor.store_name === 'string') {
            const slug = vendor.store_name.toLowerCase().replace(/\s+/g, '-');
            navigate(`/store/${slug}/dashboard`);
          } else {
            console.error('Vendor details response did not include a store name.');
            navigate('/store/dashboard');
          }
        })
        .catch((err) => {
          // Error is handled by the apiClient, which will trigger a logout.
          console.error('Failed to fetch vendor for auto-redirect:', err);
        });
    }
  }, [navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const mode = params.get('mode');
    setIsLogin(mode !== 'register');
    if (mode === 'register') {
      setStep(1);
    } else {
      setStep(0);
    }
  }, [location.search]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [storeName, setStoreName] = useState('');
  const [description, setDescription] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [logo, setLogo] = useState<File | null>(null);
  const [license, setLicense] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [licensePreview, setLicensePreview] = useState<string | null>(null);
  const [licenseFileName, setLicenseFileName] = useState<string | null>(null);
  const [newVendorId, setNewVendorId] = useState<number | null>(null);

  const { login, registerVendorDetails, uploadVendorFiles, loading, error, success } =
    useVendorAuth();

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    fileType: 'logo' | 'license',
  ) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (fileType === 'logo') {
        if (file.type.startsWith('image/')) {
          setLogo(file);
          setLogoPreview(URL.createObjectURL(file));
        }
      } else if (fileType === 'license') {
        setLicense(file);
        if (file.type.startsWith('image/')) {
          setLicensePreview(URL.createObjectURL(file));
          setLicenseFileName(null);
        } else {
          setLicensePreview(null);
          setLicenseFileName(file.name);
        }
      }
    }
  };

  const removeImage = (fileType: 'logo' | 'license') => {
    if (fileType === 'logo') {
      setLogo(null);
      if (logoPreview) {
        URL.revokeObjectURL(logoPreview);
      }
      setLogoPreview(null);
    } else if (fileType === 'license') {
      setLicense(null);
      if (licensePreview) {
        URL.revokeObjectURL(licensePreview);
      }
      setLicensePreview(null);
      setLicenseFileName(null);
    }
  };

  const handleNextStep = async () => {
    try {
      const vendorId = await registerVendorDetails({
        email,
        password,
        store_name: storeName,
        description,
        country,
        city,
        district,
      });
      setNewVendorId(vendorId);
      setStep(2);
    } catch (err) {
      // Error is already set in the hook
      console.error('Step 1 failed:', err);
    }
  };

  const handleSkip = async () => {
    await login({ email, password });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      await login({ email, password });
      return;
    }

    if (!newVendorId) {
      console.error('No new vendor ID found for file upload.');
      return;
    }

    const formData = new FormData();
    if (logo) {
      formData.append('logo', logo);
    }
    if (license) {
      formData.append('license', license);
    }

    try {
      await uploadVendorFiles(newVendorId, formData);
      // After successful upload, log in the user
      await login({ email, password });
    } catch (err) {
      console.error('Step 2 failed:', err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="flex w-3/5 bg-white rounded shadow-lg" style={{ height: '80vh' }}>
        <div className="w-1/3">
          <img
            src="https://i.pinimg.com/1200x/0e/1b/b4/0e1bb4ef2bc1780e486733ff5b8a4993.jpg"
            alt="Auth background"
            className="object-cover w-full h-full rounded-l"
          />
        </div>
        <div className="flex flex-col w-2/3 p-8 relative overflow-hidden">
          <div>
            <Link to="/" className="inline-block mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 text-[var(--color-dark)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h2 className="text-2xl font-bold ">{isLogin ? 'Vendor Login' : 'Become a Vendor'}</h2>
            <p className=" text-gray-600">
              {isLogin ? 'Access your store dashboard.' : 'Create your store and start selling.'}
            </p>

            <AuthMessage message={error || authError} type="error" />
            <AuthMessage message={success} type="success" />
          </div>

          <div className="flex-grow overflow-y-auto my-2 hide-scrollbar">
            <form id="auth-form" onSubmit={handleSubmit} className="my-8 space-y-2 h-full">
              <AnimatePresence mode="wait">
                {!isLogin && step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ x: 300, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -300, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-2"
                  >
                    <div className="space-y-2">
                      <label htmlFor="storeName" className="sr-only">
                        Store Name
                      </label>
                      <input
                        id="storeName"
                        type="text"
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        placeholder="Store Name"
                        className="w-full px-3 py-2 rounded bg-gray-50 text-[var(--color-dark)] shadow-sm"
                        required={!isLogin}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="description" className="sr-only">
                        Description
                      </label>
                      <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Store Description"
                        className="w-full px-3 py-2 rounded h-32 bg-gray-50 text-[var(--color-dark)] shadow-sm"
                      />
                    </div>
                    <div className="flex w-full space-x-2">
                      <div className="w-1/3">
                        <label htmlFor="country" className="sr-only">
                          Country
                        </label>
                        <input
                          id="country"
                          type="text"
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          placeholder="Country"
                          className="w-full px-3 py-2 rounded bg-gray-50 text-[var(--color-dark)] shadow-sm"
                        />
                      </div>
                      <div className="w-1/3">
                        <label htmlFor="city" className="sr-only">
                          City
                        </label>
                        <input
                          id="city"
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="City"
                          className="w-full px-3 py-2 rounded bg-gray-50 text-[var(--color-dark)] shadow-sm"
                        />
                      </div>
                      <div className="w-1/3">
                        <label htmlFor="district" className="sr-only">
                          District
                        </label>
                        <input
                          id="district"
                          type="text"
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                          placeholder="District"
                          className="w-full px-3 py-2 rounded bg-gray-50 text-[var(--color-dark)] shadow-sm"
                        />
                      </div>
                    </div>
                    <div className="flex w-full space-x-2">
                      <div className="w-1/2">
                        <label htmlFor="email" className="sr-only">
                          Email
                        </label>
                        <input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Email"
                          className="w-full px-3 py-2 rounded bg-gray-50 text-[var(--color-dark)] shadow-sm"
                          required
                        />
                      </div>
                      <div className="w-1/2">
                        <label htmlFor="password" className="sr-only">
                          Password
                        </label>
                        <input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Password"
                          className="w-full px-3 py-2 rounded bg-gray-50 text-[var(--color-dark)] shadow-sm"
                          required
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {!isLogin && step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ x: 300, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -300, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-2"
                  >
                    <div className="space-y-2">
                      <div>
                        <label className="block mb-2 text-sm text-gray-900">Store Logo</label>
                        <div className="flex items-center justify-center w-full">
                          <label
                            htmlFor="logo-upload"
                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-200 border-dashed rounded cursor-pointer bg-gray-100 hover:bg-gray-200"
                          >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <UploadCloud className="w-8 h-8 mb-4 text-gray-500" />
                              <p className="mb-2 text-sm text-gray-500">
                                <span className="font-semibold">Click to upload</span> or drag and
                                drop
                              </p>
                            </div>
                            <input
                              id="logo-upload"
                              type="file"
                              className="hidden"
                              onChange={(e) => handleFileChange(e, 'logo')}
                              accept="image/*"
                            />
                          </label>
                        </div>
                        {logoPreview && (
                          <div className="mt-4 relative w-32 h-32">
                            <img
                              src={logoPreview}
                              alt="logo preview"
                              className="h-full w-full object-cover rounded"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage('logo')}
                              className="absolute top-0 right-0 transform -translate-y-1/2 translate-x-1/2 bg-red-600 text-white rounded-full p-1 shadow-lg"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block mb-2 text-sm text-gray-900 dark:text-white">
                          Business License
                        </label>
                        <div className="flex items-center justify-center w-full">
                          <label
                            htmlFor="license-upload"
                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-200 border-dashed rounded cursor-pointer bg-gray-100 hover:bg-gray-200"
                          >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <UploadCloud className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
                              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                <span className="font-semibold">Click to upload</span> or drag and
                                drop
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                PDF, PNG, JPG, GIF
                              </p>
                            </div>
                            <input
                              id="license-upload"
                              type="file"
                              className="hidden"
                              onChange={(e) => handleFileChange(e, 'license')}
                              accept="image/*,application/pdf"
                            />
                          </label>
                        </div>
                        {(licensePreview || licenseFileName) && (
                          <div className="mt-4 relative w-32 h-32">
                            {licensePreview ? (
                              <img
                                src={licensePreview}
                                alt="license preview"
                                className="h-full w-full object-cover rounded"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center bg-gray-100 rounded text-gray-500">
                                <p className="text-sm p-2 break-all">{licenseFileName}</p>
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => removeImage('license')}
                              className="absolute top-0 right-0 transform -translate-y-1/2 translate-x-1/2 bg-red-600 text-white rounded-full p-1 shadow-lg"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {isLogin && (
                <>
                  <div>
                    <label htmlFor="email" className="sr-only">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email"
                      className="w-full px-3 py-2 rounded bg-gray-50 text-[var(--color-dark)] shadow-sm"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="password" className="sr-only">
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full px-3 py-2 rounded bg-gray-50 text-[var(--color-dark)] shadow-sm"
                      required
                    />
                  </div>
                </>
              )}
            </form>
          </div>

          <div className="mt-auto">
            {!isLogin ? (
              <div className="flex gap-4">
                {step === 2 && (
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="w-1/3 py-3 font-bold text-gray-600 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    Skip
                  </button>
                )}
                <button
                  type={step === 1 ? 'button' : 'submit'}
                  onClick={step === 1 ? handleNextStep : undefined}
                  form="auth-form"
                  className="w-full py-3 font-bold text-white bg-[var(--color-primary)] rounded hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Creating store...' : step === 1 ? 'Next' : 'Create Store'}
                </button>
              </div>
            ) : (
              <button
                type="submit"
                form="auth-form"
                className="w-full py-3 font-bold text-white bg-[var(--color-primary)] rounded hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            )}
            <p className="mt-6 text-center">
              {isLogin ? "Don't have a store?" : 'Already have a store?'}{' '}
              <Link
                to={isLogin ? '/store?mode=register' : '/store'}
                className="font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]"
              >
                {isLogin ? 'Become a vendor' : 'Login'}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
