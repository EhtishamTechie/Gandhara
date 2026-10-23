import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckIcon,
  ArrowPathIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ArrowUpCircleIcon
} from '@heroicons/react/20/solid';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CategoryOrderManager = () => {
  const queryClient = useQueryClient();
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [message, setMessage] = useState(null);
  const [dragIndex, setDragIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const dragItem = useRef(null);

  // Add / Edit / Delete state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState(null);
  const addInputRef = useRef(null);
  const editInputRef = useRef(null);

  // Subcategory management state
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [newSubNames, setNewSubNames] = useState({});
  const [deleteSubConfirm, setDeleteSubConfirm] = useState({});
  const [promotingSubId, setPromotingSubId] = useState(null);
  const [deletingSubId, setDeletingSubId] = useState(null);

  // Fetch current category order
  const fetchOrder = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE_URL}/api/admin/category-order`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: 'no-store'
      });
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories || []);
        setHasChanges(false);
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load category order' });
    }
  }, []);

  // Fetch subcategories
  const fetchSubcategories = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE_URL}/api/admin/subcategories`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: 'no-store'
      });
      const data = await res.json();
      if (data.success) {
        setSubcategories(data.subcategories || []);
      }
    } catch (err) {
      console.error('Failed to load subcategories:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchOrder(), fetchSubcategories()]);
      setLoading(false);
    };
    loadAll();
  }, [fetchOrder, fetchSubcategories]);

  // Focus add input when form opens
  useEffect(() => {
    if (showAddForm && addInputRef.current) addInputRef.current.focus();
  }, [showAddForm]);

  // Focus edit input when editing starts
  useEffect(() => {
    if (editingIndex !== null && editInputRef.current) editInputRef.current.focus();
  }, [editingIndex]);

  // Map subcategories by parent category name
  const subcategoriesByParent = useMemo(() => {
    const map = {};
    (subcategories || []).forEach(sub => {
      const parent = sub.parentCategoryName || '';
      if (!map[parent]) map[parent] = [];
      map[parent].push(sub);
    });
    return map;
  }, [subcategories]);

  // Toggle category expand/collapse for subcategories
  const toggleExpand = (catName) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(catName)) {
        next.delete(catName);
      } else {
        next.add(catName);
      }
      return next;
    });
  };

  // Save updated order
  const saveOrder = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE_URL}/api/admin/category-order`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ categories })
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Category order saved successfully!' });
        setHasChanges(false);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to save' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error — could not save' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  // Save and re-fetch to ensure UI is in sync with backend
  const handleSave = async () => {
    await saveOrder();
    queryClient.invalidateQueries({ queryKey: ['categoryOrder'] });
    queryClient.invalidateQueries({ queryKey: ['products', 'grouped'] });
    queryClient.invalidateQueries({ queryKey: ['categoryTree'] });
    queryClient.invalidateQueries({ queryKey: ['sidebarSettings'] });
    await fetchOrder();
  };

  // Move category up/down
  const moveCategory = (index, direction) => {
    const newList = [...categories];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newList.length) return;
    [newList[index], newList[targetIndex]] = [newList[targetIndex], newList[index]];
    setCategories(newList);
    setHasChanges(true);
  };

  // Toggle visibility
  const toggleVisibility = (index) => {
    const newList = [...categories];
    newList[index] = { ...newList[index], isVisible: !newList[index].isVisible };
    setCategories(newList);
    setHasChanges(true);
  };

  // --- Add Category (Persisted Directly to Database) ---
  const addCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) return;
    if (categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
      setMessage({ type: 'error', text: `Category "${name}" already exists` });
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    const updated = [...categories, { name, isVisible: true }];
    setCategories(updated);
    setNewCategoryName('');
    setShowAddForm(false);

    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE_URL}/api/admin/category-order`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ categories: updated })
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: `Category "${name}" added and saved successfully!` });
        setHasChanges(false);
        queryClient.invalidateQueries({ queryKey: ['categoryOrder'] });
        queryClient.invalidateQueries({ queryKey: ['categoryTree'] });
        queryClient.invalidateQueries({ queryKey: ['sidebarSettings'] });
        queryClient.invalidateQueries({ queryKey: ['products'] });
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to save new category' });
        setHasChanges(true);
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error — could not save category' });
      setHasChanges(true);
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  // --- Rename Category ---
  const startEditing = (index) => {
    setEditingIndex(index);
    setEditingName(categories[index].name);
    setDeleteConfirmIndex(null);
  };

  const confirmRename = async () => {
    const name = editingName.trim();
    if (!name) return;
    if (categories.some((c, i) => i !== editingIndex && c.name.toLowerCase() === name.toLowerCase())) {
      setMessage({ type: 'error', text: `Category "${name}" already exists` });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    const oldName = categories[editingIndex].name;

    if (oldName !== name) {
      try {
        const token = localStorage.getItem('adminToken');
        const res = await fetch(`${API_BASE_URL}/api/admin/category-order/rename`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ oldName, newName: name })
        });
        const data = await res.json();
        if (!data.success) {
          setMessage({ type: 'error', text: data.message || 'Failed to rename category' });
          setTimeout(() => setMessage(null), 3000);
          return;
        }
        setMessage({ type: 'success', text: `Renamed "${oldName}" → "${name}" (${data.productsUpdated || 0} products updated)` });
        setTimeout(() => setMessage(null), 4000);

        queryClient.invalidateQueries({ queryKey: ['categoryOrder'] });
        queryClient.invalidateQueries({ queryKey: ['categoryTree'] });
        queryClient.invalidateQueries({ queryKey: ['sidebarSettings'] });
        queryClient.invalidateQueries({ queryKey: ['products'] });
        await fetchSubcategories();
      } catch (err) {
        setMessage({ type: 'error', text: 'Network error — could not rename category' });
        setTimeout(() => setMessage(null), 3000);
        return;
      }
    }

    const newList = [...categories];
    newList[editingIndex] = { ...newList[editingIndex], name };
    setCategories(newList);
    setEditingIndex(null);
    setEditingName('');
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setEditingName('');
  };

  // --- Delete Category (Permanent: deletes from MongoDB CategoryOrder, Sidebar, Subcategories & Products) ---
  const deleteCategory = async (index) => {
    const deletedName = categories[index]?.name;
    if (!deletedName) return;

    setDeleteConfirmIndex(null);
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE_URL}/api/admin/category-order/${encodeURIComponent(deletedName)}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setMessage({
          type: 'success',
          text: `Category "${deletedName}" deleted permanently (${data.productsUpdated || 0} products updated).`
        });
        setCategories(prev => prev.filter(c => c.name !== deletedName));
        setHasChanges(false);

        queryClient.invalidateQueries({ queryKey: ['categoryOrder'] });
        queryClient.invalidateQueries({ queryKey: ['categoryTree'] });
        queryClient.invalidateQueries({ queryKey: ['sidebarSettings'] });
        queryClient.invalidateQueries({ queryKey: ['products'] });

        await Promise.all([fetchOrder(), fetchSubcategories()]);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to delete category' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error — could not delete category' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  // --- Subcategory Actions ---

  // 1. Add Subcategory
  const handleAddSubcategory = async (parentCategoryName) => {
    const name = (newSubNames[parentCategoryName] || '').trim();
    if (!name) return;
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE_URL}/api/admin/subcategories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, parentCategoryName })
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: `Subcategory "${name}" added under "${parentCategoryName}".` });
        setNewSubNames(prev => ({ ...prev, [parentCategoryName]: '' }));
        await fetchSubcategories();
        queryClient.invalidateQueries({ queryKey: ['categoryTree'] });
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to add subcategory' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error — could not add subcategory' });
    } finally {
      setTimeout(() => setMessage(null), 4000);
    }
  };

  // 2. Delete Subcategory
  const handleDeleteSubcategory = async (subId, subName) => {
    setDeletingSubId(subId);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE_URL}/api/admin/subcategories/${subId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: `Subcategory "${subName}" deleted.` });
        setDeleteSubConfirm(prev => ({ ...prev, [subId]: false }));
        await fetchSubcategories();
        queryClient.invalidateQueries({ queryKey: ['categoryTree'] });
        queryClient.invalidateQueries({ queryKey: ['products'] });
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to delete subcategory' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error — could not delete subcategory' });
    } finally {
      setDeletingSubId(null);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  // 3. Promote Subcategory to Top-Level Main Category
  const handlePromoteSubcategory = async (subId, subName) => {
    setPromotingSubId(subId);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE_URL}/api/admin/subcategories/${subId}/promote`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setMessage({
          type: 'success',
          text: `Subcategory "${subName}" promoted to Main Category! (${data.productsUpdated || 0} products updated)`
        });
        await Promise.all([fetchOrder(), fetchSubcategories()]);
        queryClient.invalidateQueries({ queryKey: ['categoryOrder'] });
        queryClient.invalidateQueries({ queryKey: ['categoryTree'] });
        queryClient.invalidateQueries({ queryKey: ['sidebarSettings'] });
        queryClient.invalidateQueries({ queryKey: ['products'] });
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to promote subcategory' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error — could not promote subcategory' });
    } finally {
      setPromotingSubId(null);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  // --- Drag & Drop handlers ---
  const handleDragStart = (index) => {
    dragItem.current = index;
    setDragIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (index) => {
    const from = dragItem.current;
    if (from === null || from === index) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }
    const newList = [...categories];
    const [removed] = newList.splice(from, 1);
    newList.splice(index, 0, removed);
    setCategories(newList);
    setHasChanges(true);
    setDragIndex(null);
    setDragOverIndex(null);
    dragItem.current = null;
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
    dragItem.current = null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-stone-900">Category &amp; Subcategory Order</h2>
        <p className="text-sm text-stone-500 mt-1">
          Manage, reorder, rename, add, or delete categories and subcategories. Click a category’s subcategory badge to view, add, delete, or promote subcategories to main categories.
        </p>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Action bar */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <span className="text-sm text-stone-500">
          {categories.length} main categories &middot; {subcategories.length} subcategories
        </span>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => { setShowAddForm(true); setEditingIndex(null); setDeleteConfirmIndex(null); }}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-teal-700 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors"
          >
            <PlusIcon className="h-4 w-4 mr-1.5" />
            Add Main Category
          </button>
          <button
            onClick={() => Promise.all([fetchOrder(), fetchSubcategories()])}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-stone-600 bg-white border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors"
          >
            <ArrowPathIcon className="h-4 w-4 mr-1.5" />
            Refresh
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className={`inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              hasChanges
                ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-sm'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
            }`}
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <CheckIcon className="h-4 w-4 mr-1.5" />
                Save Order
              </>
            )}
          </button>
        </div>
      </div>

      {/* Add Main Category Form */}
      {showAddForm && (
        <div className="mb-4 p-4 bg-teal-50 border border-teal-200 rounded-xl flex items-center gap-3">
          <input
            ref={addInputRef}
            type="text"
            value={newCategoryName}
            onChange={e => setNewCategoryName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addCategory(); if (e.key === 'Escape') { setShowAddForm(false); setNewCategoryName(''); } }}
            placeholder="Enter new main category name..."
            className="flex-1 px-3 py-2 text-sm border border-teal-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
          <button
            onClick={addCategory}
            disabled={!newCategoryName.trim()}
            className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Add
          </button>
          <button
            onClick={() => { setShowAddForm(false); setNewCategoryName(''); }}
            className="p-2 text-stone-400 hover:text-stone-600 transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Category list */}
      <div className="bg-white border border-stone-200 rounded-xl shadow-sm divide-y divide-stone-100">
        {categories.map((cat, index) => {
          const childSubs = subcategoriesByParent[cat.name] || [];
          const isExpanded = expandedCategories.has(cat.name);

          return (
            <div key={cat.name + index} className="transition-all">
              {/* Category Row */}
              <div
                draggable={editingIndex !== index && !isExpanded}
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={() => handleDrop(index)}
                onDragEnd={handleDragEnd}
                className={`flex items-center px-4 py-3 transition-all ${
                  editingIndex !== index && !isExpanded ? 'cursor-grab active:cursor-grabbing' : ''
                } ${dragIndex === index ? 'opacity-40' : ''} ${
                  dragOverIndex === index && dragIndex !== index ? 'bg-teal-50 border-l-4 border-l-teal-400' : ''
                } ${!cat.isVisible ? 'bg-stone-50' : 'hover:bg-stone-50/70'}`}
              >
                {/* Drag handle + position number */}
                <div className="flex items-center mr-3 select-none">
                  <svg className="h-5 w-5 text-stone-300 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
                  </svg>
                  <span className="text-xs font-mono text-stone-400 w-6 text-right">{index + 1}</span>
                </div>

                {/* Category name & Subcategory Accordion Toggle */}
                <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
                  {editingIndex === index ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        ref={editInputRef}
                        type="text"
                        value={editingName}
                        onChange={e => setEditingName(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') confirmRename(); if (e.key === 'Escape') cancelEditing(); }}
                        className="flex-1 px-2 py-1 text-sm border border-teal-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                      <button onClick={confirmRename} className="p-1 text-teal-600 hover:text-teal-800 transition-colors" title="Confirm">
                        <CheckIcon className="h-4 w-4" />
                      </button>
                      <button onClick={cancelEditing} className="p-1 text-stone-400 hover:text-stone-600 transition-colors" title="Cancel">
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className={`text-sm font-medium ${cat.isVisible ? 'text-stone-800' : 'text-stone-400 line-through'}`}>
                        {cat.name}
                      </span>

                      {/* Subcategory toggle badge */}
                      <button
                        type="button"
                        onClick={() => toggleExpand(cat.name)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full transition-colors cursor-pointer ${
                          childSubs.length > 0
                            ? isExpanded
                              ? 'bg-teal-100 text-teal-800 border border-teal-300 shadow-2xs'
                              : 'bg-stone-100 text-stone-700 hover:bg-teal-50 hover:text-teal-700 border border-stone-200'
                            : 'bg-stone-50 text-stone-400 hover:bg-stone-100 hover:text-stone-600 border border-dashed border-stone-300'
                        }`}
                        title="Click to view and manage subcategories"
                      >
                        {isExpanded ? (
                          <ChevronDownIcon className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronRightIcon className="h-3.5 w-3.5" />
                        )}
                        <span>{childSubs.length > 0 ? `${childSubs.length} subcategories` : '+ add sub'}</span>
                      </button>
                    </>
                  )}
                </div>

                {/* Controls */}
                {editingIndex !== index && (
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={() => moveCategory(index, 'up')}
                      disabled={index === 0}
                      className="p-1.5 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Move up"
                    >
                      <ArrowUpIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => moveCategory(index, 'down')}
                      disabled={index === categories.length - 1}
                      className="p-1.5 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Move down"
                    >
                      <ArrowDownIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => toggleVisibility(index)}
                      className={`p-1.5 rounded-md transition-colors ${
                        cat.isVisible 
                          ? 'text-teal-600 hover:bg-teal-50' 
                          : 'text-stone-300 hover:bg-stone-100'
                      }`}
                      title={cat.isVisible ? 'Hide from All Products page' : 'Show on All Products page'}
                    >
                      {cat.isVisible 
                        ? <EyeIcon className="h-4 w-4" /> 
                        : <EyeSlashIcon className="h-4 w-4" />
                      }
                    </button>
                    <div className="w-px h-5 bg-stone-200 mx-0.5" />
                    <button
                      onClick={() => startEditing(index)}
                      className="p-1.5 rounded-md text-stone-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                      title="Rename category"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    {deleteConfirmIndex === index ? (
                      <div className="flex items-center gap-1 ml-1 px-2 py-1 bg-red-50 rounded-md border border-red-200">
                        <span className="text-xs text-red-600 font-medium whitespace-nowrap">Delete?</span>
                        <button
                          onClick={() => deleteCategory(index)}
                          className="p-1 text-red-600 hover:text-red-800 transition-colors cursor-pointer"
                          title="Confirm permanent delete"
                        >
                          <CheckIcon className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmIndex(null)}
                          className="p-1 text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
                          title="Cancel"
                        >
                          <XMarkIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setDeleteConfirmIndex(index); setEditingIndex(null); }}
                        className="p-1.5 rounded-md text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete category"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Subcategories Accordion Panel */}
              {isExpanded && (
                <div className="bg-stone-50 border-t border-stone-200/80 px-6 py-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-600 uppercase tracking-wider">
                      Subcategories under &ldquo;{cat.name}&rdquo; ({childSubs.length})
                    </span>
                    <span className="text-2xs text-stone-400">
                      Promote to main category or delete
                    </span>
                  </div>

                  {/* Subcategories List */}
                  {childSubs.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {childSubs.map((sub) => (
                        <div
                          key={sub._id}
                          className="flex items-center justify-between bg-white border border-stone-200 rounded-lg p-2.5 shadow-2xs hover:border-stone-300 transition-all"
                        >
                          <span className="text-sm font-medium text-stone-800 truncate mr-2" title={sub.name}>
                            {sub.name}
                          </span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* Make Main Category Button */}
                            <button
                              type="button"
                              onClick={() => handlePromoteSubcategory(sub._id, sub.name)}
                              disabled={promotingSubId === sub._id}
                              title="Convert this subcategory to a top-level Main Category"
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded-md hover:bg-teal-100 transition-colors disabled:opacity-50 cursor-pointer"
                            >
                              {promotingSubId === sub._id ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-2 border-teal-600 border-t-transparent" />
                              ) : (
                                <ArrowUpCircleIcon className="h-3.5 w-3.5 text-teal-600" />
                              )}
                              <span>Make Main</span>
                            </button>

                            {/* Delete Subcategory Button */}
                            {deleteSubConfirm[sub._id] ? (
                              <div className="flex items-center gap-1 bg-red-50 border border-red-200 rounded-md px-1.5 py-0.5">
                                <span className="text-2xs text-red-600 font-medium">Delete?</span>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSubcategory(sub._id, sub.name)}
                                  disabled={deletingSubId === sub._id}
                                  className="p-0.5 text-red-600 hover:text-red-800 cursor-pointer"
                                  title="Confirm delete"
                                >
                                  <CheckIcon className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteSubConfirm(prev => ({ ...prev, [sub._id]: false }))}
                                  className="p-0.5 text-stone-400 hover:text-stone-600 cursor-pointer"
                                  title="Cancel"
                                >
                                  <XMarkIcon className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setDeleteSubConfirm(prev => ({ ...prev, [sub._id]: true }))}
                                title="Delete subcategory"
                                className="p-1 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                              >
                                <TrashIcon className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-stone-400 italic py-1">
                      No subcategories under {cat.name} yet. Type below to add one.
                    </div>
                  )}

                  {/* Add Subcategory Input */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={newSubNames[cat.name] || ''}
                      onChange={(e) => setNewSubNames(prev => ({ ...prev, [cat.name]: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSubcategory(cat.name);
                        }
                      }}
                      placeholder={`Add subcategory under ${cat.name}...`}
                      className="flex-1 px-3 py-1.5 text-xs sm:text-sm border border-stone-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddSubcategory(cat.name)}
                      disabled={!(newSubNames[cat.name] || '').trim()}
                      className="inline-flex items-center px-3 py-1.5 text-xs sm:text-sm font-semibold text-white bg-teal-600 rounded-md hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      <PlusIcon className="h-3.5 w-3.5 mr-1" />
                      Add Subcategory
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {categories.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-stone-400">
            No categories yet. Click <strong>Add Main Category</strong> to create one.
          </div>
        )}
      </div>

      {/* Help text */}
      <div className="mt-4 p-4 bg-stone-50 rounded-lg border border-stone-200">
        <h3 className="text-sm font-semibold text-stone-700 mb-2">Category &amp; Subcategory Features</h3>
        <ul className="text-xs text-stone-500 space-y-1 list-disc list-inside">
          <li>Categories at the top appear first on the All Products page. Drag using the handle or use Up/Down arrows.</li>
          <li>Click the <strong>subcategories badge</strong> (e.g. &quot;3 subcategories&quot;) next to any category to expand and manage its subcategories.</li>
          <li>Click <strong>Make Main</strong> on any subcategory to promote it to a top-level Main Category.</li>
          <li>Click the <strong>trash icon</strong> to permanently delete any category or subcategory (removes from database and clears references from products so it will never resurrect).</li>
          <li>Hidden categories (eye icon off) won&apos;t show on the public page.</li>
          <li>Click <strong>Save Order</strong> to apply any reordering or visibility toggles.</li>
        </ul>
      </div>
    </div>
  );
};

export default CategoryOrderManager;
