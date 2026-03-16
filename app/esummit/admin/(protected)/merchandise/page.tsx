'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { FiImage, FiPlus, FiTrash2, FiEdit2, FiSave, FiX, FiCheck, FiLink, FiShoppingBag } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface MerchandiseProduct {
    id: string;
    name: string;
    price: string;
    image_url: string | null;
    category: string | null;
    details_url: string | null;
    display_order: number;
}

export default function MerchandiseAdminPage() {
    const [products, setProducts] = useState<MerchandiseProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    // Settings State
    const [buyNowUrl, setBuyNowUrl] = useState('');
    const [isSavingSettings, setIsSavingSettings] = useState(false);

    // Form State
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState('');
    const [newPrice, setNewPrice] = useState('');
    const [newCategory, setNewCategory] = useState('');
    const [newDetailsUrl, setNewDetailsUrl] = useState('');
    const [newImage, setNewImage] = useState<File | null>(null);

    // Editing State
    const [editingProduct, setEditingProduct] = useState<MerchandiseProduct | null>(null);
    const [editImage, setEditImage] = useState<File | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        await Promise.all([fetchProducts(), fetchSettings()]);
        setLoading(false);
    };

    const fetchSettings = async () => {
        const { data, error } = await supabase
            .from('esummit_settings' as any)
            .select('merchandise_buy_now_url')
            .single();

        if (error) {
            console.error('Error fetching settings:', error);
            toast.error(`Failed to load settings: ${error.message || 'Unknown error'}`);
        } else if (data) {
            setBuyNowUrl((data as any).merchandise_buy_now_url || '');
        }
    };

    const handleSaveSettings = async () => {
        setIsSavingSettings(true);
        const { error } = await supabase
            .from('esummit_settings' as any)
            .update({
                merchandise_buy_now_url: buyNowUrl,
                updated_at: new Date().toISOString()
            })
            .eq('id', 1);

        if (error) {
            console.error('Error updating settings:', error);
            toast.error('Failed to update "Buy Now" link');
        } else {
            toast.success('Redirect link updated');
        }
        setIsSavingSettings(false);
    };

    const fetchProducts = async () => {
        const { data, error } = await supabase
            .from('esummit_merchandise' as any)
            .select('*')
            .order('display_order', { ascending: true });

        if (error) {
            console.error('Error fetching merchandise:', error);
            toast.error(`Failed to load products: ${error.message || 'Unknown error'}`);
            toast.error('Failed to load products');
        } else {
            setProducts((data as any as MerchandiseProduct[]) || []);
        }
    };

    const uploadImage = async (file: File) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `merch/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('esummit_uploads')
            .upload(filePath, file);

        if (uploadError) {
            throw uploadError;
        }

        const { data } = supabase.storage
            .from('esummit_uploads')
            .getPublicUrl(filePath);

        return data.publicUrl;
    };

    const handleAddProduct = async () => {
        if (!newName || !newPrice) {
            toast.error('Name and Price are required');
            return;
        }
        try {
            let imageUrl = null;
            if (newImage) {
                imageUrl = await uploadImage(newImage);
            }

            const { data, error } = await supabase
                .from('esummit_merchandise' as any)
                .insert({
                    name: newName,
                    price: newPrice,
                    category: newCategory,
                    details_url: newDetailsUrl,
                    image_url: imageUrl,
                    display_order: products.length
                })
                .select()
                .single();

            if (error) throw error;

            setProducts([...products, data as any as MerchandiseProduct]);
            setNewName('');
            setNewPrice('');
            setNewCategory('');
            setNewDetailsUrl('');
            setNewImage(null);
            setIsAdding(false);
            toast.success('Product added successfully');
        } catch (error) {
            console.error(error);
            toast.error('Failed to add product');
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        try {
            const { error } = await supabase.from('esummit_merchandise' as any).delete().eq('id', id);
            if (error) throw error;
            setProducts(products.filter(p => p.id !== id));
            toast.success('Product removed');
        } catch (error) {
            toast.error('Failed to delete product');
        }
    };

    const handleUpdateProduct = async () => {
        if (!editingProduct) return;

        try {
            let imageUrl = editingProduct.image_url;
            if (editImage) {
                imageUrl = await uploadImage(editImage);
            }

            const { error } = await supabase
                .from('esummit_merchandise' as any)
                .update({
                    name: editingProduct.name,
                    price: editingProduct.price,
                    category: editingProduct.category,
                    details_url: editingProduct.details_url,
                    image_url: imageUrl,
                    updated_at: new Date().toISOString()
                })
                .eq('id', editingProduct.id);

            if (error) throw error;

            setProducts(products.map(p => p.id === editingProduct.id ? { ...editingProduct, image_url: imageUrl } : p));
            setEditingProduct(null);
            setEditImage(null);
            toast.success('Product updated');
        } catch (error) {
            console.error(error);
            toast.error('Failed to update product');
        }
    };

    if (loading) return <div className="text-center py-10 text-gray-400">Loading catalog...</div>;

    return (
        <div className="space-y-12 pb-20 max-w-5xl mx-auto">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-heading text-purple-400">Merchandise Management</h1>
                <p className="text-gray-400">Manage the product catalog and "Buy Now" links.</p>
            </div>

            {/* Global Settings Section */}
            <section className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <FiLink className="text-esummit-primary" /> Store Settings
                    </h2>
                    <button
                        onClick={handleSaveSettings}
                        disabled={isSavingSettings}
                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                        {isSavingSettings ? 'Saving...' : <><FiSave /> Save Link</>}
                    </button>
                </div>
                <div>
                    <label className="block text-xs uppercase text-gray-400 mb-1">Buy Now Redirect URL</label>
                    <input
                        value={buyNowUrl}
                        onChange={(e) => setBuyNowUrl(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:border-purple-500 outline-none"
                        placeholder="https://google.com/forms/... or your payment link"
                    />
                    <p className="text-[10px] text-gray-500 mt-2">This is where the "BUY NOW" buttons on the landing page will redirect users.</p>
                </div>
            </section>

            {/* Product List Section */}
            <section className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        Product Catalog
                    </h2>
                    <button
                        onClick={() => setIsAdding(!isAdding)}
                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                        {isAdding ? 'Cancel' : <><FiPlus /> Add Product</>}
                    </button>
                </div>

                {isAdding && (
                    <div className="mb-8 bg-gray-800 p-6 rounded-xl border border-gray-700 animate-fade-in-down">
                        <h3 className="font-bold text-white mb-4">New Product</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs uppercase text-gray-400 mb-1">Product Name</label>
                                <input
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white outline-none"
                                    placeholder="Impact Hoodie"
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase text-gray-400 mb-1">Price (e.g. 999)</label>
                                <input
                                    value={newPrice}
                                    onChange={e => setNewPrice(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white outline-none"
                                    placeholder="499"
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase text-gray-400 mb-1">Category</label>
                                <input
                                    value={newCategory}
                                    onChange={e => setNewCategory(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white outline-none"
                                    placeholder="T-Shirts"
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase text-gray-400 mb-1">Details Link (Optional)</label>
                                <input
                                    value={newDetailsUrl}
                                    onChange={e => setNewDetailsUrl(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white outline-none focus:border-purple-500"
                                    placeholder="https://..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase text-gray-400 mb-1">Product Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setNewImage(e.target.files?.[0] || null)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-gray-700 file:text-white"
                                />
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={handleAddProduct}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded font-bold"
                            >
                                Save Product
                            </button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4">
                    {products.length === 0 && !isAdding && (
                        <div className="text-center py-8 text-gray-500">
                            Empty catalog. Click 'Add Product' to start building your collection.
                        </div>
                    )}

                    {products.map((product) => {
                        const isEditing = editingProduct?.id === product.id;

                        if (isEditing) {
                            return (
                                <div key={product.id} className="bg-gray-800 p-6 rounded-xl border border-purple-500/50 flex flex-col gap-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs uppercase text-gray-400 mb-1">Name</label>
                                            <input
                                                value={editingProduct!.name}
                                                onChange={e => setEditingProduct({ ...editingProduct!, name: e.target.value })}
                                                className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs uppercase text-gray-400 mb-1">Price</label>
                                            <input
                                                value={editingProduct!.price}
                                                onChange={e => setEditingProduct({ ...editingProduct!, price: e.target.value })}
                                                className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs uppercase text-gray-400 mb-1">Category</label>
                                            <input
                                                value={editingProduct!.category || ''}
                                                onChange={e => setEditingProduct({ ...editingProduct!, category: e.target.value })}
                                                className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs uppercase text-gray-400 mb-1">Details Link</label>
                                            <input
                                                value={editingProduct!.details_url || ''}
                                                onChange={e => setEditingProduct({ ...editingProduct!, details_url: e.target.value })}
                                                className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs uppercase text-gray-400 mb-1">New Image (Optional)</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => setEditImage(e.target.files?.[0] || null)}
                                                className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-gray-700 file:text-white"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-3 mt-2">
                                        <button onClick={() => { setEditingProduct(null); setEditImage(null); }} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
                                        <button onClick={handleUpdateProduct} className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">Save Changes</button>
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <div key={product.id} className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex items-center gap-6 relative group">
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => setEditingProduct(product)} className="p-2 bg-gray-700 rounded text-gray-300 hover:text-purple-400"><FiEdit2 size={14} /></button>
                                    <button onClick={() => handleDeleteProduct(product.id)} className="p-2 bg-gray-700 rounded text-gray-300 hover:text-red-500"><FiTrash2 size={14} /></button>
                                </div>

                                <div className="shrink-0 w-24 h-24 bg-gray-900 rounded-lg border border-gray-700 flex items-center justify-center p-2 overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
                                    {product.image_url ? (
                                        <img src={product.image_url} alt={product.name} className="w-full h-full object-contain" />
                                    ) : (
                                        <FiShoppingBag className="text-gray-600 w-8 h-8" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-lg font-bold text-white">{product.name}</h3>
                                        <span className="text-xs px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded-full border border-purple-500/20">{product.category}</span>
                                    </div>
                                    <div className="text-purple-400 font-bold">₹{product.price}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}
