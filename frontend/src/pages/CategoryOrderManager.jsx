import { useState, useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowUpIcon, ArrowDownIcon, EyeIcon, EyeSlashIcon, CheckIcon, ArrowPathIcon, PlusIcon, TrashIcon, PencilIcon, XMarkIcon } from '@heroicons/react/20/solid';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CategoryOrderManager = () => {
  const queryClient = useQueryClient();
  const [categories, setCategories] = useState([]);
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

  // Fetch current category order
  const fetchOrder = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE_URL}/api/category-order`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories);
        setHasChanges(false);
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load category order' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrder(); }, [fetchOrder]);

  // Focus add input when form opens
  useEffect(() => {
    if (showAddForm && addInputRef.current) addInputRef.current.focus();
  }, [showAddForm]);

  // Focus edit input when editing starts
  useEffect(() => {
    if (editingIndex !== null && editInputRef.current) editInputRef.current.focus();
  }, [editingIndex]);

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
    // Invalidate React Query caches so Navbar, AllProductsPage, etc. get fresh data
    queryClient.invalidateQueries({ queryKey: ['categoryOrder'] });
    queryClient.invalidateQueries({ queryKey: ['products', 'grouped'] });
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

  // --- Add Category ---
  const addCategory = () => {
    const name = newCategoryName.trim();
    if (!name) return;
    if (categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
      setMessage({ type: 'error', text: `Category "${name}" already exists` });
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    setCategories([...categories, { name, isVisible: true }]);
    setNewCategoryName('');
    setShowAddForm(false);
    setHasChanges(true);
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

    // If the name actually changed, call the rename API to update products too
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
        setMessage({ type: 'success', text: `Renamed "${oldName}" → "${name}" (${data.productsUpdated} products updated)` });
        setTimeout(() => setMessage(null), 4000);

        // Invalidate React Query caches
        queryClient.invalidateQueries({ queryKey: ['categoryOrder'] });
        queryClient.invalidateQueries({ queryKey: ['products'] });
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

  // --- Delete Category ---
  const deleteCategory = (index) => {
    const newList = categories.filter((_, i) => i !== index);
    setCategories(newList);
    setDeleteConfirmIndex(null);
    setHasChanges(true);
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
        <h2 className="text-2xl font-bold text-stone-900">Category Display Order</h2>
        <p className="text-sm text-stone-500 mt-1">
          Manage, reorder, rename, add, or delete categories. This controls how products are grouped on the All Products page.
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
          {categories.length} categories &middot; {categories.filter(c => c.isVisible).length} visible
        </span>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => { setShowAddForm(true); setEditingIndex(null); setDeleteConfirmIndex(null); }}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-teal-700 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors"
          >
            <PlusIcon className="h-4 w-4 mr-1.5" />
            Add Category
          </button>
          <button
            onClick={fetchOrder}
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

      {/* Add Category Form */}
      {showAddForm && (
        <div className="mb-4 p-4 bg-teal-50 border border-teal-200 rounded-xl flex items-center gap-3">
          <input
            ref={addInputRef}
            type="text"
            value={newCategoryName}
            onChange={e => setNewCategoryName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addCategory(); if (e.key === 'Escape') { setShowAddForm(false); setNewCategoryName(''); } }}
            placeholder="Enter new category name..."
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
        {categories.map((cat, index) => (
          <div
            key={cat.name + index}
            draggable={editingIndex !== index}
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={() => handleDrop(index)}
            onDragEnd={handleDragEnd}
            className={`flex items-center px-4 py-3 transition-all ${editingIndex !== index ? 'cursor-grab active:cursor-grabbing' : ''} ${
              dragIndex === index ? 'opacity-40' : ''
            } ${dragOverIndex === index && dragIndex !== index ? 'bg-teal-50 border-l-4 border-l-teal-400' : ''}
            ${!cat.isVisible ? 'bg-stone-50' : 'hover:bg-stone-50'}`}
          >
            {/* Drag handle + position number */}
            <div className="flex items-center mr-3 select-none">
              <svg className="h-5 w-5 text-stone-300 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
              </svg>
              <span className="text-xs font-mono text-stone-400 w-6 text-right">{index + 1}</span>
            </div>

            {/* Category name — editable or display */}
            <div className="flex-1 min-w-0">
              {editingIndex === index ? (
                <div className="flex items-center gap-2">
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
                <span className={`text-sm font-medium ${cat.isVisible ? 'text-stone-800' : 'text-stone-400 line-through'}`}>
                  {cat.name}
                </span>
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
                      className="p-1 text-red-600 hover:text-red-800 transition-colors"
                      title="Confirm delete"
                    >
                      <CheckIcon className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmIndex(null)}
                      className="p-1 text-stone-400 hover:text-stone-600 transition-colors"
                      title="Cancel"
                    >
                      <XMarkIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setDeleteConfirmIndex(index); setEditingIndex(null); }}
                    className="p-1.5 rounded-md text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Delete category"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        ))}

        {categories.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-stone-400">
            No categories yet. Click <strong>Add Category</strong> to create one.
          </div>
        )}
      </div>

      {/* Help text */}
      <div className="mt-4 p-4 bg-stone-50 rounded-lg border border-stone-200">
        <h3 className="text-sm font-semibold text-stone-700 mb-2">How it works</h3>
        <ul className="text-xs text-stone-500 space-y-1 list-disc list-inside">
          <li>Categories at the top appear first on the All Products page</li>
          <li>Use the <strong>pencil icon</strong> to rename a category, <strong>trash icon</strong> to delete</li>
          <li>Click <strong>Add Category</strong> to create a new one (appended at end)</li>
          <li>Hidden categories (eye icon off) won't show on the public page</li>
          <li>New categories from products are auto-detected and appended</li>
          <li>Click <strong>Save Order</strong> to apply all your changes</li>
        </ul>
      </div>
    </div>
  );
};

export default CategoryOrderManager;
