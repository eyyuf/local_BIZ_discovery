import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
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
  ExternalLink,
  Trash2,
  Edit,
  Plus,
  UtensilsCrossed,
  Eye,
  Camera,
  X,
  ChevronRight,
  ShieldCheck,
  Power,
  Layers,
  Upload,
} from 'lucide-react';
import placesApi from '@/modules/places/api/placesApi';
import discoveryApi from '@/modules/discovery/api/discoveryApi';
import { LeafletMap } from '@/shared/map/LeafletMap';
import { getPlacePrimaryPhoto, getPlacePhotos, PLACE_PLACEHOLDER } from '@/shared/utils/placeImages';

const DAYS_OF_WEEK = [
  { index: 1, name: 'Monday' },
  { index: 2, name: 'Tuesday' },
  { index: 3, name: 'Wednesday' },
  { index: 4, name: 'Thursday' },
  { index: 5, name: 'Friday' },
  { index: 6, name: 'Saturday' },
  { index: 0, name: 'Sunday' },
];

export function BusinessDashboardPage({ defaultTab = 'overview' }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get('tab') || defaultTab || 'overview';
  const setActiveTab = (tab) => {
    setSearchParams({ tab });
  };

  // Business State
  const [place, setPlace] = useState(null);
  const [isLoadingPlace, setIsLoadingPlace] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [actionError, setActionError] = useState(null);

  // Categories
  const [categories, setCategories] = useState([]);

  // Tab 2: Edit Information Form State
  const [infoForm, setInfoForm] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    website: '',
    is_active: true,
    categoryId: '',
  });
  const [isSavingInfo, setIsSavingInfo] = useState(false);

  // Tab 3: Photos State
  const [placeImages, setPlaceImages] = useState([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const photoInputRef = useRef(null);

  // Tab 4: Menu State
  const [menuSections, setMenuSections] = useState([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(false);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [sectionNameInput, setSectionNameInput] = useState('');
  const [isSavingSection, setIsSavingSection] = useState(false);

  // Menu Item Modal State
  const [showItemModal, setShowItemModal] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [itemFormData, setItemFormData] = useState({
    name: '',
    description: '',
    price: '',
    is_available: true,
    image_url: '',
  });
  const [isSavingItem, setIsSavingItem] = useState(false);
  const itemPhotoInputRef = useRef(null);
  const [isUploadingItemPhoto, setIsUploadingItemPhoto] = useState(false);

  // Tab 5: Operating Hours State
  const [schedule, setSchedule] = useState(
    DAYS_OF_WEEK.map((d) => ({
      day_of_week: d.index,
      name: d.name,
      is_open: true,
      opens_at: '08:00',
      closes_at: '22:00',
    }))
  );
  const [isSavingHours, setIsSavingHours] = useState(false);

  // Tab 6: Location & Coordinates State
  const [locationForm, setLocationForm] = useState({
    address: '',
    latitude: '',
    longitude: '',
  });
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState(null);
  const [geoSuccess, setGeoSuccess] = useState(null);
  const [isSavingLocation, setIsSavingLocation] = useState(false);

  // Danger Zone
  const [isDeletingBusiness, setIsDeletingBusiness] = useState(false);

  const showNotification = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 5000);
  }, []);

  // Fetch Place Details
  const fetchPlaceDetails = useCallback(async () => {
    setIsLoadingPlace(true);
    setLoadError(null);
    try {
      const data = await placesApi.getOwnerPlace(id);
      setPlace(data);

      // Populate info form
      setInfoForm({
        name: data.name || '',
        description: data.description || '',
        address: data.address || '',
        phone: data.phone || '',
        website: data.website || '',
        is_active: Boolean(data.is_active),
        categoryId: data.categories?.[0]?.id ? String(data.categories[0].id) : '',
      });

      // Populate location form
      setLocationForm({
        address: data.address || '',
        latitude: data.latitude !== null && data.latitude !== undefined ? String(data.latitude) : '',
        longitude: data.longitude !== null && data.longitude !== undefined ? String(data.longitude) : '',
      });

      // Populate schedule
      const existingHours = data.operating_hours || data.operatingHours || [];
      const populatedSchedule = DAYS_OF_WEEK.map((day) => {
        const found = existingHours.find((h) => Number(h.day_of_week) === day.index);
        if (found) {
          return {
            day_of_week: day.index,
            name: day.name,
            is_open: !found.is_closed,
            opens_at: (found.opens_at || '08:00').slice(0, 5),
            closes_at: (found.closes_at || '22:00').slice(0, 5),
          };
        }
        return {
          day_of_week: day.index,
          name: day.name,
          is_open: false,
          opens_at: '08:00',
          closes_at: '22:00',
        };
      });
      setSchedule(populatedSchedule);

      // Populate images
      if (Array.isArray(data.images)) {
        setPlaceImages(data.images);
      }

      // Populate menu
      if (Array.isArray(data.menu_sections)) {
        setMenuSections(data.menu_sections);
      }
    } catch (err) {
      console.error('Failed to load place details', err);
      setLoadError(
        err.response?.status === 403
          ? 'You do not have authorization to manage this business.'
          : err.response?.status === 404
          ? 'Business not found.'
          : 'Could not load business details. Please check your network.'
      );
    } finally {
      setIsLoadingPlace(false);
    }
  }, [id]);

  // Initial Fetch
  useEffect(() => {
    fetchPlaceDetails();
  }, [fetchPlaceDetails]);

  // Fetch Categories
  useEffect(() => {
    async function loadCats() {
      try {
        const raw = await discoveryApi.getCategories();
        const list = [];
        (raw || []).forEach((c) => {
          list.push(c);
          if (Array.isArray(c.children)) {
            c.children.forEach((ch) => list.push(ch));
          }
        });
        setCategories(list);
      } catch (err) {
        console.warn('Could not load categories', err);
      }
    }
    loadCats();
  }, []);

  // Fetch Images when entering Photos tab
  const fetchImages = useCallback(async () => {
    setIsLoadingImages(true);
    try {
      const imgs = await placesApi.getPlaceImages(id);
      setPlaceImages(Array.isArray(imgs) ? imgs : []);
    } catch (err) {
      console.warn('Could not load place images', err);
    } finally {
      setIsLoadingImages(false);
    }
  }, [id]);

  useEffect(() => {
    if (activeTab === 'photos') {
      fetchImages();
    }
  }, [activeTab, fetchImages]);

  // Fetch Menu when entering Menu tab
  const fetchMenu = useCallback(async () => {
    setIsLoadingMenu(true);
    try {
      const sections = await placesApi.getPlaceMenu(id);
      setMenuSections(Array.isArray(sections) ? sections : []);
    } catch (err) {
      console.warn('Could not load menu', err);
    } finally {
      setIsLoadingMenu(false);
    }
  }, [id]);

  useEffect(() => {
    if (activeTab === 'menu') {
      fetchMenu();
    }
  }, [activeTab, fetchMenu]);

  // ----------------------------------------------------
  // Tab 2 Handlers: Update Business Information
  // ----------------------------------------------------
  const handleSaveInfo = async (e) => {
    e.preventDefault();
    if (!infoForm.name.trim() || !infoForm.address.trim() || !infoForm.phone.trim()) {
      setActionError('Name, Address, and Phone are required.');
      return;
    }

    setIsSavingInfo(true);
    setActionError(null);

    try {
      const payload = {
        name: infoForm.name.trim(),
        description: infoForm.description.trim() || null,
        address: infoForm.address.trim(),
        phone: infoForm.phone.trim(),
        website: infoForm.website.trim() || null,
        is_active: Boolean(infoForm.is_active),
      };

      if (infoForm.categoryId) {
        payload.category_ids = [parseInt(infoForm.categoryId, 10)];
      }

      const updated = await placesApi.updateOwnerPlace(id, payload);
      setPlace(updated.data || updated);
      showNotification('Business information saved successfully!');
    } catch (err) {
      console.error('Failed to update business info', err);
      const msg = err.response?.data?.message || err.response?.data?.error;
      setActionError(msg || 'Could not save business details.');
    } finally {
      setIsSavingInfo(false);
    }
  };

  // ----------------------------------------------------
  // Tab 3 Handlers: Photos Management
  // ----------------------------------------------------
  const handleUploadPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image (PNG, JPG, WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Photo must be under 5MB.');
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const isFirst = placeImages.length === 0;
      await placesApi.uploadPlaceImage(id, file, isFirst);
      showNotification('Photo uploaded to Cloudinary successfully!');
      fetchImages();
      fetchPlaceDetails();
    } catch (err) {
      console.error('Upload photo error', err);
      alert(err.response?.data?.message || 'Could not upload photo.');
    } finally {
      setIsUploadingPhoto(false);
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  };

  const handleSetCoverPhoto = async (imageId) => {
    try {
      await placesApi.setCoverImage(id, imageId);
      showNotification('Cover photograph updated!');
      fetchImages();
      fetchPlaceDetails();
    } catch (err) {
      console.error('Set cover error', err);
      alert('Could not update cover photo.');
    }
  };

  const handleDeletePhoto = async (imageId) => {
    if (!window.confirm('Delete this photograph?')) return;
    try {
      await placesApi.deletePlaceImage(id, imageId);
      showNotification('Photo deleted.');
      fetchImages();
      fetchPlaceDetails();
    } catch (err) {
      console.error('Delete photo error', err);
      alert('Could not delete photo.');
    }
  };

  // ----------------------------------------------------
  // Tab 4 Handlers: Menu Management
  // ----------------------------------------------------
  const handleOpenCreateSection = () => {
    setEditingSection(null);
    setSectionNameInput('');
    setShowSectionModal(true);
  };

  const handleOpenEditSection = (section) => {
    setEditingSection(section);
    setSectionNameInput(section.name || '');
    setShowSectionModal(true);
  };

  const handleSaveSection = async (e) => {
    e.preventDefault();
    if (!sectionNameInput.trim()) return;

    setIsSavingSection(true);
    try {
      if (editingSection) {
        await placesApi.updateMenuSection(id, editingSection.id, {
          name: sectionNameInput.trim(),
        });
        showNotification('Menu section renamed successfully.');
      } else {
        await placesApi.createMenuSection(id, {
          name: sectionNameInput.trim(),
        });
        showNotification('New menu section added.');
      }
      setShowSectionModal(false);
      fetchMenu();
    } catch (err) {
      console.error('Save section error', err);
      alert(err.response?.data?.message || 'Could not save menu section.');
    } finally {
      setIsSavingSection(false);
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (!window.confirm('Are you sure you want to delete this menu section? All items inside it will also be deleted.')) {
      return;
    }
    try {
      await placesApi.deleteMenuSection(id, sectionId);
      showNotification('Menu section and its items deleted.');
      fetchMenu();
    } catch (err) {
      console.error('Delete section error', err);
      alert('Could not delete section.');
    }
  };

  // Item Handlers
  const handleOpenCreateItem = (sectionId) => {
    setActiveSectionId(sectionId);
    setEditingItem(null);
    setItemFormData({
      name: '',
      description: '',
      price: '',
      is_available: true,
      image_url: '',
    });
    setShowItemModal(true);
  };

  const handleOpenEditItem = (sectionId, item) => {
    setActiveSectionId(sectionId);
    setEditingItem(item);
    setItemFormData({
      name: item.name || '',
      description: item.description || '',
      price: item.price !== null && item.price !== undefined ? String(item.price) : '',
      is_available: Boolean(item.is_available),
      image_url: item.image_url || '',
    });
    setShowItemModal(true);
  };

  const handleUploadItemPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Item photo must be under 5MB.');
      return;
    }

    setIsUploadingItemPhoto(true);
    try {
      const url = await placesApi.uploadMedia(file);
      setItemFormData((prev) => ({ ...prev, image_url: url }));
      showNotification('Dish photo uploaded to Cloudinary!');
    } catch (err) {
      console.error('Dish photo upload error', err);
      alert('Could not upload item photo.');
    } finally {
      setIsUploadingItemPhoto(false);
      if (itemPhotoInputRef.current) itemPhotoInputRef.current.value = '';
    }
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!itemFormData.name.trim() || itemFormData.price === '') {
      alert('Item name and price are required.');
      return;
    }

    const priceNum = parseFloat(itemFormData.price);
    if (isNaN(priceNum) || priceNum < 0) {
      alert('Price must be a valid positive number.');
      return;
    }

    setIsSavingItem(true);
    try {
      if (editingItem) {
        await placesApi.updateMenuItem(editingItem.id, {
          name: itemFormData.name.trim(),
          description: itemFormData.description.trim() || null,
          price: priceNum,
          is_available: Boolean(itemFormData.is_available),
          image_url: itemFormData.image_url || null,
        });
        showNotification('Menu item updated.');
      } else {
        await placesApi.createMenuItem(id, {
          menu_section_id: activeSectionId,
          name: itemFormData.name.trim(),
          description: itemFormData.description.trim() || null,
          price: priceNum,
          is_available: Boolean(itemFormData.is_available),
          image_url: itemFormData.image_url || null,
        });
        showNotification('New menu item added.');
      }
      setShowItemModal(false);
      fetchMenu();
    } catch (err) {
      console.error('Save item error', err);
      alert(err.response?.data?.message || 'Could not save menu item.');
    } finally {
      setIsSavingItem(false);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Delete this menu item?')) return;
    try {
      await placesApi.deleteMenuItem(itemId);
      showNotification('Menu item deleted.');
      fetchMenu();
    } catch (err) {
      console.error('Delete item error', err);
      alert('Could not delete menu item.');
    }
  };

  // ----------------------------------------------------
  // Tab 5 Handlers: Operating Hours
  // ----------------------------------------------------
  const handleScheduleToggle = (dayIndex, isOpen) => {
    setSchedule((prev) =>
      prev.map((d) => (d.day_of_week === dayIndex ? { ...d, is_open: isOpen } : d))
    );
  };

  const handleScheduleTimeChange = (dayIndex, field, value) => {
    setSchedule((prev) =>
      prev.map((d) => (d.day_of_week === dayIndex ? { ...d, [field]: value } : d))
    );
  };

  const handleApplyPresetHours = () => {
    setSchedule((prev) =>
      prev.map((d) => ({
        ...d,
        is_open: d.day_of_week !== 0,
        opens_at: '08:00',
        closes_at: '22:00',
      }))
    );
  };

  const handleSaveOperatingHours = async () => {
    setIsSavingHours(true);
    try {
      const activeHours = schedule
        .filter((d) => d.is_open && d.opens_at && d.closes_at)
        .map((d) => ({
          day_of_week: d.day_of_week,
          opens_at: d.opens_at.slice(0, 5),
          closes_at: d.closes_at.slice(0, 5),
        }));

      await placesApi.updateOperatingHours(id, activeHours);
      showNotification('Operating schedule saved successfully!');
      fetchPlaceDetails();
    } catch (err) {
      console.error('Save hours error', err);
      alert(err.response?.data?.message || 'Could not update operating hours.');
    } finally {
      setIsSavingHours(false);
    }
  };

  // ----------------------------------------------------
  // Tab 6 Handlers: Location & Coordinates
  // ----------------------------------------------------
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setGeoLoading(true);
    setGeoError(null);
    setGeoSuccess(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        setLocationForm((prev) => ({
          ...prev,
          latitude: String(lat),
          longitude: String(lng),
        }));
        setGeoLoading(false);
        setGeoSuccess(`Coordinates retrieved: ${lat}, ${lng}. Please verify the pin represents your venue.`);
      },
      (err) => {
        setGeoLoading(false);
        if (err.code === 1) {
          setGeoError('Location permission denied. Please enter coordinates manually.');
        } else if (err.code === 2) {
          setGeoError('Position unavailable. Please enter coordinates manually.');
        } else if (err.code === 3) {
          setGeoError('Geolocation timed out. Please try again or enter coordinates manually.');
        } else {
          setGeoError('Could not retrieve current location.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleMapPinSelect = (coords) => {
    if (coords && coords.lat !== undefined && coords.lng !== undefined) {
      setLocationForm((prev) => ({
        ...prev,
        latitude: String(coords.lat),
        longitude: String(coords.lng),
      }));
      setGeoSuccess(`Pin moved to: ${coords.lat}, ${coords.lng}.`);
      setGeoError(null);
    }
  };

  const handleSaveLocation = async (e) => {
    e.preventDefault();
    if (!locationForm.address.trim()) {
      alert('Physical address is required.');
      return;
    }

    let latNum = undefined;
    let lngNum = undefined;
    if (locationForm.latitude) {
      latNum = parseFloat(locationForm.latitude);
      if (isNaN(latNum) || latNum < -90 || latNum > 90) {
        alert('Latitude must be between -90 and 90.');
        return;
      }
    }
    if (locationForm.longitude) {
      lngNum = parseFloat(locationForm.longitude);
      if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
        alert('Longitude must be between -180 and 180.');
        return;
      }
    }

    if ((latNum !== undefined && lngNum === undefined) || (latNum === undefined && lngNum !== undefined)) {
      alert('Both latitude and longitude must be provided together, or leave both empty.');
      return;
    }

    setIsSavingLocation(true);
    try {
      await placesApi.updateOwnerPlace(id, {
        address: locationForm.address.trim(),
        latitude: latNum,
        longitude: lngNum,
      });
      showNotification('Location & GPS coordinates updated!');
      fetchPlaceDetails();
    } catch (err) {
      console.error('Save location error', err);
      alert(err.response?.data?.message || 'Could not update location.');
    } finally {
      setIsSavingLocation(false);
    }
  };

  // ----------------------------------------------------
  // Danger Zone: Delete Business
  // ----------------------------------------------------
  const handleDeleteBusiness = async () => {
    const confirmation = window.prompt(
      `Type "${place?.name}" to confirm permanent deletion of this business and all related menu sections, items, and photos:`
    );
    if (confirmation !== place?.name) {
      alert('Business name did not match. Deletion cancelled.');
      return;
    }

    setIsDeletingBusiness(true);
    try {
      await placesApi.deleteOwnerPlace(id);
      alert('Business deleted successfully.');
      navigate('/profile?tab=businesses');
    } catch (err) {
      console.error('Delete business error', err);
      alert('Failed to delete business.');
      setIsDeletingBusiness(false);
    }
  };

  // Loading & Error States
  if (isLoadingPlace) {
    return (
      <div className="min-h-screen bg-[#0D0D0C] text-[#F5F2EA] flex flex-col items-center justify-center p-6 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-white/70" />
        <p className="text-xs font-mono text-[#AAA69C]">Loading Business Management Hub...</p>
      </div>
    );
  }

  if (loadError || !place) {
    return (
      <div className="min-h-screen bg-[#0D0D0C] text-[#F5F2EA] flex flex-col items-center justify-center p-6 text-center space-y-5">
        <div className="w-12 h-12 rounded-full border border-red-500/40 bg-red-950/40 flex items-center justify-center text-red-400">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold font-display">{loadError || 'Business Not Found'}</h2>
        <Link
          to="/profile?tab=businesses"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/20 bg-[#151513] text-xs font-semibold text-white hover:border-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Businesses Overview</span>
        </Link>
      </div>
    );
  }

  // Calculate completeness score
  const hasCover = placeImages.length > 0 || Boolean(place.cover_image);
  const hasMenu = menuSections.length > 0 && menuSections.some((s) => s.items?.length > 0);
  const hasGps = place.latitude !== null && place.longitude !== null;
  const hasHours = (place.operating_hours || place.operatingHours || []).length > 0;
  const healthItems = [
    { label: 'Basic Info & Contact', done: Boolean(place.name && place.phone && place.address) },
    { label: 'Storefront Photography', done: hasCover },
    { label: 'GPS Location Pin', done: hasGps },
    { label: 'Weekly Schedule', done: hasHours },
    { label: 'Menu & Dishes', done: hasMenu },
  ];
  const completedCount = healthItems.filter((i) => i.done).length;
  const completenessPercent = Math.round((completedCount / healthItems.length) * 100);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Building2 },
    { id: 'info', label: 'Business Info', icon: Edit },
    { id: 'photos', label: 'Photos & Gallery', icon: Camera, badge: placeImages.length },
    { id: 'menu', label: 'Menu & Dishes', icon: UtensilsCrossed },
    { id: 'hours', label: 'Operating Hours', icon: Clock },
    { id: 'location', label: 'Location & GPS', icon: MapPin },
  ];

  return (
    <div className="min-h-screen bg-[#0D0D0C] text-[#F5F2EA] pb-24">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 px-4 py-3 rounded-full bg-[#151518] border border-white/20 text-white text-xs font-medium flex items-center gap-2 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-4">
          <Check className="w-4 h-4 text-white shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner / Breadcrumb */}
      <div className="bg-[#121215] border-b border-white/[0.08] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              to="/profile?tab=businesses"
              className="p-2 rounded-full border border-white/10 hover:border-white/30 text-[#AAA69C] hover:text-white transition"
              title="Return to Businesses"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-base sm:text-lg font-bold text-white font-display truncate">
                  {place.name}
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono border border-white/10 bg-black/60 text-[#AAA69C]">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      place.is_active ? 'bg-emerald-400' : 'bg-zinc-500'
                    }`}
                  />
                  <span>{place.is_active ? 'Live' : 'Draft'}</span>
                </span>
              </div>
              <p className="text-xs text-[#AAA69C] truncate max-w-md mt-0.5">{place.address}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/places/${place.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/15 bg-black/40 hover:border-white/30 text-xs font-medium text-[#AAA69C] hover:text-white transition active:scale-95"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Public Page</span>
              <ExternalLink className="w-3 h-3 text-[#AAA69C]/60" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Dashboard Layout: Sidebar Navigation + Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Navigation Sidebar (Desktop 3 cols / Mobile horizontal bar) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="p-2 sm:p-2.5 rounded-2xl bg-[#151518] border border-white/[0.08] shadow-xl">
              <nav className="flex lg:flex-col gap-1 overflow-x-auto no-scrollbar py-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isCurrent = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition whitespace-nowrap cursor-pointer ${
                        isCurrent
                          ? 'border border-white/20 bg-white/10 text-white font-semibold shadow-sm'
                          : 'border border-transparent text-[#AAA69C] hover:text-white hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isCurrent ? 'text-white' : 'text-[#AAA69C]'}`} />
                        <span>{tab.label}</span>
                      </div>
                      {tab.badge !== undefined && (
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                            isCurrent
                              ? 'bg-white/20 text-white'
                              : 'bg-white/5 text-[#AAA69C]'
                          }`}
                        >
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Quick Listing Health Card */}
            <div className="hidden lg:block p-4 sm:p-5 rounded-2xl bg-[#151518] border border-white/[0.08] space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white font-display">Listing Health</span>
                <span className="text-xs font-mono text-[#AAA69C]">{completenessPercent}%</span>
              </div>
              <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-white/80 rounded-full transition-all duration-500"
                  style={{ width: `${completenessPercent}%` }}
                />
              </div>
              <div className="space-y-1.5 pt-2 border-t border-white/[0.06] text-[11px]">
                {healthItems.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[#AAA69C]">
                    <span>{item.label}</span>
                    {item.done ? (
                      <Check className="w-3.5 h-3.5 text-white/60" />
                    ) : (
                      <span className="text-[#AAA69C]/50 text-[10px] font-mono">Pending</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Main Content Area (9 cols) */}
          <div className="lg:col-span-9 space-y-6">
            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Hero Showcase Card */}
                <div className="p-5 sm:p-7 rounded-2xl bg-[#151518] border border-white/[0.08] relative overflow-hidden shadow-xl">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    <div className="md:col-span-4 aspect-[4/3] rounded-xl overflow-hidden bg-black/60 border border-white/10 relative shadow-md">
                      <img
                        src={getPlacePrimaryPhoto(place)}
                        alt={place.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = PLACE_PLACEHOLDER;
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setActiveTab('photos')}
                        className="absolute bottom-2.5 right-2.5 px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-white/15 text-[11px] font-medium text-white hover:bg-black/90 hover:border-white/30 transition flex items-center gap-1.5 cursor-pointer shadow-md"
                      >
                        <Camera className="w-3 h-3 text-[#AAA69C]" />
                        <span>Manage Photos</span>
                      </button>
                    </div>

                    <div className="md:col-span-8 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/5 text-[#AAA69C] border border-white/10">
                          {place.categories?.[0]?.name || 'Local Spot'}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono border border-white/10 bg-black/60 text-[#AAA69C]">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              place.is_active ? 'bg-emerald-400' : 'bg-zinc-500'
                            }`}
                          />
                          <span>{place.is_active ? 'Live' : 'Draft'}</span>
                        </span>
                      </div>

                      <h2 className="text-2xl sm:text-3xl font-black text-white font-display tracking-tight">
                        {place.name}
                      </h2>

                      <p className="text-xs sm:text-sm text-[#AAA69C] leading-relaxed line-clamp-2">
                        {place.description || 'No public description provided yet.'}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-[#AAA69C] pt-2 border-t border-white/[0.06]">
                        {place.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-[#AAA69C]/80" />
                            <span>{place.phone}</span>
                          </div>
                        )}
                        {place.website && (
                          <div className="flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5 text-[#AAA69C]/80" />
                            <a
                              href={place.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#AAA69C] hover:text-white transition underline underline-offset-2"
                            >
                              {place.website}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div
                    onClick={() => setActiveTab('menu')}
                    className="p-4 sm:p-5 rounded-2xl bg-[#151518] border border-white/[0.08] hover:border-white/20 transition cursor-pointer shadow-lg space-y-1 group"
                  >
                    <div className="text-[10px] font-mono uppercase tracking-wider text-[#AAA69C]">Menu Dishes</div>
                    <div className="text-2xl font-bold text-white font-display">
                      {menuSections.reduce((acc, s) => acc + (s.items?.length || 0), 0)}
                    </div>
                    <div className="text-[11px] text-[#AAA69C] group-hover:text-white transition flex items-center gap-1">
                      <span>{menuSections.length} sections active</span>
                      <ChevronRight className="w-3 h-3 text-[#AAA69C]/60 group-hover:text-white transition" />
                    </div>
                  </div>

                  <div
                    onClick={() => setActiveTab('photos')}
                    className="p-4 sm:p-5 rounded-2xl bg-[#151518] border border-white/[0.08] hover:border-white/20 transition cursor-pointer shadow-lg space-y-1 group"
                  >
                    <div className="text-[10px] font-mono uppercase tracking-wider text-[#AAA69C]">Photos</div>
                    <div className="text-2xl font-bold text-white font-display">
                      {placeImages.length}
                    </div>
                    <div className="text-[11px] text-[#AAA69C] group-hover:text-white transition flex items-center gap-1">
                      <span>Gallery uploads</span>
                      <ChevronRight className="w-3 h-3 text-[#AAA69C]/60 group-hover:text-white transition" />
                    </div>
                  </div>

                  <div
                    onClick={() => setActiveTab('hours')}
                    className="p-4 sm:p-5 rounded-2xl bg-[#151518] border border-white/[0.08] hover:border-white/20 transition cursor-pointer shadow-lg space-y-1 group"
                  >
                    <div className="text-[10px] font-mono uppercase tracking-wider text-[#AAA69C]">Schedule</div>
                    <div className="text-2xl font-bold text-white font-display">
                      {(place.operating_hours || place.operatingHours || []).length} / 7
                    </div>
                    <div className="text-[11px] text-[#AAA69C] group-hover:text-white transition flex items-center gap-1">
                      <span>Days configured</span>
                      <ChevronRight className="w-3 h-3 text-[#AAA69C]/60 group-hover:text-white transition" />
                    </div>
                  </div>

                  <div
                    onClick={() => setActiveTab('location')}
                    className="p-4 sm:p-5 rounded-2xl bg-[#151518] border border-white/[0.08] hover:border-white/20 transition cursor-pointer shadow-lg space-y-1 group"
                  >
                    <div className="text-[10px] font-mono uppercase tracking-wider text-[#AAA69C]">Location</div>
                    <div className="text-2xl font-bold text-white font-display">
                      {hasGps ? 'GPS' : 'Manual'}
                    </div>
                    <div className="text-[11px] text-[#AAA69C] group-hover:text-white transition flex items-center gap-1">
                      <span>{hasGps ? 'Coordinates saved' : 'Set location'}</span>
                      <ChevronRight className="w-3 h-3 text-[#AAA69C]/60 group-hover:text-white transition" />
                    </div>
                  </div>
                </div>

                {/* Quick Action Jump Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div
                    onClick={() => setActiveTab('menu')}
                    className="p-5 rounded-2xl bg-[#151518] border border-white/[0.08] hover:border-white/20 transition cursor-pointer space-y-2.5 group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#AAA69C] group-hover:text-white group-hover:border-white/20 transition">
                      <UtensilsCrossed className="w-4 h-4" />
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-white transition font-display">
                      Menu &amp; Dishes
                    </h3>
                    <p className="text-[11px] sm:text-xs text-[#AAA69C] leading-relaxed">
                      Add appetizers, main courses, prices, and upload dish photos for visitors.
                    </p>
                  </div>

                  <div
                    onClick={() => setActiveTab('photos')}
                    className="p-5 rounded-2xl bg-[#151518] border border-white/[0.08] hover:border-white/20 transition cursor-pointer space-y-2.5 group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#AAA69C] group-hover:text-white group-hover:border-white/20 transition">
                      <Camera className="w-4 h-4" />
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-white transition font-display">
                      Photos &amp; Gallery
                    </h3>
                    <p className="text-[11px] sm:text-xs text-[#AAA69C] leading-relaxed">
                      Upload interior ambience and choose which photograph appears as your cover photo.
                    </p>
                  </div>

                  <div
                    onClick={() => setActiveTab('hours')}
                    className="p-5 rounded-2xl bg-[#151518] border border-white/[0.08] hover:border-white/20 transition cursor-pointer space-y-2.5 group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#AAA69C] group-hover:text-white group-hover:border-white/20 transition">
                      <Clock className="w-4 h-4" />
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-white transition font-display">
                      Opening Hours
                    </h3>
                    <p className="text-[11px] sm:text-xs text-[#AAA69C] leading-relaxed">
                      Control which days you are open and set exact opening and closing times.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: BUSINESS INFORMATION */}
            {activeTab === 'info' && (
              <div className="p-5 sm:p-7 rounded-2xl bg-[#151518] border border-white/[0.08] shadow-xl space-y-6 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-white font-display">Business Information</h2>
                    <p className="text-xs text-[#AAA69C]">
                      Manage public branding, contact information, and publication status.
                    </p>
                  </div>

                  {/* Active / Publication Status Toggle */}
                  <div className="flex items-center gap-2.5 self-start sm:self-auto bg-black/40 px-3.5 py-1.5 rounded-full border border-white/10">
                    <span className="text-xs text-[#AAA69C]">Status:</span>
                    <button
                      type="button"
                      onClick={() => setInfoForm((prev) => ({ ...prev, is_active: !prev.is_active }))}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono transition cursor-pointer border ${
                        infoForm.is_active
                          ? 'border-white/20 bg-white/10 text-white'
                          : 'border-white/10 bg-black/40 text-[#AAA69C]'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${infoForm.is_active ? 'bg-emerald-400' : 'bg-zinc-500'}`} />
                      <span>{infoForm.is_active ? 'Live' : 'Draft'}</span>
                    </button>
                  </div>
                </div>

                {actionError && (
                  <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{actionError}</span>
                  </div>
                )}

                <form onSubmit={handleSaveInfo} className="space-y-5">
                  <div>
                    <label className="block text-xs font-mono uppercase text-[#AAA69C] mb-1.5">
                      Business Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={infoForm.name}
                      onChange={(e) => setInfoForm({ ...infoForm, name: e.target.value })}
                      className="w-full h-11 px-4 rounded-xl bg-black/60 border border-white/15 text-sm text-white focus:border-white focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-[#AAA69C] mb-1.5">
                      Category
                    </label>
                    <select
                      value={infoForm.categoryId}
                      onChange={(e) => setInfoForm({ ...infoForm, categoryId: e.target.value })}
                      className="w-full h-11 px-4 rounded-xl bg-black/60 border border-white/15 text-sm text-white focus:border-white focus:outline-none transition appearance-none cursor-pointer"
                    >
                      <option value="">No category assigned</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-[#AAA69C] mb-1.5">
                      Description / Atmosphere Story
                    </label>
                    <textarea
                      rows={4}
                      value={infoForm.description}
                      onChange={(e) => setInfoForm({ ...infoForm, description: e.target.value })}
                      placeholder="Describe your kitchen, roastery, or stay..."
                      className="w-full p-4 rounded-xl bg-black/60 border border-white/15 text-sm text-white focus:border-white focus:outline-none transition resize-none leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase text-[#AAA69C] mb-1.5">
                        Phone Number <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={infoForm.phone}
                        onChange={(e) => setInfoForm({ ...infoForm, phone: e.target.value })}
                        className="w-full h-11 px-4 rounded-xl bg-black/60 border border-white/15 text-sm text-white focus:border-white focus:outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-[#AAA69C] mb-1.5">
                        Website / Social Link
                      </label>
                      <input
                        type="url"
                        value={infoForm.website}
                        onChange={(e) => setInfoForm({ ...infoForm, website: e.target.value })}
                        placeholder="https://myspot.et"
                        className="w-full h-11 px-4 rounded-xl bg-black/60 border border-white/15 text-sm text-white focus:border-white focus:outline-none transition"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/[0.06] flex items-center justify-end">
                    <button
                      type="submit"
                      disabled={isSavingInfo}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black font-bold text-xs hover:bg-[#F5F2EA] transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-md"
                    >
                      {isSavingInfo ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Saving Changes...</span>
                        </>
                      ) : (
                        <span>Save Information</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 3: PHOTOS & GALLERY */}
            {activeTab === 'photos' && (
              <div className="p-5 sm:p-7 rounded-2xl bg-[#151518] border border-white/[0.08] shadow-xl space-y-6 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-white font-display">Photos &amp; Gallery</h2>
                    <p className="text-xs text-[#AAA69C]">
                      Manage authentic storefront, dining room, and specialty photographs.
                    </p>
                  </div>

                  <div>
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleUploadPhoto}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      disabled={isUploadingPhoto}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black font-bold text-xs hover:bg-[#F5F2EA] transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-md"
                    >
                      {isUploadingPhoto ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Photo</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {isLoadingImages ? (
                  <div className="py-12 text-center text-xs font-mono text-[#AAA69C]">
                    Loading gallery photographs...
                  </div>
                ) : placeImages.length === 0 ? (
                  <div className="py-12 text-center rounded-2xl border border-dashed border-white/10 p-8 space-y-3">
                    <Camera className="w-8 h-8 text-[#AAA69C]/60 mx-auto" />
                    <h3 className="text-sm font-bold text-white">No Photos Uploaded Yet</h3>
                    <p className="text-xs text-[#AAA69C] max-w-sm mx-auto">
                      Businesses with real photos receive up to 5x more views from neighborhood explorers.
                    </p>
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      className="px-4 py-1.5 rounded-full border border-white/20 hover:border-white text-xs font-medium text-white transition cursor-pointer"
                    >
                      Select Photo to Upload
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {placeImages.map((img) => {
                      const imgUrl = img.image_url || img.url || img.image_path;
                      const isCover = Boolean(img.is_cover);

                      return (
                        <div
                          key={img.id}
                          className={`relative aspect-[4/3] rounded-xl overflow-hidden border bg-black/60 group shadow-md ${
                            isCover ? 'border-white/40 ring-1 ring-white/20' : 'border-white/10'
                          }`}
                        >
                          <img
                            src={imgUrl}
                            alt="Venue"
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = PLACE_PLACEHOLDER;
                            }}
                          />

                          {/* Cover Badge */}
                          {isCover && (
                            <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-[10px] font-mono text-white/90">
                              Cover Photo
                            </div>
                          )}

                          {/* Action Overlay */}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-3">
                            {!isCover && (
                              <button
                                type="button"
                                onClick={() => handleSetCoverPhoto(img.id)}
                                className="px-3 py-1.5 rounded-full bg-white/20 hover:bg-white text-white hover:text-black text-xs font-medium backdrop-blur-md transition cursor-pointer"
                              >
                                Set as Cover
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDeletePhoto(img.id)}
                              className="p-2 rounded-full bg-black/70 hover:bg-red-500 text-[#AAA69C] hover:text-white transition cursor-pointer"
                              title="Delete Photo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: MENU & DISHES */}
            {activeTab === 'menu' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="p-5 sm:p-7 rounded-2xl bg-[#151518] border border-white/[0.08] shadow-xl space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
                    <div>
                      <h2 className="text-lg font-bold text-white font-display">Menu &amp; Offerings</h2>
                      <p className="text-xs text-[#AAA69C]">
                        Organize your culinary menu into sections (e.g. Starters, Traditional Wot, Hot Beverages).
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleOpenCreateSection}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black font-bold text-xs hover:bg-[#F5F2EA] transition active:scale-95 cursor-pointer shadow-md self-start sm:self-auto"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Menu Section</span>
                    </button>
                  </div>

                  {isLoadingMenu ? (
                    <div className="py-12 text-center text-xs font-mono text-[#AAA69C]">
                      Loading menu sections...
                    </div>
                  ) : menuSections.length === 0 ? (
                    <div className="py-12 text-center rounded-2xl border border-dashed border-white/10 p-8 space-y-3">
                      <UtensilsCrossed className="w-8 h-8 text-[#AAA69C]/60 mx-auto" />
                      <h3 className="text-sm font-bold text-white">No Menu Sections Created</h3>
                      <p className="text-xs text-[#AAA69C] max-w-sm mx-auto">
                        Add sections like "Signature Dishes", "Breakfast", or "Specialty Coffee" to showcase your offerings.
                      </p>
                      <button
                        type="button"
                        onClick={handleOpenCreateSection}
                        className="px-4 py-1.5 rounded-full border border-white/20 hover:border-white text-xs font-medium text-white transition cursor-pointer"
                      >
                        Create Your First Section
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {menuSections.map((section) => (
                        <div
                          key={section.id}
                          className="p-4 sm:p-5 rounded-xl bg-black/40 border border-white/10 space-y-4"
                        >
                          {/* Section Header */}
                          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                            <div className="flex items-center gap-2.5">
                              <h3 className="text-sm sm:text-base font-bold text-white font-display">
                                {section.name}
                              </h3>
                              <span className="text-[11px] font-mono text-[#AAA69C]">
                                ({section.items?.length || 0} items)
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenCreateItem(section.id)}
                                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 hover:bg-white text-white hover:text-black text-xs font-medium transition cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Add Item</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenEditSection(section)}
                                className="p-1.5 rounded-full text-[#AAA69C] hover:text-white hover:bg-white/10 transition cursor-pointer"
                                title="Edit section name"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteSection(section.id)}
                                className="p-1.5 rounded-full text-[#AAA69C] hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                                title="Delete section"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Section Items List */}
                          {(!section.items || section.items.length === 0) ? (
                            <div className="py-4 text-center text-xs text-[#AAA69C]/60 italic font-mono">
                              No items in this section yet. Click "Add Item" above.
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {section.items.map((item) => (
                                <div
                                  key={item.id}
                                  className="p-3.5 rounded-xl bg-[#151518] border border-white/[0.06] flex items-start justify-between gap-3 group"
                                >
                                  {item.image_url && (
                                    <img
                                      src={item.image_url}
                                      alt={item.name}
                                      className="w-14 h-14 rounded-lg object-cover shrink-0 border border-white/10"
                                      onError={(e) => {
                                        e.currentTarget.onerror = null;
                                        e.currentTarget.src = PLACE_PLACEHOLDER;
                                      }}
                                    />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                      <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                                        {item.name}
                                      </h4>
                                      <span className="text-xs font-mono font-semibold text-white shrink-0">
                                        {Number(item.price).toFixed(2)} ETB
                                      </span>
                                    </div>
                                    {item.description && (
                                      <p className="text-[11px] text-[#AAA69C] mt-1 line-clamp-2">
                                        {item.description}
                                      </p>
                                    )}
                                    <div className="flex items-center gap-2 mt-2">
                                      <span
                                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full inline-flex items-center gap-1 border ${
                                          item.is_available
                                            ? 'border-white/10 bg-white/5 text-[#AAA69C]'
                                            : 'border-red-500/20 bg-red-950/20 text-red-300'
                                        }`}
                                      >
                                        <span
                                          className={`w-1.5 h-1.5 rounded-full ${
                                            item.is_available ? 'bg-emerald-400' : 'bg-red-400'
                                          }`}
                                        />
                                        <span>{item.is_available ? 'Available' : 'Sold Out'}</span>
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenEditItem(section.id, item)}
                                      className="p-1 rounded text-[#AAA69C] hover:text-white transition"
                                      title="Edit item"
                                    >
                                      <Edit className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteItem(item.id)}
                                      className="p-1 rounded text-[#AAA69C] hover:text-red-400 transition"
                                      title="Delete item"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Section Modal (Create / Edit Section) */}
                {showSectionModal && (
                  <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#151518] border border-white/15 rounded-2xl w-full max-w-md p-5 sm:p-6 space-y-4 shadow-2xl">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm sm:text-base font-bold text-white font-display">
                          {editingSection ? 'Rename Section' : 'New Menu Section'}
                        </h3>
                        <button
                          type="button"
                          onClick={() => setShowSectionModal(false)}
                          className="p-1 rounded-full text-[#AAA69C] hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <form onSubmit={handleSaveSection} className="space-y-4">
                        <div>
                          <label className="block text-xs font-mono uppercase text-[#AAA69C] mb-1">
                            Section Name
                          </label>
                          <input
                            type="text"
                            required
                            autoFocus
                            value={sectionNameInput}
                            onChange={(e) => setSectionNameInput(e.target.value)}
                            placeholder="e.g. Traditional Specialties, Desserts, Cocktails"
                            className="w-full h-10 px-3.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white focus:border-white focus:outline-none transition"
                          />
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setShowSectionModal(false)}
                            className="px-4 py-1.5 rounded-full border border-white/10 text-xs font-medium text-[#AAA69C] hover:text-white transition"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isSavingSection}
                            className="px-4 py-1.5 rounded-full bg-white text-black text-xs font-bold hover:bg-[#F5F2EA] transition disabled:opacity-50"
                          >
                            {isSavingSection ? 'Saving...' : 'Save Section'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* Menu Item Modal (Create / Edit Item) */}
                {showItemModal && (
                  <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-[#151518] border border-white/15 rounded-2xl w-full max-w-lg p-5 sm:p-6 space-y-4 shadow-2xl relative my-8">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold text-white font-display">
                          {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
                        </h3>
                        <button
                          type="button"
                          onClick={() => setShowItemModal(false)}
                          className="p-1.5 rounded-full text-[#AAA69C] hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <form onSubmit={handleSaveItem} className="space-y-4">
                        <div>
                          <label className="block text-xs font-mono uppercase text-[#AAA69C] mb-1">
                            Dish / Item Name <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={itemFormData.name}
                            onChange={(e) => setItemFormData({ ...itemFormData, name: e.target.value })}
                            placeholder="e.g. Special Doro Wot with Ayib"
                            className="w-full h-10 px-3.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white focus:border-white focus:outline-none transition"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-mono uppercase text-[#AAA69C] mb-1">
                            Price (ETB) <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            required
                            value={itemFormData.price}
                            onChange={(e) => setItemFormData({ ...itemFormData, price: e.target.value })}
                            placeholder="e.g. 450.00"
                            className="w-full h-10 px-3.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white font-mono focus:border-white focus:outline-none transition"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-mono uppercase text-[#AAA69C] mb-1">
                            Description &amp; Ingredients
                          </label>
                          <textarea
                            rows={3}
                            value={itemFormData.description}
                            onChange={(e) => setItemFormData({ ...itemFormData, description: e.target.value })}
                            placeholder="Slow-simmered chicken drumstick in berbere reduction, boiled egg, farmer's cheese..."
                            className="w-full p-3 rounded-xl bg-black/60 border border-white/15 text-xs text-white focus:border-white focus:outline-none transition resize-none"
                          />
                        </div>

                        {/* Dish Photo */}
                        <div>
                          <label className="block text-xs font-mono uppercase text-[#AAA69C] mb-1">
                            Dish Photograph (Cloudinary)
                          </label>
                          <input
                            ref={itemPhotoInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            onChange={handleUploadItemPhoto}
                            className="hidden"
                          />

                          {itemFormData.image_url ? (
                            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-black/40 border border-white/10">
                              <img
                                src={itemFormData.image_url}
                                alt="Dish"
                                className="w-12 h-12 rounded-lg object-cover border border-white/15"
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = PLACE_PLACEHOLDER;
                                }}
                              />
                              <div className="flex-1 min-w-0 text-xs text-[#AAA69C] font-mono truncate">
                                Photo attached
                              </div>
                              <button
                                type="button"
                                onClick={() => setItemFormData({ ...itemFormData, image_url: '' })}
                                className="p-1 rounded text-[#AAA69C] hover:text-red-400"
                                title="Remove photo"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => itemPhotoInputRef.current?.click()}
                              disabled={isUploadingItemPhoto}
                              className="w-full py-2.5 rounded-xl border border-dashed border-white/15 hover:border-white/30 text-xs font-medium text-[#AAA69C] hover:text-white transition flex items-center justify-center gap-2"
                            >
                              {isUploadingItemPhoto ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  <span>Uploading dish photo...</span>
                                </>
                              ) : (
                                <>
                                  <Camera className="w-3.5 h-3.5" />
                                  <span>Upload dish photo</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>

                        {/* Available switch */}
                        <div className="flex items-center gap-2.5 pt-1">
                          <input
                            type="checkbox"
                            id="item-available"
                            checked={itemFormData.is_available}
                            onChange={(e) => setItemFormData({ ...itemFormData, is_available: e.target.checked })}
                            className="w-4 h-4 rounded accent-white bg-black/60 border-white/20"
                          />
                          <label htmlFor="item-available" className="text-xs font-medium text-white cursor-pointer">
                            Available on Menu (Uncheck if sold out)
                          </label>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.06]">
                          <button
                            type="button"
                            onClick={() => setShowItemModal(false)}
                            className="px-4 py-1.5 rounded-full border border-white/10 text-xs font-medium text-[#AAA69C] hover:text-white transition"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isSavingItem}
                            className="px-4 py-1.5 rounded-full bg-white text-black text-xs font-bold hover:bg-[#F5F2EA] transition disabled:opacity-50"
                          >
                            {isSavingItem ? 'Saving...' : 'Save Item'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: OPERATING HOURS */}
            {activeTab === 'hours' && (
              <div className="p-5 sm:p-7 rounded-2xl bg-[#151518] border border-white/[0.08] shadow-xl space-y-6 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-white font-display">Weekly Operating Schedule</h2>
                    <p className="text-xs text-[#AAA69C]">
                      Configure operating days and opening/closing hours in East Africa Time (EAT).
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleApplyPresetHours}
                    className="px-3.5 py-1.5 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-medium text-[#AAA69C] hover:text-white transition cursor-pointer self-start sm:self-auto"
                  >
                    Reset Standard Hours (08:00–22:00)
                  </button>
                </div>

                <div className="divide-y divide-white/[0.06]">
                  {schedule.map((day) => (
                    <div
                      key={day.day_of_week}
                      className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 w-36">
                        <input
                          type="checkbox"
                          id={`dash-day-${day.day_of_week}`}
                          checked={day.is_open}
                          onChange={(e) => handleScheduleToggle(day.day_of_week, e.target.checked)}
                          className="w-4 h-4 rounded accent-white bg-black/60 border-white/20"
                        />
                        <label
                          htmlFor={`dash-day-${day.day_of_week}`}
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
                            onChange={(e) => handleScheduleTimeChange(day.day_of_week, 'opens_at', e.target.value)}
                            className="px-3 py-1.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white font-mono focus:border-white focus:outline-none"
                          />
                          <span className="text-xs text-[#AAA69C]">to</span>
                          <input
                            type="time"
                            value={day.closes_at}
                            onChange={(e) => handleScheduleTimeChange(day.day_of_week, 'closes_at', e.target.value)}
                            className="px-3 py-1.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white font-mono focus:border-white focus:outline-none"
                          />
                        </div>
                      ) : (
                        <span className="text-xs font-mono text-[#AAA69C]/40 italic">Closed all day</span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-white/[0.06] flex items-center justify-end">
                  <button
                    type="button"
                    onClick={handleSaveOperatingHours}
                    disabled={isSavingHours}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black font-bold text-xs hover:bg-[#F5F2EA] transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-md"
                  >
                    {isSavingHours ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving Schedule...</span>
                      </>
                    ) : (
                      <span>Save Operating Hours</span>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* TAB 6: LOCATION & GPS */}
            {activeTab === 'location' && (
              <div className="p-5 sm:p-7 rounded-2xl bg-[#151518] border border-white/[0.08] shadow-xl space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-white/[0.06] pb-4">
                  <h2 className="text-lg font-bold text-white font-display">Location &amp; Coordinates</h2>
                  <p className="text-xs text-[#AAA69C]">
                    Ensure accurate coordinates so guests nearby can easily find your spot on the radar and map.
                  </p>
                </div>

                <form onSubmit={handleSaveLocation} className="space-y-5">
                  <div>
                    <label className="block text-xs font-mono uppercase text-[#AAA69C] mb-1.5">
                      Physical Address <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={locationForm.address}
                      onChange={(e) => setLocationForm({ ...locationForm, address: e.target.value })}
                      className="w-full h-11 px-4 rounded-xl bg-black/60 border border-white/15 text-sm text-white focus:border-white focus:outline-none transition"
                    />
                  </div>

                  {/* Geolocation Button */}
                  <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-xs font-semibold text-white">Browser GPS Location</h3>
                        <p className="text-[11px] text-[#AAA69C]">
                          Click to capture your current coordinates via browser permission.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleGetCurrentLocation}
                        disabled={geoLoading}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition active:scale-95 disabled:opacity-50 cursor-pointer self-start sm:self-auto"
                      >
                        {geoLoading ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Getting Location...</span>
                          </>
                        ) : (
                          <>
                            <Navigation className="w-3.5 h-3.5" />
                            <span>Use Current Location</span>
                          </>
                        )}
                      </button>
                    </div>

                    {geoError && (
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-[#AAA69C] flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                        <span>{geoError}</span>
                      </div>
                    )}

                    {geoSuccess && (
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white/90 flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{geoSuccess}</span>
                      </div>
                    )}
                  </div>

                  {/* Manual Coordinates */}
                  <div>
                    <span className="block text-xs font-semibold text-white mb-2">
                      Coordinates
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-mono uppercase text-[#AAA69C] mb-1">
                          Latitude (-90 to 90)
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={locationForm.latitude}
                          onChange={(e) => setLocationForm({ ...locationForm, latitude: e.target.value })}
                          placeholder="e.g. 9.0225"
                          className="w-full h-10 px-3 rounded-xl bg-black/60 border border-white/15 text-xs text-white font-mono focus:border-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono uppercase text-[#AAA69C] mb-1">
                          Longitude (-180 to 180)
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={locationForm.longitude}
                          onChange={(e) => setLocationForm({ ...locationForm, longitude: e.target.value })}
                          placeholder="e.g. 38.8310"
                          className="w-full h-10 px-3 rounded-xl bg-black/60 border border-white/15 text-xs text-white font-mono focus:border-white focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Leaflet Map Interactive Pin */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#AAA69C]">
                      <span>INTERACTIVE MAP PIN ADJUSTMENT</span>
                      <span className="text-[#AAA69C]/60">Drag pin or click map to reposition</span>
                    </div>
                    <LeafletMap
                      lat={parseFloat(locationForm.latitude) || 9.0225}
                      lng={parseFloat(locationForm.longitude) || 38.831}
                      zoom={15}
                      name={place.name}
                      address={locationForm.address}
                      draggableMarker={true}
                      onLocationSelect={handleMapPinSelect}
                      className="h-60 sm:h-72 w-full rounded-xl overflow-hidden border border-white/10"
                    />
                  </div>

                  <div className="pt-4 border-t border-white/[0.06] flex items-center justify-end">
                    <button
                      type="submit"
                      disabled={isSavingLocation}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black font-bold text-xs hover:bg-[#F5F2EA] transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-md"
                    >
                      {isSavingLocation ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Updating Location...</span>
                        </>
                      ) : (
                        <span>Update Location &amp; Coordinates</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* DANGER ZONE (Bottom of Dashboard) */}
            <div className="p-5 sm:p-6 rounded-2xl bg-red-950/15 border border-red-500/20 space-y-3">
              <h3 className="text-sm font-bold text-red-400 font-display">Danger Zone</h3>
              <p className="text-xs text-[#AAA69C]">
                Permanently delete this business listing along with all photos, menu sections, and opening schedules. This action cannot be undone.
              </p>
              <button
                type="button"
                onClick={handleDeleteBusiness}
                disabled={isDeletingBusiness}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-red-500/30 bg-red-950/30 hover:bg-red-950/50 text-xs font-semibold text-red-300 hover:text-red-200 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeletingBusiness ? 'Deleting...' : 'Delete Business Listing'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BusinessDashboardPage;

