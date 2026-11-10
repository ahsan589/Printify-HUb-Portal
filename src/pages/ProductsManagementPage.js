import React, { useMemo, useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import useAuthUser from '../hooks/useAuthUser';
import { isAdminUser } from '../utils/auth';
import {
  createEmptyBundleItem,
  createEmptyCustomizationGroup,
  createEmptyPricingMatrixRow,
  createEmptyProductForm,
  formatPriceDisplay,
  normaliseCustomizationGroups,
  normaliseBundleItems,
  normalisePricingMatrix,
  normaliseProductPrice,
  splitLines,
  splitValues,
} from '../utils/productHelpers';

const CLOUDINARY_CLOUD_NAME = 'dg5fojcpg';
const CLOUDINARY_UPLOAD_PRESET = 'app_uploads';

export default function ProductsManagementPage() {
  const user = useAuthUser();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState(createEmptyProductForm());
  const [uploading, setUploading] = useState(false);

  // Filter groups that have a name, at least one option, and are marked for pricing
  const activeCustomizationGroups = useMemo(
    () =>
      newProduct.customizationGroups
        .map((group) => ({
          ...group,
          name: (group.name || '').trim(),
          parsedOptions: splitValues(group.optionsText || ''),
          useInPricing: group.useInPricing ?? true, // default to true
        }))
        .filter((group) => group.name && group.parsedOptions.length && group.useInPricing),
    [newProduct.customizationGroups]
  );

  const isAdmin = isAdminUser(user);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return undefined;
    }

    let productsReady = false;
    let categoriesReady = false;

    const unsubscribeProducts = onSnapshot(
      collection(db, 'products'),
      (snapshot) => {
        setProducts(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
        productsReady = true;
        if (categoriesReady) {
          setLoading(false);
        }
      },
      (error) => {
        console.error('Error listening to products:', error);
        productsReady = true;
        if (categoriesReady) {
          setLoading(false);
        }
      }
    );

    const unsubscribeCategories = onSnapshot(
      collection(db, 'categories'),
      (snapshot) => {
        setCategories(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
        categoriesReady = true;
        if (productsReady) {
          setLoading(false);
        }
      },
      (error) => {
        console.error('Error listening to categories:', error);
        categoriesReady = true;
        if (productsReady) {
          setLoading(false);
        }
      }
    );

    return () => {
      unsubscribeProducts();
      unsubscribeCategories();
    };
  }, [isAdmin]);

  // Clean up pricing rows when groups are removed from pricing
  useEffect(() => {
    const pricingGroupNames = activeCustomizationGroups.map(g => g.name);

    setNewProduct((prev) => ({
      ...prev,
      pricingMatrix: prev.pricingMatrix.map((row) => {
        const newSelections = { ...row.selections };
        Object.keys(newSelections).forEach((key) => {
          if (!pricingGroupNames.includes(key)) {
            delete newSelections[key];
          }
        });
        return { ...row, selections: newSelections };
      }),
    }));
  }, [activeCustomizationGroups]);

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'products');
    formData.append('resource_type', 'image');

    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    return data.secure_url;
  };

  const handleImageUpload = async (files) => {
    setUploading(true);
    const cloudinaryUrls = [];

    try {
      for (const file of files) {
        const url = await uploadToCloudinary(file);
        cloudinaryUrls.push(url);
      }

      setNewProduct((prev) => ({
        ...prev,
        images: [...prev.images, ...cloudinaryUrls],
      }));

      alert(`${cloudinaryUrls.length} image(s) uploaded successfully!`);
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Failed to upload images: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleBundleItemImageUpload = async (index, file) => {
    if (!file) return;

    setUploading(true);

    try {
      const url = await uploadToCloudinary(file);
      updateBundleItem(index, 'image', url);
      alert('Bundle item image uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Failed to upload bundle item image: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setNewProduct((prev) => ({
      ...prev,
      images: prev.images.filter((_, imageIndex) => imageIndex !== index),
    }));
  };

  const addProduct = async () => {
    const hasMatrixPricing = newProduct.pricingMatrix.some((row) => row.price !== '');

    if (!newProduct.name || (!newProduct.price && !hasMatrixPricing) || !newProduct.categoryId) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      // Normalise all groups for storage
      const allGroups = normaliseCustomizationGroups(newProduct.customizationGroups);
      // Get only groups used for pricing to pass to pricing matrix normalisation
      const pricingGroups = activeCustomizationGroups.map((group) => ({
        name: group.name,
        options: group.parsedOptions,
        useInPricing: true,
      }));

      const pricingMatrix = normalisePricingMatrix(newProduct.pricingMatrix, pricingGroups);

      await addDoc(collection(db, 'products'), {
        ...newProduct,
        price: normaliseProductPrice(newProduct.price),
        compareAtPrice: newProduct.compareAtPrice ? parseFloat(newProduct.compareAtPrice) : null,
        bundleItems: normaliseBundleItems(newProduct.bundleItems),
        materials: splitLines(newProduct.materialsText),
        customizationGroups: allGroups,          // store all groups (including non‑pricing)
        pricingMatrix,
        customizationOptions: splitLines(newProduct.customizationOptionsText),
        createdAt: new Date(),
      });

      setModalVisible(false);
      resetForm();
      alert('Product added successfully!');
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product');
    }
  };

  const updateProduct = async () => {
    if (!editingProduct) return;

    try {
      const allGroups = normaliseCustomizationGroups(newProduct.customizationGroups);
      const pricingGroups = activeCustomizationGroups.map((group) => ({
        name: group.name,
        options: group.parsedOptions,
        useInPricing: true,
      }));

      const pricingMatrix = normalisePricingMatrix(newProduct.pricingMatrix, pricingGroups);

      await updateDoc(doc(db, 'products', editingProduct.id), {
        ...newProduct,
        price: normaliseProductPrice(newProduct.price),
        compareAtPrice: newProduct.compareAtPrice ? parseFloat(newProduct.compareAtPrice) : null,
        bundleItems: normaliseBundleItems(newProduct.bundleItems),
        materials: splitLines(newProduct.materialsText),
        customizationGroups: allGroups,
        pricingMatrix,
        customizationOptions: splitLines(newProduct.customizationOptionsText),
      });

      setModalVisible(false);
      setEditingProduct(null);
      resetForm();
      alert('Product updated successfully!');
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product');
    }
  };

  const deleteProduct = async (product) => {
    if (!window.confirm(`Are you sure you want to delete "${product.name}"?`)) return;

    try {
      await deleteDoc(doc(db, 'products', product.id));
      alert('Product deleted successfully!');
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const editProduct = (product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      description: product.description,
      price: product.price?.toString() || '',
      categoryId: product.categoryId,
      images: product.images || [],
      sku: product.sku || '',
      productType: product.productType || (product.bundleItems?.length ? 'bundle' : 'standard'),
      bundleGroup: product.bundleGroup || '',
      compareAtPrice: product.compareAtPrice ? product.compareAtPrice.toString() : '',
      discountText: product.discountText || '',
      shortNote: product.shortNote || '',
      materialsText: (product.materials || []).join('\n'),
      bundleItems: (product.bundleItems || []).map((item) => ({
        title: item.title || '',
        details: item.details || '',
        price: item.price?.toString?.() ?? '',
        originalPrice: item.originalPrice?.toString?.() ?? '',
        image: item.image || '',
      })),
      uploadNote: product.uploadNote || '',
      customizationEnabled: product.customizationEnabled ?? true,
      customizationTitle: product.customizationTitle || 'Customization Options',
      customizationNote: product.customizationNote || '',
      customizationGroups: (product.customizationGroups || []).map((group) => ({
        name: group.name || '',
        optionsText: (group.options || []).join('\n'),
        useInPricing: group.useInPricing ?? true,
      })),
      pricingMatrix: (product.pricingMatrix || []).map((row) => ({
        selections: row.selections || {},
        price: row.price?.toString?.() ?? '',
      })),
      customizationOptionsText: (product.customizationOptions || []).join('\n'),
    });
    setModalVisible(true);
  };

  const resetForm = () => {
    setNewProduct(createEmptyProductForm());
  };

  const updateBundleItem = (index, field, value) => {
    setNewProduct((prev) => ({
      ...prev,
      bundleItems: prev.bundleItems.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addBundleItemRow = () => {
    setNewProduct((prev) => ({
      ...prev,
      bundleItems: [...prev.bundleItems, createEmptyBundleItem()],
    }));
  };

  const removeBundleItemRow = (index) => {
    setNewProduct((prev) => ({
      ...prev,
      bundleItems: prev.bundleItems.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const removeBundleItemImage = (index) => {
    updateBundleItem(index, 'image', '');
  };

  const updateCustomizationGroup = (index, field, value) => {
    setNewProduct((prev) => ({
      ...prev,
      customizationGroups: prev.customizationGroups.map((group, groupIndex) =>
        groupIndex === index ? { ...group, [field]: value } : group
      ),
    }));
  };

  const addCustomizationGroup = () => {
    setNewProduct((prev) => ({
      ...prev,
      customizationGroups: [...prev.customizationGroups, createEmptyCustomizationGroup()],
    }));
  };

  const removeCustomizationGroup = (index) => {
    const removedGroupName = (newProduct.customizationGroups[index]?.name || '').trim();

    setNewProduct((prev) => ({
      ...prev,
      customizationGroups: prev.customizationGroups.filter((_, groupIndex) => groupIndex !== index),
      pricingMatrix: prev.pricingMatrix.map((row) => {
        if (!removedGroupName) return row;
        const nextSelections = { ...row.selections };
        delete nextSelections[removedGroupName];
        return { ...row, selections: nextSelections };
      }),
    }));
  };

  const updatePricingMatrixRow = (index, field, value, groupName) => {
    setNewProduct((prev) => ({
      ...prev,
      pricingMatrix: prev.pricingMatrix.map((row, rowIndex) => {
        if (rowIndex !== index) return row;

        if (field === 'price') {
          return { ...row, price: value };
        }

        return {
          ...row,
          selections: {
            ...row.selections,
            [groupName]: value,
          },
        };
      }),
    }));
  };

  const addPricingMatrixRow = () => {
    setNewProduct((prev) => ({
      ...prev,
      pricingMatrix: [...prev.pricingMatrix, createEmptyPricingMatrixRow()],
    }));
  };

  const removePricingMatrixRow = (index) => {
    setNewProduct((prev) => ({
      ...prev,
      pricingMatrix: prev.pricingMatrix.filter((_, rowIndex) => rowIndex !== index),
    }));
  };

  if (!isAdmin) {
    return (
      <div className="page content">
        <h2>Access Denied</h2>
        <p>You must be an admin to access this page.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page content">
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <div className="admin-page-shell">
      <div className="admin-toolbar">
        <div>
          <p className="eyebrow">Catalog Admin</p>
          <h2>Products Management</h2>
          <p className="subcopy">Create standard products and bundles with a cleaner, easier form.</p>
        </div>
        <button
          className="primary-btn"
          onClick={() => {
            resetForm();
            setEditingProduct(null);
            setModalVisible(true);
          }}
        >
          Add New Product
        </button>
      </div>

      <div className="admin-grid">
        {products.map((product) => (
          <div key={product.id} className="admin-card">
            <div className="admin-card-media">
              {product.images && product.images.length > 0 ? (
                <img src={product.images[0]} alt={product.name} />
              ) : (
                <div className="media-placeholder">{product.name?.charAt(0) || 'P'}</div>
              )}
              <span className={`type-badge ${(product.productType || 'standard') === 'bundle' ? 'bundle' : ''}`}>
                {(product.productType || 'standard') === 'bundle' ? 'Bundle' : 'Standard'}
              </span>
            </div>
            <div className="admin-card-body">
              <h3>{product.name}</h3>
              <p>{product.description || 'No description added yet.'}</p>
              <div className="meta-row"><strong>Price:</strong><span>{formatPriceDisplay(product.price)}</span></div>
              <div className="meta-row"><strong>SKU:</strong><span>{product.sku || 'N/A'}</span></div>
              <div className="card-actions">
                <button className="ghost-btn" onClick={() => editProduct(product)}>Edit</button>
                <button className="danger-btn" onClick={() => deleteProduct(product)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalVisible && (
        <div className="modal-backdrop">
          <div className="modal-panel large">
            <div className="modal-head">
              <div>
                <p className="eyebrow">{newProduct.productType === 'bundle' ? 'Bundle Setup' : 'Product Setup'}</p>
                <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              </div>
              <button className="close-btn" onClick={() => setModalVisible(false)}>×</button>
            </div>

            <div className="form-grid">
              <label className="field span-2">
                <span>Product Name</span>
                <input type="text" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} />
              </label>

              <label className="field span-2">
                <span>Description</span>
                <textarea rows={4} value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} />
              </label>

              <label className="field">
                <span>Price</span>
                <input
                  type="text"
                  placeholder="16500 or 16500 - 100000"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                />
              </label>

              <label className="field">
                <span>Product Type</span>
                <select value={newProduct.productType} onChange={(e) => setNewProduct({ ...newProduct, productType: e.target.value })}>
                  <option value="standard">Standard Product</option>
                  <option value="bundle">Bundle</option>
                </select>
              </label>

              <label className="field">
                <span>Category</span>
                <select value={newProduct.categoryId} onChange={(e) => setNewProduct({ ...newProduct, categoryId: e.target.value })}>
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>SKU</span>
                <input type="text" value={newProduct.sku} onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })} />
              </label>

              <div className="section-card span-2">
                <div className="section-card-head">
                  <h4>Customization</h4>
                  <p>Enable custom text, logo, upload, or design notes for this product.</p>
                </div>
                <div className="form-grid nested">
                  <label className="field checkbox-field span-2">
                    <span>Enable customization for this product</span>
                    <input
                      type="checkbox"
                      checked={newProduct.customizationEnabled}
                      onChange={(e) => setNewProduct({ ...newProduct, customizationEnabled: e.target.checked })}
                    />
                  </label>

                  <label className="field span-2">
                    <span>Customization Title</span>
                    <input
                      type="text"
                      value={newProduct.customizationTitle}
                      onChange={(e) => setNewProduct({ ...newProduct, customizationTitle: e.target.value })}
                    />
                  </label>

                  <label className="field span-2">
                    <span>Customization Note</span>
                    <textarea
                      rows={3}
                      value={newProduct.customizationNote}
                      onChange={(e) => setNewProduct({ ...newProduct, customizationNote: e.target.value })}
                    />
                  </label>

                  <div className="section-card span-2 inner-card">
                    <div className="section-card-head split">
                      <div>
                        <h4>Dropdown Groups</h4>
                        <p>Add option groups like Size, Material, Quantity, Color, and Logo.</p>
                      </div>
                      <button type="button" className="accent-btn" onClick={addCustomizationGroup}>Add Group</button>
                    </div>

                    {newProduct.customizationGroups.length ? (
                      <div className="matrix-group-list">
                        {newProduct.customizationGroups.map((group, index) => (
                          <div key={`group-${index}`} className="matrix-group-card">
                            <div className="matrix-group-head">
                              <strong>Group {index + 1}</strong>
                              <button type="button" className="danger-btn small" onClick={() => removeCustomizationGroup(index)}>Remove</button>
                            </div>

                            <div className="form-grid nested">
                              <label className="field">
                                <span>Group Name</span>
                                <input
                                  type="text"
                                  placeholder="Size"
                                  value={group.name}
                                  onChange={(e) => updateCustomizationGroup(index, 'name', e.target.value)}
                                />
                              </label>

                              {/* NEW: Use in pricing matrix checkbox */}
                              <label className="field checkbox-field">
                                <span>Use in pricing matrix</span>
                                <input
                                  type="checkbox"
                                  checked={group.useInPricing !== false}
                                  onChange={(e) => updateCustomizationGroup(index, 'useInPricing', e.target.checked)}
                                />
                              </label>

                              <label className="field">
                                <span>Options</span>
                                <textarea
                                  rows={4}
                                  placeholder="One option per line, for example:&#10;A4&#10;Legal&#10;A3"
                                  value={group.optionsText}
                                  onChange={(e) => updateCustomizationGroup(index, 'optionsText', e.target.value)}
                                />
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="empty-note">No dropdown groups added yet.</div>
                    )}
                  </div>

                  <div className="section-card span-2 inner-card">
                    <div className="section-card-head split">
                      <div>
                        <h4>Pricing Matrix</h4>
                        <p>Set the final price for each combination like Size + Material + Quantity.</p>
                      </div>
                      <button
                        type="button"
                        className="accent-btn"
                        onClick={addPricingMatrixRow}
                        disabled={!activeCustomizationGroups.length}
                      >
                        Add Price Row
                      </button>
                    </div>

                    {activeCustomizationGroups.length ? (
                      newProduct.pricingMatrix.length ? (
                        <div className="matrix-table-wrap">
                          <table className="matrix-table">
                            <thead>
                              <tr>
                                {activeCustomizationGroups.map((group) => (
                                  <th key={group.name}>{group.name}</th>
                                ))}
                                <th>Price</th>
                                <th>Action</th>
                               </tr>
                            </thead>
                            <tbody>
                              {newProduct.pricingMatrix.map((row, index) => (
                                <tr key={`price-row-${index}`}>
                                  {activeCustomizationGroups.map((group) => (
                                    <td key={`${group.name}-${index}`}>
                                      <select
                                        value={row.selections?.[group.name] || ''}
                                        onChange={(e) => updatePricingMatrixRow(index, 'selection', e.target.value, group.name)}
                                      >
                                        <option value="">Choose</option>
                                        {group.parsedOptions.map((option) => (
                                          <option key={`${group.name}-${option}`} value={option}>{option}</option>
                                        ))}
                                      </select>
                                    </td>
                                  ))}
                                  <td>
                                    <input
                                      type="number"
                                      placeholder="16500"
                                      value={row.price}
                                      onChange={(e) => updatePricingMatrixRow(index, 'price', e.target.value)}
                                    />
                                  </td>
                                  <td>
                                    <button type="button" className="danger-btn small" onClick={() => removePricingMatrixRow(index)}>Remove</button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="empty-note">No pricing rows added yet.</div>
                      )
                    ) : (
                      <div className="empty-note">Add dropdown groups and mark at least one to use in pricing matrix to create the pricing table.</div>
                    )}
                  </div>
                </div>
              </div>

              {newProduct.productType === 'bundle' && (
                <div className="section-card span-2">
                  <div className="section-card-head">
                    <h4>Bundle Details</h4>
                    <p>These fields are used only on the bundle listing and bundle detail view.</p>
                  </div>
                  <div className="form-grid nested">
                    <label className="field">
                      <span>Bundle Group</span>
                      <input type="text" value={newProduct.bundleGroup} onChange={(e) => setNewProduct({ ...newProduct, bundleGroup: e.target.value })} />
                    </label>

                    <label className="field">
                      <span>Compare At Price</span>
                      <input type="number" value={newProduct.compareAtPrice} onChange={(e) => setNewProduct({ ...newProduct, compareAtPrice: e.target.value })} />
                    </label>

                    <label className="field span-2">
                      <span>Discount Text</span>
                      <input type="text" value={newProduct.discountText} onChange={(e) => setNewProduct({ ...newProduct, discountText: e.target.value })} />
                    </label>

                    <label className="field span-2">
                      <span>Short Note</span>
                      <input type="text" value={newProduct.shortNote} onChange={(e) => setNewProduct({ ...newProduct, shortNote: e.target.value })} />
                    </label>

                    <label className="field">
                      <span>Materials</span>
                      <textarea rows={5} value={newProduct.materialsText} onChange={(e) => setNewProduct({ ...newProduct, materialsText: e.target.value })} />
                    </label>

                    <label className="field">
                      <span>Upload Note</span>
                      <textarea rows={5} value={newProduct.uploadNote} onChange={(e) => setNewProduct({ ...newProduct, uploadNote: e.target.value })} />
                    </label>
                  </div>
                </div>
              )}

              <div className="section-card span-2">
                <div className="section-card-head">
                  <h4>Images</h4>
                  <p>Upload gallery images for the storefront card and detail page.</p>
                </div>
                <label className="upload-box">
                  <input
                    type="file"
                    multiple
                    onChange={(e) => e.target.files && handleImageUpload(Array.from(e.target.files))}
                    disabled={uploading}
                  />
                  <span>{uploading ? 'Uploading images...' : 'Choose images or drag them here'}</span>
                </label>

                <div className="preview-grid">
                  {newProduct.images.map((img, index) => (
                    <div key={index} className="preview-card">
                      <img src={img} alt={`Product ${index}`} />
                      <button type="button" className="preview-remove" onClick={() => removeImage(index)}>×</button>
                    </div>
                  ))}
                </div>
              </div>

              {newProduct.productType === 'bundle' && (
                <div className="section-card span-2">
                  <div className="section-card-head split">
                    <div>
                      <h4>Bundle Items</h4>
                      <p>Add every included item and its pricing.</p>
                    </div>
                    <button type="button" className="accent-btn" onClick={addBundleItemRow}>Add Item</button>
                  </div>

                  {newProduct.bundleItems.length === 0 ? (
                    <div className="empty-note">No bundle items added yet.</div>
                  ) : (
                    <div className="bundle-item-list">
                      {newProduct.bundleItems.map((item, index) => (
                        <div key={index} className="bundle-item-editor">
                          <div className="bundle-item-header">
                            <strong>Item {index + 1}</strong>
                            <button type="button" className="danger-btn small" onClick={() => removeBundleItemRow(index)}>Remove</button>
                          </div>
                          <div className="form-grid nested">
                            <label className="field">
                              <span>Title</span>
                              <input type="text" value={item.title} onChange={(e) => updateBundleItem(index, 'title', e.target.value)} />
                            </label>
                            <label className="field">
                              <span>Details</span>
                              <input type="text" value={item.details} onChange={(e) => updateBundleItem(index, 'details', e.target.value)} />
                            </label>
                            <div className="field span-2">
                              <span>Item Image</span>
                              <label className="upload-box compact">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => e.target.files && handleBundleItemImageUpload(index, e.target.files[0])}
                                  disabled={uploading}
                                />
                                <span>{uploading ? 'Uploading image...' : 'Choose item image'}</span>
                              </label>

                              {item.image ? (
                                <div className="bundle-item-image-preview">
                                  <img src={item.image} alt={item.title || `Bundle item ${index + 1}`} />
                                  <button
                                    type="button"
                                    className="preview-remove"
                                    onClick={() => removeBundleItemImage(index)}
                                  >
                                    ×
                                  </button>
                                </div>
                              ) : null}
                            </div>
                            <label className="field">
                              <span>Sale Price</span>
                              <input type="number" value={item.price} onChange={(e) => updateBundleItem(index, 'price', e.target.value)} />
                            </label>
                            <label className="field">
                              <span>Original Price</span>
                              <input type="number" value={item.originalPrice} onChange={(e) => updateBundleItem(index, 'originalPrice', e.target.value)} />
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button className="ghost-btn" onClick={() => setModalVisible(false)}>Cancel</button>
              <button className="primary-btn" onClick={editingProduct ? updateProduct : addProduct}>
                {editingProduct ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx="true">{`
        .admin-page-shell {
          padding: 28px;
          background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
          min-height: 100vh;
        }
        .admin-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: end;
          gap: 16px;
          margin-bottom: 24px;
        }
        .eyebrow {
          margin: 0 0 6px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          font-size: 0.75rem;
          color: #f59e0b;
          font-weight: 800;
        }
        .admin-toolbar h2, .modal-head h3 {
          margin: 0;
          color: #0f172a;
        }
        .subcopy, .section-card-head p {
          margin: 6px 0 0;
          color: #64748b;
        }
        .admin-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }
        .admin-card {
          background: rgba(255,255,255,0.92);
          border: 1px solid #e2e8f0;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
        }
        .admin-card-media {
          position: relative;
          height: 190px;
          background: linear-gradient(135deg, #1d4ed8, #0f172a);
        }
        .admin-card-media img, .media-placeholder {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .media-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 3rem;
          font-weight: 800;
        }
        .type-badge {
          position: absolute;
          top: 14px;
          right: 14px;
          background: rgba(15, 23, 42, 0.82);
          color: white;
          padding: 6px 12px;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 700;
        }
        .type-badge.bundle {
          background: #f59e0b;
        }
        .admin-card-body {
          padding: 18px;
        }
        .admin-card-body h3 {
          margin: 0 0 8px;
          color: #0f172a;
        }
        .admin-card-body p {
          color: #64748b;
          margin: 0 0 14px;
          line-height: 1.55;
        }
        .meta-row {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          padding: 8px 0;
          border-top: 1px solid #eef2f7;
          color: #334155;
        }
        .card-actions, .modal-actions {
          display: flex;
          gap: 10px;
          margin-top: 16px;
        }
        .modal-actions {
          justify-content: flex-end;
        }
        .primary-btn, .ghost-btn, .danger-btn, .accent-btn {
          border: none;
          border-radius: 14px;
          padding: 12px 18px;
          font-weight: 700;
          cursor: pointer;
        }
        .primary-btn {
          background: linear-gradient(135deg, #0f172a, #2563eb);
          color: white;
        }
        .ghost-btn {
          background: #e2e8f0;
          color: #0f172a;
        }
        .danger-btn {
          background: #ef4444;
          color: white;
        }
        .accent-btn {
          background: #f59e0b;
          color: white;
        }
        .danger-btn.small {
          padding: 8px 12px;
          border-radius: 10px;
        }
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          z-index: 1000;
        }
        .modal-panel {
          width: min(980px, 100%);
          max-height: 90vh;
          overflow-y: auto;
          background: white;
          border-radius: 28px;
          padding: 24px;
          box-shadow: 0 30px 80px rgba(15, 23, 42, 0.28);
        }
        .modal-head {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: start;
          margin-bottom: 20px;
        }
        .close-btn {
          width: 42px;
          height: 42px;
          border-radius: 999px;
          border: none;
          background: #f1f5f9;
          color: #0f172a;
          font-size: 1.6rem;
          cursor: pointer;
        }
        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }
        .form-grid.nested {
          gap: 14px;
        }
        .span-2 {
          grid-column: span 2;
        }
        .field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .field span {
          font-size: 0.92rem;
          font-weight: 700;
          color: #334155;
        }
        .field input, .field textarea, .field select {
          width: 100%;
          border: 1px solid #dbe3ea;
          border-radius: 14px;
          padding: 13px 14px;
          font: inherit;
          background: #f8fafc;
        }
        .field textarea {
          resize: vertical;
        }
        .checkbox-field {
          flex-direction: row;
          align-items: center;
          gap: 12px;
        }
        .checkbox-field input {
          width: 20px;
          height: 20px;
          margin-top: 0;
        }
        .section-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 22px;
          padding: 18px;
        }
        .section-card.inner-card {
          padding: 16px;
        }
        .section-card-head {
          margin-bottom: 14px;
        }
        .section-card-head h4 {
          margin: 0;
          color: #0f172a;
        }
        .section-card-head.split {
          display: flex;
          justify-content: space-between;
          align-items: start;
          gap: 12px;
        }
        .matrix-group-list {
          display: grid;
          gap: 12px;
        }
        .matrix-group-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          padding: 14px;
        }
        .matrix-group-head {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: center;
          margin-bottom: 12px;
        }
        .matrix-table-wrap {
          overflow-x: auto;
        }
        .matrix-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          overflow: hidden;
        }
        .matrix-table th,
        .matrix-table td {
          padding: 12px;
          border-bottom: 1px solid #e2e8f0;
          text-align: left;
          vertical-align: top;
        }
        .matrix-table th {
          background: #f8fafc;
          color: #334155;
          font-size: 0.9rem;
        }
        .matrix-table td select,
        .matrix-table td input {
          width: 100%;
          border: 1px solid #dbe3ea;
          border-radius: 12px;
          padding: 10px 12px;
          font: inherit;
          background: #fff;
        }
        .upload-box {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 120px;
          border: 1px dashed #94a3b8;
          border-radius: 18px;
          background: white;
          color: #64748b;
          text-align: center;
          cursor: pointer;
          padding: 16px;
          margin-bottom: 16px;
        }
        .upload-box.compact {
          min-height: 84px;
          margin-bottom: 0;
        }
        .upload-box input {
          display: none;
        }
        .preview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
          gap: 12px;
        }
        .preview-card {
          position: relative;
          border-radius: 16px;
          overflow: hidden;
          background: white;
          border: 1px solid #e2e8f0;
          aspect-ratio: 1 / 1;
        }
        .preview-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .preview-remove {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 28px;
          height: 28px;
          border: none;
          border-radius: 999px;
          background: rgba(239, 68, 68, 0.95);
          color: white;
          cursor: pointer;
        }
        .bundle-item-image-preview {
          position: relative;
          width: 120px;
          height: 120px;
          margin-top: 12px;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
          background: white;
        }
        .bundle-item-image-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .empty-note {
          padding: 14px 16px;
          border-radius: 14px;
          background: white;
          color: #64748b;
          border: 1px dashed #cbd5e1;
        }
        .bundle-item-list {
          display: grid;
          gap: 14px;
        }
        .bundle-item-editor {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          padding: 16px;
        }
        .bundle-item-header {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: center;
          margin-bottom: 12px;
        }
        @media (max-width: 768px) {
          .admin-page-shell {
            padding: 18px;
          }
          .admin-toolbar, .section-card-head.split, .bundle-item-header, .modal-actions {
            flex-direction: column;
            align-items: stretch;
          }
          .form-grid {
            grid-template-columns: 1fr;
          }
          .span-2 {
            grid-column: span 1;
          }
        }
      `}</style>
    </div>
  );
}
