export const buildImageUrl = (photoUrl) => {
  if (!photoUrl || typeof photoUrl !== "string") return "";

  const CLOUD_NAME = "dykl2oubi";
  const CLOUDINARY_BASE = `https://res.cloudinary.com/${CLOUD_NAME}/`;

  if (photoUrl.startsWith("blob:")) return photoUrl;

  if (photoUrl.startsWith("http") && !photoUrl.includes("onrender.com")) {
    return photoUrl; 
  }

  if (photoUrl.includes("image/upload/")) {
    const parts = photoUrl.split("image/upload/");
    const pathAfterUpload = parts[parts.length - 1]; 
    return `${CLOUDINARY_BASE}image/upload/${pathAfterUpload}`;
  }

  const cleanId = photoUrl.replace(/^[\.\/]+/, "");
  return `${CLOUDINARY_BASE}image/upload/${cleanId}`;
};


export const getProductPhoto = (cartItem) => {
  if (!cartItem || !cartItem.product) return null;
  const p = cartItem.product;

  const photoArray = 
    (p.accessory_photos?.length ? p.accessory_photos : null) || 
    (p.product_photos?.length ? p.product_photos : null) || 
    (p.photos_url?.length ? p.photos_url : null);

  if (photoArray && photoArray[0]) {
    const first = photoArray[0];

    return first?.photo || first?.url || (typeof first === "string" ? first : null);
  }

  return p.image || p.photo || p.cover || p.img;
};