export interface CropPosition {
    x: number;
    y: number;
}

// Position is the normalized center of the square in the original image.
export function getAvatarCrop(width: number, height: number, zoom: number, position: CropPosition) {
    const size = Math.min(width, height) / Math.max(1, zoom);
    const x = Math.max(0, Math.min(width - size, position.x * width - size / 2));
    const y = Math.max(0, Math.min(height - size, position.y * height - size / 2));
    return { x, y, size, center: { x: (x + size / 2) / width, y: (y + size / 2) / height } };
}

export function exportAvatar(image: HTMLImageElement, zoom: number, position: CropPosition): Promise<Blob> {
    const crop = getAvatarCrop(image.naturalWidth, image.naturalHeight, zoom, position);
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 512;
    const context = canvas.getContext("2d");
    if (!context) return Promise.reject(new Error("Canvas unavailable"));
    context.drawImage(image, crop.x, crop.y, crop.size, crop.size, 0, 0, 512, 512);
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Image export failed"))), "image/png");
    });
}
