import React, { useState, useCallback, useRef, useEffect } from 'react';
import Cropper from 'react-easy-crop';

// A utility function to crop image
const createImage = (url) =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.setAttribute('crossOrigin', 'anonymous'); // needed to avoid cross-origin issues
        image.src = url;
    });

const getCroppedImg = async (imageSrc, pixelCrop, flip = { horizontal: false, vertical: false }) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        return null;
    }

    // Set canvas size to match the original image
    canvas.width = image.width;
    canvas.height = image.height;

    ctx.translate(image.width / 2, image.height / 2);
    ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
    ctx.translate(-image.width / 2, -image.height / 2);

    ctx.drawImage(image, 0, 0);

    const croppedCanvas = document.createElement('canvas');
    const croppedCtx = croppedCanvas.getContext('2d');

    if (!croppedCtx) {
        return null;
    }

    // Target max 800x800
    let targetWidth = pixelCrop.width;
    let targetHeight = pixelCrop.height;
    if (targetWidth > 800 || targetHeight > 800) {
        if (targetWidth > targetHeight) {
            targetHeight = (targetHeight / targetWidth) * 800;
            targetWidth = 800;
        } else {
            targetWidth = (targetWidth / targetHeight) * 800;
            targetHeight = 800;
        }
    }

    croppedCanvas.width = targetWidth;
    croppedCanvas.height = targetHeight;

    croppedCtx.drawImage(
        canvas,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        targetWidth,
        targetHeight
    );

    return new Promise((resolve, reject) => {
        croppedCanvas.toBlob((file) => {
            if (file) {
                file.name = 'cropped.jpeg';
                resolve(file);
            } else {
                reject(new Error('Canvas is empty'));
            }
        }, 'image/jpeg', 0.8);
    });
};

export default function ImageUploadField({ label, value, onChange, currentImageUrl, error }) {
    const [imageSrc, setImageSrc] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(currentImageUrl || null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const fileInputRef = useRef(null);

    // Update preview when currentImageUrl changes (like opening a new modal in parent)
    useEffect(() => {
        if (!value && currentImageUrl) {
            setPreviewUrl(currentImageUrl);
        } else if (!value && !currentImageUrl) {
            setPreviewUrl(null);
        }
    }, [currentImageUrl, value]);

    const onFileChange = async (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            let imageDataUrl = await readFile(file);
            setImageSrc(imageDataUrl);
            setZoom(1);
            setIsModalOpen(true);
        }
    };

    const readFile = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.addEventListener('load', () => resolve(reader.result), false);
            reader.readAsDataURL(file);
        });
    };

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const showCroppedImage = useCallback(async () => {
        try {
            const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
            
            const croppedFile = new File([croppedImageBlob], "image.jpg", { type: "image/jpeg" });
            onChange(croppedFile);
            
            const url = URL.createObjectURL(croppedImageBlob);
            setPreviewUrl(url);
            setIsModalOpen(false);
            
            // clear the input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (e) {
            console.error(e);
        }
    }, [imageSrc, croppedAreaPixels, onChange]);

    return (
        <div className="w-full">
            {label && <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>}
            
            <div className="flex items-center gap-4">
                <div 
                    className="w-24 h-24 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-slate-300 relative cursor-pointer hover:bg-slate-50 transition shrink-0"
                    onClick={() => fileInputRef.current?.click()}
                >
                    {previewUrl ? (
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                    )}
                </div>
                <div>
                    <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition shadow-sm"
                    >
                        {previewUrl ? 'Ganti Foto' : 'Pilih Foto'}
                    </button>
                    <p className="text-xs text-slate-500 mt-2">Maksimal 2MB. Format: JPG, PNG.</p>
                </div>
            </div>

            <input 
                type="file" 
                ref={fileInputRef}
                onChange={onFileChange} 
                className="hidden" 
                accept="image/*"
            />
            
            {error && <p className="mt-2 text-sm text-rose-500 font-medium">{error}</p>}

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-slate-900">Sesuaikan Foto</h3>
                            <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>
                        
                        <div className="relative w-full h-[400px] bg-slate-900">
                            <Cropper
                                image={imageSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                            />
                        </div>
                        
                        <div className="p-4 flex items-center gap-4 bg-slate-50 border-t border-slate-100">
                            <label className="text-sm font-semibold text-slate-600">Zoom</label>
                            <input
                                type="range"
                                value={zoom}
                                min={1}
                                max={3}
                                step={0.1}
                                aria-labelledby="Zoom"
                                onChange={(e) => setZoom(e.target.value)}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                        
                        <div className="p-4 border-t border-slate-100 flex justify-end gap-3">
                            <button 
                                type="button" 
                                onClick={() => setIsModalOpen(false)}
                                className="px-5 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                            >
                                Batal
                            </button>
                            <button 
                                type="button" 
                                onClick={showCroppedImage}
                                className="px-5 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition shadow-sm"
                            >
                                Pakai Foto
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
