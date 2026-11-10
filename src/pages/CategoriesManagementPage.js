import React, { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import useAuthUser from '../hooks/useAuthUser';
import { isAdminUser } from '../utils/auth';

const CLOUDINARY_CLOUD_NAME = 'dg5fojcpg';
const CLOUDINARY_UPLOAD_PRESET = 'app_uploads';

export default function CategoriesManagementPage() {
  const user = useAuthUser();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    image: '',
  });
  const [uploading, setUploading] = useState(false);

  const isAdmin = isAdminUser(user);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return undefined;
    }

    const unsubscribe = onSnapshot(
      collection(db, 'categories'),
      (snapshot) => {
        setCategories(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
        setLoading(false);
      },
      (error) => {
        console.error('Error listening to categories:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [isAdmin]);

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'categories');
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

  const handleImageUpload = async (file) => {
    setUploading(true);

    try {
      const url = await uploadToCloudinary(file);
      setNewCategory((prev) => ({
        ...prev,
        image: url,
      }));
      alert('Image uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Failed to upload image: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setNewCategory((prev) => ({
      ...prev,
      image: '',
    }));
  };

  const addCategory = async () => {
    if (!newCategory.name) {
      alert('Please fill in the category name');
      return;
    }

    try {
      await addDoc(collection(db, 'categories'), {
        ...newCategory,
        createdAt: new Date(),
      });

      setModalVisible(false);
      resetForm();
      alert('Category added successfully!');
    } catch (error) {
      console.error('Error adding category:', error);
      alert('Failed to add category');
    }
  };

  const updateCategory = async () => {
    if (!editingCategory) return;

    try {
      await updateDoc(doc(db, 'categories', editingCategory.id), newCategory);
      setModalVisible(false);
      setEditingCategory(null);
      resetForm();
      alert('Category updated successfully!');
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Failed to update category');
    }
  };

  const deleteCategory = async (category) => {
    if (!window.confirm(`Are you sure you want to delete "${category.name}"?`)) return;

    try {
      await deleteDoc(doc(db, 'categories', category.id));
      alert('Category deleted successfully!');
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category');
    }
  };

  const editCategory = (category) => {
    setEditingCategory(category);
    setNewCategory({
      name: category.name,
      description: category.description,
      image: category.image || '',
    });
    setModalVisible(true);
  };

  const resetForm = () => {
    setNewCategory({
      name: '',
      description: '',
      image: '',
    });
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
          <h2>Categories Management</h2>
          <p className="subcopy">Organize the storefront with cleaner category cards and a simpler form.</p>
        </div>
        <button
          className="primary-btn"
          onClick={() => {
            resetForm();
            setEditingCategory(null);
            setModalVisible(true);
          }}
        >
          Add New Category
        </button>
      </div>

      <div className="admin-grid">
        {categories.map((category) => (
          <div key={category.id} className="admin-card">
            <div className="admin-card-media">
              {category.image ? (
                <img src={category.image} alt={category.name} />
              ) : (
                <div className="media-placeholder">{category.name?.charAt(0) || 'C'}</div>
              )}
            </div>
            <div className="admin-card-body">
              <h3>{category.name}</h3>
              <p>{category.description || 'No description added yet.'}</p>
              <div className="card-actions">
                <button className="ghost-btn" onClick={() => editCategory(category)}>Edit</button>
                <button className="danger-btn" onClick={() => deleteCategory(category)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalVisible && (
        <div className="modal-backdrop">
          <div className="modal-panel">
            <div className="modal-head">
              <div>
                <p className="eyebrow">Category Setup</p>
                <h3>{editingCategory ? 'Edit Category' : 'Add New Category'}</h3>
              </div>
              <button className="close-btn" onClick={() => setModalVisible(false)}>×</button>
            </div>

            <div className="form-grid single">
              <label className="field">
                <span>Category Name</span>
                <input type="text" value={newCategory.name} onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })} />
              </label>

              <label className="field">
                <span>Description</span>
                <textarea rows={5} value={newCategory.description} onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })} />
              </label>

              <div className="section-card">
                <div className="section-card-head">
                  <h4>Category Image</h4>
                  <p>Upload the image shown on category cards and hero sections.</p>
                </div>

                <label className="upload-box">
                  <input type="file" accept="image/*" onChange={(e) => e.target.files && handleImageUpload(e.target.files[0])} disabled={uploading} />
                  <span>{uploading ? 'Uploading image...' : 'Choose an image or drag it here'}</span>
                </label>

                {newCategory.image ? (
                  <div className="image-preview-large">
                    <img src={newCategory.image} alt="Category preview" />
                    <button type="button" className="danger-btn small floating" onClick={removeImage}>×</button>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="modal-actions">
              <button className="ghost-btn" onClick={() => setModalVisible(false)}>Cancel</button>
              <button className="primary-btn" onClick={editingCategory ? updateCategory : addCategory}>
                {editingCategory ? 'Update Category' : 'Add Category'}
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
          height: 190px;
          background: linear-gradient(135deg, #f59e0b, #ea580c);
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
        .admin-card-body {
          padding: 18px;
        }
        .admin-card-body h3 {
          margin: 0 0 8px;
          color: #0f172a;
        }
        .admin-card-body p {
          color: #64748b;
          margin: 0;
          line-height: 1.55;
        }
        .card-actions, .modal-actions {
          display: flex;
          gap: 10px;
          margin-top: 16px;
        }
        .modal-actions {
          justify-content: flex-end;
        }
        .primary-btn, .ghost-btn, .danger-btn {
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
        .danger-btn.small {
          padding: 8px 12px;
          border-radius: 10px;
        }
        .danger-btn.floating {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 34px;
          height: 34px;
          padding: 0;
          border-radius: 999px;
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
          width: min(680px, 100%);
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
        .form-grid.single {
          display: grid;
          gap: 16px;
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
        .field input, .field textarea {
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
        .section-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 22px;
          padding: 18px;
        }
        .section-card-head {
          margin-bottom: 14px;
        }
        .section-card-head h4 {
          margin: 0;
          color: #0f172a;
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
        .upload-box input {
          display: none;
        }
        .image-preview-large {
          position: relative;
          overflow: hidden;
          border-radius: 18px;
          border: 1px solid #e2e8f0;
          background: white;
        }
        .image-preview-large img {
          width: 100%;
          max-height: 260px;
          object-fit: cover;
          display: block;
        }
        @media (max-width: 768px) {
          .admin-page-shell {
            padding: 18px;
          }
          .admin-toolbar, .modal-actions {
            flex-direction: column;
            align-items: stretch;
          }
        }
      `}</style>
    </div>
  );
}
