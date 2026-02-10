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


export const getProductPhoto = (item) => {
  if (item.img) return item.img;
  
  if (item.product?.product_photos?.[0]?.photo) {
    return item.product.product_photos[0].photo;
  }
  
  if (item.product?.photos_url?.[0]) {
    return item.product.photos_url[0];
  }

  return null; 
};