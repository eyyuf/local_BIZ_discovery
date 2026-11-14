import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Phone,
  Globe,
  Clock,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Loader2,
  Navigation,
  Sparkles,
  Tag,
} from 'lucide-react';
import placesApi from '@/modules/places/api/placesApi';
import discoveryApi from '@/modules/discovery/api/discoveryApi';
import { LeafletMap } from '@/shared/map/LeafletMap';
import { PLACE_PLACEHOLDER } from '@/shared/utils/placeImages';

const DAYS_OF_WEEK = [
  { index: 1, name: 'Monday' },
  { index: 2, name: 'Tuesday' },
  { index: 3, name: 'Wednesday' },
  { index: 4, name: 'Thursday' },
  { index: 5, name: 'Friday' },
  { index: 6, name: 'Saturday' },
  { index: 0, name: 'Sunday' },
];

export function BusinessCreatePage() {
  const navigate = useNavigate();

  // Categories list
  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    website: '',
    latitude: '',
    longitude: '',
    categoryId: '',
  });

  // Operating Hours State (Default Mon-Sat 08:00 - 22:00, Sun 10:00 - 20:00)
  const [schedule, setSchedule] = useState(
    DAYS_OF_WEEK.map((day) => ({
      day_of_week: day.index,
      name: day.name,
      is_open: true,
      opens_at: day.index === 0 ? '10:00' : '08:00',
      closes_at: day.index === 0 ? '20:00' : '22:00',
    }))
  );

  // Photo State
  const fileInputRef = useRef(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Geolocation State
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState(null);
  const [geoSuccess, setGeoSuccess] = useState(null);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState('');
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchCategories() {
      setIsLoadingCategories(true);
      try {
        const cats = await discoveryApi.getCategories();
        if (isMounted) {
          // Flatten root and child categories
          const flat = [];
          (cats || []).forEach((c) => {
            flat.push(c);
            if (Array.isArray(c.children)) {
              c.children.forEach((child) => flat.push(child));
            }
          });
          setCategories(flat);
        }
      } catch (err) {
        console.warn('Failed to load categories', err);
      } finally {
        if (isMounted) setIsLoadingCategories(false);
      }
    }
    fetchCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  // Geolocation handler - User explicit click only
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser. Please enter coordinates manually.');
      return;
    }

    setGeoLoading(true);
    setGeoError(null);
    setGeoSuccess(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        setFormData((prev) => ({
          ...prev,
          latitude: String(lat),
          longitude: String(lng),
        }));
        setGeoLoading(false);
        setGeoSuccess(
          `GPS location acquired (${lat}, ${lng}). Please verify the map pin accurately matches your venue.`
        );
      },
      (error) => {
        setGeoLoading(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGeoError('Location permission denied. Please allow location access or enter coordinates manually.');
            break;
          case error.POSITION_UNAVAILABLE:
            setGeoError('GPS position unavailable. Please enter coordinates manually.');
            break;
          case error.TIMEOUT:
            setGeoError('Location request timed out. Please try again or enter coordinates manually.');
            break;
          default:
            setGeoError('Could not obtain current location. Please enter coordinates manually.');
            break;
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleMapLocationSelect = (coords) => {
    if (coords && coords.lat !== undefined && coords.lng !== undefined) {
      setFormData((prev) => ({
        ...prev,
        latitude: String(coords.lat),
        longitude: String(coords.lng),
      }));
      setGeoSuccess(`Pin placed at: ${coords.lat}, ${coords.lng}.`);
      setGeoError(null);
    }
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormError('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormError('Photo size must be under 5MB.');
      return;
    }

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setFormError(null);
  };

  const handleRemovePhoto = () => {
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleScheduleChange = (dayIndex, field, value) => {
    setSchedule((prev) =>
      prev.map((item) =>
        item.day_of_week === dayIndex ? { ...item, [field]: value } : item
      )
    );
  };

  const handleApplyPresetHours = () => {
    setSchedule((prev) =>
      prev.map((item) => ({
        ...item,
        is_open: item.day_of_week !== 0,
        opens_at: '08:30',
        closes_at: '22:00',
      }))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setFormError('Business name is required.');
      return;
    }
    if (!formData.address.trim()) {
      setFormError('Physical address is required.');
      return;
    }
    if (!formData.phone.trim()) {
      setFormError('Contact phone number is required.');
      return;
    }

    // Coordinates validation
    let latNum = undefined;
    let lngNum = undefined;
    if (formData.latitude) {
      latNum = parseFloat(formData.latitude);
      if (isNaN(latNum) || latNum < -90 || latNum > 90) {
        setFormError('Latitude must be a valid number between -90 and 90.');
        return;
      }
    }
    if (formData.longitude) {
      lngNum = parseFloat(formData.longitude);
      if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
        setFormError('Longitude must be a valid number between -180 and 180.');
        return;
      }
    }
    if ((latNum !== undefined && lngNum === undefined) || (latNum === undefined && lngNum !== undefined)) {
      setFormError('Both latitude and longitude must be provided together, or leave both empty.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    setSubmitStep('Creating business profile...');

    try {
      // 1. Create Place
      const payload = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        phone: formData.phone.trim(),
        website: formData.website.trim() || undefined,
        description: formData.description.trim() || undefined,
        latitude: latNum,
        longitude: lngNum,
        is_active: true,
      };

      if (formData.categoryId) {
        payload.category_ids = [parseInt(formData.categoryId, 10)];
      }

      const res = await placesApi.createOwnerPlace(payload);
      const newPlace = res.data || res;
      const placeId = newPlace.id;

      // 2. Upload Cover Photo if selected
      let photoUploadError = null;
      if (imageFile && placeId) {
        setSubmitStep('Uploading venue cover photography to Cloudinary...');
        try {
          await placesApi.uploadPlaceImage(placeId, imageFile, true);
        } catch (imgErr) {
          console.warn('Cover photo upload failed during registration', imgErr);
          photoUploadError = imgErr.response?.data?.message || 'Cover photo upload failed.';
        }
      }

      // 3. Save Operating Hours
      const activeHours = schedule
        .filter((d) => d.is_open && d.opens_at && d.closes_at)
        .map((d) => ({
          day_of_week: d.day_of_week,
          opens_at: d.opens_at.slice(0, 5),
          closes_at: d.closes_at.slice(0, 5),
        }));

      if (activeHours.length > 0 && placeId) {
        setSubmitStep('Configuring operating schedule...');
        try {
          await placesApi.updateOperatingHours(placeId, activeHours);
        } catch (schedErr) {
          console.warn('Operating hours sync error', schedErr);
        }
      }

      // 4. Redirect to full business dashboard with accurate status
      navigate(`/profile/businesses/${placeId}`, {
        state: {
          welcomeMessage: photoUploadError
            ? `Listing registered, but cover photo upload failed (${photoUploadError}). You can upload photos directly in the Photos tab.`
            : `Welcome! "${newPlace.name}" has been registered successfully.`,
          photoFailed: Boolean(photoUploadError),
        },
      });
    } catch (err) {
      console.error('Failed to register business', err);
      const msg = err.response?.data?.message || err.response?.data?.error;
      setFormError(msg || 'Could not register business. Please check details and try again.');
      setIsSubmitting(false);
      setSubmitStep('');
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0C] text-[#F5F2EA] pb-24 pt-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/profile?tab=businesses"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#AAA69C] hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Businesses Overview</span>
          </Link>

          <span className="text-xs font-mono text-[#AAA69C] uppercase tracking-wider">
            Step 1 of 1: Venue Registration
          </span>
        </div>

        {/* Page Heading */}
        <div className="space-y-2 border-b border-white/[0.08] pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-xs font-mono text-[#AAA69C]">
            <Building2 className="w-3.5 h-3.5" />
            <span>Register New Business Spot</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white font-display tracking-tight">
            Launch Your Local Spot
          </h1>
          <p className="text-xs sm:text-sm text-[#AAA69C] max-w-2xl leading-relaxed">
            Register your restaurant, traditional kitchen, specialty cafe, bakery, or hotel. Once created, your venue is immediately indexed across search, interactive maps, and community discovery.
          </p>
        </div>

        {/* Top Error Alert */}
        {formError && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* SECTION 1: Basic Information */}
          <div className="p-5 sm:p-7 rounded-2xl bg-[#151518] border border-white/[0.08] space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
              <div>
                <h2 className="text-lg font-bold text-white font-display">1. Basic Information</h2>
                <p className="text-xs text-[#AAA69C]">Key details displayed on search cards and public headers.</p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-[#AAA69C] border border-white/10 font-medium uppercase">
                Required
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-[#AAA69C] mb-1.5">
                  Business Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Abyssinian Artisan Coffee & Kitchen"
                  className="w-full h-11 px-4 rounded-xl bg-black/60 border border-white/15 text-sm text-white placeholder:text-[#AAA69C]/40 focus:border-white focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#AAA69C] mb-1.5">
                  Primary Category <span className="text-[#AAA69C] font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl bg-black/60 border border-white/15 text-sm text-white focus:border-white focus:outline-none transition appearance-none cursor-pointer"
                  >
                    <option value="">Select a category...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <Tag className="w-4 h-4 text-[#AAA69C] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#AAA69C] mb-1.5">
                  Description / Story <span className="text-[#AAA69C] font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Tell visitors about your specialties, traditional clay pot cooking, ceremonial roasts, or ambient setting..."
                  className="w-full p-4 rounded-xl bg-black/60 border border-white/15 text-sm text-white placeholder:text-[#AAA69C]/40 focus:border-white focus:outline-none transition resize-none leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Contact Information */}
          <div className="p-5 sm:p-7 rounded-2xl bg-[#151518] border border-white/[0.08] space-y-6 shadow-xl">
            <div className="border-b border-white/[0.06] pb-4">
              <h2 className="text-lg font-bold text-white font-display">2. Contact Information</h2>
              <p className="text-xs text-[#AAA69C]">How customers reach you for inquiries and reservations.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase text-[#AAA69C] mb-1.5">
                  Phone Number <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+251 91 123 4567"
                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-black/60 border border-white/15 text-sm text-white placeholder:text-[#AAA69C]/40 focus:border-white focus:outline-none transition"
                  />
                  <Phone className="w-4 h-4 text-[#AAA69C] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#AAA69C] mb-1.5">
                  Website / Social Link <span className="text-[#AAA69C] font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://myspot.et"
                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-black/60 border border-white/15 text-sm text-white placeholder:text-[#AAA69C]/40 focus:border-white focus:outline-none transition"
                  />
                  <Globe className="w-4 h-4 text-[#AAA69C] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: Business Location & Map Coordinates */}
          <div className="p-5 sm:p-7 rounded-2xl bg-[#151518] border border-white/[0.08] space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
              <div>
                <h2 className="text-lg font-bold text-white font-display">3. Location &amp; Coordinates</h2>
                <p className="text-xs text-[#AAA69C]">
                  Physical address and GPS coordinates for the Nearby radar and interactive maps.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-[#AAA69C] mb-1.5">
                  Physical Address <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g. Airport Road, Near Atlas Hotel, Bole, Addis Ababa"
                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-black/60 border border-white/15 text-sm text-white placeholder:text-[#AAA69C]/40 focus:border-white focus:outline-none transition"
                  />
                  <MapPin className="w-4 h-4 text-[#AAA69C] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Geolocation Button Box */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-bold text-white">Option 1: Use Current Location (GPS)</h3>
                    <p className="text-[11px] text-[#AAA69C] mt-0.5">
                      Request browser geolocation on explicit click.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleGetCurrentLocation}
                    disabled={geoLoading}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black font-extrabold text-xs hover:bg-[#F5F2EA] transition active:scale-95 disabled:opacity-50 cursor-pointer shrink-0 shadow-md"
                  >
                    {geoLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Retrieving GPS...</span>
                      </>
                    ) : (
                      <>
                        <Navigation className="w-3.5 h-3.5 fill-black" />
                        <span>Use my current location</span>
                      </>
                    )}
                  </button>
                </div>

                {geoError && (
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[#AAA69C] text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{geoError}</span>
                  </div>
                )}

                {geoSuccess && (
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-white/90 text-xs flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{geoSuccess}</span>
                  </div>
                )}
              </div>

              {/* Option 2: Coordinates Inputs */}
              <div>
                <span className="block text-xs font-semibold text-white mb-2">
                  Option 2: Manual Coordinates &amp; Interactive Pin
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-[#AAA69C] mb-1">
                      Latitude (-90 to 90)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                      placeholder="e.g. 9.022500"
                      className="w-full h-10 px-3 rounded-xl bg-black/60 border border-white/15 text-xs text-white font-mono placeholder:text-[#AAA69C]/40 focus:border-white focus:outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-[#AAA69C] mb-1">
                      Longitude (-180 to 180)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                      placeholder="e.g. 38.831000"
                      className="w-full h-10 px-3 rounded-xl bg-black/60 border border-white/15 text-xs text-white font-mono placeholder:text-[#AAA69C]/40 focus:border-white focus:outline-none transition"
                    />
                  </div>
                </div>
              </div>

              {/* Interactive Map Picker */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[11px] font-mono text-[#AAA69C]">
                  <span>INTERACTIVE MAP PIN ADJUSTMENT</span>
                  <span className="text-[#AAA69C]/60">Drag pin or click map to reposition</span>
                </div>
                <LeafletMap
                  lat={parseFloat(formData.latitude) || 9.0225}
                  lng={parseFloat(formData.longitude) || 38.831}
                  zoom={14}
                  name={formData.name || 'Your Venue Location'}
                  address={formData.address}
                  draggableMarker={true}
                  onLocationSelect={handleMapLocationSelect}
                  className="h-52 sm:h-64 w-full rounded-xl overflow-hidden border border-white/10"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: Business Photography (Cloudinary) */}
          <div className="p-5 sm:p-7 rounded-2xl bg-[#151518] border border-white/[0.08] space-y-6 shadow-xl">
            <div className="border-b border-white/[0.06] pb-4">
              <h2 className="text-lg font-bold text-white font-display">4. Venue Photography</h2>
              <p className="text-xs text-[#AAA69C]">
                Upload a cover photograph of your storefront, dining area, or coffee bar.
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handlePhotoSelect}
              className="hidden"
            />

            {imagePreview ? (
              <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border border-white/20 bg-black/50 group">
                <img
                  src={imagePreview}
                  alt="Selected cover preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = PLACE_PLACEHOLDER;
                  }}
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-semibold transition"
                  >
                    Change Photo
                  </button>
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="px-4 py-2 rounded-full bg-red-500/80 hover:bg-red-500 backdrop-blur-md text-white text-xs font-semibold transition"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/15 hover:border-white/30 rounded-2xl p-8 text-center cursor-pointer transition bg-black/30 hover:bg-black/50 space-y-2.5"
              >
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-[#AAA69C]">
                  <ImageIcon className="w-6 h-6 text-white/80" />
                </div>
                <div className="text-sm text-white font-bold">
                  Click to select venue cover photo
                </div>
                <p className="text-xs text-[#AAA69C]">
                  Supports PNG, JPG, or WebP up to 5MB. Uploads securely to Cloudinary storage.
                </p>
              </div>
            )}
          </div>

          {/* SECTION 5: Operating Hours */}
          <div className="p-5 sm:p-7 rounded-2xl bg-[#151518] border border-white/[0.08] space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
              <div>
                <h2 className="text-lg font-bold text-white font-display">5. Weekly Operating Hours</h2>
                <p className="text-xs text-[#AAA69C]">Set the standard schedule when your spot is open to guests.</p>
              </div>

              <button
                type="button"
                onClick={handleApplyPresetHours}
                className="px-3.5 py-1.5 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-semibold text-[#AAA69C] hover:text-white transition cursor-pointer self-start sm:self-auto"
              >
                Reset Standard Hours (08:30–22:00)
              </button>
            </div>

            <div className="divide-y divide-white/[0.06]">
              {schedule.map((day) => (
                <div
                  key={day.day_of_week}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 w-36">
                    <input
                      type="checkbox"
                      id={`day-${day.day_of_week}`}
                      checked={day.is_open}
                      onChange={(e) => handleScheduleChange(day.day_of_week, 'is_open', e.target.checked)}
                      className="w-4 h-4 rounded accent-white bg-black/60 border-white/20"
                    />
                    <label
                      htmlFor={`day-${day.day_of_week}`}
                      className={`text-xs font-medium cursor-pointer ${
                        day.is_open ? 'text-white' : 'text-[#AAA69C]/40'
                      }`}
                    >
                      {day.name}
                    </label>
                  </div>

                  {day.is_open ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={day.opens_at}
                        onChange={(e) => handleScheduleChange(day.day_of_week, 'opens_at', e.target.value)}
                        className="px-3 py-1.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white font-mono focus:border-white focus:outline-none"
                      />
                      <span className="text-xs text-[#AAA69C]">to</span>
                      <input
                        type="time"
                        value={day.closes_at}
                        onChange={(e) => handleScheduleChange(day.day_of_week, 'closes_at', e.target.value)}
                        className="px-3 py-1.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white font-mono focus:border-white focus:outline-none"
                      />
                    </div>
                  ) : (
                    <span className="text-xs font-mono text-[#AAA69C]/40 italic">Closed all day</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#151518] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
            <Link
              to="/profile?tab=businesses"
              className="px-5 py-2.5 rounded-full border border-white/15 text-xs font-semibold text-[#AAA69C] hover:text-white hover:bg-white/5 transition text-center"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-white text-black text-xs font-bold hover:bg-[#F5F2EA] transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-md"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>{submitStep || 'Registering Venue...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-black" />
                  <span>Register &amp; Open Dashboard</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BusinessCreatePage;

